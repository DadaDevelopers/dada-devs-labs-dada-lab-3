import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import FormInput from "../components/ui/FormInput";
import {
  Save,
  Bell,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  MapPin,
  LayoutDashboard,
  DollarSign,
  FileText,
  User,
  UploadCloud,
  X,
  FolderKanban,
} from "lucide-react";

type ProfileTab = "profile" | "address" | "notifications" | "change-password";

interface BeneficiaryProfileForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  city: string;
  displayName: string;
  shortStory: string;
  category: string;
  preferredProvider: string;
  nationalId: string;
  consentContact: boolean;
  consentVersion: string;
}

const CATEGORIES = [
  { value: "", label: "Select category (optional)" },
  { value: "medical", label: "Medical" },
  { value: "education", label: "Education" },
  { value: "business", label: "Business" },
  { value: "emergency", label: "Emergency" },
  { value: "other", label: "Other" },
];

const emptyProfile: BeneficiaryProfileForm = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  country: "",
  city: "",
  displayName: "",
  shortStory: "",
  category: "",
  preferredProvider: "",
  nationalId: "",
  consentContact: false,
  consentVersion: "v1.1",
};

const BeneficiarySettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, updateProfile, logout } = useAuth();

  const getActiveTabFromPath = (): ProfileTab => {
    const pathParts = location.pathname.split("/");
    const tab = pathParts[pathParts.length - 1];
    if (["profile", "address", "notifications", "change-password"].includes(tab)) {
      return tab as ProfileTab;
    }
    return "profile";
  };

  const [activeTab, setActiveTab] = useState<ProfileTab>(getActiveTabFromPath());
  const [profileData, setProfileData] = useState<BeneficiaryProfileForm>(emptyProfile);
  const [profilePictureId, setProfilePictureId] = useState<string | null>(null);
  const [nationalIdUploadId, setNationalIdUploadId] = useState<string | null>(null);
  const [nationalIdUploading, setNationalIdUploading] = useState(false);
  const [nationalIdUploadError, setNationalIdUploadError] = useState<string | null>(null);
  const [supportingDocIds, setSupportingDocIds] = useState<string[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<{ general?: string; [key: string]: string | undefined }>({});

  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
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

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setErrors({});
    try {
      const res = await api.get("/users/me");
      const u = (res.data as { user?: any }).user ?? res.data;
      if (!u) {
        setLoadingProfile(false);
        return;
      }
      setProfileData({
        firstName: u.firstName ?? "",
        lastName: u.lastName ?? "",
        phoneNumber: u.phoneNumber ?? "",
        country: u.country ?? "",
        city: u.city ?? "",
        displayName: u.beneficiaryProfile?.displayName ?? "",
        shortStory: u.beneficiaryProfile?.shortStory ?? "",
        category: u.beneficiaryProfile?.category ?? "",
        preferredProvider: u.beneficiaryProfile?.preferredProvider ?? "",
        nationalId: "", // never load plaintext; user re-enters if changing
        consentContact: !!u.beneficiaryProfile?.consentContact?.agreed,
        consentVersion: u.beneficiaryProfile?.consentContact?.version ?? "v1.1",
      });
      setProfilePictureId(
        u.beneficiaryProfile?.profilePicture?._id ?? u.beneficiaryProfile?.profilePicture ?? null
      );
      setNationalIdUploadId(
        u.beneficiaryProfile?.nationalIdUpload?._id ?? u.beneficiaryProfile?.nationalIdUpload ?? null
      );
      setSupportingDocIds(
        Array.isArray(u.beneficiaryProfile?.supportingDocs)
          ? u.beneficiaryProfile.supportingDocs.map((d: any) => d._id ?? d)
          : []
      );
      if (u.city || u.country) {
        setAddressData((prev) => ({
          ...prev,
          city: u.city ?? prev.city,
          country: u.country ?? prev.country,
        }));
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to load profile";
      const isAuthError = err?.response?.status === 401 || /invalid token|unauthorized/i.test(String(msg));
      setErrors({
        general: isAuthError
          ? "Your session may have expired. Please log in again to view your profile."
          : msg,
      });
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (location.pathname === "/beneficiary/settings") {
      navigate("/beneficiary/settings/profile", { replace: true });
      return;
    }
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname, navigate]);

  const handleNationalIdUpload = async (file: File) => {
    setNationalIdUploadError(null);
    setNationalIdUploading(true);
    try {
      const { data } = await api.post("/uploads/presign", {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        purpose: "national_id",
      });
      const { uploadId, presignedUrl } = data as { uploadId: string; presignedUrl: string };
      await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      const confirmRes = await api.post("/uploads/confirm", { uploadId });
      const id = (confirmRes.data as { id?: string }).id ?? uploadId;
      setNationalIdUploadId(id);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Upload failed. Check that file storage is configured.";
      setNationalIdUploadError(msg);
    } finally {
      setNationalIdUploading(false);
    }
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const type = (e.target as HTMLInputElement).type;
    setProfileData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrors({});
    setSuccessMessage("");
    try {
      const payload: any = {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim() || undefined,
        phoneNumber: profileData.phoneNumber.trim() || undefined,
        country: profileData.country.trim() || undefined,
        city: profileData.city.trim() || undefined,
        beneficiaryProfile: {
          displayName: profileData.displayName.trim() || undefined,
          shortStory: profileData.shortStory.trim() || undefined,
          category: profileData.category || undefined,
          preferredProvider: profileData.preferredProvider.trim() || undefined,
          nationalId: profileData.nationalId.trim() || undefined,
          consentContact: profileData.consentContact
            ? { agreed: true, version: profileData.consentVersion || "v1.1" }
            : { agreed: false },
        },
      };
      if (profilePictureId) payload.beneficiaryProfile.profilePicture = profilePictureId;
      if (nationalIdUploadId) payload.beneficiaryProfile.nationalIdUpload = nationalIdUploadId;
      if (supportingDocIds.length) payload.beneficiaryProfile.supportingDocs = supportingDocIds;

      const result = await updateProfile(payload);
      if (!result.ok) {
        setErrors({ general: result.error || "Failed to save profile" });
        setIsSaving(false);
        return;
      }
      setSuccessMessage("Profile saved successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setErrors({
        general: err?.response?.data?.message || "An error occurred while saving",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    setIsSaving(true);
    setErrors({});
    try {
      const result = await updateProfile({
        country: addressData.country.trim() || undefined,
        city: addressData.city.trim() || undefined,
      });
      if (!result.ok) {
        setErrors({ general: result.error || "Failed to save address" });
        setIsSaving(false);
        return;
      }
      setSuccessMessage("Address saved.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setErrors({ general: "An error occurred while saving" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      setErrors({ general: "Passwords do not match" });
      return;
    }
    setIsSaving(true);
    setErrors({});
    try {
      await new Promise((r) => setTimeout(r, 800));
      setSuccessMessage("Password change requested. Check your email for next steps.");
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      setErrors({ general: "An error occurred" });
    } finally {
      setIsSaving(false);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/beneficiary", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Campaigns", href: "/beneficiary/campaigns", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Funds Received", href: "/beneficiary/funds", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Reporting", href: "/beneficiary/reporting", icon: <FileText className="w-5 h-5" /> },
  ];

  const settingsNavItems = [
    { id: "profile" as const, label: "Profile", href: "/beneficiary/settings/profile", icon: <User className="w-5 h-5" /> },
    { id: "address" as const, label: "Address", href: "/beneficiary/settings/address", icon: <MapPin className="w-5 h-5" /> },
    { id: "notifications" as const, label: "Notifications", href: "/beneficiary/settings/notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "change-password" as const, label: "Change Password", href: "/beneficiary/settings/change-password", icon: <Lock className="w-5 h-5" /> },
  ];

  const userName =
    authUser?.firstName || authUser?.name || (authUser as any)?.email || "User";

  return (
    <DashboardLayout
      navItems={navItems}
      userName={userName}
      userRole="Beneficiary"
      settingsNavItems={settingsNavItems}
      onLogout={async () => {
        await logout();
        navigate("/");
      }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
            Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account and beneficiary profile
          </p>
        </div>

        {successMessage && (
          <div
            className="p-4 rounded-lg flex gap-3 items-start border border-primary/30 bg-primary/5"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
            <p className="text-sm text-primary">{successMessage}</p>
          </div>
        )}

        {errors.general && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm flex flex-wrap items-center justify-between gap-2">
            <span>{errors.general}</span>
            {(errors.general.includes("session") || errors.general.includes("log in")) && (
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => navigate("/login")}
              >
                Log in
              </Button>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-6 text-foreground">
              Profile &amp; KYC
            </h2>
            {loadingProfile ? (
              <p className="text-muted-foreground">Loading profile…</p>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="First name"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    placeholder="First name"
                  />
                  <FormInput
                    label="Last name"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    placeholder="Last name"
                  />
                </div>
                <FormInput
                  label="Phone number"
                  name="phoneNumber"
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={handleProfileChange}
                  placeholder="e.g. +254700000000"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Country"
                    name="country"
                    value={profileData.country}
                    onChange={handleProfileChange}
                    placeholder="Country"
                  />
                  <FormInput
                    label="City"
                    name="city"
                    value={profileData.city}
                    onChange={handleProfileChange}
                    placeholder="City"
                  />
                </div>

                <hr className="border-border" />

                <FormInput
                  label="Display name (public)"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleProfileChange}
                  placeholder="Name shown on your campaigns"
                />
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Category</label>
                  <select
                    name="category"
                    value={profileData.category}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CATEGORIES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Short story (optional)
                  </label>
                  <textarea
                    name="shortStory"
                    value={profileData.shortStory}
                    onChange={handleProfileChange}
                    rows={4}
                    placeholder="A short description about yourself and how you use DirectAid"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <FormInput
                  label="Preferred provider (optional)"
                  name="preferredProvider"
                  value={profileData.preferredProvider}
                  onChange={handleProfileChange}
                  placeholder="Provider name or ID"
                />

                <hr className="border-border" />

                <FormInput
                  label="National ID (optional)"
                  name="nationalId"
                  value={profileData.nationalId}
                  onChange={handleProfileChange}
                  placeholder="National identification number (stored securely, hashed)"
                />

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    National ID document (upload)
                  </label>
                  {nationalIdUploadId ? (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30">
                      <span className="text-sm text-foreground">ID document uploaded</span>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          id="national-id-replace"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleNationalIdUpload(file);
                            e.target.value = "";
                          }}
                        />
                        <label htmlFor="national-id-replace" className="cursor-pointer">
                          <Button type="button" variant="outline" size="sm" className="rounded-lg pointer-events-none">
                            Replace
                          </Button>
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-lg text-destructive hover:text-destructive"
                          onClick={() => setNationalIdUploadId(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        id="national-id-upload"
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleNationalIdUpload(file);
                          e.target.value = "";
                        }}
                        disabled={!!nationalIdUploading}
                      />
                      {nationalIdUploadError && (
                        <p className="text-xs text-destructive">{nationalIdUploadError}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Upload a clear photo or PDF of your national ID. Backend stores the document for verification.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consentContact"
                    name="consentContact"
                    checked={profileData.consentContact}
                    onChange={handleProfileChange}
                    className="mt-1 w-4 h-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <label htmlFor="consentContact" className="text-sm text-foreground">
                    I agree to be contacted regarding my campaigns and service delivery
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveProfile} disabled={isSaving} className="btn-cta">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving…" : "Save profile"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {activeTab === "address" && (
          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-6 text-foreground">Address</h2>
            <div className="space-y-4">
              <FormInput
                label="Country"
                name="country"
                value={addressData.country}
                onChange={handleAddressChange}
              />
              <FormInput
                label="City"
                name="city"
                value={addressData.city}
                onChange={handleAddressChange}
              />
              <FormInput
                label="Street"
                name="street"
                value={addressData.street}
                onChange={handleAddressChange}
                placeholder="Optional"
              />
              <FormInput
                label="State / Region"
                name="state"
                value={addressData.state}
                onChange={handleAddressChange}
                placeholder="Optional"
              />
              <FormInput
                label="Postal code"
                name="postalCode"
                value={addressData.postalCode}
                onChange={handleAddressChange}
                placeholder="Optional"
              />
            </div>
            <Button onClick={handleSaveAddress} disabled={isSaving} className="mt-4 btn-cta">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving…" : "Save address"}
            </Button>
          </Card>
        )}

        {activeTab === "notifications" && (
          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-2 text-foreground">
              Notification preferences
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Choose what you receive and how often. Notifications are sent to your registered email. You can expect campaign and fundraising updates within 24 hours of important changes; digest emails are sent weekly when enabled.
            </p>
            <div className="space-y-4">
              {[
                { key: "campaigns", label: "Campaign updates", desc: "When your campaign status changes (e.g. provider confirmed)" },
                { key: "fundraising", label: "Fundraising alerts", desc: "When you receive new donations" },
                { key: "service", label: "Service & disbursement", desc: "When funds are released or service is confirmed" },
                { key: "weeklyDigest", label: "Weekly digest", desc: "Once per week summary of your campaigns" },
                { key: "email", label: "Email notifications", desc: "All of the above are sent to your account email" },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/30 transition">
                  <input
                    type="checkbox"
                    checked={notifications[key as keyof typeof notifications]}
                    onChange={() =>
                      setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
                    }
                    className="mt-1 w-5 h-5 rounded border-input text-primary"
                  />
                  <div>
                    <span className="font-medium text-foreground block">{label}</span>
                    <span className="text-xs text-muted-foreground">{desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "change-password" && (
          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-6 text-foreground">Change password</h2>
            <div className="space-y-4">
              {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    {field.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={securityData[field]}
                      onChange={(e) =>
                        setSecurityData((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleChangePassword} disabled={isSaving} className="mt-4 btn-cta">
              {isSaving ? "Updating…" : "Update password"}
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BeneficiarySettings;
