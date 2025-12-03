import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { MetricCard } from "../../components/feature/MetricCard";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { 
  LayoutDashboard, 
  DollarSign, 
  FileText, 
  ShieldCheck, 
  Settings,
  TrendingUp,
  Calendar,
  Upload,
  CheckCircle2,
  Clock,
  Copy,
  Share2,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const BeneficiaryDashboard = () => {
  const navItems = [
    { label: "Dashboard", href: "/beneficiary", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Funds Received", href: "/", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Reporting", href: "/", icon: <FileText className="w-5 h-5" /> },
    { label: "Audit Status", href: "/", icon: <ShieldCheck className="w-5 h-5" /> },
    { label: "Settings", href: "/", icon: <Settings className="w-5 h-5" /> },
  ];

  const deliveryTimeline = [
    { status: "Completed", label: "Application Approved", date: "Nov 1, 2024" },
    { status: "Completed", label: "First Disbursement", date: "Nov 8, 2024" },
    { status: "Current", label: "Mid-Term Report Due", date: "Nov 29, 2024" },
    { status: "Upcoming", label: "Second Disbursement", date: "Dec 15, 2024" },
    { status: "Upcoming", label: "Final Report", date: "Jan 30, 2025" },
  ];

  const fundsReceived = [
    { month: "Jun", amount: 1200 },
    { month: "Jul", amount: 1800 },
    { month: "Aug", amount: 2000 },
    { month: "Sep", amount: 2200 },
    { month: "Oct", amount: 2500 },
    { month: "Nov", amount: 2800 },
  ];

  const aidDistribution = [
    { category: "Food", amount: 4500 },
    { category: "Medical", amount: 3200 },
    { category: "Education", amount: 2800 },
    { category: "Shelter", amount: 2000 },
  ];

  const impactMetrics = [
    { metric: "Families Helped", value: 45 },
    { metric: "Children Educated", value: 67 },
    { metric: "Medical Treatments", value: 89 },
    { metric: "Food Packages", value: 123 },
  ];

  const activeCampaigns = [
    { title: "Emergency Food Supply", status: "Live", progress: 45, amount: "$8,500" },
    { title: "Medical Equipment Request", status: "Pending review", progress: 0, amount: "$0" },
    { title: "School Renovation Project", status: "Completed", progress: 100, amount: "$12,000" },
  ];

  const messages = [
    { from: "Global Relief Foundation", message: "Your mid-term report has been approved. Next disbursement scheduled.", date: "2 days ago", unread: true },
    { from: "Admin Team", message: "Please upload additional documentation for verification.", date: "5 days ago", unread: false },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      userName="Maria Rodriguez"
      userRole="Aid Beneficiary"
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Beneficiary Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your aid and stay compliant with reporting requirements</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            title="Total Amount Received"
            value="$8,500"
            icon={DollarSign}
            trend="+$2,500 this month"
            trendUp
          />
          <MetricCard
            title="Last Disbursement"
            value="$2,500"
            icon={Calendar}
            trend="Nov 8, 2024"
          />
          <MetricCard
            title="Campaign Supporters"
            value="342"
            icon={TrendingUp}
            trend="From 15 donors"
            trendUp
          />
        </div>

        {/* Aid Delivery Progress */}
        <Card className="p-4 sm:p-6 card-elevated bg-card">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Aid Delivery Progress</h2>
          
          <div className="space-y-4 sm:space-y-6">
            {deliveryTimeline.map((item, index) => (
              <div key={index} className="flex gap-3 sm:gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.status === 'Completed' 
                      ? 'bg-green-500 text-white' 
                      : item.status === 'Current'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.status === 'Completed' ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </div>
                  {index < deliveryTimeline.length - 1 && (
                    <div className={`w-0.5 h-12 sm:h-16 ${
                      item.status === 'Completed' ? 'bg-green-500' : 'bg-border'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1 pb-4 sm:pb-8 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base mb-1">{item.label}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.date}</p>
                    </div>
                    {item.status === 'Current' && (
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

        {/* Analytics & Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Funds Received Over Time */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Funds Received</h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <AreaChart data={fundsReceived}>
                <defs>
                  <linearGradient id="colorFunds" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorFunds)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Aid Distribution by Category */}
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Aid Distribution</h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={aidDistribution}>
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
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          
        </div>

        {/* Active Campaigns */}
        <Card className="p-4 sm:p-6 card-elevated">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Active Requests / Campaigns</h2>
          
          <div className="space-y-4">
            {activeCampaigns.map((campaign, index) => (
              <div key={index} className="p-3 sm:p-4 rounded-2xl bg-secondary/50 border border-border">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base mb-1">{campaign.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{campaign.amount} received</p>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium self-start flex-shrink-0 ${
                    campaign.status === 'Live' ? 'bg-green-100 text-green-700' :
                    campaign.status === 'Pending review' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                
                <Progress value={campaign.progress} className="h-2 mb-3" />
                
                {campaign.status === 'Live' && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button size="sm" variant="outline" className="flex-1 rounded-full gap-2">
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 rounded-full gap-2 ">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                )}
              </div>
            ))}
            
            <Button variant="outline" className="w-full rounded-full gap-2 btn-cta">
              <Upload className="w-4 h-4 " />
              Upload More Documents
            </Button>
          </div>
        </Card>

        {/* Messages & Service Access */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 card-elevated">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Messages</h2>
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className={`p-3 sm:p-4 rounded-2xl ${msg.unread ? 'bg-primary/5 border border-primary/20' : 'bg-secondary/50'}`}>
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <p className="font-semibold text-xs sm:text-sm">{msg.from}</p>
                    {msg.unread && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>}
                  </div>
                  <p className="text-xs sm:text-sm mb-2">{msg.message}</p>
                  <p className="text-xs text-muted-foreground">{msg.date}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Service Access</h2>
            
            <div className="space-y-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-green-50 border border-green-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-green-900 text-sm sm:text-base mb-1">Provider Confirmed</h3>
                    <p className="text-xs sm:text-sm text-green-700 mb-3">
                      Global Relief Foundation has confirmed service delivery. Please confirm receipt to unlock next disbursement.
                    </p>
                    <Button size="sm" className="gap-2 rounded-full bg-green-600 hover:bg-green-700 w-full sm:w-auto ">
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Service Access
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-secondary/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Last Confirmation</p>
                <p className="font-semibold text-sm sm:text-base">November 8, 2024</p>
                <p className="text-xs text-muted-foreground mt-1">Food package delivery confirmed</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Reporting Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Compliance & Reporting</h2>
            
            <div className="space-y-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-yellow-900 text-sm sm:text-base mb-1">Mid-Term Report Due</h3>
                    <p className="text-xs sm:text-sm text-yellow-700 mb-3">Submit your progress report by November 29, 2024</p>
                    <Button size="sm" className="gap-2 rounded-full w-full sm:w-auto btn-cta">
                      <Upload className="w-4 h-4" />
                      Upload Report
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-secondary/50 gap-2">
                  <span className="text-xs sm:text-sm font-medium">Initial Assessment</span>
                  <span className="text-xs text-green-600 font-medium flex-shrink-0">Approved ✓</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-secondary/50 gap-2">
                  <span className="text-xs sm:text-sm font-medium">First Quarter Report</span>
                  <span className="text-xs text-green-600 font-medium flex-shrink-0">Submitted ✓</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-secondary/50 gap-2">
                  <span className="text-xs sm:text-sm font-medium">Audit Compliance</span>
                  <span className="text-xs text-green-600 font-medium flex-shrink-0">Verified ✓</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Campaign Details</h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="font-semibold text-sm sm:text-base mb-2">Emergency Food Supply - East Africa</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Managed by Global Relief Foundation
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Campaign Progress</span>
                    <span className="font-semibold">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <h4 className="font-semibold text-sm sm:text-base mb-2 text-primary">Your Allocation</h4>
                <p className="text-xl sm:text-2xl font-bold mb-1">$8,500</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  of $20,000 total aid package
                </p>
              </div>

              <Button variant="outline" className="w-full rounded-full btn-cta">
                View Audit History
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BeneficiaryDashboard;