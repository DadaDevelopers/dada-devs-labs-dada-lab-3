import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
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

function normalizeCampaign(c: any) {
  const id = c._id ?? c.id;
  const location = c.metadata?.location ?? c.location ?? "";
  const fundraisingDeadline = c.metadata?.fundraisingDeadline ?? c.fundraisingDeadline;
  return {
    ...c,
    id,
    _id: id,
    location,
    fundraisingDeadline: fundraisingDeadline ? new Date(fundraisingDeadline).toISOString?.() ?? fundraisingDeadline : undefined,
    amountRaised: c.amountRaised ?? 0,
    targetAmount: c.targetAmount ?? 0,
  };
}

export default function CampaignPage() {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [myCampaigns, setMyCampaigns] = useState<any[]>([]);
  const [campaignsView, setCampaignsView] = useState<"discover" | "my">("discover");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>("all");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);

  const isBeneficiary = role?.toLowerCase() === "beneficiary";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params: Record<string, string> = { page: "1", limit: "50" };
    if (selectedStatus !== "all") params.status = selectedStatus === "active" ? "ACTIVE" : selectedStatus === "completed" ? "COMPLETED" : "CANCELLED";
    if (selectedCategory !== "all") params.category = selectedCategory;
    const query = new URLSearchParams(params).toString();
    api.get(query ? `/campaigns?${query}` : "/campaigns").then((res) => {
      if (cancelled) return;
      const list = (res.data?.campaigns ?? []).map(normalizeCampaign);
      setCampaigns(list);
    }).catch(() => {
      if (!cancelled) setCampaigns([]);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    if (!isBeneficiary) return;
    let cancelled = false;
    api.get("/campaigns/me?page=1&limit=50").then((res) => {
      if (cancelled) return;
      const list = (res.data?.campaigns ?? []).map(normalizeCampaign);
      setMyCampaigns(list);
    }).catch(() => {
      if (!cancelled) setMyCampaigns([]);
    });
    return () => { cancelled = true; };
  }, [isBeneficiary]);

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
        { label: "Dashboard", href: "/beneficiary", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Campaigns", href: "/beneficiary/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
        { label: "Funds Received", href: "/beneficiary/funds", icon: <DollarSign className="w-5 h-5" /> },
        { label: "Reporting", href: "/beneficiary/reporting", icon: <FileText className="w-5 h-5" /> },
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

  const sourceCampaigns = isBeneficiary && campaignsView === "my" ? myCampaigns : campaigns;

  // Filter and search campaigns
  const filteredCampaigns = useMemo(() => {
    return sourceCampaigns.filter((campaign) => {
      const title = (campaign.title ?? "").toLowerCase();
      const desc = (campaign.description ?? "").toLowerCase();
      const loc = (campaign.location ?? "").toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        title.includes(searchQuery.toLowerCase()) ||
        desc.includes(searchQuery.toLowerCase()) ||
        loc.includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || campaign.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" ||
        (campaign.status ?? "").toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [sourceCampaigns, searchQuery, selectedCategory, selectedStatus]);

  const getProgressPercentage = (campaign: any) => {
    return Math.min((campaign.amountRaised / campaign.targetAmount) * 100, 100);
  };

  /** Whether this campaign is owned by the current beneficiary (we're on "My campaigns" so it's in myCampaigns). */
  const isMyCampaign = (campaign: any) =>
    isBeneficiary && (campaignsView === "my" || myCampaigns.some((m) => (m.id ?? m._id) === (campaign.id ?? campaign._id)));

  /** Human-readable status line + badge style for cards. */
  const getCampaignStatusLabel = (campaign: any) => {
    const admin = (campaign.adminStatus ?? "").toLowerCase();
    const status = (campaign.status ?? "").toLowerCase();
    if (admin === "pending") return { label: "Pending approval", hint: "Not visible to donors until an admin approves.", badgeClass: "bg-amber-100/90 text-amber-800 border-amber-200/80" };
    if (admin === "rejected") return { label: "Rejected", hint: "This campaign was not approved. You can edit and resubmit or contact support.", badgeClass: "bg-red-100/90 text-red-800 border-red-200/80" };
    if (admin === "flagged") return { label: "Under review", hint: "An admin is reviewing this campaign.", badgeClass: "bg-violet-100/90 text-violet-800 border-violet-200/80" };
    if (admin === "approved" && status === "active") return { label: "Live", hint: "Accepting donations.", badgeClass: "bg-emerald-100/90 text-emerald-800 border-emerald-200/80" };
    if (status === "completed") return { label: "Funded", hint: "Fundraising goal reached.", badgeClass: "bg-sky-100/90 text-sky-800 border-sky-200/80" };
    if (status === "cancelled") return { label: "Cancelled", hint: "This campaign is no longer active.", badgeClass: "bg-neutral-100/90 text-neutral-600 border-neutral-200/80" };
    return { label: (campaign.status ?? "—") || "—", hint: "", badgeClass: "bg-primary/10 text-primary border-primary/20" };
  };

  const daysLeft = (deadline: string) => {
    const end = new Date(deadline);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  };

  const userName =
    role?.toLowerCase() === "beneficiary"
      ? (user?.firstName || user?.name || user?.email || "User")
      : (user?.name || user?.email || "User");
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
            {isBeneficiary && campaignsView === "my" ? "My Campaigns" : "Browse Campaigns"}
          </h1>
          <p className="text-muted-foreground">
            {isBeneficiary && campaignsView === "my"
              ? "Campaigns you created and their status. Initiated means just created; pending approval means waiting for admin to approve so donors can see it."
              : "Find and support campaigns making a real impact"}
          </p>
          {isBeneficiary && (
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => setCampaignsView("discover")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  campaignsView === "discover"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Discover
              </button>
              <button
                type="button"
                onClick={() => setCampaignsView("my")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  campaignsView === "my"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                My campaigns
              </button>
            </div>
          )}
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
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading campaigns…
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
                  {isBeneficiary && campaignsView === "my" && (
                    <span className="block mt-1 text-sm font-normal text-muted-foreground">
                      Each card shows the campaign state: Initiated (just created), Pending approval (waiting for admin), Live (accepting donations), or Funded.
                    </span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCampaigns.map((campaign) => {
                  const statusInfo = getCampaignStatusLabel(campaign);
                  const isMine = isMyCampaign(campaign);
                  const campaignId = campaign.id ?? campaign._id;
                  const isNotMineBeneficiary = isBeneficiary && !isMine;
                  const ctaLabel = isMine ? "View details" : isNotMineBeneficiary ? "View details" : "Donate Now";
                  const goToDetail = () => isMine ? navigate(`/beneficiary/campaigns/${campaignId}`) : navigate(`/campaigns/${campaignId}`);
                  const onCta = () => {
                    if (isMine || isNotMineBeneficiary) goToDetail();
                    else navigate(`/donate?campaignId=${campaignId}`);
                  };
                  return (
                  <Card
                    key={campaign.id}
                    className="flex flex-col min-h-[460px] w-full overflow-hidden rounded-2xl border border-white/20 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 cursor-pointer group"
                    onClick={goToDetail}
                  >
                    {/* Image / hero with gradient overlay */}
                    <div className="h-44 flex-shrink-0 flex items-center justify-center border-b border-white/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--primary)/0.08,transparent_70%)]" />
                      <Heart className="w-14 h-14 text-primary/50 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    {/* Content — clear hierarchy, generous padding */}
                    <div className="flex-1 flex flex-col p-6">
                      {/* Status & category badges — coloured backgrounds */}
                      <div className="space-y-2 mb-4">
                        <div className="flex gap-2 flex-wrap">
                          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${statusInfo.badgeClass}`}>
                            {statusInfo.label}
                          </span>
                          {campaign.category && (
                            <span className="text-xs font-medium px-3 py-1.5 rounded-full border bg-muted/80 text-muted-foreground border-border">
                              {campaign.category}
                            </span>
                          )}
                        </div>
                        {statusInfo.hint && (
                          <p className="text-xs text-muted-foreground leading-snug font-normal">
                            {statusInfo.hint}
                          </p>
                        )}
                      </div>

                      {/* Title — primary hierarchy */}
                      <h3 className="font-bold text-xl text-foreground mb-2 line-clamp-2 tracking-tight leading-snug">
                        {campaign.title}
                      </h3>

                      {/* Description — secondary */}
                      <p className="text-sm font-normal text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                        {campaign.description}
                      </p>

                      {/* Location & timeline — tertiary */}
                      <div className="flex gap-4 text-sm font-normal text-muted-foreground mb-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 flex-shrink-0 opacity-70" />
                          <span className="truncate">{campaign.location || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 flex-shrink-0 opacity-70" />
                          <span>
                            {campaign.fundraisingDeadline
                              ? `${daysLeft(campaign.fundraisingDeadline)} days left`
                              : "—"}
                          </span>
                        </div>
                      </div>

                      {/* Progress — clear typography */}
                      <div className="mb-4">
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-base font-semibold text-foreground">
                            ${Number(campaign.amountRaised ?? 0).toLocaleString()}
                          </span>
                          <span className="text-sm font-normal text-muted-foreground">
                            of ${Number(campaign.targetAmount ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full rounded-full h-2.5 bg-muted/80 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${getProgressPercentage(campaign)}%` }}
                          />
                        </div>
                        <p className="text-xs font-medium mt-1.5 text-muted-foreground">
                          {getProgressPercentage(campaign).toFixed(0)}% funded
                        </p>
                      </div>

                      {/* Donor count + CTA row */}
                      <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/80">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Heart className="w-4 h-4 text-primary" />
                          <span>{campaign.donorCount || 0} donors</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCta();
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md py-1 pr-0.5 transition-all duration-200 group/btn"
                        >
                          <span className="group-hover/btn:underline">{ctaLabel}</span>
                          <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:scale-110" />
                        </button>
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}