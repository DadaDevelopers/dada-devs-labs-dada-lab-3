// import React from 'react';

// // 3. Campaign Card Component (Reusable) - Defined locally as it's highly specific to this section
// interface CampaignCardProps {
//   title: string;
//   description: string;
//   progress: number;
//   target: number;
//   raised: number;
// }

// const CampaignCard: React.FC<CampaignCardProps> = ({ title, description, progress, target, raised }) => {
//   // Use React hook (useState) to handle dynamic state if needed, but keeping it simple for now.
//   const progressPercent = Math.min(100, (raised / target) * 100);

//   return (
//     <div 
//       className="p-6 rounded-xl border border-[var(--color-accent)]/20 shadow-2xl transition duration-300 hover:shadow-[0_0_15px_0px_var(--color-accent)]" 
//       style={{ backgroundColor: 'var(--color-primary-bg)' }}
//     >
//       <h3 className="text-2xl font-bold mb-3 text-[var(--color-accent)]">{title}</h3>
//       <p className="text-gray-400 mb-4 text-sm">{description}</p>
      
//       {/* Progress Bar */}
//       <div className="mb-4">
//         <div className="flex justify-between text-xs font-semibold mb-1">
//           <span className="text-gray-300">Raised: ${raised.toLocaleString()}</span>
//           <span className="text-[var(--color-accent)]">{progressPercent.toFixed(0)}%</span>
//         </div>
//         <div className="h-2 rounded-full bg-gray-700">
//           <div 
//             className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500" 
//             style={{ width: `${progressPercent}%` }} 
//           />
//         </div>
//       </div>
      
//       <p className="text-xs text-gray-500 mt-2">Target: ${target.toLocaleString()}</p>
      
//       {/* NOTE: You'll need to define a .btn-secondary class in App.css for this button */}
//       <button className="btn-secondary w-full mt-4 text-sm">
//         View & Donate
//       </button>
//     </div>
//   );
// };


// const CampaignsSection: React.FC = () => {
//   const dummyCampaigns = [
//     { title: "Clean Water Initiative", description: "Providing access to safe drinking water in rural villages.", progress: 50, target: 50000, raised: 25000 },
//     { title: "Tech Education Fund", description: "Sponsoring coding bootcamps for underprivileged youth.", progress: 80, target: 10000, raised: 8000 },
//     { title: "Emergency Medical Relief", description: "Rapid funding for disaster zones using instant BTC transfers.", progress: 95, target: 20000, raised: 19000 },
//   ];

//   return (
//     <section id="campaigns" className="py-20 px-4" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
//       <div className="max-w-7xl mx-auto">
//         <h2 className="text-4xl font-bold text-center mb-4 text-[var(--color-text-light)]">Trending Campaigns</h2>
//         <p className="text-center text-lg text-gray-400 mb-12">Support decentralized and transparent causes.</p>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {dummyCampaigns.map((campaign, index) => (
//             <CampaignCard key={index} {...campaign} />
//           ))}
//         </div>
        
//         <div className="text-center mt-12">
//             {/* NOTE: .btn-secondary needs definition in App.css */}
//             <a href="/all-campaigns" className="btn-secondary text-lg">
//                 See All Campaigns
//             </a>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CampaignsSection;

import React from 'react';
import { ArrowRight } from 'lucide-react';

