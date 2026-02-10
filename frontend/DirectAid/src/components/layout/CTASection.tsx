// ============================================
// src/components/CTASection.jsx
// ============================================
import { Link } from "react-router-dom";
export default function CTASection() {
  return (
    <section id="donate" className="py-8">
      <div className="rounded-3xl bg-linear-to-r from-amber-400 to-cyan-400 p-10 text-slate-900 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Turn intent into impact</h2>
          <p className="mt-2">Donate instantly or onboard as a provider today.</p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-4">
          <Link to="/signup?role=donor" className="px-4 py-2 bg-amber-400 text-slate-900 rounded">Donate</Link>
          <Link to="/signup?role=provider" className="px-6 py-3 rounded border border-slate-900">Provider signup</Link>
        </div>
      </div>
    </section>
  );
}