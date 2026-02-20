import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Save,
  Bell,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  LayoutDashboard,
  FolderKanban,
  Wallet,
  Upload,
  FileText,
  User,
} from "lucide-react";

const ProviderSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useApp();
  const { user, updateProfile } = useAuth();

  const getActiveTabFromPath = () => {
    const pathParts = location.pathname.split("/");
    const tab = pathParts[pathParts.length - 1];
    if (["profile", "payouts", "notifications", "change-password"].includes(tab)) {
      return tab as "profile" | "payouts" | "notifications" | "change-password";
    }
    return "profile";
  };

  const [activeTab, setActiveTab] = useState<
    "profile" | "payouts" | "notifications" | "change-password"
  >(getActiveTabFromPath());

  useEffect(() => {
    if (location.pathname === "/provider/settings") {
      navigate("/provider/settings/profile", { replace: true });
      return;
    }
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname, navigate]);

  const [isSaving, setIsSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileLoadFailed, setProfileLoadFailed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<{ general?: string }>({});

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    country: "",
    city: "",
    organization: "",
    organizationType: "",
    businessRegNumber: "",
    contactPerson: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
    lightningPubkey: "",
    shortDescription: "",
    businessName: "",
    phone: "",
  });

  type PayoutMethodItem = { method: string; lightningAddress?: string; btcAddress?: string };
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethodItem[]>([]);
  const [payoutForm, setPayoutForm] = useState<{ method: "LIGHTNING" | "BITCOIN"; lightningAddress: string; btcAddress: string }>({
    method: "LIGHTNING",
    lightningAddress: "",
    btcAddress: "",
  });
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  const [notifications, setNotifications] = useState({
    campaigns: true,
    invoices: true,
    payouts: true,
    weeklyDigest: true,
    email: true,
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileLoadFailed(false);
    setErrors({});
    try {
      const [providerRes, userRes] = await Promise.all([
        api.get("/providers/me"),
        api.get("/users/me"),
      ]);
      const provider = (providerRes as any)?.provider ?? providerRes;
      const userData = (userRes as any)?.user ?? userRes;
      const u = userData || user || {};
      const p = provider || {};
      const pp = (u as any).providerProfile || {};
      if (provider?.payoutMethods) setPayoutMethods(provider.payoutMethods);
      setProfileData({
        firstName: (u as any).firstName ?? "",
        lastName: (u as any).lastName ?? "",
        email: (u as any).email ?? p.email ?? "",
        phoneNumber: (u as any).phoneNumber ?? "",
        country: (u as any).country ?? "",
        city: (u as any).city ?? "",
        organization: (u as any).organization ?? "",
        organizationType: pp.organizationType ?? "",
        businessRegNumber: pp.businessRegNumber ?? "",
        contactPerson: pp.contactPerson ?? "",
        bankAccountName: pp.bankAccountName ?? "",
        bankAccountNumber: pp.bankAccountNumber ?? "",
        bankName: pp.bankName ?? "",
        lightningPubkey: pp.lightningPubkey ?? "",
        shortDescription: pp.shortDescription ?? "",
        businessName: p.businessName ?? (u as any).organization ?? "",
        phone: p.phone ?? (u as any).phoneNumber ?? "",
      });
    } catch (e) {
      console.error("Failed to load provider/user profile", e);
      setErrors({ general: "Couldn't load profile. Check your connection and try again." });
      setProfileLoadFailed(true);
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});
    try {
      const userPayload = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        country: profileData.country,
        city: profileData.city,
        organization: profileData.organization,
        providerProfile: {
          organizationType: profileData.organizationType,
          businessRegNumber: profileData.businessRegNumber,
          contactPerson: profileData.contactPerson,
          bankAccountName: profileData.bankAccountName,
          bankAccountNumber: profileData.bankAccountNumber,
          bankName: profileData.bankName,
          lightningPubkey: profileData.lightningPubkey,
          shortDescription: profileData.shortDescription,
        },
      };
      const result = await updateProfile(userPayload as any);
      if (!result.ok) {
        setErrors({ general: (result as any).error || "Failed to save profile" });
        setIsSaving(false);
        return;
      }
      await api.put("/providers/me", {
        businessName: profileData.businessName,
        email: profileData.email,
        phone: profileData.phone,
      });
      setSuccessMessage("Saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrors({ general: "An error occurred while saving" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccessMessage("Password changed successfully!");
    setSecurityData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsSaving(false);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

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

  const displayName = profileData.businessName || profileData.firstName || (user as any)?.name || (user as any)?.email || "Provider";

  return (
    <DashboardLayout
      navItems={navItems}
      userName={displayName}
      userRole="Provider"
      settingsNavItems={settingsNavItems}
      onLogout={() => {
        logout();
        navigate("/");
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
            Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {successMessage && (
          <div
            style={{
              backgroundColor: "rgba(0, 255, 255, 0.1)",
              borderColor: "var(--color-accent)",
            }}
            className="p-4 rounded-lg flex gap-3 items-start border"
          >
            <CheckCircle2
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: "var(--color-accent)" }}
            />
            <p style={{ color: "var(--color-accent)" }} className="text-sm">
              {successMessage}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Provider Profile
                </h2>
                {profileLoading ? (
                  <p className="text-muted-foreground">Loading profile...</p>
                ) : profileLoadFailed ? (
                  <Card className="p-6 bg-[#151D2C]/50 border border-white/10 shadow-[var(--shadow-md)]">
                    <div className="space-y-4">
                      <p className="text-destructive text-sm">{errors.general}</p>
                      <Button onClick={() => loadProfile()} style={{ backgroundColor: "var(--color-accent)", color: "var(--color-primary-bg)" }}>
                        Retry
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <>
                    {/* Personal — onboarding-style card with light borders and shadow */}
                    <Card className="p-6 bg-[#151D2C]/50 border border-white/10 shadow-[var(--shadow-md)]">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-accent)" }}>
                        Personal
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                          { key: "firstName", label: "First name" },
                          { key: "lastName", label: "Last name" },
                          { key: "email", label: "Email" },
                          { key: "phoneNumber", label: "Phone number" },
                          { key: "country", label: "Country" },
                          { key: "city", label: "City" },
                        ].map(({ key, label }) => (
                          <div key={key} className="space-y-2">
                            <label className="block text-sm font-medium" style={{ color: "var(--color-text-light)" }}>{label}</label>
                            <Input
                              name={key}
                              value={profileData[key as keyof typeof profileData] ?? ""}
                              onChange={handleProfileChange}
                              className="py-3 rounded-lg border border-white/20 bg-[var(--color-primary-bg)] focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-secondary-bg)]"
                              style={{ color: "var(--color-text-light)" }}
                            />
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Organization / business */}
                    <Card className="p-6 bg-[#151D2C]/50 border border-white/10 shadow-[var(--shadow-md)]">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-accent)" }}>
                        Organization / business
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                          { key: "organization", label: "Organization" },
                          { key: "businessName", label: "Business name (Provider)" },
                          { key: "phone", label: "Provider phone" },
                          { key: "organizationType", label: "Organization type" },
                          { key: "businessRegNumber", label: "Business registration number" },
                          { key: "contactPerson", label: "Contact person" },
                        ].map(({ key, label }) => (
                          <div key={key} className="space-y-2">
                            <label className="block text-sm font-medium" style={{ color: "var(--color-text-light)" }}>{label}</label>
                            <Input
                              name={key}
                              value={profileData[key as keyof typeof profileData] ?? ""}
                              onChange={handleProfileChange}
                              className="py-3 rounded-lg border border-white/20 bg-[var(--color-primary-bg)] focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-secondary-bg)]"
                              style={{ color: "var(--color-text-light)" }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2 mt-4">
                        <label className="block text-sm font-medium" style={{ color: "var(--color-text-light)" }}>Short description</label>
                        <Input
                          name="shortDescription"
                          value={profileData.shortDescription ?? ""}
                          onChange={handleProfileChange}
                          className="py-3 rounded-lg border border-white/20 bg-[var(--color-primary-bg)] focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-secondary-bg)]"
                          style={{ color: "var(--color-text-light)" }}
                        />
                      </div>
                    </Card>

                    {/* Banking & payout */}
                    <Card className="p-6 bg-[#151D2C]/50 border border-white/10 shadow-[var(--shadow-md)]">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-accent)" }}>
                        Banking & payout
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                          { key: "bankName", label: "Bank name" },
                          { key: "bankAccountName", label: "Bank account name" },
                          { key: "bankAccountNumber", label: "Bank account number" },
                          { key: "lightningPubkey", label: "Lightning pubkey" },
                        ].map(({ key, label }) => (
                          <div key={key} className="space-y-2">
                            <label className="block text-sm font-medium" style={{ color: "var(--color-text-light)" }}>{label}</label>
                            <Input
                              name={key}
                              value={profileData[key as keyof typeof profileData] ?? ""}
                              onChange={handleProfileChange}
                              className="py-3 rounded-lg border border-white/20 bg-[var(--color-primary-bg)] focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-secondary-bg)]"
                              style={{ color: "var(--color-text-light)" }}
                            />
                          </div>
                        ))}
                      </div>
                    </Card>

                    {errors.general && <p className="text-destructive text-sm">{errors.general}</p>}
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full py-3 rounded-lg"
                      style={{ backgroundColor: "var(--color-accent)", color: "var(--color-primary-bg)" }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                )}
              </div>
            )}

            {activeTab === "payouts" && (
              <Card className="p-6 sm:p-8">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Payout Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--color-text-light)" }}>
                      Your payout methods
                    </h3>
                    {payoutMethods.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No payout methods yet. Add one below.</p>
                    ) : (
                      <ul className="space-y-2">
                        {payoutMethods.map((pm, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 p-3 rounded-lg border border-white/10"
                            style={{ backgroundColor: "var(--color-primary-bg)" }}
                          >
                            <span className="font-medium">{pm.method}</span>
                            {pm.method === "LIGHTNING" && pm.lightningAddress && <span>{pm.lightningAddress}</span>}
                            {pm.method === "BITCOIN" && pm.btcAddress && <span className="font-mono text-sm">{pm.btcAddress}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--color-text-light)" }}>
                      Add payout method
                    </h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-light)" }}>Method</label>
                        <select
                          value={payoutForm.method}
                          onChange={(e) => setPayoutForm((prev) => ({ ...prev, method: e.target.value as "LIGHTNING" | "BITCOIN" }))}
                          className="w-full rounded-md border px-3 py-2"
                          style={{
                            backgroundColor: "var(--color-primary-bg)",
                            color: "var(--color-text-light)",
                            borderColor: "var(--color-accent)",
                          }}
                        >
                          <option value="LIGHTNING">Lightning</option>
                          <option value="BITCOIN">Bitcoin</option>
                        </select>
                      </div>
                      {payoutForm.method === "LIGHTNING" ? (
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-light)" }}>Lightning address</label>
                          <Input
                            value={payoutForm.lightningAddress}
                            onChange={(e) => setPayoutForm((prev) => ({ ...prev, lightningAddress: e.target.value }))}
                            placeholder="e.g. you@getalby.com"
                            style={{ backgroundColor: "var(--color-primary-bg)", color: "var(--color-text-light)", borderColor: "var(--color-accent)" }}
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-light)" }}>BTC address</label>
                          <Input
                            value={payoutForm.btcAddress}
                            onChange={(e) => setPayoutForm((prev) => ({ ...prev, btcAddress: e.target.value }))}
                            placeholder="e.g. bc1q..."
                            style={{ backgroundColor: "var(--color-primary-bg)", color: "var(--color-text-light)", borderColor: "var(--color-accent)" }}
                          />
                        </div>
                      )}
                      <Button
                        disabled={payoutSubmitting || (payoutForm.method === "LIGHTNING" ? !payoutForm.lightningAddress?.trim() : !payoutForm.btcAddress?.trim())}
                        onClick={async () => {
                          setPayoutSubmitting(true);
                          try {
                            const body = payoutForm.method === "LIGHTNING"
                              ? { method: "LIGHTNING", lightningAddress: payoutForm.lightningAddress.trim() }
                              : { method: "BITCOIN", btcAddress: payoutForm.btcAddress.trim() };
                            await api.post("/providers/me/payout-methods", body);
                            const res = await api.get("/providers/me");
                            const p = (res as any).provider;
                            if (p?.payoutMethods) setPayoutMethods(p.payoutMethods);
                            setSuccessMessage("Payout method added.");
                            setPayoutForm({ method: "LIGHTNING", lightningAddress: "", btcAddress: "" });
                            setTimeout(() => setSuccessMessage(""), 3000);
                          } catch (e) {
                            setErrors({ general: "Failed to add payout method" });
                          } finally {
                            setPayoutSubmitting(false);
                          }
                        }}
                        style={{ backgroundColor: "var(--color-accent)", color: "var(--color-primary-bg)" }}
                      >
                        {payoutSubmitting ? "Adding..." : "Add payout method"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card className="p-6 sm:p-8">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Notification Preferences
                </h2>
                <div className="space-y-6">
                  {Object.entries(notifications).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() =>
                          setNotifications((prev) => ({
                            ...prev,
                            [key]: !prev[key as keyof typeof prev],
                          }))
                        }
                        style={{ accentColor: "var(--color-accent)" }}
                        className="w-5 h-5 rounded"
                      />
                      <span
                        style={{ color: "var(--color-text-light)" }}
                        className="font-semibold"
                      >
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "change-password" && (
              <Card className="p-6 sm:p-8">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Security Settings
                </h2>
                <div className="space-y-6">
                  {["currentPassword", "newPassword", "confirmPassword"].map(
                    (field) => (
                      <div key={field}>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--color-text-light)" }}
                        >
                          {field.replace(/([A-Z])/g, " $1").trim()}
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={
                              securityData[field as keyof typeof securityData]
                            }
                            onChange={(e) =>
                              setSecurityData((prev) => ({
                                ...prev,
                                [field]: e.target.value,
                              }))
                            }
                            style={{
                              backgroundColor: "var(--color-primary-bg)",
                              color: "var(--color-text-light)",
                              borderColor: "var(--color-accent)",
                            }}
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition hover:opacity-80"
                            style={{ color: "var(--color-accent)" }}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  )}
                  <Button
                    onClick={handleChangePassword}
                    disabled={isSaving}
                    className="w-full"
                    style={{
                      backgroundColor: "var(--color-accent)",
                      color: "var(--color-primary-bg)",
                    }}
                  >
                    {isSaving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderSettings;
