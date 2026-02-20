import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Heart,
  AlertCircle,
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
  Pencil,
  Send,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "../components/ui/sheet";
import { CampaignTransactionsSection } from "../components/feature/CampaignTransactionsSection";
import { getBeneficiaryDisplayName } from "../lib/utils";
import { getCampaignById, disburseToProvider } from "../services/api";
import api from "../services/api";

function normalizeCampaign(c: any): any {
  if (!c) return c;
  const id = c._id ?? c.id;
  const amountRaised = typeof c.amountRaised === "number" ? c.amountRaised : parseFloat(String(c.amountRaised ?? 0));
  const targetAmount = typeof c.targetAmount === "number" ? c.targetAmount : parseFloat(String(c.targetAmount ?? 0));
  return {
    ...c,
    id,
    _id: id,
    amountRaised,
    targetAmount,
    donorCount: c.donorCount ?? 0,
    category: c.category ?? "",
    createdAt: c.createdAt,
    description: c.description ?? "",
    title: c.title ?? "",
    status: c.status,
    adminStatus: c.adminStatus,
    beneficiaryId: c.beneficiaryId,
    providerId: c.providerId,
    provider: c.provider,
    metadata: c.metadata,
  };
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, isLoading: appLoading, selectCampaign, selectedCampaign } = useApp();
  const { user, role, logout } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);

  const [fetchedCampaign, setFetchedCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(!!id);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [disburseAmount, setDisburseAmount] = useState("");
  const [disburseNotes, setDisburseNotes] = useState("");
  const [disbursing, setDisbursing] = useState(false);
  const [disburseError, setDisburseError] = useState<string | null>(null);

  const selectedMatchesId =
    !!selectedCampaign &&
    String(
      (selectedCampaign as any).id ??
        (selectedCampaign as any)._id ??
        (selectedCampaign as any).publicId ??
        ""
    ) === String(id);

  const fromContext = selectedMatchesId
    ? selectedCampaign
    : campaigns.find((c: any) => c.id === id || c._id === id || c.publicId === id);

  const campaign = fetchedCampaign
    ? normalizeCampaign(fetchedCampaign)
    : fromContext
      ? normalizeCampaign(fromContext)
      : null;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    getCampaignById(id)
      .then((res) => {
        if (cancelled) return;
        const body = (res as any)?.data ?? res;
        const c = (body && typeof body === "object" && body.campaign) ? body.campaign : body;
        if (c && (c._id || c.id || c.title)) setFetchedCampaign(c);
      })
      .catch((err) => {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 404 && id) {
          api.get(`/campaigns/${id}?by=public`)
            .then((pubRes: any) => {
              if (cancelled) return;
              const body = pubRes?.data ?? pubRes;
              const c = (body && body.campaign) ? body.campaign : body;
              if (c && (c._id || c.id || c.title)) {
                setFetchedCampaign(c);
                setFetchError(null);
              } else {
                setFetchError("Campaign not found");
              }
            })
            .catch(() => setFetchError(err?.message ?? "Failed to load campaign"))
            .finally(() => { if (!cancelled) setLoading(false); });
          return;
        }
        setFetchError(err?.message ?? "Failed to load campaign");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (campaign && editOpen) {
      setEditTitle(campaign.title ?? "");
      setEditDescription(campaign.description ?? "");
    }
  }, [campaign, editOpen]);

  const userId = user?.id ?? (user as any)?._id;
  const isBeneficiaryOwner =
    role?.toUpperCase() === "BENEFICIARY" &&
    userId &&
    campaign &&
    (String((campaign.beneficiaryId as any)?._id ?? campaign.beneficiaryId) === String(userId));
  const hasProvider = !!(campaign?.providerId || (campaign as any)?.provider);
  const availableToDisburse = campaign ? Number(campaign.amountRaised ?? 0) : 0;

  const handleSaveEdit = async () => {
    if (!id || !campaign) return;
    setSavingEdit(true);
    try {
      await api.put(`/campaigns/${id}`, { title: editTitle, description: editDescription });
      setFetchedCampaign((prev: any) => (prev ? { ...prev, title: editTitle, description: editDescription } : null));
      setEditOpen(false);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? e?.message ?? "Failed to update");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDisburse = async () => {
    if (!id) return;
    const amount = parseFloat(disburseAmount);
    if (isNaN(amount) || amount <= 0) {
      setDisburseError("Enter a valid amount");
      return;
    }
    if (amount > availableToDisburse) {
      setDisburseError(`Amount cannot exceed $${availableToDisburse.toLocaleString()}`);
      return;
    }
    setDisburseError(null);
    setDisbursing(true);
    try {
      await disburseToProvider(id, { amount, notes: disburseNotes || undefined });
      setDisburseAmount("");
      setDisburseNotes("");
      const updated = await getCampaignById(id);
      const c = (updated as { campaign?: any }).campaign ?? updated;
      setFetchedCampaign(c);
    } catch (e: any) {
      setDisburseError(e?.response?.data?.message ?? e?.message ?? "Disbursement failed");
    } finally {
      setDisbursing(false);
    }
  };

  // Sync selected campaign into context when possible
  useEffect(() => {
    if (id && (!selectedCampaign || String((selectedCampaign as any).id ?? (selectedCampaign as any)._id) !== String(id))) {
      setLocalLoading(true);
      selectCampaign(id).finally(() => setLocalLoading(false));
    }
  }, [id, selectedCampaign, selectCampaign]);

  const userName = user?.name || user?.email || "User";
  const userRole = role || "Guest";
  const isCampaignLoading = !!id && !campaign && (loading || localLoading || appLoading);
  const getNavItems = () => {
    switch (role) {
      case "DONOR":
        return [
          { label: "Discover", href: "/donor", icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: "Campaigns", href: "/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
          { label: "My Donations", href: "/donor/donations", icon: <Heart className="w-5 h-5" /> },
          { label: "Receipts", href: "/donor/receipts", icon: <Receipt className="w-5 h-5" /> },
        ];
      case "BENEFICIARY":
        return [
          { label: "Dashboard", href: "/beneficiary", icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: "Funds", href: "/beneficiary/funds", icon: <Wallet className="w-5 h-5" /> },
          { label: "Reporting", href: "/beneficiary/reporting", icon: <FileText className="w-5 h-5" /> },
        ];
      case "PROVIDER":
        return [
          { label: "Dashboard", href: "/provider", icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: "Campaigns", href: "/provider/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
          { label: "Invoices", href: "/provider/invoices", icon: <Upload className="w-5 h-5" />, },
          { label: "Withdrawals", href: "/provider/withdrawals", icon: <Wallet className="w-5 h-5" />, },
          { label: "Proof", href: "/provider/proof-upload", icon: <FileText className="w-5 h-5" />, },
        ];
      default:
        return [
          { label: "Discover", href: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: "Campaigns", href: "/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
        ];
    }
  };

  const getSettingsNavItems = () => {
    if (!user) {
      return [{ id: "login", label: "Sign In", href: "/login", icon: <User className="w-5 h-5" /> }];
    }
    switch (role) {
      case "DONOR":
        return [
          { id: "profile", label: "Profile", href: "/donor/settings/profile", icon: <User className="w-5 h-5" /> },
          { id: "payment", label: "Payment Methods", href: "/donor/settings/payment", icon: <CreditCard className="w-5 h-5" /> },
          { id: "notifications", label: "Notifications", href: "/donor/settings/notifications", icon: <Bell className="w-5 h-5" /> },
          { id: "change-password", label: "Change Password", href: "/donor/settings/change-password", icon: <Lock className="w-5 h-5" /> },
        ];
      case "BENEFICIARY":
        return [
          { id: "profile", label: "Profile", href: "/beneficiary/settings/profile", icon: <User className="w-5 h-5" /> },
          { id: "notifications", label: "Notifications", href: "/beneficiary/settings/notifications", icon: <Bell className="w-5 h-5" /> },
          { id: "change-password", label: "Change Password", href: "/beneficiary/settings/change-password", icon: <Lock className="w-5 h-5" /> },
        ];
      case "PROVIDER":
        return [
          { id: "profile", label: "Profile", href: "/provider/settings/profile", icon: <User className="w-5 h-5" /> },
          { id: "payouts", label: "Payouts", href: "/provider/settings/payouts", icon: <Wallet className="w-5 h-5" /> },
          { id: "notifications", label: "Notifications", href: "/provider/settings/notifications", icon: <Bell className="w-5 h-5" /> },
          { id: "change-password", label: "Change Password", href: "/provider/settings/change-password", icon: <Lock className="w-5 h-5" /> },
        ];
      default:
        return [{ id: "profile", label: "Settings", href: "/settings", icon: <User className="w-5 h-5" /> }];
    }
  };

  if (isCampaignLoading) {
    return (
      <DashboardLayout
        navItems={getNavItems()}
        userName={userName}
        userRole={userRole}
        settingsNavItems={getSettingsNavItems()}
        onLogout={async () => {
          await logout();
          navigate("/");
        }}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-primary animate-pulse font-bold tracking-widest uppercase text-sm">
            Synchronizing Audit Rail...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign || fetchError) {
    return (
      <DashboardLayout
        navItems={getNavItems()}
        userName={userName}
        userRole={userRole}
        settingsNavItems={getSettingsNavItems()}
        onLogout={async () => { await logout(); navigate("/"); }}
      >
        <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
          <Card className="p-12 text-center max-w-md border-white/10 glass-morphism shadow-2xl rounded-3xl">
            <AlertCircle className="w-20 h-20 mx-auto mb-6 text-primary opacity-30" />
            <h2 className="text-2xl font-bold mb-4">Case Not Found</h2>
            <p className="text-muted-foreground mb-8">
              {fetchError || "We couldn't find the campaign you're looking for."}
            </p>
            <Button
              onClick={() =>
                role?.toUpperCase() === "BENEFICIARY"
                  ? navigate("/beneficiary/campaigns")
                  : navigate("/campaigns")
              }
              className="w-full h-12 rounded-2xl btn-cta"
            >
              Back to Campaigns
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const getProgressPercentage = () => {
    const target = Number(campaign.targetAmount ?? 0);
    const raised = Number(campaign.amountRaised ?? 0);
    if (!target || target <= 0) return 0;
    return Math.min((raised / target) * 100, 100);
  };

  const getDeadline = () =>
    campaign.fundraisingDeadline ?? (campaign as any).metadata?.fundraisingDeadline;
  const daysLeft = (): number | null => {
    const raw = getDeadline();
    if (raw == null || raw === "") return null;
    const end = new Date(raw);
    if (Number.isNaN(end.getTime())) return null;
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };
  const getStatusLabel = () => {
    if ((campaign as any).adminStatus === "pending") return "Pending review";
    if (campaign.confirmationStatus === "provider_confirmed") return "Awaiting Beneficiary Confirmation";
    if (campaign.confirmationStatus === "both_confirmed") return "Fully Verified & Locked";
    if (campaign.confirmationStatus === "disputed") return "Audit in Progress (Disputed)";
    return campaign.status || "Active";
  };

  const getStatusBadgeColor = () => {
    if (campaign.confirmationStatus === "both_confirmed") return "bg-green-500 text-white";
    if (campaign.confirmationStatus === "provider_confirmed") return "bg-blue-500 text-white";
    if (campaign.confirmationStatus === "disputed") return "bg-red-500 text-white";
    return "bg-primary text-black";
  };

  const isOwner = user && campaign.beneficiaryId && (
    (typeof campaign.beneficiaryId === 'string' && campaign.beneficiaryId === user.id) ||
    (typeof campaign.beneficiaryId === 'object' && (campaign.beneficiaryId._id === user.id || campaign.beneficiaryId.id === user.id))
  );

  const isAssignedProvider = user && campaign.providerId && (
    (typeof campaign.providerId === 'string' && campaign.providerId === user.id) ||
    (typeof campaign.providerId === 'object' && (campaign.providerId._id === user.id || campaign.providerId.id === user.id))
  );

  return (
    <DashboardLayout
      navItems={getNavItems()}
      userName={userName}
      userRole={userRole}
      settingsNavItems={getSettingsNavItems()}
      onLogout={async () => {
        await logout();
        navigate("/");
      }}
    >
      <div className="space-y-8 animate-fade-in pb-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              role?.toUpperCase() === "BENEFICIARY"
                ? navigate("/beneficiary/campaigns")
                : navigate("/campaigns")
            }
            className="group flex items-center gap-3 text-sm font-bold text-muted-foreground hover:text-white transition-all px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/20"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Campaigns
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Audit Rail</span>
            </div>
            {isBeneficiaryOwner && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Premium Hero Section */}
            <Card className="overflow-hidden border-white/10 glass-morphism shadow-2xl border-none rounded-[2.5rem]">
              <div className="relative h-[24rem] bg-muted overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 pointer-events-none z-10" />

                <Heart className="w-32 h-32 text-primary opacity-20 animate-pulse-slow" />

                {/* Hero Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                  <div className="flex gap-2 mb-4">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${getStatusBadgeColor()}`}>
                      {getStatusLabel()}
                    </span>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-white/10 backdrop-blur-md text-white border border-white/20">
                      {campaign.category}
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
                    {campaign.title}
                  </h1>
                </div>
              </div>

              <div className="p-8 sm:p-12 space-y-10">
                {/* Quick Stats Toolbar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Location</p>
                    <div className="flex items-center gap-1.5 font-bold">
                      <MapPin className="w-4 h-4 text-primary/70" />
                      <span>{(campaign as any).location ?? (campaign as any).metadata?.location ?? "Global"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Time Remaining</p>
                    <div className="flex items-center gap-1.5 font-bold">
                      <Clock className="w-4 h-4 text-primary/70" />
                      <span>{daysLeft() == null ? "—" : `${daysLeft()} Days`}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Community</p>
                    <div className="flex items-center gap-1.5 font-bold">
                      <Users className="w-4 h-4 text-primary/70" />
                      <span>{campaign.donorCount || 0} Backers</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Protocol</p>
                    <div className="flex items-center gap-1.5 font-bold text-accent">
                      <Zap className="w-4 h-4 text-accent/70" />
                      <span>Purpose-Locked</span>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <span className="w-8 h-1 bg-primary rounded-full" />
                    The Mission
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {campaign.description}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Accountability Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 border-white/10 glass-morphism rounded-3xl space-y-4">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <User className="w-6 h-6" />
                  <h3 className="font-bold tracking-wide uppercase text-sm">Beneficiary</h3>
                </div>
                <p className="text-2xl font-bold">{campaign.beneficiary?.name || "Pending Selection"}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verified identity with DirectAid. Funds are released based on beneficiary's confirmation of service receipt.
                </p>
              </Card>

              {/* Campaign Details — padded content, spacing between label and value */}
              <Card className="mb-6 transition-all duration-200 shadow-[var(--shadow-md)]">
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold mb-6">
                    Campaign Details
                  </h2>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Beneficiary
                      </p>
                      <p className="font-semibold">
                        {getBeneficiaryDisplayName(campaign)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Provider
                      </p>
                      <p className="font-semibold">
                        DirectAid Provider Network
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Created
                      </p>
                      <p className="font-semibold">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Category
                      </p>
                      <p className="font-semibold capitalize">
                        {campaign.category}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Funding Progress — padded content */}
              <Card className="transition-all duration-200 shadow-[var(--shadow-md)]">
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold mb-6">
                    Funding Progress
                  </h2>
                  <div className="flex items-end gap-8 mb-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Raised
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        ${campaign.amountRaised.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Goal
                      </p>
                      <p className="text-2xl font-bold">
                        ${campaign.targetAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="w-full rounded-full h-3 bg-muted">
                    <div
                      className="h-3 rounded-full transition-all duration-300 bg-primary"
                      style={{
                        width: `${getProgressPercentage()}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm mt-4">
                    {getProgressPercentage().toFixed(0)}% of goal reached
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-white/10 glass-morphism rounded-3xl space-y-4">
                <div className="flex items-center gap-3 text-accent mb-2">
                  <ShieldCheck className="w-6 h-6" />
                  <h3 className="font-bold tracking-wide uppercase text-sm">Provider Network</h3>
                </div>
                <p className="text-2xl font-bold">{campaign.provider?.name || "Verified Network"}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Provider must submit verifiable invoices and proof of service before fund disbursement is authorized.
                </p>
              </Card>

              {/* Beneficiary: Disburse to provider (MVP) */}
              {isBeneficiaryOwner && hasProvider && (
                <Card className="mt-6 p-6 shadow-[var(--shadow-md)]">
                  <h2 className="text-xl font-bold mb-4">Disburse to provider</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    Available: ${availableToDisburse.toLocaleString()}. Send funds to the provider for this campaign.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="Amount"
                      value={disburseAmount}
                      onChange={(e) => setDisburseAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="text"
                      placeholder="Notes (optional)"
                      value={disburseNotes}
                      onChange={(e) => setDisburseNotes(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleDisburse} disabled={disbursing} className="gap-2 shrink-0">
                      <Send className="w-4 h-4" />
                      {disbursing ? "Sending…" : "Disburse to provider"}
                    </Button>
                  </div>
                  {disburseError && <p className="text-sm text-destructive mt-2">{disburseError}</p>}
                </Card>
              )}

              {/* Transactions (donations + withdrawals) */}
              <div className="mt-6">
                {(id || campaign?.id) && (
                  <CampaignTransactionsSection campaignId={String(id ?? campaign?.id)} />
                )}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar (Right) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-8 space-y-8">
              {/* Funding Card */}
              <Card className="p-8 border-none glass-morphism shadow-2xl rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] -mr-16 -mt-16" />

                <div className="relative space-y-8">
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Progress to Goal</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold text-white">${Number(campaign?.amountRaised ?? 0).toLocaleString()}</span>
                      <span className="text-lg text-primary font-bold">Raised</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Verification: {Math.round(getProgressPercentage())}%</span>
                      <span>Target: ${campaign.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="relative">
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary via-accent to-primary shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all duration-1000 ease-out"
                          style={{ width: `${getProgressPercentage()}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {isOwner && campaign.confirmationStatus === "provider_confirmed" ? (
                    <Button
                      onClick={() => navigate("/beneficiary/confirm")}
                      className="w-full h-16 text-lg rounded-3xl bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all"
                    >
                      <ShieldCheck className="w-6 h-6" />
                      <span>Confirm Service Receipt</span>
                    </Button>
                  ) : isOwner ? (
                    <div className="p-4 text-center rounded-2xl bg-white/5 border border-white/10 text-xs text-muted-foreground italic">
                      Awaiting provider confirmation to unlock receipt.
                    </div>
                  ) : isAssignedProvider && campaign.confirmationStatus === "pending" ? (
                    <Button
                      onClick={() => navigate("/provider/confirm")}
                      className="w-full h-16 text-lg rounded-3xl bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                    >
                      <Zap className="w-6 h-6" />
                      <span>Confirm Service Delivery</span>
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => navigate(`/donate?campaignId=${campaign.id}`)}
                        className="w-full h-16 text-lg rounded-3xl btn-cta flex items-center justify-center gap-3"
                      >
                        <Heart className="w-6 h-6" />
                        <span>Support this Mission</span>
                      </Button>
                      {userRole !== "DONOR" && userRole !== "Guest" && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Anyone can support; you can donate as a guest or sign in as a donor.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </Card>

              {/* Timeline & Transparency */}
              <Card className="p-8 border-white/10 glass-morphism rounded-3xl space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-white/5 pb-4">Transparency Audit</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-1.5 h-auto rounded-full bg-primary/30" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Fundraising</p>
                      <p className="text-xs text-muted-foreground">Ends on {new Date(campaign.fundraisingDeadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-auto rounded-full bg-white/10" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dual-Confirmation</p>
                      <p className="text-[10px] text-muted-foreground/60 italic">Locks funds until delivery is verified</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-auto rounded-full bg-white/10" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Impact Report</p>
                      <p className="text-[10px] text-muted-foreground/60 italic">Sent to backers after completion</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit campaign (beneficiary owner only) */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit campaign</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
          </div>
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingEdit}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>{savingEdit ? "Saving…" : "Save"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
