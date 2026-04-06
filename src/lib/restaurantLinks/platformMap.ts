// ─── Country-Aware Delivery Platform Map ──────────────────────────────────────
// Defines which delivery platforms are valid to attempt per country.
// Only these columns will be touched during enrichment for a given restaurant.
// Columns not in the list for a country will ALWAYS stay null.

export type PlatformColumn =
  | 'zomato_url'
  | 'swiggy_url'
  | 'ubereats_url'
  | 'doordash_url'
  | 'grubhub_url'
  | 'restaurant_url';

// Maps country name (or partial substring) → relevant platform columns.
// restaurant_url is always attempted — it is the restaurant's own website.
const COUNTRY_PLATFORM_MAP: Array<{ match: string; platforms: PlatformColumn[] }> = [
  { match: 'india',          platforms: ['zomato_url', 'swiggy_url', 'restaurant_url'] },
  { match: 'united states',  platforms: ['ubereats_url', 'doordash_url', 'grubhub_url', 'restaurant_url'] },
  { match: 'canada',         platforms: ['ubereats_url', 'doordash_url', 'restaurant_url'] },
  { match: 'australia',      platforms: ['ubereats_url', 'restaurant_url'] },
  { match: 'united kingdom', platforms: ['ubereats_url', 'restaurant_url'] },
  { match: 'uae',            platforms: ['restaurant_url'] },
  { match: 'singapore',      platforms: ['restaurant_url'] },
  { match: 'malaysia',       platforms: ['restaurant_url'] },
  { match: 'germany',        platforms: ['restaurant_url'] },
  { match: 'france',         platforms: ['restaurant_url'] },
];

const DEFAULT_PLATFORMS: PlatformColumn[] = ['restaurant_url'];

/**
 * Returns the delivery platform columns that are relevant for a given country.
 * Only these columns should ever be populated by enrichment; all others stay null.
 */
export function getRelevantPlatforms(country?: string | null): PlatformColumn[] {
  if (!country) return DEFAULT_PLATFORMS;
  const lower = country.toLowerCase();
  for (const entry of COUNTRY_PLATFORM_MAP) {
    if (lower.includes(entry.match)) return entry.platforms;
  }
  return DEFAULT_PLATFORMS;
}
