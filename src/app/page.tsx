import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MrFryChat from './components/MrFryChat';
import ConceptSection from './components/ConceptSection';
import MrFrySection from './components/MrFrySection';
import HowItWorksSection from './components/HowItWorksSection';
import WhyDifferentSection from './components/WhyDifferentSection';
import FeaturePreviewSection from './components/FeaturePreviewSection';
import VisionSection from './components/VisionSection';
import FooterSection from './components/FooterSection';

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />

      {/* Neon divider */}
      <div style={{ padding: '0 24px' }}>
        <div className="neon-divider" />
      </div>

      <ConceptSection />

      <div style={{ padding: '0 24px' }}>
        <div className="neon-divider" />
      </div>

      <MrFrySection />

      <div style={{ padding: '0 24px' }}>
        <div className="neon-divider" />
      </div>

      <HowItWorksSection />

      <div style={{ padding: '0 24px' }}>
        <div className="neon-divider" />
      </div>

      <WhyDifferentSection />

      <div style={{ padding: '0 24px' }}>
        <div className="neon-divider" />
      </div>

      <FeaturePreviewSection />

      <div style={{ padding: '0 24px' }}>
        <div className="neon-divider" />
      </div>

      <VisionSection />

      <FooterSection />

      {/* Mr. Fry Chat Drawer — globally accessible, opened by mrfry:open event */}
      <MrFryChat />
    </main>
  );
}
