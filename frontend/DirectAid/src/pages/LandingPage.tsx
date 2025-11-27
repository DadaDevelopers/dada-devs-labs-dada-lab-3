import Header from '../components/layout/Header';
import HeroSection from '../components/layout/HeroSection';
import CampaignPage from './CampaignPage';
import ImpactMetrics from '../components/layout/ImpactMetrics';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  return (
    <div>
        <Header />
        <HeroSection />
        <CampaignPage />
        <ImpactMetrics />
        <Footer />
    </div>
  )
}
