import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { mockDataService } from "../../services/mockData";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { MetricCard } from "../../components/feature/MetricCard";
import { CampaignSummaryCard } from "../../components/feature/CampaignSummaryCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/card";
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Wallet,
  Settings,
  TrendingUp,
  DollarSign,
  Users,
  ArrowUpRight,
  Bell,
  Upload,
  CheckCircle,
  Clock,
  Shield,
  Eye,
} from "lucide-react";
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
  const { currentUser, campaigns, notifications } = useApp();

  // Get provider data
  const provider = mockDataService.getProviderUser();
  const metrics = mockDataService.getProviderMetrics();
  const pendingApprovals = mockDataService.getPendingApprovals();
  const activeNotifications = mockDataService.getActiveNotifications();

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
      href: "/invoices/upload",
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

  const handleWithdraw = () => {
    // Trigger withdrawal modal/action
    alert(
      `Attempting to withdraw $${(
        provider.walletBalance.available / 100
      ).toFixed(2)} in unlocked funds`
    );
  };

  const handleApprove = (campaignId: string) => {
    alert(`Campaign approved! Funds will be released.`);
  };

  const handleReview = (campaignId: string) => {
    navigate(`/campaign/${campaignId}`);
  };

  const handleViewAll = () => {
    navigate("/campaigns");
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
          <Button
            size="lg"
            className="gap-2 rounded-full w-full sm:w-auto btn-cta"
            onClick={handleWithdraw}
          >
            <Wallet className="w-5 h-5" />
            Withdraw Unlocked Funds
          </Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                        onClick={() => handleApprove(campaign.id)}
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
        </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {campaigns.map((campaign) => (
              <CampaignSummaryCard
                key={campaign.id}
                title={campaign.title}
                description={campaign.description}
                organizerName={campaign.provider?.name || "Provider"}
                amountRaised={campaign.amountRaised / 100}
                targetAmount={campaign.targetAmount / 100}
                donorCount={campaign.donorCount}
              />
            ))}
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
          <Card className="p-4 sm:p-6 card-elevated lg:col-span-2">
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
          </Card>
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
                  <Upload className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base mb-1">
                      Upload Service Receipts
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      Document service delivery for your active campaigns
                    </p>
                  </div>
                </div>
                <Button size="sm" className="w-full rounded-full gap-2 btn-cta">
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
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium truncate">
                            {campaign.title}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-[#0B1221]/50 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
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
            {mockDataService.getPayouts().map((payout) => (
              <div
                key={payout.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl bg-[#0B1221] gap-2 sm:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">
                    {campaigns.find((c) => c.id === payout.campaignId)?.title ||
                      "Campaign"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {payout.createdAt.split("T")[0]}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:text-right gap-3">
                  <div>
                    <p className="font-bold text-sm sm:text-base">
                      ${(payout.amount / 100).toFixed(0)}
                    </p>
                    <p
                      className={`text-xs sm:text-sm ${
                        payout.status === "completed"
                          ? "text-green-600"
                          : payout.status === "processing"
                          ? "text-blue-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {payout.status.charAt(0).toUpperCase() +
                        payout.status.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;
