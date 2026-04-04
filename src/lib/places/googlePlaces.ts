// ─── Google Places (New API) Utility ─────────────────────────────────────────
// Uses lean field masking for cost control.
// Field mask: id, displayName, rating, userRatingCount, priceLevel,
//             businessStatus, formattedAddress

export interface RestaurantCandidate {
  place_id: string;
  name: string;
  address: string;
  area: string;          // first component of the address
  city: string;          // second-to-last component of the address
  rating?: number;       // e.g. 4.6
  rating_count?: number; // e.g. 1842
  price_level?: number;  // 1 = $, 2 = $$, 3 = $$$, 4 = $$$$
  business_status: string;
}

// Maps the Places API string enum → numeric price level
const PRICE_LEVEL_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

// Converts a raw Places API place object into our internal schema
function normalizePlace(place: any): RestaurantCandidate {
  const address: string = place.formattedAddress || '';
  const parts = address.split(',').map((p: string) => p.trim());

  // Standard Google Places address format:
  // "Suite, Street, City, State ZIP, Country"
  // Drop the last 2 segments (state+zip and country) — keep everything up to city.
  // E.g. "1234 Crest Ave, Oakland, CA 94605, USA"
  //   → cleanParts = ["1234 Crest Ave", "Oakland"]
  //   → area = "1234 Crest Ave", city = "Oakland"
  // E.g. "Suite 5, 1234 Crest Ave, Oakland, CA 94605, USA"
  //   → cleanParts = ["Suite 5", "1234 Crest Ave", "Oakland"]
  //   → area = "Suite 5, 1234 Crest Ave", city = "Oakland"
  const cleanParts = parts.slice(0, Math.max(parts.length - 2, 1));
  const city = cleanParts[cleanParts.length - 1] || '';  // last clean segment = city
  const area = cleanParts.slice(0, -1).join(', ');       // everything before city = street/suite

  return {
    place_id: place.id || '',
    name: place.displayName?.text || 'Unknown Restaurant',
    address,
    area,
    city,
    rating: place.rating ?? undefined,
    rating_count: place.userRatingCount ?? undefined,
    price_level: place.priceLevel ? PRICE_LEVEL_MAP[place.priceLevel] : undefined,
    business_status: place.businessStatus || 'UNKNOWN',
  };
}

/**
 * Searches Google Places (New Text Search API) for restaurants matching the query.
 * Returns empty array if the API key is missing or the call fails, allowing
 * the caller to fall back to pure Gemini mode.
 *
 * @param searchQuery  Natural-language query e.g. "Thai restaurant in Brooklyn NY"
 * @param maxResults   Max candidates to return (default 20)
 * @param radiusMeters Search radius in metres (default 15000 = 15 km)
 */
export async function searchRestaurants(
  searchQuery: string,
  maxResults = 20,
  radiusMeters = 15000,
): Promise<RestaurantCandidate[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.warn('[Places] GOOGLE_PLACES_API_KEY not set — skipping Places search.');
    return [];
  }

  const body = {
    textQuery: searchQuery,
    maxResultCount: Math.min(maxResults, 20), // Places API hard cap is 20
    includedType: 'restaurant',
    // locationBias is omitted intentionally; the textQuery carries location intent
  };

  try {
    console.log(`[Places] Searching: "${searchQuery}" (radius hint: ${radiusMeters}m)`);
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // Lean field mask — only request what we actually need
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.businessStatus,places.formattedAddress',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Places] API error ${res.status}:`, errText);
      return [];
    }

    const data = await res.json();
    const places: any[] = data.places || [];

    console.log(`[Places] Received ${places.length} raw candidates.`);

    // Only keep open/operational places and normalize
    return places
      .filter(p => !p.businessStatus || p.businessStatus === 'OPERATIONAL')
      .map(normalizePlace)
      .slice(0, maxResults);
  } catch (err) {
    console.error('[Places] Fetch threw an error:', err);
    return [];
  }
}
