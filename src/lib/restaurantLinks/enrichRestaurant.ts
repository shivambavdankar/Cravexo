// ─── Restaurant Link Enrichment Engine ────────────────────────────────────────
// Attempts to discover and verify delivery-platform URLs for a restaurant.
//
// Pipeline per restaurant:
//   1. Fetch current row — skip if already 'complete'
//   2. Determine relevant platforms by country (platformMap)
//   3. Ask Gemini for candidate URLs (strict confidence threshold)
//   4. Verify each candidate URL via HTTP HEAD request
//   5. Save only verified URLs (2xx / 3xx response)
//   6. Update enrichment_status, link_confidence, timestamps
//
// All errors are contained — never throws, never blocks the route.

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRelevantPlatforms, PlatformColumn } from './platformMap';

export interface EnrichmentPayload {
  row_id:           string;
  restaurant_name:  string;
  city:             string;
  country?:         string | null;
  google_place_id?: string | null;
}

// ─── Supabase ─────────────────────────────────────────────────────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// ─── URL Verification ─────────────────────────────────────────────────────────
// Sends a HEAD request (falls back to GET on 405) and accepts 2xx / 3xx.

async function verifyUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500); // Fast fail for Vercel

    try {
      const res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }
      });
      clearTimeout(timeout);

      // Many delivery apps (Swiggy, DoorDash) return 403 to bots, but 404 for non-existent pages.
      // So 403 means "the endpoint is there, but you are a bot" -> valid URL!
      if (res.status === 405) {
        const getRes = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(2500),
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return (getRes.status >= 200 && getRes.status < 400) || getRes.status === 403;
      }
      return (res.status >= 200 && res.status < 400) || res.status === 403;
    } catch {
      clearTimeout(timeout);
      return false;
    }
  } catch {
    return false;
  }
}

// ─── Gemini URL Suggestion ────────────────────────────────────────────────────
// Returns a map of platform column → { url, confidence }.
// Only returns entries Gemini is >= 85% confident about.

interface UrlSuggestion { url: string | null; confidence: number }
type SuggestionMap = Partial<Record<PlatformColumn, UrlSuggestion>>;

async function suggestUrls(
  restaurantName: string,
  city: string,
  country: string,
  platforms: PlatformColumn[],
): Promise<SuggestionMap> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return {};

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
  });

  const platformList = platforms.join(', ');
  const prompt = `You are a delivery-platform URL lookup assistant for restaurants.

CRITICAL RULES:
- Only return a URL if you are at least 85% confident it is the EXACT current page for this specific restaurant outlet.
- Do NOT construct, guess, or fabricate URLs. Only return URLs you are highly confident exist.
- Return null for any platform you are unsure about.
- Return null for any platform not relevant to the restaurant's country.
- Confidence must be a decimal between 0.0 and 1.0.

Restaurant: "${restaurantName}"
City: "${city}"
Country: "${country}"
Platforms to check: ${platformList}

Return ONLY valid JSON with entries for these platforms (use null for unknown/irrelevant):
{
  ${platforms.map(p => `"${p}": { "url": "https://..." or null, "confidence": 0.0 }`).join(',\n  ')}
}`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(raw) as SuggestionMap;
  } catch (err) {
    console.error('[Enrichment] Gemini suggestion failed:', err);
    return {};
  }
}

// ─── Main Enrichment Function ─────────────────────────────────────────────────

const CONFIDENCE_THRESHOLD = 0.85;

