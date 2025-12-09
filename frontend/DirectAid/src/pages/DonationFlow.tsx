import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { mockDataService } from "../services/mockData";
import type { Campaign } from "../types";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Zap,
  DollarSign,
  Lock,
  AlertCircle,
  FileText,
  Download,
} from "lucide-react";

type Step = "campaign" | "amount" | "payment" | "confirmation" | "receipt";

const DonationFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, donations } = useApp();
  const [currentStep, setCurrentStep] = useState<Step>("campaign");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get campaign from URL or use first available
  const campaignId = searchParams.get("campaignId") || "";
  const allCampaigns = mockDataService.getCampaigns();
  const selectedCampaign = campaignId
    ? allCampaigns.find((c: Campaign) => c.id === campaignId) || allCampaigns[0]
    : allCampaigns[0];

  // Donation form state
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "lightning",
    donorName: currentUser?.name || "",
    donorEmail: currentUser?.email || "",
    anonymous: false,
    newsletter: true,
  });

  const [donation, setDonation] = useState<any>(null);

  // Calculate amounts
  const donationAmountUSD = parseFloat(formData.amount) || 0;
  const donationAmountSats = donationAmountUSD * 250000; // Approximate BTC rate
  const platformFee = donationAmountUSD * 0.01; // 1% fee
  const totalAmount = donationAmountUSD + platformFee;

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const canProceedToPayment = () => {
    return (
      formData.amount &&
      parseFloat(formData.amount) > 0 &&
      formData.paymentMethod
    );
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Create donation record
    const newDonation = {
      id: `don_${Date.now()}`,
      campaignId: selectedCampaign.id,
      donorId: currentUser?.id || `donor_${Date.now()}`,
      amountUSD: donationAmountUSD,
      amountSats: donationAmountSats,
      paymentMethod: formData.paymentMethod,
      status: "locked" as const,
      transactionHash: `0x${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().toISOString(),
      donorName: formData.anonymous ? "Anonymous Donor" : formData.donorName,
      donorEmail: formData.donorEmail,
      receiptUrl: `https://directaid.example.com/receipts/rec_${Date.now()}`,
    };

    setDonation(newDonation);
    setCurrentStep("receipt");
    setIsProcessing(false);
  };

  if (!selectedCampaign) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-primary-bg)" }}
      >
        <Card
          className="p-8 text-center max-w-md"
          style={{
            backgroundColor: "var(--color-secondary-bg)",
            borderColor: "var(--color-accent)",
          }}
        >
          <AlertCircle
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: "rgba(255, 0, 0, 0.8)" }}
          />
          <p className="mb-4" style={{ color: "var(--color-text-light)" }}>
            Campaign not found.
          </p>
          <Button
            onClick={() => navigate("/campaigns")}
            className="w-full rounded-full"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-primary-bg)",
            }}
          >
            Browse Campaigns
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: "var(--color-primary-bg)" }}
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <button
          onClick={() =>
            currentStep === "campaign"
              ? navigate("/campaigns")
              : setCurrentStep("campaign")
          }
          className="flex items-center gap-2 text-sm hover:opacity-80 mb-6 transition"
          style={{ color: "var(--color-accent)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === "campaign" ? "Browse Campaigns" : "Start Over"}
        </button>

        {/* Progress Indicator */}
        <div className="mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: "var(--color-text-light)" }}
          >
            Make a Donation
          </h1>
          <div className="flex gap-2 sm:gap-4">
            {["campaign", "amount", "payment", "confirmation", "receipt"].map(
              (step, idx) => (
                <div key={step} className="flex items-center">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition border"
                    style={{
                      backgroundColor:
                        [
                          "campaign",
                          "amount",
                          "payment",
                          "confirmation",
                          "receipt",
                        ].indexOf(currentStep) >= idx
                          ? "var(--color-accent)"
                          : "var(--color-secondary-bg)",
                      color:
                        [
                          "campaign",
                          "amount",
                          "payment",
                          "confirmation",
                          "receipt",
                        ].indexOf(currentStep) >= idx
                          ? "var(--color-primary-bg)"
                          : "var(--color-text-light)",
                      borderColor: "var(--color-accent)",
                    }}
                    
                  >
                    {idx + 1}
                  </div>
                  {idx < 4 && (
                    <div
                      className="w-4 sm:w-8 h-1 mx-2 transition"
                      style={{
                        backgroundColor:
                          [
                            "campaign",
                            "amount",
                            "payment",
                            "confirmation",
                            "receipt",
                          ].indexOf(currentStep) > idx
                            ? "var(--color-accent)"
                            : "var(--color-secondary-bg)",
                      }}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto">
        {/* Step 1: Campaign Review */}
        {currentStep === "campaign" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaign Details */}
            <div className="lg:col-span-2">
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
                    {selectedCampaign.title}
                  </h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p
                      className="text-sm mb-2"
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    >
                      Campaign Goal
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      ${(selectedCampaign.targetAmount / 250000).toFixed(0)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span
                        style={{
                          color: "var(--color-text-light)",
                          opacity: 0.7,
                        }}
                      >
                        Funds Raised
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--color-accent)" }}
                      >
                        ${(selectedCampaign.amountRaised / 100).toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          backgroundColor: "var(--color-accent)",
                          width: `${Math.min(
                            (selectedCampaign.amountRaised /
                              (selectedCampaign.targetAmount / 250000)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <p
                      className="text-sm mb-2"
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    >
                      Description
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      {selectedCampaign.description}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setCurrentStep("amount")}
                  className="w-full rounded-full"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-primary-bg)",
                  }}
                >
                  Continue to Donation
                </Button>
              </Card>
            </div>

            {/* Campaign Summary */}
            <div>
              <Card
                className="p-4 sm:p-6 card-elevated sticky top-4"
                style={{
                  backgroundColor: "var(--color-secondary-bg)",
                  borderColor: "var(--color-accent)",
                }}
              >
                <h3
                  className="font-bold mb-4"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Campaign Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    >
                      Status
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    >
                      Location
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      {selectedCampaign.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    >
                      Category
                    </span>
                    <span
                      className="font-semibold capitalize"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      {selectedCampaign.category}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Donation Amount */}
        {currentStep === "amount" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card
                className="p-6 sm:p-8 card-elevated"
                style={{
                  backgroundColor: "var(--color-secondary-bg)",
                  borderColor: "var(--color-accent)",
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign
                    className="w-6 h-6"
                    style={{ color: "var(--color-accent)" }}
                  />
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    Donation Amount
                  </h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label
                      className="block text-sm font-medium mb-3"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      How much would you like to donate?
                    </label>
                    <div className="relative">
                      <DollarSign
                        className="absolute left-3 top-3 w-5 h-5"
                        style={{ color: "var(--color-accent)", opacity: 0.7 }}
                      />
                      <Input
                        type="number"
                        name="amount"
                        placeholder="100"
                        value={formData.amount}
                        onChange={handleFormChange}
                        className="rounded-lg pl-10 text-lg"
                        style={{
                          backgroundColor: "var(--color-primary-bg)",
                          color: "var(--color-text-light)",
                          borderColor: "var(--color-accent)",
                        }}
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <p
                      className="text-xs mt-2"
                      style={{ color: "var(--color-text-light)", opacity: 0.6 }}
                    >
                      ≈ {donationAmountSats.toLocaleString()} satoshis
                    </p>
                  </div>

                  {/* Suggested amounts */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-3"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      Or choose a quick amount
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 25, 50, 100].map((amount) => (
                        <button
                          key={amount}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              amount: amount.toString(),
                            }))
                          }
                          className="p-2 rounded-lg text-sm font-semibold transition"
                          style={{
                            backgroundColor:
                              formData.amount === amount.toString()
                                ? "var(--color-accent)"
                                : "var(--color-primary-bg)",
                            color:
                              formData.amount === amount.toString()
                                ? "var(--color-primary-bg)"
                                : "var(--color-accent)",
                            borderColor: "var(--color-accent)",
                          }}
                          
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button
                      onClick={() => setCurrentStep("campaign")}
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
                      onClick={() => setCurrentStep("payment")}
                      disabled={!canProceedToPayment()}
                      className="flex-1 rounded-full"
                      style={{
                        backgroundColor: "var(--color-accent)",
                        color: "var(--color-primary-bg)",
                      }}
                    >
                      Select Payment Method
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Summary */}
            <div>
              <Card
                className="p-4 sm:p-6 card-elevated sticky top-4"
                style={{
                  backgroundColor: "var(--color-secondary-bg)",
                  borderColor: "var(--color-accent)",
                }}
              >
                <h3
                  className="font-bold mb-4"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Summary
                </h3>
                <div
                  className="space-y-3 text-sm border-b pb-4 mb-4"
                  style={{ borderColor: "var(--color-accent)", opacity: 0.3 }}
                >
                  <div className="flex justify-between">
                    <span
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    >
                      Campaign
                    </span>
                    <span
                      className="font-semibold text-right max-w-[150px] line-clamp-2"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {selectedCampaign.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    >
                      Amount
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      ${donationAmountUSD.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                  >
                    Your donation is purpose-locked and will only be released
                    after both provider and beneficiary confirm.
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Payment Method */}
        {currentStep === "payment" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card
                className="p-6 sm:p-8 card-elevated"
                style={{
                  backgroundColor: "var(--color-secondary-bg)",
                  borderColor: "var(--color-accent)",
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Zap
                    className="w-6 h-6"
                    style={{ color: "var(--color-accent)" }}
                  />
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-5">
                  {/* Payment Method Selection */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-3"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      Select payment method
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          id: "lightning",
                          name: "Lightning Network",
                          desc: "Instant, nearly free payments",
                        },
                        {
                          id: "onchain",
                          name: "On-Chain Bitcoin",
                          desc: "Slower but fully decentralized",
                        },
                        {
                          id: "stripe",
                          name: "Credit/Debit Card",
                          desc: "Fast conversion to Bitcoin",
                        },
                      ].map((method) => (
                        <label
                          key={method.id}
                          className="p-4 rounded-lg border-2 cursor-pointer transition"
                          style={{
                            backgroundColor: "var(--color-primary-bg)",
                            borderColor:
                              formData.paymentMethod === method.id
                                ? "var(--color-accent)"
                                : "rgba(0, 255, 255, 0.2)",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.id}
                              checked={formData.paymentMethod === method.id}
                              onChange={handleFormChange}
                              className="w-4 h-4"
                              style={{ accentColor: "var(--color-accent)" }}
                            />
                            <div>
                              <p
                                className="font-semibold"
                                style={{ color: "var(--color-text-light)" }}
                              >
                                {method.name}
                              </p>
                              <p
                                className="text-xs"
                                style={{
                                  color: "var(--color-text-light)",
                                  opacity: 0.6,
                                }}
                              >
                                {method.desc}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div
                    style={{
                      borderTopColor: "var(--color-accent)",
                      opacity: 0.3,
                    }}
                    className="border-t pt-5"
                  >
                    <h3
                      className="font-semibold mb-3"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      Donor Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--color-text-light)" }}
                        >
                          Full Name
                        </label>
                        <Input
                          type="text"
                          name="donorName"
                          value={formData.donorName}
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
                          Email
                        </label>
                        <Input
                          type="email"
                          name="donorEmail"
                          value={formData.donorEmail}
                          onChange={handleFormChange}
                          className="rounded-lg"
                          style={{
                            backgroundColor: "var(--color-primary-bg)",
                            color: "var(--color-text-light)",
                            borderColor: "var(--color-accent)",
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="anonymous"
                            checked={formData.anonymous}
                            onChange={handleFormChange}
                            className="w-4 h-4"
                            style={{ accentColor: "var(--color-accent)" }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: "var(--color-text-light)" }}
                          >
                            Make donation anonymous
                          </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="newsletter"
                            checked={formData.newsletter}
                            onChange={handleFormChange}
                            className="w-4 h-4"
                            style={{ accentColor: "var(--color-accent)" }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: "var(--color-text-light)" }}
                          >
                            Subscribe to impact updates
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => setCurrentStep("amount")}
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
                      onClick={() => setCurrentStep("confirmation")}
                      className="flex-1 rounded-full"
                      style={{
                        backgroundColor: "var(--color-accent)",
                        color: "var(--color-primary-bg)",
                      }}
                    >
                      Review & Confirm
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Summary */}
            <div>
              <Card
                className="p-4 sm:p-6 card-elevated sticky top-4"
                style={{
                  backgroundColor: "var(--color-secondary-bg)",
                  borderColor: "var(--color-accent)",
                }}
              >
                <h3
                  className="font-bold mb-4"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Order Summary
                </h3>
                <div
                  className="space-y-3 text-sm border-b pb-4 mb-4"
                  style={{ borderColor: "var(--color-accent)", opacity: 0.3 }}
                >
                  <div className="flex justify-between">
                    <span
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    >
                      Donation
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      ${donationAmountUSD.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                    >
                      Platform Fee (1%)
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      ${platformFee.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div
                  className="flex justify-between font-bold"
                  style={{ color: "var(--color-text-light)" }}
                >
                  <span>Total</span>
                  <span style={{ color: "var(--color-accent)" }}>
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === "confirmation" && (
          <Card
            className="p-6 sm:p-8 card-elevated"
            style={{
              backgroundColor: "var(--color-secondary-bg)",
              borderColor: "var(--color-accent)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock
                className="w-6 h-6"
                style={{ color: "var(--color-accent)" }}
              />
              <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-light)" }}
              >
                Confirm Donation
              </h2>
            </div>

            <div className="space-y-6">
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: "rgba(0, 255, 255, 0.1)",
                  borderColor: "var(--color-accent)",
                }}
                
              >
                <p className="text-sm" style={{ color: "var(--color-accent)" }}>
                  <strong>Purpose-Locked Funds:</strong> Your donation will be
                  locked and only released after both the healthcare provider
                  and beneficiary confirm the campaign details. This ensures
                  maximum transparency and fund security.
                </p>
              </div>

              {/* Donation Details */}
              <div
                className="space-y-3 border-b pb-6"
                style={{ borderColor: "var(--color-accent)", opacity: 0.3 }}
              >
                <h3
                  className="font-semibold"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Donation Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                      className="mb-1"
                    >
                      Campaign
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {selectedCampaign.title}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                      className="mb-1"
                    >
                      Amount
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      ${donationAmountUSD.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                      className="mb-1"
                    >
                      Payment Method
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      {formData.paymentMethod === "lightning"
                        ? "Lightning Network"
                        : "On-Chain"}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{ color: "var(--color-text-light)", opacity: 0.7 }}
                      className="mb-1"
                    >
                      Donor
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      {formData.anonymous ? "Anonymous" : formData.donorName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep("payment")}
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
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="flex-1 rounded-full"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-primary-bg)",
                  }}
                >
                  {isProcessing ? "Processing..." : "Complete Donation"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 5: Receipt */}
        {currentStep === "receipt" && donation && (
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
              Donation Successful!
            </h2>
            <p
              style={{ color: "var(--color-text-light)", opacity: 0.7 }}
              className="mb-6 max-w-md mx-auto"
            >
              Your donation has been received and is now purpose-locked awaiting
              confirmation from the healthcare provider and beneficiary.
            </p>

            {/* Receipt Details */}
            <div
              className="p-4 rounded-lg mb-6 text-left space-y-2 border"
              style={{
                backgroundColor: "var(--color-primary-bg)",
                borderColor: "var(--color-accent)",
              }}
              
            >
              <div>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-light)", opacity: 0.6 }}
                >
                  Donation ID
                </p>
                <p
                  className="font-mono text-sm break-all"
                  style={{ color: "var(--color-accent)" }}
                >
                  {donation.id}
                </p>
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-light)", opacity: 0.6 }}
                >
                  Transaction Hash
                </p>
                <p
                  className="font-mono text-sm break-all"
                  style={{ color: "var(--color-accent)" }}
                >
                  {donation.transactionHash}
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-6 text-left">
              <h3
                className="font-semibold mb-3"
                style={{ color: "var(--color-text-light)" }}
              >
                What Happens Next?
              </h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-3">
                  <span
                    className="font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    1
                  </span>
                  <span style={{ color: "var(--color-text-light)" }}>
                    Provider reviews and confirms campaign details
                  </span>
                </li>
                <li className="flex gap-3">
                  <span
                    className="font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    2
                  </span>
                  <span style={{ color: "var(--color-text-light)" }}>
                    Beneficiary confirms they received the funds
                  </span>
                </li>
                <li className="flex gap-3">
                  <span
                    className="font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    3
                  </span>
                  <span style={{ color: "var(--color-text-light)" }}>
                    Funds are released and dual confirmation complete
                  </span>
                </li>
                <li className="flex gap-3">
                  <span
                    className="font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    4
                  </span>
                  <span style={{ color: "var(--color-text-light)" }}>
                    You receive impact report
                  </span>
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/donor")}
                className="w-full rounded-full"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-primary-bg)",
                }}
              >
                Go to Your Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full gap-2"
                style={{
                  borderColor: "var(--color-accent)",
                  color: "var(--color-accent)",
                }}
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/campaigns")}
                className="w-full rounded-full"
                style={{ color: "var(--color-accent)" }}
              >
                Browse More Campaigns
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DonationFlow;
