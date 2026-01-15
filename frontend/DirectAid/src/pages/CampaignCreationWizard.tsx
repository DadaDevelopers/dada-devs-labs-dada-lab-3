// src/pages/CampaignCreationWizard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
//import { mockDataService } from "../services/mockData";
import { providers } from "../data/providers";
import type{ Campaign, Invoice } from "../types";
import { matchProvidersToCampaign } from "../utils/matchingEngine";
import { Button } from "../components/ui/button"; // ← fixed path
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

type Step = "info" | "invoice" | "review" | "success";

const CampaignCreationWizard = () => {
  const navigate = useNavigate();
  const { currentUser, createCampaign } = useApp(); // ← use createCampaign from context
  const [currentStep, setCurrentStep] = useState<Step>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackToDashboard = () => {
  navigate("/beneficiary"); // or wherever beneficiary dashboard is
};

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    fundraisingDeadline: "",
    location: "",
    category: "medical" as const,
  });

  const [invoiceData, setInvoiceData] = useState({
    invoiceFile: null as File | null,
    invoiceAmount: "",
    invoiceDate: "",
  });

  const [newCampaign, setNewCampaign] = useState<any>(null);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const canProceedToInvoice = () =>
    formData.title.trim() &&
    formData.description.trim() &&
    formData.targetAmount &&
    formData.fundraisingDeadline &&
    formData.location.trim();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvoiceData((prev) => ({ ...prev, invoiceFile: file }));
    }
  };

  const canProceedToReview = () =>
    invoiceData.invoiceFile && invoiceData.invoiceAmount && invoiceData.invoiceDate;

  // FIXED: Moved out of component + proper async
