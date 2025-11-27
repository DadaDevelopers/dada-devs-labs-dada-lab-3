import React from 'react';


const Header: React.FC = () => {
  return (
    // We hardcoded the background color here earlier, but we can safely use the CSS variable syntax 
    // within Tailwind classes if we had configured it, but sticking to the hardcoded hex or var()
    // ensures immediate rendering stability. Using the hex for simplicity and stability on this static component.
    <header className="bg-[#0B1221] shadow-lg">
      <nav className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center max-w-7xl">
        {/* Logo - Uses the accent color for impact */}
        <a href="/" className="font-extrabold text-2xl tracking-wider text-[var(--color-accent)] mb-3 sm:mb-0">
          DirectAid
        </a>
        
        {/* Navigation */}
        <div className="flex space-x-4 text-[var(--color-text-light)]">
          <a href="#how" className="text-sm hover:text-[var(--color-accent)] transition duration-200">How it works</a>
          <a href="#campaigns" className="text-sm hover:text-[var(--color-accent)] transition duration-200">Campaigns</a>
          <a href="#providers" className="text-sm hover:text-[var(--color-accent)] transition duration-200">Providers</a>
        </div>
        <div>
          <a href="/login" className="text-sm hover:text-[var(--color-accent)] transition duration-200">Login</a>
           {/* CTA Button - Uses the reusable .btn-cta class defined in App.css */}
          <a href="/signup" className="btn-cta text-sm py-2 px-4 ml-4">
            Get Started
          </a>
        </div>
      </nav>
    </header>
  );
};

export default Header;