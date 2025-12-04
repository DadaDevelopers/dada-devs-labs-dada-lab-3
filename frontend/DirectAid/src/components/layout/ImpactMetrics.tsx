import React from 'react';

const ImpactMetrics: React.FC = () => {
  const stats = [
    { value: "50+", label: "Successful Campaigns" },
    { value: "$1.2M+", label: "Total BTC Raised" },
    { value: "0%", label: "Platform Fees" },
    { value: "Instant", label: "Settlement Time" },
  ];
  
  return (
    <section className="py-20 px-4" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12 text-[var(--color-text-light)]">Why Choose DirectAid?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="p-6 rounded-lg bg-[var(--color-secondary-bg)] shadow-xl border-t-2 border-[var(--color-accent)]/50">
              <p className="text-4xl font-extrabold text-[var(--color-accent)] mb-2">{stat.value}</p>
              <p className="text-sm font-semibold text-gray-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactMetrics;