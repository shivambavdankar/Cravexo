import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      console.error('[Memory Fetch] SUPABASE_SERVICE_ROLE_KEY is missing');
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
    }

    const email = req.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Missing email param.' }, { status: 400 });
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Get the user's internal ID by email
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User profile mapping failed.' }, { status: 404 });
    }

    // 2. Fetch the most recent interaction for this user
    const { data: interactionData, error: interactionError } = await adminSupabase
      .from('user_interaction')
      .select('user_location, rec_1, rec_2, rec_3')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (interactionError) {
      console.error('[Memory Fetch] Failed to read user_interaction:', interactionError.message);
      return NextResponse.json({ error: 'Database read failed.' }, { status: 500 });
    }

    return NextResponse.json({ interaction: interactionData || null }, { status: 200 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Memory Fetch] Critical Error:', message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
