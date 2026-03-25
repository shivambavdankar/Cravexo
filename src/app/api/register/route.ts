import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone_number, location } = await req.json();

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and Email are required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Register] Supabase env variables are missing.');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[Register] Inserting user: ${name} <${email}>`);

    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone_number: phone_number?.trim() || null,
        location: location?.trim() || null,
      }]);

    if (insertError) {
      console.error('[Register] Supabase insert error:', insertError.message, insertError.code, insertError.details);
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
    }

    // Try to read back the created row; fall back to submitted data if SELECT RLS is strict
    const { data: created } = await supabase
      .from('users')
      .select('id, name, email, phone_number, location, subscription_plan, interactions_this_month, interactions_reset_month')
      .eq('email', email.trim().toLowerCase())
      .single();

    const user = created ?? {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone_number: phone_number?.trim() || null,
      location: location?.trim() || null,
      subscription_plan: 'lite',
      interactions_this_month: 0,
      interactions_reset_month: new Date().toISOString().slice(0, 7),
    };

    console.log(`[Register] ✅ User registered successfully: ${user.email}`);
    return NextResponse.json({ user }, { status: 201 });

  } catch (err) {
    console.error('[Register] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
