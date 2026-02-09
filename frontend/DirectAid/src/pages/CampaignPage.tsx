import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import * as beneficiaryApi from "../services/beneficiaryApi";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Search,
  MapPin,
  Clock,
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

type CampaignListItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  fundraisingDeadline: string;
  amountRaised: number;
  targetAmount: number;
  status: string;
  confirmationStatus?: string;
  category: string;
  donorCount: number;
};

function normalizeCampaign(c: any): CampaignListItem {
  const target = c.targetAmount != null ? (typeof c.targetAmount === "number" ? c.targetAmount : parseFloat(String(c.targetAmount))) : 0;
  const raised = c.amountRaised != null ? (typeof c.amountRaised === "number" ? c.amountRaised : parseFloat(String(c.amountRaised))) : 0;
  const rawDeadline = c.fundraisingDeadline ?? c.metadata?.fundraisingDeadline;
  const fundraisingDeadline = rawDeadline
    ? typeof rawDeadline === "string"
      ? rawDeadline
      : rawDeadline instanceof Date
        ? rawDeadline.toISOString().split("T")[0]
        : String(rawDeadline)
    : "";
  return {
    id: c._id || c.id || c.publicId || "",
    title: c.title ?? "",
    description: c.description ?? "",
    location: c.location ?? "",
    fundraisingDeadline,
    amountRaised: raised,
    targetAmount: target,
    status: c.status ?? "ACTIVE",
    confirmationStatus: c.confirmationStatus,
    category: c.category ?? "",
    donorCount: c.donorCount ?? 0,
  };
}

function getCampaignStatusLabel(campaign: CampaignListItem): string {
  if (campaign.confirmationStatus === "pending") return "Pending";
  if (campaign.confirmationStatus === "provider_confirmed") return "Provider confirmed";
  if (campaign.confirmationStatus === "both_confirmed") return "Confirmed";
  if (campaign.confirmationStatus === "disputed") return "Disputed";
  if (campaign.status === "ACTIVE") return "Active";
  if (campaign.status === "COMPLETED") return "Completed";
  if (campaign.status === "CANCELLED") return "Cancelled";
  return campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1).toLowerCase() : "Active";
}

function getStatusBadgeClass(campaign: CampaignListItem): string {
  if (campaign.confirmationStatus === "pending") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300/50";
  if (campaign.confirmationStatus === "provider_confirmed") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300/50";
  if (campaign.confirmationStatus === "both_confirmed") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300/50";
  if (campaign.status === "COMPLETED") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300/50";
  if (campaign.status === "ACTIVE") return "bg-primary/15 text-primary border-primary/40";
  return "bg-muted text-muted-foreground border-border";
}

