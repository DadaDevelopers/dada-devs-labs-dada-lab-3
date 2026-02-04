import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { mockDataService } from "../services/mockData";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import type { Campaign, Invoice } from "../types/index";

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

// -------------------------------------------------------
// Component
// -------------------------------------------------------

const ProviderInvoiceUpload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { campaigns, updateCampaign } = useApp();

  // Use a fallback ID if provider.id is missing to prevent crash
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
    // For demo/dev purposes, create a valid mock campaign if none found
    const createMockCampaign = (id: string): Campaign => ({
      _id: id,
      title: "Demo Medical Campaign",
      description: "Sample campaign for invoice upload demonstration",
      providerId: provider?.id || "demo-provider",
      beneficiaryId: "demo-beneficiary",
      provider: {},
      beneficiary: {},
      invoiceId: "",
      invoice: {} as Invoice,
      invoices: [],
      providerConfirmed: false,
      confirmationStatus: "pending",
      status: "active",
      category: "medical",
      location: "Lagos, Nigeria",
      targetAmount: 5000,
      amountRaised: 0,
      donorCount: 0,
      proofDocuments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fundraisingDeadline: new Date(Date.now() + 86400000 * 30).toISOString(),
      progressPercentage: 0,
      donationTimeline: []
    });

    if (!campaignId) {
      const providerCampaigns = campaigns.filter(c => c.providerId === provider?.id);
      if (providerCampaigns.length > 0) {
        setSelectedCampaign(providerCampaigns[0] as Campaign);
      } else {
        setSelectedCampaign(createMockCampaign("demo_campaign_001"));
      }
      return;
    }

    const campaign = campaigns.find((c) => c._id === campaignId);
    if (!campaign) {
      setSelectedCampaign(createMockCampaign("demo_campaign_001"));
    } else {
      setSelectedCampaign(campaign as Campaign);
    }
  }, [campaignId, campaigns, provider?.id]);

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

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newInvoice: Invoice = {
        id: `invoice_${Date.now()}`,
        providerId: provider?.id || "unknown",
        campaignId: selectedCampaign._id,
        invoiceNumber: invoiceData.invoiceNumber,
        amount: parseFloat(invoiceData.invoiceAmount),
        currency: "USD",
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.invoiceDate, 
        description: invoiceData.description,
        fileUrl: previewUrl || "mock-url",
        fileHash: "hash_" + Math.random().toString(36).substring(7),
        status: "uploaded",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const updated: Partial<Campaign> = {
      ...selectedCampaign,
      providerConfirmed: true,
      confirmationStatus: "provider_confirmed",
      invoices: [
        ...(selectedCampaign.invoices ?? []),
        newInvoice,
      ],
    };

    updateCampaign(selectedCampaign._id, updated);
    setIsSubmitting(false);
    setCurrentStep("success");
  };

  const backToDashboard = () => navigate("/provider");

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

  // UPLOAD STEP
  if (currentStep === "upload-invoice") {
    return (
      <div className="min-h-screen p-6 bg-[var(--color-primary-bg)] text-white">
        <div className="max-w-2xl mx-auto">
          <button onClick={backToDashboard} className="flex items-center gap-2 text-[var(--color-accent)] font-medium mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold mb-2">Provider Confirmation</h1>
          <p className="text-white/60 mb-6">
            Upload your invoice to confirm service readiness for <span className="text-white font-semibold">{selectedCampaign.title}</span>
          </p>

          <Card className="p-4 mb-6 bg-white/5 border-white/10">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--color-accent)]" />
              <div className="text-sm">
                <p className="font-semibold mb-1 text-white">What is Provider Confirmation?</p>
                <p className="text-white/60">Uploading your invoice confirms your readiness to deliver services as agreed.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6 bg-[var(--color-secondary-bg)] border-white/10">
            <h2 className="text-xl font-bold mb-4 text-white">Invoice Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/70">Invoice Number</label>
                <Input name="invoiceNumber" value={invoiceData.invoiceNumber} onChange={handleInputChange} placeholder="INV-2024-001" className="bg-[#151D2C] border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/70">Invoice Date</label>
                <Input type="date" name="invoiceDate" value={invoiceData.invoiceDate} onChange={handleInputChange} className="bg-[#151D2C] border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/70">Amount (USD)</label>
                <Input type="number" name="invoiceAmount" value={invoiceData.invoiceAmount} onChange={handleInputChange} placeholder="0.00" className="bg-[#151D2C] border-white/10 text-white" />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2 text-white/70">Description of Services</label>
              <textarea name="description" value={invoiceData.description} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 rounded-lg bg-[#151D2C] border border-white/10 text-white focus:ring-[var(--color-accent)] focus:ring-2 outline-none" />
            </div>
          </Card>

          <Card className="p-6 mb-6 bg-[var(--color-secondary-bg)] border-white/10">
            <h2 className="text-xl font-bold mb-4 text-white">Upload Invoice File</h2>
            {!invoiceData.invoiceFile ? (
              <label className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center cursor-pointer block hover:bg-white/5 transition">
                <Upload className="w-12 h-12 mx-auto mb-3 text-white/40" />
                <p className="font-medium mb-1 text-white">Click to upload or drag & drop</p>
                <p className="text-sm text-white/40">PDF, PNG, JPG — Max 10MB</p>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="p-4 border border-green-500/30 bg-green-500/10 rounded-lg flex items-start justify-between">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <p className="font-semibold text-white">{invoiceData.invoiceFile.name}</p>
                    <p className="text-sm text-white/40">{(invoiceData.invoiceFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button onClick={handleRemoveFile} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5" onClick={backToDashboard}>Cancel</Button>
            <Button className="flex-1 btn-cta" disabled={!canProceed()} onClick={() => setCurrentStep("review")}>Review & Submit</Button>
          </div>
        </div>
      </div>
    );
  }

  // REVIEW STEP
  if (currentStep === "review") {
    return (
      <div className="min-h-screen p-6 bg-[var(--color-primary-bg)] text-white">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setCurrentStep("upload-invoice")} className="flex items-center gap-2 text-[var(--color-accent)] font-medium mb-6">
            <ArrowLeft className="w-4 h-4" /> Edit Invoice
          </button>
          <h1 className="text-3xl font-bold mb-8 text-white">Review Invoice</h1>
          <Card className="p-6 mb-6 bg-[var(--color-secondary-bg)] border-white/10">
            <h2 className="text-lg font-bold mb-3 text-white">Campaign</h2>
            <div className="p-4 bg-[#151D2C] rounded-lg border border-white/5">
              <p className="font-semibold text-white">{selectedCampaign.title}</p>
              <p className="text-sm text-white/60 mt-2">{selectedCampaign.description}</p>
            </div>
          </Card>

          <Card className="p-6 mb-6 bg-[var(--color-secondary-bg)] border-white/10">
            <h2 className="text-lg font-bold mb-4 text-white">Invoice Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/60">Invoice Number</span>
                <span className="font-semibold text-white">{invoiceData.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/60">Date</span>
                <span className="font-semibold text-white">{new Date(invoiceData.invoiceDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/60">Amount</span>
                <span className="font-semibold text-[var(--color-accent)]">${Number(invoiceData.invoiceAmount).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5" onClick={() => setCurrentStep("upload-invoice")}>Edit</Button>
            <Button className="flex-1 btn-cta" disabled={isSubmitting} onClick={handleSubmitInvoice}>
              {isSubmitting ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS STEP
  return (
    <div className="min-h-screen p-6 bg-[var(--color-primary-bg)] text-white flex items-start pt-12">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Invoice Submitted!</h1>
        <p className="text-white/60 mb-6">Your invoice has been successfully uploaded and sent for admin approval.</p>
        <Button onClick={backToDashboard} className="w-full btn-cta">Back to Dashboard</Button>
      </div>
    </div>
  );
};

export default ProviderInvoiceUpload;