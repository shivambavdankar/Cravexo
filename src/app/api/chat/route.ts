import { NextRequest, NextResponse, after } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { searchRestaurants, RestaurantCandidate } from '@/lib/places/googlePlaces';
import { upsertRestaurantLinks } from '@/lib/restaurantLinks/upsertRestaurant';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanJson(text: string) {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[MrFry] JSON Parse Error:', text);
    throw e;
  }
}

interface DiscoveryProfile {
  location:    string;
  craving:     string;
  vibe:        string;
  spice:       number;
  budget:      number;
  email?:      string;
  refinements: string[];
}

interface SearchIntent {
  searchQuery: string; // e.g. "Thai restaurant in Brooklyn NY"
  cuisine:     string; // e.g. "thai"
  cacheKey:    string; // normalized cache key
}

// ─── Supabase Client (admin) ──────────────────────────────────────────────────

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─── Delivery Links Lookup (unchanged) ───────────────────────────────────────

async function findDeliveryLinks(chain: string, city: string, area?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const cValue        = chain.trim();
  const cityValue     = city.trim();
  const aValueLower   = (area?.trim() || '').toLowerCase();
  const columns       = 'zomato_url, swiggy_url, ubereats_url, doordash_url, grubhub_url, restaurant_url';

  console.log(`[MrFry] Delivery link lookup: "${cValue}" | "${cityValue}" | "${aValueLower || 'Any'}"`);

  const { data: cityLinks, error } = await supabase
    .from('restaurant_links')
    .select('restaurant_name, area, ' + columns)
    .eq('city', cityValue);

  if (error || !cityLinks?.length) return null;

  const recommendationLower = cValue.toLowerCase();
  const delimiters = /[\-\,\.\|\(\)]/;

  const matches = cityLinks.filter((row: any) => {
    const rowArea = (row.area || '').trim().toLowerCase();
    if (rowArea !== aValueLower) return false;
    const dbNameLower = row.restaurant_name.toLowerCase();
    if (recommendationLower === dbNameLower) return true;
    if (delimiters.test(cValue)) {
      const coreName = cValue.split(delimiters)[0].trim().toLowerCase();
      if (coreName === dbNameLower) return true;
    }
    if (recommendationLower.startsWith(dbNameLower)) {
      const nextChar = recommendationLower[dbNameLower.length];
      return !nextChar || /[\s\-\,\.\|\(\)]/.test(nextChar);
    }
    return false;
  });

  if (matches.length > 0) {
    const best = matches.sort((a: any, b: any) => b.restaurant_name.length - a.restaurant_name.length)[0];
    console.log(`[MrFry] ✅ Delivery link found: ${(best as any).restaurant_name}`);
    return best;
  }
  return null;
}

// ─── Stage 1: Gemini Intent Interpretation ───────────────────────────────────
// Converts the freeform user profile into a structured Google Places search query.

async function interpretIntent(profile: DiscoveryProfile, model: any): Promise<SearchIntent> {
  const intentPrompt = `You are a food search intent parser. Given this user profile, return ONLY valid JSON with these exact fields:
{
  "searchQuery": "A natural-language query optimised for Google Places Text Search, including cuisine type and the user's location (city/area). E.g. 'Thai restaurant in Brooklyn NY'",
  "cuisine": "Single lowercase word for the cuisine category. E.g. 'thai', 'indian', 'burgers', 'italian'",
  "cacheKey": "Lowercase normalized string: location words joined by underscores, then underscore, then cuisine, then underscore, then budget number. Remove special characters. E.g. 'brooklyn_ny_thai_2'"
}

User Profile:
Location: ${profile.location}
Craving: ${profile.craving || 'any food'}
Vibe: ${profile.vibe}
Budget (1=$, 2=$$, 3=$$$): ${profile.budget}
Refinements: ${profile.refinements.join(', ') || 'none'}

Return ONLY the JSON object, no explanation.`;

  try {
    const result = await model.generateContent(intentPrompt);
    const raw = result.response.text();
    const intent = cleanJson(raw) as SearchIntent;
    console.log('[MrFry] Interpreted intent:', intent);
    return intent;
  } catch (err) {
    console.warn('[MrFry] Intent interpretation failed, using fallback intent:', err);
    // Fallback intent built from raw profile
    const cuisine = (profile.craving || 'restaurant').split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    const locationNorm = profile.location.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    return {
      searchQuery: `${profile.craving || 'restaurant'} near ${profile.location}`,
      cuisine,
      cacheKey: `${locationNorm}_${cuisine}_${profile.budget}`,
    };
  }
}

// ─── Stage 2 & 3: Cache-First Candidate Retrieval ─────────────────────────────

const CACHE_TTL_HOURS = 72;

async function fetchCandidates(intent: SearchIntent): Promise<RestaurantCandidate[]> {
  const supabase = getSupabase();

  // 1. Check cache
  const { data: cached } = await supabase
    .from('place_candidates')
    .select('candidates, expires_at')
    .eq('cache_key', intent.cacheKey)
    .single();

  if (cached && new Date(cached.expires_at) > new Date()) {
    console.log(`[MrFry] ✅ Cache HIT for key: ${intent.cacheKey}`);
    return cached.candidates as RestaurantCandidate[];
  }

  console.log(`[MrFry] Cache MISS for key: ${intent.cacheKey} — calling Google Places...`);

  // 2. Call Google Places
  const candidates = await searchRestaurants(intent.searchQuery, 20, 15000);

  if (candidates.length === 0) {
    console.warn('[MrFry] Google Places returned 0 candidates.');
    return [];
  }

  // 3. Save to cache
  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();
  const { error: upsertError } = await supabase
    .from('place_candidates')
    .upsert({
      cache_key: intent.cacheKey,
      candidates,
      cuisine_tag: intent.cuisine,
      location_label: intent.searchQuery,
      fetched_at: new Date().toISOString(),
      expires_at: expiresAt,
    }, { onConflict: 'cache_key' });

  if (upsertError) {
    console.error('[MrFry] Cache upsert error:', upsertError.message);
  } else {
    console.log(`[MrFry] Cached ${candidates.length} candidates (TTL: ${CACHE_TTL_HOURS}h)`);
  }

  return candidates;
}

// ─── Stage 4a: Gemini Hybrid Ranking ─────────────────────────────────────────
// Gemini selects Primary, Backup, Wildcard ONLY from the retrieved candidates.

async function rankWithGemini(
  candidates: RestaurantCandidate[],
  profile: DiscoveryProfile,
  model: any,
  dietaryRule: string,
): Promise<any> {
  // Build a numbered candidate list for Gemini to pick from
  const candidateList = candidates
    .map((c, i) => {
      const stars   = c.rating ? `${c.rating}⭐` : 'No rating';
      const reviews = c.rating_count ? ` (${c.rating_count.toLocaleString()} reviews)` : '';
      const price   = c.price_level ? '$'.repeat(c.price_level) : 'Unknown price';
      const loc     = [c.area, c.city].filter(Boolean).join(', ');
      return `[${i + 1}] place_id="${c.place_id}" | ${c.name} | ${stars}${reviews} | ${price} | ${loc}`;
    })
    .join('\n');

  const rankingPrompt = `You are Mr. Fry, the friendly AI food guide inside Cravexo.

CRITICAL RULE: You MUST select your Primary, Backup, and Wildcard recommendations ONLY from the verified restaurant list below. You are FORBIDDEN from recommending any restaurant not in this list. Do not invent restaurants.

Verified Live Restaurants (from Google Places):
${candidateList}

User's taste profile:
- Location: ${profile.location}
- Craving: ${profile.craving || 'Surprise me'}
- Vibe: ${profile.vibe}
- Spice (1–10): ${profile.spice}
- Budget (1=$, 2=$$, 3=$$$): ${profile.budget}
- Refinements: ${profile.refinements.join(', ') || 'none'}
${dietaryRule}

Instructions:
1. Pick the 3 best matching restaurants from the list above (Primary, Backup, Wildcard).
2. For each pick, suggest a specific dish they are likely known for.
3. Write in Mr. Fry's warm, hype, food-obsessed voice.
4. ONLY use the place_id values from the list above.
5. Local Currency: Use the correct regional currency symbol in price_estimate.

Return ONLY valid JSON:
{
  "message": "Short hype opening from Mr. Fry, NOT robotic",
  "picks": {
    "primary": { "place_id": "...", "dish_name": "Specific dish", "description": "Mouth-watering 1-2 sentences", "price_estimate": "₹350 or $14" },
    "backup":  { "place_id": "...", "dish_name": "Specific dish", "description": "Why it's a great alternative", "price_estimate": "₹200 or $10" },
    "mystery": { "place_id": "...", "dish_name": "Wildcard dish", "description": "Unexpected but exciting reason to try", "price_estimate": "₹400 or $16" }
  },
  "explanation": "Short sentence connecting picks to vibe/budget/spice",
  "combo": "Fun drink or side pairing suggestion"
}`;

  const result      = await model.generateContent(rankingPrompt);
  const raw         = result.response.text();
  const rankingResp = cleanJson(raw);
  console.log('[MrFry] Gemini ranked picks:', JSON.stringify(rankingResp.picks));
  return rankingResp;
}