export default function CampaignPage() {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const normalizedRole = (role || "").toUpperCase();

  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [myCampaigns, setMyCampaigns] = useState<CampaignListItem[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [myCampaignsLoading, setMyCampaignsLoading] = useState(false);
  const [campaignsView, setCampaignsView] = useState<"discover" | "my">("discover");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>("all");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Public campaign list (discover)
  useEffect(() => {
    setCampaignsLoading(true);
    api
      .get("/campaigns?limit=100")
      .then((res) => {
        const list = (res.data as { campaigns?: any[] }).campaigns ?? [];
        setCampaigns(list.map(normalizeCampaign));
      })
      .catch(() => setCampaigns([]))
      .finally(() => setCampaignsLoading(false));
  }, []);

  // Beneficiary "My campaigns" (only when beneficiary)
  useEffect(() => {
    if (normalizedRole !== "BENEFICIARY") return;
    setMyCampaignsLoading(true);
    beneficiaryApi
      .getMyCampaigns()
      .then((data) => {
        const list = data.campaigns ?? [];
        setMyCampaigns(list.map(normalizeCampaign));
      })
      .catch(() => setMyCampaigns([]))
      .finally(() => setMyCampaignsLoading(false));
  }, [normalizedRole]);

  const displayList = normalizedRole === "BENEFICIARY" && campaignsView === "my" ? myCampaigns : campaigns;
  const listLoading = normalizedRole === "BENEFICIARY" && campaignsView === "my" ? myCampaignsLoading : campaignsLoading;
  const isBeneficiaryMyView = normalizedRole === "BENEFICIARY" && campaignsView === "my";

  // Dynamic navigation items based on role
  const navItems = useMemo(() => {
    switch (normalizedRole) {
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
          { label: "Campaigns", href: "/beneficiary/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
          { label: "Funds Received", href: "/beneficiary/funds", icon: <DollarSign className="w-5 h-5" /> },
          { label: "Reporting", href: "/beneficiary/reporting", icon: <FileText className="w-5 h-5" /> },
        ];
      case "PROVIDER":
        return [
          { label: "Dashboard", href: "/provider", icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: "Campaigns", href: "/provider/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
          { label: "Upload Invoices", href: "/provider/invoices", icon: <Upload className="w-5 h-5" />, },
          { label: "Withdrawals", href: "/provider/withdrawals", icon: <Wallet className="w-5 h-5" />, },
          { label: "Proof Upload", href: "/provider/proof-upload", icon: <FileText className="w-5 h-5" />, },
        ];
      default:
        return [
          { label: "Discover", href: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: "Campaigns", href: "/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
        ];
    }
  }, [normalizedRole]);

  const settingsNavItems = useMemo(() => {
    if (!user) {
      return [{ id: "login", label: "Sign In", href: "/login", icon: <User className="w-5 h-5" /> }];
    }

    switch (normalizedRole) {
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
          { id: "address", label: "Address", href: "/beneficiary/settings/address", icon: <MapPin className="w-5 h-5" /> },
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
        return [{ id: "profile", label: "Profile Settings", href: "/settings", icon: <User className="w-5 h-5" /> }];
    }
  }, [user, normalizedRole]);

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

  // Filter and search campaigns (apply to current display list)
  const filteredCampaigns = useMemo(() => {
    return displayList.filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (campaign.location && campaign.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || (campaign.category && campaign.category.toLowerCase() === selectedCategory);

      const matchesStatus =
        selectedStatus === "all" || (campaign.status && campaign.status.toLowerCase() === selectedStatus);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [displayList, searchQuery, selectedCategory, selectedStatus]);

  const getProgressPercentage = (campaign: CampaignListItem) => {
    if (!campaign.targetAmount || campaign.targetAmount <= 0) return 0;
    return Math.min((campaign.amountRaised / campaign.targetAmount) * 100, 100);
  };

  const daysLeft = (deadline: string) => {
    if (!deadline) return 0;
    const end = new Date(deadline);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  };

  const handleCardClick = (campaign: CampaignListItem) => {
    if (isBeneficiaryMyView) {
      navigate(`/beneficiary/campaigns/${campaign.id}`);
    } else {
      navigate(`/campaigns/${campaign.id}`);
    }
  };

  const userName = user?.name || user?.email || "User";
  const userRole = role || "Guest";

  return (
    <DashboardLayout
      navItems={navItems}
      userName={userName}
      userRole={userRole}
      settingsNavItems={settingsNavItems}
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

        {/* Beneficiary: Discover vs My campaigns tabs */}
        {normalizedRole === "BENEFICIARY" && (
          <div className="flex gap-2 border-b border-border pb-2">
            <button
              onClick={() => setCampaignsView("discover")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${campaignsView === "discover" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"}`}
            >
              Discover
            </button>
            <button
              onClick={() => setCampaignsView("my")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${campaignsView === "my" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"}`}
            >
              My campaigns
            </button>
          </div>
        )}

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
                      className={`px-4 py-2 rounded-full text-sm font-medium transition border ${selectedCategory === cat.id
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
                      className={`px-4 py-2 rounded-full text-sm font-medium transition border ${selectedStatus === status.id
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
          {listLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading campaigns…</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
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
                    className="overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer group"
                    onClick={() => handleCardClick(campaign)}
                  >
                    {/* Header strip with gradient */}
                    <div className="h-36 flex items-center justify-center border-b border-border bg-gradient-to-br from-primary/5 via-muted/30 to-primary/10">
                      <Heart className="w-14 h-14 text-primary/50 group-hover:text-primary/70 transition-colors" />
                    </div>

                    <div className="p-5">
                      {/* Status & Category */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(campaign)}`}>
                          {getCampaignStatusLabel(campaign)}
                        </span>
                        {campaign.category && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted/80 text-muted-foreground border border-border">
                            {campaign.category}
                          </span>
                        )}
                      </div>

                      {/* Title — clear hierarchy */}
                      <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                        {campaign.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm leading-snug mb-4 line-clamp-2 text-muted-foreground">
                        {campaign.description || "No description."}
                      </p>

                      {/* Location & Timeline */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        {campaign.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">{campaign.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>
                            {campaign.fundraisingDeadline
                              ? (() => {
                                  const d = daysLeft(campaign.fundraisingDeadline);
                                  return d === 0 ? "Ended" : `${d} days left`;
                                })()
                              : "No deadline"}
                          </span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="text-base font-bold text-foreground">
                            ${campaign.amountRaised.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            of ${campaign.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full rounded-full h-2.5 bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${getProgressPercentage(campaign)}%` }}
                          />
                        </div>
                        <p className="text-xs mt-1 text-muted-foreground">
                          {getProgressPercentage(campaign).toFixed(0)}% funded
                        </p>
                      </div>

                      {/* Donors */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Heart className="w-4 h-4 text-primary/80" />
                          <span>{campaign.donorCount || 0} donors</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* CTA: View details — prominent button with arrow */}
                    <div className="px-5 py-3 border-t border-border bg-primary/5">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isBeneficiaryMyView) navigate(`/beneficiary/campaigns/${campaign.id}`);
                          else navigate(`/campaigns/${campaign.id}`);
                        }}
                        className="w-full gap-2 rounded-lg bg-primary text-primary-foreground hover:opacity-95 font-semibold shadow-md hover:shadow-lg transition-shadow py-2.5"
                      >
                        View details
                        <ChevronRight className="w-4 h-4" />
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