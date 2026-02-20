import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Header: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = ((user as { role?: string })?.role ?? '').toUpperCase();
  const dashboardPath =
    role === 'ADMIN' ? '/admin' :
    role === 'BENEFICIARY' ? '/beneficiary' :
    role === 'PROVIDER' ? '/provider' :
    role === 'DONOR' ? '/donor' : '/';
  const isLoggedIn = !!user;

  const goToDashboard = () => {
    const token = localStorage.getItem('auth_token');
    if (token) api.setAuthToken(token);
    setOpenMenu(false);
    navigate(dashboardPath);
  };

  return (
    <header className="bg-[#0B1221] shadow-lg border-b border-white/10 fixed top-0 left-0 right-0 z-50">
      <nav className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-cyan-400 flex items-center justify-center text-slate-900 font-bold">DA</div>
            <span className="font-semibold text-white">DirectAid</span>
          </Link>

          {/* DESKTOP: Centered Nav Links */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-10">
            <Link to="/" className="text-sm text-white/90 hover:text-[var(--color-accent)] transition">Home</Link>
            <a href="#how" className="text-sm text-white/90 hover:text-[var(--color-accent)] transition">How it works</a>
            <Link to="/campaigns" className="text-sm text-white/90 hover:text-[var(--color-accent)] transition">Campaigns</Link>
            {/* CHANGED: href="#providers" to to="/providers" */}
            <Link to="/providers" className="text-sm text-white/90 hover:text-[var(--color-accent)] transition">Providers</Link>
            <a href="#faq" className="text-sm text-white/90 hover:text-[var(--color-accent)] transition">FAQ</a>
          </div>

          {/* DESKTOP: Right CTAs */}
          <div className="hidden lg:flex items-center gap-6 shrink-0">
            {isLoggedIn ? (
              <button type="button" onClick={goToDashboard} className="text-sm text-white/80 hover:text-[var(--color-accent)] transition">
                Dashboard
              </button>
            ) : (
              <Link to="/login" className="text-sm text-white/80 hover:text-[var(--color-accent)] transition">
                Login
              </Link>
            )}
            <Link to="/signup" className="btn-cta text-sm py-2 px-6 rounded-lg font-medium">
              Get Started
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <button className="lg:hidden text-xl text-[var(--color-accent)] z-50" onClick={() => setOpenMenu(!openMenu)}>
            {openMenu ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`lg:hidden fixed inset-0 top-16 bg-[#0B1221] z-40 transition-all duration-300 ${openMenu ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}>
        <div className="container mx-auto px-4 pt-8 pb-10 max-w-7xl">
          <div className="flex flex-col gap-8 text-center mb-10">
            <a href="#how" onClick={() => setOpenMenu(false)} className="text-xl text-white/90">How it works</a>
            {/* CHANGED: Providers path */}
            <Link to="/providers" onClick={() => setOpenMenu(false)} className="text-xl text-white/90">Providers</Link>
          </div>
          <div className="flex flex-col gap-5 items-center">
            {isLoggedIn ? (
              <button type="button" onClick={goToDashboard} className="text-lg text-white/80 hover:text-[var(--color-accent)] transition">
                Dashboard
              </button>
            ) : (
              <Link to="/login" onClick={() => setOpenMenu(false)} className="text-lg text-white/80 hover:text-[var(--color-accent)] transition">
                Login
              </Link>
            )}
            <Link to="/signup" onClick={() => setOpenMenu(false)} className="btn-cta text-base py-3 px-10 w-full max-w-xs rounded-lg font-medium text-center">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;