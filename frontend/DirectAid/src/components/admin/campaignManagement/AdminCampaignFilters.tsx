// components/admin/campaignManagement/AdminCampaignFilters.tsx
import { Button } from "../../ui/button";

type FilterType = "all" | "pending" | "approved" | "rejected" | "flagged";

interface AdminCampaignFiltersProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

const filterOptions: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "flagged", label: "Flagged" },
];

export default function AdminCampaignFilters({
  filter,
  setFilter,
}: AdminCampaignFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {filterOptions.map((option) => (
        <Button
          key={option.id}
          variant={filter === option.id ? "default" : "outline"}
          onClick={() => setFilter(option.id)}
          className="capitalize"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}