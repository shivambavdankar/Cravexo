import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Agnostic Webhook route.
 * In production, you would verify the Stripe/Razorpay signature here.
 * For now, this securely processes simulated events using the Service Role.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // In a live system:
    // const signature = headers().get('stripe-signature');
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    
    // For this mock architecture, we accept a direct JSON payload from the placeholder frontend
    const { event, data } = body;

    // We only care about checkout completion for upgrades
    if (event !== 'checkout.session.completed') {
      return NextResponse.json({ received: true });
    }

    const { email, planId } = data;

    if (!email || !planId) {
      return NextResponse.json({ error: 'Missing email or planId in webhook payload' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      console.error('[Billing Webhook] SUPABASE_SERVICE_ROLE_KEY missing');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Use Service Role to bypass RLS and securely update the user's row
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log(`[Billing Webhook] ✅ Processing generic payment success for ${email} -> ${planId}`);

    const { error: updateError } = await adminSupabase
      .from('users')
      .update({ subscription_plan: planId })
      .eq('email', email.toLowerCase());

    if (updateError) {
      console.error('[Billing Webhook] Failed to update user plan:', updateError.message);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    console.log(`[Billing Webhook] 🎉 Successfully upgraded ${email} to ${planId}`);
    
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: any) {
    console.error('[Billing Webhook] Critical Error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
