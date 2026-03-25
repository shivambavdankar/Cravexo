'use client';
import Image from 'next/image';

export default function MrFrySection() {
  const traits = [
    { icon: '🧠', label: 'Smart AI Brain', desc: 'Learns your flavor profile with every interaction' },
    { icon: '😄', label: 'Playful Personality', desc: 'Fun, witty, and always ready with the perfect pick' },
    { icon: '🎯', label: 'Precise Picks', desc: 'Zero guesswork — just the right recommendation' },
    { icon: '🌟', label: 'Mystery Mode', desc: 'Surprise you with unexpected craving hits' },
    { icon: '🔥', label: 'Craving Engine', desc: 'Powered by advanced food preference AI' },
    { icon: '💬', label: 'Conversational', desc: 'Chat with Mr. Fry like a knowledgeable food friend' },
  ];

  return (
    <section id="mrfry" style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* bg */}
      <div style={{
        position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
        background: 'radial-gradient(ellipse 70% 50% at 30% 50%, rgba(0,212,255,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
        }} className="mrfry-grid">

          {/* Left: visual spotlight */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Outer glow */}
            <div style={{
              position: 'absolute',
              width: '380px', height: '380px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,212,255,0.15), transparent 70%)',
              filter: 'blur(20px)',
            }} />

            {/* Rotating dashes ring */}
            <div style={{
              position: 'absolute', width: '340px', height: '340px',
              borderRadius: '50%',
              border: '2px dashed rgba(0,212,255,0.2)',
              animation: 'spin-slow 15s linear infinite',
            }} />
            <div style={{
              position: 'absolute', width: '280px', height: '280px',
              borderRadius: '50%',
              border: '1px dashed rgba(255,107,0,0.2)',
              animation: 'spin-slow 10s linear infinite reverse',
            }} />

            {/* Mr Fry card */}
            <div style={{
              position: 'relative', zIndex: 2,
              background: 'rgba(12,14,26,0.9)',
              border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: '24px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 60px rgba(0,212,255,0.15)',
              maxWidth: '300px',
            }} className="float-anim">
              <Image
                src="/mrfry.png"
                alt="Mr. Fry AI Mascot"
                width={200}
                height={200}
                style={{ objectFit: 'contain', borderRadius: '16px' }}
              />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 800, fontSize: '1.3rem', color: '#00D4FF' }}>Mr. Fry</p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                  Your AI Food Companion
                </p>
              </div>

              {/* Speech bubble */}
              <div style={{
                background: 'rgba(0,212,255,0.08)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.82rem',
                color: 'rgba(255,255,255,0.7)',
                fontStyle: 'italic',
                textAlign: 'center',
              }}>
                "Hey! Tell me what you're craving and I'll find your perfect match! 🍔"
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#00D4FF', boxShadow: '0 0 10px #00D4FF',
                  animation: 'pulse-glow 1.5s ease-in-out infinite', display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>AI Online</span>
              </div>
            </div>
          </div>

          {/* Right: content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <div className="section-label" style={{ width: 'fit-content' }}>
                <span>🤖</span> Meet the AI
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '20px' }}>
                Say Hello to{' '}
                <span className="gradient-text-blue">Mr. Fry</span>
              </h2>

              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: '1rem', marginBottom: '20px' }}>
                Mr. Fry is the heart of Cravexo — a smart, playful AI companion built to understand your 
                food cravings at a deeper level. He doesn't just recommend food; he learns your tastes,
                reads your mood, and guides you through a personalized food journey every single time.
              </p>

              {/* Talk to Mr. Fry button — centered, with animated Mr. Fry image */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('mrfry:open'))}
                className="btn-primary"
                style={{
                  width: 'fit-content',
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  padding: '8px 100px',
                  borderRadius: '999px',
                  boxShadow: '0 0 30px rgba(255,107,0,0.3), 0 0 60px rgba(255,107,0,0.1)',
                  textAlign: 'center',
                }}
              >
                {/* Animated Mr. Fry image with glowing pulse ring */}
                <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                  {/* Spinning glow ring */}
                  <div style={{
                    position: 'absolute', inset: '-5px',
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, #FF6B00, #FF2020, #00D4FF, #FF6B00)',
                    animation: 'mrfry-spin 2.5s linear infinite',
                    opacity: 0.8,
                  }} />
                  {/* Mask so ring looks like a border */}
                  <div style={{ position: 'absolute', inset: '2px', borderRadius: '50%', background: 'rgba(7,8,16,0.3)', zIndex: 1 }} />
                  <Image
                    src="/mrfry.png"
                    alt="Mr. Fry"
                    width={52}
                    height={52}
                    style={{
                      borderRadius: '50%',
                      objectFit: 'cover',
                      position: 'relative',
                      zIndex: 2,
                      animation: 'mrfry-float 3s ease-in-out infinite',
                    }}
                  />
                </div>
                <span style={{
                  letterSpacing: '0.12em',
                  color: '#fff',
                  animation: 'btn-glow-pulse 1.8s ease-in-out infinite',
                  display: 'inline-block',
                }}>
                  Talk to Mr. Fry
                </span>
              </button>
              <style>{`
                @keyframes mrfry-spin {
                  from { transform: rotate(0deg); }
                  to   { transform: rotate(360deg); }
                }
                @keyframes mrfry-float {
                  0%, 100% { transform: translateY(0px); }
                  50%       { transform: translateY(-3px); }
                }
                @keyframes btn-glow-pulse {
                  0%, 100% { text-shadow: 0 0 8px rgba(255,107,0,0.4), 0 0 20px rgba(255,107,0,0.2); }
                  50%       { text-shadow: 0 0 16px rgba(255,200,0,0.9), 0 0 40px rgba(255,107,0,0.5), 0 0 60px rgba(255,32,32,0.2); }
                }
              `}</style>
            </div>

            {/* Traits grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {traits.map((t) => (
                <div key={t.label} style={{
                  background: 'rgba(0,212,255,0.04)',
                  border: '1px solid rgba(0,212,255,0.12)',
                  borderRadius: '14px',
                  padding: '16px',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,255,0.3)';
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,212,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,255,0.12)';
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,212,255,0.04)';
                  }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{t.icon}</div>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>{t.label}</p>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{t.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mrfry-grid { grid-template-columns: 1fr !important; gap: 50px !important; }
          .mrfry-grid > :first-child { order: 2; }
        }
      `}</style>
    </section>
  );
}
