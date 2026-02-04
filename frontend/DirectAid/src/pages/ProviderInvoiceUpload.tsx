import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { mockDataService } from "../services/mockData";
import { DashboardLayout } from "../components/layout/DashboardLayout";
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
  LayoutDashboard,
  FolderKanban,
  Wallet,
  User,
  Bell,
  Lock,
} from "lucide-react";

type Step = "upload-invoice" | "review" | "success";

interface InvoiceFormState {
  invoiceNumber: string;
  invoiceDate: string;
  invoiceAmount: string;
  description: string;
  invoiceFile: File | null;
}

const ProviderInvoiceUpload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { campaigns, updateCampaign } = useApp();
  const { user, role, logout } = useAuth();

  const provider = mockDataService.getProviderUser();
  const campaignId = searchParams.get("campaignId");

  const navItems = [
    { label: "Dashboard", href: "/provider", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Campaigns", href: "/provider/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Upload Invoices", href: "/provider/invoices", icon: <Upload className="w-5 h-5" /> },
    { label: "Withdrawals", href: "/provider/withdrawals", icon: <Wallet className="w-5 h-5" /> },
    { label: "Proof Upload", href: "/provider/proof-upload", icon: <FileText className="w-5 h-5" /> },
  ];

  const settingsNavItems = [
    { id: "profile", label: "Profile", href: "/provider/settings/profile", icon: <User className="w-5 h-5" /> },
    { id: "payouts", label: "Payouts", href: "/provider/settings/payouts", icon: <Wallet className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", href: "/provider/settings/notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "change-password", label: "Change Password", href: "/provider/settings/change-password", icon: <Lock className="w-5 h-5" /> },
  ];

  const userName = user?.name || user?.email || "User";
  const userRole = role || "Guest";

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("upload-invoice");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const [invoiceData, setInvoiceData] = useState<InvoiceFormState>({
    invoiceNumber: "",
    invoiceDate: "",
    invoiceAmount: "",
    description: "",
    invoiceFile: null,
  });

  useEffect(() => {
    if (!campaignId) {
      const providerCampaigns = campaigns.filter(c => c.providerId === provider?.id);
      if (providerCampaigns.length > 0) {
        setSelectedCampaign(providerCampaigns[0] as Campaign);
      }
      return;
    }
    const campaign = campaigns.find((c) => (c._id === campaignId || (c as any).id === campaignId));
    if (campaign) setSelectedCampaign(campaign as Campaign);
  }, [campaignId, campaigns, provider?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInvoiceData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvoiceData((prev) => ({ ...prev, invoiceFile: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setInvoiceData((prev) => ({ ...prev, invoiceFile: null }));
    setPreviewUrl("");
  };

  const canProceed = () => {
    const { invoiceNumber, invoiceDate, invoiceAmount, description, invoiceFile } = invoiceData;
    return invoiceNumber && invoiceDate && invoiceAmount && description && invoiceFile;
  };

  const handleSubmitInvoice = async () => {
    if (!selectedCampaign) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // ... same logic for updateCampaign as provided
    setCurrentStep("success");
    setIsSubmitting(false);
  };

  const backToDashboard = () => navigate("/provider");

  if (!selectedCampaign) return <div className="p-10 text-center">Loading...</div>;

  return (
    <DashboardLayout
      navItems={navItems}
      userName={userName}
      userRole={userRole}
      settingsNavItems={settingsNavItems}
      onLogout={async () => { await logout(); navigate("/"); }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Step Navigation Header */}
        <button onClick={backToDashboard} className="flex items-center gap-2 text-primary font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {currentStep === "upload-invoice" && (
          <>
            <h1 className="text-3xl font-bold mb-2">Provider Confirmation</h1>
            <p className="text-muted-foreground mb-6">
              Upload your invoice for <span className="font-semibold text-foreground">{selectedCampaign.title}</span>
            </p>

            <Card className="p-4 mb-6 bg-primary/5 border-primary/10">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">What is Provider Confirmation?</p>
                  <p className="text-muted-foreground">Uploading your invoice confirms your readiness to deliver services.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-bold">Invoice Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Number</label>
                  <Input name="invoiceNumber" value={invoiceData.invoiceNumber} onChange={handleInputChange} placeholder="INV-2024-001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Date</label>
                  <Input type="date" name="invoiceDate" value={invoiceData.invoiceDate} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (USD)</label>
                <Input type="number" name="invoiceAmount" value={invoiceData.invoiceAmount} onChange={handleInputChange} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  name="description" 
                  value={invoiceData.description} 
                  onChange={handleInputChange} 
                  rows={4} 
                  className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Upload Invoice File</h2>
              {!invoiceData.invoiceFile ? (
                <label className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer block hover:bg-accent/50 transition">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Click to upload or drag & drop</p>
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="p-4 border border-primary/30 bg-primary/5 rounded-lg flex items-center justify-between">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                    <span className="font-medium">{invoiceData.invoiceFile.name}</span>
                  </div>
                  <button onClick={handleRemoveFile} className="text-destructive"><Trash2 className="w-5 h-5" /></button>
                </div>
              )}
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={backToDashboard}>Cancel</Button>
              <Button className="flex-1" disabled={!canProceed()} onClick={() => setCurrentStep("review")}>Review & Submit</Button>
            </div>
          </>
        )}

        {currentStep === "review" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Review Invoice</h1>
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Invoice Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Number</span>
                  <span className="font-semibold">{invoiceData.invoiceNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-primary">${Number(invoiceData.invoiceAmount).toLocaleString()}</span>
                </div>
              </div>
            </Card>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setCurrentStep("upload-invoice")}>Edit</Button>
              <Button className="flex-1" disabled={isSubmitting} onClick={handleSubmitInvoice}>
                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
              </Button>
            </div>
          </div>
        )}

        {currentStep === "success" && (
          <div className="text-center py-12 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">Invoice Submitted!</h1>
            <p className="text-muted-foreground">Sent for admin approval.</p>
            <Button onClick={backToDashboard} className="w-full">Back to Dashboard</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProviderInvoiceUpload;