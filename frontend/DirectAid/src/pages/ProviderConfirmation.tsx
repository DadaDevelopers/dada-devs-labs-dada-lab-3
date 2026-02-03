import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { mockDataService } from "../services/mockData";
import { Button } from "../components/ui/Button";
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
  User,
} from "lucide-react";

const ProviderConfirmation = () => {
  const navigate = useNavigate();
  const { campaigns, updateCampaign } = useApp();
  const provider = mockDataService.getProviderUser();

  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get campaigns assigned to this provider that need confirmation
  const campaignsNeedingConfirmation = campaigns.filter(
    (c) =>
      c.providerId === provider.id &&
      (c.confirmationStatus === "pending" ||
        c.confirmationStatus === "provider_confirmed")
  );

  const handleConfirmService = async (campaignId: string) => {
    setConfirmingId(campaignId);
    setIsSubmitting(true);

    // Simulate confirmation processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      const newConfirmationStatus =
        campaign.confirmationStatus === "provider_confirmed"
          ? "both_confirmed"
          : "provider_confirmed";

      updateCampaign(campaignId, {
        confirmationStatus: newConfirmationStatus,
        providerConfirmedAt: new Date().toISOString(),
      });
    }

    setConfirmingId(null);
    setIsSubmitting(false);
  };

  const getConfirmationStatus = (campaign: any) => {
    if (campaign.confirmationStatus === "both_confirmed") {
      return {
        status: "Confirmed",
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    } else if (campaign.confirmationStatus === "provider_confirmed") {
      return {
        status: "Awaiting Beneficiary",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      };
    }
    return {
      status: "Pending",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    };
  };

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: "var(--color-primary-bg)" }}
    >
      {/* Header */}
      <div
        style={{ backgroundColor: "var(--color-secondary-bg)" }}
        className="border-b sticky top-0 z-10"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/provider")}
            className="flex items-center gap-2 font-medium mb-4"
            style={{ color: "var(--color-accent)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--color-text-light)" }}
          >
            Confirm Services
          </h1>
          <p
            style={{ color: "var(--color-text-light)", opacity: 0.8 }}
            className="mt-2"
          >
            Confirm that you have delivered services for the following campaigns
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {campaignsNeedingConfirmation.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <p className="text-gray-700 text-lg font-semibold">
              All campaigns confirmed!
            </p>
            <p className="text-gray-600 mt-2">
              You have confirmed all campaigns assigned to you. Great work!
            </p>
            <Button
              onClick={() => navigate("/provider")}
              className="mt-6 w-full rounded-full btn-cta"
            >
              Return to Dashboard
            </Button>
          </Card>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                <span className="font-semibold">
                  {campaignsNeedingConfirmation.length}
                </span>{" "}
                {campaignsNeedingConfirmation.length === 1
                  ? "campaign"
                  : "campaigns"}{" "}
                pending confirmation
              </p>
            </div>

            <div className="space-y-4">
              {campaignsNeedingConfirmation.map((campaign) => {
                const statusInfo = getConfirmationStatus(campaign);
                const isExpanded = expandedCampaign === campaign.id;

                return (
                  <Card
                    key={campaign.id}
                    className={`overflow-hidden border-l-4 transition ${
                      campaign.confirmationStatus === "both_confirmed"
                        ? "border-l-green-500 bg-green-50"
                        : "border-l-indigo-500"
                    }`}
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
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}
                            >
                              {statusInfo.status}
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
                                <p className="text-gray-600">Beneficiary</p>
                                <p className="font-semibold text-gray-900">
                                  {mockDataService.getBeneficiaryById(
                                    campaign.beneficiaryId
                                  )?.name || "Unknown"}
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
                                      width: `${Math.min(
                                        (campaign.amountRaised /
                                          campaign.targetAmount) *
                                          100,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
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
                              Submitted Invoice
                            </h4>
                            <div className="p-3 bg-white rounded border border-gray-200 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {campaign.invoice.invoiceNumber}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    ${campaign.invoice.amount.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded ${
                                  campaign.invoice.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {campaign.invoice.status}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Confirmation Timeline */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Confirmation Status
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  campaign.confirmationStatus ===
                                    "provider_confirmed" ||
                                  campaign.confirmationStatus ===
                                    "both_confirmed"
                                    ? "bg-green-100"
                                    : "bg-gray-100"
                                }`}
                              >
                                {campaign.confirmationStatus ===
                                  "provider_confirmed" ||
                                campaign.confirmationStatus ===
                                  "both_confirmed" ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Clock className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Provider Confirmation
                                </p>
                                <p className="text-sm text-gray-600">
                                  {campaign.confirmationStatus ===
                                    "provider_confirmed" ||
                                  campaign.confirmationStatus ===
                                    "both_confirmed"
                                    ? `Confirmed on ${new Date(
                                        campaign.providerConfirmedAt
                                      ).toLocaleDateString()}`
                                    : "Pending"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  campaign.confirmationStatus ===
                                  "both_confirmed"
                                    ? "bg-green-100"
                                    : "bg-gray-100"
                                }`}
                              >
                                {campaign.confirmationStatus ===
                                "both_confirmed" ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Clock className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Beneficiary Confirmation
                                </p>
                                <p className="text-sm text-gray-600">
                                  {campaign.confirmationStatus ===
                                  "both_confirmed"
                                    ? `Confirmed on ${new Date(
                                        campaign.beneficiaryConfirmedAt
                                      ).toLocaleDateString()}`
                                    : "Pending"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        {campaign.confirmationStatus !== "both_confirmed" && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-700 mb-4">
                              By confirming, you're attesting that you have
                              successfully delivered the services described in
                              this campaign.
                            </p>
                            <Button
                              onClick={() => handleConfirmService(campaign.id)}
                              disabled={
                                isSubmitting && confirmingId === campaign.id
                              }
                              className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                            >
                              {isSubmitting && confirmingId === campaign.id
                                ? "Confirming..."
                                : "Confirm Service Delivery"}
                            </Button>
                          </div>
                        )}

                        {campaign.confirmationStatus === "both_confirmed" && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-green-900">
                                Service Confirmed
                              </p>
                              <p className="text-sm text-green-800 mt-1">
                                Both provider and beneficiary have confirmed the
                                service delivery. Funds are ready for payout.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ChevronDown and ChevronUp icons
import { ChevronDown, ChevronUp } from "lucide-react";

export default ProviderConfirmation;
