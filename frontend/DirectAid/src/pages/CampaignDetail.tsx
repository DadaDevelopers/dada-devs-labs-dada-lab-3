import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Heart,
  AlertCircle,
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
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, isLoading, selectCampaign, selectedCampaign } = useApp();
  const { user, role, logout } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (id && (!selectedCampaign || selectedCampaign.id !== id)) {
      setLocalLoading(true);
      selectCampaign(id).finally(() => setLocalLoading(false));
    }
  }, [id, selectedCampaign, selectCampaign]);

  const campaign = selectedCampaign || campaigns.find((c: any) => c.id === id);

  const userName = user?.name || user?.email || "User";
  const userRole = role || "Guest";

  const getNavItems = () => {
    switch (role) {
      case "DONOR":
        return [
          { label: "Discover", href: "/donor", icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: "Campaigns", href: "/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
          { label: "My Donations", href: "/donor/donations", icon: <Heart className="w-5 h-5" /> },
          { label: "Receipts", href: "/donor/receipts", icon: <Receipt className="w-5 h-5" /> },
        ];
      case "BENEFICIARY":
        return [
          { label: "Dashboard", href: "/beneficiary", icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: "Funds", href: "/beneficiary/funds", icon: <Wallet className="w-5 h-5" /> },
          { label: "Reporting", href: "/beneficiary/reporting", icon: <FileText className="w-5 h-5" /> },
        ];
      case "PROVIDER":
        return [
          { label: "Dashboard", href: "/provider", icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: "Campaigns", href: "/provider/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
          { label: "Invoices", href: "/provider/invoices", icon: <Upload className="w-5 h-5" />, },
          { label: "Withdrawals", href: "/provider/withdrawals", icon: <Wallet className="w-5 h-5" />, },
          { label: "Proof", href: "/provider/proof-upload", icon: <FileText className="w-5 h-5" />, },
        ];
      default:
        return [
          { label: "Discover", href: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: "Campaigns", href: "/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
        ];
    }
  };

  const getSettingsNavItems = () => {
    if (!user) {
      return [{ id: "login", label: "Sign In", href: "/login", icon: <User className="w-5 h-5" /> }];
    }
    switch (role) {
      case "DONOR":
        return [
          { id: "profile", label: "Profile", href: "/donor/settings/profile", icon: <User className="w-5 h-5" /> },
          { id: "payment", label: "Payment Methods", href: "/donor/settings/payment", icon: <CreditCard className="w-5 h-5" /> },
          { id: "notifications", label: "Notifications", href: "/donor/settings/notifications", icon: <Bell className="w-5 h-5" /> },
          { id: "change-password", label: "Change Password", href: "/donor/settings/change-password", icon: <Lock className="w-5 h-5" /> },
        ];
      case "BENEFICIARY":
        return [
          { id: "profile", label: "Profile", href: "/beneficiary/settings/profile", icon: <User className="w-5 h-5" /> },
          { id: "notifications", label: "Notifications", href: "/beneficiary/settings/notifications", icon: <Bell className="w-5 h-5" /> },
          { id: "change-password", label: "Change Password", href: "/beneficiary/settings/change-password", icon: <Lock className="w-5 h-5" /> },
        ];
      case "PROVIDER":
        return [
          { id: "profile", label: "Profile", href: "/provider/settings/profile", icon: <User className="w-5 h-5" /> },
          { id: "payouts", label: "Payouts", href: "/provider/settings/payouts", icon: <Wallet className="w-5 h-5" /> },
          { id: "notifications", label: "Notifications", href: "/provider/settings/notifications", icon: <Bell className="w-5 h-5" /> },
          { id: "change-password", label: "Change Password", href: "/provider/settings/change-password", icon: <Lock className="w-5 h-5" /> },
        ];
      default:
        return [{ id: "profile", label: "Settings", href: "/settings", icon: <User className="w-5 h-5" /> }];
    }
  };

  if (isLoading || localLoading) {
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-primary animate-pulse font-bold tracking-widest uppercase text-sm">
            Synchronizing Audit Rail...
          </div>
        </div>
      </DashboardLayout>
    );
  }





  if (!campaign) {
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
        <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
          <Card className="p-12 text-center max-w-md border-white/10 glass-morphism shadow-2xl rounded-3xl">
            <AlertCircle className="w-20 h-20 mx-auto mb-6 text-primary opacity-30" />
            <h2 className="text-2xl font-bold mb-4">Case Not Found</h2>
            <p className="text-muted-foreground mb-8">
              We couldn't find the campaign implementation you're looking for.
            </p>
            <Button onClick={() => navigate("/campaigns")} className="w-full h-12 rounded-2xl btn-cta">
              Back to Discover
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const getProgressPercentage = () => {
    return Math.min((campaign.amountRaised / campaign.targetAmount) * 100, 100);
  };

  const getDeadline = () =>
    campaign.fundraisingDeadline ?? (campaign as any).metadata?.fundraisingDeadline;
  const daysLeft = (): number | null => {
    const raw = getDeadline();
    if (raw == null || raw === "") return null;
    const end = new Date(raw);
    if (Number.isNaN(end.getTime())) return null;
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };
  const getStatusLabel = () => {
    if (campaign.confirmationStatus === "provider_confirmed") return "Awaiting Beneficiary Confirmation";
    if (campaign.confirmationStatus === "both_confirmed") return "Fully Verified & Locked";
    if (campaign.confirmationStatus === "disputed") return "Audit in Progress (Disputed)";
    return campaign.status || "Active";
  };

  const getStatusBadgeColor = () => {
    if (campaign.confirmationStatus === "both_confirmed") return "bg-green-500 text-white";
    if (campaign.confirmationStatus === "provider_confirmed") return "bg-blue-500 text-white";
    if (campaign.confirmationStatus === "disputed") return "bg-red-500 text-white";
    return "bg-primary text-black";
  };

  const isOwner = user && campaign.beneficiaryId && (
    (typeof campaign.beneficiaryId === 'string' && campaign.beneficiaryId === user.id) ||
    (typeof campaign.beneficiaryId === 'object' && (campaign.beneficiaryId._id === user.id || campaign.beneficiaryId.id === user.id))
  );

  const isAssignedProvider = user && campaign.providerId && (
    (typeof campaign.providerId === 'string' && campaign.providerId === user.id) ||
    (typeof campaign.providerId === 'object' && (campaign.providerId._id === user.id || campaign.providerId.id === user.id))
  );

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
      <div className="space-y-8 animate-fade-in pb-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/campaigns")}
            className="group flex items-center gap-3 text-sm font-bold text-muted-foreground hover:text-white transition-all px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/20"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Campaigns
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Audit Rail</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Premium Hero Section */}
            <Card className="overflow-hidden border-white/10 glass-morphism shadow-2xl border-none rounded-[2.5rem]">
              <div className="relative h-[24rem] bg-muted overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 pointer-events-none z-10" />

                <Heart className="w-32 h-32 text-primary opacity-20 animate-pulse-slow" />

                {/* Hero Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                  <div className="flex gap-2 mb-4">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${getStatusBadgeColor()}`}>
                      {getStatusLabel()}
                    </span>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-white/10 backdrop-blur-md text-white border border-white/20">
                      {campaign.category}
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
                    {campaign.title}
                  </h1>
                </div>
              </div>

              <div className="p-8 sm:p-12 space-y-10">
                {/* Quick Stats Toolbar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Location</p>
                    <div className="flex items-center gap-1.5 font-bold">
                      <MapPin className="w-4 h-4 text-primary/70" />
                      <span>{campaign.location}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Time Remaining</p>
                    <div className="flex items-center gap-1.5 font-bold">
                      <Clock className="w-4 h-4 text-primary/70" />
                      <span>{daysLeft()} Days</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Community</p>
                    <div className="flex items-center gap-1.5 font-bold">
                      <Users className="w-4 h-4 text-primary/70" />
                      <span>{campaign.donorCount || 0} Backers</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Protocol</p>
                    <div className="flex items-center gap-1.5 font-bold text-accent">
                      <Zap className="w-4 h-4 text-accent/70" />
                      <span>Purpose-Locked</span>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <span className="w-8 h-1 bg-primary rounded-full" />
                    The Mission
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {campaign.description}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Accountability Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 border-white/10 glass-morphism rounded-3xl space-y-4">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <User className="w-6 h-6" />
                  <h3 className="font-bold tracking-wide uppercase text-sm">Beneficiary</h3>
                </div>
                <p className="text-2xl font-bold">{campaign.beneficiary?.name || "Pending Selection"}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verified identity with DirectAid. Funds are released based on beneficiary's confirmation of service receipt.
                </p>
              </Card>

              <Card className="p-8 border-white/10 glass-morphism rounded-3xl space-y-4">
                <div className="flex items-center gap-3 text-accent mb-2">
                  <ShieldCheck className="w-6 h-6" />
                  <h3 className="font-bold tracking-wide uppercase text-sm">Provider Network</h3>
                </div>
                <p className="text-2xl font-bold">{campaign.provider?.name || "Verified Network"}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Provider must submit verifiable invoices and proof of service before fund disbursement is authorized.
                </p>
              </Card>
            </div>
          </div>

          {/* Sticky Sidebar (Right) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-8 space-y-8">
              {/* Funding Card */}
              <Card className="p-8 border-none glass-morphism shadow-2xl rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] -mr-16 -mt-16" />

                <div className="relative space-y-8">
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Progress to Goal</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold text-white">${campaign.amountRaised.toLocaleString()}</span>
                      <span className="text-lg text-primary font-bold">Raised</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Verification: {Math.round(getProgressPercentage())}%</span>
                      <span>Target: ${campaign.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="relative">
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary via-accent to-primary shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all duration-1000 ease-out"
                          style={{ width: `${getProgressPercentage()}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {userRole === "DONOR" || userRole === "Guest" ? (
                    <Button
                      onClick={() => navigate(`/donate?campaignId=${campaign.id}`)}
                      className="w-full h-16 text-lg rounded-3xl btn-cta flex items-center justify-center gap-3"
                    >
                      <Heart className="w-6 h-6" />
                      <span>Support this Mission</span>
                    </Button>
                  ) : isOwner && campaign.confirmationStatus === "provider_confirmed" ? (
                    <Button
                      onClick={() => navigate("/beneficiary/confirm")}
                      className="w-full h-16 text-lg rounded-3xl bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all"
                    >
                      <ShieldCheck className="w-6 h-6" />
                      <span>Confirm Service Receipt</span>
                    </Button>
                  ) : isAssignedProvider && campaign.confirmationStatus === "pending" ? (
                    <Button
                      onClick={() => navigate("/provider/confirm")}
                      className="w-full h-16 text-lg rounded-3xl bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                    >
                      <Zap className="w-6 h-6" />
                      <span>Confirm Service Delivery</span>
                    </Button>
                  ) : (
                    <div className="p-4 text-center rounded-2xl bg-white/5 border border-white/10 text-xs text-muted-foreground italic">
                      {isOwner ? "Awaiting provider confirmation to unlock receipt." : "You are viewing this campaign as a " + userRole}
                    </div>
                  )}
                </div>
              </Card>

              {/* Timeline & Transparency */}
              <Card className="p-8 border-white/10 glass-morphism rounded-3xl space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-white/5 pb-4">Transparency Audit</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-1.5 h-auto rounded-full bg-primary/30" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Fundraising</p>
                      <p className="text-xs text-muted-foreground">Ends on {new Date(campaign.fundraisingDeadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-auto rounded-full bg-white/10" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dual-Confirmation</p>
                      <p className="text-[10px] text-muted-foreground/60 italic">Locks funds until delivery is verified</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-auto rounded-full bg-white/10" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Impact Report</p>
                      <p className="text-[10px] text-muted-foreground/60 italic">Sent to backers after completion</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
