//1. import React from 'react';

// const HeroSection: React.FC = () => {
//   return (
//     <section 
//       className="relative flex flex-col items-center justify-center text-center pt-24 pb-32 overflow-hidden" 
//       style={{ backgroundColor: 'var(--color-primary-bg)' }}
//     >
//       {/* Background Neon Grid Effect (Placeholder SVG or simple pattern) */}
//       <div className="absolute inset-0 opacity-10 pointer-events-none">
//         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
//           <defs>
//             <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
//               <path d="M 80 0 L 0 0 0 80" fill="none" stroke="var(--color-accent)" strokeOpacity="0.1" strokeWidth="1"/>
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#grid)" />
//         </svg>
//       </div>

//       <div className="relative z-10 max-w-4xl px-4">
//         {/* Title */}
//         <h1 className="text-6xl font-extrabold tracking-tighter mb-6 leading-tight">
//           Fueling Impact with <span className="text-[var(--color-accent)]">Lightning Speed</span>
//         </h1>
        
//         {/* Subtitle */}
//         <p className="text-xl text-[var(--color-text-light)] mb-10 opacity-80 max-w-2xl mx-auto">
//           DirectAid is the transparent, censorship-resistant crowdfunding platform built on the Bitcoin Lightning Network⚡. Fund your cause instantly and securely.
//         </p>
        
//         {/* Primary CTA */}
//         <a href="/signup" className="btn-cta text-lg shadow-[0_0_20px_0px_var(--color-accent)]">
//           GET STARTED
//         </a>
//         <a href="/campaigns" className="border border-[var(--color-accent)] text-lg mx-4 py-3 px-4 rounded-lg">
//           Explore Active Campaigns
//         </a>
        
//         {/* Secondary CTA/Info */}
//         <div className="mt-8 text-sm text-gray-400">
//             <p>100% of donations are secured by Bitcoin.</p>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;

//2. import React from 'react';

// const HeroSection: React.FC = () => {
//   return (
//     <section 
//       className="relative flex flex-col items-center justify-center text-center pt-32 pb-40 px-6 overflow-hidden"
//       style={{ backgroundColor: 'var(--color-primary-bg)' }}
//     >
//       {/* Background Grid */}
//       <div className="absolute inset-0 opacity-10 pointer-events-none">
//         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
//           <defs>
//             <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
//               <path d="M 80 0 L 0 0 0 80" fill="none" stroke="var(--color-accent)" strokeWidth="1"/>
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#grid)" />
//         </svg>
//       </div>

//       <div className="relative z-10 max-w-5xl mx-auto">
//         <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-6 leading-tight">
//           Fueling Impact with <span className="text-[var(--color-accent)]">Lightning Speed</span>
//         </h1>
        
//         <p className="text-lg sm:text-xl text-[var(--color-text-light)] mb-10 opacity-80 max-w-3xl mx-auto">
//           DirectAid is the transparent, censorship-resistant crowdfunding platform built on the Bitcoin Lightning Network. Fund your cause instantly and securely.
//         </p>
        
//         {/* Responsive CTA Buttons — Stacked on Mobile, Inline on Desktop */}
//         <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//           <a 
//             href="/signup" 
//             className="btn-cta text-lg sm:text-xl px-8 py-4 shadow-[0_0_30px_0px_var(--color-accent)] font-bold"
//           >
//             GET STARTED
//           </a>
//           <a 
//             href="/campaigns" 
//             className="border border-[var(--color-accent)] text-lg sm:text-xl px-8 py-4 rounded-lg hover:bg-white/5 transition backdrop-blur-sm"
//           >
//             Explore Campaigns
//           </a>
//         </div>

//         <div className="mt-10 text-sm sm:text-base text-gray-400 opacity-70">
//           <p>100% of donations are secured by Bitcoin Lightning Network</p>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;

import React, { useState, useEffect } from 'react';

const headlines = [
  "Fueling Impact with Lightning Speed",
  "Borderless Funding, Instant Delivery",
  "Censorship-Resistant Crowdfunding Now"
];

const HeroSection: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
     <section 
      className="relative flex flex-col items-center justify-center text-center pt-28 pb-20 sm:pb-28 px-5 overflow-hidden"
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Responsive Sliding Headline */}
        {/* **FINAL FIX: Increased desktop height to ensure no chopping.** */}
        <div className="h-24 **sm:h-32 lg:h-40** overflow-hidden"> 
          <div 
            className="flex transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {headlines.map((text, i) => (
              <h1 
                key={i}
                className="shrink-0 w-full 
                  text-4xl xs:text-5xl 
                  sm:text-6xl 
                  md:text-6xl 
                  lg:text-7xl 
                  font-extrabold tracking-tighter leading-tight"
              >
                {text.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="text-[var(--color-accent)]">
                  {text.split(" ").slice(-2).join(" ")}
                </span>
              </h1>
            ))}
          </div>
        </div>

        {/* Subtitle (Now using the corrected margin) */}
        <p className="text-base xs:text-lg sm:text-xl text-[var(--color-text-light)] mt-2 sm:mt-8 mb-10 sm:mb-12 opacity-80 max-w-3xl mx-auto leading-relaxed px-2">
          DirectAid is the transparent, censorship-resistant crowdfunding platform built on the Bitcoin Lightning Network. Fund your cause instantly and securely.
        </p>
        
        {/* Buttons — Perfect on mobile & desktop */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4">
          <a 
            href="/signup" 
            className="w-full sm:w-auto btn-cta text-lg sm:text-xl px-10 py-5 rounded-xl font-bold shadow-[0_0_30px_var(--color-accent)]"
          >
            GET STARTED
          </a>
          <a 
            href="/campaigns" 
            className="w-full sm:w-auto border border-[var(--color-accent)] text-lg sm:text-xl px-10 py-5 rounded-xl hover:bg-white/5 transition font-medium"
          >
            Explore Campaigns
          </a>
        </div>

        <div className="mt-10 text-sm sm:text-base text-gray-400 opacity-70">
          <p>100% of donations secured by Bitcoin Lightning Network</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;