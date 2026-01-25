import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Eye,
  EyeOff,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  LayoutDashboard,
  DollarSign,
  FileText,
  User,
} from "lucide-react";

const BeneficiarySettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateProfile, logout } = useAuth();
  const beneficiary = mockDataService.getBeneficiaryUser();
  
  // Get active tab from pathname, default to "profile"
  const getActiveTabFromPath = () => {
    const pathParts = location.pathname.split("/");
    const tab = pathParts[pathParts.length - 1];
    if (["profile", "address", "notifications", "change-password"].includes(tab)) {
      return tab as "profile" | "address" | "notifications" | "change-password";
    }
    return "profile";
  };
  
  const [activeTab, setActiveTab] = useState<
    "profile" | "address" | "notifications" | "change-password"
  >(getActiveTabFromPath());
  
  // Sync with URL changes and redirect if needed
  useEffect(() => {
    // If we're at /beneficiary/settings (without a tab), redirect to profile
    if (location.pathname === "/beneficiary/settings") {
      navigate("/beneficiary/settings/profile", { replace: true });
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
    firstName: beneficiary.name.split(" ")[0],
    lastName: beneficiary.name.split(" ")[1] || "",
    email: beneficiary.email,
    phone: "+1 (555) 246-8135",
    dateOfBirth: "1990-01-15",
    nationalId: "ABC123456789",
  });

  const [addressData, setAddressData] = useState({
    street: "123 Main Street",
    city: "Cairo",
    state: "Cairo Governorate",
    postalCode: "11511",
    country: "Egypt",
  });

  const [notifications, setNotifications] = useState({
    campaigns: true,
    fundraising: true,
    service: true,
    weeklyDigest: true,
    email: true,
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});
    try {
      // Call backend API to update profile
      const result = await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phone,
        country: addressData.country,
        city: addressData.city,
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
  ];

  const settingsNavItems = [
    { id: "profile", label: "Profile", href: "/beneficiary/settings/profile", icon: <User className="w-5 h-5" /> },
    { id: "address", label: "Address", href: "/beneficiary/settings/address", icon: <MapPin className="w-5 h-5" /> },
    { id: "notifications", label: "Notifications", href: "/beneficiary/settings/notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "change-password", label: "Change Password", href: "/beneficiary/settings/change-password", icon: <Lock className="w-5 h-5" /> },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      userName={beneficiary.name}
      userRole="Beneficiary"
      settingsNavItems={settingsNavItems}
      onLogout={async () => {
        await logout();
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

        {errors.general && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        {/* Main Content */}
        <div>
          {activeTab === "profile" && (
            <Card className="p-6 sm:p-8">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Personal Information
                </h2>
                <div className="space-y-6">
                  {[
                    "firstName",
                    "lastName",
                    "email",
                    "phone",
                    "dateOfBirth",
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
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      National ID (Read-only)
                    </label>
                    <Input
                      value={profileData.nationalId}
                      disabled
                      style={{
                        backgroundColor: "var(--color-primary-bg)",
                        color: "var(--color-text-light)",
                        borderColor: "var(--color-accent)",
                        opacity: 0.6,
                      }}
                    />
                  </div>
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

          {activeTab === "address" && (
            <Card className="p-6 sm:p-8">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Address
                </h2>
                <div className="space-y-6">
                  {Object.entries(addressData).map(([key, value]) => (
                    <div key={key}>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--color-text-light)" }}
                      >
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <Input
                        name={key}
                        value={value}
                        onChange={handleAddressChange}
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
                    {isSaving ? "Saving..." : "Save Address"}
                  </Button>
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
    </DashboardLayout>
  );
};

export default BeneficiarySettings;
