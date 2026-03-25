'use client';
import Image from 'next/image';

export default function FooterSection() {
  return (
    <>
      {/* Final CTA Section */}
      <section style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,107,0,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '0', left: 0, right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,107,0,0.5), rgba(0,212,255,0.5), transparent)',
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="section-label" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <span>🚀</span> The Future is Cravexo
          </div>

          <h2 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '24px',
            letterSpacing: '-0.02em',
          }}>
            Discover the Future of{' '}
            <span className="gradient-text">Cravings</span>
          </h2>

          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.8,
            marginBottom: '48px',
            maxWidth: '580px',
            margin: '0 auto 48px',
          }}>
            Tell Mr. Fry what you're craving and get a personalized food
            recommendation in seconds — no menus, no scrolling, just the perfect pick.
          </p>

          {/* Email waitlist */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '40px',
          }}>
            <div style={{
              display: 'flex',
              gap: '0',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50px',
              padding: '4px 4px 4px 20px',
              flexGrow: 1,
              maxWidth: '420px',
            }}>
              <input
                type="email"
                placeholder="Drop your email — Mr. Fry will remember you"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.9rem',
                  flex: 1,
                  fontFamily: 'Outfit, sans-serif',
                  cursor: 'text',
                }}
              />
              <button
                className="btn-primary"
                id="footer-waitlist-btn"
                style={{ padding: '12px 24px', borderRadius: '50px', whiteSpace: 'nowrap', fontSize: '0.85rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
              >
                Save My Taste ✨
              </button>
            </div>
          </div>

          {/* Social / CTA links */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('mrfry:open'))}
              className="btn-primary"
              id="footer-mrfry-btn"
              style={{ fontSize: '0.85rem', padding: '11px 24px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
            >
              🤖 Talk to Mr. Fry
            </button>
            <a href="#vision" className="btn-secondary" id="footer-follow-btn" style={{ fontSize: '0.85rem', padding: '11px 24px' }}>
              Follow the Journey
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '40px 24px',
        position: 'relative',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
          }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Image src="/logo.jpg" alt="Cravexo" width={36} height={36} style={{ borderRadius: '8px', objectFit: 'cover' }} />
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                Crave<span style={{ color: '#FF6B00' }}>xo</span>
              </span>
            </div>

            {/* Tagline */}
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textAlign: 'center' }}>
              The Future of Food Discovery • Powered by Mr. Fry AI
            </p>

            {/* Nav */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {['Home', 'Concept', 'Mr. Fry', 'Features', 'Vision'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace('. ', '').replace(' ', '')}`}
                  style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FF6B00')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: '28px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
              © 2026 Cravexo. All rights reserved. Built for food lovers everywhere.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#FF6B00', boxShadow: '0 0 8px #FF6B00',
                animation: 'pulse-glow 2s ease-in-out infinite', display: 'inline-block',
              }} />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                Mr. Fry is live • Ask your first craving
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
