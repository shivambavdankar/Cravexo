'use client';

export default function WhyDifferentSection() {
  const others = [
    'Endless menu scrolling',
    'Same picks every time',
    'No personalization',
    'Generic recommendations',
    'Zero surprise or discovery',
    'Boring, transactional experience',
  ];

  const cravexo = [
    'Craving-based AI discovery',
    'Gets smarter with every order',
    'Deep taste personalization',
    'Mood + preference engine',
    'Mystery surprise mode',
    'Exciting food journey',
  ];

  const uniquePoints = [
    { icon: '🎭', title: 'Craving-Based Discovery', desc: 'Not just what\'s available — what you actually want based on your mood and cravings right now.', color: '#FF6B00' },
    { icon: '🎁', title: 'Mystery Mode', desc: 'Let Mr. Fry surprise you with unexpected food combinations you never thought to try.', color: '#00D4FF' },
    { icon: '🧠', title: 'AI-Guided Intelligence', desc: 'A recommendation engine that evolves based on your real taste preferences over time.', color: '#FF2020' },
    { icon: '⚡', title: 'Fast & Effortless', desc: 'No more decision fatigue. Cravexo surfaces the perfect pick in seconds.', color: '#FFD700' },
    { icon: '🌍', title: 'Built for Explorers', desc: 'Perfect for adventurous eaters and comfort-seekers alike. Cravexo adapts to both.', color: '#9B59B6' },
    { icon: '💎', title: 'Premium Experience', desc: 'Thoughtfully designed to feel like a consumer-tech product, not just an app.', color: '#00FF88' },
  ];

  return (
    <section id="why" style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* bg accent */}
      <div style={{
        position: 'absolute', left: '-150px', top: '50%', transform: 'translateY(-50%)',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(255,107,0,0.07), transparent)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>
            <span>🏆</span> Why We're Different
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '20px' }}>
            More Than Just Another{' '}
            <span className="gradient-text-orange">Food App</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.8 }}>
            Cravexo isn't a delivery app or a menu browser. It's an entirely new category — AI-driven food discovery.
          </p>
        </div>

        {/* Comparison table */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '80px',
        }} className="compare-grid">
          {/* Others */}
          <div style={{
            background: 'rgba(255,32,32,0.04)',
            border: '1px solid rgba(255,32,32,0.15)',
            borderRadius: '20px',
            padding: '32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <span style={{ fontSize: '1.4rem' }}>😴</span>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)' }}>Other Platforms</h3>
            </div>
            {others.map((item) => (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{ color: '#FF2020', fontSize: '1rem' }}>✗</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Cravexo */}
          <div style={{
            background: 'rgba(255,107,0,0.06)',
            border: '1px solid rgba(255,107,0,0.25)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 0 40px rgba(255,107,0,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <span style={{ fontSize: '1.4rem' }}>⚡</span>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#FF6B00' }}>Cravexo</h3>
            </div>
            {cravexo.map((item) => (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{ color: '#00FF88', fontSize: '1rem' }}>✓</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6 unique points */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {uniquePoints.map((p) => (
            <div key={p.title} className="card-glow" style={{ padding: '28px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${p.color}15`, border: `1px solid ${p.color}35`,
                fontSize: '1.4rem', marginBottom: '14px',
              }}>
                {p.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', color: p.color }}>{p.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.7 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) { .compare-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