// 3. Campaign Card Component (Reusable) - Defined locally as it's highly specific to this section
interface CampaignCardProps {
  title: string;
  description: string;
  progress: number;
  target: number;
  raised: number;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ title, description, progress, target, raised }) => {
  // Use React hook (useState) to handle dynamic state if needed, but keeping it simple for now.
  const progressPercent = Math.min(100, (raised / target) * 100);

  return (
    // Card styling is maintained. We add 'flex-shrink-0' to prevent the card from squeezing on horizontal scroll.
    // The width is explicitly set to ensure 3-4 cards fit horizontally on desktop before scrolling starts.
    <div 
      className="p-6 rounded-xl border border-[var(--color-accent)]/20 shadow-2xl transition duration-300 hover:shadow-[0_0_25px_5px_var(--color-accent)] w-80 flex-shrink-0 snap-center cursor-pointer" 
      style={{ 
        backgroundColor: 'var(--color-primary-bg)',
        // Base box shadow is slightly softened, and the hover class is strengthened to 25px spread
        boxShadow: '0 0 10px rgba(0, 255, 255, 0.05)'
      }}
    >
      <h3 className="text-xl font-bold mb-3 text-[var(--color-accent)] truncate">{title}</h3>
      <p className="text-gray-400 mb-4 text-sm line-clamp-2">{description}</p>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-semibold mb-1">
          <span className="text-gray-300">Raised: ${raised.toLocaleString()}</span>
          <span className="text-[var(--color-accent)]">{progressPercent.toFixed(0)}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-700">
          <div 
            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">Target: ${target.toLocaleString()}</p>
      
      {/* NOTE: You'll need to define a .btn-secondary class in App.css for this button */}
      <button className="btn-secondary w-full mt-4 text-sm">
        View & Donate
      </button>
    </div>
  );
};


const CampaignsSection: React.FC = () => {
  // Increased dummy data to 10 campaigns
  const dummyCampaigns = [
    { title: "Clean Water Initiative - Africa", description: "Providing access to safe drinking water in rural villages using decentralized finance.", progress: 50, target: 50000, raised: 25000 },
    { title: "Tech Education Fund - Asia", description: "Sponsoring coding bootcamps for underprivileged youth in high-growth tech hubs.", progress: 80, target: 10000, raised: 8000 },
    { title: "Emergency Medical Relief - Haiti", description: "Rapid funding for disaster zones using instant BTC transfers for immediate aid.", progress: 95, target: 20000, raised: 19000 },
    { title: "Decentralized Art Fund", description: "Supporting independent digital artists using transparent crypto grants.", progress: 20, target: 30000, raised: 6000 },
    { title: "Wildlife Conservation", description: "Protecting endangered species through blockchain-verified donations.", progress: 75, target: 80000, raised: 60000 },
    { title: "Open Source Tooling Grant", description: "Funding development for critical open-source infrastructure projects.", progress: 40, target: 15000, raised: 6000 },
    { title: "Solar Power for Schools", description: "Installing off-grid solar panels in remote educational facilities.", progress: 65, target: 45000, raised: 29250 },
    { title: "Disaster Preparedness Training", description: "Community-led initiatives for emergency readiness and response.", progress: 99, target: 5000, raised: 4950 },
    { title: "Microloan for Artisans", description: "Providing small, zero-interest loans to local craftsmen and women.", progress: 10, target: 25000, raised: 2500 },
    { title: "Future of Food Security", description: "Funding innovative vertical farming and sustainable agriculture projects.", progress: 55, target: 70000, raised: 38500 },
  ];

  return (
    <section id="campaigns" className="py-20 px-4" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Updated Title */}
        <h2 className="text-4xl font-bold text-center mb-4 text-[var(--color-text-light)]">Top Trending Campaigns</h2>
        <p className="text-center text-lg text-gray-400 mb-12">Support decentralized and transparent causes with instant Bitcoin.</p>
        
        {/* Horizontal Scroll Container */}
        <div 
          className="flex space-x-6 pb-4 overflow-x-auto scroll-smooth snap-x snap-mandatory" 
          // Added a small scrollbar style for better UX (optional)
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-accent) transparent' }}
        >
          {dummyCampaigns.map((campaign, index) => (
            // Added margin to the right of each card for separation
            <CampaignCard key={index} {...campaign} />
          ))}
        </div>
        
        <div className="text-center mt-16">
          <a 
            href="/campaigns"
            className="inline-flex items-center gap-3 text-lg font-medium py-4 px-8 rounded-xl border border-[var(--color-accent)] hover:bg-white/5 transition backdrop-blur-sm group"
          >
            See All Campaigns
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CampaignsSection;

