import React from 'react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';


const Header: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  return (
    <header className="bg-[#0B1221] shadow-lg border-b border-white/10 fixed top-0 left-0 right-0 z-50">
      <nav className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          
          {/* LOGO */}
          <a
            href="/"
            className="font-extrabold text-2xl tracking-wider text-[var(--color-accent)] shrink-0 z-50"
          >
            DirectAid
          </a>

          {/* DESKTOP: Centered Nav Links */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-10">
            <a href="#how" className="text-sm text-white/90 hover:text-[var(--color-accent)] transition">
              How it works
            </a>
            <a href="#campaigns" className="text-sm text-white/90 hover:text-[var(--color-accent)] transition">
              Campaigns
            </a>
            <a href="#providers" className="text-sm text-white/90 hover:text-[var(--color-accent)] transition">
              Providers
            </a>
          </div>

          {/* DESKTOP: Right CTAs */}
          <div className="hidden lg:flex items-center gap-6 shrink-0">
            <a href="/login" className="text-sm text-white/80 hover:text-[var(--color-accent)] transition">
              Login
            </a>
            <a href="/signup" className="btn-cta text-sm py-2 px-6 rounded-lg font-medium">
              Get Started
            </a>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="lg:hidden text-xl text-[var(--color-accent)] z-50"
            onClick={() => setOpenMenu(!openMenu)}
          >
            {openMenu ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU — Full screen overlay */}
      <div
        className={`
          lg:hidden fixed inset-0 top-16 bg-[#0B1221] z-40 transition-all duration-300
          ${openMenu ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}
        `}
      >
        <div className="container mx-auto px-4 pt-8 pb-10 max-w-7xl">
          {/* Mobile Nav Links */}
          <div className="flex flex-col gap-8 text-center mb-10">
            <a href="#how" className="text-xl text-white/90 hover:text-[var(--color-accent)] transition">
              How it works
            </a>
            <a href="#campaigns" className="text-xl text-white/90 hover:text-[var(--color-accent)] transition">
              Campaigns
            </a>
            <a href="#providers" className="text-xl text-white/90 hover:text-[var(--color-accent)] transition">
              Providers
            </a>
          </div>

          <div className="border-t border-white/20 my-8"></div>

          {/* Mobile CTAs */}
          <div className="flex flex-col gap-5 items-center">
            <a href="/login" className="text-lg text-white/80 hover:text-[var(--color-accent)] transition">
              Login
            </a>
            <a href="/signup" className="btn-cta text-base py-3 px-10 w-full max-w-xs rounded-lg font-medium">
              Get Started
            </a>
          </div>
        </div>
      </div>

      {/* Optional: Dark overlay when menu is open */}
      {openMenu && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setOpenMenu(false)}
        />
      )}
    </header>

  );
};

export default Header;
