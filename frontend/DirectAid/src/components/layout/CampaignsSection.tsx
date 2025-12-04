import React from 'react';

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
    <div 
      className="p-6 rounded-xl border border-[var(--color-accent)]/20 shadow-2xl transition duration-300 hover:shadow-[0_0_15px_0px_var(--color-accent)]" 
      style={{ backgroundColor: 'var(--color-primary-bg)' }}
    >
      <h3 className="text-2xl font-bold mb-3 text-[var(--color-accent)]">{title}</h3>
      <p className="text-gray-400 mb-4 text-sm">{description}</p>
      
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
  const dummyCampaigns = [
    { title: "Clean Water Initiative", description: "Providing access to safe drinking water in rural villages.", progress: 50, target: 50000, raised: 25000 },
    { title: "Tech Education Fund", description: "Sponsoring coding bootcamps for underprivileged youth.", progress: 80, target: 10000, raised: 8000 },
    { title: "Emergency Medical Relief", description: "Rapid funding for disaster zones using instant BTC transfers.", progress: 95, target: 20000, raised: 19000 },
  ];

  return (
    <section id="campaigns" className="py-20 px-4" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-[var(--color-text-light)]">Active Campaigns</h2>
        <p className="text-center text-lg text-gray-400 mb-12">Support decentralized and transparent causes.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dummyCampaigns.map((campaign, index) => (
            <CampaignCard key={index} {...campaign} />
          ))}
        </div>
        
        <div className="text-center mt-12">
            {/* NOTE: .btn-secondary needs definition in App.css */}
            <a href="/all-campaigns" className="btn-secondary text-lg">
                See All Campaigns
            </a>
        </div>
      </div>
    </section>
  );
};

export default CampaignsSection;