import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { mockDataService } from "../services/mockData";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import {
  ArrowLeft,
  Save,
  Bell,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

const BeneficiarySettings = () => {
  const navigate = useNavigate();
  const { logout } = useApp();
  const beneficiary = mockDataService.getBeneficiaryUser();
  const [activeTab, setActiveTab] = useState<
    "profile" | "address" | "notifications" | "security"
  >("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccessMessage("Saved successfully!");
    setIsSaving(false);
    setTimeout(() => setSuccessMessage(""), 3000);
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-primary-bg)" }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "var(--color-secondary-bg)",
          borderBottomColor: "var(--color-accent)",
        }}
        className="border-b sticky top-0 z-10"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/beneficiary")}
            className="flex items-center gap-2 font-medium mb-4 transition hover:opacity-80"
            style={{ color: "var(--color-accent)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--color-text-light)" }}
          >
            Settings
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <div
            style={{
              backgroundColor: "rgba(0, 255, 255, 0.1)",
              borderColor: "var(--color-accent)",
            }}
            className="mb-6 p-4 rounded-lg flex gap-3 items-start border"
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div
              style={{
                backgroundColor: "var(--color-secondary-bg)",
                borderColor: "var(--color-accent)",
              }}
              className="rounded-lg border overflow-hidden sticky top-24 card-elevated"
            >
              <nav className="space-y-1">
                {[
                  { id: "profile", label: "Profile" },
                  { id: "address", label: "Address" },
                  { id: "notifications", label: "Notifications" },
                  { id: "security", label: "Security" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className="w-full px-4 py-3 text-left font-medium transition"
                    style={{
                      backgroundColor:
                        activeTab === tab.id
                          ? "var(--color-accent)"
                          : "transparent",
                      color:
                        activeTab === tab.id
                          ? "var(--color-primary-bg)"
                          : "var(--color-text-light)",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
              <div
                style={{
                  backgroundColor: "var(--color-primary-bg)",
                  borderTopColor: "var(--color-accent)",
                }}
                className="border-t p-4"
              >
                <Button
                  onClick={handleLogout}
                  className="w-full"
                  style={{ borderColor: "var(--color-accent)" }}
                  variant="outline"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div
                style={{
                  backgroundColor: "var(--color-secondary-bg)",
                  borderColor: "var(--color-accent)",
                }}
                className="rounded-lg border p-8 card-elevated"
              >
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
              </div>
            )}

            {activeTab === "address" && (
              <div
                style={{
                  backgroundColor: "var(--color-secondary-bg)",
                  borderColor: "var(--color-accent)",
                }}
                className="rounded-lg border p-8 card-elevated"
              >
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
              </div>
            )}

            {activeTab === "notifications" && (
              <div
                style={{
                  backgroundColor: "var(--color-secondary-bg)",
                  borderColor: "var(--color-accent)",
                }}
                className="rounded-lg border p-8 card-elevated"
              >
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
              </div>
            )}

            {activeTab === "security" && (
              <div
                style={{
                  backgroundColor: "var(--color-secondary-bg)",
                  borderColor: "var(--color-accent)",
                }}
                className="rounded-lg border p-8 card-elevated"
              >
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiarySettings;
