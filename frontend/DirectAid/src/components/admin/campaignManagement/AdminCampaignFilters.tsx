// components/admin/campaignManagement/AdminCampaignFilters.tsx
import type { FilterType } from "./AdminCampaignPage";

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
    <div className="flex flex-wrap gap-2">
      {filterOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setFilter(option.id)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
            filter === option.id
              ? "bg-amber-500 text-black"
              : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}