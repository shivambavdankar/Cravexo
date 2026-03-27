import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      console.error('[Interaction Log] SUPABASE_SERVICE_ROLE_KEY is missing');
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { email, location, rec_1, rec_2, rec_3 } = await req.json();

    if (!email || !location || !rec_1 || !rec_2) {
      return NextResponse.json({ error: 'Missing interaction data payload.' }, { status: 400 });
    }

    // 1. Identity Verification: Find the user's profile PK by email
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !userData) {
      console.error('[Interaction Log] Failed to map email to users.id', userError?.message);
      return NextResponse.json({ error: 'User profile mapping failed.' }, { status: 500 });
    }

    // 2. Persistent Storage: Log the interaction
    const { error: insertError } = await adminSupabase
      .from('user_interaction')
      .insert({
        user_id: userData.id,
        user_location: location,
        rec_1,
        rec_2,
        rec_3: rec_3 || null
      });

    if (insertError) {
      console.error('[Interaction Log] Failed to insert interaction row', insertError.message);
      return NextResponse.json({ error: 'Database insert failed.' }, { status: 500 });
    }

    console.log(`[Interaction Log] ✅ Successfully logged interaction for ${email}`);
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Interaction Log] Critical Error:', message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
