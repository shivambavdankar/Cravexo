// ─── Restaurant Links Upsert Utility ─────────────────────────────────────────
// Automatically seeds the `restaurant_links` table from real recommendation traffic.
//
// Strategy:
//   1. Match by google_place_id (most reliable — hybrid mode)
//   2. Match by restaurant_name + city + area (fallback for Gemini memory mode)
//   3. If found:  only patch fields that are currently NULL (never overwrite good data)
//   4. If not found: insert a fresh row with all available metadata
//   5. After insert/useful-patch: trigger background enrichment fire-and-forget
//
// Safety: all errors are caught and logged — never throws, never blocks the response.

import { createClient } from '@supabase/supabase-js';
import { enrichRestaurant } from './enrichRestaurant';

export interface RecommendedRestaurantInput {
  restaurant_name:    string;
  city:               string;
  area:               string;
  formatted_address?: string;
  country?:           string;
  google_place_id?:   string;
  rating?:            number;
  price_level?:       number;
  source:             string; // 'hybrid' | 'gemini_fallback'
}

interface UpsertResult {
  rowId:             string;
  restaurantName:    string;
  city:              string;
  country?:          string;
  google_place_id?:  string;
  triggerEnrichment: boolean; // true when enrichment should be attempted
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// Extracts the country name from the last comma-separated segment of a full address.
// e.g. "123 St, Mumbai, MH 400001, India" → "India"
function extractCountry(address?: string): string | undefined {
  if (!address) return undefined;
  const parts = address.split(',').map(p => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || undefined;
}

// Triggers enrichment as a true fire-and-forget call — never awaited.
function triggerEnrichment(result: UpsertResult) {
  enrichRestaurant({
    row_id:          result.rowId,
    restaurant_name: result.restaurantName,
    city:            result.city,
    country:         result.country,
    google_place_id: result.google_place_id,
  }).catch(err => console.error(`[Links] Enrichment trigger error for "${result.restaurantName}":`, err));
}

async function upsertSingle(input: RecommendedRestaurantInput): Promise<UpsertResult | null> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  // ── Step 1: Find existing row ─────────────────────────────────────────────
  let existingRow: any  = null;
  let existingId:  string | null = null;

  if (input.google_place_id) {
    // Primary key match — avoids all ambiguity across chains and branches
    const { data } = await supabase
      .from('restaurant_links')
      .select('id, google_place_id, formatted_address, rating, price_level, country, enrichment_status')
      .eq('google_place_id', input.google_place_id)
      .maybeSingle();
    if (data) { existingRow = data; existingId = data.id; }
  }

  if (!existingRow) {
    // Fallback match — name + city + area (case-insensitive, handles Gemini fallback mode)
    const { data } = await supabase
      .from('restaurant_links')
      .select('id, google_place_id, formatted_address, rating, price_level, country, enrichment_status')
      .ilike('restaurant_name', input.restaurant_name)
      .eq('city', input.city)
      .ilike('area', input.area)
      .maybeSingle();
    if (data) { existingRow = data; existingId = data.id; }
  }

  // ── Step 2a: UPDATE — only patch currently-NULL fields ─────────────────────
  if (existingRow && existingId) {
    const patch: Record<string, any> = { updated_at: now };

    // Only set a field if it is currently blank AND we have a better value
    if (!existingRow.google_place_id   && input.google_place_id)  patch.google_place_id  = input.google_place_id;
    if (!existingRow.formatted_address && input.formatted_address) patch.formatted_address = input.formatted_address;
    if (!existingRow.rating            && input.rating != null)    patch.rating            = input.rating;
    if (!existingRow.price_level       && input.price_level != null) patch.price_level    = input.price_level;
    if (!existingRow.country           && input.country)           patch.country           = input.country;

    const meaningfulPatch = Object.keys(patch).length > 1; // more than just updated_at

    if (meaningfulPatch) {
      const { error } = await supabase
        .from('restaurant_links')
        .update(patch)
        .eq('id', existingId);
      if (error) {
        console.error(`[Links] Update error for "${input.restaurant_name}":`, error.message);
        return null;
      }
      console.log(`[Links] ✅ Patched existing row: ${input.restaurant_name} (${input.city})`);
    } else {
      console.log(`[Links] Row already complete — no update needed: ${input.restaurant_name}`);
    }

    // Re-trigger enrichment if we just added a place_id (materially improves the row)
    // or if enrichment is still pending from before
    const shouldEnrich = meaningfulPatch && !existingRow.google_place_id && !!input.google_place_id
      || existingRow.enrichment_status === 'pending';

    return {
      rowId:            existingId,
      restaurantName:   input.restaurant_name,
      city:             input.city,
      country:          input.country || existingRow.country,
      google_place_id:  input.google_place_id || existingRow.google_place_id,
      triggerEnrichment: shouldEnrich,
    };
  }

  // ── Step 2b: INSERT — new restaurant ──────────────────────────────────────
  const { data: inserted, error } = await supabase
    .from('restaurant_links')
    .insert({
      restaurant_name:    input.restaurant_name,
      city:               input.city,
      area:               input.area,
      state:              'Unknown', // fallback for NOT NULL constraint
      formatted_address:  input.formatted_address  ?? null,
      country:            input.country             ?? 'Unknown', // fallback for NOT NULL constraint
      google_place_id:    input.google_place_id     ?? null,
      rating:             input.rating              ?? null,
      price_level:        input.price_level         ?? null,
      source:             input.source,
      enrichment_status:  'pending',
      created_at:         now,
      updated_at:         now,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    console.error(`[Links] Insert error for "${input.restaurant_name}":`, error?.message);
    return null;
  }

  console.log(`[Links] ✅ Inserted new restaurant: ${input.restaurant_name} in ${input.city}`);
  return {
    rowId:             inserted.id,
    restaurantName:    input.restaurant_name,
    city:              input.city,
    country:           input.country,
    google_place_id:   input.google_place_id,
    triggerEnrichment: true, // always enrich freshly inserted rows
  };
}

/**
 * Upserts all recommended restaurants into the `restaurant_links` table,
 * then triggers background delivery-link enrichment for eligible rows.
 *
 * Designed to be called FIRE-AND-FORGET after the response is already sent.
 * Never throws — all errors stay contained and logged.
 */
export async function upsertRestaurantLinks(
  recommendations: Array<{
    chain:        string;
    city:         string;
    area?:        string;
    address?:     string;
    place_id?:    string;
    rating?:      number;
    price_level?: number;
  }>,
  source: string,
): Promise<void> {
  try {
    const tasks = recommendations
      .filter(r => r.chain?.trim() && r.city?.trim())
      .map(r =>
        upsertSingle({
          restaurant_name:  r.chain.trim(),
          city:             r.city.trim(),
          area:             r.area?.trim() || '',
          formatted_address: r.address,
          country:          extractCountry(r.address),
          google_place_id:  r.place_id,
          rating:           r.rating,
          price_level:      r.price_level,
          source,
        }).catch(err => {
          console.error(`[Links] Unhandled error for "${r.chain}":`, err);
          return null;
        }),
      );

    const results = await Promise.allSettled(tasks);

    // Fire enrichment for all eligible rows — completely separate from upsert
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value?.triggerEnrichment) {
        triggerEnrichment(result.value);
      }
    }

    console.log(`[Links] Processed ${tasks.length} restaurant(s) for restaurant_links.`);
  } catch (err) {
    console.error('[Links] Fatal error in upsertRestaurantLinks:', err);
  }
}
