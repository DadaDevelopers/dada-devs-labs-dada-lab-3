// src/components/FAQ.tsx
import React, { useEffect, useState } from "react";

type FAQItemType = {
  category: string;
  q: string;
  a: string;
};

const FAQ_DATA: FAQItemType[] = [
  {
    category: "Financial Protocol",
    q: "How does DirectAid sustain a 1% flat fee structure?",
    a: "Traditional charity rails rely on 5-7 hops through legacy banking systems (SWIFT). DirectAid uses the Bitcoin Lightning Network as a settlement layer, reducing intermediaries. The 1% fee covers liquidity maintenance and automated verification.",
  },
  {
    category: "Settlement & Safety",
    q: "What happens if a mobile money payout fails?",
    a: "Our protocol uses an atomic-swap style flow. If a payout to a local provider (like M-PESA) does not confirm, funds remain escrow-locked or revert to the liquidity pool — no funds are lost in transit.",
  },
  {
    category: "Compliance",
    q: "How are Beneficiaries and Providers verified?",
    a: "Providers go through KYB checks and document verification. Beneficiaries are validated via localized community vetting and identity-linked proof of need, producing a trust score before campaigns are indexed.",
  },
  {
    category: "Governance",
    q: "Is DirectAid a custodial platform?",
    a: "DirectAid operates a hybrid-custodial model for speed. Capital moves via Lightning for efficiency but the ledger is auditable and provides proof-of-reserve for accountability.",
  },
  {
    category: "Technical",
    q: "Can institutional donors integrate via API?",
    a: "Yes — our REST API enables programmatic donations and receipting for compliance. Institutions can automate capital deployment based on triggers like weather or disaster alerts.",
  },
];

export default function FAQ(): JSX.Element {
  // controlled accordion: only one open at a time
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  // animation hook for staggered entry
  const [mounted, setMounted] = useState(false);
  // theme: "dark" | "light"
  const [theme, setTheme] = useState<"dark" | "light">(
    (localStorage.getItem("theme") as "dark" | "light") || "dark"
  );

  useEffect(() => {
    // set theme attribute on <html>
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // trigger entry animations shortly after mount (stagger uses inline delay)
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const toggle = (i: number) => {
    setOpenIndex((cur) => (cur === i ? null : i));
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <section
      id="faq"
      className="py-12 relative"
      aria-labelledby="faq-heading"
      style={{ background: "transparent" }}
    >
      {/* Glow backdrop — sits over page background */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        aria-hidden
      >
        <div className="absolute inset-0 backdrop-blur-[8px]" />
        <div className="absolute right-8 top-10 w-[360px] h-[360px] bg-yellow-300/8 blur-[80px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-3 mb-3">
              <span className="inline-block w-10 h-1 rounded bg-yellow-500" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-yellow-500">
                Knowledge
              </span>
            </div>

            <h2 id="faq-heading" className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Frequently Asked Questions
            </h2>

            <p className="mt-3 text-slate-300 max-w-xl">
              Quick answers about how DirectAid moves funds fast, safely and transparently.
            </p>
          </div>

          {/* Theme toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-pressed={theme === "light"}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/6 text-sm hover:bg-black/20 transition"
            >
              {theme === "dark" ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-yellow-500">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Light
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-900">
                    <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  Dark
                </>
              )}
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQ_DATA.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <article
                key={i}
                className={`faq-glass overflow-hidden rounded-2xl border transition-shadow duration-300 ${
                  isOpen ? "shadow-2xl border-yellow-500" : "border-white/6"
                } transform-gpu`}
                role="region"
                aria-labelledby={`faq-btn-${i}`}
                style={{
                  // staggered entry
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0px)" : "translateY(8px)",
                  transition: `opacity 420ms ease, transform 420ms ease`,
                  transitionDelay: `${i * 70}ms`,
                }}
              >
                <header>
                  <button
                    id={`faq-btn-${i}`}
                    aria-controls={`faq-panel-${i}`}
                    aria-expanded={isOpen}
                    onClick={() => toggle(i)}
                    className="w-full flex items-start gap-4 p-5 sm:p-6 text-left focus:outline-none"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center text-sm font-extrabold ${
                          isOpen ? "bg-yellow-500 text-slate-900" : "bg-[#00AABB] text-white hover:bg-[#00FFFF] shadow-md shadow-cyan-900/30"
                        }`}
                      >
                        {item.category.split(" ")[0].slice(0, 3).toUpperCase()}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className={`text-base sm:text-lg font-black ${isOpen ? "text-white" : "text-slate-200"}`}>
                            {item.q}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400 uppercase tracking-wider">{item.category}</p>
                        </div>

                        <svg
                          className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"} text-slate-300`}
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden
                        >
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </header>

                <div
                  id={`faq-panel-${i}`}
                  aria-labelledby={`faq-btn-${i}`}
                  className={`px-6 pb-6 text-slate-300 leading-relaxed text-sm transition-[max-height,opacity] duration-400 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pt-2">{item.a}</div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Support footer */}
        <div
          className="mt-12 p-6 sm:p-8 rounded-2xl border border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ backgroundColor: "rgba(255, 238, 170, 0.03)" }}
        >
          <div>
            <h4 className="text-lg font-bold text-white">Need more details?</h4>
            <p className="text-sm text-slate-300 mt-1">
              Get full technical or legal docs — whitepapers and API specs are available.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/whitepaper"
              className="inline-flex items-center gap-2 bg-yellow-300 text-slate-900 font-extrabold px-4 py-2 rounded-lg shadow hover:bg-yellow-200 transition"
            >
              Access Whitepaper →
            </a>

            <a href="/contact" className="text-sm text-slate-300 hover:text-white transition">
              Contact support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
