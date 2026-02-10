// src/components/Hero.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function HeroSection(): JSX.Element {
  return (
    <section
      id="hero"
      className="relative flex items-center min-h-screen py-8 lg:py-12 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center h-full">

          {/* Left Column */}
          <div className="flex flex-col justify-center text-center lg:text-left h-full">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight hero-title">
              Empowering Change with <br />
              <span className="text-[#00d4ff]">Lightning Speed</span>
            </h1>

            <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-300 leading-relaxed">
              DirectAid connects global donors to verified local providers for immediate, measurable impact. 
              Contribute via <span className="text-white font-semibold">Bitcoin Lightning</span> and settle directly 
              to <span className="text-[#00b37e] font-semibold">M-PESA</span> - secure, transparent, and near-instant. 
              Your donations reach those in need faster, with full traceability and minimal fees.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
              <Link
                to="/signup?role=beneficiary"
                className="btn-neon-filled px-6 py-3 text-base"
              >
                Start a Campaign
              </Link>

              <Link
                to="/campaigns"
                className="btn-neon border border-white/10 px-6 py-3 text-base"
              >
                View All Campaigns
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Image */}
          <div className="relative max-w-lg pt-8 mx-auto lg:mx-0 w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00d4ff] to-[#00b37e] rounded-3xl blur opacity-15 transition duration-1000" />

            <div className="relative glass-card overflow-hidden border-white/20 p-2 shadow-2xl transform lg:rotate-1 hover:rotate-0 transition-transform duration-700"> 
              <img 
                src="/src/assets/HeroSectionImage.png" 
                alt="DirectAid Lightning to M-PESA Visual" 
                className="rounded-xl w-full h-auto max-h-[450px] object-cover shadow-inner"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
