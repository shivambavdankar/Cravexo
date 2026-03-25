import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email, auth_id } = await req.json();

    if (!email && !auth_id) {
      return NextResponse.json({ error: 'User identifier required.' }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('[DeleteAccount] SUPABASE_SERVICE_ROLE_KEY is not set.');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    // Admin client — uses service role key, never exposed to browser
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Hard-delete the isolated Database profile row immediately using the explicit email.
    // This perfectly cleans up the system even if PostgreSQL ON DELETE CASCADE failed or auth_id was missing.
    if (email) {
      const { error: profileDeleteError } = await adminSupabase
        .from('users')
        .delete()
        .eq('email', email.toLowerCase());

      if (profileDeleteError) {
        console.error('[DeleteAccount] Profile sweep error:', profileDeleteError.message);
      } else {
        console.log(`[DeleteAccount] ✅ Cleaned isolated user profile: ${email}`);
      }
    }

    // 2. Hard-delete the core Supabase Auth user.
    if (auth_id) {
      const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(auth_id);
      if (authDeleteError) {
        console.error('[DeleteAccount] Auth user delete error:', authDeleteError.message);
      } else {
        console.log(`[DeleteAccount] ✅ Auth identity destroyed: ${auth_id}`);
      }
    } else {
      console.warn('[DeleteAccount] No auth_id provided — only profile row deleted. Auth record may persist.');
    }

    console.log(`[DeleteAccount] ✅ Account deletion complete for ${email ?? auth_id}`);
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('[DeleteAccount] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
