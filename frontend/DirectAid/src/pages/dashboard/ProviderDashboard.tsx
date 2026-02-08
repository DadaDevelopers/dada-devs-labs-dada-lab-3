import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
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
  DollarSign,
  Users,
  ArrowUpRight,
  Bell,
  Upload,
  CheckCircle,
  Clock,
  Shield,
  FileText,
  AlertCircle,
  CheckSquare,
  User,
  Lock,
  AlertTriangle,
  Loader2,
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

interface ProviderData {
  _id: string;
  userId: string;
  businessName: string;
  email?: string;
  phone?: string;
  campaigns: string[];
  payoutMethods: any[];
  kycStatus: "PENDING" | "APPROVED" | "REJECTED";
  totalDonationsReceived: number;
  createdAt: string;
  updatedAt: string;
}

interface PayoutMethod {
  id?: string;
  _id?: string;
  method: string;
  details?: {
    bankName?: string;
    provider?: string;
    walletAddress?: string;
  };
  isDefault?: boolean;
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  campaignId?: string;
  payoutMethod?: PayoutMethod;
}

interface AppCampaign {
  _id: string;
  title: string;
  beneficiary?: { name: string };
  amountRaised: number;
  targetAmount: number;
  donorCount: number;
  status: string;
  confirmationStatus: string;
}

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { campaigns } = useApp();
  const { user, logout } = useAuth();

  // State for API data
  const [providerData, setProviderData] = useState<ProviderData | null>(null);
  const [metrics, setMetrics] = useState({
    totalCampaigns: 0,
    totalFundsRaised: 0,
    activeDonors: 0
  });
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCampaigns, setPendingCampaigns] = useState<any[]>([]);
  const [acceptedCampaigns, setAcceptedCampaigns] = useState<any[]>([]);

  // UI states
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
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

  // Fetch provider data
  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const profileResponse = await api.get("/providers/me");
        if (profileResponse.provider) {
          setProviderData(profileResponse.provider);
        }
        
        setPayouts([]);
        
      } catch (err: any) {
        console.error("Error fetching provider data:", err);
        setError(err.message || "Failed to load provider data");
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  // Fetch provider campaigns
  useEffect(() => {
    const fetchProviderCampaigns = async () => {
      if (!user?.id) return;
      
      try {
        const response = await api.get("/campaigns");
        const allCampaigns = response.campaigns || [];
        
        // Filter campaigns where providerId matches your User ID
        const providerCampaigns = allCampaigns.filter((campaign: any) => {
          const campaignProviderId = campaign.providerId?._id || campaign.providerId;
          return campaignProviderId === user.id;
        });
        
        console.log("Campaigns linked to you:", providerCampaigns);
        
        // Calculate metrics
        const totalRaised = providerCampaigns.reduce((sum: number, c: any) => 
          sum + (c.amountRaised || 0), 0);
        
        const totalDonors = providerCampaigns.reduce((sum: number, c: any) => 
          sum + (c.donorCount || 0), 0);
        
        setMetrics({
          totalCampaigns: providerCampaigns.length,
          totalFundsRaised: totalRaised,
          activeDonors: totalDonors
        });
        
        // Separate by status
        const pending = providerCampaigns.filter((c: any) => !c.providerAccepted);
        const accepted = providerCampaigns.filter((c: any) => c.providerAccepted);
        
        setPendingCampaigns(pending);
        setAcceptedCampaigns(accepted);
        
      } catch (err) {
        console.error("Error fetching provider campaigns:", err);
      }
    };
    
    if (user) {
      fetchProviderCampaigns();
    }
  }, [user]);

  // Chart data
  const fundingTrends = [
    { month: "Jun", raised: 18500 },
    { month: "Jul", raised: 25600 },
    { month: "Aug", raised: 31200 },
    { month: "Sep", raised: 38900 },
    { month: "Oct", raised: 42300 },
    { month: "Nov", raised: 245500 },
  ];

  const campaignPerformance = (campaigns as AppCampaign[]).map((c: AppCampaign) => ({
    name: c.title.split(" - ")[0],
    raised: c.amountRaised / 100,
    target: c.targetAmount / 100,
  }));

  const navItems = [
    { label: "Dashboard", href: "/provider", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Campaigns", href: "/provider/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Upload Invoices", href: "/provider/invoices", icon: <Upload className="w-5 h-5" /> },
    { label: "Withdrawals", href: "/provider/withdrawals", icon: <Wallet className="w-5 h-5" /> },
    { label: "Proof Upload", href: "/provider/proof-upload", icon: <FileText className="w-5 h-5" /> },
  ];

  const settingsNavItems = [
    { id: "profile", label: "Profile", href: "/provider/settings/profile", icon: <User className="w-5 h-5" /> },
    { id: "payouts", label: "Payouts", href: "/provider/settings/payouts", icon: <Wallet className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", href: "/provider/settings/notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "change-password", label: "Change Password", href: "/provider/settings/change-password", icon: <Lock className="w-5 h-5" /> },
  ];

  // Handler functions
  const handleWithdraw = () => {
    setWithdrawError(null);
    const availableBalance = (providerData?.totalDonationsReceived || 0) * 100;
    setWithdrawAmount(Math.max(0, availableBalance / 100));
    
    const defaultPayout = providerData?.payoutMethods?.[0];
    setSelectedPayoutId(defaultPayout?._id || defaultPayout?.id || null);
    
    setWithdrawOpen(true);
  };

  const submitWithdraw = async () => {
    setWithdrawError(null);
    const availableBalance = (providerData?.totalDonationsReceived || 0) * 100;
    const availableDollars = availableBalance / 100;
    
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
      
      await api.post("/providers/me/withdraw", {
        amount: cents,
        currency: "USD",
        payoutMethodId: selectedPayoutId,
      });

      const updatedProvider = await api.get("/providers/me");
      if (updatedProvider.provider) {
        setProviderData(updatedProvider.provider);
      }
      
      setWithdrawOpen(false);
      alert(`Withdrawal request submitted for $${withdrawAmount.toFixed(2)}`);
    } catch (err: any) {
      setWithdrawError(err?.response?.data?.message || err.message || "Unable to submit withdrawal");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleAcceptCampaign = async (campaignId: string) => {
    try {
      await api.post(`/campaigns/${campaignId}/provider-accept`, {
        notes: "Provider has accepted this campaign"
      });
      
      // Refresh campaigns
      const response = await api.get("/campaigns");
      const allCampaigns = response.campaigns || [];
      const providerCampaigns = allCampaigns.filter((campaign: any) => {
        const campaignProviderId = campaign.providerId?._id || campaign.providerId;
        return campaignProviderId === user?.id;
      });
      
      const pending = providerCampaigns.filter((c: any) => !c.providerAccepted);
      const accepted = providerCampaigns.filter((c: any) => c.providerAccepted);
      
      setPendingCampaigns(pending);
      setAcceptedCampaigns(accepted);
      setMetrics({
        totalCampaigns: providerCampaigns.length,
        totalFundsRaised: providerCampaigns.reduce((sum: number, c: any) => sum + (c.amountRaised || 0), 0),
        activeDonors: providerCampaigns.reduce((sum: number, c: any) => sum + (c.donorCount || 0), 0)
      });
      
      alert("Campaign accepted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to accept campaign");
    }
  };

  const handleSubmitForReview = async (campaignId: string) => {
    try {
      await api.post(`/campaigns/${campaignId}/submit`);
      alert("Campaign submitted for admin review!");
    } catch (err: any) {
      alert(err.message || "Failed to submit for review");
    }
  };

  const handleViewAll = () => navigate("/campaigns");
  const handleInvoiceUploadClick = (campaignId: string) => navigate(`/provider/invoices?campaignId=${campaignId}`);
  const handleCampaignWithdrawalClick = (campaignId: string) => navigate(`/provider/withdrawals?campaignId=${campaignId}`);
  const handleProofUploadClick = (campaignId: string) => navigate(`/provider/proof-upload?campaignId=${campaignId}`);

  const getCampaignWorkflowStatus = (campaignId: string, campaign: AppCampaign) => {
    const workflow = campaignWorkflows[campaignId];
    if (!workflow) return "pending";

    if (workflow.proofUploaded) return "completed";
    if (workflow.withdrawalInitiated) return "in_progress";
    if (workflow.invoiceUploaded && campaign.confirmationStatus === "both_confirmed")
      return "ready_for_withdrawal";
    if (campaign.confirmationStatus === "both_confirmed")
      return "ready_for_withdrawal";
    return "pending";
  };

  // Calculate wallet balance
  const walletBalance = {
    total: (providerData?.totalDonationsReceived || 0) * 100,
    available: (providerData?.totalDonationsReceived || 0) * 100,
    locked: 0
  };

  // Filter campaigns for display
  const providerCampaigns = (campaigns as AppCampaign[]).filter((campaign: AppCampaign) => 
    providerData?.campaigns?.includes(campaign._id) || campaign.status === 'active'
  );

  // Loading state
  if (loading) {
    return (
      <DashboardLayout
        navItems={navItems}
        userName={user?.firstName || "Provider"}
        userRole="Aid Provider"
        settingsNavItems={settingsNavItems}
        onLogout={async () => {
          await logout();
          navigate("/");
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout
        navItems={navItems}
        userName={user?.firstName || "Provider"}
        userRole="Aid Provider"
        settingsNavItems={settingsNavItems}
        onLogout={async () => {
          await logout();
          navigate("/");
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="mt-4 text-red-500">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const providerName = providerData?.businessName || user?.firstName || "Provider";

  return (
    <DashboardLayout
      navItems={navItems}
      userName={providerName}
      userRole="Aid Provider"
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
              Provider Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Upload invoices and manage fund disbursements
            </p>
          </div>
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
                  <p className="text-xs text-muted-foreground mb-2">Available</p>
                  <h3 className="text-lg font-semibold">
                    ${(walletBalance.available / 100).toFixed(2)}
                  </h3>
                </div>

                <div>
                  <label className="text-sm mb-1 block">Amount (USD)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setWithdrawAmount(Number(e.target.value))
                    }
                    min={0}
                    max={walletBalance.available / 100}
                  />
                </div>

                <div>
                  <label className="text-sm mb-1 block">Payout Method</label>
                  <select
                    className="w-full p-2 rounded-lg bg-card border border-border"
                    value={selectedPayoutId || ""}
                    onChange={(e) => setSelectedPayoutId(e.target.value)}
                  >
                    <option value="">Select a payout method</option>
                    {(providerData?.payoutMethods || []).map((pm: PayoutMethod, index: number) => (
                      <option key={pm._id || pm.id || index} value={pm._id || pm.id}>
                        {pm.method?.toUpperCase() || "METHOD"} -{" "}
                        {pm.details?.bankName || pm.details?.provider || pm.details?.walletAddress || "Payout Method"}
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
                  <Button variant="outline" onClick={() => setWithdrawOpen(false)} disabled={isWithdrawing}>
                    Cancel
                  </Button>
                  <Button className="btn-cta" onClick={submitWithdraw} disabled={isWithdrawing}>
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
            trend={`+${providerCampaigns.length} active`}
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
                  ${(walletBalance.total / 100 / 1000).toFixed(1)}K
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
                  ${(walletBalance.available / 100 / 1000).toFixed(1)}K
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Locked</p>
                <p className="font-semibold text-yellow-600">
                  ${(walletBalance.locked / 100 / 1000).toFixed(1)}K
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Campaigns Section - ADD THIS */}
        {pendingCampaigns.length > 0 && (
          <Card className="p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Campaigns Waiting Your Acceptance</h2>
            {pendingCampaigns.map((campaign: any) => (
              <div key={campaign._id} className="p-4 mb-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <h3 className="font-bold">{campaign.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAcceptCampaign(campaign._id)}>
                    Accept Campaign
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/campaign/${campaign._id}`)}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Accepted Campaigns Section - ADD THIS */}
        {acceptedCampaigns.length > 0 && (
          <Card className="p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Your Accepted Campaigns</h2>
            {acceptedCampaigns.map((campaign: any) => (
              <div key={campaign._id} className="p-4 mb-3 rounded-lg bg-green-50 border border-green-200">
                <h3 className="font-bold">{campaign.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Status: {campaign.submittedForReview ? 'Submitted for Review' : 'Accepted - Ready to Submit'}
                </p>
                <div className="flex gap-2">
                  {!campaign.submittedForReview && (
                    <Button size="sm" onClick={() => handleSubmitForReview(campaign._id)}>
                      Submit for Admin Review
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => navigate(`/campaign/${campaign._id}`)}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Active Campaigns - Keep your existing section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Active Campaigns</h2>
            <Button variant="ghost" className="gap-2 w-full sm:w-auto justify-center btn-cta" onClick={handleViewAll}>
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
            {providerCampaigns.map((campaign: AppCampaign) => {
              const workflow = campaignWorkflows[campaign._id] || {
                invoiceUploaded: false,
                withdrawalInitiated: false,
                proofUploaded: false,
              };
              const status = getCampaignWorkflowStatus(campaign._id, campaign);
              const isEligibleForWithdrawal = campaign.confirmationStatus === "both_confirmed" && workflow.invoiceUploaded;
              const isEligibleForProofUpload = workflow.withdrawalInitiated;

              return (
                <Card key={campaign._id} className="p-4 sm:p-6 card-elevated flex flex-col gap-4 sm:gap-6">
                  {/* Header with title and status */}
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <h3 className="font-bold text-lg sm:text-xl line-clamp-2">{campaign.title}</h3>
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Beneficiary: <span className="font-semibold">{campaign.beneficiary?.name || "Unknown"}</span>
                      </p>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium w-fit ${
                        status === "completed" ? "bg-green-100 text-green-700" :
                        status === "in_progress" ? "bg-blue-100 text-blue-700" :
                        status === "ready_for_withdrawal" ? "bg-purple-100 text-purple-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {status === "completed" ? "Completed" :
                         status === "in_progress" ? "In Progress" :
                         status === "ready_for_withdrawal" ? "Ready for Withdrawal" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Amount raised vs target */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Amount Raised</p>
                      <p className="font-semibold text-sm sm:text-base">
                        ${(campaign.amountRaised / 100).toFixed(0)} / ${(campaign.targetAmount / 100).toFixed(0)}
                      </p>
                    </div>
                    <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-linear-to-r from-primary to-purple-500" style={{
                        width: `${Math.min((campaign.amountRaised / campaign.targetAmount) * 100, 100)}%`,
                      }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">{campaign.donorCount} donors</p>
                  </div>

                  {/* Invoice status */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
                    {workflow.invoiceUploaded ? (
                      <>
                        <CheckSquare className="w-5 h-5 text-green-600 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-green-600">Invoice Uploaded</p>
                          <p className="text-xs text-muted-foreground">Ready for service delivery</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 text-yellow-600 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-yellow-600">Invoice Pending</p>
                          <p className="text-xs text-muted-foreground">Upload to confirm readiness</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant={workflow.invoiceUploaded ? "outline" : "default"} className="w-full gap-2 rounded-lg" onClick={() => handleInvoiceUploadClick(campaign._id)}>
                      <Upload className="w-4 h-4" />
                      {workflow.invoiceUploaded ? "View Invoice" : "Upload Invoice"}
                    </Button>
                    <Button size="sm" className="w-full gap-2 rounded-lg btn-cta" disabled={!isEligibleForWithdrawal || workflow.withdrawalInitiated} onClick={() => handleCampaignWithdrawalClick(campaign._id)}>
                      <Wallet className="w-4 h-4" />
                      {workflow.withdrawalInitiated ? "Withdrawal Processing" : "Withdraw Funds"}
                    </Button>
                    <Button size="sm" variant={workflow.proofUploaded ? "outline" : "secondary"} className="w-full gap-2 rounded-lg" disabled={!isEligibleForProofUpload} onClick={() => handleProofUploadClick(campaign._id)}>
                      <Upload className="w-4 h-4" />
                      {workflow.proofUploaded ? "View Proof" : isEligibleForProofUpload ? "Upload Proof" : "Proof Upload"}
                    </Button>
                  </div>

                  {/* Proof uploaded indicator */}
                  {workflow.proofUploaded && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100/10 border border-green-200/50">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-green-600">Proof of Service Verified</p>
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
                          {campaign.confirmationStatus !== "both_confirmed" && <li>Awaiting dual confirmation</li>}
                          {!workflow.invoiceUploaded && <li>Invoice upload required</li>}
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
          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Funding Trends</h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={fundingTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                }} />
                <Line type="monotone" dataKey="raised" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Campaign Performance</h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="raised" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="target" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} />
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
                  <Upload className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base mb-1">Upload Invoices</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">Submit invoices for your active campaigns</p>
                  </div>
                </div>
                <Button size="sm" className="w-full rounded-full gap-2 btn-cta" onClick={() => navigate("/provider/invoices")}>
                  <Upload className="w-4 h-4" /> Upload Invoices
                </Button>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3 mb-3">
                  <Upload className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base mb-1">Upload Service Receipts</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">Document service delivery for your active campaigns</p>
                  </div>
                </div>
                <Button size="sm" className="w-full rounded-full gap-2 btn-cta" onClick={() => navigate("/provider/proof-upload")}>
                  <Upload className="w-4 h-4" /> Upload Receipts
                </Button>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {providerCampaigns.filter((c: AppCampaign) => c.status === "active" && c.confirmationStatus === "both_confirmed").length > 0 ? (
                  providerCampaigns.filter((c: AppCampaign) => c.status === "active" && c.confirmationStatus === "both_confirmed").map((campaign: AppCampaign) => (
                    <div key={campaign._id} className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-[#0B1221]/50 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium truncate">{campaign.title}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-[#0B1221]/50 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="w-4 h-4 text-yellow-600 shrink-0" />
                      <span className="text-xs sm:text-sm font-medium truncate">Awaiting confirmations</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 card-elevated">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Provider Profile</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-[#0B1221]/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Business Name</p>
                <p className="font-semibold text-sm sm:text-base">{providerData?.businessName || "Not provided"}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[#0B1221]/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Verification Status</p>
                <div className="flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${
                    providerData?.kycStatus === "APPROVED" ? "text-green-600" : 
                    providerData?.kycStatus === "REJECTED" ? "text-red-600" : "text-yellow-600"
                  }`} />
                  <p className={`font-semibold text-sm sm:text-base ${
                    providerData?.kycStatus === "APPROVED" ? "text-green-600" : 
                    providerData?.kycStatus === "REJECTED" ? "text-red-600" : "text-yellow-600"
                  }`}>
                    {providerData?.kycStatus || "PENDING"}
                  </p>
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[#0B1221]/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Total Donations Received</p>
                <p className="font-semibold text-sm sm:text-base">
                  ${((providerData?.totalDonationsReceived || 0) * 100).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Withdrawal History */}
        <Card className="p-4 sm:p-6 card-elevated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Recent Withdrawals</h2>
            <Button size="lg" className="rounded-full gap-2 w-full sm:w-auto" onClick={handleWithdraw} disabled={walletBalance.available === 0}>
              <Wallet className="w-5 h-5" />
              <span className="hidden sm:inline">Withdraw Unlocked Funds</span>
              <span className="sm:hidden">Withdraw</span>
              <span>(${(walletBalance.available / 100 / 1000).toFixed(1)}K)</span>
            </Button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {payouts.length > 0 ? (
              payouts.map((payout) => (
                <div key={payout.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl bg-secondary/40 border border-border gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">
                      {providerCampaigns.find((c: AppCampaign) => c._id === payout.campaignId)?.title || "Manual Withdrawal"}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{payout.createdAt.split("T")[0]}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:text-right gap-3">
                    <div>
                      <p className="font-bold text-sm sm:text-base">${(payout.amount / 100).toFixed(2)}</p>
                      <p className={`text-xs sm:text-sm ${
                        payout.status === "completed" ? "text-green-600" :
                        payout.status === "processing" ? "text-blue-600" : "text-yellow-400"
                      }`}>
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No withdrawals yet</p>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;