// ─── Stage 4b: Full Gemini Fallback (no Places data) ─────────────────────────

const GEMINI_FALLBACK_PROMPT = `You are Mr. Fry, the friendly, creative, and modern AI food guide inside Cravexo.
Cravexo is a modern AI-powered food discovery platform.

You are warm, playful, polished, concise, food-obsessed, and never robotic. You act as a smart food companion—like a stylish, food-obsessed friend who "gets it."

### The User Profile contains:
- Location (Crucial. Find real places near here)
- Craving (Can be a dish, a broad type of cuisine, or a specific preference)
- Vibe (e.g., comfort, healthy, party, late)
- Spice Level (0 = none, 10 = burn my face)
- Target Budget (1 = $, 2 = $$, 3 = $$$)
- Refinements (An array of tweaks the user requested AFTER seeing an initial result)

### Recommendation Rules:
1. Grounded & Real: Pick actual, real-world restaurants they can visit or order from in their location.
2. Refinements First: If Refinements are present, heavily prioritize their adjustments.
3. Personality: Write a short, hype message. Do NOT use "Based on your preferences I recommend".
4. Explain Why: Connect explanation directly back to their vibe, budget, and spice level.
5. Local Currency: Use correct regional currency symbol (₹ for India, $ for US, £ for UK, etc.)

### Output Format
Return ONLY valid JSON:
{
  "message": "A short, highly contextual conversational response from Mr. Fry",
  "recommendation": {
    "primary": { "name": "Dish Name", "description": "Mouth-watering desc", "price": "₹300 or $12", "chain": "Restaurant Name", "city": "City", "area": "Neighborhood" },
    "backup":  { "name": "Alternative Dish", "description": "Why backup fits", "price": "₹150 or $8", "chain": "Alt Restaurant", "city": "City", "area": "Neighborhood" },
    "explanation": "Brief why this fits their vibe and constraints",
    "combo": "A fun drink/side pairing suggestion",
    "mystery": { "name": "Wildcard Dish", "description": "Unexpected suggestion", "price": "₹350 or $15", "chain": "Wildcard Restaurant", "city": "City", "area": "Neighborhood" }
  }
}`;

// ─── Response Assembly ────────────────────────────────────────────────────────
// Merges a Gemini-ranked pick with live Google Places candidate data.

function assembleRecommendation(
  pick: { place_id: string; dish_name: string; description: string; price_estimate: string },
  candidateMap: Map<string, RestaurantCandidate>,
) {
  const candidate = candidateMap.get(pick.place_id);
  if (!candidate) {
    console.warn(`[MrFry] No candidate found for place_id: ${pick.place_id}`);
    return null;
  }
  return {
    name:         pick.dish_name,
    description:  pick.description,
    price:        pick.price_estimate,
    chain:        candidate.name,
    address:      candidate.address,   // Now explicitly passed to frontend!
    city:         candidate.city,
    area:         candidate.area,
    rating:       candidate.rating,
    rating_count: candidate.rating_count,
    place_id:     candidate.place_id,
  };
}

