export default function VisionSection() {


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



      </div>
    </section>
  );
}
