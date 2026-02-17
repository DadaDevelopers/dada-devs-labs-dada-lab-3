// ============================================
// src/components/SecurityTransparency.jsx
// ============================================
export default function SecurityTransparency() {
  return (
    <section id="security" className="py-8">
      <h2 className="text-3xl font-bold">Security & transparency</h2>
      <div className="mt-10 grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white/5">🔍 Independent audits</div>
        <div className="p-6 rounded-xl bg-white/5">🔐 Provider KYC & risk scoring</div>
        <div className="p-6 rounded-xl bg-white/5">📜 Public transaction proofs</div>
      </div>
    </section>
  );
}