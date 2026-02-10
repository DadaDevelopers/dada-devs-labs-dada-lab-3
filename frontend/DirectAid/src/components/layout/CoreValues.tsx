// ============================================
// src/components/CoreValues.jsx
// ============================================
export default function CoreValues() {
  const values = [
    { title: 'Ultra-low fees', desc: 'Lightning routing and optimized rails reduce value leakage to near zero.' },
    { title: 'Local-first payouts', desc: 'Funds reach beneficiaries through trusted local rails like M-PESA.' },
    { title: 'Programmable escrow', desc: 'Conditional release based on verification milestones.' },
    { title: 'Open & composable', desc: 'APIs, webhooks, and proofs for full ecosystem integration.' }
  ];

  return (
    <section id="values" className="py-12">
      <h2 className="text-3xl font-bold">Why DirectAid</h2>
      <p className="mt-3 max-w-2xl text-slate-300">A modern aid rail built with the same rigor as global fintech infrastructure.</p>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map(v => (
          <div key={v.title} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400 transition">
            <h3 className="font-semibold text-lg">{v.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}