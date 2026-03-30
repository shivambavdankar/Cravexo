import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase Client (bypassing RLS)
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
  auth: { persistSession: false }
});

async function searchUnsplash(query: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('[Image Resolver] UNSPLASH_ACCESS_KEY is missing.');
    return null;
  }

  try {
    // We add 'food' to help bias the search away from storefronts/signs, 
    // unless the query already strongly implies it.
    const finalQuery = encodeURIComponent(query + ' food');
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${finalQuery}&per_page=1&orientation=landscape&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      console.error(`[Image Resolver] Unsplash API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      // Use the 'regular' size which is usually 1080w, great for cards.
      return data.results[0].urls.regular;
    }
    return null;
  } catch (error) {
    console.error('[Image Resolver] Failed to fetch from Unsplash:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { restaurant_name, city, food_item, craving, is_dessert } = await req.json();

    if (!food_item) {
      return NextResponse.json({ error: 'Missing food_item parameter' }, { status: 400 });
    }

    // Determine Tiers
    // Tier 1: Try restaurant + food item (Unsplash rarely hits this perfectly, but it's worth trying for famous spots)
    const tier1Query = restaurant_name ? `${restaurant_name} ${food_item}`.trim() : null;
    // Tier 2: Exact food item (The most reliable for Unsplash)
    const tier2Query = food_item.trim();
    // Tier 3: Sub-category / Craving context
    const tier3Query = craving ? craving.trim() : null;
    // Tier 4: Broad fallback
    const tier4Query = is_dessert ? 'dessert pastry pastry' : 'delicious meal restaurant';

    const queriesToTry = [
      { tier: 'Tier 1: Restaurant Specific', query: tier1Query },
      { tier: 'Tier 2: Exact Item', query: tier2Query },
      { tier: 'Tier 3: Sub-category', query: tier3Query },
      { tier: 'Tier 4: Broad Fallback', query: tier4Query }
    ].filter(q => q.query !== null);

    let resolvedUrl: string | null = null;
    let resolvedTier: string | null = null;
    let resolvedQuery: string | null = null;

    // Execute Tiers Sequentially (Checking Cache First)
    for (const step of queriesToTry) {
      if (!step.query) continue;

      const cacheKey = step.query.toLowerCase();

      // 1. Check Cache
      const { data: cached } = await supabase
        .from('image_cache')
        .select('image_url, source_tier')
        .eq('query_key', cacheKey)
        .single();

      if (cached && cached.image_url) {
        console.log(`[Image Resolver] Cache HIT for: "${cacheKey}" (${cached.source_tier})`);
        return NextResponse.json({
          image_url: cached.image_url,
          source_tier: cached.source_tier,
          query_used: step.query,
          cached: true
        });
      }

      // 2. Not in Cache -> Search Unsplash
      console.log(`[Image Resolver] Cache MISS. Searching Unsplash for: "${step.query}"`);
      const url = await searchUnsplash(step.query);

      if (url) {
        resolvedUrl = url;
        resolvedTier = step.tier;
        resolvedQuery = step.query;

        // Save to cache returning async so we don't block the response
        supabase.from('image_cache').insert({
          query_key: cacheKey,
          image_url: resolvedUrl,
          source_tier: resolvedTier
        }).then(({ error }) => {
          if (error) console.error('[Image Resolver] Failed to cache image:', error.message);
        });

        // Break early since we found an image!
        break; 
      }
    }

    if (resolvedUrl) {
      return NextResponse.json({
        image_url: resolvedUrl,
        source_tier: resolvedTier,
        query_used: resolvedQuery,
        cached: false
      });
    }

    // Total Fallback Failure
    return NextResponse.json({ error: 'No image found across all tiers' }, { status: 404 });

  } catch (error: any) {
    console.error('[Image Resolver] internal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
