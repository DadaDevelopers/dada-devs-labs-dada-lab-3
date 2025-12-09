import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { mockDataService } from "../services/mockData";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";

const BeneficiaryConfirmation = () => {
  const navigate = useNavigate();
  const { campaigns, updateCampaign } = useApp();
  const beneficiary = mockDataService.getBeneficiaryUser();

  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationNote, setConfirmationNote] = useState<Record<string, string>>({});

  // Campaigns that need beneficiary confirmation
  const pendingCampaigns = campaigns.filter(
    (c) =>
      c.beneficiaryId === beneficiary.id &&
      c.confirmationStatus === "provider_confirmed"
  );

  // Already confirmed campaigns
  const confirmedCampaigns = campaigns.filter(
    (c) =>
      c.beneficiaryId === beneficiary.id &&
      c.confirmationStatus === "both_confirmed"
  );

  const handleConfirmReceipt = async (campaignId: string) => {
    setConfirmingId(campaignId);
    setIsSubmitting(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    updateCampaign(campaignId, { confirmationStatus: "both_confirmed" });

    setIsSubmitting(false);
    setConfirmingId(null);
    setConfirmationNote((prev) => ({ ...prev, [campaignId]: "" }));
  };

  const getProgress = (campaign: any) =>
    Math.min((campaign.amountRaised / campaign.targetAmount) * 100, 100);

  const renderCampaignCard = (campaign: any, isPending: boolean) => {
    const isExpanded = expandedCampaign === campaign.id;

    return (
      <Card
        key={campaign.id}
        className={`overflow-hidden border-l-4 ${
          isPending ? "border-l-yellow-500 hover:shadow-lg" : "border-l-green-500 bg-green-50"
        } transition`}
      >
        {/* Summary */}
        <div
          className={`p-6 cursor-pointer hover:bg-gray-50 transition ${
            !isPending && "hover:bg-green-100"
          }`}
          onClick={() => setExpandedCampaign(isExpanded ? null : campaign.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{campaign.title}</h3>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isPending ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {isPending ? "Awaiting Your Confirmation" : "Confirmed"}
                </span>
              </div>
              <p className="text-gray-600 line-clamp-1">{campaign.description}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  {isPending ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  {isPending
                    ? "Pending"
                    : `Confirmed on ${new Date(campaign.beneficiaryConfirmedAt || campaign.providerConfirmedAt).toLocaleDateString()}`}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />${campaign.amountRaised.toLocaleString()}
                </div>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className={`border-t border-gray-200 bg-gray-50 p-6 ${!isPending && "bg-white"}`}>
            {/* Funding Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Campaign Details</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Provider</p>
                    <p className="font-semibold text-gray-900">
                      {mockDataService.getProviderById(campaign.providerId)?.name || "Not Assigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="font-semibold text-gray-900 capitalize">{campaign.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-semibold text-gray-900 capitalize">{campaign.status}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Funding Summary</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Amount Raised</p>
                    <p className="font-semibold text-indigo-600 text-lg">
                      ${campaign.amountRaised.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Target Amount</p>
                    <p className="font-semibold text-gray-900">${campaign.targetAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${getProgress(campaign)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{getProgress(campaign).toFixed(0)}% funded</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Note */}
            {isPending && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" /> Optional Confirmation Note
                </label>
                <textarea
                  placeholder="Add any notes about service receipt..."
                  value={confirmationNote[campaign.id] || ""}
                  onChange={(e) =>
                    setConfirmationNote((prev) => ({ ...prev, [campaign.id]: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  rows={3}
                />
              </div>
            )}

            {/* Confirm Button */}
            {isPending && (
              <Button
                onClick={() => handleConfirmReceipt(campaign.id)}
                disabled={isSubmitting && confirmingId === campaign.id}
                className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {isSubmitting && confirmingId === campaign.id
                  ? "Confirming Receipt..."
                  : "Confirm Service Receipt"}
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/beneficiary")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Confirm Service Receipt</h1>
          <p className="text-gray-600 mt-2">
            Confirm that you have received the services for your campaigns
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {pendingCampaigns.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pending Confirmations <span className="text-lg font-normal text-gray-600">({pendingCampaigns.length})</span>
            </h2>
            <div className="space-y-4">{pendingCampaigns.map((c) => renderCampaignCard(c, true))}</div>
          </div>
        )}

        {confirmedCampaigns.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Completed Confirmations <span className="text-lg font-normal text-gray-600">({confirmedCampaigns.length})</span>
            </h2>
            <div className="space-y-4">{confirmedCampaigns.map((c) => renderCampaignCard(c, false))}</div>
          </div>
        )}

        {/* Empty State */}
        {pendingCampaigns.length === 0 && confirmedCampaigns.length === 0 && (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 text-lg font-semibold">No campaigns to confirm</p>
            <p className="text-gray-600 mt-2">You don't have any campaigns awaiting confirmation yet.</p>
            <Button
              onClick={() => navigate("/beneficiary")}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Return to Dashboard
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BeneficiaryConfirmation;
