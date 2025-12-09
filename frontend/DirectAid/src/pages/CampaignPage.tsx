import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { mockDataService } from "../services/mockData";
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
} from "lucide-react";

type FilterCategory = "all" | "medical" | "education" | "food" | "shelter";
type FilterStatus = "all" | "active" | "completed" | "draft";

export default function CampaignPage() {
  const navigate = useNavigate();
  const { campaigns } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>("all");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);

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

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-primary-bg)" }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "var(--color-secondary-bg)",
          borderBottomColor: "var(--color-accent)",
        }}
        className="border-b sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: "var(--color-text-light)" }}
              >
                Browse Campaigns
              </h1>
              <p
                className="mt-1"
                style={{ color: "var(--color-text-light)", opacity: 0.8 }}
              >
                Find and support campaigns making a real impact
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-3 w-5 h-5"
                  style={{ color: "var(--color-accent)", opacity: 0.6 }}
                />
                <Input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                  style={{
                    backgroundColor: "var(--color-primary-bg)",
                    color: "var(--color-text-light)",
                    borderColor: "var(--color-accent)",
                  }}
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-primary-bg)",
                }}
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div
            style={{
              backgroundColor: "var(--color-primary-bg)",
              borderTopColor: "var(--color-accent)",
            }}
            className="border-t"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label
                    className="block text-sm font-medium mb-3"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className="px-4 py-2 rounded-full text-sm font-medium transition border"
                        style={{
                          backgroundColor:
                            selectedCategory === cat.id
                              ? "var(--color-accent)"
                              : "var(--color-secondary-bg)",
                          color:
                            selectedCategory === cat.id
                              ? "var(--color-primary-bg)"
                              : "var(--color-text-light)",
                          borderColor: "var(--color-accent)",
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label
                    className="block text-sm font-medium mb-3"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    Campaign Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <button
                        key={status.id}
                        onClick={() => setSelectedStatus(status.id)}
                        className="px-4 py-2 rounded-full text-sm font-medium transition border"
                        style={{
                          backgroundColor:
                            selectedStatus === status.id
                              ? "var(--color-accent)"
                              : "var(--color-secondary-bg)",
                          color:
                            selectedStatus === status.id
                              ? "var(--color-primary-bg)"
                              : "var(--color-text-light)",
                          borderColor: "var(--color-accent)",
                        }}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowFilters(false)}
                className="text-sm mt-4 transition hover:opacity-80"
                style={{ color: "var(--color-accent)" }}
              >
                Hide Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: "var(--color-text-light)", opacity: 0.6 }}
            />
            <p className="text-lg" style={{ color: "var(--color-text-light)" }}>
              No campaigns found matching your filters.
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-text-light)", opacity: 0.6 }}
            >
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p style={{ color: "var(--color-text-light)" }}>
                Showing{" "}
                <span className="font-semibold">
                  {filteredCampaigns.length}
                </span>{" "}
                {filteredCampaigns.length === 1 ? "campaign" : "campaigns"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  style={{
                    backgroundColor: "var(--color-secondary-bg)",
                    borderColor: "var(--color-accent)",
                  }}
                  className="rounded-lg overflow-hidden border hover:shadow-lg transition cursor-pointer group card-elevated"
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                >
                  {/* Image or Category Badge */}
                  <div
                    className="h-40 flex items-center justify-center border-b"
                    style={{
                      backgroundColor: "var(--color-primary-bg)",
                      borderBottomColor: "var(--color-accent)",
                    }}
                  >
                    <Heart
                      className="w-12 h-12"
                      style={{ color: "var(--color-accent)", opacity: 0.4 }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Status & Category */}
                    <div className="flex gap-2 mb-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize border"
                        style={{
                          backgroundColor:
                            campaign.status === "active"
                              ? "rgba(0, 255, 255, 0.2)"
                              : "rgba(0, 255, 255, 0.1)",
                          color: "var(--color-accent)",
                          borderColor: "var(--color-accent)",
                        }}
                      >
                        {campaign.status}
                      </span>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize border"
                        style={{
                          backgroundColor: "rgba(0, 255, 255, 0.1)",
                          color: "var(--color-accent)",
                          borderColor: "var(--color-accent)",
                        }}
                      >
                        {campaign.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="font-bold text-lg mb-2 line-clamp-2 group-hover:opacity-80"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      {campaign.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-sm mb-4 line-clamp-2"
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    >
                      {campaign.description}
                    </p>

                    {/* Location & Timeline */}
                    <div
                      className="flex gap-4 text-sm mb-4"
                      style={{ color: "var(--color-text-light)", opacity: 0.6 }}
                    >
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
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "var(--color-text-light)" }}
                        >
                          ${campaign.amountRaised.toLocaleString()}
                        </span>
                        <span
                          className="text-sm"
                          style={{
                            color: "var(--color-text-light)",
                            opacity: 0.7,
                          }}
                        >
                          of ${campaign.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div
                        className="w-full rounded-full h-2"
                        style={{ backgroundColor: "var(--color-primary-bg)" }}
                      >
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${getProgressPercentage(campaign)}%`,
                            backgroundColor: "var(--color-accent)",
                          }}
                        ></div>
                      </div>
                      <p
                        className="text-xs mt-1"
                        style={{
                          color: "var(--color-text-light)",
                          opacity: 0.6,
                        }}
                      >
                        {getProgressPercentage(campaign).toFixed(0)}% funded
                      </p>
                    </div>

                    {/* Donor Count */}
                    <div
                      className="flex items-center justify-between pt-3 border-t group-hover:opacity-100 transition"
                      style={{ borderTopColor: "rgba(0, 255, 255, 0.2)" }}
                    >
                      <div
                        className="flex items-center gap-2 text-sm"
                        style={{
                          color: "var(--color-text-light)",
                          opacity: 0.7,
                        }}
                      >
                        <Heart
                          className="w-4 h-4"
                          style={{ color: "var(--color-accent)" }}
                        />
                        <span>{campaign.donorCount || 0} donors</span>
                      </div>
                      <ChevronRight
                        className="w-4 h-4"
                        style={{ color: "var(--color-accent)", opacity: 0.6 }}
                      />
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div
                    style={{
                      backgroundColor: "var(--color-primary-bg)",
                      borderTopColor: "var(--color-accent)",
                    }}
                    className="px-5 py-3 border-t"
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/donate?campaignId=${campaign.id}`);
                      }}
                      className="w-full"
                      style={{
                        backgroundColor: "var(--color-accent)",
                        color: "var(--color-primary-bg)",
                      }}
                    >
                      Donate Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
