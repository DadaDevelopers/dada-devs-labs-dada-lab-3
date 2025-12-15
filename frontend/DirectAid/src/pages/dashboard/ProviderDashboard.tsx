import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { mockDataService } from "../../services/mockData";
import api from "../../services/api";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { MetricCard } from "../../components/feature/MetricCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  LayoutDashboard,
  FolderKanban,
  Wallet,
  Settings,
  DollarSign,
  Users,
  ArrowUpRight,
  Bell,
  Upload,
  CheckCircle,
  Clock,
  Shield,
  Eye,
  FileText,
  AlertCircle,
  CheckSquare,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { campaigns } = useApp();

  // Get provider data
  const provider = mockDataService.getProviderUser();
  const metrics = mockDataService.getProviderMetrics();
  const pendingApprovals = mockDataService.getPendingApprovals();
  const activeNotifications = mockDataService.getActiveNotifications();
  const [payouts, setPayouts] = useState(mockDataService.getPayouts());

  // Calculate funding trends from campaign data
  const fundingTrends = [
    { month: "Jun", raised: 18500 },
    { month: "Jul", raised: 25600 },
    { month: "Aug", raised: 31200 },
    { month: "Sep", raised: 38900 },
    { month: "Oct", raised: 42300 },
    { month: "Nov", raised: 245500 },
  ];

  // Campaign performance data
  const campaignPerformance = campaigns.map((c) => ({
    name: c.title.split(" - ")[0],
    raised: c.amountRaised / 100, // Convert cents to dollars
    target: c.targetAmount / 100,
  }));

  // Geographic distribution
  const geographicDistribution = [
    { region: "East Africa", beneficiaries: 1245 },
    { region: "Middle East", beneficiaries: 892 },
    { region: "South Asia", beneficiaries: 1567 },
    { region: "Latin America", beneficiaries: 734 },
    { region: "Southeast Asia", beneficiaries: 456 },
  ];

  const navItems = [
    {
      label: "Dashboard",
      href: "/provider",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Campaigns",
      href: "/campaigns",
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
      label: "Settings",
      href: "/provider/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(
    Math.max(0, provider.walletBalance.available / 100)
  );
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(
    provider.payoutMethods?.find((p) => p.isDefault)?.id ||
      provider.payoutMethods?.[0]?.id ||
      null
  );
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Campaign workflow states: track invoice upload status
  const [campaignWorkflows, setCampaignWorkflows] = useState<{
    [key: string]: {
      invoiceId?: string;
      invoiceUploaded: boolean;
      withdrawalInitiated: boolean;
      withdrawalStatus?: string;
      proofUploaded: boolean;
      proofFiles?: Array<{ name: string; url: string }>;
    };
  }>({});

  const handleWithdraw = () => {
    setWithdrawError(null);
    setWithdrawAmount(Math.max(0, provider.walletBalance.available / 100));
    setSelectedPayoutId(
      provider.payoutMethods?.find((p) => p.isDefault)?.id ||
        provider.payoutMethods?.[0]?.id ||
        null
    );
    setWithdrawOpen(true);
  };

  const submitWithdraw = async () => {
    setWithdrawError(null);
    const availableDollars = provider.walletBalance.available / 100;
    if (!withdrawAmount || withdrawAmount <= 0) {
      setWithdrawError("Enter an amount greater than 0");
      return;
    }
    if (withdrawAmount > availableDollars) {
      setWithdrawError("Amount exceeds available unlocked balance");
      return;
    }
    if (!selectedPayoutId) {
      setWithdrawError("Select a payout method");
      return;
    }

    setIsWithdrawing(true);
    try {
      const cents = Math.round(withdrawAmount * 100);
      // Call backend payout endpoint (demo fallback supported by api.ts)
      await api.post("/payouts", {
        providerId: provider.id,
        amount: cents,
        currency: "USD",
        payoutMethodId: selectedPayoutId,
      });

      // Build payout object (UI-only, mirrors backend shape)
      const payoutMethod =
        provider.payoutMethods?.find((p) => p.id === selectedPayoutId) || null;
      const newPayout = {
        id: `payout_${Date.now()}`,
        providerId: provider.id,
        amount: cents,
        currency: "USD",
        payoutMethod: payoutMethod,
        status: "pending",
        transactionRef: `PAYOUT-${Date.now()}`,
        campaignId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update local mock provider balance to reflect withdrawal (UI-only)
      provider.walletBalance.available = Math.max(
        0,
        provider.walletBalance.available - cents
      );
      provider.walletBalance.total = Math.max(
        0,
        provider.walletBalance.total - cents
      );

      // Prepend to payouts shown in the UI
      setPayouts((prev) => [newPayout as any, ...(prev || [])]);

      // Close sheet and show confirmation
      setWithdrawOpen(false);
      alert(`Withdrawal request submitted for $${withdrawAmount.toFixed(2)}`);
    } catch (err: any) {
      setWithdrawError(
        err?.response?.data?.message || "Unable to submit withdrawal"
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleApprove = () => {
    alert(`Campaign approved! Funds will be released.`);
  };

  const handleReview = (campaignId: string) => {
    navigate(`/campaign/${campaignId}`);
  };

  const handleViewAll = () => {
    navigate("/campaigns");
  };

  // Navigation handlers for campaign workflows
  const handleInvoiceUploadClick = (campaignId: string) => {
    navigate(`/provider/invoices?campaignId=${campaignId}`);
  };

  const handleCampaignWithdrawalClick = (campaignId: string) => {
    navigate(`/provider/withdrawals?campaignId=${campaignId}`);
  };

  const handleProofUploadClick = (campaignId: string) => {
    navigate(`/provider/proof-upload?campaignId=${campaignId}`);
  };

  // Get campaign status badge
  const getCampaignWorkflowStatus = (campaignId: string, campaign: any) => {
    const workflow = campaignWorkflows[campaignId];
    if (!workflow) return "pending";

    if (workflow.proofUploaded) return "completed";
    if (workflow.withdrawalInitiated) return "in_progress";
    if (
      workflow.invoiceUploaded &&
      campaign.confirmationStatus === "both_confirmed"
    )
      return "ready_for_withdrawal";
    if (campaign.confirmationStatus === "both_confirmed")
      return "ready_for_withdrawal";
    return "pending";
  };

  return (
    <DashboardLayout
      navItems={navItems}
      userName={provider.name}
      userRole="Aid Provider"
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
              Provider Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Upload invoices and manage fund disbursements
            </p>
          </div>
          {/* <Button
            size="lg"
            className="gap-2 rounded-full w-full sm:w-auto btn-cta"
            onClick={handleWithdraw}
          >
            <Wallet className="w-5 h-5" />
            Withdraw Unlocked Funds
          </Button> */}
          {/* Withdraw Sheet */}
          <Sheet open={withdrawOpen} onOpenChange={setWithdrawOpen}>
            <SheetContent side="right" className="max-w-md">
              <SheetHeader>
                <SheetTitle>Withdraw Unlocked Funds</SheetTitle>
                <SheetDescription>
                  Transfer unlocked balance to one of your payout methods.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Available
                  </p>
                  <h3 className="text-lg font-semibold">
                    ${(provider.walletBalance.available / 100).toFixed(2)}
                  </h3>
                </div>

                <div>
                  <label className="text-sm mb-1 block">Amount (USD)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e: any) =>
                      setWithdrawAmount(Number(e.target.value))
                    }
                    min={0}
                    max={provider.walletBalance.available / 100}
                  />
                </div>

                <div>
                  <label className="text-sm mb-1 block">Payout Method</label>
                  <select
                    className="w-full p-2 rounded-lg bg-card border border-border"
                    value={selectedPayoutId || ""}
                    onChange={(e) => setSelectedPayoutId(e.target.value)}
                  >
                    {(provider.payoutMethods || []).map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.type.toUpperCase()} -{" "}
                        {pm.details?.bankName ||
                          pm.details?.provider ||
                          pm.details?.walletAddress ||
                          pm.id}
                      </option>
                    ))}
                  </select>
                </div>

                {withdrawError && (
                  <p className="text-sm text-red-500">{withdrawError}</p>
                )}
              </div>

              <SheetFooter className="mt-6">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setWithdrawOpen(false)}
                    disabled={isWithdrawing}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="btn-cta"
                    onClick={submitWithdraw}
                    disabled={isWithdrawing}
                  >
                    {isWithdrawing ? "Processing..." : "Request Withdrawal"}
                  </Button>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Total Campaigns"
            value={metrics.totalCampaigns.toString()}
            icon={FolderKanban}
            trend={`+${campaigns.length} active`}
            trendUp
          />
          <MetricCard
            title="Total Funds Raised"
            value={`$${(metrics.totalFundsRaised / 100 / 1000).toFixed(1)}K`}
            icon={DollarSign}
            trend="+12.5%"
            trendUp
          />
          <MetricCard
            title="Active Donors"
            value={metrics.activeDonors.toLocaleString()}
            icon={Users}
            trend="+8.2%"
            trendUp
          />
          <Card className="p-4 sm:p-6 card-elevated">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                  Wallet Balance
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mb-1">
                  ${(provider.walletBalance.total / 100).toFixed(1)}K
                </h3>
              </div>
              <div className="p-2 sm:p-3 rounded-2xl bg-primary/10">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm mt-3 sm:mt-4">
              <div>
                <p className="text-muted-foreground">Unlocked</p>
                <p className="font-semibold text-green-600">
                  ${(provider.walletBalance.available / 100).toFixed(1)}K
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Locked</p>
                <p className="font-semibold text-yellow-600">
                  ${(provider.walletBalance.locked / 100).toFixed(1)}K
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Approvals & Notifications */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 card-elevated">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">
                Pending Approvals
              </h2>
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                {pendingApprovals.length} pending
              </span>
            </div>

            <div className="space-y-3">
              {pendingApprovals.length > 0 ? (
                pendingApprovals.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-3 sm:p-4 rounded-2xl bg-secondary/50 border border-border"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base mb-1">
                          {campaign.title}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {campaign.beneficiary?.name || "Beneficiary"}
                        </p>
                      </div>
                      <p className="font-bold text-sm sm:text-base">
                        ${(campaign.amountRaised / 100).toFixed(0)}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        className="flex-1 rounded-full bg-green-600 hover:bg-green-700"
                        onClick={handleApprove}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm Ready
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-full btn-cta"
                        onClick={() => handleReview(campaign.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No pending approvals at this time
                </p>
              )}
            </div>
          </Card>

          <Card className="p-4 sm:p-6 card-elevated">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Notifications</h2>
              <Bell className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-3">
              {activeNotifications.length > 0 ? (
                activeNotifications.slice(0, 3).map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 sm:p-4 rounded-2xl bg-[#0B1221]/50"
                  >
                    <div className="flex gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notif.type === "donation_received"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm mb-1 font-medium">
                          {notif.title}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No new notifications
                </p>
              )}
            </div>
          </Card>
        </div> */}

        {/* Active Campaigns */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Active Campaigns</h2>
            <Button
              variant="ghost"
              className="gap-2 w-full sm:w-auto justify-center btn-cta"
              onClick={handleViewAll}
            >
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
            {campaigns.map((campaign) => {
              const workflow = campaignWorkflows[campaign.id] || {
                invoiceUploaded: false,
                withdrawalInitiated: false,
                proofUploaded: false,
              };
              const status = getCampaignWorkflowStatus(campaign.id, campaign);
              const isEligibleForWithdrawal =
                campaign.confirmationStatus === "both_confirmed" &&
                workflow.invoiceUploaded;
              const isEligibleForProofUpload = workflow.withdrawalInitiated;

              return (
                <Card
                  key={campaign.id}
                  className="p-4 sm:p-6 card-elevated flex flex-col gap-4 sm:gap-6"
                >
                  {/* Header with title and status */}
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <h3 className="font-bold text-lg sm:text-xl line-clamp-2">
                      {campaign.title}
                    </h3>
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Beneficiary:{" "}
                        <span className="font-semibold">
                          {campaign.beneficiary?.name || "Unknown"}
                        </span>
                      </p>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium w-fit ${
                          status === "completed"
                            ? "bg-green-100 text-green-700"
                            : status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : status === "ready_for_withdrawal"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {status === "completed"
                          ? "Completed"
                          : status === "in_progress"
                          ? "In Progress"
                          : status === "ready_for_withdrawal"
                          ? "Ready for Withdrawal"
                          : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Amount raised vs target */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Amount Raised
                      </p>
                      <p className="font-semibold text-sm sm:text-base">
                        ${(campaign.amountRaised / 100).toFixed(0)} / $
                        {(campaign.targetAmount / 100).toFixed(0)}
                      </p>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-primary to-purple-500"
                        style={{
                          width: `${Math.min(
                            (campaign.amountRaised / campaign.targetAmount) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {campaign.donorCount} donors
                    </p>
                  </div>

                  {/* Invoice status */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
                    {workflow.invoiceUploaded ? (
                      <>
                        <CheckSquare className="w-5 h-5 text-green-600 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-green-600">
                            Invoice Uploaded
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ready for service delivery
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 text-yellow-600 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-yellow-600">
                            Invoice Pending
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Upload to confirm readiness
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2">
                    {/* Invoice Upload / View Button */}
                    <Button
                      size="sm"
                      variant={workflow.invoiceUploaded ? "outline" : "default"}
                      className="w-full gap-2 rounded-lg"
                      onClick={() => handleInvoiceUploadClick(campaign.id)}
                    >
                      <Upload className="w-4 h-4" />
                      {workflow.invoiceUploaded
                        ? "View Invoice"
                        : "Upload Invoice"}
                    </Button>

                    {/* Withdraw Funds Button - enabled only after dual confirmation + invoice */}
                    <Button
                      size="sm"
                      className="w-full gap-2 rounded-lg btn-cta"
                      disabled={
                        !isEligibleForWithdrawal || workflow.withdrawalInitiated
                      }
                      onClick={() => handleCampaignWithdrawalClick(campaign.id)}
                    >
                      <Wallet className="w-4 h-4" />
                      {workflow.withdrawalInitiated
                        ? "Withdrawal Processing"
                        : "Withdraw Funds"}
                    </Button>

                    {/* Proof Upload Button - enabled after withdrawal */}
                    <Button
                      size="sm"
                      variant={workflow.proofUploaded ? "outline" : "secondary"}
                      className="w-full gap-2 rounded-lg"
                      disabled={!isEligibleForProofUpload}
                      onClick={() => handleProofUploadClick(campaign.id)}
                    >
                      <Upload className="w-4 h-4" />
                      {workflow.proofUploaded
                        ? "View Proof"
                        : isEligibleForProofUpload
                        ? "Upload Proof"
                        : "Proof Upload"}
                    </Button>
                  </div>

                  {/* Proof uploaded indicator */}
                  {workflow.proofUploaded && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100/10 border border-green-200/50">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-green-600">
                          Proof of Service Verified
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Eligibility note */}
                  {!isEligibleForWithdrawal && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-100/10 border border-yellow-200/50">
                      <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-yellow-700">
                        <p className="font-medium">Eligibility Required:</p>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {campaign.confirmationStatus !== "both_confirmed" && (
                            <li>Awaiting dual confirmation</li>
                          )}
                          {!workflow.invoiceUploaded && (
                            <li>Invoice upload required</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Funding Trends */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Funding Trends
            </h2>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="sm:h-[300px]"
            >
              <LineChart data={fundingTrends}>
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
                <Line
                  type="monotone"
                  dataKey="raised"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Campaign Performance */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Campaign Performance
            </h2>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="sm:h-[300px]"
            >
              <BarChart data={campaignPerformance}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar
                  dataKey="raised"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="target"
                  fill="hsl(var(--muted))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Geographic Distribution */}
          {/* <Card className="p-4 sm:p-6 card-elevated lg:col-span-2">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Geographic Distribution of Beneficiaries
            </h2>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="sm:h-[300px]"
            >
              <BarChart data={geographicDistribution} layout="horizontal">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  dataKey="region"
                  type="category"
                  stroke="hsl(var(--muted-foreground))"
                  width={80}
                  fontSize={10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Bar
                  dataKey="beneficiaries"
                  fill="hsl(var(--primary))"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card> */}
        </div>

        {/* Service Management & Provider Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Service Management
            </h2>

            <div className="space-y-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3 mb-3">
                  <Upload className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base mb-1">
                      Upload Service Receipts
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      Document service delivery for your active campaigns
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full rounded-full gap-2 btn-cta"
                  onClick={() => navigate("/provider/proof-upload")}
                >
                  <Upload className="w-4 h-4" />
                  Upload Receipts
                </Button>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {campaigns.filter(
                  (c) =>
                    c.status === "active" &&
                    c.confirmationStatus === "both_confirmed"
                ).length > 0 ? (
                  campaigns
                    .filter(
                      (c) =>
                        c.status === "active" &&
                        c.confirmationStatus === "both_confirmed"
                    )
                    .map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-[#0B1221]/50 gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-xs sm:text-sm font-medium truncate">
                            {campaign.title}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-[#0B1221]/50 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="w-4 h-4 text-yellow-600 shrink-0" />
                      <span className="text-xs sm:text-sm font-medium truncate">
                        Awaiting confirmations
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Provider Profile
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-[#0B1221]/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                  Organization Name
                </p>
                <p className="font-semibold text-sm sm:text-base">
                  {provider.organizationName}
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-[#0B1221]/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                  Verification Status
                </p>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <p className="font-semibold text-green-600 text-sm sm:text-base">
                    {provider.kycStatus === "verified"
                      ? "Verified"
                      : "Pending Verification"}
                  </p>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-[#0B1221]/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                  Registration Number
                </p>
                <p className="font-semibold text-sm sm:text-base">
                  {provider.registrationNumber}
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full rounded-full btn-cta gap-2"
                onClick={() => navigate("/provider/settings")}
              >
                <Settings className="w-4 h-4" />
                Update Profile
              </Button>
            </div>
          </Card>
        </div>

        {/* Withdrawal History */}
        <Card className="p-4 sm:p-6 card-elevated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">
              Recent Withdrawals
            </h2>
            <Button
              size="lg"
              className="rounded-full gap-2 w-full sm:w-auto"
              onClick={handleWithdraw}
              disabled={provider.walletBalance.available === 0}
            >
              <Wallet className="w-5 h-5" />
              <span className="hidden sm:inline">Withdraw Unlocked Funds</span>
              <span className="sm:hidden">Withdraw</span>
              <span>
                (${(provider.walletBalance.available / 100).toFixed(1)}K)
              </span>
            </Button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {payouts && payouts.length > 0 ? (
              payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl bg-secondary/40 border border-border gap-2 sm:gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">
                      {campaigns.find((c) => c.id === payout.campaignId)
                        ?.title || "Manual Withdrawal"}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {payout.createdAt.split("T")[0]}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:text-right gap-3">
                    <div>
                      <p className="font-bold text-sm sm:text-base">
                        ${(payout.amount / 100).toFixed(2)}
                      </p>
                      <p
                        className={`text-xs sm:text-sm ${
                          payout.status === "completed"
                            ? "text-green-600"
                            : payout.status === "processing"
                            ? "text-blue-600"
                            : "text-yellow-400"
                        }`}
                      >
                        {payout.status.charAt(0).toUpperCase() +
                          payout.status.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No withdrawals yet
              </p>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;
