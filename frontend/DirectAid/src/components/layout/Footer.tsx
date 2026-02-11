// src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";

const SocialIcon = ({ children, href, label }: { children: React.ReactNode; href?: string; label?: string }) => (
  <a
    href={href || "#"}
    aria-label={label || "social"}
    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-[#00d4ff] hover:border-[#00d4ff] hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all duration-300"
    target={href ? "_blank" : undefined}
    rel={href ? "noopener noreferrer" : undefined}
  >
    {children}
  </a>
);

const Footer: React.FC = () => {
  return (
    <footer className="relative py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="footer-glass relative overflow-hidden p-8 md:p-14 rounded-[3rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl">
          
          {/* Enhanced Background Image with Radial Mask */}
          <div
            className="absolute inset-0 pointer-events-none -z-10 bg-cover bg-center"
            style={{
              backgroundImage: "url('src/assets/FooterBackgroundImage.png')",
              opacity: "0.15",
              filter: "saturate(2) brightness(1.2)",
              maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
            }}
          />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
            {/* LOGO */}
          
            {/* Brand Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-cyan-400 flex items-center justify-center text-slate-900 font-bold">DA</div>
                <div>
                  <span className="font-semibold text-white">DirectAid</span>
                  <p className="text-[10px] font-mono font-bold tracking-[0.4em] text-[#00d4ff]/80 uppercase">
                    Decentralized Giving
                  </p>
                </div>
              </div>

              <p className="text-lg text-slate-300 max-w-md font-medium leading-relaxed">
                Fast, transparent humanitarian giving via <span className="text-[#F7931A] font-bold">Bitcoin Lightning</span> - settled locally to <span className="text-[#00b37e] font-bold">M-PESA</span>.
              </p>

              <div className="flex items-center gap-4">
                <SocialIcon href="#"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg></SocialIcon>
                <SocialIcon href="#"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v6h-4v-6a2 2 0 00-4 0v6h-4v-6a6 6 0 016-6zM2 9h4v12H2zM4 3a2 2 0 110 4 2 2 0 010-4z"/></svg></SocialIcon>
                <SocialIcon href="#"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v12H4zM22 6L12 13 2 6"/></svg></SocialIcon>
              </div>
            </div>

            {/* Navigation & CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-12">
              <nav className="grid grid-cols-2 gap-x-12 gap-y-5">
                {['About', 'Security', 'Terms', 'Privacy'].map((item) => (
                  <Link key={item} to={`/${item.toLowerCase()}`} className="text-xs font-black uppercase tracking-[0.2em] text-white hover:text-yellow-500 transition-colors">
                    {item}
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-4">
                <a href="/donate" className="btn-neon-filled group px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <span>Initialize Donation</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a href="/support" className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 hover:text-[#00d4ff] transition-colors">
                  System Support
                </a>
              </div>
            </div>
          </div>

          {/* Technical Info Bar */}
          <div className="mt-14 pt-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 font-mono">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Network: Mainnet Online • {new Date().getFullYear()} DirectAid
              </p>
            </div>

            <div className="flex items-center gap-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
               <span className="hover:text-yellow-400 transition-colors cursor-default">Compliance Verified</span>
               <span className="hover:text-[#00d4ff] transition-colors cursor-default">Encryption: AES-256</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;