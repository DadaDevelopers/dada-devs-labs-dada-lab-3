import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { mockDataService } from "../../services/mockData";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  Settings,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Trash2,
} from "lucide-react";

type Step = "select-campaign" | "upload-report" | "review" | "success";

const BeneficiaryReporting = () => {
  const navigate = useNavigate();
  const { campaigns } = useApp();
  const beneficiary = mockDataService.getBeneficiaryUser();
  
  const [currentStep, setCurrentStep] = useState<Step>("select-campaign");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [reportDescription, setReportDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get campaigns for this beneficiary
  const userCampaigns = campaigns.filter(
    (c) => c.beneficiaryId === beneficiary.id && c.status === "active"
  );

  const navItems = [
    {
      label: "Dashboard",
      href: "/beneficiary",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Funds Received",
      href: "/beneficiary/funds",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: "Reporting",
      href: "/beneficiary/reporting",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: "Settings",
      href: "/beneficiary/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReportFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setReportFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadReport = async () => {
    setIsUploading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep("success");
    } catch (err: any) {
      setError("Failed to upload report. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/beneficiary");
  };

  return (
    <DashboardLayout
      navItems={navItems}
      userName={beneficiary.name}
      userRole="Aid Beneficiary"
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
            <h1 className="text-3xl font-bold">Progress Reporting</h1>
            <p className="text-muted-foreground mt-1">
              Upload progress reports for your active campaigns
            </p>
          </div>
        </div>

        {/* Step: Select Campaign */}
        {currentStep === "select-campaign" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Select Campaign</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userCampaigns.length > 0 ? (
                userCampaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    className="p-6 card-elevated cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setCurrentStep("upload-report");
                    }}
                  >
                    <h3 className="font-semibold text-lg mb-2">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {campaign.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount Raised</span>
                        <span className="font-bold">
                          ${(campaign.amountRaised / 100).toFixed(0)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary/50 rounded-full h-2">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min(
                              (campaign.amountRaised / campaign.targetAmount) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {campaign.donorCount} donors
                      </p>
                    </div>

                    <Button className="w-full mt-4 btn-cta rounded-lg">
                      Upload Report
                    </Button>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="p-8 card-elevated text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Active Campaigns</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any active campaigns that require reporting.
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

        {/* Step: Upload Report */}
        {currentStep === "upload-report" && selectedCampaign && (
          <Card className="p-6 sm:p-8 card-elevated">
            <h2 className="text-2xl font-bold mb-6">Upload Progress Report</h2>
            
            <div className="space-y-6">
              {/* Campaign Info */}
              <div className="p-4 rounded-lg bg-secondary/30">
                <h3 className="font-semibold mb-2">{selectedCampaign.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Campaign ID: {selectedCampaign.id}
                </p>
              </div>

              {/* Report Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Report Description
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe the progress made, challenges faced, and next steps..."
                  className="w-full p-3 border border-border rounded-lg bg-background min-h-[120px]"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Supporting Documents
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload photos, receipts, or other supporting documents
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="report-upload"
                  />
                  <label
                    htmlFor="report-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Files
                  </label>
                </div>

                {/* Uploaded Files */}
                {reportFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {reportFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-100 border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("select-campaign")}
                  disabled={isUploading}
                  className="flex-1 rounded-lg"
                >
                  Back
                </Button>
                <Button
                  className="flex-1 btn-cta rounded-lg"
                  onClick={handleUploadReport}
                  disabled={isUploading || !reportDescription.trim()}
                >
                  {isUploading ? "Uploading..." : "Submit Report"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step: Success */}
        {currentStep === "success" && selectedCampaign && (
          <Card className="p-8 card-elevated text-center max-w-md mx-auto">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Report Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Your progress report for{" "}
              <span className="font-semibold">{selectedCampaign.title}</span> has been
              submitted successfully.
            </p>

            <div className="space-y-2 text-sm mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium">Status:</span> Under Review
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Submitted:</span>{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep("select-campaign");
                  setSelectedCampaign(null);
                  setReportFiles([]);
                  setReportDescription("");
                  setError(null);
                }}
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

export default BeneficiaryReporting;