'use client';
import Image from 'next/image';

export default function HeroSection() {
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
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(255,32,32,0.04), transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* Floating food emojis */}
      {['🍔', '🍟', '🌮', '🍕', '🤖', '⚡'].map((emoji, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `${15 + i * 13}%`,
          left: i % 2 === 0 ? `${2 + i * 2}%` : undefined,
          right: i % 2 !== 0 ? `${3 + i * 2}%` : undefined,
          fontSize: `${1.2 + (i % 3) * 0.4}rem`,
          opacity: 0.25,
          animation: `float ${5 + i}s ease-in-out infinite ${i * 0.7}s`,
          userSelect: 'none', pointerEvents: 'none',
        }}>
          {emoji}
        </div>
      ))}

      {/* Main content */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '60px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'center',
        width: '100%',
        position: 'relative', zIndex: 2,
      }} className="hero-grid">

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
            The Future of
            <br /><span className="gradient-text">Food</span>
            <br />Discovery Is Here!
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: '1.15rem',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.7,
            maxWidth: '520px',
          }}>
            Cravexo blends AI, cravings, and food discovery into a whole new experience.
            Personalized picks, mystery moments, and a future-forward food journey.
          </p>

          {/* Mr. Fry teaser */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '12px',
            width: 'fit-content',
          }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>Powered by</p>
              <p style={{ fontWeight: 700, color: '#00D4FF', fontSize: '0.95rem' }}>Mr. Fry — Your AI Food Companion</p>
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            <a href="#concept" className="btn-primary" id="hero-explore-cta">
              Explore the Concept
            </a>
            <a href="#mrfry" className="btn-secondary" id="hero-meetmrfry-cta">
              Meet Mr. Fry →
            </a>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '32px', marginTop: '16px', flexWrap: 'wrap' }}>
            {[
              { val: 'AI', label: 'Powered Engine' },
              { val: '∞', label: 'Craving Combos' },
              { val: '0', label: 'Boring Meals' },
            ].map((stat) => (
              <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FF6B00' }}>{stat.val}</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: visual */}
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

          {/* Logo card */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            background: 'rgba(12,14,26,0.8)',
            border: '1px solid rgba(255,107,0,0.3)',
            borderRadius: '24px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 60px rgba(255,107,0,0.2), 0 0 120px rgba(0,212,255,0.1)',
          }} className="float-anim">
            <Image
              src="/logo.jpg"
              alt="Cravexo"
              width={280}
              height={280}
              style={{ borderRadius: '16px', objectFit: 'cover' }}
              priority
            />
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '1.5rem', fontWeight: 900,
                background: 'linear-gradient(135deg, #FFD700, #FF6B00)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>CraveXo</p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>AI Food Discovery Platform</p>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem',
        animation: 'float 2s ease-in-out infinite',
      }}>
        <span>Scroll to explore</span>
        <span style={{ fontSize: '1.2rem' }}>↓</span>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}
