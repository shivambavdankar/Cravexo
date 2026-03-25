import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/billing/billing.service';
import { PlanId } from '@/lib/billing/billing.config';

export async function POST(req: NextRequest) {
  try {
    const { planId, email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized. Email required.' }, { status: 401 });
    }

    if (!planId) {
      return NextResponse.json({ error: 'Target plan is required.' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Offload the heavy lifting to the agnostic Billing Service
    const sessionRes = await BillingService.createCheckoutSession({
      email,
      planId: planId as PlanId,
      successUrl: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/`,
    });

    if (sessionRes.error || !sessionRes.url) {
      return NextResponse.json({ error: sessionRes.error || 'Failed to initialize checkout.' }, { status: 500 });
    }

    // Return the URL for the client to redirect to
    return NextResponse.json({ url: sessionRes.url }, { status: 200 });

  } catch (err: any) {
    console.error('[Billing API] Checkout error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
