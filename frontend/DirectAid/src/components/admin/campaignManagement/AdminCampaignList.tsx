// components/admin/campaignManagement/AdminCampaignList.tsx
import { Button } from "../../ui/button";
import { useApp } from "../../../contexts/AppContext";

type FilterType = "all" | "pending" | "approved" | "rejected" | "flagged";

interface AdminCampaignListProps {
  filter: FilterType;
}

export default function AdminCampaignList({ filter }: AdminCampaignListProps) {
  const { campaigns, updateCampaignStatus } = useApp();

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filter === "all") return true;
    return campaign.adminStatus === filter;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No campaigns found in this category.
                </td>
              </tr>
            ) : (
              filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {campaign.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {campaign.beneficiary.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                    {campaign.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                      ${campaign.adminStatus === "approved" && "bg-green-100 text-green-800"}
                      ${campaign.adminStatus === "pending" && "bg-yellow-100 text-yellow-800"}
                      ${campaign.adminStatus === "rejected" && "bg-red-100 text-red-800"}
                      ${campaign.adminStatus === "flagged" && "bg-orange-100 text-orange-800"}
                    `}>
                      {campaign.adminStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {campaign.adminStatus === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateCampaignStatus(campaign.id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateCampaignStatus(campaign.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {campaign.adminStatus !== "flagged" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCampaignStatus(campaign.id, "flagged")}
                        >
                          Flag
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}