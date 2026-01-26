import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CampaignService } from "../services/apiServices";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import type { Campaign } from "../types";
import {
  Search,
  MapPin,
  Clock,
  Heart,
  Filter,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

type FilterCategory = "all" | "medical" | "education" | "food" | "shelter";
type FilterStatus = "all" | "active" | "completed" | "draft";

export default function CampaignPage() {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [realCampaigns, setRealCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // FIX 2: These are now used in the Filter Section below
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

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const response = await CampaignService.getAll();
        setRealCampaigns(response.data?.campaigns || []);
      } catch (error) {
        console.error("Failed to fetch campaigns", error);
      } finally {
        setLoading(false);
      }
    };
    loadCampaigns();
  }, []);

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
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || campaign.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || campaign.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [realCampaigns, searchQuery, selectedCategory, selectedStatus]);

  if (loading) return <div className="p-20 text-center text-[var(--color-accent)]">Loading...</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-primary-bg)" }}>
      {/* Header & Search */}
      <div style={{ backgroundColor: "var(--color-secondary-bg)", borderBottom: "1px solid var(--color-accent)" }} className="sticky top-0 z-10 p-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-[var(--color-text-light)]">Browse Campaigns</h1>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 opacity-50 text-[var(--color-accent)]" />
              <Input 
                placeholder="Search..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10 bg-[var(--color-primary-bg)] text-[var(--color-text-light)] border-[var(--color-accent)]"
              />
            </div>
            <Button onClick={() => setShowFilters(!showFilters)} className="bg-[var(--color-accent)] text-[var(--color-primary-bg)]">
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
          </div>

          {/* FIX 2: Consumption of categories/statuses to remove yellow lines */}
          {showFilters && (
            <div className="p-4 border-t border-[var(--color-accent)] grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--color-text-light)] mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-full text-xs border ${selectedCategory === cat.id ? 'bg-[var(--color-accent)] text-[var(--color-primary-bg)]' : 'text-[var(--color-text-light)] border-[var(--color-accent)]'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-light)] mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(st => (
                    <button 
                      key={st.id} 
                      onClick={() => setSelectedStatus(st.id)}
                      className={`px-3 py-1 rounded-full text-xs border ${selectedStatus === st.id ? 'bg-[var(--color-accent)] text-[var(--color-primary-bg)]' : 'text-[var(--color-text-light)] border-[var(--color-accent)]'}`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div 
              key={campaign._id} 
              onClick={() => navigate(`/campaigns/${campaign._id}`)}
              className="rounded-lg overflow-hidden border border-[var(--color-accent)] bg-[var(--color-secondary-bg)] group"
            >
              <div className="p-5">
                <h3 className="font-bold text-[var(--color-text-light)]">{campaign.title}</h3>
                <div className="flex justify-between items-center mt-4">
                   <div className="flex items-center text-xs text-[var(--color-text-light)] opacity-60">
                     <MapPin className="w-3 h-3 mr-1" /> {campaign.location || "Global"}
                   </div>
                   <ChevronRight className="w-4 h-4 text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}