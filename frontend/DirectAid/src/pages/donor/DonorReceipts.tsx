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
  Download,
  Calendar,
  FileText,
  Filter,
} from "lucide-react";

const DonorReceipts = () => {
  const navigate = useNavigate();
  const { campaigns, donations } = useApp();
  const donor = mockDataService.getDonorUser();
  const metrics = mockDataService.getDonorMetrics();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("2024");

  // Get donations for this donor with receipts
  const donorDonations = donations.filter((d) => d.donorId === donor.id && d.receiptUrl);

  const filteredReceipts = donorDonations.filter((donation) => {
    const campaign = campaigns.find((c) => c.id === donation.campaignId);
    const matchesSearch = campaign?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = new Date(donation.createdAt).getFullYear().toString() === selectedYear;
    return matchesSearch && matchesYear;
  });

  const totalForYear = filteredReceipts.reduce((sum, donation) => sum + donation.amount, 0);

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
              Tax Receipts
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Download your donation receipts for tax purposes
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

        {/* Tax Summary */}
        <Card className="p-4 sm:p-6 card-elevated">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-700 mb-2">{selectedYear} Tax Year</p>
              <p className="text-2xl font-bold text-green-900 mb-1">
                ${(totalForYear / 100).toFixed(0)}
              </p>
              <p className="text-xs text-green-600">
                Total tax-deductible donations
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700 mb-2">Receipts Available</p>
              <p className="text-2xl font-bold text-blue-900 mb-1">
                {filteredReceipts.length}
              </p>
              <p className="text-xs text-blue-600">
                For {selectedYear}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Button className="w-full rounded-full gap-2 btn-cta">
                <Download className="w-4 h-4" />
                Download Annual Summary
              </Button>
            </div>
          </div>
        </Card>

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
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
        </Card>

        {/* Receipts List */}
        <div className="space-y-4">
          {filteredReceipts.length > 0 ? (
            filteredReceipts.map((donation) => {
              const campaign = campaigns.find((c) => c.id === donation.campaignId);
              return (
                <Card key={donation.id} className="p-4 sm:p-6 card-elevated">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                        <Receipt className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg mb-1">
                          {campaign?.title || "Campaign"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Receipt #{donation.id.slice(-8).toUpperCase()}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Tax Deductible
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <div className="sm:text-right">
                        <p className="font-bold text-xl">
                          ${(donation.amount / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-green-600">
                          Tax Receipt Available
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No receipts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Try adjusting your search"
                  : `No tax receipts available for ${selectedYear}`
                }
              </p>
              <Button
                onClick={() => navigate("/campaigns")}
                className="btn-cta rounded-full"
              >
                Make a Donation
              </Button>
            </Card>
          )}
        </div>

        {/* Tax Info */}
        <Card className="p-4 sm:p-6 bg-blue-50/50 border-blue-200">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Tax Information</h3>
              <p className="text-sm text-blue-700 mb-2">
                All donations made through DirectAid are tax-deductible. Keep these receipts for your tax records.
              </p>
              <p className="text-xs text-blue-600">
                Consult your tax advisor for specific deduction details.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DonorReceipts;
