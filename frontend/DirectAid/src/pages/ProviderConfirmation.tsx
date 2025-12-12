import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { mockDataService } from "../services/mockData";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  Clock,
} from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";

const ProviderConfirmation = () => {
  const navigate = useNavigate();
  const { campaigns, updateCampaign } = useApp();
  const provider = mockDataService.getProviderUser();

  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campaigns assigned to this provider that need confirmation
  const campaignsNeedingConfirmation = campaigns.filter(
    (c) =>
      c.providerId === provider.id &&
      (c.confirmationStatus === "pending" ||
        c.confirmationStatus === "provider_confirmed")
  );

  const handleConfirmService = async (campaignId: string) => {
    setConfirmingId(campaignId);
    setIsSubmitting(true);

    // Simulate API processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const newStatus =
      campaign.confirmationStatus === "provider_confirmed"
        ? "both_confirmed"
        : "provider_confirmed";

    updateCampaign(campaignId, { confirmationStatus: newStatus });

    setConfirmingId(null);
    setIsSubmitting(false);
  };

  const getStatusInfo = (campaign: any) => {
    switch (campaign.confirmationStatus) {
      case "both_confirmed":
        return {
          text: "Confirmed",
          textColor: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "provider_confirmed":
        return {
          text: "Awaiting Beneficiary",
          textColor: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      default:
        return {
          text: "Pending",
          textColor: "text-yellow-600",
          bgColor: "bg-yellow-50",
        };
    }
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
          <Card
            className="p-12 text-center card-elevated"
            style={{
              backgroundColor: "var(--color-secondary-bg)",
              borderColor: "var(--color-accent)",
            }}
          >
            <CheckCircle2
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "var(--color-accent)" }}
            />
            <p
              className="text-lg font-semibold"
              style={{ color: "var(--color-text-light)" }}
            >
              All campaigns confirmed!
            </p>
            <p
              style={{ color: "var(--color-text-light)", opacity: 0.8 }}
              className="mt-2"
            >
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
          <div className="space-y-4">
            {campaignsNeedingConfirmation.map((campaign) => {
              const status = getStatusInfo(campaign);
              const isExpanded = expandedCampaign === campaign.id;

              return (
                <Card
                  key={campaign.id}
                  className={`overflow-hidden border-l-4 ${
                    campaign.confirmationStatus === "both_confirmed"
                      ? "border-l-green-500"
                      : "border-l-indigo-500"
                  } card-elevated`}
                  style={{ backgroundColor: "var(--color-secondary-bg)" }}
                >
                  {/* Summary */}
                  <div
                    className="p-6 cursor-pointer transition"
                    onClick={() =>
                      setExpandedCampaign(isExpanded ? null : campaign.id)
                    }
                    style={{ color: "var(--color-text-light)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className="text-lg font-bold"
                            style={{ color: "var(--color-text-light)" }}
                          >
                            {campaign.title}
                          </h3>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.bgColor} ${status.textColor}`}
                          >
                            {status.text}
                          </span>
                        </div>
                        <p
                          style={{
                            color: "var(--color-text-light)",
                            opacity: 0.85,
                          }}
                          className="line-clamp-1"
                        >
                          {campaign.description}
                        </p>
                        <div
                          className="flex flex-wrap gap-4 mt-3 text-sm"
                          style={{
                            color: "var(--color-text-light)",
                            opacity: 0.7,
                          }}
                        >
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
                            {new Date(campaign.createdAt).toLocaleDateString()}
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
                    <div
                      className="border-t p-6 space-y-4"
                      style={{
                        backgroundColor: "var(--color-secondary-bg)",
                        borderColor: "transparent",
                      }}
                    >
                      {campaign.confirmationStatus !== "both_confirmed" && (
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
                      )}

                      {campaign.confirmationStatus === "both_confirmed" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-green-900">
                              Service Confirmed
                            </p>
                            <p className="text-sm text-green-800 mt-1">
                              Both provider and beneficiary have confirmed.
                              Funds are ready for payout.
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
        )}
      </div>
    </div>
  );
};

export default ProviderConfirmation;
