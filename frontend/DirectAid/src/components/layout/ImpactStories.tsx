// ============================================
// src/components/ImpactStories.tsx
// ============================================

const STORIES = [
  {
    id: "s1",
    metric: "1,200 Lives",
    title: "Clean Water Restoration",
    location: "Turkana, Kenya",
    description: "Successfully deployed capital for solar-pump replacement. Verification via IoT water-flow sensors.",
    provider: "Aqua-Tech Solutions",
    amount: "$2,800",
    date: "JAN 2026",
    image: "https://images.unsplash.com/photo-1541810271568-7e50c4069894?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "s2",
    metric: "1,000 Students",
    title: "Nutrition Bridge Program",
    location: "Kibera, Nairobi",
    description: "Daily school feeding program funded via Lightning. Direct-to-supplier payment for grain wholesalers.",
    provider: "GrainCorp Logistics",
    amount: "$4,200",
    date: "FEB 2026",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800"
  }
];

export default function ImpactStories() {
  return (
    <section id="stories" className="py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="mb-16">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-yellow-500 mb-4">
            Impact Stories / Audited Outcomes
          </h2>
          <h3 className="text-4xl lg:text-6xl font-black tracking-tighter text-white leading-none">
            Realized <span className="text-slate-600 italic">Benchmarks.</span>
          </h3>
        </div>

        {/* Stories Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          {STORIES.map((story) => (
            <ImpactCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactCard({ story }) {
  return (
    <div className="group relative glass-card bg-slate-950/30 border border-white/5 rounded-[3rem] overflow-hidden hover:border-yellow-500/20 transition-all duration-700">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src={story.image} 
          alt={story.title} 
          className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-40 transition-all duration-1000" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      <div className="relative z-10 p-10 lg:p-14">
        {/* Verification Pips */}
        <div className="flex justify-between items-start mb-12">
          <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest leading-none mb-1">Impact Radius</p>
            <p className="text-2xl font-black text-white tracking-tighter">{story.metric}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="h-2 w-2 rounded-full bg-[#00b37e] shadow-[0_0_12px_#00b37e] mb-2" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">On-Chain Proof</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-sm mb-12">
          <p className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest mb-2">{story.location}</p>
          <h4 className="text-3xl font-black text-white tracking-tighter mb-4 leading-tight">
            {story.title}
          </h4>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            {story.description}
          </p>
        </div>

        {/* Audit Footer (The 'Fintech' Detail) */}
        <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-8">
          <div>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Cleared Amount</p>
            <p className="text-lg font-black text-white tracking-tight">{story.amount}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Settlement Provider</p>
            <p className="text-[11px] font-black text-slate-300 uppercase truncate">{story.provider}</p>
          </div>
        </div>
      </div>
    </div>
  );
}