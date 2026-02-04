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
  
  // API States (Your Fixes)
  const [realCampaigns, setRealCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Dev Branch Nav Logic
  const getNavItems = () => {
    const currentRole = role?.toLowerCase();
    if (currentRole === "provider") {
      return [
        { label: "Dashboard", href: "/provider", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Campaigns", href: "/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
        { label: "Invoices", href: "/provider/invoices", icon: <Upload className="w-5 h-5" /> },
      ];
    }
    // ... logic for beneficiary/donor as seen in Dev branch
    return [{ label: "Campaigns", href: "/campaigns", icon: <FolderKanban className="w-5 h-5" /> }];
  };

  if (loading) return <div className="p-20 text-center text-primary">Loading Campaigns...</div>;

  return (
    <DashboardLayout
      navItems={getNavItems()}
      userName={user?.name || user?.email || "User"}
      userRole={role || "Guest"}
      onLogout={async () => { await logout(); navigate("/"); }}
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

        {/* Filter Section */}
        {showFilters && (
          <Card className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium block mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs border transition ${selectedCategory === cat.id ? 'bg-primary text-white' : 'bg-background'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Status Filter logic here... */}
          </Card>
        )}

        {/* Grid Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <Card 
              key={campaign._id || (campaign as any).id} 
              onClick={() => navigate(`/campaigns/${campaign._id || (campaign as any).id}`)}
              className="overflow-hidden hover:shadow-lg transition cursor-pointer group"
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
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}