import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { CampaignService } from "../services/apiServices";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  ArrowLeft,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  LayoutDashboard,
  FolderKanban,
  Upload,
  FileText,
  User,
  Bell,
  Lock,
} from "lucide-react";
import { getBeneficiaryDisplayName } from "../lib/utils";

type Step = "select-campaign" | "confirm-withdrawal" | "processing" | "success";

function campaignAmountRaised(c: any): number {
  const v = c?.amountRaised;
  if (v == null) return 0;
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return n > 0 && n < 1000 ? n * 100 : n;
}

const ProviderWithdrawal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const { user, logout } = useAuth();

  const [provider, setProvider] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [campRes, provRes] = await Promise.all([
          CampaignService.getAll(),
          api.get("/providers/me"),
        ]);
        const list = (campRes as any)?.campaigns ?? campRes ?? [];
        setCampaigns(Array.isArray(list) ? list : []);
        const p = (provRes as any)?.provider ?? provRes;
        setProvider(p || null);
      } catch (e) {
        console.error("Failed to load provider/campaigns", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const userId = (user as any)?.id ?? (user as any)?._id ?? (provider as any)?.userId;
  const eligibleCampaigns = campaigns.filter(
    (c) =>
      (String((c as any).providerId?._id ?? (c as any).providerId) === userId ||
        String((c as any).providerId) === userId) &&
      (c as any).providerAccepted === true
  );

  const selectedCampaignId = campaignId || null;
  const selectedCampaign = selectedCampaignId
    ? eligibleCampaigns.find(
        (c) =>
          String((c as any)._id ?? (c as any).id) === selectedCampaignId
      ) ?? campaigns.find(
        (c) => String((c as any)._id ?? (c as any).id) === selectedCampaignId
      )
    : null;

  const [currentStep, setCurrentStep] = useState<Step>(
    selectedCampaignId ? "confirm-withdrawal" : "select-campaign"
  );
  const [chosenCampaign, setChosenCampaign] = useState<any>(
    selectedCampaign || null
  );
  const [withdrawAmount, setWithdrawAmount] = useState<string>(
    selectedCampaign
      ? `${(campaignAmountRaised(selectedCampaign) / 100).toFixed(2)}`
      : ""
  );
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payoutMethods = (provider?.payoutMethods ?? []) as { id?: string; isDefault?: boolean; type?: string; details?: Record<string, string> }[];
  useEffect(() => {
    const methods = provider?.payoutMethods ?? [];
    if (methods.length > 0) {
      const defaultId = methods.find((p: any) => p.isDefault)?.id ?? methods[0]?.id ?? null;
      setSelectedPayoutId((prev) => prev ?? defaultId ?? null);
    }
  }, [provider]);

  const navItems = [
    {
      label: "Dashboard",
      href: "/provider",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Campaigns",
      href: "/provider/campaigns",
      icon: <FolderKanban className="w-5 h-5" />,
    },
    {
      label: "Upload Invoices",
      href: "/provider/invoices",
      icon: <Upload className="w-5 h-5" />,
    },
    {
      label: "Withdrawals",
      href: "/provider/withdrawals",
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      label: "Proof Upload",
      href: "/provider/proof-upload",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  const settingsNavItems = [
    { id: "profile", label: "Profile", href: "/provider/settings/profile", icon: <User className="w-5 h-5" /> },
    { id: "payouts", label: "Payouts", href: "/provider/settings/payouts", icon: <Wallet className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", href: "/provider/settings/notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "change-password", label: "Change Password", href: "/provider/settings/change-password", icon: <Lock className="w-5 h-5" /> },
  ];

  const handleCampaignSelect = (campaign: any) => {
    setChosenCampaign(campaign);
    setWithdrawAmount(`${(campaignAmountRaised(campaign) / 100).toFixed(2)}`);
    setError(null);
    setCurrentStep("confirm-withdrawal");
  };

  const handleWithdrawal = async () => {
    setError(null);

    // Validation
    if (!chosenCampaign) {
      setError("Please select a campaign");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    if (amount > campaignAmountRaised(chosenCampaign) / 100) {
      setError("Amount exceeds available funds");
      return;
    }

    if (!selectedPayoutId) {
      setError("Select a payout method");
      return;
    }

    setIsProcessing(true);
    try {
      const cId = (chosenCampaign as any)._id || chosenCampaign.id;
      await api.post("/providers/me/withdraw", {
        amount,
        currency: "USD",
        campaignId: cId || undefined,
      });
      setCurrentStep("success");
    } catch (err: any) {
      setError(err?.message || err?.response?.data?.message || "Failed to process withdrawal");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/provider");
  };

  const handleSelectAnotherCampaign = () => {
    setChosenCampaign(null);
    setWithdrawAmount("");
    setError(null);
    setCurrentStep("select-campaign");
  };

  const providerName =
    (provider as any)?.businessName ??
    (user as any)?.name ??
    (user as any)?.firstName
      ? `${(user as any).firstName ?? ""} ${(user as any).lastName ?? ""}`.trim()
      : (user as any)?.email ??
    "Provider";

  if (loading) {
    return (
      <DashboardLayout
        navItems={navItems}
        userName={providerName}
        userRole="Aid Provider"
        settingsNavItems={settingsNavItems}
        onLogout={async () => { await logout(); navigate("/"); }}
      >
        <div className="p-10 text-center">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navItems={navItems}
      userName={providerName}
      userRole="Aid Provider"
      settingsNavItems={settingsNavItems}
      onLogout={async () => {
        await logout();
        navigate("/");
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Withdraw Funds</h1>
          <p className="text-muted-foreground">
            Request withdrawal of campaign funds to your payout method
          </p>
        </div>

        {/* Step: Select Campaign */}
        {currentStep === "select-campaign" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligibleCampaigns.length > 0 ? (
                eligibleCampaigns.map((campaign) => {
                  const cId = (campaign as any)._id ?? (campaign as any).id;
                  const raised = campaignAmountRaised(campaign);
                  const target = Number((campaign as any).targetAmount ?? 1) || 1;
                  const donorCount = (campaign as any).donorCount ?? 0;
                  return (
                  <Card
                    key={cId}
                    className="p-4 sm:p-6 card-elevated cursor-pointer hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] transition-all duration-200"
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
                            {getBeneficiaryDisplayName(campaign)}
                          </span>
                        </p>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Amount Available
                        </span>
                        <span className="font-bold text-lg">
                          ${(raised / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary/50 rounded-full h-2">
                        <div
                          className="h-full bg-linear-to-r from-primary to-purple-500 rounded-full"
                          style={{
                            width: `${Math.min((raised / (target * 100 || 1)) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {donorCount} donors
                      </p>
                    </div>

                    <Button
                      className="w-full mt-4 btn-cta rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCampaignSelect(campaign);
                      }}
                    >
                      Withdraw Funds
                    </Button>
                  </Card>
                  );
                })
              ) : (
                <div className="col-span-full">
                  <Card className="p-8 card-elevated text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">
                      No Eligible Campaigns
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any campaigns with dual confirmation ready
                      for withdrawal.
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

        {/* Step: Confirm Withdrawal */}
        {currentStep === "confirm-withdrawal" && chosenCampaign && (
          <Card className="p-6 sm:p-8 card-elevated">
            <h2 className="text-2xl font-bold mb-6">Confirm Withdrawal</h2>

            <div className="space-y-6">
              {/* Campaign Summary */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground mb-2">Campaign</p>
                <h3 className="font-bold text-lg">{chosenCampaign.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Beneficiary: {getBeneficiaryDisplayName(chosenCampaign)}
                </p>
              </div>

              {/* Withdrawal Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Amount to Withdraw (USD)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={withdrawAmount}
                      onChange={(e) => {
                        setWithdrawAmount(e.target.value);
                        setError(null);
                      }}
                      min="0"
                      max={(campaignAmountRaised(chosenCampaign) / 100).toFixed(2)}
                      className="text-lg font-semibold"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        setWithdrawAmount(
                          `${(campaignAmountRaised(chosenCampaign) / 100).toFixed(2)}`
                        )
                      }
                      className="rounded-lg"
                    >
                      Max
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Available: ${(campaignAmountRaised(chosenCampaign) / 100).toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Payout Method
                  </label>
                  <select
                    className="w-full p-3 rounded-lg bg-card border border-border text-sm"
                    value={selectedPayoutId || ""}
                    onChange={(e) => setSelectedPayoutId(e.target.value)}
                  >
                    <option value="">Select a payout method</option>
                    {payoutMethods.map((pm) => {
                      const pid = (pm as any).id ?? (pm as any)._id ?? "";
                      return (
                        <option key={pid} value={pid}>
                          {((pm as any).type ?? "payout").toString().toUpperCase()} -{" "}
                          {(pm as any).details?.bankName ||
                            (pm as any).details?.provider ||
                            (pm as any).details?.walletAddress ||
                            (pm as any).bankName ||
                            (pm as any).accountName ||
                            pid}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Processing Time Info */}
              <div className="p-4 rounded-lg bg-blue-100/10 border border-blue-200/50">
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Processing Time</p>
                    <p>
                      Your withdrawal will be processed within 2-5 business
                      days.
                    </p>
                  </div>
                </div>
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleSelectAnotherCampaign}
                  disabled={isProcessing}
                  className="flex-1 rounded-lg"
                >
                  Select Different Campaign
                </Button>
                <Button
                  className="flex-1 btn-cta rounded-lg"
                  onClick={handleWithdrawal}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Confirm Withdrawal"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step: Success */}
        {currentStep === "success" && chosenCampaign && (
          <Card className="p-8 card-elevated text-center max-w-md mx-auto">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Withdrawal Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Your withdrawal request for{" "}
              <span className="font-semibold">${withdrawAmount}</span> has been
              submitted successfully.
            </p>

            <div className="space-y-2 text-sm mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium">Campaign:</span>{" "}
                {chosenCampaign.title}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Status:</span> Processing
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSelectAnotherCampaign}
                className="flex-1 rounded-lg"
              >
                Withdraw Another
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

export default ProviderWithdrawal;
