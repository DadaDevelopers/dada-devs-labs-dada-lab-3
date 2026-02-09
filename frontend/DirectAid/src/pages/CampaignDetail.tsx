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
  DollarSign,
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
} from "lucide-react";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns } = useApp();
  const { user, role, logout } = useAuth();

  const campaign = campaigns.find((c) => c.id === id);

  // Get role-based navigation items (same as CampaignPage)
  const getNavItems = () => {
    const baseNavItems = [
      {
        label: "Campaigns",
        href: "/campaigns",
        icon: <FolderKanban className="w-5 h-5" />,
      },
    ];

    if (role?.toLowerCase() === "provider") {
      return [
        {
          label: "Dashboard",
          href: "/provider",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          label: "Campaigns",
          href: "/provider/campaigns",
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
          label: "Proof Upload",
          href: "/provider/proof-upload",
          icon: <FileText className="w-5 h-5" />,
        },
      ];
    } else if (role?.toLowerCase() === "beneficiary") {
      return [
        {
          label: "Dashboard",
          href: "/beneficiary",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        ...baseNavItems,
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
      ];
    } else if (role?.toLowerCase() === "donor") {
      return [
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
    }
    return baseNavItems;
  };

  const getSettingsNavItems = () => {
    if (role?.toLowerCase() === "provider") {
      return [
        { id: "profile", label: "Profile", href: "/provider/settings/profile", icon: <User className="w-5 h-5" /> },
        { id: "payouts", label: "Payouts", href: "/provider/settings/payouts", icon: <Wallet className="w-5 h-5" /> },
        { id: "notifications", label: "Notifications", href: "/provider/settings/notifications", icon: <Bell className="w-5 h-5" /> },
        { id: "change-password", label: "Change Password", href: "/provider/settings/change-password", icon: <Lock className="w-5 h-5" /> },
      ];
    } else if (role?.toLowerCase() === "beneficiary") {
      return [
        { id: "profile", label: "Profile", href: "/beneficiary/settings/profile", icon: <User className="w-5 h-5" /> },
        { id: "address", label: "Address", href: "/beneficiary/settings/address", icon: <MapPin className="w-5 h-5" /> },
        { id: "notifications", label: "Notifications", href: "/beneficiary/settings/notifications", icon: <Bell className="w-5 h-5" /> },
        { id: "change-password", label: "Change Password", href: "/beneficiary/settings/change-password", icon: <Lock className="w-5 h-5" /> },
      ];
    } else if (role?.toLowerCase() === "donor") {
      return [
        { id: "profile", label: "Profile", href: "/donor/settings/profile", icon: <User className="w-5 h-5" /> },
        { id: "payment", label: "Payment Methods", href: "/donor/settings/payment", icon: <CreditCard className="w-5 h-5" /> },
        { id: "notifications", label: "Notifications", href: "/donor/settings/notifications", icon: <Bell className="w-5 h-5" /> },
        { id: "change-password", label: "Change Password", href: "/donor/settings/change-password", icon: <Lock className="w-5 h-5" /> },
      ];
    }
    return [];
  };

  const userName = user?.name || user?.email || "User";
  const userRole = role || "Guest";

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
        <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
          <Card className="p-8 sm:p-10 text-center max-w-md rounded-xl border border-border shadow-sm">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="mb-4 text-muted-foreground">Campaign not found.</p>
            <Button onClick={() => navigate("/campaigns")} className="w-full rounded-lg">
              Back to Campaigns
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
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  };
  const deadlineDisplay = (): string => {
    const days = daysLeft();
    if (days === null) return "No deadline set";
    if (days === 0) return "Ended";
    return `${days} days remaining`;
  };

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
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="space-y-6 sm:space-y-8">
          <button
            onClick={() => navigate("/campaigns")}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </button>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Section */}
              <Card className="overflow-hidden rounded-xl border border-border shadow-sm">
                <div className="h-64 sm:h-80 flex items-center justify-center border-b border-border bg-gradient-to-br from-primary/5 via-muted/30 to-primary/10">
                  <Heart className="w-20 h-20 sm:w-24 sm:h-24 text-primary/50" />
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/40 bg-primary/15 text-primary">
                      {campaign.status}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-muted/80 text-muted-foreground capitalize">
                      {campaign.category}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground leading-tight">
                    {campaign.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 sm:gap-6 mb-6 text-sm text-muted-foreground">
                    {campaign.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{campaign.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{deadlineDisplay()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>{campaign.donorCount || 0} donors</span>
                    </div>
                  </div>
                  <div className="rounded-xl p-5 border border-border bg-muted/30">
                    <p className="text-foreground/90 leading-relaxed">
                      {campaign.description}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Campaign Details */}
              <Card className="p-6 sm:p-8 rounded-xl border border-border shadow-sm">
                <h2 className="text-lg font-semibold mb-5 text-foreground">
                  Campaign Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-xs uppercase tracking-wide mb-1.5 text-muted-foreground">Beneficiary</p>
                    <p className="font-semibold text-foreground">
                      {campaign.beneficiary?.name || "Pending Assignment"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-xs uppercase tracking-wide mb-1.5 text-muted-foreground">Provider</p>
                    <p className="font-semibold text-foreground">
                      DirectAid Provider Network
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-xs uppercase tracking-wide mb-1.5 text-muted-foreground">Created</p>
                    <p className="font-semibold text-foreground">
                      {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-xs uppercase tracking-wide mb-1.5 text-muted-foreground">Category</p>
                    <p className="font-semibold text-foreground capitalize">
                      {campaign.category}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Funding Progress */}
              <Card className="p-6 sm:p-8 rounded-xl border border-border shadow-sm">
                <h2 className="text-lg font-semibold mb-5 text-foreground">
                  Funding Progress
                </h2>
                <div className="flex flex-wrap items-end gap-6 mb-6">
                  <div>
                    <p className="text-sm mb-1 text-muted-foreground">Raised</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      ${Number(campaign.amountRaised ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1 text-muted-foreground">Goal</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      ${Number(campaign.targetAmount ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="w-full rounded-full h-3 bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-primary"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <p className="text-sm mt-3 text-muted-foreground">
                  {getProgressPercentage().toFixed(0)}% of goal reached
                </p>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Button
                onClick={() => navigate(`/donate?campaignId=${campaign.id}`)}
                className="w-full text-base py-6 rounded-xl shadow-md font-semibold"
              >
                <Heart className="w-5 h-5 mr-2" />
                Donate Now
              </Button>
              <Card className="p-6 rounded-xl border border-border shadow-sm">
                <div className="space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-wide mb-1.5 text-muted-foreground">Status</p>
                    <p className="font-semibold text-foreground capitalize">{campaign.status}</p>
                  </div>
                  <div className="border-t border-border pt-5">
                    <p className="text-xs uppercase tracking-wide mb-1.5 text-muted-foreground">Deadline</p>
                    <p className="font-semibold text-foreground">{deadlineDisplay()}</p>
                  </div>
                  <div className="border-t border-border pt-5">
                    <p className="text-xs uppercase tracking-wide mb-1.5 text-muted-foreground">Donors</p>
                    <p className="font-semibold text-foreground">{campaign.donorCount || 0}</p>
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
