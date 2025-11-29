import Header from '../components/layout/Header';
import HeroSection from '../components/layout/HeroSection';
import ImpactMetrics from '../components/layout/ImpactMetrics';
import Footer from '../components/layout/Footer';
import CampaignsSection from '../components/layout/CampaignsSection';
import CallToActionSection from '../components/layout/CallToActionSection';

export default function LandingPage() {
  return (
    <div>
        <Header />
        <HeroSection />
        <CampaignsSection />
        <ImpactMetrics />
        <CallToActionSection />
        <Footer />
    </div>
  )
}
