import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) return NextResponse.json({ error: 'Unauthorized. Missing token.' }, { status: 401 });

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token);

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
    }

    const email = user.email;

    // 1. Get the user's internal integer or UUID ID
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User profile mapping failed.' }, { status: 404 });
    }

    // 2. Fetch the interactions for this user reliably using the chronologically latest row
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

  } catch (err: any) {
    console.error('[Memory Fetch] Critical Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
