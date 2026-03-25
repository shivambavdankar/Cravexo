import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized. Email required.' }, { status: 401 });
    }

    // In a live system:
    // const customer = await getStripeCustomer(email);
    // await stripe.subscriptions.cancel(customer.subscription_id);
    //
    // The Stripe Webhook would then asynchronously update the DB. For our mock, we update synchronously.

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: updateError } = await adminSupabase
      .from('users')
      .update({ subscription_plan: 'lite' })
      .eq('email', email.toLowerCase());

    if (updateError) {
      console.error('[Billing Cancel] Failed to downgrade user:', updateError.message);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    console.log(`[Billing Cancel] ✅ Successfully downgraded ${email} to free plan`);
    
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: any) {
    console.error('[Billing Cancel] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
