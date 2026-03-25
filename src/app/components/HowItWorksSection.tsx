export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: '🤤',
      title: 'Tell Us Your Craving',
      desc: "Share what you're feeling — a mood, a flavor, a vibe. Even just a feeling works.",
      color: '#FF6B00',
    },
    {
      number: '02',
      icon: '🧠',
      title: 'Mr. Fry Reads Your Vibe',
      desc: 'Our AI companion analyzes your mood, preferences, and history to understand exactly what you need.',
      color: '#00D4FF',
    },
    {
      number: '03',
      icon: '🎯',
      title: 'Get Personalized Picks',
      desc: 'Receive curated food recommendations tailored specifically to you — including mystery surprises.',
      color: '#FF2020',
    },
    {
      number: '04',
      icon: '🚀',
      title: 'Discover a Smarter Way',
      desc: 'Explore food like never before. Every session teaches Cravexo more about your perfect taste.',
      color: '#FFD700',
    },
  ];

  return (
    <section id="howitworks" style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>
            <span>⚡</span> The Process
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '20px' }}>
            How <span className="gradient-text">Cravexo</span> Works
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.8 }}>
            Four simple steps from craving to perfect food discovery — powered by AI.
          </p>
        </div>

        {/* Steps */}
        <div style={{ position: 'relative' }}>
          {/* Connector line (desktop) */}
          <div style={{
            position: 'absolute',
            top: '60px',
            left: '12.5%',
            right: '12.5%',
            height: '2px',
            background: 'linear-gradient(90deg, #FF6B00, #00D4FF, #FF2020, #FFD700)',
            opacity: 0.3,
          }} className="connector-line" />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '32px',
          }}>
            {steps.map((step) => (
              <div key={step.number} className="card-glow" style={{ padding: '32px 24px', textAlign: 'center', position: 'relative' }}>
                {/* Step number badge */}
                <div style={{
                  position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)',
                  background: `${step.color}`,
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '4px 14px',
                  borderRadius: '20px',
                }}>
                  STEP {step.number}
                </div>

                {/* Icon circle */}
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: `${step.color}15`,
                  border: `2px solid ${step.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', margin: '20px auto 20px',
                  transition: 'all 0.3s ease',
                }}>
                  {step.icon}
                </div>

                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '12px', color: step.color }}>{step.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontSize: '0.88rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .connector-line { display: none; } }
      `}</style>
    </section>
  );
}
