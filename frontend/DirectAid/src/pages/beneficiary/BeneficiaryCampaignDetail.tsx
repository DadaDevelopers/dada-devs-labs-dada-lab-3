import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Heart,
  AlertCircle,
  DollarSign,
  Users,
  LayoutDashboard,
  FolderKanban,
  FileText,
  User,
  Bell,
  Lock,
  Loader2,
  CheckCircle2,
  Info,
  ListOrdered,
} from "lucide-react";

export default function BeneficiaryCampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const [campaign, setCampaign] = useState<any>(null);
  const [disbursement, setDisbursement] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", targetAmount: "", category: "" });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get(`/campaigns/${id}`)
      .then((res) => {
        if (cancelled) return;
        const c = res.data?.campaign ?? res.data;
        if (!c) {
          setError("Campaign not found");
          setCampaign(null);
          return;
        }
        const camp = {
          ...c,
          id: c._id ?? c.id,
          location: c.metadata?.location ?? c.location ?? "",
          fundraisingDeadline: c.metadata?.fundraisingDeadline ?? c.fundraisingDeadline,
        };
        setCampaign(camp);
        setForm({
          title: camp.title ?? "",
          description: camp.description ?? "",
          targetAmount: camp.targetAmount != null ? String(camp.targetAmount) : "",
          category: camp.category ?? "",
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message ?? "Failed to load campaign");
          setCampaign(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!id || !campaign) return;
    let cancelled = false;
    api
      .get(`/campaigns/${id}/disbursement`)
      .then((res) => {
        if (!cancelled && res.data?.disbursement) setDisbursement(res.data.disbursement);
      })
      .catch(() => {
        if (!cancelled) setDisbursement(null);
      });
    return () => { cancelled = true; };
  }, [id, campaign]);

  useEffect(() => {
    if (!id || !campaign) return;
    let cancelled = false;
    setDonationsLoading(true);
    api
      .get(`/donations/campaign/${id}`)
      .then((res) => {
        if (!cancelled) setDonations(res.data?.donations ?? []);
      })
      .catch(() => {
        if (!cancelled) setDonations([]);
      })
      .finally(() => {
        if (!cancelled) setDonationsLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, campaign]);

  const getNavItems = () => [
    { label: "Dashboard", href: "/beneficiary", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Campaigns", href: "/beneficiary/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Funds Received", href: "/beneficiary/funds", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Reporting", href: "/beneficiary/reporting", icon: <FileText className="w-5 h-5" /> },
  ];

  const getSettingsNavItems = () => [
    { id: "profile", label: "Profile", href: "/beneficiary/settings/profile", icon: <User className="w-5 h-5" /> },
    { id: "address", label: "Address", href: "/beneficiary/settings/address", icon: <MapPin className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", href: "/beneficiary/settings/notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "change-password", label: "Change Password", href: "/beneficiary/settings/change-password", icon: <Lock className="w-5 h-5" /> },
  ];

  const userName = user?.firstName || user?.name || user?.email || "User";
  const userRole = role || "Guest";

  const handleSaveEdit = async () => {
    if (!id || !campaign) return;
    setSaving(true);
    try {
      const res = await api.put(`/campaigns/${id}`, {
        title: form.title,
        description: form.description,
        targetAmount: form.targetAmount ? Number(form.targetAmount) : undefined,
        category: form.category || undefined,
      });
      const updated = res.data?.campaign ?? res.data;
      if (updated) {
        setCampaign((prev: any) => ({ ...prev, ...updated, id: updated._id ?? updated.id }));
        setEditing(false);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to update campaign");
    } finally {
      setSaving(false);
    }
  };

  const getProgressPercentage = () => {
    if (!campaign) return 0;
    const target = Number(campaign.targetAmount ?? 0);
    const raised = Number(campaign.amountRaised ?? 0);
    if (!target) return 0;
    return Math.min((raised / target) * 100, 100);
  };

  const daysLeft = () => {
    if (!campaign?.fundraisingDeadline) return null;
    const end = new Date(campaign.fundraisingDeadline);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const adminStatus = (campaign?.adminStatus ?? "").toLowerCase();
  const canEdit = adminStatus === "pending" || adminStatus === "rejected" || adminStatus === "flagged";

  if (loading) {
    return (
      <DashboardLayout
        navItems={getNavItems()}
        userName={userName}
        userRole={userRole}
        settingsNavItems={getSettingsNavItems()}
        onLogout={async () => { await logout(); navigate("/"); }}
      >
        <div className="flex items-center justify-center min-h-[400px] gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading campaign…</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !campaign) {
    return (
      <DashboardLayout
        navItems={getNavItems()}
        userName={userName}
        userRole={userRole}
        settingsNavItems={getSettingsNavItems()}
        onLogout={async () => { await logout(); navigate("/"); }}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md rounded-2xl border border-white/20 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-xl">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="mb-4 font-medium text-foreground">{error ?? "Campaign not found."}</p>
            <Button onClick={() => navigate("/beneficiary/campaigns")} className="w-full">
              Back to My Campaigns
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navItems={getNavItems()}
      userName={userName}
      userRole={userRole}
      settingsNavItems={getSettingsNavItems()}
      onLogout={async () => { await logout(); navigate("/"); }}
    >
      <div className="space-y-8">
        <button
          onClick={() => navigate("/beneficiary/campaigns")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Campaigns
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Hero & basic info — glassmorphism, hierarchy */}
            <Card className="overflow-hidden rounded-2xl border border-white/20 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-xl">
              <div className="h-56 flex items-center justify-center border-b border-white/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--primary)/0.08,transparent_70%)]" />
                <Heart className="w-20 h-20 text-primary/40 relative z-10" />
              </div>
              <div className="p-8">
                <div className="flex gap-3 mb-4 flex-wrap">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${(campaign.adminStatus ?? "").toLowerCase() === "pending" ? "bg-amber-100/90 text-amber-800 border-amber-200/80" : (campaign.status ?? "").toLowerCase() === "active" ? "bg-emerald-100/90 text-emerald-800 border-emerald-200/80" : "bg-primary/10 text-primary border-primary/20"}`}>
                    {(campaign.adminStatus ?? campaign.status ?? "").toLowerCase()}
                  </span>
                  {campaign.category && (
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full border bg-muted/80 text-muted-foreground border-border capitalize">
                      {campaign.category}
                    </span>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Target amount</label>
                        <Input
                          type="number"
                          min={0}
                          value={form.targetAmount}
                          onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <Input
                          value={form.category}
                          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                          placeholder="e.g. medical, education"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Save changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">{campaign.title}</h1>
                    <div className="flex flex-wrap gap-6 mb-4 text-sm font-normal text-muted-foreground">
                      {campaign.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 opacity-70" />
                          <span>{campaign.location}</span>
                        </div>
                      )}
                      {campaign.fundraisingDeadline && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 opacity-70" />
                          <span>{daysLeft() !== null ? `${daysLeft()} days left` : "Ended"}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 opacity-70" />
                        <span>{campaign.donorCount ?? 0} donors</span>
                      </div>
                    </div>
                    <div className="rounded-xl p-5 border border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
                      <p className="text-base font-normal leading-relaxed text-foreground whitespace-pre-wrap">{campaign.description || "—"}</p>
                    </div>
                    {canEdit && (
                      <Button variant="outline" className="mt-6" onClick={() => setEditing(true)}>
                        Edit campaign details
                      </Button>
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* Donation progress */}
            <Card className="rounded-2xl border border-white/20 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-lg p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">Donation progress</h2>
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-3xl font-bold text-primary">
                  ${Number(campaign.amountRaised ?? 0).toLocaleString()}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  of ${Number(campaign.targetAmount ?? 0).toLocaleString()} goal
                </span>
              </div>
              <div className="w-full rounded-full h-3 bg-muted/80 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${getProgressPercentage()}%` }} />
              </div>
              <p className="text-sm font-medium text-muted-foreground mt-3">
                {getProgressPercentage().toFixed(0)}% funded
              </p>
            </Card>

            {/* Donations / transactions */}
            <Card className="rounded-2xl border border-white/20 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-lg overflow-hidden">
              <div className="p-6 border-b border-border/80">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <ListOrdered className="w-5 h-5" />
                  Donations & transactions
                </h2>
                <p className="text-sm font-normal text-muted-foreground mt-1">Recent support for this campaign.</p>
              </div>
              <div className="p-6 pt-0">
                {donationsLoading ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading transactions…</span>
                  </div>
                ) : donations.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No donations yet.</p>
                ) : (
                  <ul className="divide-y divide-border/80">
                    {donations.map((d: any) => (
                      <li key={d._id ?? d.id} className="py-4 first:pt-0 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {d.currency ?? "USD"} {Number(d.amountFiat ?? d.amount ?? 0).toLocaleString()}
                          </p>
                          <p className="text-xs font-normal text-muted-foreground mt-0.5">
                            {(d.paymentMethod ?? "—").replace(/_/g, " ")} · {d.createdAt ? new Date(d.createdAt).toLocaleString() : "—"}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${d.status === "COMPLETED" ? "bg-emerald-100/90 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
                          {d.status ?? "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Status */}
            <Card className="rounded-2xl border border-white/20 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Status</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">Admin</p>
                  <p className="font-semibold text-foreground capitalize">{campaign.adminStatus ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">Campaign</p>
                  <p className="font-semibold text-foreground capitalize">{campaign.status ?? "—"}</p>
                </div>
                {campaign.confirmationStatus && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">Confirmation</p>
                    <p className="font-semibold text-foreground">{campaign.confirmationStatus}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Disbursement / Funds */}
            <Card className="rounded-2xl border border-white/20 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-lg p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Funds
              </h3>
              {disbursement ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Funds released
                  </div>
                  <p className="text-muted-foreground font-normal">
                    {disbursement.currency ?? "USD"} {Number(disbursement.amount ?? 0).toLocaleString()}
                  </p>
                  {disbursement.disbursedAt && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(disbursement.disbursedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm font-normal text-muted-foreground flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  Release of funds is done by an admin once the campaign is approved and ready. You will see the disbursement here once it has been processed.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
