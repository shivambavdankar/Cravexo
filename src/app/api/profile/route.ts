import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email, name, auth_id } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error('[Profile] SUPABASE_SERVICE_ROLE_KEY is missing');
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Database read failed.' }, { status: 500 });
    }

    if (!profile) {
      // Self-healing: If the user authenticated (e.g. via Google OAuth) but lacks a 'users' table row, create it now.
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert([{
          email: email.toLowerCase(),
          name: name || email.split('@')[0],
          auth_id: auth_id || undefined,
        }])
        .select('*')
        .single();

      if (insertError) {
        console.error('[Profile] Self-healing insert failed:', insertError.message);
        return NextResponse.json({ error: 'Failed to create profile.' }, { status: 500 });
      }

      return NextResponse.json({ profile: newProfile }, { status: 200 });
    }

    return NextResponse.json({ profile }, { status: 200 });

  } catch (err) {
    console.error('[Profile] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
