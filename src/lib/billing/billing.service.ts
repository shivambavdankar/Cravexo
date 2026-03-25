import { PlanId, PLANS } from '@/lib/billing/billing.config';

export interface CheckoutRequest {
  email: string;
  planId: PlanId;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  url: string; // The URL to redirect the user to (Stripe Checkout, Razorpay hosted page, or placeholder)
  error?: string;
}

/**
 * A provider-agnostic billing service.
 * Currently configured to return a safe placeholder checkout flow.
 * In the future, swap the implementation inside `createCheckoutSession` 
 * to use `stripe.checkout.sessions.create` or Razorpay equivalents.
 */
export const BillingService = {
  
  async createCheckoutSession(req: CheckoutRequest): Promise<CheckoutResponse> {
    const plan = PLANS[req.planId];
    if (!plan || plan.priceId === null) {
      return { url: '', error: 'Invalid plan selected for checkout.' };
    }

    console.log(`[BillingService] Initiating simulated checkout for ${req.email} -> ${plan.name} (${plan.priceId})`);

    // Simulated network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // For production Stripe/Razorpay, you would return the real hosted checkout URL here:
    // const session = await stripe.checkout.sessions.create({ ... })
    // return { url: session.url };

    // Placeholder safe flow: Redirect to our internal placeholder page
    const placeholderUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    placeholderUrl.pathname = '/billing/placeholder';
    placeholderUrl.searchParams.set('plan', req.planId);
    placeholderUrl.searchParams.set('email', req.email);

    return { url: placeholderUrl.toString() };
  }

};
