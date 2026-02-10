import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import * as beneficiaryApi from "../services/beneficiaryApi";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import { CampaignSummaryCard } from "../components/feature/CampaignSummaryCard";
import {
  Search,
  Filter,
  AlertCircle,
  LayoutDashboard,
  DollarSign,
  FolderKanban,
  Upload,
  Wallet,
  FileText,
  Heart,
  Receipt,
  User,
  Bell,
  Lock,
  CreditCard,
  Sparkles,
} from "lucide-react";

type FilterCategory = "all" | "medical" | "education" | "food" | "shelter";
type FilterStatus = "all" | "active" | "completed" | "draft";
type ProviderCampaignTab = "all" | "to_approve" | "my";

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
  providerId?: any;
  providerAccepted?: boolean;
  providerName: string;
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
    location: c.location ?? c.metadata?.location ?? "Global",
    fundraisingDeadline,
    amountRaised: raised,
    targetAmount: target,
    status: (c.status ?? "active").toLowerCase(),
    confirmationStatus: c.confirmationStatus,
    category: c.category ?? c.metadata?.category ?? "Other",
    donorCount: c.donorCount ?? 0,
    providerId: c.providerId,
    providerAccepted: c.providerAccepted,
    providerName: c.providerId?.organization ||
      (c.providerId?.firstName ? `${c.providerId.firstName} ${c.providerId.lastName || ""}`.trim() : "DirectAid Provider")
  };
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
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [providerTab, setProviderTab] = useState<ProviderCampaignTab>("all");
  // Public campaign list (discover)
  useEffect(() => {
    setCampaignsLoading(true);
    api
      .get("/campaigns?limit=100")
      .then((res) => {
        const list = (res as any)?.campaigns ?? (res as any)?.data?.campaigns ?? [];
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
  }, [user, normalizedRole]);

  const userName = user?.name || user?.email || "User";
  const userRole = role || "Guest";

  const categories: { id: FilterCategory; label: string }[] = [
    { id: "all", label: "All Cases" },
    { id: "medical", label: "Medical Aid" },
    { id: "education", label: "Education" },
    { id: "food", label: "Nutrition" },
    { id: "shelter", label: "Housing" },
  ];

  const statuses: { id: FilterStatus; label: string }[] = [
    { id: "all", label: "Any Status" },
    { id: "active", label: "Active Now" },
    { id: "completed", label: "Fully Funded" },
  ];
  const currentUserId = (user as any)?.id ?? (user as any)?._id ?? "";

  const providerMatchesCurrentUser = useCallback(
    (campaign: CampaignListItem) => {
      const p = (campaign as any).providerId;
      const pid = p && typeof p === "object" ? (p._id ?? p.id) : p;
      return currentUserId && pid && String(pid) === String(currentUserId);
    },
    [currentUserId]
  );

  // Filter and search campaigns (apply to current display list, plus provider tabs when relevant)
  const filteredCampaigns = useMemo(() => {
    let list = displayList;

    if (normalizedRole === "PROVIDER" && currentUserId) {
      if (providerTab === "to_approve") {
        list = list.filter((c) => providerMatchesCurrentUser(c) && !c.providerAccepted);
      } else if (providerTab === "my") {
        list = list.filter((c) => providerMatchesCurrentUser(c));
      }
    }

    return list.filter((campaign) => {
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
  }, [
    displayList,
    searchQuery,
    selectedCategory,
    selectedStatus,
    normalizedRole,
    providerTab,
    currentUserId,
    providerMatchesCurrentUser,
  ]);

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
      <div className="space-y-10 animate-fade-in">
        {/* Fancy Hero Header */}
        <div className="relative p-8 sm:p-12 rounded-[2rem] overflow-hidden border border-white/10 glass-morphism shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] -ml-32 -mb-32" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              <span>Direct Aid Protocol</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              Verified <span className="text-primary italic">Impact</span> Campaigns
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Every contribution is purpose-locked and only released upon dual-confirmation of service delivery.
            </p>
          </div>
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

        {/* Provider-only tabs: All / To approve / My campaigns */}
        {normalizedRole === "PROVIDER" && (
          <div className="flex flex-wrap gap-2 border-b border-border pb-2">
            {(
              [
                { id: "all" as const, label: "All campaigns" },
                { id: "to_approve" as const, label: "To approve" },
                { id: "my" as const, label: "My campaigns" },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setProviderTab(id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  providerTab === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-accent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Provider-only tabs: All / To approve / My campaigns */}
        {normalizedRole === "PROVIDER" && (
          <div className="flex flex-wrap gap-2 border-b border-border pb-2">
            {(
              [
                { id: "all" as const, label: "All campaigns" },
                { id: "to_approve" as const, label: "To approve" },
                { id: "my" as const, label: "My campaigns" },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setProviderTab(id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  providerTab === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-accent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Search & Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm shadow-xl">
          <div className="flex-1 relative w-full group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"
            />
            <Input
              type="text"
              placeholder="Search by title, location or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-black/20 border-white/10 rounded-2xl focus:border-primary/50 transition-all text-base"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-14 px-6 gap-2 rounded-2xl border-white/10 transition-all ${showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-black/20 hover:bg-black/40'}`}
            >
              <Filter className="w-4 h-4" />
              <span className="font-bold">Filters</span>
            </Button>
            {role === "PROVIDER" && (
              <Button
                className="h-14 px-8 rounded-2xl btn-cta"
                onClick={() => navigate("/campaigns/create")}
              >
                Create New
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Filter Section */}
        {showFilters && (
          <div className="p-8 rounded-3xl border border-white/10 glass-morphism animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Category</h3>
                <div className="flex flex-wrap gap-2.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedCategory === cat.id
                        ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                        : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20 hover:bg-white/10"
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Execution Status</h3>
                <div className="flex flex-wrap gap-2.5">
                  {statuses.map((status) => (
                    <button
                      key={status.id}
                      onClick={() => setSelectedStatus(status.id)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedStatus === status.id
                        ? "bg-accent text-black border-accent shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                        : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20 hover:bg-white/10"
                        }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-white/5 flex justify-end">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-muted-foreground hover:text-white transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div>
          {listLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading campaigns…</p>
            </div>
          ) : (
            <div className="pb-12 text-center">
              {filteredCampaigns.length === 0 ? (
                <div className="py-24 p-8 rounded-3xl border border-dashed border-white/10 glass-morphism max-w-xl mx-auto">
                  <AlertCircle className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-30" />
                  <h3 className="text-2xl font-bold mb-3">No matches found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find any campaigns matching your search or filter criteria. Try expanding your search.
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedStatus("all");
                      setSearchQuery("");
                    }}
                    className="mt-8 text-primary font-bold"
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-8 flex items-center justify-between px-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Found <span className="text-white font-bold">{filteredCampaigns.length}</span> active campaigns
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCampaigns.map((campaign) => (
                      <CampaignSummaryCard
                        key={campaign.id}
                        id={campaign.id}
                        title={campaign.title}
                        description={campaign.description}
                        organizerName={campaign.providerName}
                        amountRaised={campaign.amountRaised}
                        targetAmount={campaign.targetAmount}
                        donorCount={campaign.donorCount}
                        category={campaign.category}
                        location={campaign.location}
                        deadline={campaign.fundraisingDeadline}
                        onClick={() => handleCardClick(campaign)}
                        onDonate={(e) => {
                          e.stopPropagation();
                          navigate(`/donate?campaignId=${campaign.id}`);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
