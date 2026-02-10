// ============================================
// src/components/FAQ.jsx
// ============================================
import { useState } from 'react';

const FAQ_DATA = [
  {
    category: "Financial Protocol",
    q: "How does DirectAid sustain a 1% flat fee structure?",
    a: "Traditional charity rails rely on 5-7 hops through legacy banking systems (SWIFT). DirectAid utilizes the Bitcoin Lightning Network as a settlement layer, bypassing intermediary bank fees. The 1% fee covers network liquidity maintenance and automated on-chain verification."
  },
  {
    category: "Settlement & Safety",
    q: "What happens if a mobile money payout fails?",
    a: "Our protocol utilizes an atomic-swap logic. If a payout to a local provider (like M-PESA) fails to confirm via API within the designated window, the funds remain in the escrow-locked state or are reverted to the liquidity pool. No capital is 'lost' in transit."
  },
  {
    category: "Compliance",
    q: "How are Beneficiaries and Providers verified?",
    a: "We employ a tiered Trust-Score system. Providers undergo full KYB (Know Your Business) documentation. Beneficiaries are verified through localized community consensus and biometric-linked identity where available, ensuring a 'Proof of Need' before a campaign is indexed."
  },
  {
    category: "Governance",
    q: "Is DirectAid a custodial platform?",
    a: "DirectAid operates a hybrid-custodial model designed for speed. While capital is moved via high-frequency Lightning channels for efficiency, the ledger is public and auditable, providing institutional-grade 'Proof of Reserve' in real-time."
  },
  {
    category: "Technical",
    q: "Can institutional donors integrate via API?",
    a: "Yes. Our REST API allows for programmatic capital deployment. Institutional partners can automate donations based on external triggers (e.g., weather events, disaster alerts) with full programmatic receipting for tax compliance."
  }
];

export default function FAQ() {
  return (
    <section id="faq" className="py-24 relative">
      <h2 className="text-3xl sm:text-4xl font-extrabold">
        FAQ
      </h2>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Institutional Header */}
        <div className="mb-16 text-center">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-yellow-500 mb-4">
            Knowledge Base
          </h2>
          <h3 className="text-4xl lg:text-5xl font-black tracking-tighter text-white">
            Protocol <span className="text-slate-600 italic">Insights.</span>
          </h3>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {FAQ_DATA.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} category={item.category} />
          ))}
        </div>

        {/* Support Footer */}
        <div className="mt-16 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 text-center">
          <p className="text-sm text-slate-400 font-medium">
            Require deeper technical documentation or legal frameworks? 
            <button className="ml-2 text-yellow-500 font-black uppercase tracking-widest text-[10px] hover:text-yellow-400 transition-colors">
              Access Whitepaper →
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a, category }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`group rounded-3xl transition-all duration-500 border ${
        isOpen ? 'bg-white/[0.04] border-white/20 shadow-2xl' : 'bg-transparent border-white/5 hover:border-white/10'
      }`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 lg:p-8 text-left outline-none"
      >
        <div className="pr-8">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-500/60 mb-2 block">
            {category}
          </span>
          <h4 className={`text-lg lg:text-xl font-black tracking-tight transition-colors ${
            isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'
          }`}>
            {q}
          </h4>
        </div>
        
        {/* Custom Premium Toggle Icon */}
        <div className={`relative flex-shrink-0 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-transform duration-500 ${isOpen ? 'rotate-180 bg-yellow-400 border-transparent' : ''}`}>
          <div className={`absolute w-3 h-0.5 transition-colors ${isOpen ? 'bg-slate-950' : 'bg-white'}`} />
          <div className={`absolute w-0.5 h-3 transition-all ${isOpen ? 'opacity-0 bg-slate-950' : 'bg-white'}`} />
        </div>
      </button>

      {/* Expandable Panel */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-8 pb-8 text-slate-400 text-sm lg:text-base font-medium leading-relaxed max-w-2xl">
          {a}
        </div>
      </div>
    </div>
  );
}