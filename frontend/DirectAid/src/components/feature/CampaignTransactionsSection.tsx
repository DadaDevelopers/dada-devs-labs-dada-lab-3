import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import api from "../../services/api";
import { DollarSign, ArrowDownCircle, Loader2 } from "lucide-react";

interface WithdrawalItem {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  providerId?: { businessName?: string; email?: string };
}

interface TransactionsData {
  donationCount: number;
  totalDonations: number;
  withdrawals: WithdrawalItem[];
}

export function CampaignTransactionsSection({ campaignId }: { campaignId: string }) {
  const [data, setData] = useState<TransactionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .get(`/campaigns/${campaignId}/transactions`)
      .then((res: any) => {
        if (!cancelled && res && typeof res === "object") {
          setData({
            donationCount: res.donationCount ?? 0,
            totalDonations: res.totalDonations ?? 0,
            withdrawals: Array.isArray(res.withdrawals) ? res.withdrawals : [],
          });
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("unavailable");
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [campaignId]);

  // Refetch when user returns to the tab (e.g. after completing a donation in another tab)
  useEffect(() => {
    const onFocus = () => {
      if (!campaignId) return;
      api
        .get(`/campaigns/${campaignId}/transactions`)
        .then((res: any) => {
          if (res && typeof res === "object") {
            setData({
              donationCount: res.donationCount ?? 0,
              totalDonations: res.totalDonations ?? 0,
              withdrawals: Array.isArray(res.withdrawals) ? res.withdrawals : [],
            });
            setError(null);
          }
        })
        .catch(() => {
          setError("unavailable");
          setData(null);
        });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [campaignId]);

  if (loading) {
    return (
      <Card className="p-6 border-white/10 bg-[var(--color-secondary-bg)]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading transactions...</span>
        </div>
      </Card>
    );
  }

  // On error (e.g. 404 or network): show empty state with friendly copy, never raw URL or technical message
  const showEmptyState = error || !data;
  const donationCount = data?.donationCount ?? 0;
  const totalDonations = data?.totalDonations ?? 0;
  const withdrawals = data?.withdrawals ?? [];

  return (
    <Card className="p-6 border-white/10 bg-[var(--color-secondary-bg)]/80 backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4" style={{ color: "var(--color-text-light)" }}>
        Transactions
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {showEmptyState && error
          ? "No transactions to show yet for this campaign."
          : "Donations and provider withdrawals for this campaign."}
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10" style={{ backgroundColor: "var(--color-primary-bg)" }}>
          <DollarSign className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
          <div>
            <p className="font-medium" style={{ color: "var(--color-text-light)" }}>
              {donationCount} donation{donationCount !== 1 ? "s" : ""} · ${Number(totalDonations).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">
              Total completed donations applied to this campaign. Provider withdrawals below do not reduce this amount.
            </p>
          </div>
        </div>

        {withdrawals.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-light)" }}>
              Withdrawals by provider
            </h3>
            <ul className="space-y-2">
              {withdrawals.map((w) => (
                <li
                  key={w._id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-white/10"
                  style={{ backgroundColor: "var(--color-primary-bg)" }}
                >
                  <ArrowDownCircle className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: "var(--color-text-light)" }}>
                      {w.providerId && typeof w.providerId === "object" && (w.providerId as any).businessName
                        ? (w.providerId as any).businessName
                        : "Provider"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {w.currency} {Number(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} · {w.status}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {withdrawals.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No provider withdrawals yet for this campaign.
          </p>
        )}
      </div>
    </Card>
  );
}
