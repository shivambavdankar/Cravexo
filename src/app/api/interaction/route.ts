import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
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

    const { location, rec_1, rec_2, rec_3 } = await req.json();
    const email = user.email;

    if (!location || !rec_1 || !rec_2) {
      return NextResponse.json({ error: 'Missing interaction data payload.' }, { status: 400 });
    }

    // 1. Identity Verification: Find the user's explicit profile PK
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !userData) {
      console.error('[Interaction Log] Failed to map email to users.id', userError?.message);
      return NextResponse.json({ error: 'User profile mapping failed.' }, { status: 500 });
    }

    // 2. Persistent Storage: Securely log the final interaction state
    const { error: insertError } = await adminSupabase
      .from('user_interaction')
      .insert({
        user_id: userData.id, // Maps specifically to `users.id` foreign key
        user_location: location,
        rec_1,
        rec_2,
        rec_3: rec_3 || null
      });

    if (insertError) {
      console.error('[Interaction Log] Failed to insert interaction row', insertError.message);
      return NextResponse.json({ error: 'Database verification failed on insert.' }, { status: 500 });
    }

    console.log(`[Interaction Log] ✅ Successfully preserved interaction for user_id ${userData.id}`);
    
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: any) {
    console.error('[Interaction Log] Critical Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
