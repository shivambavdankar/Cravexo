'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { PLANS, PlanId } from '@/app/context/AccountContext';
import Image from 'next/image';

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') as PlanId;
  const email = searchParams.get('email');

  const plan = planId ? PLANS[planId] : undefined;
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const simulatePaymentSuccess = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/billing/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'checkout.session.completed',
          data: { email, planId },
        })
      });
      
      if (!res.ok) throw new Error('Webhook processing failed.');
      
      // Automatically navigate back. The AccountContext INITIAL_SESSION/reload will fetch the upgraded plan.
      window.location.href = '/'; 
    } catch (err: any) {
      setErrorMsg(err.message || 'Simulation failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07080F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,.03)', border: `1px solid ${plan?.color || 'rgba(255,255,255,.1)'}`, borderRadius: '24px', padding: '40px 32px', textAlign: 'center' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Image src="/logo.jpg" alt="Cravexo" width={64} height={64} style={{ borderRadius: '16px', objectFit: 'cover' }} />
        </div>

        <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px' }}>
          Payment Integration <br/><span style={{ color: '#FFD700' }}>Coming Soon</span>
        </h1>

        <p style={{ color: 'rgba(255,255,255,.6)', lineHeight: 1.6, marginBottom: '32px' }}>
          We are currently setting up our secure payment processors. 
          {plan && ` You selected the `}
          {plan && <strong style={{ color: plan.color }}>{plan.name}</strong>}
          {plan && ` plan.`}
        </p>

        <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: '16px', padding: '20px', marginBottom: '32px', textAlign: 'left' }}>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '8px' }}>Test Payload Summary</p>
          <div style={{ fontFamily: 'monospace', fontSize: '.85rem', color: '#00D4FF' }}>
            <div>Plan ID: {planId || 'N/A'}</div>
            <div>Price ID: {plan?.priceId || 'N/A'}</div>
            <div>Account: {email || 'N/A'}</div>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(255,32,32,.08)', border: '1px solid rgba(255,32,32,.2)', padding: '12px', borderRadius: '12px', color: '#FF6B6B', fontSize: '.9rem', marginBottom: '24px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <button 
          onClick={simulatePaymentSuccess}
          disabled={loading}
          style={{ width: '100%', padding: '16px', background: `linear-gradient(135deg, ${plan?.color || '#FFD700'}, #FF6B00)`, border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, fontSize: '1.05rem', cursor: loading ? 'wait' : 'pointer', transition: 'all .2s', marginBottom: '16px', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Processing Webhook...' : 'Simulate Payment Success'}
        </button>

        <button 
          onClick={() => router.push('/')}
          style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'all .2s' }}>
          Return to Cravexo
        </button>
      </div>
    </div>
  );
}

export default function BillingPlaceholderPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07080F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading Payment Gateway...</div>}>
      <BillingContent />
    </Suspense>
  );
}
