import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PLAN_LIMITS: Record<string, number | null> = {
  lite:      10,
  dedicated: 30,
  fam:       null, // unlimited
};

export async function POST(req: NextRequest) {
  try {
    const { email, increment = true } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error('[Usage] SUPABASE_SERVICE_ROLE_KEY is missing');
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch current user row
    const { data: row, error: fetchError } = await supabase
      .from('users')
      .select('subscription_plan, interactions_this_month, interactions_reset_month')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError || !row) {
      console.error('[Usage] Could not fetch user:', fetchError?.message, fetchError?.code);
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const plan: string = (row.subscription_plan ?? 'lite').toLowerCase();
    const limit = PLAN_LIMITS[plan] ?? 10;
    const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    const storedMonth = row.interactions_reset_month ?? currentMonth;

    // Determine new count — reset if the month has rolled over
    const monthChanged = storedMonth !== currentMonth;
    const prevCount: number = monthChanged ? 0 : (row.interactions_this_month ?? 0);

    // Check limit before incrementing
    if (limit !== null && prevCount >= limit) {
      console.log(`[Usage] ❌ Limit reached for ${email}: ${prevCount}/${limit} on plan '${plan}'.`);
      return NextResponse.json({ allowed: false, used: prevCount, limit, plan }, { status: 200 });
    }

    if (!increment) {
      console.log(`[Usage] 🔎 Checked limit for ${email}: ${prevCount}/${limit ?? '∞'} on plan '${plan}'.`);
      return NextResponse.json({ allowed: true, used: prevCount, limit, plan }, { status: 200 });
    }

    // Increment usage
    const newCount = prevCount + 1;
    const { error: updateError } = await supabase
      .from('users')
      .update({
        interactions_this_month: newCount,
        interactions_reset_month: currentMonth,
      })
      .eq('email', email.toLowerCase());

    if (updateError) {
      console.error('[Usage] Failed to update count:', updateError.message);
      // Allow the interaction — don't block user due to DB write failure
    }

    console.log(`[Usage] ✅ Allowed ${email}: ${newCount}/${limit ?? '∞'} on plan '${plan}'.`);
    return NextResponse.json({ allowed: true, used: newCount, limit, plan });

  } catch (err) {
    console.error('[Usage] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
