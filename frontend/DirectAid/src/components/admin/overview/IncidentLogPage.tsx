import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";

/**
 * Static Incident log page — placeholder for ops runbook or external doc.
 * Linked from Overview "Incident log" button.
 */
export default function IncidentLogPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to="/admin/overview"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-amber-500/20">
          <AlertCircle className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Incident log</h1>
          <p className="text-slate-500 text-sm">Operational incidents and resolutions</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-400 text-sm">
        <p className="mb-4">
          This page is a placeholder for an incident log or link to your runbook.
        </p>
        <p>
          You can replace this with static content, or add a link that opens an external doc (e.g. Notion, Google Doc) in a new tab.
        </p>
      </div>
    </div>
  );
}
