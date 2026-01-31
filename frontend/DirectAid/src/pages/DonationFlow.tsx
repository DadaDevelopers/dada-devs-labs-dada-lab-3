import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Heart, Zap, DollarSign, Lock, AlertCircle, Download, Phone, Smartphone, Copy, Check } from "lucide-react";

// Mock context and services
const mockUser = {
  id: "user_123",
  name: "John Doe",
  email: "john@example.com"
};

const mockCampaign = {
  id: "camp_1",
  title: "Emergency Medical Care for Children",
  description: "Providing essential medical care for underprivileged children in rural areas.",
  targetAmount: 25000000, // in cents
  amountRaised: 1500000,
  location: "Nairobi, Kenya",
  category: "healthcare"
};

type Step = "campaign" | "amount" | "payment" | "processing" | "receipt";
type PaymentMethod = "mpesa" | "lightning" | "onchain";
type PaymentStatus = "idle" | "sending" | "waiting" | "confirmed" | "failed" | "cancelled";

const DonationFlow = () => {
  const [currentStep, setCurrentStep] = useState<Step>("campaign");
  const [currentUser] = useState(mockUser);
  const [selectedCampaign] = useState(mockCampaign);

  // Donation form state
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "mpesa" as PaymentMethod,
    donorName: currentUser?.name || "",
    donorEmail: currentUser?.email || "",
    mpesaPhone: "",
    anonymous: false,
    newsletter: true,
  });

  const [donation, setDonation] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [countdown, setCountdown] = useState(90);
  const [invoiceCopied, setInvoiceCopied] = useState(false);
  const [lightningInvoice] = useState("lnbc15u1p3xnhl2pp5jptserfk3zk4qy42tlucycrfwxhydvlemu9pqr93tuzlv9cc7g3sdq5xysxxatsyp3k7enxv4jsxqzjccqpjrzjqtqkejjy2c44jrwj08y5ygqtmn8af7vscwnflttzpsgw7tuz9r407zyusgqq44sqqqqqqqqqqqqqqqgqjq5dqqqqqqqqqqqqqqqqqsqqqqqysgqdqqmqz9gxqyjw5qrzjqwryaup9lh50kkranzgcdnn2fgvx390wgj5jd07rwr3vxeje0glcll6l4qzk4qqqqlgqqqqqqqlgqqqqqzsqyg9qxpqysgq83qqrvwvr8r2y4dxfm4xqd7r5fw2z6xy3x3d9xqe5k2c5xqqqqqqqq");
  const [btcAddress] = useState("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");

  // Calculate amounts
  const donationAmountUSD = parseFloat(formData.amount) || 0;
  const donationAmountKES = donationAmountUSD * 130; // Approximate USD to KES rate
  const donationAmountSats = Math.round(donationAmountUSD * 2500); // Approximate sats
  const donationAmountBTC = (donationAmountUSD / 40000).toFixed(8); // Approximate BTC
  const platformFee = donationAmountUSD * 0.01;
  const totalAmount = donationAmountUSD + platformFee;

  useEffect(() => {
    if (paymentStatus === "waiting" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (paymentStatus === "waiting" && countdown === 0) {
      setPaymentStatus("failed");
    }
  }, [paymentStatus, countdown]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as: 254 712 345 678
    if (cleaned.startsWith('254')) {
      const match = cleaned.match(/^(254)(\d{0,3})(\d{0,3})(\d{0,3})$/);
      if (match) {
        return [match[1], match[2], match[3], match[4]].filter(Boolean).join(' ');
      }
    } else if (cleaned.startsWith('0')) {
      // Convert 07xx to 254 7xx
      const withoutZero = cleaned.substring(1);
      return formatPhoneNumber('254' + withoutZero);
    } else if (cleaned.startsWith('7')) {
      return formatPhoneNumber('254' + cleaned);
    }
    
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, mpesaPhone: formatted }));
  };

  const isPhoneValid = () => {
    const cleaned = formData.mpesaPhone.replace(/\s/g, '');
    return cleaned.match(/^254\d{9}$/);
  };

  const canProceedToPayment = () => {
    return formData.amount && parseFloat(formData.amount) > 0 && formData.paymentMethod;
  };

  const handleMPesaPayment = async () => {
    if (!isPhoneValid()) {
      alert("Please enter a valid M-Pesa phone number");
      return;
    }

    setCurrentStep("processing");
    setPaymentStatus("sending");
    setCountdown(90);

    // Simulate sending STK push
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setPaymentStatus("waiting");

    // Simulate payment confirmation after 5 seconds
    setTimeout(() => {
      setPaymentStatus("confirmed");
      setTimeout(() => {
        completeDonation();
      }, 1500);
    }, 5000);
  };

  const handleLightningPayment = async () => {
    setCurrentStep("processing");
    setPaymentStatus("waiting");

    // Simulate payment detection
    setTimeout(() => {
      setPaymentStatus("confirmed");
      setTimeout(() => {
        completeDonation();
      }, 1500);
    }, 7000);
  };

  const handleOnChainPayment = async () => {
    setCurrentStep("processing");
    setPaymentStatus("waiting");

    // Simulate blockchain confirmation
    setTimeout(() => {
      setPaymentStatus("confirmed");
      setTimeout(() => {
        completeDonation();
      }, 1500);
    }, 10000);
  };

  const completeDonation = () => {
    const newDonation = {
      id: `don_${Date.now()}`,
      campaignId: selectedCampaign.id,
      donorId: currentUser?.id || `donor_${Date.now()}`,
      amountUSD: donationAmountUSD,
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
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setInvoiceCopied(true);
    setTimeout(() => setInvoiceCopied(false), 2000);
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `
═══════════════════════════════════════════════════════════
                    DONATION RECEIPT
═══════════════════════════════════════════════════════════

Thank you for your generous donation!

───────────────────────────────────────────────────────────
DONATION DETAILS
───────────────────────────────────────────────────────────

Donation ID:        ${donation.id}
Transaction Hash:   ${donation.transactionHash}
Date & Time:        ${new Date(donation.timestamp).toLocaleString()}

───────────────────────────────────────────────────────────
CAMPAIGN INFORMATION
───────────────────────────────────────────────────────────

Campaign:           ${selectedCampaign.title}
Category:           ${selectedCampaign.category}
Location:           ${selectedCampaign.location}

───────────────────────────────────────────────────────────
PAYMENT DETAILS
───────────────────────────────────────────────────────────

Amount:             ${donationAmountUSD.toFixed(2)} USD
${formData.paymentMethod === "mpesa" ? `Equivalent:         KES ${donationAmountKES.toLocaleString()}` : ''}
${formData.paymentMethod === "lightning" ? `Equivalent:         ${donationAmountSats.toLocaleString()} sats` : ''}
${formData.paymentMethod === "onchain" ? `Equivalent:         ${donationAmountBTC} BTC` : ''}
Platform Fee:       ${platformFee.toFixed(2)} USD
Total Paid:         ${totalAmount.toFixed(2)} USD

Payment Method:     ${formData.paymentMethod === "mpesa" ? "M-Pesa" : formData.paymentMethod === "lightning" ? "Lightning Network" : "Bitcoin (On-Chain)"}
${formData.paymentMethod === "mpesa" ? `Phone Number:       ${formData.mpesaPhone}` : ''}

───────────────────────────────────────────────────────────
DONOR INFORMATION
───────────────────────────────────────────────────────────

Name:               ${donation.donorName}
Email:              ${donation.donorEmail}

───────────────────────────────────────────────────────────
FUND STATUS
───────────────────────────────────────────────────────────

Status:             Purpose-Locked
Next Steps:         
  1. Provider reviews and confirms campaign details
  2. Beneficiary confirms they received the funds
  3. Funds are released and dual confirmation complete
  4. You receive impact report

───────────────────────────────────────────────────────────

This receipt confirms your donation has been successfully
processed and is now awaiting dual confirmation.

For questions or support, please contact:
support@directaid.example.com

═══════════════════════════════════════════════════════════
              Generated on ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════════
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donation-receipt-${donation.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const Card = ({ children, className = "", style = {} }: any) => (
    <div className={`rounded-xl border-2 ${className}`} style={style}>
      {children}
    </div>
  );

  const Button = ({ children, onClick, disabled = false, variant = "primary", className = "", style = {} }: any) => {
    const baseStyle = "px-6 py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed";
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseStyle} ${className}`}
        style={style}
      >
        {children}
      </button>
    );
  };

  const Input = ({ className = "", style = {}, ...props }: any) => (
    <input
      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 ${className}`}
      style={style}
      {...props}
    />
  );

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: "#0a0e1a" }}>
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <button
          onClick={() => {
            if (currentStep === "processing") return;
            if (currentStep === "campaign") {
              // navigate back
            } else {
              setCurrentStep("campaign");
            }
          }}
          className="flex items-center gap-2 text-sm hover:opacity-80 mb-6 transition"
          style={{ color: "#00ffff" }}
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === "campaign" ? "Browse Campaigns" : "Start Over"}
        </button>

        {/* Progress Indicator */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#e0e0e0" }}>
            Make a Donation
          </h1>
          <div className="flex gap-2 sm:gap-4">
            {["campaign", "amount", "payment", "processing", "receipt"].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition border-2"
                  style={{
                    backgroundColor: ["campaign", "amount", "payment", "processing", "receipt"].indexOf(currentStep) >= idx ? "#00ffff" : "#1a1f2e",
                    color: ["campaign", "amount", "payment", "processing", "receipt"].indexOf(currentStep) >= idx ? "#0a0e1a" : "#e0e0e0",
                    borderColor: "#00ffff",
                  }}
                >
                  {idx + 1}
                </div>
                {idx < 4 && (
                  <div
                    className="w-4 sm:w-8 h-1 mx-2 transition"
                    style={{
                      backgroundColor: ["campaign", "amount", "payment", "processing", "receipt"].indexOf(currentStep) > idx ? "#00ffff" : "#1a1f2e",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto">
        {/* Step 1: Campaign Review */}
        {currentStep === "campaign" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 sm:p-8" style={{ backgroundColor: "#1a1f2e", borderColor: "#00ffff" }}>
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-6 h-6" style={{ color: "#00ffff" }} />
                  <h2 className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>
                    {selectedCampaign.title}
                  </h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm mb-2" style={{ color: "#e0e0e0", opacity: 0.7 }}>
                      Campaign Goal
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#00ffff" }}>
                      ${(selectedCampaign.targetAmount / 100).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "#e0e0e0", opacity: 0.7 }}>Funds Raised</span>
                      <span className="font-semibold" style={{ color: "#00ffff" }}>
                        ${(selectedCampaign.amountRaised / 100).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: "#0a0e1a" }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          backgroundColor: "#00ffff",
                          width: `${Math.min((selectedCampaign.amountRaised / selectedCampaign.targetAmount) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm mb-2" style={{ color: "#e0e0e0", opacity: 0.7 }}>
                      Description
                    </p>
                    <p className="text-sm" style={{ color: "#e0e0e0" }}>
                      {selectedCampaign.description}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setCurrentStep("amount")}
                  className="w-full rounded-full"
                  style={{ backgroundColor: "#00ffff", color: "#0a0e1a" }}
                >
                  Continue to Donation
                </Button>
              </Card>
            </div>

            <div>
              <Card className="p-4 sm:p-6 sticky top-4" style={{ backgroundColor: "#1a1f2e", borderColor: "#00ffff" }}>
                <h3 className="font-bold mb-4" style={{ color: "#e0e0e0" }}>
                  Campaign Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: "#e0e0e0", opacity: 0.7 }}>Status</span>
                    <span className="font-semibold" style={{ color: "#00ffff" }}>
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#e0e0e0", opacity: 0.7 }}>Location</span>
                    <span className="font-semibold" style={{ color: "#e0e0e0" }}>
                      {selectedCampaign.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#e0e0e0", opacity: 0.7 }}>Category</span>
                    <span className="font-semibold capitalize" style={{ color: "#e0e0e0" }}>
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
              <Card className="p-6 sm:p-8" style={{ backgroundColor: "#1a1f2e", borderColor: "#00ffff" }}>
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-6 h-6" style={{ color: "#00ffff" }} />
                  <h2 className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>
                    Donation Amount
                  </h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: "#e0e0e0" }}>
                      How much would you like to donate?
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-5 h-5" style={{ color: "#00ffff", opacity: 0.7 }} />
                      <Input
                        type="number"
                        name="amount"
                        placeholder="100"
                        value={formData.amount}
                        onChange={handleFormChange}
                        className="pl-10 text-lg"
                        style={{ backgroundColor: "#0a0e1a", color: "#e0e0e0", borderColor: "#00ffff" }}
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <p className="text-xs mt-2" style={{ color: "#e0e0e0", opacity: 0.6 }}>
                      ≈ KES {donationAmountKES.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: "#e0e0e0" }}>
                      Or choose a quick amount
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 25, 50, 100].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setFormData((prev) => ({ ...prev, amount: amount.toString() }))}
                          className="p-2 rounded-lg text-sm font-semibold transition border-2"
                          style={{
                            backgroundColor: formData.amount === amount.toString() ? "#00ffff" : "#0a0e1a",
                            color: formData.amount === amount.toString() ? "#0a0e1a" : "#00ffff",
                            borderColor: "#00ffff",
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
                      className="flex-1 rounded-full border-2"
                      style={{ borderColor: "#00ffff", color: "#00ffff", backgroundColor: "transparent" }}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep("payment")}
                      disabled={!canProceedToPayment()}
                      className="flex-1 rounded-full"
                      style={{ backgroundColor: "#00ffff", color: "#0a0e1a" }}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-4 sm:p-6 sticky top-4" style={{ backgroundColor: "#1a1f2e", borderColor: "#00ffff" }}>
                <h3 className="font-bold mb-4" style={{ color: "#e0e0e0" }}>
                  Summary
                </h3>
                <div className="space-y-3 text-sm border-b pb-4 mb-4" style={{ borderColor: "rgba(0, 255, 255, 0.3)" }}>
                  <div className="flex justify-between">
                    <span style={{ color: "#e0e0e0", opacity: 0.7 }}>Campaign</span>
                    <span className="font-semibold text-right max-w-[150px]" style={{ color: "#00ffff" }}>
                      {selectedCampaign.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#e0e0e0", opacity: 0.7 }}>Amount</span>
                    <span className="font-semibold" style={{ color: "#00ffff" }}>
                      ${donationAmountUSD.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-xs" style={{ color: "#e0e0e0", opacity: 0.7 }}>
                  Your donation is purpose-locked and will only be released after both provider and beneficiary confirm.
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Payment Method */}
        {currentStep === "payment" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 sm:p-8" style={{ backgroundColor: "#1a1f2e", borderColor: "#00ffff" }}>
                <div className="flex items-center gap-3 mb-6">
                  <Smartphone className="w-6 h-6" style={{ color: "#00ffff" }} />
                  <h2 className="text-2xl font-bold" style={{ color: "#e0e0e0" }}>
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-5">
                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: "#e0e0e0" }}>
                      Select payment method
                    </label>
                    <div className="space-y-3">
                      {/* M-Pesa - Featured */}
                      <label
                        className="p-4 rounded-lg border-2 cursor-pointer transition block"
                        style={{
                          backgroundColor: "#0a0e1a",
                          borderColor: formData.paymentMethod === "mpesa" ? "#00ffff" : "rgba(0, 255, 255, 0.2)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="mpesa"
                            checked={formData.paymentMethod === "mpesa"}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                            className="w-4 h-4"
                            style={{ accentColor: "#00ffff" }}
                          />
                          <Phone className="w-5 h-5" style={{ color: "#00ffff" }} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold" style={{ color: "#e0e0e0" }}>
                                M-Pesa
                              </p>
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#00ffff", color: "#0a0e1a" }}>
                                Recommended
                              </span>
                            </div>
                            <p className="text-xs" style={{ color: "#e0e0e0", opacity: 0.6 }}>
                              Instant mobile payment via STK Push
                            </p>
                          </div>
                        </div>
                      </label>

                      {/* Lightning Network */}
                      <label
                        className="p-4 rounded-lg border-2 cursor-pointer transition block"
                        style={{
                          backgroundColor: "#0a0e1a",
                          borderColor: formData.paymentMethod === "lightning" ? "#00ffff" : "rgba(0, 255, 255, 0.2)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="lightning"
                            checked={formData.paymentMethod === "lightning"}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                            className="w-4 h-4"
                            style={{ accentColor: "#00ffff" }}
                          />
                          <Zap className="w-5 h-5" style={{ color: "#00ffff" }} />
                          <div>
                            <p className="font-semibold" style={{ color: "#e0e0e0" }}>
                              Lightning Network
                            </p>
                            <p className="text-xs" style={{ color: "#e0e0e0", opacity: 0.6 }}>
                              Instant Bitcoin payment, low fees
                            </p>
                          </div>
                        </div>
                      </label>

                      {/* On-Chain Bitcoin */}
                      <label
                        className="p-4 rounded-lg border-2 cursor-pointer transition block"
                        style={{
                          backgroundColor: "#0a0e1a",
                          borderColor: formData.paymentMethod === "onchain" ? "#00ffff" : "rgba(0, 255, 255, 0.2)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="onchain"
                            checked={formData.paymentMethod === "onchain"}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                            className="w-4 h-4"
                            style={{ accentColor: "#00ffff" }}
                          />
                          <DollarSign className="w-5 h-5" style={{ color: "#00ffff" }} />
                          <div>
                            <p className="font-semibold" style={{ color: "#e0e0e0" }}>
                              Bitcoin (On-Chain)
                            </p>
                            <p className="text-xs" style={{ color: "#e0e0e0", opacity: 0.6 }}>
                              10-60 min confirmation, higher fees
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Dynamic Payment Interface */}
                  <div className="pt-4 border-t-2" style={{ borderColor: "rgba(0, 255, 255, 0.3)" }}>
                    {/* M-Pesa Payment Form */}
                    {formData.paymentMethod === "mpesa" && (
                      <div className="space-y-4">
                        <h3 className="font-semibold" style={{ color: "#e0e0e0" }}>
                          Enter M-Pesa Details
                        </h3>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: "#e0e0e0" }}>
                            M-Pesa Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 w-5 h-5" style={{ color: "#00ffff", opacity: 0.7 }} />
                            <Input
                              type="tel"
                              value={formData.mpesaPhone}
                              onChange={handlePhoneChange}
                              placeholder="254 712 345 678"
                              className="pl-10"
                              style={{ backgroundColor: "#0a0e1a", color: "#e0e0e0", borderColor: "#00ffff" }}
                            />
                          </div>
                          <p className="text-xs mt-1" style={{ color: "#e0e0e0", opacity: 0.6 }}>
                            Enter your M-Pesa registered phone number
                          </p>
                        </div>

                        <div className="p-4 rounded-lg border-2" style={{ backgroundColor: "rgba(0, 255, 255, 0.05)", borderColor: "#00ffff" }}>
                          <div className="flex items-start gap-3">
                            <Smartphone className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#00ffff" }} />
                            <div className="text-sm" style={{ color: "#e0e0e0" }}>
                              <p className="font-semibold mb-1">How it works:</p>
                              <ol className="space-y-1 text-xs" style={{ opacity: 0.8 }}>
                                <li>1. Click "Send Payment Request"</li>
                                <li>2. You'll receive a prompt on your phone</li>
                                <li>3. Enter your M-Pesa PIN to confirm</li>
                                <li>4. Payment confirmation is instant</li>
                              </ol>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(0, 255, 255, 0.1)" }}>
                          <p className="text-sm font-semibold" style={{ color: "#00ffff" }}>
                            Amount to pay: KES {donationAmountKES.toLocaleString()} (${donationAmountUSD.toFixed(2)})
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Lightning Network Payment Form */}
                    {formData.paymentMethod === "lightning" && (
                      <div className="space-y-4">
                        <h3 className="font-semibold" style={{ color: "#e0e0e0" }}>
                          Pay with Lightning
                        </h3>
                        
                        <div className="text-center py-6">
                          <div className="w-64 h-64 mx-auto mb-4 rounded-lg flex items-center justify-center border-2" style={{ backgroundColor: "#ffffff", borderColor: "#00ffff" }}>
                            <div className="text-center p-4">
                              <p className="text-xs mb-2" style={{ color: "#0a0e1a" }}>Lightning Invoice QR</p>
                              <div className="grid grid-cols-8 gap-1">
                                {Array.from({ length: 64 }).map((_, i) => (
                                  <div key={i} className="w-3 h-3" style={{ backgroundColor: Math.random() > 0.5 ? "#0a0e1a" : "#ffffff" }} />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm mb-3" style={{ color: "#e0e0e0", opacity: 0.8 }}>
                            Scan with your Lightning wallet
                          </p>

                          <div className="max-w-md mx-auto">
                            <label className="block text-xs mb-2" style={{ color: "#e0e0e0", opacity: 0.7 }}>
                              Or copy invoice:
                            </label>
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                value={lightningInvoice}
                                readOnly
                                className="text-xs font-mono"
                                style={{ backgroundColor: "#0a0e1a", color: "#e0e0e0", borderColor: "#00ffff" }}
                              />
                              <button
                                onClick={() => copyToClipboard(lightningInvoice)}
                                className="px-4 py-2 rounded-lg border-2 transition"
                                style={{ borderColor: "#00ffff", color: "#00ffff" }}
                              >
                                {invoiceCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(0, 255, 255, 0.1)" }}>
                          <p className="text-sm font-semibold mb-1" style={{ color: "#00ffff" }}>
                            Amount: {donationAmountSats.toLocaleString()} sats
                          </p>
                          <p className="text-xs" style={{ color: "#e0e0e0", opacity: 0.7 }}>
                            ≈ ${donationAmountUSD.toFixed(2)} USD
                          </p>
                        </div>

                        <div className="text-center">
                          <Button
                            onClick={handleLightningPayment}
                            className="rounded-full px-8"
                            style={{ backgroundColor: "#00ffff", color: "#0a0e1a" }}
                          >
                            I've Paid via Lightning
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* On-Chain Bitcoin Payment Form */}
                    {formData.paymentMethod === "onchain" && (
                      <div className="space-y-4">
                        <h3 className="font-semibold" style={{ color: "#e0e0e0" }}>
                          Pay with Bitcoin (On-Chain)
                        </h3>
                        
                        <div className="text-center py-6">
                          <div className="w-64 h-64 mx-auto mb-4 rounded-lg flex items-center justify-center border-2" style={{ backgroundColor: "#ffffff", borderColor: "#00ffff" }}>
                            <div className="text-center p-4">
                              <p className="text-xs mb-2" style={{ color: "#0a0e1a" }}>Bitcoin Address QR</p>
                              <div className="grid grid-cols-8 gap-1">
                                {Array.from({ length: 64 }).map((_, i) => (
                                  <div key={i} className="w-3 h-3" style={{ backgroundColor: Math.random() > 0.6 ? "#0a0e1a" : "#ffffff" }} />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="max-w-md mx-auto mb-4">
                            <label className="block text-sm mb-2 font-semibold" style={{ color: "#e0e0e0" }}>
                              Send exactly {donationAmountBTC} BTC to:
                            </label>
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                value={btcAddress}
                                readOnly
                                className="text-sm font-mono"
                                style={{ backgroundColor: "#0a0e1a", color: "#e0e0e0", borderColor: "#00ffff" }}
                              />
                              <button
                                onClick={() => copyToClipboard(btcAddress)}
                                className="px-4 py-2 rounded-lg border-2 transition"
                                style={{ borderColor: "#00ffff", color: "#00ffff" }}
                              >
                                {invoiceCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border-2" style={{ backgroundColor: "rgba(255, 165, 0, 0.1)", borderColor: "rgba(255, 165, 0, 0.5)" }}>
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#ffa500" }} />
                            <div className="text-sm" style={{ color: "#e0e0e0" }}>
                              <p className="font-semibold mb-1">Please note:</p>
                              <ul className="space-y-1 text-xs" style={{ opacity: 0.8 }}>
                                <li>• Confirmation time: 10-60 minutes</li>
                                <li>• Network fees may apply</li>
                                <li>• Send exact amount to avoid delays</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <Button
                            onClick={handleOnChainPayment}
                            className="rounded-full px-8"
                            style={{ backgroundColor: "#00ffff", color: "#0a0e1a" }}
                          >
                            I've Sent the Payment
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Donor Information - Auto-filled if logged in */}
                  {currentUser && (
                    <div className="pt-4 border-t-2" style={{ borderColor: "rgba(0, 255, 255, 0.3)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold" style={{ color: "#e0e0e0" }}>
                          Donor Information
                        </h3>
                        <p className="text-xs" style={{ color: "#00ffff" }}>
                          ✓ Auto-filled from your account
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: "#e0e0e0" }}>
                            Full Name
                          </label>
                          <Input
                            type="text"
                            value={formData.donorName}
                            readOnly
                            className="bg-opacity-50"
                            style={{ backgroundColor: "#0a0e1a", color: "#e0e0e0", borderColor: "#00ffff", opacity: 0.7 }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: "#e0e0e0" }}>
                            Email
                          </label>
                          <Input
                            type="email"
                            value={formData.donorEmail}
                            readOnly
                            className="bg-opacity-50"
                            style={{ backgroundColor: "#0a0e1a", color: "#e0e0e0", borderColor: "#00ffff", opacity: 0.7 }}
                          />
                        </div>

                        <div className="space-y-2 pt-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              name="anonymous"
                              checked={formData.anonymous}
                              onChange={handleFormChange}
                              className="w-4 h-4"
                              style={{ accentColor: "#00ffff" }}
                            />
                            <span className="text-sm" style={{ color: "#e0e0e0" }}>
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
                              style={{ accentColor: "#00ffff" }}
                            />
                            <span className="text-sm" style={{ color: "#e0e0e0" }}>
                              Subscribe to impact updates
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => setCurrentStep("amount")}
                      className="flex-1 rounded-full border-2"
                      style={{ borderColor: "#00ffff", color: "#00ffff", backgroundColor: "transparent" }}
                    >
                      Back
                    </Button>
                    {formData.paymentMethod === "mpesa" && (
                      <Button
                        onClick={handleMPesaPayment}
                        disabled={!isPhoneValid()}
                        className="flex-1 rounded-full"
                        style={{ backgroundColor: "#00ffff", color: "#0a0e1a" }}
                      >
                        Send Payment Request
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Summary */}
            <div>
              <Card className="p-4 sm:p-6 sticky top-4" style={{ backgroundColor: "#1a1f2e", borderColor: "#00ffff" }}>
                <h3 className="font-bold mb-4" style={{ color: "#e0e0e0" }}>
                  Order Summary
                </h3>
                <div className="space-y-3 text-sm border-b pb-4 mb-4" style={{ borderColor: "rgba(0, 255, 255, 0.3)" }}>
                  <div className="flex justify-between">
                    <span style={{ color: "#e0e0e0", opacity: 0.7 }}>Donation</span>
                    <span className="font-semibold" style={{ color: "#00ffff" }}>
                      ${donationAmountUSD.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#e0e0e0", opacity: 0.7 }}>Platform Fee (1%)</span>
                    <span className="font-semibold" style={{ color: "#00ffff" }}>
                      ${platformFee.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between font-bold" style={{ color: "#e0e0e0" }}>
                  <span>Total</span>
                  <span style={{ color: "#00ffff" }}>${totalAmount.toFixed(2)}</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 4: Processing Payment */}
        {currentStep === "processing" && (
          <Card className="p-8 max-w-2xl mx-auto" style={{ backgroundColor: "#1a1f2e", borderColor: "#00ffff" }}>
            <div className="text-center space-y-6">
              {paymentStatus === "sending" && (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0, 255, 255, 0.2)" }}>
                    <Smartphone className="w-8 h-8 animate-pulse" style={{ color: "#00ffff" }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: "#e0e0e0" }}>
                      Sending Payment Request...
                    </h2>
                    <p style={{ color: "#e0e0e0", opacity: 0.7 }}>
                      Please wait while we send the request to your phone
                    </p>
                  </div>
                </>
              )}

              {paymentStatus === "waiting" && formData.paymentMethod === "mpesa" && (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0, 255, 255, 0.2)" }}>
                    <Phone className="w-8 h-8 animate-bounce" style={{ color: "#00ffff" }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: "#e0e0e0" }}>
                      Check Your Phone
                    </h2>
                    <p style={{ color: "#e0e0e0", opacity: 0.7 }}>
                      Enter your M-Pesa PIN to complete the payment
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(0, 255, 255, 0.1)" }}>
                    <p className="text-sm mb-2" style={{ color: "#e0e0e0" }}>
                      Payment request sent to:
                    </p>
                    <p className="font-mono font-bold text-lg" style={{ color: "#00ffff" }}>
                      {formData.mpesaPhone}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm mb-2" style={{ color: "#e0e0e0", opacity: 0.7 }}>
                      Request expires in:
                    </p>
                    <p className="text-3xl font-bold" style={{ color: "#00ffff" }}>
                      {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </>
              )}

              {paymentStatus === "waiting" && formData.paymentMethod === "lightning" && (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0, 255, 255, 0.2)" }}>
                    <Zap className="w-8 h-8 animate-pulse" style={{ color: "#00ffff" }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: "#e0e0e0" }}>
                      Waiting for Lightning Payment...
                    </h2>
                    <p style={{ color: "#e0e0e0", opacity: 0.7 }}>
                      This usually takes just a few seconds
                    </p>
                  </div>
                </>
              )}

              {paymentStatus === "waiting" && formData.paymentMethod === "onchain" && (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0, 255, 255, 0.2)" }}>
                    <DollarSign className="w-8 h-8 animate-pulse" style={{ color: "#00ffff" }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: "#e0e0e0" }}>
                      Waiting for Blockchain Confirmation...
                    </h2>
                    <p style={{ color: "#e0e0e0", opacity: 0.7 }}>
                      This may take 10-60 minutes
                    </p>
                  </div>
                </>
              )}

              {paymentStatus === "confirmed" && (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0, 255, 255, 0.2)" }}>
                    <CheckCircle2 className="w-8 h-8" style={{ color: "#00ffff" }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: "#e0e0e0" }}>
                      Payment Confirmed!
                    </h2>
                    <p style={{ color: "#e0e0e0", opacity: 0.7 }}>
                      Generating your receipt...
                    </p>
                  </div>
                </>
              )}

              {paymentStatus === "failed" && (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255, 0, 0, 0.2)" }}>
                    <AlertCircle className="w-8 h-8" style={{ color: "#ff4444" }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: "#e0e0e0" }}>
                      Payment Failed
                    </h2>
                    <p style={{ color: "#e0e0e0", opacity: 0.7 }}>
                      The payment request timed out or was cancelled
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setCurrentStep("payment");
                      setPaymentStatus("idle");
                      setCountdown(90);
                    }}
                    className="rounded-full"
                    style={{ backgroundColor: "#00ffff", color: "#0a0e1a" }}
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}

        {/* Step 5: Receipt */}
        {currentStep === "receipt" && donation && (
          <Card className="p-6 sm:p-8 text-center max-w-2xl mx-auto" style={{ backgroundColor: "#1a1f2e", borderColor: "#00ffff" }}>
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: "#00ffff" }} />
            <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "#e0e0e0" }}>
              Donation Successful!
            </h2>
            <p style={{ color: "#e0e0e0", opacity: 0.7 }} className="mb-6 max-w-md mx-auto">
              Your donation has been received and is now purpose-locked awaiting confirmation from the healthcare provider and beneficiary.
            </p>

            {/* Receipt Details */}
            <div className="p-4 rounded-lg mb-6 text-left space-y-2 border-2" style={{ backgroundColor: "#0a0e1a", borderColor: "#00ffff" }}>
              <div>
                <p className="text-xs" style={{ color: "#e0e0e0", opacity: 0.6 }}>
                  Donation ID
                </p>
                <p className="font-mono text-sm break-all" style={{ color: "#00ffff" }}>
                  {donation.id}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "#e0e0e0", opacity: 0.6 }}>
                  Amount
                </p>
                <p className="font-semibold text-lg" style={{ color: "#00ffff" }}>
                  ${donationAmountUSD.toFixed(2)} USD
                  {formData.paymentMethod === "mpesa" && (
                    <span className="text-sm ml-2" style={{ opacity: 0.7 }}>
                      (KES {donationAmountKES.toLocaleString()})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "#e0e0e0", opacity: 0.6 }}>
                  Payment Method
                </p>
                <p className="font-semibold" style={{ color: "#e0e0e0" }}>
                  {formData.paymentMethod === "mpesa" && "M-Pesa"}
                  {formData.paymentMethod === "lightning" && "Lightning Network"}
                  {formData.paymentMethod === "onchain" && "Bitcoin (On-Chain)"}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "#e0e0e0", opacity: 0.6 }}>
                  Transaction Hash
                </p>
                <p className="font-mono text-sm break-all" style={{ color: "#00ffff" }}>
                  {donation.transactionHash}
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-6 text-left">
              <h3 className="font-semibold mb-3" style={{ color: "#e0e0e0" }}>
                What Happens Next?
              </h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-3">
                  <span className="font-semibold" style={{ color: "#00ffff" }}>
                    1
                  </span>
                  <span style={{ color: "#e0e0e0" }}>
                    Provider reviews and confirms campaign details
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold" style={{ color: "#00ffff" }}>
                    2
                  </span>
                  <span style={{ color: "#e0e0e0" }}>
                    Beneficiary confirms they received the funds
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold" style={{ color: "#00ffff" }}>
                    3
                  </span>
                  <span style={{ color: "#e0e0e0" }}>
                    Funds are released and dual confirmation complete
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold" style={{ color: "#00ffff" }}>
                    4
                  </span>
                  <span style={{ color: "#e0e0e0" }}>
                    You receive impact report
                  </span>
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full rounded-full"
                style={{ backgroundColor: "#00ffff", color: "#0a0e1a" }}
              >
                Go to Your Dashboard
              </Button>
              <Button
                className="w-full rounded-full gap-2 border-2"
                style={{ borderColor: "#00ffff", color: "#00ffff", backgroundColor: "transparent" }}
                onClick={handleDownloadReceipt}
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </Button>
              <Button
                onClick={() => setCurrentStep("campaign")}
                className="w-full rounded-full"
                style={{ color: "#00ffff", backgroundColor: "transparent" }}
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