import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mockDataService } from "../services/mockData";
import api from "../services/api";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

type Step = "select-campaign" | "upload-proof" | "review" | "success";

const ProviderProofUpload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");

  const provider = mockDataService.getProviderUser();
  const campaigns = mockDataService.getCampaigns();

  // Get the campaign if passed via URL
  const selectedCampaignId = campaignId || null;
  const selectedCampaign = selectedCampaignId
    ? campaigns.find((c) => c.id === selectedCampaignId)
    : null;

  const [currentStep, setCurrentStep] = useState<Step>(
    selectedCampaignId ? "upload-proof" : "select-campaign"
  );
  const [chosenCampaign, setChosenCampaign] = useState<any>(
    selectedCampaign || null
  );
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [description, setDescription] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get campaigns with withdrawals initiated (eligible for proof upload)
  const eligibleCampaigns = campaigns.filter(
    (c) =>
      c.providerId === provider.id && c.confirmationStatus === "both_confirmed"
  );

  const navItems = [
    {
      label: "Dashboard",
      href: "/provider",
      icon: null,
    },
    {
      label: "Invoices",
      href: "/provider/invoices",
      icon: null,
    },
    {
      label: "Proof Upload",
      href: "/provider/proof-upload",
      icon: null,
    },
  ];

  const handleCampaignSelect = (campaign: any) => {
    setChosenCampaign(campaign);
    setProofFiles([]);
    setDescription("");
    setError(null);
    setCurrentStep("upload-proof");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).filter((file) => {
        // Only allow PDFs and images
        return (
          file.type.startsWith("image/") || file.type === "application/pdf"
        );
      });
      setProofFiles((prev) => [...prev, ...newFiles]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadProof = async () => {
    setError(null);

    // Validation
    if (!chosenCampaign) {
      setError("Please select a campaign");
      return;
    }

    if (proofFiles.length === 0) {
      setError("Please upload at least one proof file");
      return;
    }

    if (!description.trim()) {
      setError("Please provide a description of the proof");
      return;
    }

    setIsUploading(true);
    try {
      // Simulate file upload
      const fileList = proofFiles.map((f) => ({
        name: f.name,
        url: `https://example.com/proofs/${f.name}`,
      }));

      await api.post("/uploads/campaign-documents", {
        campaignId: chosenCampaign.id,
        documentType: "proof",
        description: description,
        files: fileList,
      });

      setCurrentStep("success");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to upload proof");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/provider");
  };

  const handleSelectAnotherCampaign = () => {
    setChosenCampaign(null);
    setProofFiles([]);
    setDescription("");
    setError(null);
    setCurrentStep("select-campaign");
  };

  return (
    <DashboardLayout
      navItems={navItems}
      userName={provider.name}
      userRole="Aid Provider"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToDashboard}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Upload Proof of Service</h1>
            <p className="text-muted-foreground mt-1">
              Submit evidence of successful service delivery
            </p>
          </div>
        </div>

        {/* Step: Select Campaign */}
        {currentStep === "select-campaign" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligibleCampaigns.length > 0 ? (
                eligibleCampaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    className="p-4 sm:p-6 card-elevated cursor-pointer hover:border-primary transition"
                    onClick={() => handleCampaignSelect(campaign)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">
                          {campaign.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Beneficiary:{" "}
                          <span className="font-semibold">
                            {campaign.beneficiary?.name}
                          </span>
                        </p>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-semibold">
                          Withdrawal Initiated
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Amount Raised</p>
                        <p className="font-bold text-lg">
                          ${(campaign.amountRaised / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-4 btn-cta rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCampaignSelect(campaign);
                      }}
                    >
                      Upload Proof
                    </Button>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="p-8 card-elevated text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">
                      No Eligible Campaigns
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any campaigns with initiated withdrawals
                      ready for proof submission.
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleBackToDashboard}
                      className="rounded-lg"
                    >
                      Back to Dashboard
                    </Button>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step: Upload Proof */}
        {currentStep === "upload-proof" && chosenCampaign && (
          <Card className="p-6 sm:p-8 card-elevated">
            <h2 className="text-2xl font-bold mb-6">Upload Proof of Service</h2>

            <div className="space-y-6">
              {/* Campaign Summary */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground mb-2">Campaign</p>
                <h3 className="font-bold text-lg">{chosenCampaign.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Beneficiary: {chosenCampaign.beneficiary?.name}
                </p>
              </div>

              {/* File Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Proof Files (Images/PDFs)
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-secondary/50 transition cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="proof-files"
                  />
                  <label htmlFor="proof-files" className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF or images (multiple files allowed, max 10MB each)
                    </p>
                  </label>
                </div>

                {/* File List */}
                {proofFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">
                      Selected Files ({proofFiles.length}):
                    </p>
                    {proofFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-secondary rounded transition flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setError(null);
                  }}
                  placeholder="Describe the proof of service. Include details about what was delivered, when, and to whom..."
                  rows={4}
                  className="w-full p-3 rounded-lg bg-card border border-border text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Minimum 20 characters required
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-lg bg-red-100/10 border border-red-200/50">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-blue-100/10 border border-blue-200/50">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Note:</span> This proof will be
                  reviewed by the beneficiary to confirm service delivery
                  completion.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleSelectAnotherCampaign}
                  disabled={isUploading}
                  className="flex-1 rounded-lg"
                >
                  Select Different Campaign
                </Button>
                <Button
                  className="flex-1 btn-cta rounded-lg"
                  onClick={handleUploadProof}
                  disabled={isUploading || proofFiles.length === 0}
                >
                  {isUploading ? "Uploading..." : "Submit Proof"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step: Success */}
        {currentStep === "success" && chosenCampaign && (
          <Card className="p-8 card-elevated text-center max-w-md mx-auto">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Proof Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Your proof of service has been submitted successfully. The
              beneficiary will review and confirm delivery.
            </p>

            <div className="space-y-2 text-sm mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium">Campaign:</span>{" "}
                {chosenCampaign.title}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Files Submitted:</span>{" "}
                {proofFiles.length}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSelectAnotherCampaign}
                className="flex-1 rounded-lg"
              >
                Submit Another
              </Button>
              <Button
                className="flex-1 btn-cta rounded-lg"
                onClick={handleBackToDashboard}
              >
                Back to Dashboard
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProviderProofUpload;
