// ============================================
// src/components/PaymentsAndFees.jsx
// ============================================
import { useState, useEffect } from 'react';

export default function PaymentsAndFees() {
  const [amount, setAmount] = useState(750);
  const [isShimmering, setIsShimmering] = useState(false);
  
  const platformFee = amount * 0.01;
  const deliveryEfficiency = 99.0;

  // Manual Input Logic
  const handleInputChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const num = val === '' ? 0 : parseInt(val);
    if (num <= 50000) setAmount(num);
  };

  // Periodic Shimmer Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsShimmering(true);
      setTimeout(() => setIsShimmering(false), 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="payments" className="py-8 lg:py-12 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold">
            Payments and Fees
        </h2>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Protocol Metadata */}
          <div className="lg:col-span-5">
            <div className="inline-block px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">
                Economic Protocol v3.0
              </span>
            </div>
            <h3 className="text-4xl lg:text-5xl font-black tracking-tighter text-white leading-[0.9] mb-8">
              Fee-less Rails. <br />
              <span className="text-slate-600 italic">Pure Impact.</span>
            </h3>

            <div className="space-y-1">
              <ProtocolRow label="Lightning Latency" value="1.2s" />
              <ProtocolRow label="M-PESA Settlement" value="Instant" />
              <ProtocolRow label="Audit Integrity" value="On-Chain" />
            </div>
          </div>

          {/* Right Side: The Glass Terminal */}
          <div className="lg:col-span-7 relative">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-20 bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className={`relative glass-card bg-white/[0.01] border border-white/10 p-8 lg:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl overflow-hidden transition-all duration-1000 ${isShimmering ? 'border-white/20' : 'border-white/10'}`}>
              
              {/* Shimmer Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full transition-transform duration-[2000ms] ease-in-out ${isShimmering ? 'translate-x-full' : ''}`} />

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-8 mb-12">
                  <div className="w-full sm:w-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Input Donation (USD)</p>
                    <div className="flex items-center group">
                      <span className="text-4xl font-black text-yellow-500 mr-2">$</span>
                      <input 
                        type="text"
                        value={amount === 0 ? '' : amount.toLocaleString()}
                        onChange={handleInputChange}
                        className="bg-transparent border-none text-6xl font-black text-white tracking-tighter p-0 focus:ring-0 w-full outline-none placeholder:text-slate-800"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-8 text-center sm:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00b37e] mb-2">Rail Efficiency</p>
                    <p className="text-4xl font-black text-white italic tracking-tighter">{deliveryEfficiency}%</p>
                  </div>
                </div>

                {/* Manual Precision Slider */}
                <div className="relative mb-12 group">
                  <input 
                    type="range" 
                    min={1} 
                    max={10000} 
                    step={1}
                    value={amount} 
                    onChange={e => setAmount(+e.target.value)} 
                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-yellow-400 transition-all hover:accent-yellow-300"
                  />
                  <div className="flex justify-between mt-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                    <span>Entry: $1.00</span>
                    <span className="text-yellow-500/50">High-Volume Limit: $10,000.00</span>
                  </div>
                </div>

                {/* Ledger Breakdown */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Network Fee (1%)</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">${platformFee.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent border border-yellow-500/20 backdrop-blur-md">
                    <p className="text-[9px] font-black uppercase tracking-widest text-yellow-500 mb-2">Net Beneficiary Impact</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white tracking-tighter">${(amount - platformFee).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function ProtocolRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 group hover:border-yellow-500/30 transition-all duration-500">
      <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black text-white group-hover:text-yellow-400 transition-colors">{value}</span>
    </div>
  );
}