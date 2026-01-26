import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { mockDataService } from "../services/mockData";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Search,
  MapPin,
  Clock,
  TrendingUp,
  Heart,
  Filter,
  ChevronRight,
  AlertCircle,
  LayoutDashboard,
  FolderKanban,
  Upload,
  Wallet,
  FileText,
  DollarSign,
  Receipt,
  User,
  Bell,
  Lock,
  CreditCard,
} from "lucide-react";

type FilterCategory = "all" | "medical" | "education" | "food" | "shelter";
type FilterStatus = "all" | "active" | "completed" | "draft";

export default function CampaignPage() {
  const navigate = useNavigate();
  const { campaigns } = useApp();
  const { user, role, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>("all");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Get role-based navigation items
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
    // Default navigation for unauthenticated or unknown roles
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

  const categories: { id: FilterCategory; label: string }[] = [
    { id: "all", label: "All Categories" },
    { id: "medical", label: "Medical" },
    { id: "education", label: "Education" },
    { id: "food", label: "Food" },
    { id: "shelter", label: "Shelter" },
  ];

  const statuses: { id: FilterStatus; label: string }[] = [
    { id: "all", label: "All Status" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "draft", label: "Draft" },
  ];

  // Filter and search campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        campaign.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || campaign.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" || campaign.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [campaigns, searchQuery, selectedCategory, selectedStatus]);

  const getProgressPercentage = (campaign: any) => {
    return Math.min((campaign.amountRaised / campaign.targetAmount) * 100, 100);
  };

  const daysLeft = (deadline: string) => {
    const end = new Date(deadline);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  };

  const userName = user?.name || user?.email || "User";
  const userRole = role || "Guest";

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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Browse Campaigns
          </h1>
          <p className="text-muted-foreground">
            Find and support campaigns making a real impact
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-3 w-5 h-5 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground border-border hover:bg-accent"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Campaign Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status.id}
                      onClick={() => setSelectedStatus(status.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                        selectedStatus === status.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground border-border hover:bg-accent"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(false)}
              className="text-sm mt-4 text-primary hover:opacity-80 transition"
            >
              Hide Filters
            </button>
          </div>
        )}

        {/* Results */}
        <div>
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg">No campaigns found matching your filters.</p>
              <p className="text-sm mt-1 text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p>
                  Showing{" "}
                  <span className="font-semibold">
                    {filteredCampaigns.length}
                  </span>{" "}
                  {filteredCampaigns.length === 1 ? "campaign" : "campaigns"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    className="overflow-hidden hover:shadow-lg transition cursor-pointer group"
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                    {/* Image or Category Badge */}
                    <div className="h-40 flex items-center justify-center border-b border-border bg-muted">
                      <Heart className="w-12 h-12 text-primary opacity-40" />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Status & Category */}
                      <div className="flex gap-2 mb-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize border border-primary bg-primary/20 text-primary">
                          {campaign.status}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize border border-primary bg-primary/10 text-primary">
                          {campaign.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:opacity-80">
                        {campaign.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm mb-4 line-clamp-2 text-muted-foreground">
                        {campaign.description}
                      </p>

                      {/* Location & Timeline */}
                      <div className="flex gap-4 text-sm mb-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{campaign.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {daysLeft(campaign.fundraisingDeadline)} days left
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">
                            ${campaign.amountRaised.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            of ${campaign.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full rounded-full h-2 bg-muted">
                          <div
                            className="h-2 rounded-full transition-all duration-300 bg-primary"
                            style={{
                              width: `${getProgressPercentage(campaign)}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs mt-1 text-muted-foreground">
                          {getProgressPercentage(campaign).toFixed(0)}% funded
                        </p>
                      </div>

                      {/* Donor Count */}
                      <div className="flex items-center justify-between pt-3 border-t border-border group-hover:opacity-100 transition">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Heart className="w-4 h-4 text-primary" />
                          <span>{campaign.donorCount || 0} donors</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="px-5 py-3 border-t border-border bg-muted/50">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/donate?campaignId=${campaign.id}`);
                        }}
                        className="w-full"
                      >
                        Donate Now
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}