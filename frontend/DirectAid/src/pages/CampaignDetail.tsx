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
  Pencil,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { CampaignTransactionsSection } from "../components/feature/CampaignTransactionsSection";
import { getBeneficiaryDisplayName, getCampaignDeadlineDisplay } from "../lib/utils";
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
  const { campaigns } = useApp();
  const { user, role, logout } = useAuth();

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

  const fromContext = campaigns.find((c) => c.id === id || (c as any)._id === id || (c as any).publicId === id);
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
            } else setFetchError("Campaign not found");
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

  // Get role-based navigation items (same as CampaignPage)
  const getNavItems = () => {
    const baseNavItems = [
      {
        label: "Campaigns",
        href: "/campaigns",
        icon: <FolderKanban className="w-5 h-5" />,
      },
    ];

    if (role?.toLowerCase() === "provider") {
      return [
        {
          label: "Dashboard",
          href: "/provider",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          label: "Campaigns",
          href: "/provider/campaigns",
          icon: <FolderKanban className="w-5 h-5" />,
        },
        {
          label: "Upload Invoices",
          href: "/provider/invoices",
          icon: <Upload className="w-5 h-5" />,
        },
        {
          label: "Withdrawals",
          href: "/provider/withdrawals",
          icon: <Wallet className="w-5 h-5" />,
        },
        {
          label: "Proof Upload",
          href: "/provider/proof-upload",
          icon: <FileText className="w-5 h-5" />,
        },
      ];
    } else if (role?.toLowerCase() === "beneficiary") {
      return [
        { label: "Dashboard", href: "/beneficiary", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Campaigns", href: "/beneficiary/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
        { label: "Funds Received", href: "/beneficiary/funds", icon: <DollarSign className="w-5 h-5" /> },
        { label: "Reporting", href: "/beneficiary/reporting", icon: <FileText className="w-5 h-5" /> },
      ];
    } else if (role?.toLowerCase() === "donor") {
      return [
        {
          label: "Discover",
          href: "/donor",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          label: "Campaigns",
          href: "/donor/campaigns",
          icon: <FolderKanban className="w-5 h-5" />,
        },
        {
          label: "My Donations",
          href: "/donor/donations",
          icon: <Heart className="w-5 h-5" />,
        },
        {
          label: "Receipts",
          href: "/donor/receipts",
          icon: <Receipt className="w-5 h-5" />,
        },
      ];
    }
    return baseNavItems;
  };

  const getSettingsNavItems = () => {
    if (role?.toLowerCase() === "provider") {
      return [
        { id: "profile", label: "Profile", href: "/provider/settings/profile", icon: <User className="w-5 h-5" /> },
        { id: "payouts", label: "Payouts", href: "/provider/settings/payouts", icon: <Wallet className="w-5 h-5" /> },
        { id: "notifications", label: "Notifications", href: "/provider/settings/notifications", icon: <Bell className="w-5 h-5" /> },
        { id: "change-password", label: "Change Password", href: "/provider/settings/change-password", icon: <Lock className="w-5 h-5" /> },
      ];
    } else if (role?.toLowerCase() === "beneficiary") {
      return [
        { id: "profile", label: "Profile", href: "/beneficiary/settings/profile", icon: <User className="w-5 h-5" /> },
        { id: "address", label: "Address", href: "/beneficiary/settings/address", icon: <MapPin className="w-5 h-5" /> },
        { id: "notifications", label: "Notifications", href: "/beneficiary/settings/notifications", icon: <Bell className="w-5 h-5" /> },
        { id: "change-password", label: "Change Password", href: "/beneficiary/settings/change-password", icon: <Lock className="w-5 h-5" /> },
      ];
    } else if (role?.toLowerCase() === "donor") {
      return [
        { id: "profile", label: "Profile", href: "/donor/settings/profile", icon: <User className="w-5 h-5" /> },
        { id: "payment", label: "Payment Methods", href: "/donor/settings/payment", icon: <CreditCard className="w-5 h-5" /> },
        { id: "notifications", label: "Notifications", href: "/donor/settings/notifications", icon: <Bell className="w-5 h-5" /> },
        { id: "change-password", label: "Change Password", href: "/donor/settings/change-password", icon: <Lock className="w-5 h-5" /> },
      ];
    }
    return [];
  };

  const userName = user?.name || user?.email || "User";
  const userRole = role || "Guest";
  const isLoading = !!id && !campaign && loading;

  if (isLoading) {
    return (
      <DashboardLayout
        navItems={getNavItems()}
        userName={userName}
        userRole={userRole}
        settingsNavItems={getSettingsNavItems()}
        onLogout={async () => { await logout(); navigate("/"); }}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading campaign…</p>
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
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="mb-4">{fetchError || "Campaign not found."}</p>
            <Button onClick={() => (role?.toUpperCase() === "BENEFICIARY" ? navigate("/beneficiary/campaigns") : navigate("/campaigns"))} className="w-full">
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

  // Status: show Pending when adminStatus is pending, else campaign status
  const displayStatus = (campaign as any).adminStatus === "pending" ? "Pending review" : ((campaign as any).status ?? "Active");

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
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => (role?.toUpperCase() === "BENEFICIARY" ? navigate("/beneficiary/campaigns") : navigate("/campaigns"))}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </button>
          {isBeneficiaryOwner && (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditOpen(true)}>
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>

        {/* Content */}
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Hero Section — card depth via shadow, consistent pill style */}
              <Card className="mb-6 overflow-hidden transition-all duration-200 shadow-[var(--shadow-md)]">
                <div className="h-80 flex items-center justify-center border-b border-border bg-muted">
                  <Heart className="w-24 h-24 text-primary opacity-40" />
                </div>

                <div className="p-6">
                  <div className="flex gap-3 mb-4">
                    <span
                      className="text-xs font-semibold px-3 py-1.5 rounded-md capitalize border"
                      style={{ backgroundColor: "var(--color-secondary-bg)", color: "var(--color-accent)", borderColor: "var(--color-accent)" }}
                    >
                      {displayStatus}
                    </span>
                    <span
                      className="text-xs font-semibold px-3 py-1.5 rounded-md capitalize border"
                      style={{ backgroundColor: "var(--color-secondary-bg)", color: "var(--color-accent)", borderColor: "var(--color-accent)" }}
                    >
                      {campaign.category}
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold mb-2">
                    {campaign.title}
                  </h1>

                  <div className="flex flex-wrap gap-6 mb-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{(campaign as any).metadata?.location ?? (campaign as any).location ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{getCampaignDeadlineDisplay(campaign)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span>{campaign.donorCount || 0} donors</span>
                    </div>
                  </div>

                  <div className="rounded-lg p-4 border border-border bg-muted/50">
                    <p className="leading-relaxed">
                      {campaign.description}
                    </p>
                  </div>
                </div>
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
                <CampaignTransactionsSection campaignId={id} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Donate Button (hide for owner to avoid self-donate) */}
              {!isBeneficiaryOwner && (
                <Button
                  onClick={() => navigate(`/donate?campaignId=${campaign.id}`)}
                  className="w-full mb-4 text-lg py-6"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Donate Now
                </Button>
              )}

              {/* Quick Info — padded, status as pill, accurate deadline */}
              <Card className="shadow-[var(--shadow-md)]">
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-primary">
                      Status
                    </p>
                    <span
                      className="inline-block text-xs font-semibold px-3 py-1.5 rounded-md capitalize border"
                      style={{ backgroundColor: "var(--color-secondary-bg)", color: "var(--color-accent)", borderColor: "var(--color-accent)" }}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <div className="border-t border-border pt-4 space-y-2">
                    <p className="text-xs uppercase tracking-wide text-primary">
                      Deadline
                    </p>
                    <p className="font-semibold">
                      {getCampaignDeadlineDisplay(campaign)}
                    </p>
                  </div>
                  <div className="border-t border-border pt-4 space-y-2">
                    <p className="text-xs uppercase tracking-wide text-primary">
                      Donors
                    </p>
                    <p className="font-semibold">
                      {campaign.donorCount || 0}
                    </p>
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
