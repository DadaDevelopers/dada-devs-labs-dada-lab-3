import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Wallet, Zap } from "lucide-react";
import { getProviderWithdrawals, sendWithdrawalLightning } from "../../../services/api";

interface WithdrawalRow {
  _id: string;
  campaignId: { title?: string } | string;
  amount: number;
  currency: string;
  status: string;
  reference?: string;
  lightningAddress?: string | null;
  createdAt?: string;
}

export default function AdminPayoutsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await getProviderWithdrawals({ status: "PENDING" });
      setWithdrawals(res?.withdrawals ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pending withdrawals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSendLightning = async (withdrawalId: string) => {
    setSendingId(withdrawalId);
    setError(null);
    try {
      await sendWithdrawalLightning(withdrawalId);
      await load();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "response" in e && (e.response as { data?: { message?: string } })?.data?.message;
      setError(msg || (e instanceof Error ? e.message : "Failed to send payment."));
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Payouts
        </h2>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm font-semibold disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <p className="text-slate-400 text-sm">
        Send pending provider withdrawals to their Lightning address. Provider must have a Lightning payout method set in Settings → Payouts.
      </p>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/10 bg-white/[0.02]">
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Campaign</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Amount</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Lightning address</th>
                <th className="py-4 px-4 text-right text-[10px] font-black uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    No pending withdrawals. When a provider requests a payout, it will appear here so you can send funds via Lightning.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => {
                  const campaignTitle = typeof w.campaignId === "object" && w.campaignId?.title != null ? w.campaignId.title : "—";
                  const hasLightning = Boolean(w.lightningAddress?.trim());
                  return (
                    <tr key={w._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-medium text-white">{campaignTitle}</td>
                      <td className="py-4 px-4 text-slate-300">
                        {w.amount != null ? Number(w.amount).toLocaleString() : "—"} {w.currency || "USD"}
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-mono text-sm">
                        {hasLightning ? w.lightningAddress : <span className="text-amber-400">No Lightning address</span>}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          disabled={!hasLightning || sendingId === w._id}
                          onClick={() => handleSendLightning(w._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          {sendingId === w._id ? "Sending…" : "Send via Lightning"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-500 text-xs">
        <Wallet className="w-4 h-4" />
        <span>Backend must have LNBITS_URL and LNBITS_ADMIN_KEY set to send payments. Amount is converted to sats using USD_TO_SATS (default 2500).</span>
      </div>
    </div>
  );
}
