import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CampaignService } from "../services/apiServices"; // API FIX
import { useAuth } from "../contexts/AuthContext"; // DEV BRANCH
import { DashboardLayout } from "../components/layout/DashboardLayout"; // DEV BRANCH
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import type { Campaign } from "../types";
import {
  Search, MapPin, Clock, Heart, Filter, ChevronRight,
  AlertCircle, LayoutDashboard, FolderKanban, Upload,
  Wallet, FileText, DollarSign, Receipt, User, Bell,
  Lock, CreditCard,
} from "lucide-react";

type FilterCategory = "all" | "medical" | "education" | "food" | "shelter";
type FilterStatus = "all" | "active" | "completed" | "draft";

export default function CampaignPage() {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  
  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);

  // API state for campaigns
  const [realCampaigns, setRealCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic navigation items based on role (dev branch)
  const navItems = useMemo(() => {
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
  }, [role]);

  const settingsNavItems = useMemo(() => {
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
  }, [user, role]);

  const userName = user?.name || user?.email || "User";
  const userRole = role || "Guest";

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

  // YOUR API LOGIC
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const response = await CampaignService.getAll();
        // Handle both MongoDB _id and standard id
        setRealCampaigns(response.data?.campaigns || []);
      } catch (error) {
        console.error("Failed to fetch campaigns", error);
      } finally {
        setLoading(false);
      }
    };
    loadCampaigns();
  }, []);

  // Helpers
  const getProgressPercentage = (campaign: Campaign) => {
    if (!campaign.targetAmount) return 0;
    const pct = ((campaign.amountRaised || 0) / campaign.targetAmount) * 100;
    return Math.min(pct, 100);
  };

  const calculateDaysLeft = (deadline?: string) => {
    if (!deadline) return 0;
    const diff = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const filteredCampaigns = useMemo(() => {
    return realCampaigns.filter((campaign) => {
      const title = campaign.title || "";
      const desc = campaign.description || "";
      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || campaign.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || campaign.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [realCampaigns, searchQuery, selectedCategory, selectedStatus]);

  if (loading) return <div className="p-20 text-center text-primary">Loading Campaigns...</div>;

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
        <header>
          <h1 className="text-3xl font-bold">Browse Campaigns</h1>
          <p className="text-muted-foreground">Support real-world impact through verified campaigns.</p>
        </header>

        {/* Search & Filter Controls */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search campaigns..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10 h-11"
            />
          </div>
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>

        {/* Filter Section (dev branch layout) */}
        {showFilters && (
          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">Category</label>
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
              <div>
                <label className="block text-sm font-medium mb-3">Campaign Status</label>
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
                  <span className="font-semibold">{filteredCampaigns.length}</span>{" "}
                  {filteredCampaigns.length === 1 ? "campaign" : "campaigns"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((campaign) => {
                  const campaignId = campaign._id || (campaign as any).id;
                  return (
                    <Card
                      key={campaignId}
                      className="overflow-hidden hover:shadow-lg transition cursor-pointer group"
                      onClick={() => navigate(`/campaigns/${campaignId}`)}
                    >
                      <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-primary/10 text-primary">
                    {campaign.category}
                  </span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" /> {campaign.location}
                  </div>
                </div>
                
                <h3 className="font-bold text-lg line-clamp-1">{campaign.title}</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>${campaign.amountRaised?.toLocaleString()} raised</span>
                    <span className="text-muted-foreground">{getProgressPercentage(campaign).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all" 
                      style={{ width: `${getProgressPercentage(campaign)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {calculateDaysLeft(campaign.fundraisingDeadline)} days left
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
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