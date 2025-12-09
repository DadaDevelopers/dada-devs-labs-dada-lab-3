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
  const [confirmationNote, setConfirmationNote] = useState<
    Record<string, string>
  >({});

  // Get campaigns for this beneficiary that need confirmation
  const campaignsNeedingConfirmation = campaigns.filter(
    (c) =>
      c.beneficiaryId === beneficiary.id &&
      c.confirmationStatus === "provider_confirmed"
  );

  // Get already confirmed campaigns
  const confirmedCampaigns = campaigns.filter(
    (c) =>
      c.beneficiaryId === beneficiary.id &&
      c.confirmationStatus === "both_confirmed"
  );

  const handleConfirmReceipt = async (campaignId: string) => {
    setConfirmingId(campaignId);
    setIsSubmitting(true);

    // Simulate confirmation processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      updateCampaign(campaignId, {
        confirmationStatus: "both_confirmed",
        beneficiaryConfirmedAt: new Date().toISOString(),
      });
    }

    setConfirmingId(null);
    setIsSubmitting(false);
    setConfirmationNote((prev) => ({ ...prev, [campaignId]: "" }));
  };

  const getProgressPercentage = (campaign: any) => {
    return Math.min((campaign.amountRaised / campaign.targetAmount) * 100, 100);
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
          <h1 className="text-3xl font-bold text-gray-900">
            Confirm Service Receipt
          </h1>
          <p className="text-gray-600 mt-2">
            Confirm that you have received the services for your campaigns
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Confirmations */}
        {campaignsNeedingConfirmation.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pending Confirmations
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({campaignsNeedingConfirmation.length})
              </span>
            </h2>

            <div className="space-y-4">
              {campaignsNeedingConfirmation.map((campaign) => {
                const isExpanded = expandedCampaign === campaign.id;

                return (
                  <Card
                    key={campaign.id}
                    className="overflow-hidden border-l-4 border-l-yellow-500 hover:shadow-lg transition"
                  >
                    {/* Summary */}
                    <div
                      className="p-6 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() =>
                        setExpandedCampaign(isExpanded ? null : campaign.id)
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {campaign.title}
                            </h3>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800">
                              Awaiting Your Confirmation
                            </span>
                          </div>

                          <p className="text-gray-600 line-clamp-1">
                            {campaign.description}
                          </p>

                          {/* Quick Info */}
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {campaign.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />$
                              {campaign.targetAmount.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(
                                campaign.createdAt
                              ).toLocaleDateString()}
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

                    {/* Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          {/* Campaign Details */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4">
                              Campaign Details
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <p className="text-gray-600">Provider</p>
                                <p className="font-semibold text-gray-900">
                                  {mockDataService.getProviderById(
                                    campaign.providerId
                                  )?.name || "Not Assigned"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Category</p>
                                <p className="font-semibold text-gray-900 capitalize">
                                  {campaign.category}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Status</p>
                                <p className="font-semibold text-gray-900 capitalize">
                                  {campaign.status}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">
                                  Expected Outcome
                                </p>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {campaign.expectedOutcome}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Funding Info */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4">
                              Funding Status
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <p className="text-gray-600">Amount Raised</p>
                                <p className="font-semibold text-indigo-600 text-lg">
                                  ${campaign.amountRaised.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Target Amount</p>
                                <p className="font-semibold text-gray-900">
                                  ${campaign.targetAmount.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Progress</p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{
                                      width: `${getProgressPercentage(
                                        campaign
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {getProgressPercentage(campaign).toFixed(0)}%
                                  funded
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Full Description */}
                        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600 mb-2">
                            Full Description
                          </p>
                          <p className="text-gray-900">
                            {campaign.description}
                          </p>
                        </div>

                        {/* Invoices */}
                        {campaign.invoice && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Provider Invoice
                            </h4>
                            <div className="p-3 bg-white rounded border border-gray-200 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {campaign.invoice.invoiceNumber}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    {new Date(
                                      campaign.invoice.invoiceDate
                                    ).toLocaleDateString()}{" "}
                                    • {campaign.invoice.description}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  ${campaign.invoice.amount.toLocaleString()}
                                </p>
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded inline-block mt-1 ${
                                    campaign.invoice.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {campaign.invoice.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Confirmation Timeline */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Confirmation Timeline
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Provider Confirmed
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(
                                    campaign.providerConfirmedAt
                                  ).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(
                                    campaign.providerConfirmedAt
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                                <Clock className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Awaiting Your Confirmation
                                </p>
                                <p className="text-sm text-gray-600">
                                  Please verify receipt of services
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Confirmation Note */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MessageSquare className="w-4 h-4 inline mr-2" />
                            Optional Confirmation Note
                          </label>
                          <textarea
                            placeholder="Add any notes about service receipt (optional)..."
                            value={confirmationNote[campaign.id] || ""}
                            onChange={(e) =>
                              setConfirmationNote((prev) => ({
                                ...prev,
                                [campaign.id]: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            rows={3}
                          />
                        </div>

                        {/* Action Button */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-700 mb-4">
                            By confirming, you're attesting that you have
                            received the services described in this campaign.
                            This will unlock the funds for payout.
                          </p>
                          <Button
                            onClick={() => handleConfirmReceipt(campaign.id)}
                            disabled={
                              isSubmitting && confirmingId === campaign.id
                            }
                            className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                          >
                            {isSubmitting && confirmingId === campaign.id
                              ? "Confirming Receipt..."
                              : "Confirm Service Receipt"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Confirmations */}
        {confirmedCampaigns.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Completed Confirmations
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({confirmedCampaigns.length})
              </span>
            </h2>

            <div className="space-y-4">
              {confirmedCampaigns.map((campaign) => {
                const isExpanded = expandedCampaign === campaign.id;

                return (
                  <Card
                    key={campaign.id}
                    className="overflow-hidden border-l-4 border-l-green-500 bg-green-50"
                  >
                    {/* Summary */}
                    <div
                      className="p-6 cursor-pointer hover:bg-green-100 transition"
                      onClick={() =>
                        setExpandedCampaign(isExpanded ? null : campaign.id)
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {campaign.title}
                            </h3>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                              Confirmed
                            </span>
                          </div>

                          <p className="text-gray-600 line-clamp-1">
                            {campaign.description}
                          </p>

                          {/* Quick Info */}
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              Confirmed on{" "}
                              {new Date(
                                campaign.beneficiaryConfirmedAt
                              ).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />$
                              {campaign.amountRaised.toLocaleString()}
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

                    {/* Details */}
                    {isExpanded && (
                      <div className="border-t border-green-200 bg-white p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          {/* Campaign Details */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4">
                              Campaign Details
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <p className="text-gray-600">Provider</p>
                                <p className="font-semibold text-gray-900">
                                  {mockDataService.getProviderById(
                                    campaign.providerId
                                  )?.name || "Not Assigned"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Category</p>
                                <p className="font-semibold text-gray-900 capitalize">
                                  {campaign.category}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Status</p>
                                <p className="font-semibold text-gray-900 capitalize">
                                  {campaign.status}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Funding Summary */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4">
                              Funding Summary
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <p className="text-gray-600">Total Raised</p>
                                <p className="font-semibold text-green-600 text-lg">
                                  ${campaign.amountRaised.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Donor Count</p>
                                <p className="font-semibold text-gray-900">
                                  {campaign.donorCount || 0} donors
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Confirmation Summary */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-green-900">
                                Service Confirmed
                              </p>
                              <p className="text-sm text-green-800 mt-1">
                                Both provider and beneficiary have confirmed
                                delivery. Funds are unlocked for payout.
                              </p>
                              <p className="text-xs text-green-700 mt-2">
                                Confirmed on{" "}
                                {new Date(
                                  campaign.beneficiaryConfirmedAt
                                ).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(
                                  campaign.beneficiaryConfirmedAt
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {campaignsNeedingConfirmation.length === 0 &&
          confirmedCampaigns.length === 0 && (
            <Card className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 text-lg font-semibold">
                No campaigns to confirm
              </p>
              <p className="text-gray-600 mt-2">
                You don't have any campaigns awaiting confirmation yet.
              </p>
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
