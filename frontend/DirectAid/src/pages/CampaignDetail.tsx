import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { mockDataService } from "../services/mockData";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Heart,
  Share2,
  Flag,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Users,
  Calendar,
} from "lucide-react";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns } = useApp();

  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-primary-bg)" }}
      >
        <div
          style={{
            backgroundColor: "var(--color-secondary-bg)",
            borderColor: "var(--color-accent)",
          }}
          className="rounded-lg border p-8 text-center max-w-md"
        >
          <AlertCircle
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: "var(--color-accent)" }}
          />
          <p className="mb-4" style={{ color: "var(--color-text-light)" }}>
            Campaign not found.
          </p>
          <Button
            onClick={() => navigate("/campaigns")}
            className="w-full"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-primary-bg)",
            }}
          >
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  const getProgressPercentage = () => {
    return Math.min((campaign.amountRaised / campaign.targetAmount) * 100, 100);
  };

  const daysLeft = () => {
    const end = new Date(campaign.fundraisingDeadline);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-primary-bg)" }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "var(--color-secondary-bg)",
          borderBottomColor: "var(--color-accent)",
        }}
        className="border-b sticky top-0 z-10"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/campaigns")}
            className="flex items-center gap-2 text-sm font-medium mb-4 transition hover:opacity-80"
            style={{ color: "var(--color-accent)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Section */}
            <div
              style={{
                backgroundColor: "var(--color-secondary-bg)",
                borderColor: "var(--color-accent)",
              }}
              className="mb-6 overflow-hidden rounded-lg border card-elevated"
            >
              <div
                className="h-80 flex items-center justify-center border-b"
                style={{
                  backgroundColor: "var(--color-primary-bg)",
                  borderBottomColor: "var(--color-accent)",
                }}
               
              >
                <Heart
                  className="w-24 h-24"
                  style={{ color: "var(--color-accent)", opacity: 0.4 }}
                />
              </div>

              {/* Title & Meta */}
              <div className="p-6">
                <div className="flex gap-3 mb-4">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full capitalize border"
                    style={{
                      backgroundColor: "rgba(0, 255, 255, 0.1)",
                      color: "var(--color-accent)",
                      borderColor: "var(--color-accent)",
                    }}
                  >
                    {campaign.status}
                  </span>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full capitalize border"
                    style={{
                      backgroundColor: "rgba(0, 255, 255, 0.1)",
                      color: "var(--color-accent)",
                      borderColor: "var(--color-accent)",
                    }}
                  >
                    {campaign.category}
                  </span>
                </div>

                <h1
                  className="text-3xl font-bold mb-2"
                  style={{ color: "var(--color-text-light)" }}
                >
                  {campaign.title}
                </h1>

                <div
                  className="flex flex-wrap gap-6 mb-6"
                  style={{ color: "var(--color-text-light)", opacity: 0.8 }}
                  
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{campaign.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{daysLeft()} days left</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{campaign.donorCount || 0} donors</span>
                  </div>
                </div>

                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: "var(--color-primary-bg)",
                    borderColor: "var(--color-accent)",
                  }}
                  
                >
                  <p
                    style={{ color: "var(--color-text-light)" }}
                    className="leading-relaxed"
                  >
                    {campaign.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Details */}
<div
  style={{
    backgroundColor: "var(--color-secondary-bg)",
    borderColor: "var(--color-accent)",
  }}
  className="mb-6 rounded-lg border p-6 card-elevated"
>
  <h2
    className="text-xl font-bold mb-4"
    style={{ color: "var(--color-text-light)" }}
  >
    Campaign Details
  </h2>

  <div className="grid grid-cols-2 gap-6 mb-1">
    <div>
      <p
        className="text-sm"
        style={{ color: "var(--color-text-light)", opacity: 0.7 }}
      >
        Beneficiary
      </p>
      <p
        className="font-semibold"
        style={{ color: "var(--color-text-light)" }}
      >
        {campaign.beneficiaryId
          ? mockDataService.getBeneficiaryById(campaign.beneficiaryId)?.name ||
            "Pending Assignment"
          : "Pending Assignment"}
      </p>
    </div>
    <div>
      <p
        className="text-sm mb-1"
        style={{ color: "var(--color-text-light)", opacity: 0.7 }}
      >
        Provider
      </p>
      <p
        className="font-semibold"
        style={{ color: "var(--color-text-light)" }}
      >
        DirectAid Provider Network
      </p>
    </div>
    <div>
      <p
        className="text-sm mb-1"
        style={{ color: "var(--color-text-light)", opacity: 0.7 }}
      >
        Created
      </p>
      <p
        className="font-semibold"
        style={{ color: "var(--color-text-light)" }}
      >
        {new Date(campaign.createdAt).toLocaleDateString()}
      </p>
    </div>
    <div>
      <p
        className="text-sm mb-1"
        style={{ color: "var(--color-text-light)", opacity: 0.7 }}
      >
        Category
      </p>
      <p
        className="font-semibold capitalize"
        style={{ color: "var(--color-text-light)" }}
      >
        {campaign.category}
      </p>
    </div>
  </div>
</div>


            {/* Funding Progress */}
            <div
              style={{
                backgroundColor: "var(--color-secondary-bg)",
                borderColor: "var(--color-accent)",
              }}
              className="rounded-lg border p-6 card-elevated"
            >
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: "var(--color-text-light)" }}
              >
                Funding Progress
              </h2>

              <div className="flex items-end gap-4 mb-6">
                <div>
                  <p
                    className="text-sm mb-1"
                    style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    
                  >
                    Raised
                  </p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    ${campaign.amountRaised.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm mb-1"
                    style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    
                  >
                    Goal
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    ${campaign.targetAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div
                className="w-full rounded-full h-3"
                style={{ backgroundColor: "var(--color-primary-bg)" }}
              >
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: "var(--color-accent)",
                  }}
                ></div>
              </div>
              <p
                className="text-sm mt-3"
                style={{ color: "var(--color-text-light)" }}
              >
                {getProgressPercentage().toFixed(0)}% of goal reached
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Donate Button */}
            <Button
              onClick={() => navigate(`/donate?campaignId=${campaign.id}`)}
              className="w-full mb-4 text-lg py-6"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-primary-bg)",
              }}
            >
              <Heart className="w-5 h-5 mr-2" />
              Donate Now
            </Button>

            {/* Quick Info */}
            <div
              style={{
                backgroundColor: "var(--color-secondary-bg)",
                borderColor: "var(--color-accent)",
              }}
              className="rounded-lg border p-4 card-elevated"
            >
              <div className="space-y-4">
                <div>
                  <p
                    className="text-xs uppercase tracking-wide mb-1"
                    style={{ color: "var(--color-accent)" }}
                    
                  >
                    Status
                  </p>
                  <p
                    className="font-semibold capitalize"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    {campaign.status}
                  </p>
                </div>
                <div
                  style={{ borderTopColor: "rgba(0, 255, 255, 0.2)" }}
                  className="border-t pt-4"
                >
                  <p
                    className="text-xs uppercase tracking-wide mb-1"
                    style={{ color: "var(--color-accent)" }}
                    
                  >
                    Deadline
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    {daysLeft()} days remaining
                  </p>
                </div>
                <div
                  style={{ borderTopColor: "rgba(0, 255, 255, 0.2)" }}
                  className="border-t pt-4"
                >
                  <p
                    className="text-xs uppercase tracking-wide mb-1"
                    style={{ color: "var(--color-accent)" }}
                    
                  >
                    Donors
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    {campaign.donorCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
