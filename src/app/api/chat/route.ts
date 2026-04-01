import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// ─── Helper: Clean JSON response ────────────────────────────────────────────────
function cleanJson(text: string) {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON Parse Error:', text);
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

// ─── Supabase Helper ────────────────────────────────────────────────────────────
async function findDeliveryLinks(chain: string, city: string, area?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('[MrFry Backend] Missing Supabase URL or Service Role Key for delivery links lookup.');
    return null;
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const cValue = chain.trim();
  const cityValue = city.trim();
  const aValue = area?.trim() || '';
  const aValueLower = aValue.toLowerCase();

  console.log(`[MrFry Backend] Querying Delivery Links Database: "${cValue}" | "${cityValue}" | "${aValue || 'Any'}"`);

  const columns = 'zomato_url, swiggy_url, ubereats_url, doordash_url, grubhub_url, restaurant_url';

  // Strategy: Fetch candidates for the City and perform strict multi-tier filtering in memory.
  // This allows us to enforce exact location matching while maintaining the tiered name matching logic.
  const { data: cityLinks, error: cityErr } = await supabase.from('restaurant_links')
    .select('restaurant_name, area, ' + columns)
    .eq('city', cityValue);
  
  if (cityErr) {
    console.error('[MrFry Backend] Link Lookup Error:', cityErr.message);
    return null;
  }
  if (!cityLinks || cityLinks.length === 0) return null;

  const recommendationLower = cValue.toLowerCase();
  const delimiters = /[\-\,\.\|\(\)]/;

  const matches = cityLinks.filter((row: any) => {
    // 1. Strict Location Guard: Area must match exactly (normalized for null/empty)
    const rowArea = (row.area || '').trim().toLowerCase();
    if (rowArea !== aValueLower) return false;

    const dbNameLower = row.restaurant_name.toLowerCase();

    // 2. Name Matching Logic (Tiered)
    
    // Tier A: Exact Match
    if (recommendationLower === dbNameLower) return true;

    // Tier B: Delimiter-based Prefix match (e.g. "Jaffer Bhai - Since 1989" vs "Jaffer Bhai")
    if (delimiters.test(cValue)) {
      const coreName = cValue.split(delimiters)[0].trim().toLowerCase();
      if (coreName === dbNameLower) return true;
    }

    // Tier C: Guarded Prefix Scan (e.g. "Cafe Noorani Deluxe" vs "Cafe Noorani")
    if (recommendationLower.startsWith(dbNameLower)) {
      const nextChar = recommendationLower[dbNameLower.length];
      return !nextChar || /[\s\-\,\.\|\(\)]/.test(nextChar);
    }

    return false;
  });

  if (matches.length > 0) {
    // If multiple candidates match (highly rare), pick the most specific (longest db name)
    const best = matches.sort((a: any, b: any) => b.restaurant_name.length - a.restaurant_name.length)[0];
    console.log(`[MrFry Backend] ✅ FOUND match: ${(best as any).restaurant_name} in ${(best as any).area || 'City-wide'}`);
    return best;
  }

  return null;
}

// ─── System Prompt for the New Interactive Flow ────────────────────────────────
const SYSTEM_PROMPT = `You are Mr. Fry, the friendly, creative, and modern AI food guide inside Cravexo.
Cravexo is a modern AI-powered food discovery platform. Your job is to understand the user’s mood, cravings, location, spice preference, budget, and food style before recommending something. 

You are warm, playful, polished, concise, food-obsessed, and never robotic. You act as a smart food companion—like a stylish, food-obsessed friend who "gets it."

### The User Profile contains:
- Location (Crucial. Find real places near here)
- Craving (Can be a dish, a broad type of cuisine, or a specific preference)
- Vibe (e.g., comfort, healthy, party, late)
- Spice Level (0 = none, 10 = burn my face)
- Target Budget (1 = $, 2 = $$, 3 = $$$)
- Refinements (An array of tweaks the user requested AFTER seeing an initial result, like "make it cheaper" or "Make it Veg 🌱")

### Recommendation Rules:
1. Grounded & Real: Pick actual, real-world restaurants they can visit or order from in their location. Be as specific as possible. If the inputs suggest Indian cuisine or the location is in India, prioritize highly relevant, local Indian food options and restaurants over Western defaults.
2. Refinements First: If Refinements are present, heavily prioritize their adjustments in your conversational response.
3. Personality: Write a short, hype message as your main conversational opening. Do NOT sound like a generic AI or use phrases like "Based on your preferences I recommend". Use phrases like "Alright, we've got a comfort food situation" or "Nice. You're giving cozy but slightly adventurous."
4. Explain Why: Your explanation MUST connect directly back to their vibe, budget, and spice level. Keep it short. (Example: "It fits because you wanted something spicy, familiar, and not too heavy.")
5. Local Currency: Ensure the "price" returned strictly matches the local currency of the restaurant's region. For example, use '₹' for India (e.g., '₹350'), '$' for the US, '£' for the UK, etc.

### Output Format
Return ONLY valid JSON matching this exact structure:
{
  "message": "A short, highly contextual conversational response from Mr. Fry presenting the result",
  "recommendation": {
    "primary": { "name": "Specific Dish Name", "description": "Mouth-watering desc", "price": "₹300 or $12", "chain": "Actual Restaurant Name", "city": "City Name", "area": "Neighborhood or Area" },
    "backup": { "name": "Alternative Dish", "description": "Why backup fits", "price": "₹150 or $8", "chain": "Alternative Restaurant", "city": "City Name", "area": "Neighborhood or Area" },
    "explanation": "Brief specifically explaining why this fits their vibe and constraints",
    "combo": "A fun drink/side pairing suggestion",
    "mystery": { "name": "Wildcard Dish", "description": "A totally unexpected suggestion from a different cuisine", "price": "₹350 or $15", "chain": "Wildcard Restaurant Name", "city": "City Name", "area": "Neighborhood or Area" }
  }
}`;

// ─── API Route ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json() as { profile: DiscoveryProfile };

    if (!process.env.GEMINI_API_KEY) {
      console.warn('[MrFry Backend] No GEMINI_API_KEY found in environment.');
      return NextResponse.json({ 
        message: "Mr. Fry is offline without an API key! Check your .env.local 🍔"
      });
    }

    console.log('[MrFry Backend] GEMINI_API_KEY found in process.env. Initializing client...');

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
      });

      let dietaryRule = '';
      const allText = [profile.craving, ...profile.refinements].join(' ').toLowerCase();
      if (allText.includes('veg') || allText.includes('plant') || allText.includes('herbivore')) {
        dietaryRule = `\nCRITICAL DIETARY RESTRICTION: The user requested a vegetarian option. EVERY SINGLE recommendation (Primary, Backup, and Mystery) MUST be 100% strictly vegetarian. Absolutely zero meat, chicken, beef, pork, or seafood. NO EXCEPTIONS. If you offer a place known for meat, you MUST explicitly recommend their flagship vegetarian dish.`;
      }

      const promptData = `
        User Discovery Profile:
        Location: ${profile.location}
        Craving: ${profile.craving || 'Surprise me'}
        Vibe: ${profile.vibe}
        Spice Tolerance (1-10): ${profile.spice}
        Budget (1=$, 2=$$, 3=$$$): ${profile.budget}
        Refinement requests (if any): ${profile.refinements.length ? profile.refinements.join(', ') : 'None yet'}
        ${dietaryRule}
      `;

      console.log('[MrFry Backend] Sending profile to Gemini:', profile);
      const result = await model.generateContent(`${SYSTEM_PROMPT}\n\n${promptData}`);
      const rawText = result.response.text();
      console.log('[MrFry Backend] Raw response received from Gemini:', rawText);

      const aiResponse = cleanJson(rawText);
      aiResponse.source = 'gemini'; // Add source marker

      if (aiResponse.recommendation) {
        const p = aiResponse.recommendation.primary;
        const b = aiResponse.recommendation.backup;
        const m = aiResponse.recommendation.mystery;

        // 1. Evaluate Primary
        if (p?.chain && p?.city) {
          console.log(`[MrFry Backend] Attempting Supabase Lookup for Primary: ${p.chain}`);
          const links = await findDeliveryLinks(p.chain, p.city, p.area);
          if (links) {
            console.log(`[MrFry Backend] ✅ FOUND Primary Links:`, Object.keys(links).filter(k => (links as any)[k]));
            Object.assign(aiResponse.recommendation.primary, links);
          }
        }

        // 2. Evaluate Backup
        if (b?.chain && b?.city) {
          console.log(`[MrFry Backend] Attempting Supabase Lookup for Backup: ${b.chain}`);
          const links = await findDeliveryLinks(b.chain, b.city, b.area);
          if (links) {
            console.log(`[MrFry Backend] ✅ FOUND Backup Links:`, Object.keys(links).filter(k => (links as any)[k]));
            Object.assign(aiResponse.recommendation.backup, links);
          }
        }

        // 3. Evaluate Mystery
        if (m && typeof m === 'object' && m.chain && m.city) {
          console.log(`[MrFry Backend] Attempting Supabase Lookup for Mystery: ${m.chain}`);
          const links = await findDeliveryLinks(m.chain, m.city, m.area);
          if (links) {
            console.log(`[MrFry Backend] ✅ FOUND Mystery Links:`, Object.keys(links).filter(k => (links as any)[k]));
            Object.assign(aiResponse.recommendation.mystery, links);
          }
        }
      }

      console.log('[MrFry Backend] Returning successful Gemini recommendation.');
      return NextResponse.json(aiResponse);

    } catch (err) {
      console.error('[MrFry Backend] AI Generation failed unexpectedly!');
      console.error('[MrFry Backend] EXACT ERROR TRACE:', err);
      console.warn('[MrFry Backend] Triggering hard fallback logic...');

      // Hard fallback if Gemini is rate limited or fails
      return NextResponse.json({
        source: 'fallback', // Add source marker
        error_details: err instanceof Error ? err.message : String(err),
        message: "I had a minor brain freeze dealing with all this data. But I won't leave you hungry. Here's a solid hit.",
        recommendation: {
          primary: { name: "Spicy Deluxe Chicken Sandwich", description: "Crispy, bold, and satisfying.", price: "$$", chain: "Chick-fil-A" },
          backup: { name: "McDouble", description: "If we need to stay perfectly on a tight budget.", price: "$", chain: "McDonald's", city: "Your City", area: "Downtown" },
          explanation: "It fits because sometimes you just need something perfectly familiar with a bit of a kick.",
          combo: "Add some loaded fries for the full experience.",
          mystery: { name: "Mystery Pizza Slice", description: "That local pizza spot everyone talks about.", price: "$$", chain: "Local Pizza Joint", city: "Your City", area: "Downtown" }
        }
      });
    }

  } catch (err) {
    console.error('Final Chat API error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
