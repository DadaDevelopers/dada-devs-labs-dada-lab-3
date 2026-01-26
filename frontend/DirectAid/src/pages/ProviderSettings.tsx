import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { mockDataService } from "../services/mockData";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Save,
  Bell,
  Lock,
  CreditCard,
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
  const { updateProfile } = useAuth();
  const provider = mockDataService.getProviderUser();
  
  // Get active tab from pathname, default to "profile"
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
  
  // Sync with URL changes and redirect if needed
  useEffect(() => {
    // If we're at /provider/settings (without a tab), redirect to profile
    if (location.pathname === "/provider/settings") {
      navigate("/provider/settings/profile", { replace: true });
      return;
    }
    const tab = getActiveTabFromPath();
    setActiveTab(tab);
  }, [location.pathname, navigate]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<{ general?: string }>({});

  const [profileData, setProfileData] = useState({
    organizationName: provider.name,
    contactPerson: "Ahmed Hassan",
    type: "NGO",
    email: provider.email,
    phone: "+1 (555) 246-8135",
    website: "https://example.org",
  });

  const [payoutData, setPayoutData] = useState({
    bankName: "Global Bank",
    accountHolder: "Organization Name",
    accountNumber: "****1234",
    swiftCode: "GBUSUS33",
  });

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
      // Call backend API to update profile
      const result = await updateProfile({
        firstName: profileData.organizationName.split(" ")[0] || profileData.organizationName,
        lastName: profileData.organizationName.split(" ").slice(1).join(" ") || "",
        phoneNumber: profileData.phone,
        // Note: country and city would need to be added to form if available
      });
      
      if (!result.ok) {
        setErrors({ general: result.error || "Failed to save profile" });
        setIsSaving(false);
        return;
      }
      
      setSuccessMessage("Saved successfully!");
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrors({ general: "An error occurred while saving" });
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

  return (
    <DashboardLayout
      navItems={navItems}
      userName={provider.name}
      userRole="Aid Provider"
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
              <Card className="p-6 sm:p-8">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Provider Profile
                </h2>
                <div className="space-y-6">
                  {[
                    "organizationName",
                    "contactPerson",
                    "type",
                    "email",
                    "phone",
                    "website",
                  ].map((field) => (
                    <div key={field}>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--color-text-light)" }}
                      >
                        {field.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <Input
                        name={field}
                        value={profileData[field as keyof typeof profileData]}
                        onChange={handleProfileChange}
                        style={{
                          backgroundColor: "var(--color-primary-bg)",
                          color: "var(--color-text-light)",
                          borderColor: "var(--color-accent)",
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full"
                    style={{
                      backgroundColor: "var(--color-accent)",
                      color: "var(--color-primary-bg)",
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Card>
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
                  {Object.entries(payoutData).map(([key, value]) => (
                    <div key={key}>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--color-text-light)" }}
                      >
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <Input
                        value={value}
                        disabled
                        style={{
                          backgroundColor: "var(--color-primary-bg)",
                          color: "var(--color-text-light)",
                          borderColor: "var(--color-accent)",
                          opacity: 0.6,
                        }}
                      />
                    </div>
                  ))}
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
                            [key]: !prev[key],
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
