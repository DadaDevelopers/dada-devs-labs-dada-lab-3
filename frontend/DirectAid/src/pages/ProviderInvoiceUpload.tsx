import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { CampaignService } from "../services/apiServices";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import type { Campaign } from "../types/index";

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

const PAYMENT_METHODS = ["MPESA", "BANK", "STRIPE", "CARD", "BITCOIN", "LIGHTNING", "CASH", "OTHER"] as const;

const ProviderInvoiceUpload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role, logout } = useAuth();
  const campaignId = searchParams.get("campaignId");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [provider, setProvider] = useState<{ _id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  // MVP: only campaigns this provider is linked to (providerId === current user)
  useEffect(() => {
    const load = async () => {
      try {
        const [campRes, provRes] = await Promise.all([
          CampaignService.getAll(),
          api.get("/providers/me"),
        ]);
        const rawList = campRes?.campaigns || [];
        const prov = (provRes as any).provider || null;
        setProvider(prov);
        const userId = (user as any)?.id ?? (user as any)?._id ?? (prov as any)?.userId;
        const myCampaigns = rawList.filter((c: any) => {
          const pid = c.providerId?._id ?? c.providerId;
          return pid != null && String(pid) === String(userId);
        });
        setCampaigns(myCampaigns);
      } catch (e) {
        console.error("Failed to load campaigns/provider", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

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
  const [_previewUrl, setPreviewUrl] = useState("");

  const [invoiceData, setInvoiceData] = useState<InvoiceFormState>({
    invoiceNumber: "",
    invoiceDate: "",
    invoiceAmount: "",
    description: "",
    invoiceFile: null,
  });
  const [paymentMethod, setPaymentMethod] = useState<string>("OTHER");
  const [currency, setCurrency] = useState("USD");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!campaigns.length) return;
    if (campaignId) {
      const campaign = campaigns.find((c) => String((c as any)._id || (c as any).id) === campaignId);
      if (campaign) setSelectedCampaign(campaign as Campaign);
    } else {
      setSelectedCampaign(campaigns[0] as Campaign);
    }
  }, [campaignId, campaigns]);

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
    const { invoiceAmount } = invoiceData;
    return selectedCampaign && provider && invoiceAmount && Number(invoiceAmount) > 0;
  };

  const handleSubmitInvoice = async () => {
    if (!selectedCampaign || !provider) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const amount = Number(invoiceData.invoiceAmount);
      const campaignId = (selectedCampaign as any)._id || (selectedCampaign as any).id;
      await api.post("/invoices", {
        campaignId,
        providerId: provider._id,
        amount,
        currency: currency || "USD",
        paymentMethod: paymentMethod || "OTHER",
        invoiceFileUrl: null,
      });
      setCurrentStep("success");
    } catch (e: any) {
      setSubmitError(e?.response?.data?.message || e?.message || "Failed to submit invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToDashboard = () => navigate("/provider");

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!selectedCampaign) {
    return (
      <DashboardLayout
        navItems={navItems}
        userName={userName}
        userRole={userRole}
        settingsNavItems={settingsNavItems}
        onLogout={async () => { await logout(); navigate("/"); }}
      >
        <div className="max-w-2xl mx-auto p-10 text-center space-y-4">
          <p className="text-muted-foreground">
            You haven&apos;t been assigned to any campaign yet. When a beneficiary creates a campaign and an admin links you as the provider, or you accept a campaign from your Campaigns page, it will appear here so you can upload an invoice.
          </p>
          <p className="text-sm text-muted-foreground">
            Campaigns appear here once you&apos;re assigned by an admin or after you accept a campaign in <strong>Campaigns → To approve</strong>.
          </p>
          <Button variant="outline" onClick={() => navigate("/provider/campaigns")}>Go to Campaigns</Button>
        </div>
      </DashboardLayout>
    );
  }

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
            <p className="text-sm text-muted-foreground mb-4">
              Campaigns appear here once you&apos;re assigned by an admin or after you accept a campaign in Campaigns → To approve.
            </p>
            {campaigns.length > 1 && (
              <div className="mb-4">
                <label className="text-sm font-medium block mb-2">Campaign</label>
                <select
                  value={(selectedCampaign as any)?._id || (selectedCampaign as any)?.id}
                  onChange={(e) => {
                    const c = campaigns.find((x) => String((x as any)._id || (x as any).id) === e.target.value);
                    if (c) setSelectedCampaign(c as Campaign);
                  }}
                  className="w-full max-w-md rounded-md border px-3 py-2 bg-background"
                >
                  {campaigns.map((c) => (
                    <option key={(c as any)._id || (c as any).id} value={(c as any)._id || (c as any).id}>{c.title}</option>
                  ))}
                </select>
              </div>
            )}
            <p className="text-muted-foreground mb-6">
              Upload your invoice for <span className="font-semibold text-foreground">{selectedCampaign?.title}</span>
            </p>

            <Card className="p-4 mb-6 bg-primary/5 border-primary/10 border border-white/10 shadow-[var(--shadow-sm)] transition-all duration-200">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Upload invoice for services you are rendering</p>
                  <p className="text-muted-foreground">
                    Upload your invoice for the services you are providing to this beneficiary. This helps the beneficiary get funded—you are confirming you are the provider of record for this campaign.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-6 card-elevated">
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
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input type="number" name="invoiceAmount" value={invoiceData.invoiceAmount} onChange={handleInputChange} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-md border px-3 py-2 bg-background">
                    <option value="USD">USD</option>
                    <option value="KES">KES</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-md border px-3 py-2 bg-background">
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
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
            {submitError && <p className="text-destructive text-sm">{submitError}</p>}
            <Card className="p-6 card-elevated">
              <h2 className="text-lg font-bold mb-4">Invoice Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Campaign</span>
                  <span className="font-semibold">{selectedCampaign?.title}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-primary">{currency} {Number(invoiceData.invoiceAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Payment method</span>
                  <span className="font-semibold">{paymentMethod}</span>
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