// import React from 'react';

// const CallToActionSection: React.FC = () => {
//     return (
//       <section className="py-20 px-4" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
//         <div className="max-w-4xl mx-auto text-center p-10 rounded-xl shadow-[0_0_30px_0px_var(--color-accent)]/30 border border-[var(--color-accent)]/10" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
//           <h2 className="text-3xl font-bold mb-4 text-[var(--color-text-light)]">Ready to Fund the Future?</h2>
//           <p className="text-lg text-gray-400 mb-8">
//             Create your campaign in minutes and receive instant, borderless funding via the Lightning Network.
//           </p>
//           <a href="/create-campaign" className="btn-cta text-lg shadow-[0_0_20px_0px_var(--color-accent)]">
//             Start Your Campaign Today
//           </a>
//         </div>
//       </section>
//     );
//   };

// export default CallToActionSection;

const CallToActionSection: React.FC = () => {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--color-secondary-bg)' }}>
      <div className="max-w-4xl mx-auto text-center p-10 sm:p-12 rounded-2xl shadow-[0_0_30px_0px_var(--color-accent)]/30 border border-[var(--color-accent)]/20 backdrop-blur-xl"
           style={{ backgroundColor: 'var(--color-primary-bg)' }}>
        
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-[var(--color-text-light)]">
          Ready to Fund the Future?
        </h2>
        
        <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Create your campaign in minutes and receive instant, borderless funding via the Lightning Network.
        </p>
        
        {/* Centered & Responsive Button */}
        <div className="flex justify-center">
          <a 
            href="/create-campaign" 
            className="btn-cta text-lg sm:text-xl px-10 py-5 font-bold shadow-[0_0_30px_0px_var(--color-accent)] rounded-xl"
          >
            Start Your Campaign Today
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;