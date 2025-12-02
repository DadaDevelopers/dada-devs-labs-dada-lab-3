import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { MetricCard } from "../../components/feature/MetricCard";
import { CampaignSummaryCard } from "../../components/feature/CampaignSummaryCard";
import { Button } from "../../components/ui/button";
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
  Shield
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
  ResponsiveContainer  
} from "recharts";

const ProviderDashboard = () => {
  const navItems = [
    { label: "Dashboard", href: "/Provider/Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Campaigns", href: "/", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Create Campaign", href: "/", icon: <PlusCircle className="w-5 h-5" /> },
    { label: "Withdrawals", href: "/", icon: <Wallet className="w-5 h-5" /> },
    { label: "Settings", href: "/", icon: <Settings className="w-5 h-5" /> },
  ];

  const campaigns = [
    {
      title: "Emergency Food Supply - East Africa",
      description: "Providing essential food packages to families affected by severe drought in Kenya and Somalia.",
      organizerName: "Global Relief Foundation",
      amountRaised: 45000,
      targetAmount: 100000,
      donorCount: 342,
    },
    {
      title: "Clean Water Infrastructure",
      description: "Building sustainable water wells in rural communities lacking access to clean drinking water.",
      organizerName: "Water for Life Org",
      amountRaised: 78000,
      targetAmount: 120000,
      donorCount: 589,
    },
    {
      title: "School Supplies for Refugees",
      description: "Distributing educational materials and supplies to refugee children in temporary settlements.",
      organizerName: "Education First Initiative",
      amountRaised: 23000,
      targetAmount: 50000,
      donorCount: 156,
    },
  ];

  const fundingTrends = [
    { month: "Jun", raised: 18500 },
    { month: "Jul", raised: 25600 },
    { month: "Aug", raised: 31200 },
    { month: "Sep", raised: 38900 },
    { month: "Oct", raised: 42300 },
    { month: "Nov", raised: 45500 },
  ];

  const campaignPerformance = [
    { name: "Emergency Food", raised: 45000, target: 100000 },
    { name: "Clean Water", raised: 78000, target: 120000 },
    { name: "School Supplies", raised: 23000, target: 50000 },
    { name: "Medical Drive", raised: 56000, target: 80000 },
  ];

  const geographicDistribution = [
    { region: "East Africa", beneficiaries: 1245 },
    { region: "Middle East", beneficiaries: 892 },
    { region: "South Asia", beneficiaries: 1567 },
    { region: "Latin America", beneficiaries: 734 },
    { region: "Southeast Asia", beneficiaries: 456 },
  ];

  const pendingApprovals = [
    { name: "Maria Rodriguez", campaign: "Emergency Food Supply", amount: "$2,500", date: "Nov 28, 2024" },
    { name: "John Kimani", campaign: "Medical Equipment", amount: "$5,000", date: "Nov 27, 2024" },
  ];

  const notifications = [
    { type: "donation", message: "New donation of $500 to Emergency Food Supply", time: "2 hours ago" },
    { type: "confirmation", message: "Maria Rodriguez confirmed service access", time: "5 hours ago" },
    { type: "donation", message: "New donation of $250 to Clean Water Infrastructure", time: "1 day ago" },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      userName="Sarah Chen"
      userRole="Aid Provider"
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Provider Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your campaigns and track their impact</p>
          </div>
          <Button size="lg" className="gap-2 rounded-full w-full sm:w-auto">
            <PlusCircle className="w-5 h-5" />
            Create New Campaign
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Total Campaigns"
            value="12"
            icon={FolderKanban}
            trend="+2 this month"
            trendUp
          />
          <MetricCard
            title="Total Funds Raised"
            value="$245.5K"
            icon={DollarSign}
            trend="+12.5%"
            trendUp
          />
          <MetricCard
            title="Active Donors"
            value="1,247"
            icon={Users}
            trend="+8.2%"
            trendUp
          />
          <Card className="p-4 sm:p-6 card-elevated">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Wallet Balance</p>
                <h3 className="text-2xl sm:text-3xl font-bold mb-1">$12.3K</h3>
              </div>
              <div className="p-2 sm:p-3 rounded-2xl bg-primary/10">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm mt-3 sm:mt-4">
              <div>
                <p className="text-muted-foreground">Unlocked</p>
                <p className="font-semibold text-green-600">$8.1K</p>
              </div>
              <div>
                <p className="text-muted-foreground">Locked</p>
                <p className="font-semibold text-yellow-600">$4.2K</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Approvals & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 card-elevated">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Pending Approvals</h2>
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                {pendingApprovals.length} pending
              </span>
            </div>
            
            <div className="space-y-3">
              {pendingApprovals.map((approval, index) => (
                <div key={index} className="p-3 sm:p-4 rounded-2xl bg-secondary/50 border border-border">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm sm:text-base mb-1">{approval.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{approval.campaign}</p>
                    </div>
                    <p className="font-bold text-sm sm:text-base">{approval.amount}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button size="sm" className="flex-1 rounded-full">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 rounded-full">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6 card-elevated">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Notifications</h2>
              <Bell className="w-5 h-5 text-primary" />
            </div>
            
            <div className="space-y-3">
              {notifications.map((notif, index) => (
                <div key={index} className="p-3 sm:p-4 rounded-2xl bg-secondary/50">
                  <div className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notif.type === 'donation' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm mb-1">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Active Campaigns */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Active Campaigns</h2>
            <Button variant="ghost" className="gap-2 w-full sm:w-auto justify-center">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {campaigns.map((campaign, index) => (
              <CampaignSummaryCard key={index} {...campaign} />
            ))}
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Funding Trends */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Funding Trends</h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={fundingTrends}>
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
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Campaign Performance</h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px"
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="raised" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="target" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Geographic Distribution */}
          <Card className="p-4 sm:p-6 card-elevated lg:col-span-2">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Geographic Distribution of Beneficiaries</h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={geographicDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="region" type="category" stroke="hsl(var(--muted-foreground))" width={80} fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px"
                  }} 
                />
                <Bar dataKey="beneficiaries" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Service Management & Provider Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Service Management</h2>
            
            <div className="space-y-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3 mb-3">
                  <Upload className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base mb-1">Upload Service Receipts</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      Document service delivery for Emergency Food Supply campaign
                    </p>
                  </div>
                </div>
                <Button size="sm" className="w-full rounded-full gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Receipts
                </Button>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-secondary/50 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium truncate">Food Supply Delivered</span>
                  </div>
                  <Button size="sm" variant="ghost" className="flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-secondary/50 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium truncate">Medical Supplies Pending</span>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full flex-shrink-0 text-xs">
                    Mark Provided
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Provider Profile</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-secondary/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Organization Name</p>
                <p className="font-semibold text-sm sm:text-base">Global Relief Foundation</p>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-secondary/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Verification Status</p>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <p className="font-semibold text-green-600 text-sm sm:text-base">Verified Business</p>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-secondary/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Registration Number</p>
                <p className="font-semibold text-sm sm:text-base">NGO-2019-45678</p>
              </div>

              <Button variant="outline" className="w-full rounded-full">
                <Settings className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
            </div>
          </Card>
        </div>

        {/* Withdrawal History */}
        <Card className="p-4 sm:p-6 card-elevated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Withdrawals</h2>
            <Button size="lg" className="rounded-full gap-2 w-full sm:w-auto" disabled={false}>
              <Wallet className="w-5 h-5" />
              <span className="hidden sm:inline">Withdraw Unlocked Funds</span>
              <span className="sm:hidden">Withdraw</span>
              <span>($8.1K)</span>
            </Button>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {[
              { date: "2024-11-25", amount: "$15,000", campaign: "Emergency Food Supply", status: "Completed" },
              { date: "2024-11-20", amount: "$8,500", campaign: "Clean Water Infrastructure", status: "Completed" },
              { date: "2024-11-15", amount: "$12,000", campaign: "Medical Supplies Drive", status: "Pending" },
            ].map((withdrawal, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl bg-secondary/50 gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">{withdrawal.campaign}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{withdrawal.date}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:text-right gap-3">
                  <div>
                    <p className="font-bold text-sm sm:text-base">{withdrawal.amount}</p>
                    <p className={`text-xs sm:text-sm ${withdrawal.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {withdrawal.status}
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