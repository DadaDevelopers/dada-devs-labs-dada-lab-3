import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { donationService } from "../../services/donationService";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { MetricCard } from "../../components/feature/MetricCard";
import { CampaignSummaryCard } from "../../components/feature/CampaignSummaryCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/card";
import {
  LayoutDashboard,
  Heart,
  Receipt,
  DollarSign,
  TrendingUp,
  Download,
  ExternalLink,
  Zap,
  Bookmark,
  User,
  CreditCard,
  Bell,
  Lock,
  FolderKanban,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { campaigns, donations } = useApp();
  const { logout, user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const donor = user || { id: "guest", name: "Guest", email: "" };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await donationService.getDonorMetrics();
        setMetrics(data.metrics);
      } catch (err) {
        console.error("Failed to fetch donor metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Filter donations for this donor (though Backend already filters /me, this is safety)
  // Backend returns all donations for "me", so we use the whole list
  const donorDonations = donations;

  // Recommended campaigns (all active campaigns)
  const recommendedCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => c.status === "active")
      .slice(0, 3);
  }, [campaigns]);

  // Generate Donation Trends from real data
  const donationTrends = useMemo(() => {
    if (donorDonations.length === 0) return [];

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const last6Months: any[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: months[d.getMonth()],
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        amount: 0
      });
    }

    donorDonations.forEach(d => {
      if (d.status !== "completed" && d.status !== "released") return;
      const date = new Date(d.createdAt);
      const trendMonth = last6Months.find(m => m.monthIndex === date.getMonth() && m.year === date.getFullYear());
      if (trendMonth) {
        trendMonth.amount += (d.amount / 100);
      }
    });

    return last6Months;
  }, [donorDonations]);

  // Generate Category Distribution from real data
  const categoryDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    const colors = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

    donorDonations.forEach(d => {
      const cat = d.campaign?.category || "Other";
      dist[cat] = (dist[cat] || 0) + (d.amount / 100);
    });

    return Object.entries(dist).map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[index % colors.length]
    }));
  }, [donorDonations]);

  // Impact calculations (Simplified live impact estimate: 1 life per $50 for now, or use backend)
  const impactByCategory = useMemo(() => {
    const impact: Record<string, number> = {};
    donorDonations.forEach(d => {
      const cat = d.campaign?.category || "Other";
      // Mock logic: $50 = 1 life impact
      impact[cat] = (impact[cat] || 0) + Math.floor(d.amount / 5000);
    });
    return Object.entries(impact).map(([category, lives]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      lives
    }));
  }, [donorDonations]);

  const watchlist = [
    { name: "Rural Education Project", status: "Active", saved: "2 weeks ago" },
    { name: "Medical Supply Drive", status: "Urgent", saved: "1 month ago" },
    { name: "Clean Water Initiative", status: "Active", saved: "3 weeks ago" },
  ];

  const navItems = [
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

  const settingsNavItems = [
    { id: "profile", label: "Profile", href: "/donor/settings/profile", icon: <User className="w-5 h-5" /> },
    { id: "payment", label: "Payment Methods", href: "/donor/settings/payment", icon: <CreditCard className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", href: "/donor/settings/notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "change-password", label: "Change Password", href: "/donor/settings/change-password", icon: <Lock className="w-5 h-5" /> },
  ];

  const handleQuickDonate = () => {
    navigate("/campaigns");
  };

  const handleBrowseAll = () => {
    navigate("/campaigns");
  };

  if (loading) {
    return (
      <DashboardLayout
        navItems={navItems}
        userName={donor.name || "Guest"}
        userRole="Donor"
        settingsNavItems={settingsNavItems}
        onLogout={async () => {
          await logout();
          navigate("/");
        }}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navItems={navItems}
      userName={donor.name || "Guest"}
      userRole="Donor"
      settingsNavItems={settingsNavItems}
      onLogout={async () => {
        await logout();
        navigate("/");
      }}
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
              Discover Campaigns
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Support causes that matter and track your impact
            </p>
          </div>
          <Button
            size="lg"
            className="gap-2 rounded-full w-full sm:w-auto btn-cta"
            onClick={handleQuickDonate}
          >
            <Zap className="w-5 h-5" />
            Quick Donate
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            title="Total Donated"
            value={loading || !metrics ? "$0" : `$${(metrics.totalDonatedFiat || 0).toFixed(0)}`}
            icon={DollarSign}
            trend={loading || !metrics ? "" : `Across ${metrics.donationsCount} donations`}
            trendUp
          />
          <MetricCard
            title="Sats Donated"
            value={loading || !metrics ? "0" : Number(metrics.totalDonatedSats || 0).toLocaleString()}
            icon={Zap}
            trend="Bitcoin total"
          />
          <MetricCard
            title="Campaigns Supported"
            value={loading || !metrics ? "0" : metrics.campaignsSupported.toString()}
            icon={Heart}
            trend="Active impact"
            trendUp
          />
        </div>

        {/* Recommended Campaigns */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">
              Recommended for You
            </h2>
            <Button
              variant="ghost"
              className="gap-2 w-full sm:w-auto justify-center btn-cta"
              onClick={handleBrowseAll}
            >
              Browse All
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {recommendedCampaigns.map((campaign) => (
              <CampaignSummaryCard
                key={campaign.id}
                title={campaign.title}
                description={campaign.description}
                organizerName={campaign.provider?.name || "Provider"}
                amountRaised={campaign.amountRaised}
                targetAmount={campaign.targetAmount}
                donorCount={campaign.donorCount}
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Donation History */}
        <Card className="p-4 sm:p-6 card-elevated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Recent Donations</h2>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full w-full sm:w-auto btn-cta"
              onClick={() => navigate("/donor/donations")}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {donorDonations.length > 0 ? (
              donorDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl bg-[#0B1221]/50 hover:bg-secondary transition-colors gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold mb-1 truncate">
                      {donation.campaign?.title || "Campaign"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {donation.createdAt.split("T")[0]}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="sm:text-right">
                      <p className="font-bold text-lg">
                        ${(donation.amount / 100).toFixed(0)}
                      </p>
                      <p className="text-xs text-green-600">
                        {donation.status}
                      </p>
                    </div>

                    {donation.receiptUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full flex-shrink-0 btn-cta"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No donations yet</p>
            )}
          </div>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Donation Trends */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Donation Trends
            </h2>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="sm:h-[300px]"
            >
              <AreaChart data={donationTrends}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorAmount)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Distribution */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Donations by Category
            </h2>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="sm:h-[300px]"
            >
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Impact Metrics */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Impact by Category
            </h2>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="sm:h-[300px]"
            >
              <BarChart data={impactByCategory}>
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
                  dataKey="lives"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Impact Summary */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Your Impact
            </h2>

            <div className="space-y-4 sm:space-y-6">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  <h3 className="font-semibold text-sm sm:text-base">
                    Total Donations
                  </h3>
                </div>
                <p className="text-3xl sm:text-4xl font-bold mb-2">
                  {loading || !metrics ? "0" : metrics.donationsCount}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Contributions made to campaigns
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl bg-[#0B1221]/50">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Campaigns
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {loading || !metrics ? "0" : metrics.campaignsSupported}
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-[#0B1221]/50">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Total $
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    ${loading || !metrics ? "0" : (metrics.totalDonatedFiat || 0).toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Watchlist & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 card-elevated">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">
                Saved Beneficiaries
              </h2>
              <Bookmark className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-3">
              {watchlist.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-[#0B1221]/50 gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold mb-1 text-sm sm:text-base truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saved {item.saved}
                    </p>
                  </div>
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${item.status === "Urgent"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                      }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Donation Settings
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-[#0B1221]/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                  Email for Receipts
                </p>
                <p className="font-semibold text-sm sm:text-base truncate">
                  {donor.email || "No email set"}
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-[#0B1221]/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                  Preferred Payment Method
                </p>
                <p className="font-semibold text-sm sm:text-base">
                  Bitcoin Lightning • Ending in 8394
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-[#0B1221]/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                  Local Currency Display
                </p>
                <p className="font-semibold text-sm sm:text-base">USD ($)</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tax Information */}
        {/* <Card className="p-4 sm:p-6 card-elevated">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Tax Information
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
              <p className="text-sm text-green-700 mb-2">2024 Tax Year</p>
              <p className="text-xl sm:text-2xl font-bold text-green-900 mb-1">
                ${(metrics.totalDonated / 250000).toFixed(0)}
              </p>
              <p className="text-xs sm:text-sm text-green-600">
                Total tax-deductible donations (
                {metrics.totalDonated.toLocaleString()} sats)
              </p>
            </div>

            <Button className="w-full rounded-full gap-2 btn-cta">
              <Download className="w-4 h-4" />
              Download Annual Summary
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              All donations are tax-deductible. Consult your tax advisor for
              details.
            </p>
          </div>
        </Card> */}
      </div>
    </DashboardLayout>
  );
};

export default DonorDashboard;
