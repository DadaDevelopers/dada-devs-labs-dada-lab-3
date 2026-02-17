import Header from '../components/layout/Header';
import HeroSection from '../components/layout/HeroSection';
//import ImpactMetrics from '../components/layout/ImpactMetrics';
import Footer from '../components/layout/Footer';
import CampaignsSection from '../components/layout/CampaignsSection';
//import CallToActionSection from '../components/layout/CallToActionSection';
import HowItWorks from '../components/layout/HowItWorks';
import CoreValues from '../components/layout/CoreValues';
import ProviderOnboarding from '../components/layout/ProviderOnboarding';
import PaymentsAndFees from '../components/layout/PaymentAndFees';
import SecurityTransparency from '../components/layout/SecurityTransparency';
import FAQ from '../components/layout/FAQ';
import CTASection from '../components/layout/CTASection';
import ImpactStories from '../components/layout/ImpactStories';

export default function LandingPage() {
  return (
    <div className="min-h-screen text-gray-100 bg-linear-to-b from-slate-900 via-slate-800 to-slate-900"> 
      <section className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      
      {/* The main starlit network image */}
      <img 
        src="src/assets/DirectAidBackgroundImage.png" 
        alt="" 
        className="w-full h-full object-cover opacity-60"
      />
      {/* Dark vignette to ensure text readability */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-transparent to-slate-950" />
      <div className="absolute inset-0 bg-slate-950/20" />
      </section>
      <div className="relative z-20">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <CoreValues />
          <HowItWorks />
          <CampaignsSection />
          <ProviderOnboarding />
          <PaymentsAndFees />
          <SecurityTransparency />
          <ImpactStories />
          <FAQ />
          <CTASection />
            {/* <ImpactMetrics /> */}
            {/* <CallToActionSection /> */}
        </main>
        <Footer />
      </div>
    </div>
  );
}
