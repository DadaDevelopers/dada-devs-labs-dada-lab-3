import React from 'react';

const CallToActionSection: React.FC = () => {
    return (
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
        <div className="max-w-4xl mx-auto text-center p-10 rounded-xl shadow-[0_0_30px_0px_var(--color-accent)]/30 border border-[var(--color-accent)]/10" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
          <h2 className="text-3xl font-bold mb-4 text-[var(--color-text-light)]">Ready to Fund the Future?</h2>
          <p className="text-lg text-gray-400 mb-8">
            Create your campaign in minutes and receive instant, borderless funding via the Lightning Network.
          </p>
          <a href="/create-campaign" className="btn-cta text-lg shadow-[0_0_20px_0px_var(--color-accent)]">
            Start Your Campaign Today
          </a>
        </div>
      </section>
    );
  };

export default CallToActionSection;