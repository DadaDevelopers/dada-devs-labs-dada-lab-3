import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { MetricCard } from "../../components/feature/MetricCard";
import { CampaignSummaryCard } from "../../components/feature/CampaignSummaryCard";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { 
  LayoutDashboard, 
  Heart, 
  Receipt, 
  Settings,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  ExternalLink,
  Zap,
  Bookmark,
  Star
} from "lucide-react";
import { 
   LineChart, 
  Line, 
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
  ResponsiveContainer  
} from "recharts";

const DonorDashboard = () => {
  const navItems = [
    { label: "Discover", href: "/donor", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "My Donations", href: "/", icon: <Heart className="w-5 h-5" /> },
    { label: "Receipts", href: "/", icon: <Receipt className="w-5 h-5" /> },
    { label: "Settings", href: "/", icon: <Settings className="w-5 h-5" /> },
  ];

  const recommendedCampaigns = [
    {
      title: "Medical Supplies for Rural Clinics",
      description: "Providing essential medical equipment and supplies to underserved healthcare facilities in remote areas.",
      organizerName: "Healthcare Access Initiative",
      amountRaised: 32000,
      targetAmount: 80000,
      donorCount: 234,
    },
    {
      title: "Education for Displaced Children",
      description: "Creating temporary learning spaces and providing educational resources for children in refugee camps.",
      organizerName: "Future Generations Foundation",
      amountRaised: 56000,
      targetAmount: 100000,
      donorCount: 445,
    },
    {
      title: "Disaster Relief - Hurricane Recovery",
      description: "Emergency shelter, food, and rebuilding assistance for communities affected by recent hurricane.",
      organizerName: "Rapid Response Network",
      amountRaised: 91000,
      targetAmount: 150000,
      donorCount: 723,
    },
  ];

  const donationHistory = [
    { date: "Nov 25, 2024", campaign: "Emergency Food Supply", amount: "$500", status: "Completed", receipt: true },
    { date: "Nov 18, 2024", campaign: "Clean Water Infrastructure", amount: "$250", status: "Completed", receipt: true },
    { date: "Nov 10, 2024", campaign: "School Supplies for Refugees", amount: "$150", status: "Completed", receipt: true },
    { date: "Nov 5, 2024", campaign: "Medical Supplies Drive", amount: "$300", status: "Completed", receipt: true },
  ];

  const donationTrends = [
    { month: "Jun", amount: 450 },
    { month: "Jul", amount: 620 },
    { month: "Aug", amount: 580 },
    { month: "Sep", amount: 720 },
    { month: "Oct", amount: 890 },
    { month: "Nov", amount: 990 },
  ];

  const categoryDistribution = [
    { name: "Emergency Relief", value: 1500, color: "hsl(var(--primary))" },
    { name: "Education", value: 950, color: "hsl(var(--chart-2))" },
    { name: "Healthcare", value: 800, color: "hsl(var(--chart-3))" },
    { name: "Infrastructure", value: 1000, color: "hsl(var(--chart-4))" },
  ];

  const impactByCategory = [
    { category: "Food Aid", lives: 127 },
    { category: "Medical", lives: 89 },
    { category: "Education", lives: 76 },
    { category: "Water", lives: 55 },
  ];

  const watchlist = [
    { name: "Rural Education Project", status: "Active", saved: "2 weeks ago" },
    { name: "Medical Supply Drive", status: "Urgent", saved: "1 month ago" },
    { name: "Clean Water Initiative", status: "Active", saved: "3 weeks ago" },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      userName="James Wilson"
      userRole="Donor"
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Discover Campaigns</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Support causes that matter and track your impact</p>
          </div>
          <Button size="lg" className="gap-2 rounded-full w-full sm:w-auto btn-cta">
            <Zap className="w-5 h-5" />
            Quick Donate
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            title="Total Donated"
            value="$4,250"
            icon={DollarSign}
            trend="+$750 this month"
            trendUp
          />
          <MetricCard
            title="Active Recurring"
            value="3"
            icon={Calendar}
            trend="Monthly donations"
          />
          <MetricCard
            title="Campaigns Supported"
            value="12"
            icon={Heart}
            trend="+2 this month"
            trendUp
          />
        </div>

        {/* Recommended Campaigns */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Recommended for You</h2>
            <Button variant="ghost" className="gap-2 w-full sm:w-auto justify-center btn-cta">
              Browse All
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {recommendedCampaigns.map((campaign, index) => (
              <CampaignSummaryCard key={index} {...campaign} />
            ))}
          </div>
        </div>

        {/* Donation History */}
        <Card className="p-4 sm:p-6 card-elevated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Recent Donations</h2>
            <Button variant="outline" size="sm" className="rounded-full w-full sm:w-auto btn-cta">
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {donationHistory.map((donation, index) => (
              <div 
                key={index} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold mb-1 truncate">{donation.campaign}</p>
                  <p className="text-sm text-muted-foreground">{donation.date}</p>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="sm:text-right">
                    <p className="font-bold text-lg">{donation.amount}</p>
                    <p className="text-xs text-green-600">{donation.status}</p>
                  </div>
                  
                  {donation.receipt && (
                    <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0 btn-cta">
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Donation Trends */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Donation Trends</h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <AreaChart data={donationTrends}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px"
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
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Donations by Category</h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
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
                    borderRadius: "12px"
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Impact Metrics */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Impact by Category</h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={impactByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px"
                  }} 
                />
                <Bar dataKey="lives" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Impact Summary */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your Impact</h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  <h3 className="font-semibold text-sm sm:text-base">Total Lives Impacted</h3>
                </div>
                <p className="text-3xl sm:text-4xl font-bold mb-2">347</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  People directly helped by your contributions
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl bg-secondary">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Campaigns</p>
                  <p className="text-xl sm:text-2xl font-bold">12</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-secondary">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Countries</p>
                  <p className="text-xl sm:text-2xl font-bold">8</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Watchlist & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 card-elevated">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Saved Beneficiaries</h2>
              <Bookmark className="w-5 h-5 text-primary" />
            </div>
            
            <div className="space-y-3">
              {watchlist.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-secondary/50 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold mb-1 text-sm sm:text-base truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Saved {item.saved}</p>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    item.status === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Donation Settings</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-secondary/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Email for Receipts</p>
                <p className="font-semibold text-sm sm:text-base truncate">james.wilson@email.com</p>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-secondary/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Preferred Payment Method</p>
                <p className="font-semibold text-sm sm:text-base">Bitcoin Lightning • Ending in 8394</p>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-secondary/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Local Currency Display</p>
                <p className="font-semibold text-sm sm:text-base">USD ($)</p>
              </div>

              <Button variant="outline" className="w-full rounded-full  btn-cta gap-2">
                <Settings className="w-4 h-4 mr-2" />
                Update Settings
              </Button>
            </div>
          </Card>
        </div>

        {/* Tax Information */}
        <Card className="p-4 sm:p-6 card-elevated">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Tax Information</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
              <p className="text-sm text-green-700 mb-2">2024 Tax Year</p>
              <p className="text-xl sm:text-2xl font-bold text-green-900 mb-1">$4,250</p>
              <p className="text-xs sm:text-sm text-green-600">Total tax-deductible donations (21,250,000 sats)</p>
            </div>

            <Button className="w-full rounded-full gap-2 btn-cta">
              <Download className="w-4 h-4" />
              Download Annual Summary
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              All donations are tax-deductible. Consult your tax advisor for details.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DonorDashboard;