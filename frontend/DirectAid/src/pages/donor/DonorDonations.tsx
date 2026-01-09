import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { mockDataService } from "../../services/mockData";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  LayoutDashboard,
  Heart,
  Receipt,
  Settings,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  ExternalLink,
} from "lucide-react";

const DonorDonations = () => {
  const navigate = useNavigate();
  const { campaigns, donations } = useApp();
  const donor = mockDataService.getDonorUser();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Get donations for this donor
  const donorDonations = donations.filter((d) => d.donorId === donor.id);

  const filteredDonations = donorDonations.filter((donation) => {
    const campaign = campaigns.find((c) => c.id === donation.campaignId);
    const matchesSearch = campaign?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || donation.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const navItems = [
    {
      label: "Discover",
      href: "/donor",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "My Donations",
      href: "/donor/donations",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      label: "Receipts",
      href: "/donor/receipts",
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      label: "Settings",
      href: "/donor/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <DashboardLayout navItems={navItems} userName={donor.name} userRole="Donor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
              My Donations
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track all your contributions and their impact
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/donor")}
            className="gap-2 rounded-full w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </Card>

        {/* Donations List */}
        <div className="space-y-4">
          {filteredDonations.length > 0 ? (
            filteredDonations.map((donation) => {
              const campaign = campaigns.find((c) => c.id === donation.campaignId);
              return (
                <Card key={donation.id} className="p-4 sm:p-6 card-elevated">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <Heart className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg mb-1 truncate">
                            {campaign?.title || "Campaign"}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Donated on {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {donation.paymentMethod}
                            </span>
                            <span className={`px-2 py-1 rounded-full ${
                              donation.status === 'completed' ? 'bg-green-100 text-green-700' :
                              donation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {donation.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <div className="sm:text-right">
                        <p className="font-bold text-xl">
                          ${(donation.amount / 100).toFixed(0)}
                        </p>
                        {donation.isRecurring && (
                          <p className="text-xs text-blue-600">Recurring</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {donation.receiptUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => navigate(`/campaigns/${campaign?.id}`)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No donations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Start making a difference by donating to campaigns"
                }
              </p>
              <Button
                onClick={() => navigate("/campaigns")}
                className="btn-cta rounded-full"
              >
                Browse Campaigns
              </Button>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DonorDonations;
