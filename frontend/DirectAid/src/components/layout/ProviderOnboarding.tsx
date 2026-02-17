// ============================================
// src/components/ProviderOnboarding.jsx
// ============================================
import { useNavigate } from "react-router-dom"; 
export default function ProviderOnboarding() {
  const navigate = useNavigate(); // 2. Initialize the hook

  const handleInitialize = () => {
    // 3. Define the destination. 
    // Usually, you'll want to send them to signup with a role hint 
    // or to a specific provider onboarding route.
    navigate("/signup?role=provider"); 
  }
  return (
    <section id="provider" className="py-8 lg:py-8 relative overflow-hidden">
      {/* Background Architectural Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-yellow-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Value Proposition */}
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-yellow-500 mb-6">
              Network Expansion
            </h2>
            <h3 className="text-4xl lg:text-6xl font-black tracking-tighter text-white leading-[0.9] mb-8">
              Become a Verified <br />
              <span className="text-slate-500">Service Provider.</span>
            </h3>
            <p className="max-w-md text-base lg:text-lg text-slate-400 font-medium leading-relaxed mb-10">
              Join the high-speed rail for humanitarian capital. We provide the infrastructure; you provide the impact.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <TrustStat label="KYB Compliance" value="Tier 1" />
              <TrustStat label="Settlement Rail" value="Real-time" />
            </div>
          </div>

          {/* Right: The Onboarding Terminal */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-cyan-500/20 blur-2xl opacity-50" />
            
            <div className="relative glass-card bg-slate-950/40 border border-white/10 p-8 lg:p-12 rounded-[3rem] shadow-2xl backdrop-blur-3xl">
              <div className="space-y-6 mb-10">
                <Step 
                  number="01" 
                  title="Credential Submission" 
                  desc="Submit institutional licenses and M-PESA merchant details." 
                />
                <Step 
                  number="02" 
                  title="Vetting & Protocol" 
                  desc="Automated KYB verification via our secure compliance engine." 
                />
                <Step 
                  number="03" 
                  title="Rail Activation" 
                  desc="Begin receiving instant global liquid donations via Lightning." 
                />
              </div>

              <button onClick={handleInitialize} className="w-full group relative overflow-hidden bg-yellow-400 hover:bg-yellow-300 text-slate-950 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all duration-300 shadow-[0_20px_40px_rgba(250,204,21,0.15)]">
                <span className="relative z-10">Initialize Onboarding</span>
                <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-white/20 transition-transform duration-300" />
              </button>
              
              <p className="text-center mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Estimated setup time: <span className="text-white">4 minutes</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function TrustStat({ label, value }) {
  return (
    <div className="border-l-2 border-yellow-500/30 pl-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className="text-xl font-black text-white italic">{value}</p>
    </div>
  );
}

function Step({ number, title, desc }) {
  return (
    <div className="flex gap-5">
      <span className="text-xs font-black text-yellow-500/50 mt-1">{number}</span>
      <div>
        <h4 className="text-sm font-black text-white uppercase tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}