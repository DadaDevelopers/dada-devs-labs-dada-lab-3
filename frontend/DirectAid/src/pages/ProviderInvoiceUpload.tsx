import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { mockDataService } from "../services/mockData";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";

import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";

// -------------------------------------------------------
// Types
// -------------------------------------------------------

type Step = "upload-invoice" | "review" | "success";

interface InvoiceFormState {
  invoiceNumber: string;
  invoiceDate: string;
  invoiceAmount: string;
  description: string;
  invoiceFile: File | null;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  invoices?: any[];
  providerConfirmed?: boolean;
}

// -------------------------------------------------------
// Component
// -------------------------------------------------------

const ProviderInvoiceUpload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { campaigns, updateCampaign } = useApp();

  const provider = mockDataService.getProviderUser();
  const campaignId = searchParams.get("campaignId");

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("upload-invoice");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // Invoice Data
  const [invoiceData, setInvoiceData] = useState<InvoiceFormState>({
    invoiceNumber: "",
    invoiceDate: "",
    invoiceAmount: "",
    description: "",
    invoiceFile: null,
  });

  // -------------------------------------------------------
  // Load Campaign
  // -------------------------------------------------------
  useEffect(() => {
    if (!campaignId) {
      navigate("/provider");
      return;
    }

    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) navigate("/provider");
    else setSelectedCampaign(campaign as Campaign);
  }, [campaignId, campaigns, navigate]);

  // -------------------------------------------------------
  // Handlers
  // -------------------------------------------------------

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInvoiceData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInvoiceData((prev) => ({ ...prev, invoiceFile: file }));

    if (file.type.startsWith("image/") || file.type === "application/pdf") {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setInvoiceData((prev) => ({ ...prev, invoiceFile: null }));
    setPreviewUrl("");
  };

  const canProceed = () => {
    const { invoiceNumber, invoiceDate, invoiceAmount, description, invoiceFile } =
      invoiceData;
    return (
      invoiceNumber &&
      invoiceDate &&
      invoiceAmount &&
      description &&
      invoiceFile
    );
  };

  const handleSubmitInvoice = async () => {
    if (!selectedCampaign) return;

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const invoiceId = `invoice_${Date.now()}`;

    const updated = {
      ...selectedCampaign,
      providerConfirmed: true,
      invoices: [
        ...(selectedCampaign.invoices ?? []),
        {
          id: invoiceId,
          number: invoiceData.invoiceNumber,
          amount: parseFloat(invoiceData.invoiceAmount),
          date: invoiceData.invoiceDate,
          description: invoiceData.description,
          fileUrl: previewUrl,
          status: "pending_approval",
          uploadedAt: new Date().toISOString(),
          uploadedBy: provider.id,
        },
      ],
    };

    updateCampaign(selectedCampaign.id, updated);
    setIsSubmitting(false);
    setCurrentStep("success");
  };

  const backToDashboard = () => navigate("/provider");

  // -------------------------------------------------------
  // Loading State
  // -------------------------------------------------------
  if (!selectedCampaign) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // Upload Step
  // -------------------------------------------------------
  if (currentStep === "upload-invoice") {
    return (
      <div className="min-h-screen p-6 bg-primary-bg text-foreground">
        <div className="max-w-2xl mx-auto">
          {/* Back */}
          <button
            onClick={backToDashboard}
            className="flex items-center gap-2 text-primary font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          {/* Header */}
          <h1 className="text-3xl font-bold mb-2">Provider Confirmation</h1>
          <p className="text-muted-foreground mb-6">
            Upload your invoice to confirm service readiness for{" "}
            <span className="font-semibold text-foreground">
              {selectedCampaign.title}
            </span>
          </p>

          {/* Info Box */}
          <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary" />
              <div className="text-sm">
                <p className="font-semibold mb-1">What is Provider Confirmation?</p>
                <p className="text-muted-foreground">
                  Uploading your invoice confirms your readiness to deliver
                  services as agreed under this campaign.
                </p>
              </div>
            </div>
          </Card>

          {/* Invoice Form */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Invoice Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Invoice Number
                </label>
                <Input
                  name="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={handleInputChange}
                  placeholder="INV-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Invoice Date
                </label>
                <Input
                  type="date"
                  name="invoiceDate"
                  value={invoiceData.invoiceDate}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount (USD)
                </label>
                <Input
                  type="number"
                  name="invoiceAmount"
                  value={invoiceData.invoiceAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Description of Services
              </label>
              <textarea
                name="description"
                value={invoiceData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:ring-primary focus:ring-2"
              />
            </div>
          </Card>

          {/* File Upload */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Upload Invoice File</h2>

            {!invoiceData.invoiceFile ? (
              <label className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer block hover:bg-secondary/50 transition">
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium mb-1">Click to upload or drag & drop</p>
                <p className="text-sm text-muted-foreground">
                  PDF, PNG, JPG — Max 10MB
                </p>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="p-4 border border-green-500/30 bg-green-500/10 rounded-lg flex items-start justify-between">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <p className="font-semibold">{invoiceData.invoiceFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(invoiceData.invoiceFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>

                <button onClick={handleRemoveFile} className="text-destructive">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={backToDashboard}
            >
              Cancel
            </Button>

            <Button
              className="flex-1"
              disabled={!canProceed()}
              onClick={() => setCurrentStep("review")}
            >
              Review & Submit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // Review Step
  // -------------------------------------------------------
  if (currentStep === "review") {
    return (
      <div className="min-h-screen p-6 bg-primary-bg text-foreground">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setCurrentStep("upload-invoice")}
            className="flex items-center gap-2 text-primary font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Edit Invoice
          </button>

          <h1 className="text-3xl font-bold mb-8">Review Invoice</h1>

          {/* Campaign Info */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold mb-3">Campaign</h2>
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="font-semibold">{selectedCampaign.title}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedCampaign.description}
              </p>
            </div>
          </Card>

          {/* Invoice Summary */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Invoice Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span>Invoice Number</span>
                <span className="font-semibold">{invoiceData.invoiceNumber}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-border">
                <span>Date</span>
                <span className="font-semibold">
                  {new Date(invoiceData.invoiceDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-border">
                <span>Amount</span>
                <span className="font-semibold text-primary">
                  $
                  {Number(invoiceData.invoiceAmount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="py-2 border-b border-border">
                <p className="mb-1 font-medium">Description</p>
                <p className="bg-card p-3 rounded">{invoiceData.description}</p>
              </div>

              <div className="py-2">
                <p className="mb-1 font-medium">File</p>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span>{invoiceData.invoiceFile?.name}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Warning */}
          <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Before you submit:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ensure all invoice details are correct.</li>
                  <li>Invoice must match services for this campaign.</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCurrentStep("upload-invoice")}
            >
              Edit
            </Button>

            <Button
              className="flex-1"
              disabled={isSubmitting}
              onClick={handleSubmitInvoice}
            >
              {isSubmitting ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // Success Step
  // -------------------------------------------------------
  return (
    <div className="min-h-screen p-6 bg-primary-bg text-foreground flex items-start pt-12">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Invoice Submitted!</h1>

        <p className="text-muted-foreground mb-6">
          Your invoice has been successfully uploaded and sent for admin approval.
        </p>

        <Button onClick={backToDashboard} className="w-full">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ProviderInvoiceUpload;
