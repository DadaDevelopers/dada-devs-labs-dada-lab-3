import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Heart,
  MapPin,
  DollarSign,
  UploadCloud,
  Clock,
} from "lucide-react";

type Step = "details" | "documents" | "review" | "success";

const CampaignCreationWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    category: "medical",
    location: "",
    preferredProvider: "",
    providerLocation: "",
  });

  // Supporting documents
  const [documents, setDocuments] = useState<File[]>([]);
  const [newCampaignId, setNewCampaignId] = useState<string | null>(null);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments((prev) => [...prev, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceedToDocuments = () => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.targetAmount &&
      formData.location.trim()
    );
  };

  const canProceedToReview = () => {
    return documents.length > 0;
  };

  const handleSubmitRequest = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const campaignId = `camp_${Date.now()}`;
    setNewCampaignId(campaignId);
    
    setCurrentStep("success");
    setIsSubmitting(false);
  };

  const handleBackToDashboard = () => {
    navigate("/beneficiary");
  };

  const handleStartOver = () => {
    setCurrentStep("details");
    setFormData({
      title: "",
      description: "",
      targetAmount: "",
      category: "medical",
      location: "",
      preferredProvider: "",
      providerLocation: "",
    });
    setDocuments([]);
    setNewCampaignId(null);
  };

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: "var(--color-primary-bg)" }}
    >
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <button
          onClick={() =>
            currentStep === "details"
              ? navigate("/beneficiary")
              : setCurrentStep("details")
          }
          className="flex items-center gap-2 text-sm hover:opacity-80 mb-6 transition"
          style={{ color: "var(--color-accent)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === "details" ? "Back to Dashboard" : "Start Over"}
        </button>

        {/* Progress Indicator */}
        <div className="mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: "var(--color-text-light)" }}
          >
            Submit Help Request
          </h1>
          <div className="flex gap-2 sm:gap-4">
            {["details", "documents", "review", "success"].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition border"
                  style={{
                    backgroundColor:
                      ["details", "documents", "review", "success"].indexOf(
                        currentStep
                      ) >= idx
                        ? "var(--color-accent)"
                        : "var(--color-secondary-bg)",
                    color:
                      ["details", "documents", "review", "success"].indexOf(
                        currentStep
                      ) >= idx
                        ? "var(--color-primary-bg)"
                        : "var(--color-text-light)",
                    borderColor: "var(--color-accent)",
                  }}
                >
                  {idx + 1}
                </div>
                {idx < 3 && (
                  <div
                    className="w-4 sm:w-8 h-1 mx-2 transition"
                    style={{
                      backgroundColor:
                        ["details", "documents", "review", "success"].indexOf(
                          currentStep
                        ) > idx
                          ? "var(--color-accent)"
                          : "var(--color-secondary-bg)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {/* Step 1: Campaign Details */}
        {currentStep === "details" && (
          <Card
            className="p-6 sm:p-8 card-elevated"
            style={{
              backgroundColor: "var(--color-secondary-bg)",
              borderColor: "var(--color-accent)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Heart
                className="w-6 h-6"
                style={{ color: "var(--color-accent)" }}
              />
              <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-light)" }}
              >
                Campaign Details
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Campaign Title *
                </label>
                <Input
                  type="text"
                  name="title"
                  placeholder="e.g., Heart Surgery Fund for Ahmed"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="rounded-lg"
                  style={{
                    backgroundColor: "var(--color-primary-bg)",
                    color: "var(--color-text-light)",
                    borderColor: "var(--color-accent)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Campaign Description *
                </label>
                <textarea
                  name="description"
                  placeholder="Explain the campaign, why funds are needed, and how they'll be used..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full p-3 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-primary-bg)",
                    color: "var(--color-text-light)",
                    borderColor: "var(--color-accent)",
                  }}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    Target Amount (USD) *
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-3 w-5 h-5"
                      style={{ color: "var(--color-accent)", opacity: 0.7 }}
                    />
                    <Input
                      type="number"
                      name="targetAmount"
                      placeholder="5000"
                      value={formData.targetAmount}
                      onChange={handleFormChange}
                      className="rounded-lg pl-10"
                      style={{
                        backgroundColor: "var(--color-primary-bg)",
                        color: "var(--color-text-light)",
                        borderColor: "var(--color-accent)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-3 w-5 h-5"
                      style={{ color: "var(--color-accent)", opacity: 0.7 }}
                    />
                    <Input
                      type="text"
                      name="location"
                      placeholder="e.g., Lagos, Nigeria"
                      value={formData.location}
                      onChange={handleFormChange}
                      className="rounded-lg pl-10"
                      style={{
                        backgroundColor: "var(--color-primary-bg)",
                        color: "var(--color-text-light)",
                        borderColor: "var(--color-accent)",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full p-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-primary-bg)",
                    color: "var(--color-text-light)",
                    borderColor: "var(--color-accent)",
                  }}
                >
                  <option value="medical">Medical</option>
                  <option value="education">Education</option>
                  <option value="emergency">Emergency Relief</option>
                  <option value="livelihood">Livelihood</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="border-t pt-5" style={{ borderColor: "var(--color-accent)", opacity: 0.3 }}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-accent)" }}>
                  Preferred Provider (Optional)
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--color-text-light)", opacity: 0.7 }}>
                  If you already know a hospital, school, or service provider, specify them here.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      Provider Name
                    </label>
                    <Input
                      type="text"
                      name="preferredProvider"
                      placeholder="e.g., Lagos University Teaching Hospital"
                      value={formData.preferredProvider}
                      onChange={handleFormChange}
                      className="rounded-lg"
                      style={{
                        backgroundColor: "var(--color-primary-bg)",
                        color: "var(--color-text-light)",
                        borderColor: "var(--color-accent)",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      Provider Location
                    </label>
                    <Input
                      type="text"
                      name="providerLocation"
                      placeholder="e.g., Idi-Araba, Lagos"
                      value={formData.providerLocation}
                      onChange={handleFormChange}
                      className="rounded-lg"
                      style={{
                        backgroundColor: "var(--color-primary-bg)",
                        color: "var(--color-text-light)",
                        borderColor: "var(--color-accent)",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => setCurrentStep("documents")}
                  disabled={!canProceedToDocuments()}
                  className="w-full rounded-full"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-primary-bg)",
                  }}
                >
                  Next: Upload Supporting Documents
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Supporting Documents */}
        {currentStep === "documents" && (
          <Card
            className="p-6 sm:p-8 card-elevated"
            style={{
              backgroundColor: "var(--color-secondary-bg)",
              borderColor: "var(--color-accent)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <FileText
                className="w-6 h-6"
                style={{ color: "var(--color-accent)" }}
              />
              <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-light)" }}
              >
                Supporting Documents
              </h2>
            </div>

            <div className="space-y-5">
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: "rgba(0, 255, 255, 0.1)",
                  borderColor: "var(--color-accent)",
                }}
              >
                <p className="text-sm" style={{ color: "var(--color-accent)" }}>
                  Upload documents that verify your need (medical reports, school admission letters, receipts, etc.)
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-3"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Upload Documents *
                </label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center hover:opacity-80 transition"
                  style={{
                    borderColor: "var(--color-accent)",
                    backgroundColor: "var(--color-primary-bg)",
                  }}
                >
                  <UploadCloud
                    className="w-10 h-10 mx-auto mb-3"
                    style={{ color: "var(--color-accent)" }}
                  />
                  <label className="cursor-pointer">
                    <p
                      className="font-semibold"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      Click to upload or drag and drop
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-light)", opacity: 0.6 }}
                    >
                      PDF, PNG, JPG (Max 5MB per file)
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-light)" }}>
                    Uploaded Files ({documents.length})
                  </p>
                  {documents.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: "var(--color-primary-bg)" }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-accent)" }} />
                        <span className="text-sm truncate" style={{ color: "var(--color-text-light)" }}>{file.name}</span>
                      </div>
                      <button
                        onClick={() => removeDocument(index)}
                        className="text-xs hover:opacity-80 flex-shrink-0 ml-2"
                        style={{ color: "#ef4444" }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setCurrentStep("details")}
                  variant="outline"
                  className="flex-1 rounded-full"
                  style={{
                    borderColor: "var(--color-accent)",
                    color: "var(--color-accent)",
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep("review")}
                  disabled={!canProceedToReview()}
                  className="flex-1 rounded-full"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-primary-bg)",
                  }}
                >
                  Review
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Review */}
        {currentStep === "review" && (
          <Card
            className="p-6 sm:p-8 card-elevated"
            style={{
              backgroundColor: "var(--color-secondary-bg)",
              borderColor: "var(--color-accent)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2
                className="w-6 h-6"
                style={{ color: "var(--color-accent)" }}
              />
              <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-light)" }}
              >
                Review Request
              </h2>
            </div>

            <div className="space-y-5">
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: "rgba(0, 255, 255, 0.1)",
                  borderColor: "var(--color-accent)",
                }}
              >
                <p className="text-sm" style={{ color: "var(--color-accent)" }}>
                  Your request will be reviewed by our admin team. Once approved, we'll match you with a verified provider.
                </p>
              </div>

              <div className="space-y-4">
                <div
                  className="border-b pb-4"
                  style={{ borderColor: "var(--color-accent)", opacity: 0.3 }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                  >
                    Title
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {formData.title}
                  </p>
                </div>

                <div
                  className="border-b pb-4"
                  style={{ borderColor: "var(--color-accent)", opacity: 0.3 }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                  >
                    Description
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    {formData.description}
                  </p>
                </div>

                <div
                  className="grid grid-cols-2 gap-4 border-b pb-4"
                  style={{ borderColor: "var(--color-accent)", opacity: 0.3 }}
                >
                  <div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    >
                      Target Amount
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      ${formData.targetAmount}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    >
                      Category
                    </p>
                    <p
                      className="font-semibold capitalize"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {formData.category}
                    </p>
                  </div>
                </div>

                <div
                  className="border-b pb-4"
                  style={{ borderColor: "var(--color-accent)", opacity: 0.3 }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                  >
                    Location
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {formData.location}
                  </p>
                </div>

                {formData.preferredProvider && (
                  <div
                    className="border-b pb-4"
                    style={{ borderColor: "var(--color-accent)", opacity: 0.3 }}
                  >
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    >
                      Preferred Provider
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {formData.preferredProvider}
                    </p>
                    {formData.providerLocation && (
                      <p className="text-xs mt-1" style={{ color: "var(--color-text-light)", opacity: 0.6 }}>
                        {formData.providerLocation}
                      </p>
                    )}
                  </div>
                )}

                <div
                  className="border-b pb-4"
                  style={{ borderColor: "var(--color-accent)", opacity: 0.3 }}
                >
                  <p
                    className="text-sm mb-2"
                    style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                  >
                    Supporting Documents
                  </p>
                  <div className="space-y-1">
                    {documents.map((file, index) => (
                      <p key={index} className="text-sm" style={{ color: "var(--color-accent)" }}>
                        ✓ {file.name}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setCurrentStep("documents")}
                  variant="outline"
                  className="flex-1 rounded-full"
                  style={{
                    borderColor: "var(--color-accent)",
                    color: "var(--color-accent)",
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting}
                  className="flex-1 rounded-full"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-primary-bg)",
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: Success */}
        {currentStep === "success" && (
          <Card
            className="p-6 sm:p-8 card-elevated text-center"
            style={{
              backgroundColor: "var(--color-secondary-bg)",
              borderColor: "var(--color-accent)",
            }}
          >
            <CheckCircle2
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "var(--color-accent)" }}
            />
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ color: "var(--color-text-light)" }}
            >
              Request Submitted!
            </h2>
            <p
              style={{ color: "var(--color-text-light)", opacity: 0.7 }}
              className="mb-6 max-w-md mx-auto"
            >
              Your help request has been submitted for review. Our team will review it and match you with a verified provider.
            </p>

            <div
              className="p-4 rounded-lg mb-6 text-left border"
              style={{
                backgroundColor: "var(--color-primary-bg)",
                borderColor: "var(--color-accent)",
              }}
            >
              <p
                className="text-sm"
                style={{ color: "var(--color-text-light)", opacity: 0.6 }}
              >
                Request ID
              </p>
              <p
                className="font-mono text-sm break-all"
                style={{ color: "var(--color-accent)" }}
              >
                {newCampaignId}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleBackToDashboard}
                className="w-full rounded-full"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-primary-bg)",
                }}
              >
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleStartOver}
                className="w-full rounded-full"
                style={{
                  borderColor: "var(--color-accent)",
                  color: "var(--color-accent)",
                }}
              >
                Create Another Request
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CampaignCreationWizard;