// src/pages/CampaignCreationWizard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
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
  LayoutDashboard,
  FolderKanban,
  X,
  User,
  Bell,
  Lock,
} from "lucide-react";
import { useRef, useEffect } from "react";
import api from "../services/api";

type Step = "details" | "documents" | "review" | "success" | "info" | "invoice";

const CampaignCreationWizard = () => {
  const navigate = useNavigate();
  const { currentUser, createCampaign } = useApp();
  const { user, role, logout } = useAuth(); 

  const [currentStep, setCurrentStep] = useState<Step>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackToDashboard = () => {
    navigate("/beneficiary"); // or your beneficiary dashboard path
  };

  // Colleague's nav & user display – kept (vital for UX)
  const navItems = [
    { label: "Dashboard", href: "/beneficiary", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Campaigns", href: "/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Funds Received", href: "/beneficiary/funds", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Reporting", href: "/beneficiary/reporting", icon: <FileText className="w-5 h-5" /> },
  ];

  const settingsNavItems = [
    { id: "profile", label: "Profile", href: "/beneficiary/settings/profile", icon: <User className="w-5 h-5" /> },
    { id: "address", label: "Address", href: "/beneficiary/settings/address", icon: <MapPin className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", href: "/beneficiary/settings/notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "change-password", label: "Change Password", href: "/beneficiary/settings/change-password", icon: <Lock className="w-5 h-5" /> },
  ];

  const userName = user?.name || user?.email || "User";
  const userRole = role || "Guest";

  // Form state – your version kept (location + category needed for matching)
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

  // Provider selection state (colleague's addition – kept, supports your matching)
  const [providerSelection, setProviderSelection] = useState<"platform" | "manual">("platform");
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [manualProvider, setManualProvider] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [providers, setProviders] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Supporting documents (colleague's addition – kept, good for proof)
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  const supportingDocsRef = useRef<HTMLInputElement>(null);

  const [newCampaign, setNewCampaign] = useState<any>(null);

  // Fetch providers on mount (colleague's addition – kept, feeds your matching)
  useEffect(() => {
    const fetchProviders = async () => {
      setLoadingProviders(true);
      try {
        const res = await api.get("/providers/public");
        setProviders(res.data.providers || []);
      } catch (err) {
        console.warn("Failed to fetch providers, using empty list", err);
        setProviders([]);
      } finally {
        setLoadingProviders(false);
      }
    };
    fetchProviders();
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Colleague's improved canProceedToInvoice (kept – adds provider + docs check)
    // Colleague's improved canProceedToInvoice (kept – adds provider + docs check, supports your matching)
  const canProceedToInvoice = () => {
    const hasBasicInfo =
      formData.title.trim() &&
      formData.description.trim() &&
      formData.targetAmount &&
      formData.fundraisingDeadline &&
      formData.location.trim();

    const hasProvider =
      providerSelection === "platform"
        ? selectedProviderId !== ""
        : manualProvider.name.trim() && (manualProvider.phone.trim() || manualProvider.email.trim());

    const hasSupportingDocs = supportingDocs.length > 0;

    return hasBasicInfo && hasProvider && hasSupportingDocs;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvoiceData((prev) => ({ ...prev, invoiceFile: file }));
    }
  };

  // Your canProceedToReview (kept – invoice specific)
  const canProceedToReview = () =>
    invoiceData.invoiceFile && invoiceData.invoiceAmount && invoiceData.invoiceDate;

  // Your full handleCreateCampaign
  const handleCreateCampaign = async () => {
    setIsSubmitting(true);

    try {
      // 1. Prepare the payload for the API
      // We combine your form data and the invoice details
      const campaignPayload = {
        title: formData.title,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        category: formData.category,
        location: formData.location,
        fundraisingDeadline: formData.fundraisingDeadline,
        // Send the provider selected from the UI
        providerId: providerSelection === "platform" ? selectedProviderId : null,
        manualProvider: providerSelection === "manual" ? manualProvider : null,
        // Sending invoice metadata
        invoiceDetails: {
          amount: parseFloat(invoiceData.invoiceAmount),
          date: invoiceData.invoiceDate,
        }
      };

      // 2. THE REAL API CALL
      // This sends the data to your backend
      const response = await api.post("/campaigns", campaignPayload);

      // 3. Update local state with the server's response
      const serverCampaign = response.data;
      
      // If you still use the AppContext to update the global list:
      if (createCampaign) {
        createCampaign(serverCampaign);
      }

      setNewCampaign(serverCampaign);
      setCurrentStep("success");
    } catch (error: any) {
      console.error("Failed to create campaign:", error);
      alert(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Colleague's supporting docs handlers (kept – good for proof)
  const handleSupportingDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSupportingDocs((prev) => [...prev, ...files]);
  };

  const removeSupportingDoc = (index: number) => {
    setSupportingDocs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <DashboardLayout
      navItems={navItems}
      userName={userName}
      userRole={userRole}
      settingsNavItems={settingsNavItems}
      onLogout={async () => {
        await logout();
        navigate("/");
      }}
    >
      <div className="space-y-6">
        {/* Colleague's header & progress (kept – better UI) */}
        <div className="max-w-2xl mx-auto mb-8">
          <button
            onClick={() =>
              currentStep === "info"
                ? navigate("/beneficiary")
                : setCurrentStep("info")
            }
            className="flex items-center gap-2 text-sm hover:opacity-80 mb-6 transition text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === "info" ? "Back to Dashboard" : "Start Over"}
          </button>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Create Campaign
            </h1>
            <div className="flex gap-2 sm:gap-4">
              {["info", "invoice", "review", "success"].map((step, idx) => {
                const isActive = ["info", "invoice", "review", "success"].indexOf(currentStep) >= idx;
                return (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition border ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    {idx < 3 && (
                      <div
                        className={`w-4 sm:w-8 h-1 mx-2 transition ${
                          ["info", "invoice", "review", "success"].indexOf(currentStep) > idx
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Info (your version kept + colleague's styling tweaks) */}
          {currentStep === "info" && (
            <Card className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">
                  Campaign Details
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Campaign Title *
                  </label>
                  <Input
                    type="text"
                    name="title"
                    placeholder="e.g., Heart Surgery Fund for Ahmed"
                    value={formData.title}
                    onChange={handleFormChange}
                    className="rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Campaign Description *
                  </label>
                  <textarea
                    name="description"
                    placeholder="Explain the campaign..."
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-lg border"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Target Amount (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="number"
                        name="targetAmount"
                        placeholder="5000"
                        value={formData.targetAmount}
                        onChange={handleFormChange}
                        className="rounded-lg pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fundraising Deadline *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="date"
                        name="fundraisingDeadline"
                        value={formData.fundraisingDeadline}
                        onChange={handleFormChange}
                        className="rounded-lg pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      name="location"
                      placeholder="e.g., Lagos, Nigeria"
                      value={formData.location}
                      onChange={handleFormChange}
                      className="rounded-lg pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-lg border"
                  >
                    <option value="medical">Medical</option>
                    <option value="education">Education</option>
                    <option value="emergency">Emergency Relief</option>
                    <option value="business">Livelihood/Business</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Preferred Provider Section (colleague's addition – kept) */}
                <div className="pt-2">
                  <label className="block text-sm font-medium mb-3">
                    Preferred Provider <span className="text-destructive">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-4">
                    Select a provider from the platform or provide details if they're not yet registered.
                  </p>

                  {/* Provider Selection Method */}
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="providerSelection"
                        checked={providerSelection === "platform"}
                        onChange={() => {
                          setProviderSelection("platform");
                          setManualProvider({ name: "", phone: "", email: "" });
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Select from platform</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="providerSelection"
                        checked={providerSelection === "manual"}
                        onChange={() => {
                          setProviderSelection("manual");
                          setSelectedProviderId("");
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Provider not on platform</span>
                    </label>
                  </div>

                  {/* Platform Provider Dropdown */}
                  {providerSelection === "platform" && (
                    <div>
                      {loadingProviders ? (
                        <div className="text-sm text-muted-foreground">Loading providers...</div>
                      ) : (
                        <select
                          value={selectedProviderId}
                          onChange={(e) => setSelectedProviderId(e.target.value)}
                          className="w-full p-2 rounded-lg border border-border bg-background"
                          required
                        >
                          <option value="">Select a provider</option>
                          {providers.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                              {provider.organizationName} - {provider.organizationType} ({provider.city}, {provider.country})
                            </option>
                          ))}
                        </select>
                      )}
                      {providers.length === 0 && !loadingProviders && (
                        <p className="text-xs text-muted-foreground mt-2">
                          No providers available. Please use manual entry.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Manual Provider Entry */}
                  {providerSelection === "manual" && (
                    <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Provider Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="text"
                          value={manualProvider.name}
                          onChange={(e) =>
                            setManualProvider((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="Hospital, school, or organization name"
                          className="rounded-lg"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Phone Number
                          </label>
                          <Input
                            type="tel"
                            value={manualProvider.phone}
                            onChange={(e) =>
                              setManualProvider((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            placeholder="+1234567890"
                            className="rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email Address
                          </label>
                          <Input
                            type="email"
                            value={manualProvider.email}
                            onChange={(e) =>
                              setManualProvider((prev) => ({ ...prev, email: e.target.value }))
                            }
                            placeholder="provider@example.com"
                            className="rounded-lg"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        At least one contact method (phone or email) is required. The platform admin will contact this provider to verify and onboard them.
                      </p>
                    </div>
                  )}
                </div>

                {/* Supporting Documents Section (colleague's addition – kept) */}
                <div className="pt-2">
                  <label className="block text-sm font-medium mb-3">
                    Upload Supporting Documents <span className="text-destructive">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Upload invoices, doctor letters, or other supporting documents (PDF, PNG, JPG). At least one document is required.
                  </p>
                  <input
                    ref={supportingDocsRef}
                    type="file"
                    accept=".pdf,image/*"
                    multiple
                    onChange={handleSupportingDocsChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => supportingDocsRef.current?.click()}
                    className="mb-3"
                  >
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                  {supportingDocs.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {supportingDocs.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSupportingDoc(index)}
                            className="text-destructive hover:text-destructive/80 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {supportingDocs.length === 0 && (
                    <p className="text-xs text-destructive mt-2">
                      Please upload at least one supporting document.
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => setCurrentStep("invoice")}
                    disabled={!canProceedToInvoice()}
                    className="w-full rounded-full"
                  >
                    Next: Upload Invoice
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Invoice (your version kept + colleague's styling tweaks) */}
          {currentStep === "invoice" && (
            <Card className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">
                  Invoice Details
                </h2>
              </div>

              <div className="space-y-5">
                <div className="p-4 rounded-lg border border-primary bg-primary/10">
                  <p className="text-sm text-primary">
                    Upload the invoice or receipt that validates this campaign.
                    This ensures transparency and dual confirmation from beneficiary.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Invoice/Receipt File *
                  </label>
                  <div className="border-2 border-dashed border-primary rounded-lg p-6 text-center hover:opacity-80 transition bg-muted/50">
                    <UploadCloud className="w-10 h-10 mx-auto mb-3 text-primary" />
                    <label className="cursor-pointer">
                      <p className="font-semibold">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, PNG, JPG (Max 5MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {invoiceData.invoiceFile && (
                      <p className="text-sm mt-3 font-medium text-primary">
                        ✓ {invoiceData.invoiceFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Invoice Amount (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="5000"
                        value={invoiceData.invoiceAmount}
                        onChange={(e) =>
                          setInvoiceData((prev) => ({
                            ...prev,
                            invoiceAmount: e.target.value,
                          }))
                        }
                        className="rounded-lg pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Invoice Date *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="date"
                        value={invoiceData.invoiceDate}
                        onChange={(e) =>
                          setInvoiceData((prev) => ({
                            ...prev,
                            invoiceDate: e.target.value,
                          }))
                        }
                        className="rounded-lg pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setCurrentStep("info")}
                    variant="outline"
                    className="flex-1 rounded-full"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("review")}
                    disabled={!canProceedToReview()}
                    className="flex-1 rounded-full"
                  >
                    Review
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Review (colleague's improved summary – kept) */}
          {currentStep === "review" && (
            <Card className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">
                  Review Campaign
                </h2>
              </div>

              <div className="space-y-5">
                <div className="p-4 rounded-lg border border-primary bg-primary/10">
                  <p className="text-sm text-primary">
                    Please review your campaign details. Once submitted, the
                    beneficiary must confirm the campaign details for funds to be
                    unlocked after donations are received.
                  </p>
                </div>

                {/* Campaign Summary (colleague's version – kept) */}
                <div className="space-y-4">
                  <div className="border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">
                      Title
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      {formData.title}
                    </p>
                  </div>

                  <div className="border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">
                      Description
                    </p>
                    <p className="text-sm">
                      {formData.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Target Amount
                      </p>
                      <p className="font-semibold text-primary">
                        ${formData.targetAmount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Deadline
                      </p>
                      <p className="font-semibold text-primary">
                        {formData.fundraisingDeadline}
                      </p>
                    </div>
                  </div>

                  <div className="border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">
                      Location
                    </p>
                    <p className="font-semibold text-primary">
                      {formData.location}
                    </p>
                  </div>

                  <div className="border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">
                      Preferred Provider
                    </p>
                    <p className="font-semibold text-primary">
                      {providerSelection === "platform"
                        ? providers.find((p) => p.id === selectedProviderId)?.organizationName ||
                          "Not selected"
                        : manualProvider.name || "Not provided"}
                    </p>
                    {providerSelection === "manual" && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {manualProvider.phone && <div>Phone: {manualProvider.phone}</div>}
                        {manualProvider.email && <div>Email: {manualProvider.email}</div>}
                      </div>
                    )}
                  </div>

                  <div className="border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Supporting Documents
                    </p>
                    {supportingDocs.length > 0 ? (
                      <div className="space-y-1">
                        {supportingDocs.map((file, index) => (
                          <p key={index} className="text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            {file.name}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-destructive">No documents uploaded</p>
                    )}
                  </div>

                  <div className="border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">
                      Invoice File
                    </p>
                    <p className="font-semibold text-primary">
                      ✓ {invoiceData.invoiceFile?.name || "Not uploaded"}
                    </p>
                  </div>

                  <div className="border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">
                      Invoice Amount
                    </p>
                    <p className="font-semibold text-primary">
                      ${invoiceData.invoiceAmount || "0"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setCurrentStep("invoice")}
                    variant="outline"
                    className="flex-1 rounded-full"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateCampaign}
                    disabled={isSubmitting}
                    className="flex-1 rounded-full"
                  >
                    {isSubmitting ? "Creating..." : "Create Campaign"}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: Success (your version kept – provider match message, campaign ID, buttons) */}
          {currentStep === "success" && (
            <Card className="p-6 sm:p-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Campaign Created Successfully!
              </h2>
              <p className="mb-6 max-w-md mx-auto text-muted-foreground">
                {newCampaign?.provider
                  ? "A matching provider has been found and assigned."
                  : "No provider matched yet — admin will review."}
              </p>

              <div className="p-4 rounded-lg mb-6 text-left border border-border bg-muted">
                <p className="text-sm text-muted-foreground">
                  Campaign ID
                </p>
                <p className="font-mono text-sm break-all text-primary">
                  {newCampaign?.id}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleBackToDashboard}
                  className="w-full rounded-full"
                >
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
                      category: "medical" as const,
                    });
                    setInvoiceData({
                      invoiceFile: null,
                      invoiceAmount: "",
                      invoiceDate: "",
                    });
                    setNewCampaign(null);
                  }}
                  className="w-full rounded-full"
                >
                  Create Another Campaign
                </Button>
              </div>
            </Card>
          )}
        </div>
        </div>
      </DashboardLayout>
  );
};

export default CampaignCreationWizard;