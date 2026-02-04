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
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="mb-4">Campaign not found.</p>
            <Button onClick={() => navigate("/campaigns")} className="w-full">
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

  const daysLeft = () => {
    const end = new Date(campaign.fundraisingDeadline);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
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
      <div className="space-y-6">
        <button
          onClick={() => navigate("/campaigns")}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </button>

        {/* Content */}
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Hero Section */}
              <Card className="mb-6 overflow-hidden">
                <div className="h-80 flex items-center justify-center border-b border-border bg-muted">
                  <Heart className="w-24 h-24 text-primary opacity-40" />
                </div>

                {/* Title & Meta */}
                <div className="p-6">
                  <div className="flex gap-3 mb-4">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize border border-primary bg-primary/20 text-primary">
                      {campaign.status}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize border border-primary bg-primary/10 text-primary">
                      {campaign.category}
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold mb-2">
                    {campaign.title}
                  </h1>

                  <div className="flex flex-wrap gap-6 mb-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{campaign.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{daysLeft()} days left</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span>{campaign.donorCount || 0} donors</span>
                    </div>
                  </div>

                  <div className="rounded-lg p-4 border border-border bg-muted/50">
                    <p className="leading-relaxed">
                      {campaign.description}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Campaign Details */}
              <Card className="mb-6">
                <h2 className="text-xl font-bold mb-4">
                  Campaign Details
                </h2>

                <div className="grid grid-cols-2 gap-6 mb-1">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Beneficiary
                    </p>
                    <p className="font-semibold">
                      {campaign.beneficiary?.name || "Pending Assignment"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1 text-muted-foreground">
                      Provider
                    </p>
                    <p className="font-semibold">
                      DirectAid Provider Network
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1 text-muted-foreground">
                      Created
                    </p>
                    <p className="font-semibold">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1 text-muted-foreground">
                      Category
                    </p>
                    <p className="font-semibold capitalize">
                      {campaign.category}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Funding Progress */}
              <Card>
                <h2 className="text-xl font-bold mb-4">
                  Funding Progress
                </h2>

                <div className="flex items-end gap-4 mb-6">
                  <div>
                    <p className="text-sm mb-1 text-muted-foreground">
                      Raised
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      ${campaign.amountRaised.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1 text-muted-foreground">
                      Goal
                    </p>
                    <p className="text-2xl font-bold">
                      ${campaign.targetAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="w-full rounded-full h-3 bg-muted">
                  <div
                    className="h-3 rounded-full transition-all duration-300 bg-primary"
                    style={{
                      width: `${getProgressPercentage()}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm mt-3">
                  {getProgressPercentage().toFixed(0)}% of goal reached
                </p>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Donate Button */}
              <Button
                onClick={() => navigate(`/donate?campaignId=${campaign.id}`)}
                className="w-full mb-4 text-lg py-6"
              >
                <Heart className="w-5 h-5 mr-2" />
                Donate Now
              </Button>

              {/* Quick Info */}
              <Card>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide mb-1 text-primary">
                      Status
                    </p>
                    <p className="font-semibold capitalize">
                      {campaign.status}
                    </p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs uppercase tracking-wide mb-1 text-primary">
                      Deadline
                    </p>
                    <p className="font-semibold">
                      {daysLeft()} days remaining
                    </p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs uppercase tracking-wide mb-1 text-primary">
                      Donors
                    </p>
                    <p className="font-semibold">
                      {campaign.donorCount || 0}
                    </p>
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
