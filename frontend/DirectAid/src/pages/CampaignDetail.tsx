import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
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
  Upload,
  Wallet,
  FileText,
  Receipt,
  User,
  Bell,
  Lock,
  CreditCard,
  ChevronRight,
  Loader2,
  ListOrdered,
} from "lucide-react";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const [campaign, setCampaign] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = (user as any)?.id ?? (user as any)?._id;

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
        setCampaign({
          ...c,
          id: c._id ?? c.id,
          location: c.metadata?.location ?? c.location ?? "",
          fundraisingDeadline: c.metadata?.fundraisingDeadline ?? c.fundraisingDeadline,
          amountRaised: c.amountRaised ?? 0,
          targetAmount: c.targetAmount ?? 0,
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

  const beneficiaryId = campaign?.beneficiaryId != null && typeof campaign.beneficiaryId === "object"
    ? (campaign.beneficiaryId as any)?._id
    : campaign?.beneficiaryId;
  const isOwner = Boolean(
    campaign && role?.toLowerCase() === "beneficiary" && userId && String(beneficiaryId) === String(userId)
  );

  useEffect(() => {
    if (!id || !campaign || !isOwner) return;
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
  }, [id, campaign, isOwner]);

  const getNavItems = () => {
    const baseNavItems = [{ label: "Campaigns", href: "/campaigns", icon: <FolderKanban className="w-5 h-5" /> }];
    if (role?.toLowerCase() === "provider") {
      return [
        { label: "Dashboard", href: "/provider", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Campaigns", href: "/provider/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
        { label: "Upload Invoices", href: "/provider/invoices", icon: <Upload className="w-5 h-5" /> },
        { label: "Withdrawals", href: "/provider/withdrawals", icon: <Wallet className="w-5 h-5" /> },
        { label: "Proof Upload", href: "/provider/proof-upload", icon: <FileText className="w-5 h-5" /> },
      ];
    }
    if (role?.toLowerCase() === "beneficiary") {
      return [
        { label: "Dashboard", href: "/beneficiary", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Campaigns", href: "/beneficiary/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
        { label: "Funds Received", href: "/beneficiary/funds", icon: <DollarSign className="w-5 h-5" /> },
        { label: "Reporting", href: "/beneficiary/reporting", icon: <FileText className="w-5 h-5" /> },
      ];
    }
    if (role?.toLowerCase() === "donor") {
      return [
        { label: "Discover", href: "/donor", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Campaigns", href: "/donor/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
        { label: "My Donations", href: "/donor/donations", icon: <Heart className="w-5 h-5" /> },
        { label: "Receipts", href: "/donor/receipts", icon: <Receipt className="w-5 h-5" /> },
      ];
    }
    return baseNavItems;
  };

  const getSettingsNavItems = () => {
    if (role?.toLowerCase() === "provider")
      return [
        { id: "profile", label: "Profile", href: "/provider/settings/profile", icon: <User className="w-5 h-5" /> },
        { id: "payouts", label: "Payouts", href: "/provider/settings/payouts", icon: <Wallet className="w-5 h-5" /> },
        { id: "notifications", label: "Notifications", href: "/provider/settings/notifications", icon: <Bell className="w-5 h-5" /> },
        { id: "change-password", label: "Change Password", href: "/provider/settings/change-password", icon: <Lock className="w-5 h-5" /> },
      ];
    if (role?.toLowerCase() === "beneficiary")
      return [
        { id: "profile", label: "Profile", href: "/beneficiary/settings/profile", icon: <User className="w-5 h-5" /> },
        { id: "address", label: "Address", href: "/beneficiary/settings/address", icon: <MapPin className="w-5 h-5" /> },
        { id: "notifications", label: "Notifications", href: "/beneficiary/settings/notifications", icon: <Bell className="w-5 h-5" /> },
        { id: "change-password", label: "Change Password", href: "/beneficiary/settings/change-password", icon: <Lock className="w-5 h-5" /> },
      ];
    if (role?.toLowerCase() === "donor")
      return [
        { id: "profile", label: "Profile", href: "/donor/settings/profile", icon: <User className="w-5 h-5" /> },
        { id: "payment", label: "Payment Methods", href: "/donor/settings/payment", icon: <CreditCard className="w-5 h-5" /> },
        { id: "notifications", label: "Notifications", href: "/donor/settings/notifications", icon: <Bell className="w-5 h-5" /> },
        { id: "change-password", label: "Change Password", href: "/donor/settings/change-password", icon: <Lock className="w-5 h-5" /> },
      ];
    return [];
  };

  const backHref = role?.toLowerCase() === "beneficiary" ? "/beneficiary/campaigns" : role?.toLowerCase() === "donor" ? "/donor/campaigns" : "/campaigns";
  const userName = user?.name || user?.email || "User";
  const userRole = role || "Guest";

  if (loading) {
    return (
      <DashboardLayout navItems={getNavItems()} userName={userName} userRole={userRole} settingsNavItems={getSettingsNavItems()} onLogout={async () => { await logout(); navigate("/"); }}>
        <div className="flex items-center justify-center min-h-[400px] gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading campaign…</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !campaign) {
    return (
      <DashboardLayout navItems={getNavItems()} userName={userName} userRole={userRole} settingsNavItems={getSettingsNavItems()} onLogout={async () => { await logout(); navigate("/"); }}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md rounded-2xl border border-white/20 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-xl">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="mb-4 font-medium text-foreground">{error ?? "Campaign not found."}</p>
            <Button onClick={() => navigate(backHref)} className="w-full">Back to Campaigns</Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const getProgressPercentage = () => {
    const target = Number(campaign.targetAmount ?? 0);
    const raised = Number(campaign.amountRaised ?? 0);
    if (!target) return 0;
    return Math.min((raised / target) * 100, 100);
  };

  const daysLeft = () => {
    if (!campaign.fundraisingDeadline) return null;
    const end = new Date(campaign.fundraisingDeadline);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const statusBadgeClass = (campaign.adminStatus ?? campaign.status ?? "").toLowerCase() === "pending"
    ? "bg-amber-100/90 text-amber-800 border-amber-200/80"
    : (campaign.status ?? "").toLowerCase() === "active"
      ? "bg-emerald-100/90 text-emerald-800 border-emerald-200/80"
      : "bg-primary/10 text-primary border-primary/20";

  return (
    <DashboardLayout navItems={getNavItems()} userName={userName} userRole={userRole} settingsNavItems={getSettingsNavItems()} onLogout={async () => { await logout(); navigate("/"); }}>
      <div className="space-y-8">
        <button onClick={() => navigate(backHref)} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Hero — glassmorphism, hierarchy */}
            <Card className="overflow-hidden rounded-2xl border border-white/20 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-xl">
              <div className="h-64 flex items-center justify-center border-b border-white/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--primary)/0.08,transparent_70%)]" />
                <Heart className="w-20 h-20 text-primary/40 relative z-10" />
              </div>
              <div className="p-8">
                <div className="flex gap-3 flex-wrap mb-4">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${statusBadgeClass}`}>
                    {campaign.adminStatus ?? campaign.status}
                  </span>
                  {campaign.category && (
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full border bg-muted/80 text-muted-foreground border-border capitalize">
                      {campaign.category}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
                  {campaign.title}
                </h1>
                <div className="flex flex-wrap gap-6 text-sm font-normal text-muted-foreground mb-6">
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
                  <p className="text-base font-normal leading-relaxed text-foreground whitespace-pre-wrap">
                    {campaign.description || "—"}
                  </p>
                </div>
                {isOwner && (
                  <div className="mt-6">
                    <Button variant="outline" onClick={() => navigate(`/beneficiary/campaigns/${campaign.id}`)} className="gap-2">
                      Manage campaign
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Campaign details */}
            <Card className="rounded-2xl border border-white/20 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-lg p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">Campaign details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Beneficiary</p>
                  <p className="font-semibold text-foreground">
                    {campaign.beneficiaryId?.firstName
                      ? [campaign.beneficiaryId.firstName, campaign.beneficiaryId.lastName].filter(Boolean).join(" ")
                      : campaign.beneficiary?.name ?? "Pending assignment"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Provider</p>
                  <p className="font-semibold text-foreground">DirectAid Provider Network</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Created</p>
                  <p className="font-semibold text-foreground">{campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Category</p>
                  <p className="font-semibold text-foreground capitalize">{campaign.category ?? "—"}</p>
                </div>
              </div>
            </Card>

            {/* Funding progress */}
            <Card className="rounded-2xl border border-white/20 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-lg p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">Funding progress</h2>
              <div className="flex items-end gap-6 mb-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Raised</p>
                  <p className="text-3xl font-bold text-primary">${Number(campaign.amountRaised ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Goal</p>
                  <p className="text-2xl font-bold text-foreground">${Number(campaign.targetAmount ?? 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full rounded-full h-3 bg-muted/80 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${getProgressPercentage()}%` }} />
              </div>
              <p className="text-sm font-medium text-muted-foreground mt-3">{getProgressPercentage().toFixed(0)}% of goal reached</p>
            </Card>

            {/* Donations / transactions — only for owner */}
            {isOwner && (
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
            )}
          </div>

          <div className="space-y-6">
            {!isOwner && (
              <Button onClick={() => navigate(`/donate?campaignId=${campaign.id}`)} className="w-full text-lg py-6 rounded-xl gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <Heart className="w-5 h-5" />
                Donate Now
              </Button>
            )}
            <Card className="rounded-2xl border border-white/20 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-lg p-6">
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Status</p>
                  <p className="font-semibold text-foreground capitalize">{campaign.status ?? "—"}</p>
                </div>
                <div className="border-t border-border/80 pt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Deadline</p>
                  <p className="font-semibold text-foreground">{daysLeft() !== null ? `${daysLeft()} days remaining` : "—"}</p>
                </div>
                <div className="border-t border-border/80 pt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Donors</p>
                  <p className="font-semibold text-foreground">{campaign.donorCount ?? 0}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
