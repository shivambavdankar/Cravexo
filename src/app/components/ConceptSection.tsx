export default function ConceptSection() {
  const pillars = [
    {
      icon: '🧠',
      title: 'AI-Powered Brain',
      desc: 'Our intelligent engine reads your cravings, mood, and habits to deliver spot-on food recommendations every time.',
      color: '#00D4FF',
    },
    {
      icon: '🎭',
      title: 'Mood-Based Picks',
      desc: 'Feeling adventurous? Comfort-seeking? Cravexo adapts to your emotional state and suggests the perfect food match.',
      color: '#FF6B00',
    },
    {
      icon: '🎁',
      title: 'Mystery Discovery',
      desc: 'Unlock surprise food experiences and mystery combos you never knew you needed — until now.',
      color: '#FF2020',
    },
    {
      icon: '✨',
      title: 'Personalized Journey',
      desc: 'The more you use Cravexo, the smarter it gets. Your taste profile evolves with every craving satisfied.',
      color: '#FFD700',
    },
  ];

  return (
    <section id="concept" style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* bg accent */}
      <div style={{
        position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
        width: '100%', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,107,0,0.4), rgba(0,212,255,0.4), transparent)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', right: '-100px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(255,107,0,0.08), transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>
            <span>💡</span> About the Concept
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '20px' }}>
            What Is <span className="gradient-text">Cravexo</span>?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.8 }}>
            Cravexo is an AI-powered food discovery platform that helps you find the perfect food based on
            your cravings, mood, personality, and preferences — introducing a smarter, more exciting way to
            interact with food.
          </p>
        </div>

        {/* Big concept visual */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,0,0.08) 0%, rgba(12,14,26,0.9) 50%, rgba(0,212,255,0.06) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '28px',
          padding: '48px',
          marginBottom: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-50px', left: '-50px',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(255,107,0,0.15), transparent)',
            borderRadius: '50%', filter: 'blur(30px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-50px', right: '-50px',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.12), transparent)',
            borderRadius: '50%', filter: 'blur(30px)',
          }} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            alignItems: 'center',
          }}>
            {[
              { label: 'Your Cravings', icon: '🤤', color: '#FF6B00' },
              { label: '+', icon: null, color: '#fff', large: true },
              { label: 'AI Magic', icon: '🧠', color: '#00D4FF' },
              { label: '+', icon: null, color: '#fff', large: true },
              { label: 'Food', icon: '🍔', color: '#FFD700' },
              { label: '=', icon: null, color: '#fff', large: true },
              { label: 'Cravexo', icon: '⚡', color: '#FF2020' },
            ].map((item, i) => (
              item.large ? (
                <div key={i} style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: item.color, opacity: 0.5 }}>
                  {item.label}
                </div>
              ) : (
                <div key={i} style={{
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${item.color}30`,
                  borderRadius: '16px',
                  padding: '24px 16px',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{item.icon}</div>
                  <p style={{ fontWeight: 700, color: item.color, fontSize: '0.95rem' }}>{item.label}</p>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Four pillars */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}>
          {pillars.map((p) => (
            <div key={p.title} className="card-glow" style={{ padding: '32px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: `${p.color}18`,
                border: `1px solid ${p.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', marginBottom: '16px',
              }}>
                {p.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '10px', color: p.color }}>{p.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontSize: '0.9rem' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
