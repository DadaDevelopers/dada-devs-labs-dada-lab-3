import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import {
  useBeneficiaryCampaigns,
  useBeneficiaryMetrics,
  confirmBeneficiaryReceipt,
} from "../../hooks/useBeneficiaryApi";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { MetricCard } from "../../components/feature/MetricCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "../../components/ui/sheet";
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
  Upload,
  CheckCircle2,
  Clock,
  Copy,
  Share2,
  AlertCircle,
  PlusCircle,
  FolderKanban,
  User,
  MapPin,
  Bell,
  Lock,
  X,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BENEFICIARY_PROFILE_BANNER_DISMISSED = "beneficiary_profile_banner_dismissed";

const BeneficiaryDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { campaigns: userCampaigns, loading: _campaignsLoading, error: campaignsError, refetch: refetchCampaigns } = useBeneficiaryCampaigns();
  const { metrics, loading: metricsLoading, error: metricsError } = useBeneficiaryMetrics();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedCampaignForConfirm, setSelectedCampaignForConfirm] =
    useState<any>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [profileIncomplete, setProfileIncomplete] = useState<boolean | null>(null);
  const [profileBannerDismissed, setProfileBannerDismissed] = useState(() =>
    typeof sessionStorage !== "undefined" ? sessionStorage.getItem(BENEFICIARY_PROFILE_BANNER_DISMISSED) === "1" : false
  );

  useEffect(() => {
    let cancelled = false;
    api
      .get("/users/me")
      .then((res) => {
        if (cancelled) return;
        const u = (res.data as { user?: any }).user ?? res.data;
        const bp = u?.beneficiaryProfile;
        const missingNationalId = !bp?.nationalIdHash && !bp?.nationalId;
        const missingPreferredProvider = !bp?.preferredProvider || (typeof bp.preferredProvider === "string" && !bp.preferredProvider.trim());
        setProfileIncomplete(!!(missingNationalId || missingPreferredProvider));
      })
      .catch(() => {
        if (!cancelled) setProfileIncomplete(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dismissProfileBanner = () => {
    setProfileBannerDismissed(true);
    try {
      sessionStorage.setItem(BENEFICIARY_PROFILE_BANNER_DISMISSED, "1");
    } catch { }
  };

  const primaryCampaign = userCampaigns[0];
  const beneficiaryName = user?.firstName || user?.name || user?.email || "User";
  const showProfileBanner = profileIncomplete === true && !profileBannerDismissed;

  const handleCreateCampaign = () => {
    navigate("/campaigns/create");
  };

  // Delivery timeline - dynamically generated from campaign status
  const deliveryTimeline = primaryCampaign
    ? [
      {
        status: "Completed",
        label: "Campaign Created",
        date: primaryCampaign.createdAt ? primaryCampaign.createdAt.split("T")[0] : "Pending",
      },
      {
        status: primaryCampaign.status !== "draft" ? "Completed" : "Upcoming",
        label: "Campaign Approved",
        date: "Pending",
      },
      {
        status:
          primaryCampaign.confirmationStatus === "provider_confirmed"
            ? "Completed"
            : "Current",
        label: "Provider confirmed service",
        date: primaryCampaign.providerConfirmedAt
          ? primaryCampaign.providerConfirmedAt.split("T")[0]
          : "Pending",
      },
      {
        status:
          primaryCampaign.confirmationStatus === "both_confirmed" || primaryCampaign.beneficiaryReceipt
            ? "Completed"
            : primaryCampaign.confirmationStatus === "provider_confirmed"
              ? "Current"
              : "Upcoming",
        label: "Confirm receipt & release",
        date: primaryCampaign.beneficiaryReceipt?.confirmedAt
          ? primaryCampaign.beneficiaryReceipt.confirmedAt.split("T")[0]
          : primaryCampaign.confirmationStatus === "provider_confirmed"
            ? "Awaiting your confirmation"
            : "Pending",
      },
      { status: "Upcoming", label: "Final Report", date: "Jan 30, 2025" },
    ]
    : [];

  const fundsReceived = [
    { month: "Jun", amount: 1200 },
    { month: "Jul", amount: 1800 },
    { month: "Aug", amount: 2000 },
    { month: "Sep", amount: 2200 },
    { month: "Oct", amount: 2500 },
    { month: "Nov", amount: 2800 },
  ];

  const navItems = [
    { label: "Dashboard", href: "/beneficiary", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Campaigns", href: "/beneficiary/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Funds Received", href: "/beneficiary/funds", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Reporting", href: "/beneficiary/reporting", icon: <FileText className="w-5 h-5" /> },
  ];

  const settingsNavItems = [
    { id: "profile", label: "Profile", href: "/beneficiary/settings/profile", icon: <User className="w-5 h-5" /> },
    { id: "address", label: "Address", href: "/beneficiary/settings/address", icon: <MapPin className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", href: "/beneficiary/settings/notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "change-password", label: "Change Password", href: "/beneficiary/settings/change-password", icon: <Lock className="w-5 h-5" /> },
  ];

  const handleConfirmServiceAccess = async () => {
    if (
      primaryCampaign &&
      primaryCampaign.confirmationStatus === "provider_confirmed"
    ) {
      const id = primaryCampaign.id || primaryCampaign._id;
      if (!id) return;
      setConfirmingId(id);
      const result = await confirmBeneficiaryReceipt(id);
      setConfirmingId(null);
      if (result.ok) {
        refetchCampaigns();
        setIsConfirmModalOpen(false);
        setSelectedCampaignForConfirm(null);
      } else {
        alert(result.error || "Failed to confirm");
      }
    }
  };

  const handleShareCampaign = () => {
    if (primaryCampaign) {
      const url = `${window.location.origin}/campaign/${primaryCampaign.id}`;
      navigator.clipboard.writeText(url);
      alert("Campaign link copied to clipboard!");
    }
  };

  // Helpers for campaign UI
  const getCampaignStatusLabel = (c: any) => {
    if (c.status === "draft") return "Draft";
    if (c.confirmationStatus === "disputed") return "Rejected";
    if (c.confirmationStatus !== "provider_confirmed") return "Pending approval";
    if (c.beneficiaryReceipt) return c.status === "COMPLETED" ? "Completed" : "Service in progress";
    if (c.confirmationStatus === "provider_confirmed") return "Ready";
    if (c.status === "COMPLETED") return "Completed";
    return c.status?.charAt?.(0)?.toUpperCase() + (c.status?.slice?.(1) ?? "") || "Active";
  };

  const canEditCampaign = (c: any) => {
    return c.status === "draft" || (c.confirmationStatus !== "provider_confirmed" && c.confirmationStatus !== "disputed");
  };

  const canConfirmReadiness = (c: any) => {
    return c.confirmationStatus === "provider_confirmed";
  };

  const canViewProof = (c: any) => {
    return !!c.beneficiaryReceipt || c.status === "COMPLETED";
  };

  const handleEditCampaign = (c: any) => {
    navigate(`/campaigns/${c.id ?? c._id}`);
  };

  const handleOpenConfirmModal = (c: any) => {
    setSelectedCampaignForConfirm(c);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmReadiness = async () => {
    if (!selectedCampaignForConfirm) return;
    const id = selectedCampaignForConfirm.id || selectedCampaignForConfirm._id;
    if (!id) return;
    setConfirmingId(id);
    const result = await confirmBeneficiaryReceipt(id);
    setConfirmingId(null);
    if (result.ok) {
      refetchCampaigns();
      setIsConfirmModalOpen(false);
      setSelectedCampaignForConfirm(null);
    } else {
      alert(result.error || "Failed to confirm");
    }
  };

  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
    setSelectedCampaignForConfirm(null);
  };

  const handleViewProof = (c: any) => {
    navigate(`/campaigns/${c.id}`);
  };

  return (
    <DashboardLayout
      navItems={navItems}
      userName={beneficiaryName}
      userRole="Aid Beneficiary"
      settingsNavItems={settingsNavItems}
      onLogout={async () => {
        await logout();
        navigate("/");
      }}
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Incomplete profile banner — top of page, not overlay */}
        {showProfileBanner && (
          <div
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 sm:px-5 sm:py-4 flex flex-wrap items-center justify-between gap-3"
            role="region"
            aria-label="Complete your profile"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm sm:text-base">
                  Complete your profile
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                  Add your national ID and preferred provider in Settings so we can verify your account and match you with providers.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                onClick={() => navigate("/beneficiary/settings/profile")}
              >
                Go to profile
              </Button>
              <button
                type="button"
                onClick={dismissProfileBanner}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition"
                aria-label="Dismiss"
              >
                <span className="sr-only">Dismiss</span>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
              Beneficiary Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Create campaigns and track service delivery
            </p>
          </div>
          <Button
            size="lg"
            className="gap-2 rounded-full w-full sm:w-auto btn-cta"
            onClick={handleCreateCampaign}
          >
            <PlusCircle className="w-5 h-5" />
            Create Campaign
          </Button>
        </div>

        {/* Metrics Grid */}
        {(campaignsError || metricsError) && (
          <p className="text-sm text-destructive" role="alert">
            {campaignsError || metricsError}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            title="Total Amount Received"
            value={
              metricsLoading
                ? "…"
                : `$${Number(metrics?.totalAidReceived ?? 0).toFixed(0)}`
            }
            icon={DollarSign}
            trend={metrics ? `Across ${metrics.campaignsSupportingYou} campaign(s)` : ""}
            trendUp={false}
          />
          <MetricCard
            title="Disbursements"
            value={
              metricsLoading
                ? "…"
                : `$${Number(metrics?.totalDisbursements ?? 0).toFixed(0)}`
            }
            icon={Calendar}
            trend="Total disbursed"
          />
          <MetricCard
            title="Campaign Supporters"
            value={primaryCampaign?.donorCount?.toString() ?? "0"}
            icon={TrendingUp}
            trend={`${userCampaigns.length} campaign(s)`}
            trendUp={false}
          />
        </div>

        {/* Aid Delivery Progress */}
        {primaryCampaign && deliveryTimeline.length > 0 && (
          <Card className="p-4 sm:p-6 card-elevated bg-card">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Aid Delivery Progress
            </h2>

            <div className="space-y-4 sm:space-y-6">
              {deliveryTimeline.map((item, index) => (
                <div key={index} className="flex gap-3 sm:gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.status === "Completed"
                        ? "bg-green-500 text-white"
                        : item.status === "Current"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {item.status === "Completed" ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    {index < deliveryTimeline.length - 1 && (
                      <div
                        className={`w-0.5 h-12 sm:h-16 ${item.status === "Completed"
                          ? "bg-green-500"
                          : "bg-border"
                          }`}
                      />
                    )}
                  </div>

                  <div className="flex-1 pb-4 sm:pb-8 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base mb-1">
                          {item.label}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {item.date}
                        </p>
                      </div>
                      {item.status === "Current" && (
                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary self-start">
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Analytics & Impact */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          id="funds-recieved"
        >
          {/* Funds Received Over Time */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Funds Received
            </h2>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="sm:h-[300px]"
            >
              <AreaChart data={fundsReceived}>
                <defs>
                  <linearGradient id="colorFunds" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorFunds)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Aid Distribution by Category
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Aid Distribution
            </h2>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="sm:h-[300px]"
            >
              <BarChart data={aidDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>*/}

          {/* Messages  */}
          {/* <Card className="p-4 sm:p-6 card-elevated">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Messages</h2>
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 sm:p-4 rounded-2xl ${
                    msg.unread
                      ? "bg-primary/5 border border-primary/20"
                      : "bg-[#0B1221]/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 gap-2 ">
                    <p className="font-semibold text-xs sm:text-sm ">
                      {msg.from}
                    </p>
                    {msg.unread && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 "></span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm mb-2">{msg.message}</p>
                  <p className="text-xs text-muted-foreground">{msg.date}</p>
                </div>
              ))}
            </div>
          </Card> */}

          {/* Services */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Service Access
            </h2>

            <div className="space-y-4">
              {primaryCampaign &&
                primaryCampaign.confirmationStatus === "provider_confirmed" ? (
                <div className="p-3 sm:p-4 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--color-text-light)] text-sm sm:text-base mb-1">
                        Provider confirmed
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--color-text-light)]/80 mb-3">
                        {primaryCampaign.provider?.organization || primaryCampaign.provider?.firstName || "Provider"} has confirmed service delivery. Confirm receipt once you receive the service.
                      </p>
                      <Button
                        size="sm"
                        className="gap-2 rounded-full btn-cta w-full sm:w-auto"
                        onClick={handleConfirmServiceAccess}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm service receipt
                      </Button>
                    </div>
                  </div>
                </div>
              ) : primaryCampaign?.beneficiaryReceipt || primaryCampaign?.confirmationStatus === "both_confirmed" ? (
                <div className="p-3 sm:p-4 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--color-text-light)] text-sm sm:text-base mb-1">
                        Service receipt confirmed
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--color-text-light)]/80">
                        You confirmed receipt of the service. Funds will be released per the disbursement process.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 sm:p-4 rounded-2xl bg-[var(--color-secondary-bg)] border border-white/10">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--color-text-light)] text-sm sm:text-base mb-1">
                        Pending provider confirmation
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--color-text-light)]/70">
                        The provider is reviewing your campaign and will confirm when ready. You’ll see updates here.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 sm:p-4 rounded-2xl bg-[var(--color-secondary-bg)] border border-white/10">
                <p className="text-xs sm:text-sm text-[var(--color-text-light)]/60 mb-1 sm:mb-2">
                  Last confirmation
                </p>
                <p className="font-semibold text-sm sm:text-base text-[var(--color-text-light)]">
                  {primaryCampaign?.beneficiaryReceipt?.confirmedAt
                    ? new Date(primaryCampaign.beneficiaryReceipt.confirmedAt).toLocaleDateString()
                    : "Not yet confirmed"}
                </p>
                {primaryCampaign?.beneficiaryReceipt && (
                  <p className="text-xs text-[var(--color-text-light)]/60 mt-1">
                    {primaryCampaign.title}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Active Campaigns */}
        {userCampaigns.length > 0 && (
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Active Requests / Campaigns
            </h2>

            <div className="space-y-4">
              {userCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-3 sm:p-4 rounded-2xl bg-secondary/100 border border-border"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base mb-1">
                        {campaign.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {campaign.description
                          ? campaign.description.substring(0, 120) +
                          (campaign.description.length > 120 ? "..." : "")
                          : ""}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                        Provider:{" "}
                        <span className="font-medium">
                          {campaign.provider?.organization ||
                            (campaign.provider?.firstName || campaign.provider?.lastName
                              ? [campaign.provider.firstName, campaign.provider.lastName].filter(Boolean).join(" ")
                              : null) ||
                            "Unmatched"}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium self-start flex-shrink-0 ${getCampaignStatusLabel(campaign) === "Rejected"
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : getCampaignStatusLabel(campaign) === "Pending approval"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : getCampaignStatusLabel(campaign) === "Draft"
                            ? "bg-gray-600/30 text-gray-400 border border-white/10"
                            : getCampaignStatusLabel(campaign) === "Ready"
                              ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30"
                              : getCampaignStatusLabel(campaign) === "Service in progress" || getCampaignStatusLabel(campaign) === "Completed"
                                ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/25"
                                : "bg-[var(--color-accent)]/10 text-[var(--color-text-light)]/80 border border-white/10"
                        }`}
                    >
                      {getCampaignStatusLabel(campaign)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        ${Number(campaign.amountRaised ?? 0).toFixed(0)} raised
                      </span>
                      <span className="font-semibold">
                        ${Number(campaign.targetAmount ?? 0).toFixed(0)}
                      </span>
                    </div>
                    <Progress
                      value={campaign.progressPercentage ?? campaign.percentRaised ?? 0}
                      className="h-2 mb-3"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {canEditCampaign(campaign) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-full border border-border text-foreground"
                        onClick={() => handleEditCampaign(campaign)}
                      >
                        Edit Campaign
                      </Button>
                    )}

                    {canConfirmReadiness(campaign) && (
                      <Button
                        size="sm"
                        className="flex-1 btn-cta"
                        disabled={confirmingId === (campaign.id || campaign._id)}
                        onClick={() => handleOpenConfirmModal(campaign)}
                      >
                        {confirmingId === (campaign.id || campaign._id)
                          ? "Confirming…"
                          : "Confirm Readiness"}
                      </Button>
                    )}

                    {canViewProof(campaign) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-full border border-border text-foreground"
                        onClick={() => handleViewProof(campaign)}
                      >
                        View Proof / Status
                      </Button>
                    )}

                    {/* Share actions for active/ready campaigns (shown as active to others) */}
                    {(campaign.status === "ACTIVE" ||
                      getCampaignStatusLabel(campaign) === "Ready" ||
                      getCampaignStatusLabel(campaign) === "Service in progress") && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={handleShareCampaign}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={handleShareCampaign}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Messages & Service Access */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">



        </div>

        {/* Reporting Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Compliance & Reporting
            </h2>

            <div className="space-y-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-[var(--color-secondary-bg)] border border-[var(--color-accent)]/20">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--color-text-light)] text-sm sm:text-base mb-1">
                      Progress reporting
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--color-text-light)]/70 mb-3">
                      Submit interim or final reports for your campaigns from the Reporting page.
                    </p>
                    <Button
                      size="sm"
                      className="gap-2 rounded-full w-full sm:w-auto btn-cta"
                      onClick={() => navigate("/beneficiary/reporting")}
                    >
                      <Upload className="w-4 h-4" />
                      Go to Reporting
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-[var(--color-secondary-bg)] border border-white/10 gap-2">
                  <span className="text-xs sm:text-sm font-medium text-[var(--color-text-light)]">
                    Campaign approval
                  </span>
                  <span className="text-xs text-[var(--color-accent)] font-medium flex-shrink-0">
                    ✓ Approved
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-[var(--color-secondary-bg)] border border-white/10 gap-2">
                  <span className="text-xs sm:text-sm font-medium text-[var(--color-text-light)]">
                    Document verification
                  </span>
                  <span className="text-xs text-[var(--color-accent)] font-medium flex-shrink-0">
                    ✓ Verified
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-[var(--color-secondary-bg)] border border-white/10 gap-2">
                  <span className="text-xs sm:text-sm font-medium text-[var(--color-text-light)]">
                    Compliance check
                  </span>
                  <span className="text-xs text-[var(--color-accent)] font-medium flex-shrink-0">
                    ✓ Passed
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {primaryCampaign && (
            <Card className="p-4 sm:p-6 card-elevated">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                Campaign Details
              </h2>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-2">
                    {primaryCampaign.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    Managed by {primaryCampaign.provider?.name || "Provider"}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Campaign Progress</span>
                      <span className="font-semibold">
                        {primaryCampaign.progressPercentage}%
                      </span>
                    </div>
                    <Progress
                      value={primaryCampaign.progressPercentage}
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <h4 className="font-semibold text-sm sm:text-base mb-2 text-primary">
                    Funding Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Amount Raised</p>
                      <p className="text-lg sm:text-xl font-bold">
                        ${Number(primaryCampaign.amountRaised ?? 0).toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Target Amount</p>
                      <p className="text-lg sm:text-xl font-bold">
                        ${Number(primaryCampaign.targetAmount ?? 0).toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span className="font-semibold">
                        {(primaryCampaign.progressPercentage ?? primaryCampaign.percentRaised ?? 0).toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={primaryCampaign.progressPercentage ?? primaryCampaign.percentRaised ?? 0}
                      className="h-2"
                    />
                  </div>
                  <div className="pt-2 border-t border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Donors</p>
                    <p className="font-semibold">{primaryCampaign.donorCount} supporters</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full rounded-full btn-cta"
                  onClick={() => navigate(`/campaigns/${primaryCampaign.id ?? primaryCampaign._id}`)}
                >
                  View Full Details
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Confirm Readiness Modal */}
        <Sheet open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
          <SheetContent side="right" className="max-w-md">
            <SheetHeader>
              <SheetTitle>Confirm Service Readiness</SheetTitle>
            </SheetHeader>

            {selectedCampaignForConfirm && (
              <div className="py-6 space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-semibold mb-2">
                    {selectedCampaignForConfirm.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCampaignForConfirm.provider?.name || "Provider"}{" "}
                    has confirmed they can deliver this service.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-yellow-50/10 border border-yellow-200/30">
                  <p className="text-sm text-muted-foreground">
                    By confirming, you acknowledge receipt of the service and
                    funds will be released to the provider.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-card border border-border">
                  <p className="text-xs text-muted-foreground mb-1">
                    Target Amount
                  </p>
                  <p className="text-lg font-bold">
                    $
                    {Number(selectedCampaignForConfirm.targetAmount ?? 0).toFixed(0)}
                  </p>
                </div>
              </div>
            )}

            <SheetFooter className="mt-6 space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelConfirm}
                disabled={!!confirmingId}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 btn-cta"
                onClick={handleConfirmReadiness}
                disabled={!!confirmingId}
              >
                {confirmingId ? "Confirming…" : "Confirm Readiness"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default BeneficiaryDashboard;
