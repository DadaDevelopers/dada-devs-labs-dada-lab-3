import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section 
      className="relative flex flex-col items-center justify-center text-center pt-24 pb-32 overflow-hidden" 
      style={{ backgroundColor: 'var(--color-secondary-bg)' }}
    >
      {/* Background Neon Grid Effect (Placeholder SVG or simple pattern) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="var(--color-accent)" strokeOpacity="0.1" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl px-4">
        {/* Title */}
        <h1 className="text-6xl font-extrabold tracking-tighter mb-6 leading-tight">
          Fueling Impact with <span className="text-[var(--color-accent)]">Lightning Speed</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-[var(--color-text-light)] mb-10 opacity-80 max-w-2xl mx-auto">
          DirectAid is the transparent, censorship-resistant crowdfunding platform built on the Bitcoin Lightning Network. Fund your cause instantly and securely.
        </p>
        
        {/* Primary CTA */}
        <a href="#campaigns" className="btn-cta text-lg shadow-[0_0_20px_0px_var(--color-accent)]">
          Explore Campaigns
        </a>
        
        {/* Secondary CTA/Info */}
        <div className="mt-8 text-sm text-gray-400">
            <p>100% of donations are secured by Bitcoin.</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;