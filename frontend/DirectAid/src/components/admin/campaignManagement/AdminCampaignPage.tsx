// components/admin/campaignManagement/AdminCampaignPage.tsx
import { useState } from "react";
import AdminCampaignFilters from "./AdminCampaignFilters";
import AdminCampaignList from "./AdminCampaignList";

export type FilterType = "all" | "pending" | "approved" | "rejected" | "flagged";

export default function AdminCampaignPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-white">
        Campaign Management
      </h2>

      <AdminCampaignFilters filter={filter} setFilter={setFilter} />

      <div className="mt-6">
        <AdminCampaignList filter={filter} />
      </div>
    </div>
  );
}