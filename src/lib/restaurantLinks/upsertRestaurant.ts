// ─── Restaurant Links Upsert Utility ─────────────────────────────────────────
// Automatically seeds the `restaurant_links` table from real recommendation traffic.
//
// Strategy:
//   1. Match by google_place_id (most reliable — hybrid mode)
//   2. Match by restaurant_name + city + area (fallback for Gemini memory mode)
//   3. If found:  only patch fields that are currently NULL (never overwrite good data)
//   4. If not found: insert a fresh row with all available metadata
//
// Safety: all errors are caught and logged — never throws, never blocks the response.

import { createClient } from '@supabase/supabase-js';

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

async function upsertSingle(input: RecommendedRestaurantInput): Promise<void> {
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

  // ── Step 2a: UPDATE — only patch currently-NULL fields ────────────────────
  if (existingRow && existingId) {
    const patch: Record<string, any> = { updated_at: now };

    // Only set a field if it is currently blank AND we have a better value
    if (!existingRow.google_place_id  && input.google_place_id)  patch.google_place_id  = input.google_place_id;
    if (!existingRow.formatted_address && input.formatted_address) patch.formatted_address = input.formatted_address;
    if (!existingRow.rating            && input.rating != null)    patch.rating            = input.rating;
    if (!existingRow.price_level       && input.price_level != null) patch.price_level     = input.price_level;
    if (!existingRow.country           && input.country)           patch.country           = input.country;

    // Only hit the database if there is something worth updating
    if (Object.keys(patch).length > 1) {
      const { error } = await supabase
        .from('restaurant_links')
        .update(patch)
        .eq('id', existingId);
      if (error) console.error(`[Links] Update error for "${input.restaurant_name}":`, error.message);
      else console.log(`[Links] ✅ Patched existing row: ${input.restaurant_name} (${input.city})`);
    } else {
      console.log(`[Links] Row already complete — no update needed: ${input.restaurant_name}`);
    }
    return;
  }

  // ── Step 2b: INSERT — new restaurant ─────────────────────────────────────
  const { error } = await supabase
    .from('restaurant_links')
    .insert({
      restaurant_name:    input.restaurant_name,
      city:               input.city,
      area:               input.area,
      formatted_address:  input.formatted_address  ?? null,
      country:            input.country             ?? null,
      google_place_id:    input.google_place_id     ?? null,
      rating:             input.rating              ?? null,
      price_level:        input.price_level         ?? null,
      source:             input.source,
      enrichment_status:  'pending',
      created_at:         now,
      updated_at:         now,
    });

  if (error) console.error(`[Links] Insert error for "${input.restaurant_name}":`, error.message);
  else console.log(`[Links] ✅ Inserted new restaurant: ${input.restaurant_name} in ${input.city}`);
}

/**
 * Upserts all recommended restaurants into the `restaurant_links` table.
 *
 * Designed to be called FIRE-AND-FORGET after the response is already sent to the user.
 * Never throws — all errors stay contained and logged.
 *
 * @param recommendations  Array of assembled recommendation objects from the route
 * @param source           'hybrid' | 'gemini_fallback' — records how the rec was generated
 */
export async function upsertRestaurantLinks(
  recommendations: Array<{
    chain:     string;
    city:      string;
    area?:     string;
    address?:  string;
    place_id?: string;
    rating?:   number;
    price_level?: number;
  }>,
  source: string,
): Promise<void> {
  try {
    const tasks = recommendations
      .filter(r => r.chain?.trim() && r.city?.trim()) // need at least name + city
      .map(r =>
        upsertSingle({
          restaurant_name:   r.chain.trim(),
          city:              r.city.trim(),
          area:              r.area?.trim() || '',
          formatted_address: r.address,
          country:           extractCountry(r.address),
          google_place_id:   r.place_id,
          rating:            r.rating,
          price_level:       r.price_level,
          source,
        }).catch(err =>
          console.error(`[Links] Unhandled error for "${r.chain}":`, err),
        ),
      );

    await Promise.allSettled(tasks);
    console.log(`[Links] Processed ${tasks.length} restaurant(s) for restaurant_links.`);
  } catch (err) {
    // Top-level safety net — should never reach here but keeps route stable
    console.error('[Links] Fatal error in upsertRestaurantLinks:', err);
  }
}
