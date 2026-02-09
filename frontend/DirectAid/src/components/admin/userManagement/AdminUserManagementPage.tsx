import { useEffect, useState, useCallback } from "react";
import {
  Users,
  ShieldCheck,
  HandCoins,
  User,
  RefreshCw,
} from "lucide-react";
import {
  getAdminMetrics,
  getUsers,
  getProviders,
  approveProviderKyc,
  verifyUserIdentity,
} from "../../../services/api";
import type { AdminMetrics } from "../../../types";

type FilterRole = "All" | "BENEFICIARY" | "PROVIDER" | "DONOR";

interface UserRow {
  _id: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  country?: string;
  kyc?: { status?: string };
  beneficiaryProfile?: { identityVerified?: boolean };
}

interface ProviderRow {
  _id: string;
  userId: string;
  businessName?: string;
  kycStatus?: string;
}

export default function AdminUserManagementPage() {
  const [filter, setFilter] = useState<FilterRole>("All");
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const roleParam = filter === "All" ? undefined : filter;
      const [m, usersRes, providersRes] = await Promise.all([
        getAdminMetrics().catch(() => null),
        getUsers({ limit: 100, role: roleParam }),
        getProviders(),
      ]);
      setMetrics(m ?? null);
      setUsers((usersRes?.users ?? []) as UserRow[]);
      setProviders((providersRes?.providers ?? []) as ProviderRow[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleProviderKyc = async (providerId: string, status: "APPROVED" | "REJECTED") => {
    setActioningId(providerId);
    try {
      await approveProviderKyc(providerId, { status });
      await load();
    } catch {
      setError("Failed to update KYC status.");
    } finally {
      setActioningId(null);
    }
  };

  const handleVerifyIdentity = async (userId: string, approved: boolean) => {
    setActioningId(userId);
    try {
      await verifyUserIdentity(userId, { identityVerified: approved });
      await load();
    } catch {
      setError("Failed to update verification.");
    } finally {
      setActioningId(null);
    }
  };

  const userIdToProvider = providers.reduce((acc, p) => {
    acc[String(p.userId)] = p;
    return acc;
  }, {} as Record<string, ProviderRow>);

  const displayUsers =
    filter === "PROVIDER"
      ? users.filter((u) => u.role === "PROVIDER")
      : filter === "All"
        ? users
        : users.filter((u) => u.role === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          User Management
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

      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Users"
            value={metrics.users.totalUsers.toLocaleString()}
            sub={`${metrics.users.newUsersToday} new today`}
            icon={<Users className="w-5 h-5 text-cyan-400" />}
          />
          <SummaryCard
            label="Donors"
            value={metrics.users.donors.toLocaleString()}
            icon={<User className="w-5 h-5 text-sky-400" />}
          />
          <SummaryCard
            label="Beneficiaries"
            value={metrics.users.beneficiaries.toLocaleString()}
            icon={<HandCoins className="w-5 h-5 text-emerald-400" />}
          />
          <SummaryCard
            label="Providers"
            value={metrics.users.providers.toLocaleString()}
            sub={`${metrics.compliance.kycPending} KYC pending`}
            icon={<ShieldCheck className="w-5 h-5 text-amber-400" />}
          />
        </div>
      )}

      {error && (
        <p className="text-rose-400 text-sm">{error}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <FilterButton label="All" icon={<Users size={16} />} active={filter === "All"} onClick={() => setFilter("All")} />
        <FilterButton label="Providers" icon={<ShieldCheck size={16} />} active={filter === "PROVIDER"} onClick={() => setFilter("PROVIDER")} />
        <FilterButton label="Beneficiaries" icon={<HandCoins size={16} />} active={filter === "BENEFICIARY"} onClick={() => setFilter("BENEFICIARY")} />
        <FilterButton label="Donors" icon={<User size={16} />} active={filter === "DONOR"} onClick={() => setFilter("DONOR")} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/10 bg-white/[0.02]">
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Name / Organisation</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Role</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Country</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">KYC / Status</th>
                <th className="py-4 px-4 text-right text-[10px] font-black uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">Loading…</td>
                </tr>
              ) : displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No users for {filter}.
                  </td>
                </tr>
              ) : (
                displayUsers.map((u) => {
                  const id = String((u as { _id?: string })._id ?? u.id ?? "");
                  const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "—";
                  const provider = u.role === "PROVIDER" ? userIdToProvider[id] : null;
                  const kycStatus = provider?.kycStatus ?? u.kyc?.status ?? "—";
                  const isPendingKyc = kycStatus === "PENDING";
                  const isBeneficiaryPending = u.role === "BENEFICIARY" && (u.kyc?.status === "PENDING" || !u.beneficiaryProfile?.identityVerified);

                  return (
                    <tr key={id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white">
                        {provider?.businessName ?? name}
                      </td>
                      <td className="py-4 px-4 text-slate-300 text-sm">{u.role ?? "—"}</td>
                      <td className="py-4 px-4 text-slate-400 text-sm">{u.country ?? "—"}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            kycStatus === "PENDING"
                              ? "bg-amber-500/20 text-amber-400"
                              : kycStatus === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : kycStatus === "REJECTED"
                                  ? "bg-rose-500/20 text-rose-400"
                                  : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {kycStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {u.role === "PROVIDER" && provider && isPendingKyc && (
                          <span className="flex gap-2 justify-end">
                            <button
                              type="button"
                              disabled={actioningId === provider._id}
                              onClick={() => handleProviderKyc(provider._id, "APPROVED")}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={actioningId === provider._id}
                              onClick={() => handleProviderKyc(provider._id, "REJECTED")}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </span>
                        )}
                        {u.role === "BENEFICIARY" && isBeneficiaryPending && (
                          <span className="flex gap-2 justify-end">
                            <button
                              type="button"
                              disabled={actioningId === id}
                              onClick={() => handleVerifyIdentity(id, true)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={actioningId === id}
                              onClick={() => handleVerifyIdentity(id, false)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </span>
                        )}
                        {u.role === "PROVIDER" && !provider && (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                        {u.role === "DONOR" && <span className="text-slate-500 text-xs">—</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all duration-200 hover:scale-[1.01]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        {icon}
      </div>
      <div className="text-xl font-bold text-white tracking-tight">{value}</div>
      {sub && <div className="text-[10px] text-slate-500 font-medium mt-1">{sub}</div>}
    </div>
  );
}

function FilterButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
        active ? "bg-amber-500 text-black" : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