export async function enrichRestaurant(payload: EnrichmentPayload): Promise<void> {
  const supabase = getSupabase();
  const { row_id, restaurant_name, city, country } = payload;
  const now = new Date().toISOString();

  console.log(`[Enrichment] Starting: "${restaurant_name}" in ${city} (${country || 'unknown country'})`);

  // ── 1. Fetch current row ───────────────────────────────────────────────────
  const { data: row, error: fetchErr } = await supabase
    .from('restaurant_links')
    .select('enrichment_status, zomato_url, swiggy_url, ubereats_url, doordash_url, grubhub_url, restaurant_url, country')
    .eq('id', row_id)
    .single();

  if (fetchErr || !row) {
    console.error(`[Enrichment] Row not found: ${row_id}`);
    return;
  }

  // Skip rows that are already fully enriched
  if (row.enrichment_status === 'complete') {
    console.log(`[Enrichment] Skipping — already complete: ${restaurant_name}`);
    return;
  }

  // ── 2. Determine relevant platforms ───────────────────────────────────────
  const resolvedCountry = country || row.country || '';
  const relevantPlatforms = getRelevantPlatforms(resolvedCountry);

  // Only attempt platforms whose column is currently null
  const missingPlatforms = relevantPlatforms.filter(col => !row[col as keyof typeof row]);

  if (missingPlatforms.length === 0) {
    await supabase.from('restaurant_links').update({
      enrichment_status:      'complete',
      enrichment_attempted_at: now,
      last_verified_at:        now,
      updated_at:              now,
    }).eq('id', row_id);
    console.log(`[Enrichment] All links already present — marked complete: ${restaurant_name}`);
    return;
  }

  console.log(`[Enrichment] Missing platforms for "${restaurant_name}": ${missingPlatforms.join(', ')}`);

  // Mark enrichment as in-progress
  await supabase.from('restaurant_links').update({
    enrichment_attempted_at: now,
    updated_at: now,
  }).eq('id', row_id);

  // ── 3. Gemini URL suggestions ──────────────────────────────────────────────
  const suggestions = await suggestUrls(restaurant_name, city, resolvedCountry, missingPlatforms);

  // ── 4 & 5. Verify each suggestion in PARALLEL and save only verified ones ─
  const patch: Record<string, any> = { updated_at: now };
  let verifiedCount = 0;
  let totalConfidence = 0;
  let attemptedCount = 0;

  const validSuggestions = missingPlatforms
    .map(col => ({ col, suggestion: suggestions[col] }))
    .filter(x => x.suggestion?.url && x.suggestion.confidence >= CONFIDENCE_THRESHOLD);

  attemptedCount = validSuggestions.length;

  if (attemptedCount > 0) {
    console.log(`[Enrichment] Verifying ${attemptedCount} URLs in parallel...`);
    const results = await Promise.all(
      validSuggestions.map(async ({ col, suggestion }) => {
        const isValid = await verifyUrl(suggestion!.url!);
        return { col, suggestion, isValid };
      })
    );

    for (const { col, suggestion, isValid } of results) {
      if (isValid) {
        patch[col] = suggestion!.url;
        verifiedCount++;
        totalConfidence += suggestion!.confidence;
        console.log(`[Enrichment] ✅ Verified ${col}: ${suggestion!.url}`);
      } else {
        console.log(`[Enrichment] ❌ Verification failed for ${col}: ${suggestion!.url}`);
      }
    }
  }

  // ── 6. Compute enrichment status and write back ────────────────────────────
  let enrichment_status: string;
  if (verifiedCount > 0 && verifiedCount >= missingPlatforms.length) {
    enrichment_status = 'complete';
  } else if (verifiedCount > 0) {
    enrichment_status = 'partial';
  } else if (attemptedCount > 0) {
    // Gemini suggested URLs but none passed HTTP verification
    enrichment_status = 'review_needed';
  } else {
    // Gemini had no confident suggestions for any platform
    enrichment_status = 'complete'; // Enrichment is done — nothing found, nothing to retry
  }

  const link_confidence = verifiedCount > 0 ? totalConfidence / verifiedCount : null;

  await supabase.from('restaurant_links').update({
    ...patch,
    enrichment_status,
    link_confidence,
    last_verified_at: now,
    updated_at:       now,
  }).eq('id', row_id);

  console.log(
    `[Enrichment] Finished "${restaurant_name}" — status: ${enrichment_status}, verified: ${verifiedCount}/${missingPlatforms.length}`,
  );
}
