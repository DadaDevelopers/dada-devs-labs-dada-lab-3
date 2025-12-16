import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { mockDataService } from "../../services/mockData";
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
  AlertCircle,
  Eye,
  PlusCircle,
  FolderKanban,
  Heart,
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
  ResponsiveContainer,
} from "recharts";

const BeneficiaryDashboard = () => {
  const navigate = useNavigate();
  const { campaigns, updateCampaign } = useApp();
  const beneficiary = mockDataService.getBeneficiaryUser();
  const metrics = mockDataService.getBeneficiaryMetrics();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedCampaignForConfirm, setSelectedCampaignForConfirm] =
    useState<any>(null);

  // Get campaigns for this beneficiary
  const userCampaigns = campaigns.filter(
    (c) => c.beneficiaryId === beneficiary.id
  );
  const primaryCampaign = userCampaigns[0];

  const handleCreateCampaign = () => {
    navigate("/campaigns/create");
  };

  // Delivery timeline - dynamically generated from campaign status
  const deliveryTimeline = primaryCampaign
    ? [
        {
          status: "Completed",
          label: "Campaign Created",
          date: primaryCampaign.createdAt.split("T")[0],
        },
        {
          status: primaryCampaign.status !== "draft" ? "Completed" : "Upcoming",
          label: "Campaign Approved",
          date: "Pending",
        },
        {
          status:
            primaryCampaign.confirmationStatus === "provider_confirmed" ||
            primaryCampaign.confirmationStatus === "both_confirmed"
              ? "Completed"
              : "Current",
          label: "Provider Confirmed Service",
          date: primaryCampaign.providerConfirmedAt
            ? primaryCampaign.providerConfirmedAt.split("T")[0]
            : "Pending",
        },
        {
          status:
            primaryCampaign.confirmationStatus === "both_confirmed"
              ? "Completed"
              : "Upcoming",
          label: "Beneficiary Confirmation",
          date: primaryCampaign.beneficiaryConfirmedAt
            ? primaryCampaign.beneficiaryConfirmedAt.split("T")[0]
            : "Awaiting action",
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

  const aidDistribution = [
    { category: "Food", amount: 4500 },
    { category: "Medical", amount: 3200 },
    { category: "Education", amount: 2800 },
    { category: "Shelter", amount: 2000 },
  ];

  const messages = [
    {
      from: primaryCampaign?.provider?.name || "Global Relief Foundation",
      message:
        primaryCampaign?.confirmationStatus === "provider_confirmed"
          ? "Service is ready. Please confirm receipt to unlock funds."
          : "We're preparing services for you. Stay tuned.",
      date: "2 days ago",
      unread: primaryCampaign?.confirmationStatus === "provider_confirmed",
    },
    {
      from: "Admin Team",
      message: "Your campaign has been approved. Funds are being collected.",
      date: "5 days ago",
      unread: false,
    },
  ];

  const navItems = [
    {
      label: "Dashboard",
      href: "/beneficiary",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Funds Received",
      href: "/beneficiary/funds",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: "Reporting",
      href: "/beneficiary/reporting",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: "Settings",
      href: "/beneficiary/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleConfirmServiceAccess = () => {
    if (
      primaryCampaign &&
      primaryCampaign.confirmationStatus === "provider_confirmed"
    ) {
      alert(
        "✓ Service access confirmed! Funds will be released to the provider."
      );
    }
  };

  const handleShareCampaign = () => {
    if (primaryCampaign) {
      const url = `${window.location.origin}/campaign/${primaryCampaign.id}`;
      navigator.clipboard.writeText(url);
      alert("Campaign link copied to clipboard!");
    }
  };

  const handleUploadDocuments = () => {
    alert("Document upload dialog would open here");
  };

  const handleUploadReport = () => {
    alert("Report upload dialog would open here");
  };

  // Helpers for campaign UI
  const getCampaignStatusLabel = (c: any) => {
    if (c.status === "draft") return "Draft";
    if (c.status === "pending_approval") return "Pending Confirmation";
    if (c.confirmationStatus === "provider_confirmed") return "Ready";
    if (c.confirmationStatus === "both_confirmed")
      return c.status === "completed" ? "Completed" : "Service In Progress";
    if (c.status === "completed") return "Completed";
    return c.status.charAt(0).toUpperCase() + c.status.slice(1);
  };

  const canEditCampaign = (c: any) => {
    return c.status === "draft" || c.status === "pending_approval";
  };

  const canConfirmReadiness = (c: any) => {
    return c.confirmationStatus === "provider_confirmed";
  };

  const canViewProof = (c: any) => {
    return (
      c.confirmationStatus === "both_confirmed" ||
      c.status === "in_progress" ||
      c.status === "completed"
    );
  };

  const handleEditCampaign = (c: any) => {
    navigate(`/campaigns/edit/${c.id}`);
  };

  const handleOpenConfirmModal = (c: any) => {
    setSelectedCampaignForConfirm(c);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmReadiness = () => {
    if (!selectedCampaignForConfirm) return;
    updateCampaign(selectedCampaignForConfirm.id, {
      confirmationStatus: "both_confirmed",
      status: "in_progress",
    });
    setIsConfirmModalOpen(false);
    setSelectedCampaignForConfirm(null);
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
      userName={beneficiary.name}
      userRole="Aid Beneficiary"
    >
      <div className="space-y-6 sm:space-y-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            title="Total Amount Received"
            value={`$${(metrics.totalAidReceived / 100).toFixed(0)}`}
            icon={DollarSign}
            trend={`+$${(metrics.totalAidReceived / 100 - 6000).toFixed(
              0
            )} this month`}
            trendUp
          />
          <MetricCard
            title="Last Disbursement"
            value={`$${(metrics.totalDisbursements / 100).toFixed(0)}`}
            icon={Calendar}
            trend="Nov 8, 2024"
          />
          <MetricCard
            title="Campaign Supporters"
            value={primaryCampaign?.donorCount.toString() || "0"}
            icon={TrendingUp}
            trend={`From ${Math.ceil(
              (primaryCampaign?.donorCount || 0) / 20
            )} donors`}
            trendUp
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
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.status === "Completed"
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
                        className={`w-0.5 h-12 sm:h-16 ${
                          item.status === "Completed"
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
                <div className="p-3 sm:p-4 rounded-2xl bg-green-50 border border-green-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-green-900 text-sm sm:text-base mb-1">
                        Provider Confirmed
                      </h3>
                      <p className="text-xs sm:text-sm text-green-700 mb-3">
                        {primaryCampaign.provider?.name || "Provider"} has
                        confirmed service delivery. Please confirm receipt to
                        unlock next disbursement.
                      </p>
                      <Button
                        size="sm"
                        className="gap-2 rounded-full bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                        onClick={handleConfirmServiceAccess}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm Service Access
                      </Button>
                    </div>
                  </div>
                </div>
              ) : primaryCampaign &&
                primaryCampaign.confirmationStatus === "both_confirmed" ? (
                <div className="p-3 sm:p-4 rounded-2xl bg-green-50 border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-green-900 text-sm sm:text-base mb-1">
                        Service Access Confirmed
                      </h3>
                      <p className="text-xs sm:text-sm text-green-700">
                        You have confirmed service receipt. Funds have been
                        released to the provider.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 sm:p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-yellow-900 text-sm sm:text-base mb-1">
                        Awaiting Provider Confirmation
                      </h3>
                      <p className="text-xs sm:text-sm text-yellow-700">
                        The service provider is reviewing your request and will
                        confirm when ready.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 sm:p-4 rounded-2xl bg-[#0B1221]/50">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                  Last Confirmation
                </p>
                <p className="font-semibold text-sm sm:text-base">
                  {primaryCampaign?.beneficiaryConfirmedAt
                    ? new Date(
                        primaryCampaign.beneficiaryConfirmedAt
                      ).toLocaleDateString()
                    : "Not yet confirmed"}
                </p>
                {primaryCampaign?.confirmationStatus === "both_confirmed" && (
                  <p className="text-xs text-muted-foreground mt-1">
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
                          {campaign.provider?.name || "Unmatched"}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium self-start flex-shrink-0 ${
                        getCampaignStatusLabel(campaign) === "Draft"
                          ? "bg-gray-700 text-white"
                          : getCampaignStatusLabel(campaign) ===
                            "Pending Confirmation"
                          ? "bg-yellow-100 text-yellow-700"
                          : getCampaignStatusLabel(campaign) === "Ready"
                          ? "bg-blue-100 text-blue-700"
                          : getCampaignStatusLabel(campaign) ===
                            "Service In Progress"
                          ? "bg-primary/10 text-primary"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {getCampaignStatusLabel(campaign)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        ${(campaign.amountRaised / 100).toFixed(0)} raised
                      </span>
                      <span className="font-semibold">
                        ${(campaign.targetAmount / 100).toFixed(0)}
                      </span>
                    </div>
                    <Progress
                      value={campaign.progressPercentage}
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
                        onClick={() => handleOpenConfirmModal(campaign)}
                      >
                        Confirm Readiness
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

                    {/* Share actions for active/ready campaigns */}
                    {(campaign.status === "active" ||
                      getCampaignStatusLabel(campaign) === "Ready") && (
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
              <div className="p-3 sm:p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-yellow-900 text-sm sm:text-base mb-1">
                      Mid-Term Report Due
                    </h3>
                    <p className="text-xs sm:text-sm text-yellow-700 mb-3">
                      Submit your progress report by December 29, 2024
                    </p>
                    <Button
                      size="sm"
                      className="gap-2 rounded-full w-full sm:w-auto btn-cta"
                      // onClick={handleUploadReport}
                      onClick={() => navigate("/beneficiary/reporting")}
                    >
                      <Upload className="w-4 h-4" />
                      Upload Report
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-[#0B1221]/50 gap-2">
                  <span className="text-xs sm:text-sm font-medium">
                    Campaign Approval
                  </span>
                  <span className="text-xs text-green-600 font-medium flex-shrink-0">
                    ✓ Approved
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-[#0B1221]/50 gap-2">
                  <span className="text-xs sm:text-sm font-medium">
                    Document Verification
                  </span>
                  <span className="text-xs text-green-600 font-medium flex-shrink-0">
                    ✓ Verified
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-[#0B1221]/50 gap-2">
                  <span className="text-xs sm:text-sm font-medium">
                    Compliance Check
                  </span>
                  <span className="text-xs text-green-600 font-medium flex-shrink-0">
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
                        ${(primaryCampaign.amountRaised / 100).toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Target Amount</p>
                      <p className="text-lg sm:text-xl font-bold">
                        ${(primaryCampaign.targetAmount / 100).toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span className="font-semibold">
                        {primaryCampaign.progressPercentage}%
                      </span>
                    </div>
                    <Progress
                      value={primaryCampaign.progressPercentage}
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
                  onClick={() => navigate(`/campaigns/${primaryCampaign.id}`)}
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
                    {(selectedCampaignForConfirm.targetAmount / 100).toFixed(0)}
                  </p>
                </div>
              </div>
            )}

            <SheetFooter className="mt-6 space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelConfirm}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 btn-cta"
                onClick={handleConfirmReadiness}
              >
                Confirm Readiness
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default BeneficiaryDashboard;
