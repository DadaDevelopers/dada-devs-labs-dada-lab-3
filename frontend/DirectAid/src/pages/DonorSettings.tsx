
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
  CreditCard,
  RotateCcw,
  Trash2,
} from "lucide-react";

const DonorSettings = () => {
  const navigate = useNavigate();
  const { logout } = useApp();
  const donor = mockDataService.getDonorUser();
  const [activeTab, setActiveTab] = useState<
    "profile" | "payment" | "notifications" | "security"
  >("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [profileData, setProfileData] = useState({
    firstName: donor.name.split(" ")[0],
    lastName: donor.name.split(" ")[1] || "",
    email: donor.email,
    phone: "+1 (555) 789-0123",
    company: "Tech Innovations Inc",
  });

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "Credit Card",
      last4: "4242",
      expiry: "12/25",
      isDefault: true,
    },
    {
      id: 2,
      type: "Debit Card",
      last4: "5555",
      expiry: "08/24",
      isDefault: false,
    },
  ]);

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: "",
    holderName: "",
    expiry: "",
    cvv: "",
  });

  const [notifications, setNotifications] = useState({
    donationConfirmation: true,
    impactUpdates: true,
    weeklyReport: true,
    campaignInvites: false,
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

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPaymentMethod((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.cardNumber || !newPaymentMethod.holderName) {
      alert("Please fill all payment fields");
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPaymentMethods((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: "Credit Card",
        last4: newPaymentMethod.cardNumber.slice(-4),
        expiry: newPaymentMethod.expiry,
        isDefault: false,
      },
    ]);
    setNewPaymentMethod({
      cardNumber: "",
      holderName: "",
      expiry: "",
      cvv: "",
    });
    setSuccessMessage("Payment method added successfully!");
    setIsSaving(false);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleRemovePaymentMethod = async (id: number) => {
    if (confirm("Are you sure you want to remove this payment method?")) {
      setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
      setSuccessMessage("Payment method removed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleSetDefaultPayment = (id: number) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
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
            onClick={() => navigate("/donor")}
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
                  { id: "payment", label: "Payment Methods" },
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
                  {["firstName", "lastName", "email", "phone", "company"].map(
                    (field) => (
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
                    )
                  )}
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

            {activeTab === "payment" && (
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
                  Payment Methods
                </h2>

                {/* Existing Payment Methods */}
                <div className="mb-8">
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    Your Payment Methods
                  </h3>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        style={{
                          backgroundColor: "var(--color-primary-bg)",
                          borderColor: method.isDefault
                            ? "var(--color-accent)"
                            : "rgba(255, 255, 255, 0.1)",
                        }}
                        className="border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <CreditCard
                            className="w-5 h-5"
                            style={{ color: "var(--color-accent)" }}
                          />
                          <div>
                            <p
                              className="font-semibold"
                              style={{ color: "var(--color-text-light)" }}
                            >
                              {method.type} •••• {method.last4}
                            </p>
                            <p
                              style={{
                                color: "var(--color-text-light)",
                                opacity: 0.7,
                              }}
                              className="text-sm"
                            >
                              Expires {method.expiry}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!method.isDefault && (
                            <Button
                              onClick={() => handleSetDefaultPayment(method.id)}
                              size="sm"
                              style={{
                                borderColor: "var(--color-accent)",
                                color: "var(--color-accent)",
                              }}
                              variant="outline"
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Default
                            </Button>
                          )}
                          {paymentMethods.length > 1 && (
                            <Button
                              onClick={() =>
                                handleRemovePaymentMethod(method.id)
                              }
                              size="sm"
                              style={{
                                borderColor: "rgba(255, 0, 0, 0.5)",
                                color: "rgba(255, 0, 0, 0.8)",
                              }}
                              variant="outline"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Payment Method */}
                <div
                  style={{
                    backgroundColor: "var(--color-primary-bg)",
                    borderColor: "var(--color-accent)",
                  }}
                  className="border rounded-lg p-6"
                >
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    Add New Payment Method
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--color-text-light)" }}
                      >
                        Card Number
                      </label>
                      <Input
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={newPaymentMethod.cardNumber}
                        onChange={handlePaymentChange}
                        style={{
                          backgroundColor: "var(--color-secondary-bg)",
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
                        Card Holder Name
                      </label>
                      <Input
                        name="holderName"
                        placeholder="John Doe"
                        value={newPaymentMethod.holderName}
                        onChange={handlePaymentChange}
                        style={{
                          backgroundColor: "var(--color-secondary-bg)",
                          color: "var(--color-text-light)",
                          borderColor: "var(--color-accent)",
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--color-text-light)" }}
                        >
                          Expiry Date
                        </label>
                        <Input
                          name="expiry"
                          placeholder="MM/YY"
                          value={newPaymentMethod.expiry}
                          onChange={handlePaymentChange}
                          style={{
                            backgroundColor: "var(--color-secondary-bg)",
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
                          CVV
                        </label>
                        <Input
                          name="cvv"
                          type="password"
                          placeholder="123"
                          value={newPaymentMethod.cvv}
                          onChange={handlePaymentChange}
                          style={{
                            backgroundColor: "var(--color-secondary-bg)",
                            color: "var(--color-text-light)",
                            borderColor: "var(--color-accent)",
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAddPaymentMethod}
                      disabled={isSaving}
                      className="w-full"
                      style={{
                        backgroundColor: "var(--color-accent)",
                        color: "var(--color-primary-bg)",
                      }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {isSaving ? "Adding..." : "Add Payment Method"}
                    </Button>
                  </div>
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

export default DonorSettings;
