import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getCampaignById } from "../../../services/api";
import { CampaignTransactionsSection } from "../../feature/CampaignTransactionsSection";
import { getBeneficiaryDisplayName } from "../../../lib/utils";

export default function AdminCampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getCampaignById(id)
      .then((res) => {
        if (!cancelled && res?.campaign) setCampaign(res.campaign as Record<string, unknown>);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load campaign.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-slate-500">
        Loading campaign…
      </div>
    );
  }
  if (error || !campaign) {
    return (
      <div className="space-y-4">
        <p className="text-rose-400">{error ?? "Campaign not found."}</p>
        <Link to="/admin/campaigns" className="text-amber-400 hover:underline text-sm">
          Back to campaigns
        </Link>
      </div>
    );
  }

  const beneficiaryName = getBeneficiaryDisplayName(campaign, "—");
  const provider = campaign.providerId as { firstName?: string; lastName?: string; organization?: string } | undefined;
  const providerName = provider?.organization ?? (provider ? [provider.firstName, provider.lastName].filter(Boolean).join(" ") : null) ?? "—";

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/admin/campaigns"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to campaigns
      </Link>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {String(campaign.title ?? "—")}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Status: <span className="text-slate-300 capitalize">{String(campaign.adminStatus ?? campaign.status ?? "—")}</span>
          </p>
        </div>

        {campaign.description && (
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Description</h3>
            <p className="text-slate-300 text-sm whitespace-pre-wrap">{String(campaign.description)}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Beneficiary</h3>
            <p className="text-white font-medium">{beneficiaryName}</p>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Provider</h3>
            <p className="text-white font-medium">{providerName}</p>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Category</h3>
            <p className="text-slate-300 capitalize">{String(campaign.category ?? "—")}</p>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Target amount</h3>
            <p className="text-slate-300">
              {campaign.targetAmount != null ? Number(campaign.targetAmount).toLocaleString() : "—"} {String(campaign.currency ?? "")}
            </p>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Amount raised</h3>
            <p className="text-slate-300">
              {campaign.amountRaised != null ? Number(campaign.amountRaised).toLocaleString() : "—"}
            </p>
          </div>
        </div>

        {id && (
          <div className="pt-6 border-t border-white/10">
            <CampaignTransactionsSection campaignId={id} />
          </div>
        )}
      </div>
    </div>
  );
}
