export default function VisionSection() {
  const milestones = [
    { phase: 'Phase 1', title: 'Brand Launch', desc: 'Introducing Cravexo to the world. Building the community.', active: true },
    { phase: 'Phase 2', title: 'Mr. Fry Beta', desc: 'First AI interactions. Early adopter craving personalization.', active: false },
    { phase: 'Phase 3', title: 'Full Platform', desc: 'Complete AI-powered food discovery experience.', active: false },
    { phase: 'Phase 4', title: 'Ecosystem', desc: 'Partnerships, integrations, and the future of food discovery.', active: false },
  ];

  return (
    <section id="vision" style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Bg radial */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(255,107,0,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>
            <span>🌍</span> Brand Vision
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '20px' }}>
            Reimagining How the World{' '}
            <span className="gradient-text">Discovers Food</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.6)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.9 }}>
            Cravexo is reimagining how people discover and experience food by combining AI, personalization,
            food emotion, and digital engagement — turning every meal into a moment of discovery.
          </p>
        </div>

        {/* Vision statement */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,0,0.1) 0%, rgba(12,14,26,0.9) 50%, rgba(0,212,255,0.06) 100%)',
          border: '1px solid rgba(255,107,0,0.2)',
          borderRadius: '28px',
          padding: '60px 48px',
          marginBottom: '80px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative quote marks */}
          <div style={{
            position: 'absolute', top: '20px', left: '30px',
            fontSize: '8rem', fontWeight: 900, lineHeight: 1,
            color: 'rgba(255,107,0,0.08)',
            fontFamily: 'serif',
          }}>"</div>

          <p style={{
            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
            fontWeight: 600,
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.85)',
            maxWidth: '780px',
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative', zIndex: 1,
          }}>
            We believe food should be{' '}
            <span style={{ color: '#FF6B00' }}>personalized</span>,{' '}
            <span style={{ color: '#00D4FF' }}>surprising</span>, and{' '}
            <span style={{ color: '#FFD700' }}>exciting</span> — not a mindless scroll
            through an endless menu. Cravexo is the bridge between your cravings and the
            perfect food experience, powered by the magic of AI.
          </p>
        </div>

        {/* Three pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '80px' }}>
          {[
            {
              icon: '🤖',
              title: 'AI at the Core',
              desc: 'Every recommendation, every pick, every surprise — powered by intelligent algorithms that learn and grow with you.',
              color: '#00D4FF',
            },
            {
              icon: '❤️',
              title: 'Food Emotion',
              desc: 'We connect the emotional experience of craving with the thrill of discovery. Food is feeling, and Cravexo understands that.',
              color: '#FF2020',
            },
            {
              icon: '🌱',
              title: 'Future Forward',
              desc: 'Cravexo is building the infrastructure for the future of food discovery, one craving at a time.',
              color: '#00FF88',
            },
          ].map((p) => (
            <div key={p.title} className="card-glow" style={{ padding: '36px', textAlign: 'center' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: `${p.color}12`,
                border: `2px solid ${p.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', margin: '0 auto 20px',
              }}>
                {p.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '12px', color: p.color }}>{p.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.7 }}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Roadmap */}
        <div style={{ marginBottom: '0' }}>
          <h3 style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.3rem', marginBottom: '40px', color: 'rgba(255,255,255,0.7)' }}>
            The Road Ahead
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {milestones.map((m) => (
              <div key={m.phase} style={{
                background: m.active ? 'rgba(255,107,0,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${m.active ? 'rgba(255,107,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '16px',
                padding: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{
                    padding: '3px 10px',
                    background: m.active ? 'rgba(255,107,0,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${m.active ? 'rgba(255,107,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '20px',
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
                    color: m.active ? '#FF6B00' : 'rgba(255,255,255,0.4)',
                  }}>{m.phase}</span>
                  {m.active && (
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#00FF88', boxShadow: '0 0 8px #00FF88',
                      display: 'inline-block',
                      animation: 'pulse-glow 1.5s ease-in-out infinite',
                    }} />
                  )}
                </div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', color: m.active ? '#fff' : 'rgba(255,255,255,0.4)' }}>{m.title}</p>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
