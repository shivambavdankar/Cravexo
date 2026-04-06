// ─── Enrichment API Endpoint ──────────────────────────────────────────────────
// POST /api/enrichment
//
// Modes:
//   1. { row_id, restaurant_name, city, country } → enrich a specific restaurant
//   2. {} (empty body)                             → process up to 10 pending rows (batch mode)
//
// This endpoint is designed to be called:
//   - Fire-and-forget from the recommendation flow (single restaurant)
//   - Via a Vercel cron job / manual trigger (batch mode)
//   - Manually for debugging

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enrichRestaurant, EnrichmentPayload } from '@/lib/restaurantLinks/enrichRestaurant';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // ── Mode 1: Specific restaurant ───────────────────────────────────────────
    if (body.row_id && body.restaurant_name && body.city) {
      const payload: EnrichmentPayload = {
        row_id:          body.row_id,
        restaurant_name: body.restaurant_name,
        city:            body.city,
        country:         body.country ?? null,
        google_place_id: body.google_place_id ?? null,
      };

      await enrichRestaurant(payload);
      return NextResponse.json({ status: 'done', restaurant: body.restaurant_name });
    }

    // ── Mode 2: Batch — process up to 10 pending rows ─────────────────────────
    const supabase = getSupabase();
    const { data: pendingRows, error } = await supabase
      .from('restaurant_links')
      .select('id, restaurant_name, city, country, google_place_id')
      .in('enrichment_status', ['pending', 'review_needed'])
      .is('enrichment_attempted_at', null)   // not yet attempted
      .limit(10);

    if (error) {
      console.error('[Enrichment API] Failed to fetch pending rows:', error.message);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    if (!pendingRows?.length) {
      return NextResponse.json({ status: 'nothing_to_enrich' });
    }

    console.log(`[Enrichment API] Batch processing ${pendingRows.length} pending restaurants.`);

    // Process sequentially to avoid hammering Gemini + HTTP concurrently
    for (const row of pendingRows) {
      await enrichRestaurant({
        row_id:          row.id,
        restaurant_name: row.restaurant_name,
        city:            row.city,
        country:         row.country,
        google_place_id: row.google_place_id,
      }).catch(err => console.error(`[Enrichment API] Error for ${row.restaurant_name}:`, err));
    }

    return NextResponse.json({ status: 'done', processed: pendingRows.length });
  } catch (err) {
    console.error('[Enrichment API] Fatal error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Allow GET for health check / manual trigger from browser
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    description: 'POST to this endpoint to enrich pending restaurant_links rows.',
    modes: {
      single: 'POST { row_id, restaurant_name, city, country }',
      batch:  'POST {} — processes up to 10 pending rows',
    },
  });
}
