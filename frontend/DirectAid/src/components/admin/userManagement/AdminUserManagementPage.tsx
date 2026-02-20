import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  HandCoins,
  User,
  RefreshCw,
  FileText,
  X,
} from "lucide-react";
import {
  getAdminMetrics,
  getUsers,
  getProviders,
  approveProviderKyc,
  verifyUserIdentity,
  getUploadsForUser,
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
  userId: string | { _id?: string };
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
  const [docsUserId, setDocsUserId] = useState<string | null>(null);
  const [docsUserName, setDocsUserName] = useState<string>("");
  const [docsUploads, setDocsUploads] = useState<{ id: string; name: string; mimeType?: string; purpose?: string; url?: string; status?: string }[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [highlightUserId, setHighlightUserId] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const highlightFromUrl = searchParams.get("highlightUserId");

  useEffect(() => {
    if (highlightFromUrl) {
      setFilter("PROVIDER");
      setHighlightUserId(highlightFromUrl);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("highlightUserId");
        return next;
      }, { replace: true });
    }
  }, [highlightFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    if (loading || !highlightUserId) return;
    const el = tableContainerRef.current?.querySelector(`[data-user-id="${highlightUserId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      el.classList.add("admin-row-highlight");
      const t = setTimeout(() => {
        el.classList.remove("admin-row-highlight");
        setHighlightUserId(null);
      }, 2000);
      return () => clearTimeout(t);
    }
    setHighlightUserId(null);
  }, [loading, highlightUserId]);

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
    const uid = typeof p.userId === "object" && (p.userId as { _id?: string })?._id != null ? String((p.userId as { _id: string })._id) : String(p.userId);
    acc[uid] = p;
    return acc;
  }, {} as Record<string, ProviderRow>);

  const openDocsPanel = async (userId: string, userName: string) => {
    setDocsUserId(userId);
    setDocsUserName(userName);
    setDocsLoading(true);
    setDocsUploads([]);
    try {
      const { uploads } = await getUploadsForUser(userId);
      setDocsUploads(uploads ?? []);
    } catch {
      setDocsUploads([]);
    } finally {
      setDocsLoading(false);
    }
  };

  const closeDocsPanel = () => {
    setDocsUserId(null);
    setDocsUserName("");
    setDocsUploads([]);
  };

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
        <style>{`
          @keyframes admin-row-highlight-pulse {
            0% { background: rgba(245, 158, 11, 0.35); }
            100% { background: transparent; }
          }
          .admin-row-highlight { animation: admin-row-highlight-pulse 2s ease-out forwards; }
        `}</style>
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh]" ref={tableContainerRef}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/10 bg-white/[0.02]">
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Name</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Organisation</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Role</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Country</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">KYC / Status</th>
                <th className="py-4 px-4 text-right text-[10px] font-black uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">Loading…</td>
                </tr>
              ) : displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No users for {filter}.
                  </td>
                </tr>
              ) : (
                displayUsers.map((u) => {
                  const id = String((u as { _id?: string })._id ?? u.id ?? "");
                  const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "—";
                  const provider = u.role === "PROVIDER" ? userIdToProvider[id] : null;
                  const kycStatus = provider?.kycStatus ?? u.kyc?.status ?? "—";
                  const isBeneficiaryPending = u.role === "BENEFICIARY" && (u.kyc?.status === "PENDING" || !u.beneficiaryProfile?.identityVerified);

                  return (
                    <tr key={id} data-user-id={id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white">{name}</td>
                      <td className="py-4 px-4 text-slate-300 text-sm">{provider?.businessName ?? "—"}</td>
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
                        <span className="flex gap-2 justify-end items-center flex-wrap">
                          <button
                            type="button"
                            onClick={() => openDocsPanel(id, name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/20 text-sky-400 hover:bg-sky-500/30"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View documents
                          </button>
                        {u.role === "PROVIDER" && provider && (
                          <>
                            {(kycStatus === "PENDING" || kycStatus === "REJECTED") && (
                              <button
                                type="button"
                                disabled={actioningId === provider._id}
                                onClick={() => handleProviderKyc(provider._id, "APPROVED")}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            {(kycStatus === "PENDING" || kycStatus === "APPROVED") && (
                              <button
                                type="button"
                                disabled={actioningId === provider._id}
                                onClick={() => handleProviderKyc(provider._id, "REJECTED")}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}
                          </>
                        )}
                        {u.role === "BENEFICIARY" && isBeneficiaryPending && (
                          <>
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
                          </>
                        )}
                        {u.role === "PROVIDER" && !provider && (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                        {u.role === "DONOR" && <span className="text-slate-500 text-xs">—</span>}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {docsUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60" onClick={closeDocsPanel} role="dialog" aria-modal="true">
          <div
            className="w-full max-w-md h-full bg-slate-900 border-l border-white/10 shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/95">
              <h3 className="text-lg font-bold text-white">Documents — {docsUserName}</h3>
              <button type="button" onClick={closeDocsPanel} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {docsLoading ? (
                <p className="text-slate-500 text-sm">Loading documents…</p>
              ) : docsUploads.length === 0 ? (
                <p className="text-slate-500 text-sm">No documents uploaded.</p>
              ) : (
                docsUploads.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.purpose ?? "—"} · {doc.status ?? "—"}</p>
                    </div>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/20 text-sky-400 hover:bg-sky-500/30"
                      >
                        View
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
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
