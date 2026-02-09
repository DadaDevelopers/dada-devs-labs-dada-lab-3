import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../ui/Button";
import { getCampaigns, updateCampaignStatus } from "../../../services/api";
import type { FilterType } from "./AdminCampaignPage";

interface AdminCampaignListProps {
  filter: FilterType;
}

interface CampaignRow {
  _id: string;
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  adminStatus?: string;
  targetAmount?: number;
  amountRaised?: number;
  beneficiaryId?: { firstName?: string; lastName?: string; email?: string };
  providerId?: { firstName?: string; lastName?: string; organization?: string };
}

export default function AdminCampaignList({ filter }: AdminCampaignListProps) {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await getCampaigns({
        limit: 100,
        adminStatus: filter === "all" ? undefined : filter,
      });
      setCampaigns((res?.campaigns ?? []) as CampaignRow[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load campaigns.");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (campaignId: string, status: "approved" | "rejected" | "flagged" | "pending") => {
    setActioningId(campaignId);
    try {
      await updateCampaignStatus(campaignId, status);
      await load();
    } catch {
      setError("Failed to update status.");
    } finally {
      setActioningId(null);
    }
  };

  const beneficiaryName = (c: CampaignRow) =>
    c.beneficiaryId
      ? [c.beneficiaryId.firstName, c.beneficiaryId.lastName].filter(Boolean).join(" ") || c.beneficiaryId.email
      : "—";

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {error && <p className="p-4 text-rose-400 text-sm">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-slate-400 border-b border-white/10 bg-white/[0.02]">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Title</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Beneficiary</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No campaigns found in this category.
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => {
                const id = campaign._id ?? campaign.id ?? "";
                const status = campaign.adminStatus ?? "pending";
                const busy = actioningId === id;
                return (
                  <tr key={id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      {campaign.title ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {beneficiaryName(campaign)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 capitalize">
                      {campaign.category ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg
                          ${status === "approved" && "bg-emerald-500/20 text-emerald-400"}
                          ${status === "pending" && "bg-amber-500/20 text-amber-400"}
                          ${status === "rejected" && "bg-rose-500/20 text-rose-400"}
                          ${status === "flagged" && "bg-orange-500/20 text-orange-400"}
                        `}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 items-center">
                        <Link
                          to={`/admin/campaigns/${id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-slate-300 hover:bg-white/15"
                        >
                          View
                        </Link>
                        {status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatus(id, "approved")}
                              disabled={busy}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatus(id, "rejected")}
                              disabled={busy}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {status !== "flagged" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatus(id, "flagged")}
                            disabled={busy}
                            className="border-white/20 text-slate-300 hover:bg-white/10"
                          >
                            Flag
                          </Button>
                        )}
                        {status === "flagged" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatus(id, "pending")}
                            disabled={busy}
                            className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10"
                          >
                            Unflag
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
