'use client';
import Image from 'next/image';
import { useAccount } from '../context/AccountContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PERKS = [
  { icon: '🍔', label: 'Unlimited Mr. Fry recommendations' },
  { icon: '🧠', label: 'Personalized memory across sessions' },
  { icon: '🔗', label: 'Live links across all delivery platforms' },
  { icon: '⚡', label: 'Instant results, zero waiting' },
];

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { user } = useAccount();

  if (!isOpen) return null;

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,.8)',
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn .2s ease',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(460px, 100vw)', zIndex: 2001,
        background: 'rgba(7,8,16,.99)',
        borderLeft: '1px solid rgba(255,107,0,.2)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight .35s cubic-bezier(.22,1,.36,1)',
        boxShadow: '-20px 0 80px rgba(0,0,0,.7)',
        overflowY: 'auto',
      }}>

        {/* Header bar */}
        <div style={{
          padding: '24px 24px 20px',
          borderBottom: '1px solid rgba(255,255,255,.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/logo.jpg" alt="Cravexo" width={30} height={30} style={{ borderRadius: '8px', objectFit: 'cover' }} />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
              Crave<span style={{ color: '#FF6B00' }}>xo</span>
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,.05)', border: 'none',
              color: 'rgba(255,255,255,.5)', width: '32px', height: '32px',
              borderRadius: '50%', cursor: 'pointer', fontSize: '1rem',
            }}
          >✕</button>
        </div>

        <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Main Access Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,107,0,.12), rgba(255,32,32,.06))',
            border: '1px solid rgba(255,107,0,.3)',
            borderRadius: '20px',
            padding: '28px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Glow accent */}
            <div style={{
              position: 'absolute', top: '-40px', right: '-40px',
              width: '140px', height: '140px',
              background: 'radial-gradient(circle, rgba(255,107,0,.2) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.6rem' }}>🔓</span>
              <span style={{
                fontSize: '.68rem', fontWeight: 800, letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: '#FF6B00',
                background: 'rgba(255,107,0,.12)',
                border: '1px solid rgba(255,107,0,.3)',
                padding: '3px 10px', borderRadius: '20px',
              }}>
                Fully Unlocked
              </span>
            </div>

            <h2 style={{
              fontSize: '1.55rem', fontWeight: 900, color: '#fff',
              lineHeight: 1.2, marginBottom: '10px',
            }}>
              Unlimited Mr. Fry access
            </h2>
            <p style={{
              fontSize: '.93rem', color: 'rgba(255,255,255,.6)',
              lineHeight: 1.65, marginBottom: '0',
            }}>
              Hey {firstName}! Explore freely and discover your next meal with zero limits — no counters, no caps, no friction.
            </p>
          </div>

          {/* Perks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{
              fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,.35)',
              marginBottom: '4px',
            }}>
              What&apos;s included
            </p>
            {PERKS.map(({ icon, label }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'rgba(255,255,255,.03)',
                border: '1px solid rgba(255,255,255,.07)',
                borderRadius: '12px',
                padding: '14px 16px',
              }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: '.88rem', color: 'rgba(255,255,255,.75)', fontWeight: 500 }}>{label}</span>
                <span style={{ marginLeft: 'auto', color: '#00D48A', fontSize: '.85rem', fontWeight: 700 }}>✓</span>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '15px',
              background: 'linear-gradient(135deg, #FF6B00, #FF2020)',
              border: 'none', borderRadius: '14px',
              color: '#fff', fontWeight: 800, fontSize: '1rem',
              cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              boxShadow: '0 8px 30px rgba(255,107,0,.3)',
              transition: 'opacity .2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Start Exploring with Mr. Fry →
          </button>

        </div>
      </div>
    </>
  );
}
