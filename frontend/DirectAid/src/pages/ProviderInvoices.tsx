import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockDataService } from "../services/mockData";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  FolderKanban,
  Wallet,
  FileText,
  Settings,
} from "lucide-react";

const ProviderInvoices = () => {
  const navigate = useNavigate();
  const provider = mockDataService.getProviderUser();
  const campaigns = mockDataService.getCampaigns();

  // Get campaigns for this provider
  const providerCampaigns = campaigns.filter(
    (c) => c.providerId === provider.id
  );

  const navItems = [
    {
      label: "Dashboard",
      href: "/provider",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Campaigns",
      href: "/campaigns",
      icon: <FolderKanban className="w-5 h-5" />,
    },
    {
      label: "Upload Invoices",
      href: "/provider/invoices",
      icon: <Upload className="w-5 h-5" />,
    },
    {
      label: "Withdrawals",
      href: "/provider/withdrawals",
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      label: "Proof Upload",
      href: "/provider/proof-upload",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: "Settings",
      href: "/provider/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleUploadInvoice = (campaignId: string) => {
    navigate(`/provider/invoices/upload?campaignId=${campaignId}`);
  };

  const handleBackToDashboard = () => {
    navigate("/provider");
  };

  return (
    <DashboardLayout
      navItems={navItems}
      userName={provider.name}
      userRole="Aid Provider"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToDashboard}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Upload Invoices</h1>
            <p className="text-muted-foreground mt-1">
              Submit invoices for your active campaigns
            </p>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providerCampaigns.length > 0 ? (
            providerCampaigns.map((campaign) => (
              <Card key={campaign.id} className="p-6 card-elevated">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Beneficiary:{" "}
                      <span className="font-semibold">
                        {campaign.beneficiary?.name}
                      </span>
                    </p>
                  </div>
                  {campaign.invoices?.length > 0 ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold">
                      {campaign.invoices?.length > 0 ? "Invoice Uploaded" : "Pending Invoice"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Amount Raised</p>
                    <p className="font-bold text-lg">
                      ${(campaign.amountRaised / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full btn-cta rounded-lg"
                  onClick={() => handleUploadInvoice(campaign.id)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {campaign.invoices?.length > 0 ? "View/Update Invoice" : "Upload Invoice"}
                </Button>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="p-8 card-elevated text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Active Campaigns</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any active campaigns to upload invoices for.
                </p>
                <Button variant="outline" onClick={handleBackToDashboard}>
                  Back to Dashboard
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderInvoices;