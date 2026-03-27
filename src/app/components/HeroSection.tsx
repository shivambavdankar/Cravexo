'use client';
import Image from 'next/image';

export default function HeroSection() {
  const openMrFry = () => window.dispatchEvent(new CustomEvent('mrfry:open'));

  return (
    <section
      id="home"
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        paddingTop: '72px',
      }}
    >
      {/* Background effects */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,107,0,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(0,212,255,0.08) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(255,32,32,0.06) 0%, transparent 60%)',
      }} />

      {/* Animated orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '5%',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(255,107,0,0.15), transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)',
      }} className="drift-anim" />
      <div style={{
        position: 'absolute', bottom: '20%', right: '5%',
        width: '250px', height: '250px',
        background: 'radial-gradient(circle, rgba(0,212,255,0.12), transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)',
      }} className="float-anim-delay" />

      {/* Floating food emojis */}
      {['🍔', '🍟', '🌮', '🍕', '⚡'].map((emoji, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `${15 + i * 15}%`,
          left: i % 2 === 0 ? `${2 + i * 2}%` : undefined,
          right: i % 2 !== 0 ? `${3 + i * 2}%` : undefined,
          fontSize: `${1.1 + (i % 3) * 0.3}rem`,
          opacity: 0.2,
          animation: `float ${5 + i}s ease-in-out infinite ${i * 0.7}s`,
          userSelect: 'none', pointerEvents: 'none',
        }}>
          {emoji}
        </div>
      ))}

      {/* Main content */}
      <div
        style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '60px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          width: '100%',
          position: 'relative', zIndex: 2,
        }}
        className="hero-grid"
      >

        {/* Left content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Badge */}
          <div className="section-label" style={{ width: 'fit-content' }}>
            <span>🚀</span> AI-Powered Food Discovery
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.6rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            The Future of<br />
            <span className="gradient-text">Food</span><br />
            Discovery Is Here!
          </h1>

          {/* Tight subheadline */}
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.65,
            maxWidth: '480px',
          }}>
            Tell Mr. Fry what you&#39;re craving. Get personalized food picks from spots near you in seconds.
          </p>

          {/* PRIMARY CTA — Meet Mr. Fry */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '4px' }}>
            <button
              id="hero-meetmrfry-cta"
              onClick={openMrFry}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #FF6B00, #FF2020)',
                border: 'none', borderRadius: '14px',
                color: '#fff', fontWeight: 800, fontSize: '1.05rem',
                cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 8px 32px rgba(255,107,0,0.45)',
                transition: 'transform .18s, box-shadow .18s',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,107,0,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,107,0,0.45)'; }}
            >
              <span style={{ fontSize: '1.2rem' }}>🍟</span>
              Talk to Mr. Fry
            </button>

            {/* SECONDARY CTA — Explore */}
            <a
              href="#concept"
              id="hero-explore-cta"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '16px 24px',
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.15)',
                borderRadius: '14px',
                color: 'rgba(255,255,255,.65)', fontWeight: 600, fontSize: '0.95rem',
                textDecoration: 'none', fontFamily: 'Outfit, sans-serif',
                transition: 'border-color .18s, color .18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.3)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'; e.currentTarget.style.color = 'rgba(255,255,255,.65)'; }}
            >
              Explore the Concept
            </a>
          </div>

          {/* Social proof row */}
          <div style={{ display: 'flex', gap: '28px', marginTop: '8px', flexWrap: 'wrap' }}>
            {[
              { val: 'AI', label: 'Powered Engine' },
              { val: '∞', label: 'Craving Combos' },
              { val: '0', label: 'Boring Meals' },
            ].map((stat) => (
              <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FF6B00' }}>{stat.val}</span>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Mr. Fry interactive card */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}>
          {/* Glow ring */}
          <div style={{
            position: 'absolute',
            width: '420px', height: '420px',
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, rgba(255,107,0,0.3), rgba(0,212,255,0.3), rgba(255,32,32,0.2), rgba(255,107,0,0.3))',
            filter: 'blur(40px)',
            animation: 'spin-slow 10s linear infinite',
          }} />

          {/* Clickable Mr. Fry Card */}
          <button
            onClick={openMrFry}
            className="float-anim mrfry-hero-card"
            style={{
              position: 'relative', zIndex: 2,
              background: 'rgba(12,14,26,0.85)',
              border: '1px solid rgba(255,107,0,0.4)',
              borderRadius: '24px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 60px rgba(255,107,0,0.25), 0 0 120px rgba(0,212,255,0.1)',
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
              transition: 'border-color .2s, box-shadow .2s, transform .2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,107,0,0.8)';
              e.currentTarget.style.boxShadow = '0 0 80px rgba(255,107,0,0.45), 0 0 160px rgba(0,212,255,0.15)';
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,107,0,0.4)';
              e.currentTarget.style.boxShadow = '0 0 60px rgba(255,107,0,0.25), 0 0 120px rgba(0,212,255,0.1)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            {/* Mr. Fry avatar */}
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <div style={{
                position: 'absolute', inset: '-6px', borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #FF6B00, #FF2020, #00D4FF, #FF6B00)',
                animation: 'spin-slow 3s linear infinite',
              }} />
              <Image
                src="/mrfry.png"
                alt="Mr. Fry"
                fill
                style={{ borderRadius: '50%', objectFit: 'cover', border: '3px solid #07080F' }}
                priority
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '1.3rem', fontWeight: 900,
                background: 'linear-gradient(135deg, #FF6B00, #FFD700)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                marginBottom: '4px',
              }}>Mr. Fry</p>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '14px' }}>Your AI Food Companion</p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, rgba(255,107,0,0.2), rgba(255,32,32,0.1))',
                border: '1px solid rgba(255,107,0,0.4)',
                borderRadius: '30px',
                padding: '8px 18px',
                color: '#FF6B00', fontWeight: 700, fontSize: '0.85rem',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00FF88', display: 'inline-block', boxShadow: '0 0 6px #00FF88' }} />
                Tap to start chatting
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem',
        animation: 'float 2s ease-in-out infinite',
        pointerEvents: 'none',
      }}>
        <span>Scroll to explore</span>
        <span style={{ fontSize: '1rem' }}>↓</span>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .mrfry-hero-card { width: 100% !important; max-width: 340px !important; }
        }
      `}</style>
    </section>
  );
}
