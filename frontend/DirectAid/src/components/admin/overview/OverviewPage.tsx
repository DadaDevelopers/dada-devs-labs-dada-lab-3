import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ShieldAlert,
  TrendingUp,
  Zap,
  Users,
  CheckCircle2,
} from "lucide-react";
import { getAdminMetrics, getCampaigns, getProviders } from "../../../services/api";
import type { AdminMetrics } from "../../../types";

interface CampaignItem {
  id: string;
  title?: string;
  targetAmount?: number;
  adminStatus?: string;
}
interface ProviderItem {
  _id?: string;
  id?: string;
  businessName?: string;
  kycStatus?: string;
  userId?: string;
}

export default function OverviewPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [pendingCampaigns, setPendingCampaigns] = useState<CampaignItem[]>([]);
  const [pendingProviders, setPendingProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [m, campaignsRes, providersRes] = await Promise.all([
        getAdminMetrics(),
        getCampaigns({ adminStatus: "pending", limit: 10 }).catch(() => ({ campaigns: [] })),
        getProviders().catch(() => ({ providers: [] })),
      ]);
      setMetrics(m);
      setPendingCampaigns((campaignsRes?.campaigns ?? []) as CampaignItem[]);
      const providers = (providersRes?.providers ?? []) as ProviderItem[];
      setPendingProviders(providers.filter((p) => p.kycStatus === "PENDING"));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard. Check backend and try again.");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-4">
        <p className="text-rose-400 font-medium">{error}</p>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="text-slate-500 font-medium animate-pulse">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. TOP BAR: SYSTEM HEALTH */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-3xl">
          <div className="flex items-center gap-4 flex-wrap">
            <div
              className={`w-3 h-3 rounded-full animate-pulse flex-shrink-0 ${
                metrics.platformHealth.status === "OPERATIONAL"
                  ? "bg-emerald-500"
                  : metrics.platformHealth.status === "DEGRADED"
                    ? "bg-amber-500"
                    : "bg-rose-500"
              }`}
            />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Network Status
              </div>
              <div className="text-sm font-bold uppercase tracking-tight text-white">
                DirectAid {metrics.platformHealth.status}
              </div>
            </div>
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                30D Uptime
              </div>
              <div className="text-sm font-bold text-white">
                {metrics.platformHealth.uptimePercent30d}%
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono max-w-xs">
            Last incident: {metrics.platformHealth.lastIncident.summary}
          </div>
        </div>
        <Link
          to="/admin/incident-log"
          className="h-full min-h-[52px] flex items-center justify-center bg-amber-400 text-black font-black uppercase tracking-widest text-[10px] rounded-3xl hover:bg-amber-300 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Incident log
        </Link>
      </section>

      {/* 2. CORE METRICS — all from backend GET /users/stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total raised"
          value={metrics.donations.totalDonationsCount.toLocaleString()}
          subValue="Sum of completed donations (backend)"
          icon={<TrendingUp className="text-emerald-400 w-5 h-5" />}
        />
        <StatCard
          title="Campaigns"
          value={metrics.campaigns.totalCampaigns.toLocaleString()}
          subValue={`${metrics.campaigns.verificationQueueCount} pending review`}
          icon={<Zap className="text-amber-400 w-5 h-5" />}
        />
        <StatCard
          title="Total users"
          value={metrics.users.totalUsers.toLocaleString()}
          subValue={`${metrics.users.newUsersToday} new (7d)`}
          icon={<Users className="text-cyan-400 w-5 h-5" />}
        />
        <StatCard
          title="KYC pending"
          value={String(metrics.compliance.kycPending)}
          subValue={`${metrics.compliance.kycRejected} rejected`}
          icon={<ShieldAlert className="text-rose-400 w-5 h-5" />}
          trend={metrics.compliance.kycPending > 0 ? "high" : "neutral"}
        />
      </section>

      {/* 3. ACTION CENTER (QUEUES) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-tighter text-white">
              Verification Pipeline
            </h2>
            <span className="text-[10px] bg-white/5 px-3 py-1.5 rounded-full text-slate-500 font-bold uppercase">
              {pendingCampaigns.length + pendingProviders.length} Pending Actions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QueueBox
              title="Campaign Requests"
              viewAllTo="/admin/campaigns?filter=pending"
              items={pendingCampaigns.map((c) => ({
                id: (c as { _id?: string })._id ?? c.id ?? "",
                label: c.title ?? "Campaign",
                sub: `${(c.targetAmount ?? 0).toLocaleString()} target · ${c.adminStatus ?? "pending"}`,
                badge: c.adminStatus ?? "Pending",
              }))}
            />
            <QueueBox
              title="Provider KYC"
              viewAllTo="/admin/users?filter=PROVIDER"
              items={pendingProviders.map((p) => ({
                id: (p as { _id?: string })._id ?? p.id ?? "",
                label: p.businessName ?? "Provider",
                sub: `KYC ${p.kycStatus ?? "PENDING"}`,
                badge: "PENDING",
              }))}
            />
          </div>

          <h2 className="text-lg font-black uppercase tracking-tighter text-white pt-4">
            Financial Exceptions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QueueBox title="Payment Issues" items={[]} />
            <QueueBox title="Refund Requests" items={[]} />
          </div>
        </div>

        <aside className="space-y-6">
          <h2 className="text-lg font-black uppercase tracking-tighter text-white">
            System Pulse
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-6">
            <div className="space-y-4">
              <PulseMetric
                label="Webhook Backlog"
                value={metrics.systemQueues.donationWebhooksBacklog}
                max={10}
              />
              <PulseMetric
                label="LN Settlement Lag"
                value={`${metrics.systemQueues.lightningSettlementLagSecondsAvg}s`}
                max={5}
              />
              <PulseMetric
                label="M-Pesa Recon Lag"
                value={`${metrics.systemQueues.mpesaReconciliationLagMinutesAvg}m`}
                max={10}
              />
            </div>

            <div className="h-px bg-white/5" />

            <div className="space-y-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Recent System Alerts
              </div>
              <div className="flex gap-3 items-center p-3 bg-black/40 rounded-xl border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-[11px] text-slate-400">No active alerts</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ——— Subcomponents ———

function StatCard({
  title,
  value,
  subValue,
  icon,
  trend = "neutral",
}: {
  title: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
  trend?: "neutral" | "high";
}) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] relative overflow-hidden group hover:border-amber-400/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]">
      <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
        {title}
      </div>
      <div className="text-2xl font-black tracking-tighter text-white mb-1">
        {value}
      </div>
      <div
        className={`text-[10px] font-bold ${
          trend === "high" ? "text-rose-400" : "text-slate-500"
        }`}
      >
        {subValue}
      </div>
    </div>
  );
}

function QueueBox({
  title,
  items,
  viewAllTo,
}: {
  title: string;
  items: { id: string; label: string; sub: string; badge: string }[];
  viewAllTo?: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-300">
          {title}
        </h3>
        <span className="text-[9px] font-bold text-amber-400">{items.length}</span>
      </div>
      <div className="divide-y divide-white/5">
        {items.map((item) => (
          <div
            key={item.id}
            className="px-6 py-4 hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="flex justify-between items-start gap-2 mb-1">
              <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 truncate min-w-0">
                {item.label}
              </div>
              <span className="text-[8px] px-1.5 py-0.5 rounded border border-white/10 font-black uppercase tracking-tighter text-slate-500 flex-shrink-0">
                {item.badge}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">{item.sub}</div>
          </div>
        ))}
      </div>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="block text-center w-full py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200 hover:scale-[1.01]"
        >
          View Full Queue
        </Link>
      )}
    </div>
  );
}

function PulseMetric({
  label,
  value,
  max,
}: {
  label: string;
  value: number | string;
  max: number;
}) {
  const numericValue =
    typeof value === "string" ? parseFloat(String(value).replace(/[^\d.]/g, "")) : value;
  const percentage = Math.min((Number(numericValue) / max) * 100, 100);
  const barColor =
    percentage > 80 ? "bg-rose-500" : percentage > 50 ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-200">{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
