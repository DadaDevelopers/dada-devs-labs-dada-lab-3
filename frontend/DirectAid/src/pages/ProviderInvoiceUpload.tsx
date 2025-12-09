import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { mockDataService } from "../services/mockData";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  MapPin,
  DollarSign,
  Calendar,
} from "lucide-react";

type Step = "select-campaign" | "upload-invoice" | "review" | "success";

const ProviderInvoiceUpload = () => {
  const navigate = useNavigate();
  const { campaigns, updateCampaign } = useApp();
  const provider = mockDataService.getProviderUser();

  const [currentStep, setCurrentStep] = useState<Step>("select-campaign");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get campaigns assigned to this provider
  const providerCampaigns = campaigns.filter(
    (c) => c.providerId === provider.id
  );

  // Invoice form state
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    invoiceAmount: "",
    description: "",
    invoiceFile: null as File | null,
  });

  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleCampaignSelect = (campaign: any) => {
    setSelectedCampaign(campaign);
    setCurrentStep("upload-invoice");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvoiceData((prev) => ({ ...prev, invoiceFile: file }));

      // Create preview URL for PDFs or images
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveFile = () => {
    setInvoiceData((prev) => ({ ...prev, invoiceFile: null }));
    setPreviewUrl("");
  };

  const canProceedToReview = () => {
    return (
      invoiceData.invoiceNumber &&
      invoiceData.invoiceDate &&
      invoiceData.invoiceAmount &&
      invoiceData.description &&
      invoiceData.invoiceFile
    );
  };

  const handleSubmitInvoice = async () => {
    setIsSubmitting(true);

    // Simulate upload processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update campaign with invoice
    const invoiceId = `invoice_${Date.now()}`;
    const updatedCampaign = {
      ...selectedCampaign,
      invoices: [
        ...(selectedCampaign.invoices || []),
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

    updateCampaign(selectedCampaign.id, updatedCampaign);
    setCurrentStep("success");
    setIsSubmitting(false);
  };

  const handleBackToDashboard = () => {
    navigate("/provider");
  };

  // Step 1: Select Campaign
  if (currentStep === "select-campaign") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button
              onClick={() => navigate("/provider")}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Upload Invoice</h1>
            <p className="text-gray-600 mt-2">
              Submit invoices for services rendered under your campaigns
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {providerCampaigns.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">
                No campaigns assigned to you yet.
              </p>
              <Button onClick={() => navigate("/provider")} variant="outline">
                Return to Dashboard
              </Button>
            </Card>
          ) : (
            <div>
              <p className="text-gray-600 mb-6">
                Select a campaign to upload an invoice for:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providerCampaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    className="p-6 hover:shadow-lg transition cursor-pointer border-2 hover:border-indigo-500"
                    onClick={() => handleCampaignSelect(campaign)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {campaign.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {campaign.description.substring(0, 100)}...
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 capitalize">
                        {campaign.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{campaign.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>${campaign.targetAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(
                            campaign.fundraisingDeadline
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCampaignSelect(campaign);
                      }}
                    >
                      Upload Invoice
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Upload Invoice
  if (currentStep === "upload-invoice") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button
              onClick={() => setCurrentStep("select-campaign")}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Select Different Campaign
            </button>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Upload Invoice
              </h1>
              <p className="text-gray-600 mt-2">
                Campaign:{" "}
                <span className="font-semibold">{selectedCampaign?.title}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Invoice Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <Input
                  type="text"
                  name="invoiceNumber"
                  placeholder="INV-2024-001"
                  value={invoiceData.invoiceNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Amount (USD)
                </label>
                <Input
                  type="number"
                  name="invoiceAmount"
                  placeholder="0.00"
                  step="0.01"
                  value={invoiceData.invoiceAmount}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description of Services
              </label>
              <textarea
                name="description"
                placeholder="Describe the services rendered..."
                value={invoiceData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
              />
            </div>
          </Card>

          {/* File Upload */}
          <Card className="p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Upload Invoice File
            </h2>

            {!invoiceData.invoiceFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop your invoice here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supported formats: PDF, PNG, JPG (Max 10MB)
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Browse Files
                  </span>
                </label>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {invoiceData.invoiceFile.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {(invoiceData.invoiceFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => setCurrentStep("select-campaign")}
              variant="outline"
              className="flex-1"
            >
              Change Campaign
            </Button>
            <Button
              onClick={() => setCurrentStep("review")}
              disabled={!canProceedToReview()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              Review & Submit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Review
  if (currentStep === "review") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Review Invoice</h1>
            <p className="text-gray-600 mt-2">
              Please review the invoice details before submitting
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Campaign Summary */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Campaign</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">
                {selectedCampaign?.title}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {selectedCampaign?.description}
              </p>
            </div>
          </Card>

          {/* Invoice Summary */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Invoice Details
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700">Invoice Number:</span>
                <span className="font-semibold text-gray-900">
                  {invoiceData.invoiceNumber}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700">Invoice Date:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(invoiceData.invoiceDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700">Amount:</span>
                <span className="font-semibold text-indigo-600 text-lg">
                  $
                  {parseFloat(invoiceData.invoiceAmount).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>

              <div className="py-2 border-b border-gray-200">
                <span className="text-gray-700 block mb-2">Description:</span>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">
                  {invoiceData.description}
                </p>
              </div>

              <div className="py-2">
                <span className="text-gray-700 block mb-2">File:</span>
                <div className="flex items-center gap-2 text-gray-900">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span>{invoiceData.invoiceFile?.name}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Confirmation */}
          <Card className="p-6 mb-6 bg-blue-50 border border-blue-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">
                  Before you submit:
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                  <li>
                    Invoice must be for services rendered under this campaign
                  </li>
                  <li>Amount must match the actual services provided</li>
                  <li>All required documents must be attached</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => setCurrentStep("upload-invoice")}
              variant="outline"
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              onClick={handleSubmitInvoice}
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Invoice"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Success
  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invoice Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Your invoice has been successfully submitted and is awaiting review.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">What's next?</span>
              <br />
              The beneficiary will review and confirm receipt of services. Once
              confirmed, your invoice amount will be marked for payout.
            </p>
          </div>

          <Button
            onClick={handleBackToDashboard}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return null;
};

export default ProviderInvoiceUpload;
