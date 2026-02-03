// components/admin/campaignManagement/AdminCampaignPage.tsx
import { useState } from "react";
import AdminCampaignFilters from "./AdminCampaignFilters";
import AdminCampaignList from "./AdminCampaignList.tsx";

type FilterType = "all" | "pending" | "approved" | "rejected" | "flagged";

export default function AdminCampaignPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Campaign Management</h2>

      <AdminCampaignFilters filter={filter} setFilter={setFilter} />

      <div className="mt-6">
        <AdminCampaignList filter={filter} />
      </div>
    </>
  );
}