const handleCreateCampaign = async () => {
  setIsSubmitting(true);

  try {
    const invoiceId = `inv_${Date.now()}`;
   const invoice: Invoice = {
    id: invoiceId,
    providerId: "", // Filled after matching
    invoiceNumber: `INV-${Math.floor(Math.random() * 1000000)}`,
    amount: parseFloat(invoiceData.invoiceAmount),
    currency: "USD",
    invoiceDate: invoiceData.invoiceDate,
    dueDate: new Date(
      new Date(invoiceData.invoiceDate).getTime() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(), // 30 days later
    description: `Invoice for campaign: ${formData.title}`,
    fileUrl: invoiceData.invoiceFile
      ? URL.createObjectURL(invoiceData.invoiceFile) // temp browser URL for preview
      : "",
    fileHash: "pending-hash", // replace with real hash in production
    status: "uploaded" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Build baseCampaign using the FULL invoice
  const baseCampaign = {
    id: `camp_${Date.now()}`,
    title: formData.title,
    description: formData.description,
    targetAmount: parseFloat(formData.targetAmount),
    amountRaised: 0,
    donorCount: 0,
    category: formData.category,
    location: formData.location,
    beneficiaryId: currentUser?.id || "",
    beneficiary: currentUser
      ? { name: currentUser.name || "", id: currentUser.id }
      : { id: "", name: "" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fundraisingDeadline: formData.fundraisingDeadline,
    status: "draft" as const,
    adminStatus: "pending" as const,
    progressPercentage: 0,
    donationTimeline: [] as any[],
    proofDocuments: [],
    confirmationStatus: "pending" as const,
    invoice, // ← Now full Invoice (not the small object)
    invoiceId: invoiceId,
  };

  // Match providers
  const matchedProviders = matchProvidersToCampaign(
    baseCampaign as unknown as Campaign,
    providers
  );

  // Update invoice with top match (if any)
  if (matchedProviders.length > 0) {
    invoice.providerId = matchedProviders[0].id;
  }

  // Final full campaign
  const fullCampaign: Campaign = {
    ...baseCampaign,
    providerId: matchedProviders[0]?.id || "none",
    provider: matchedProviders[0]
      ? { id: matchedProviders[0].id }
      : undefined,
    status: matchedProviders.length > 0 ? "pending_approval" : "draft",
  };

    createCampaign(fullCampaign);

    setNewCampaign(fullCampaign);
    setCurrentStep("success");
  } catch (error) {
    console.error("Failed to create campaign:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: "var(--color-primary-bg)" }}
    >
      {/* Header & Progress */}
      <div className="max-w-2xl mx-auto mb-8">
        <button
          onClick={() =>
            currentStep === "info"
              ? navigate("/beneficiary")
              : setCurrentStep("info")
          }
          className="flex items-center gap-2 text-sm hover:opacity-80 mb-6 transition"
          style={{ color: "var(--color-accent)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === "info" ? "Back to Dashboard" : "Start Over"}
        </button>

        <div className="mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: "var(--color-text-light)" }}
          >
            Create Campaign
          </h1>
          <div className="flex gap-2 sm:gap-4">
            {["info", "invoice", "review", "success"].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition border"
                  style={{
                    backgroundColor:
                      ["info", "invoice", "review", "success"].indexOf(currentStep) >= idx
                        ? "var(--color-accent)"
                        : "var(--color-secondary-bg)",
                    color:
                      ["info", "invoice", "review", "success"].indexOf(currentStep) >= idx
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
                        ["info", "invoice", "review", "success"].indexOf(currentStep) > idx
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
        {/* Step 1: Info */}
        {currentStep === "info" && (
          <Card className="p-6 sm:p-8" style={{ backgroundColor: "var(--color-secondary-bg)", borderColor: "var(--color-accent)" }}>
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-6 h-6" style={{ color: "var(--color-accent)" }} />
              <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-light)" }}>
                Campaign Details
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-light)" }}>
                  Campaign Title *
                </label>
                <Input
                  type="text"
                  name="title"
                  placeholder="e.g., Heart Surgery Fund for Ahmed"
                  value={formData.title}
                  onChange={handleFormChange}
                  style={{ backgroundColor: "var(--color-primary-bg)", color: "var(--color-text-light)", borderColor: "var(--color-accent)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-light)" }}>
                  Campaign Description *
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Explain the campaign..."
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full p-3 rounded-lg border"
                  style={{ backgroundColor: "var(--color-primary-bg)", color: "var(--color-text-light)", borderColor: "var(--color-accent)" }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-light)" }}>
                    Target Amount (USD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5" style={{ color: "var(--color-accent)" }} />
                    <Input
                      type="number"
                      name="targetAmount"
                      placeholder="5000"
                      value={formData.targetAmount}
                      onChange={handleFormChange}
                      className="pl-10"
                      style={{ backgroundColor: "var(--color-primary-bg)", color: "var(--color-text-light)", borderColor: "var(--color-accent)" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-light)" }}>
                    Fundraising Deadline *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-5 h-5" style={{ color: "var(--color-accent)" }} />
                    <Input
                      type="date"
                      name="fundraisingDeadline"
                      value={formData.fundraisingDeadline}
                      onChange={handleFormChange}
                      className="pl-10"
                      style={{ backgroundColor: "var(--color-primary-bg)", color: "var(--color-text-light)", borderColor: "var(--color-accent)" }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-light)" }}>
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5" style={{ color: "var(--color-accent)" }} />
                  <Input
                    type="text"
                    name="location"
                    placeholder="e.g., Lagos, Nigeria"
                    value={formData.location}
                    onChange={handleFormChange}
                    className="pl-10"
                    style={{ backgroundColor: "var(--color-primary-bg)", color: "var(--color-text-light)", borderColor: "var(--color-accent)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-light)" }}>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full p-3 rounded-lg border"
                  style={{ backgroundColor: "var(--color-primary-bg)", color: "var(--color-text-light)", borderColor: "var(--color-accent)" }}
                >
                  <option value="medical">Medical</option>
                  <option value="education">Education</option>
                  <option value="emergency">Emergency Relief</option>
                  <option value="business">Livelihood/Business</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Button
                onClick={() => setCurrentStep("invoice")}
                disabled={!canProceedToInvoice()}
                className="w-full rounded-full mt-6"
                style={{ backgroundColor: "var(--color-accent)", color: "var(--color-primary-bg)" }}
              >
                Next: Upload Invoice
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Invoice */}
        {currentStep === "invoice" && (
          <Card className="p-6 sm:p-8" style={{ backgroundColor: "var(--color-secondary-bg)", borderColor: "var(--color-accent)" }}>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6" style={{ color: "var(--color-accent)" }} />
              <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-light)" }}>
                Invoice Details
              </h2>
            </div>

            <div className="space-y-5">
              <div className="p-4 rounded-lg border" style={{ backgroundColor: "rgba(0, 255, 255, 0.1)", borderColor: "var(--color-accent)" }}>
                <p className="text-sm" style={{ color: "var(--color-accent)" }}>
                  Upload the invoice or receipt that validates this campaign.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "var(--color-text-light)" }}>
                  Invoice/Receipt File *
                </label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: "var(--color-accent)", backgroundColor: "var(--color-primary-bg)" }}>
                  <UploadCloud className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-accent)" }} />
                  <label className="cursor-pointer">
                    <p className="font-semibold" style={{ color: "var(--color-text-light)" }}>Click to upload or drag and drop</p>
                    <p className="text-xs" style={{ color: "var(--color-text-light)", opacity: 0.6 }}>PDF, PNG, JPG (Max 5MB)</p>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {invoiceData.invoiceFile && (
                    <p className="text-sm mt-3 font-medium" style={{ color: "var(--color-accent)" }}>
                      ✓ {invoiceData.invoiceFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-light)" }}>
                    Invoice Amount (USD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5" style={{ color: "var(--color-accent)" }} />
                    <Input
                      type="number"
                      placeholder="5000"
                      value={invoiceData.invoiceAmount}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceAmount: e.target.value }))}
                      className="pl-10"
                      style={{ backgroundColor: "var(--color-primary-bg)", color: "var(--color-text-light)", borderColor: "var(--color-accent)" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-light)" }}>
                    Invoice Date *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-5 h-5" style={{ color: "var(--color-accent)" }} />
                    <Input
                      type="date"
                      value={invoiceData.invoiceDate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                      className="pl-10"
                      style={{ backgroundColor: "var(--color-primary-bg)", color: "var(--color-text-light)", borderColor: "var(--color-accent)" }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => setCurrentStep("info")} variant="outline" className="flex-1 rounded-full" style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)" }}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep("review")} disabled={!canProceedToReview()} className="flex-1 rounded-full" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-primary-bg)" }}>
                  Review
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Review */}
        {currentStep === "review" && (
          <Card className="p-6 sm:p-8" style={{ backgroundColor: "var(--color-secondary-bg)", borderColor: "var(--color-accent)" }}>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6" style={{ color: "var(--color-accent)" }} />
              <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-light)" }}>
                Review Campaign
              </h2>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-lg border" style={{ backgroundColor: "rgba(0, 255, 255, 0.1)", borderColor: "var(--color-accent)" }}>
                <p className="text-sm" style={{ color: "var(--color-accent)" }}>
                  Please review your campaign details. Once submitted, it will be matched with a provider (if available).
                </p>
              </div>

              {/* Summary fields */}
              <div className="space-y-4">
                <div className="border-b pb-4" style={{ borderColor: "var(--color-accent)" }}>
                  <p className="text-sm opacity-70" style={{ color: "var(--color-text-light)" }}>Title</p>
                  <p className="text-lg font-semibold" style={{ color: "var(--color-accent)" }}>{formData.title}</p>
                </div>
                <div className="border-b pb-4" style={{ borderColor: "var(--color-accent)" }}>
                  <p className="text-sm opacity-70" style={{ color: "var(--color-text-light)" }}>Description</p>
                  <p style={{ color: "var(--color-text-light)" }}>{formData.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-b pb-4" style={{ borderColor: "var(--color-accent)" }}>
                  <div>
                    <p className="text-sm opacity-70" style={{ color: "var(--color-text-light)" }}>Target Amount</p>
                    <p className="font-semibold" style={{ color: "var(--color-accent)" }}>${formData.targetAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70" style={{ color: "var(--color-text-light)" }}>Deadline</p>
                    <p className="font-semibold" style={{ color: "var(--color-accent)" }}>{formData.fundraisingDeadline}</p>
                  </div>
                </div>
                <div className="border-b pb-4" style={{ borderColor: "var(--color-accent)" }}>
                  <p className="text-sm opacity-70" style={{ color: "var(--color-text-light)" }}>Location</p>
                  <p className="font-semibold" style={{ color: "var(--color-accent)" }}>{formData.location}</p>
                </div>
                <div className="border-b pb-4" style={{ borderColor: "var(--color-accent)" }}>
                  <p className="text-sm opacity-70" style={{ color: "var(--color-text-light)" }}>Invoice</p>
                  <p className="font-semibold" style={{ color: "var(--color-accent)" }}>✓ {invoiceData.invoiceFile?.name}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => setCurrentStep("invoice")} variant="outline" className="flex-1 rounded-full" style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)" }}>
                  Back
                </Button>
                <Button onClick={handleCreateCampaign} disabled={isSubmitting} className="flex-1 rounded-full" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-primary-bg)" }}>
                  {isSubmitting ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: Success */}
        {currentStep === "success" && (
          <Card className="p-6 sm:p-8 text-center" style={{ backgroundColor: "var(--color-secondary-bg)", borderColor: "var(--color-accent)" }}>
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--color-accent)" }} />
            <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "var(--color-text-light)" }}>
              Campaign Created Successfully!
            </h2>
            <p className="mb-6 max-w-md mx-auto" style={{ color: "var(--color-text-light)", opacity: 0.7 }}>
              {newCampaign?.provider
                ? "A matching provider has been found and assigned."
                : "No provider matched yet — admin will review."}
            </p>

            <div className="p-4 rounded-lg mb-6 text-left" style={{ backgroundColor: "var(--color-primary-bg)", borderColor: "var(--color-accent)" }}>
              <p className="text-sm opacity-60" style={{ color: "var(--color-text-light)" }}>Campaign ID</p>
              <p className="font-mono text-sm break-all" style={{ color: "var(--color-accent)" }}>
                {newCampaign?.id}
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleBackToDashboard} className="w-full rounded-full" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-primary-bg)" }}>
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep("info");
                  setFormData({
                    title: "",
                    description: "",
                    targetAmount: "",
                    fundraisingDeadline: "",
                    location: "",
                    category: "medical",
                  });
                  setInvoiceData({
                    invoiceFile: null,
                    invoiceAmount: "",
                    invoiceDate: "",
                  });
                  setNewCampaign(null);
                }}
                className="w-full rounded-full"
                style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)" }}
              >
                Create Another Campaign
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CampaignCreationWizard;