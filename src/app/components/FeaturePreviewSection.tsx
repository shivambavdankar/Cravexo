'use client';
import { useState } from 'react';

const features = [
  {
    id: 'mood',
    icon: '🎭',
    title: 'Mood-Based Picks',
    tag: 'AI Feature',
    tagColor: '#FF6B00',
    desc: 'Tell Cravexo how you\'re feeling and our AI maps your emotional state to the perfect food experience. Happy, tired, adventurous — we\'ve got you covered.',
    preview: ['🌶️ Spicy', '🧀 Cheesy', '🍗 Crispy', '🌯 Wrap'],
  },
  {
    id: 'mystery',
    icon: '🎁',
    title: 'Mystery Food Mode',
    tag: 'Surprise',
    tagColor: '#00D4FF',
    desc: 'Feeling bold? Let Mr. Fry take the wheel. Mystery Mode unlocks curated surprise picks based on your hidden taste potential.',
    preview: ['❓ Mystery Box', '🎲 Random Pick', '🌟 Hidden Gem', '⚡ Wild Card'],
  },
  {
    id: 'craving',
    icon: '🤤',
    title: 'Craving Personality',
    tag: 'Personalization',
    tagColor: '#FF2020',
    desc: 'Your craving DNA is unique. Cravexo builds a taste fingerprint from your preferences to deliver increasingly accurate and delightful picks.',
    preview: ['🍔 Burger Lover', '🌮 Taco Fanatic', '🍟 Fry Addict', '🍕 Classic'],
  },
  {
    id: 'combo',
    icon: '🔮',
    title: 'Combo Discovery',
    tag: 'AI Combos',
    tagColor: '#FFD700',
    desc: 'Mr. Fry engineers unexpected combo pairings that elevate your meal from ordinary to unforgettable. Food matchmaking, powered by AI.',
    preview: ['🍔 + 🌶️ = 🔥', '🍟 + 🧀 = ✨', '🌮 + 🥤 = 💯', '🍕 + 🍗 = 🌟'],
  },
  {
    id: 'taste',
    icon: '🧬',
    title: 'AI Taste Understanding',
    tag: 'Deep Learning',
    tagColor: '#9B59B6',
    desc: 'Advanced preference modeling that goes beyond simple ratings. Cravexo understands what you like and why you like it.',
    preview: ['📊 Taste Profile', '🎯 Precision AI', '🔄 Always Learning', '💡 Smart Picks'],
  },
  {
    id: 'explore',
    icon: '🚀',
    title: 'Curated Experiences',
    tag: 'Premium',
    tagColor: '#00FF88',
    desc: 'Stop endlessly scrolling menus. Cravexo curates food experiences designed around you, not the menu.',
    preview: ['🌃 Night Craver', '☕ Morning Mode', '🏃 On the Go', '🥳 Party Pack'],
  },
];

export default function FeaturePreviewSection() {
  const [active, setActive] = useState(features[0].id);
  const activeFeature = features.find((f) => f.id === active)!;

  return (
    <section id="features" style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '50%', right: '-100px', transform: 'translateY(-50%)',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(0,212,255,0.07), transparent)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>
            <span>🔬</span> Platform Preview
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '20px' }}>
            A Taste of What's <span className="gradient-text">Coming</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.8 }}>
            Explore a sneak peek at the features that will redefine your food discovery experience.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '32px', alignItems: 'start' }} className="features-grid">
          {/* Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {features.map((f) => (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px 20px',
                  background: active === f.id ? `${f.tagColor}12` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active === f.id ? f.tagColor + '40' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: active === f.id ? '#fff' : 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>{f.title}</p>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    color: f.tagColor, textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{f.tag}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Feature detail */}
          <div style={{
            background: 'rgba(12,14,26,0.9)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '24px',
            padding: '40px',
            position: 'sticky', top: '100px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: `${activeFeature.tagColor}15`,
                border: `1px solid ${activeFeature.tagColor}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
              }}>
                {activeFeature.icon}
              </div>
              <div>
                <span style={{
                  display: 'inline-block',
                  background: `${activeFeature.tagColor}20`,
                  color: activeFeature.tagColor,
                  border: `1px solid ${activeFeature.tagColor}40`,
                  padding: '3px 12px', borderRadius: '20px',
                  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  marginBottom: '6px',
                }}>{activeFeature.tag}</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{activeFeature.title}</h3>
              </div>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: '28px' }}>{activeFeature.desc}</p>

            {/* Preview tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
              {activeFeature.preview.map((tag) => (
                <span key={tag} style={{
                  padding: '8px 16px',
                  background: `${activeFeature.tagColor}10`,
                  border: `1px solid ${activeFeature.tagColor}25`,
                  borderRadius: '50px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.75)',
                }}>{tag}</span>
              ))}
            </div>

            {/* Fake progress bar */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Platform development</span>
                <span style={{ fontSize: '0.75rem', color: activeFeature.tagColor }}>Coming Soon</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: '68%',
                  background: `linear-gradient(90deg, ${activeFeature.tagColor}, ${activeFeature.tagColor}88)`,
                  borderRadius: '4px',
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
