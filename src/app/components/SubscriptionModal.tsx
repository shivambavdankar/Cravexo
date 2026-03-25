import { useAccount, PLANS, PlanId } from '../context/AccountContext';
import { useState } from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { user } = useAccount();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentPlan = (user?.subscription_plan ?? 'lite') as PlanId;
  const used = user?.interactions_this_month ?? 0;
  const planDef = PLANS[currentPlan];
  const limit = planDef.limit;
  const remaining = limit === null ? null : Math.max(0, limit - used);
  const pct = limit === null ? 0 : Math.min(100, (used / limit) * 100);

  const planOrder: PlanId[] = ['lite', 'dedicated', 'fam'];

  const handleUpgrade = async (targetPlan: PlanId) => {
    try {
      setLoadingPlan(targetPlan);
      setErrorMsg('');

      // Free plans do not have checkout sessions. They invoke a direct cancellation/downgrade.
      if (targetPlan === 'lite') {
        const res = await fetch('/api/billing/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user?.email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to downgrade plan.');
        
        window.location.reload(); // Instantly visually confirm for the user
        return;
      }

      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: targetPlan, email: user?.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize checkout');
      
      // Redirect to the checkout provider (or placeholder)
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred. Please try again.');
      setLoadingPlan(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(6px)', animation: 'fadeIn .2s ease' }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(500px, 100vw)', zIndex: 2001,
        background: 'rgba(7,8,16,.99)',
        borderLeft: '1px solid rgba(255,107,0,.2)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight .35s cubic-bezier(.22,1,.36,1)',
        boxShadow: '-20px 0 80px rgba(0,0,0,.7)',
        overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '4px' }}>Subscription</h2>
            <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.4)' }}>
              Current plan: <span style={{ color: planDef.color, fontWeight: 700 }}>{planDef.name}</span>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: 'none', color: 'rgba(255,255,255,.5)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {errorMsg && (
            <div style={{ background: 'rgba(255,32,32,.08)', border: '1px solid rgba(255,32,32,.2)', padding: '12px 16px', borderRadius: '12px', color: '#FF6B6B', fontSize: '.85rem' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Usage Summary */}
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '16px', padding: '20px' }}>
            <p style={{ fontSize: '.75rem', fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '12px' }}>This Month&apos;s Usage</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{used}</span>
              <span style={{ color: 'rgba(255,255,255,.4)', fontSize: '.9rem' }}>
                {limit === null ? 'unlimited interactions' : `of ${limit} interactions`}
              </span>
            </div>
            {limit !== null && (
              <>
                <div style={{ height: '6px', background: 'rgba(255,255,255,.07)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#FF2020' : planDef.color, borderRadius: '999px', transition: 'width .5s ease' }} />
                </div>
                <p style={{ fontSize: '.78rem', color: remaining === 0 ? '#FF6B6B' : 'rgba(255,255,255,.4)', marginTop: '8px' }}>
                  {remaining === 0 ? '⚠️ Limit reached — upgrade to continue' : `${remaining} interaction${remaining === 1 ? '' : 's'} remaining this month`}
                </p>
              </>
            )}
          </div>

          {/* Plan Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {planOrder.map(pid => {
              const p = PLANS[pid];
              const isCurrent = pid === currentPlan;
              const isUpgrade = planOrder.indexOf(pid) > planOrder.indexOf(currentPlan);
              return (
                <div key={pid} style={{
                  background: isCurrent ? `rgba(${pid === 'fam' ? '255,107,0' : pid === 'dedicated' ? '0,212,255' : '136,136,136'},.08)` : 'rgba(255,255,255,.02)',
                  border: `1px solid ${isCurrent ? p.color : 'rgba(255,255,255,.07)'}`,
                  borderRadius: '16px', padding: '20px',
                  position: 'relative', transition: 'border-color .2s',
                }}>
                  {isCurrent && (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '.65rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: p.color, background: `rgba(${pid === 'fam' ? '255,107,0' : pid === 'dedicated' ? '0,212,255' : '136,136,136'},.15)`, border: `1px solid ${p.color}`, padding: '3px 10px', borderRadius: '20px' }}>
                      Current
                    </span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{p.name}</h3>
                      <p style={{ fontSize: '1.3rem', fontWeight: 900, color: p.color }}>
                        {p.price}
                        {pid !== 'lite' && <span style={{ fontSize: '.75rem', fontWeight: 400, color: 'rgba(255,255,255,.4)', marginLeft: '4px' }}></span>}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isCurrent ? '0' : '16px' }}>
                    <span style={{ color: p.color, fontSize: '1rem' }}>🍔</span>
                    <span style={{ fontSize: '.88rem', color: 'rgba(255,255,255,.7)' }}>
                      {p.limit === null ? 'Unlimited Mr. Fry interactions per month' : `${p.limit} Mr. Fry interactions per month`}
                    </span>
                  </div>

                  {!isCurrent && (
                    <button 
                      onClick={() => handleUpgrade(pid)}
                      disabled={loadingPlan !== null}
                      style={{
                        width: '100%', marginTop: '12px', padding: '12px',
                        background: isUpgrade ? `linear-gradient(135deg, ${p.color}22, ${p.color}11)` : 'rgba(255,255,255,.05)',
                        border: isUpgrade ? `1px solid ${p.color}66` : '1px solid rgba(255,255,255,.15)',
                        borderRadius: '10px', color: isUpgrade ? p.color : 'rgba(255,255,255,.7)', fontWeight: 700,
                        fontSize: '.88rem', cursor: loadingPlan !== null ? 'wait' : 'pointer', fontFamily: 'Outfit, sans-serif',
                        opacity: loadingPlan && loadingPlan !== pid ? 0.5 : 1,
                        transition: 'all .2s'
                      }}>
                      {loadingPlan === pid ? 'Initializing...' : (isUpgrade ? `Upgrade to ${p.name}` : `Downgrade to ${p.name}`)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.25)', textAlign: 'center', lineHeight: 1.6 }}>
            Plan upgrades and billing will be available in the next release. Existing usage resets on the 1st of each month.
          </p>
        </div>
      </div>
    </>
  );
}