// ─── Main Route ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json() as { profile: DiscoveryProfile };

    if (!process.env.GEMINI_API_KEY) {
      console.warn('[MrFry] No GEMINI_API_KEY — cannot proceed.');
      return NextResponse.json({ message: 'Mr. Fry is offline without an API key! 🍔' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
    });

    // Dietary override rule
    let dietaryRule = '';
    const allText = [profile.craving, ...profile.refinements].join(' ').toLowerCase();
    if (allText.includes('veg') || allText.includes('plant') || allText.includes('herbivore')) {
      dietaryRule = `\nCRITICAL DIETARY RESTRICTION: EVERY recommendation MUST be 100% strictly vegetarian. No meat, chicken, beef, pork, or seafood.`;
    }

    // ── HYBRID MODE ─────────────────────────────────────────────────────────
    try {
      // Stage 1: Interpret intent
      const intent    = await interpretIntent(profile, model);

      // Stage 2 & 3: Cache-first → Google Places
      const candidates = await fetchCandidates(intent);

      if (candidates.length >= 3) {
        // Stage 4a: Gemini ranking over live candidates
        const rankingResp = await rankWithGemini(candidates, profile, model, dietaryRule);
        const candidateMap = new Map(candidates.map(c => [c.place_id, c]));

        const primary = assembleRecommendation(rankingResp.picks.primary, candidateMap);
        const backup  = assembleRecommendation(rankingResp.picks.backup, candidateMap);
        const mystery = assembleRecommendation(rankingResp.picks.mystery, candidateMap);

        if (primary && backup && mystery) {
          // Still run delivery link augmentation on top
          const [pLinks, bLinks, mLinks] = await Promise.allSettled([
            primary.chain && primary.city ? findDeliveryLinks(primary.chain, primary.city, primary.area) : Promise.resolve(null),
            backup.chain  && backup.city  ? findDeliveryLinks(backup.chain,  backup.city,  backup.area)  : Promise.resolve(null),
            mystery.chain && mystery.city ? findDeliveryLinks(mystery.chain, mystery.city, mystery.area) : Promise.resolve(null),
          ]);

          if (pLinks.status === 'fulfilled' && pLinks.value) Object.assign(primary, pLinks.value);
          if (bLinks.status === 'fulfilled' && bLinks.value) Object.assign(backup,  bLinks.value);
          if (mLinks.status === 'fulfilled' && mLinks.value) Object.assign(mystery, mLinks.value);

          console.log('[MrFry] ✅ Returning hybrid recommendation (Google Places + Gemini)');

          // Schedule upsert to run AFTER the response is sent.
          // `after()` keeps the Vercel function alive until the callback completes.
          after(() =>
            upsertRestaurantLinks(
              [primary, backup, mystery].map(r => ({
                chain:       r!.chain,
                city:        r!.city,
                area:        r!.area,
                address:     (r as any).address,
                place_id:    (r as any).place_id,
                rating:      (r as any).rating,
                price_level: (r as any).price_level,
              })),
              'hybrid',
            ).catch(err => console.error('[MrFry] upsertRestaurantLinks (hybrid) error:', err))
          );

          return NextResponse.json({
            source: 'hybrid',
            message: rankingResp.message,
            recommendation: {
              primary,
              backup,
              mystery,
              explanation: rankingResp.explanation,
              combo:       rankingResp.combo,
            },
          });
        }
      }

      // If we reach here, Places returned < 3 candidates — fall through to Gemini
      console.warn(`[MrFry] Only ${candidates.length} candidates retrieved — falling back to Gemini memory mode.`);
    } catch (hybridErr) {
      console.error('[MrFry] Hybrid stage failed, falling back to Gemini:', hybridErr);
    }

    // ── GEMINI FALLBACK (pure memory mode) ──────────────────────────────────
    console.log('[MrFry] Running pure Gemini fallback...');
    const promptData = `
User Discovery Profile:
Location: ${profile.location}
Craving: ${profile.craving || 'Surprise me'}
Vibe: ${profile.vibe}
Spice Tolerance (1-10): ${profile.spice}
Budget (1=$, 2=$$, 3=$$$): ${profile.budget}
Refinements: ${profile.refinements.length ? profile.refinements.join(', ') : 'None'}
${dietaryRule}`;

    const fallbackResult  = await model.generateContent(`${GEMINI_FALLBACK_PROMPT}\n\n${promptData}`);
    const fallbackRaw     = fallbackResult.response.text();
    const fallbackResp    = cleanJson(fallbackRaw);
    fallbackResp.source   = 'gemini_fallback';

    // Augment with delivery links
    if (fallbackResp.recommendation) {
      const { primary: p, backup: b, mystery: m } = fallbackResp.recommendation;
      const [pL, bL, mL] = await Promise.allSettled([
        p?.chain && p?.city ? findDeliveryLinks(p.chain, p.city, p.area) : Promise.resolve(null),
        b?.chain && b?.city ? findDeliveryLinks(b.chain, b.city, b.area) : Promise.resolve(null),
        m && typeof m === 'object' && m.chain && m.city ? findDeliveryLinks(m.chain, m.city, m.area) : Promise.resolve(null),
      ]);
      if (pL.status === 'fulfilled' && pL.value) Object.assign(p, pL.value);
      if (bL.status === 'fulfilled' && bL.value) Object.assign(b, bL.value);
      if (mL.status === 'fulfilled' && mL.value) Object.assign(m, mL.value);
    }

    console.log('[MrFry] Returning Gemini fallback recommendation.');

    // Schedule upsert to run AFTER the response is sent.
    if (fallbackResp.recommendation) {
      const { primary: fp, backup: fb, mystery: fm } = fallbackResp.recommendation;
      const fallbackRecs = [fp, fb, typeof fm === 'object' ? fm : null]
        .filter(Boolean)
        .map((r: any) => ({ chain: r.chain, city: r.city, area: r.area }));
      after(() =>
        upsertRestaurantLinks(fallbackRecs, 'gemini_fallback')
          .catch(err => console.error('[MrFry] upsertRestaurantLinks (fallback) error:', err))
      );
    }

    return NextResponse.json(fallbackResp);

  } catch (err) {
    console.error('[MrFry] Fatal route error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
