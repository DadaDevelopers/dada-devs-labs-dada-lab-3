import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FormInput from "../components/ui/FormInput";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/card";
import { Building2, Landmark, Zap, FileText, UploadCloud } from "lucide-react";

type BackendRole = "DONOR" | "BENEFICIARY" | "PROVIDER";

interface Step2Data {
  phoneNumber: string;
  country: string;
  city: string;
  organization: string;
}

interface ProviderProfileData {
  organizationType: string;
  businessRegNumber: string;
  contactPerson: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  lightningPubkey: string;
  shortDescription: string;
  licenseDocs: File[];
}

interface FormErrors {
  role?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  organization?: string;
  general?: string;
  organizationType?: string;
}

const BENEFICIARY_STEP_COUNT = 2;
const PROVIDER_STEP_COUNT = 3;
const DONOR_STEP_COUNT = 2;

const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectRoleAndOnboard, updateProfile } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<BackendRole | null>(null);
  const [formData, setFormData] = useState<Step2Data>({
    phoneNumber: "",
    country: "",
    city: "",
    organization: "",
  });
  const [providerProfile, setProviderProfile] = useState<ProviderProfileData>({
    organizationType: "",
    businessRegNumber: "",
    contactPerson: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
    lightningPubkey: "",
    shortDescription: "",
    licenseDocs: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const licenseDocsRef = useRef<HTMLInputElement>(null);

  const stepCount =
    selectedRole === "BENEFICIARY"
      ? BENEFICIARY_STEP_COUNT
      : selectedRole === "PROVIDER"
        ? PROVIDER_STEP_COUNT
        : DONOR_STEP_COUNT;

  if (!user) {
    navigate("/login");
    return null;
  }

  // Already have a role — send to the right place (unchanged for beneficiary/donor; provider tuned to existing pattern)
  const effectiveRole = String(user?.role ?? "").trim().toUpperCase();
  if (effectiveRole && effectiveRole !== "UNASSIGNED") {
    if (effectiveRole === "PROVIDER") navigate("/provider/settings/profile", { replace: true });
    else if (effectiveRole === "BENEFICIARY") navigate("/beneficiary/settings/profile", { replace: true });
    else if (effectiveRole === "ADMIN") navigate("/admin", { replace: true });
    else navigate("/donor", { replace: true });
    return null;
  }

  const handleBasicNext = () => {
    const newErrors: FormErrors = {};
    if (!selectedRole) newErrors.role = "Please choose a role to continue.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setStep(2);
  };

  const handleStep2Next = () => {
    if (!validateStep2()) return;
    if (selectedRole === "PROVIDER") setStep(3);
    else handleSubmit();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const type = (e.target as HTMLInputElement).type;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required.";
    if (!formData.country.trim()) newErrors.country = "Country is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";
    if (selectedRole === "PROVIDER" && !formData.organization.trim()) {
      newErrors.organization = "Organization is required for providers.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      setErrors({ role: "Please choose a role to continue." });
      return;
    }
    if (!validateStep2()) return;

    setSubmitting(true);
    setErrors({});
    try {
      const result = await selectRoleAndOnboard({
        role: selectedRole,
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        city: formData.city,
        organization: selectedRole === "PROVIDER" ? formData.organization : undefined,
      });
      const roleAlreadySet = !result.ok && result.error === "Role already set";
      if (!result.ok && !roleAlreadySet) {
        setErrors({ general: result.error || "There was a problem saving your details. Please try again." });
        setSubmitting(false);
        return;
      }

      if (selectedRole === "PROVIDER" && step === 3) {
        const profileResult = await updateProfile({
          providerProfile: {
            organizationType: providerProfile.organizationType || undefined,
            businessRegNumber: providerProfile.businessRegNumber || undefined,
            contactPerson: providerProfile.contactPerson || undefined,
            bankAccountName: providerProfile.bankAccountName || undefined,
            bankAccountNumber: providerProfile.bankAccountNumber || undefined,
            bankName: providerProfile.bankName || undefined,
            lightningPubkey: providerProfile.lightningPubkey || undefined,
            shortDescription: providerProfile.shortDescription || undefined,
          },
        });
        if (!profileResult.ok) {
          setErrors({
            general:
              profileResult.error ||
              "Role saved but we could not save your organization details. You can update them in settings.",
          });
          setSubmitting(false);
          return;
        }
      }

      const finalRole = result.user?.role ?? (roleAlreadySet ? selectedRole : null);
      // Beneficiary and donor: unchanged (profile and donor dashboard). Provider only: tuned to existing pattern → profile.
      const to =
        finalRole === "PROVIDER"
          ? "/provider/settings/profile"
          : finalRole === "BENEFICIARY"
            ? "/beneficiary/settings/profile"
            : "/donor";
      requestAnimationFrame(() => navigate(to));
    } catch (e) {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProviderChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProviderProfile((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProviderProfile((prev) => ({ ...prev, licenseDocs: [...prev.licenseDocs, ...files] }));
  };

  const removeFile = (index: number) => {
    setProviderProfile((prev) => ({
      ...prev,
      licenseDocs: prev.licenseDocs.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-bg)] flex items-center justify-center px-4 py-12">
      <div className={`w-full ${step === 3 && selectedRole === "PROVIDER" ? "max-w-4xl" : "max-w-3xl"}`}>
        <div className="mb-6 text-center">
          <p className="text-sm text-white/60 mb-2" aria-live="polite">
            Step {step} of {stepCount}
          </p>
          <h1 className="text-3xl font-bold text-[var(--color-text-light)] mb-2">
            Complete your DirectAid profile
          </h1>
          <p className="text-white/60">
            {step === 1 && "This helps us personalize your experience and keep everyone safe."}
            {step === 2 &&
              (selectedRole === "BENEFICIARY"
                ? "Contact and identity details. Your story will be added when you create a campaign."
                : "We use this information to verify accounts and route funds safely.")}
            {step === 3 && "Tell us more about your organization. You can update this later in settings."}
          </p>
        </div>

        <div className="bg-[var(--color-secondary-bg)] rounded-lg shadow-xl p-8 border border-white/10">
          {errors.general && (
            <div
              className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4"
              role="alert"
            >
              {errors.general}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-light)]">
                Choose how you will use DirectAid
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="group" aria-label="Select your role">
                {[
                  {
                    id: "DONOR" as BackendRole,
                    title: "Donor",
                    description: "Support campaigns and people in need.",
                  },
                  {
                    id: "BENEFICIARY" as BackendRole,
                    title: "Beneficiary",
                    description: "Receive help for medical bills, school fees, or emergencies.",
                  },
                  {
                    id: "PROVIDER" as BackendRole,
                    title: "Provider",
                    description: "Hospitals, schools, or vendors that deliver services.",
                  },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(option.id);
                      if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
                    }}
                    className={`text-left p-4 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-secondary-bg)] ${
                      selectedRole === option.id
                        ? "border-[var(--color-accent)] bg-[var(--color-primary-bg)]"
                        : "border-white/10 bg-[#151D2C] hover:border-[var(--color-accent)]/60"
                    }`}
                    aria-pressed={selectedRole === option.id}
                  >
                    <h3 className="text-[var(--color-text-light)] font-semibold mb-1">{option.title}</h3>
                    <p className="text-sm text-white/60">{option.description}</p>
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="text-sm text-red-400" role="alert">
                  {errors.role}
                </p>
              )}
              <div className="flex justify-end mt-4">
                <Button variant="secondary" size="sm" onClick={handleBasicNext}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-light)]">
                {selectedRole === "BENEFICIARY"
                  ? "Contact details"
                  : "Basic contact details"}
              </h2>
              <p className="text-sm text-white/60">
                {selectedRole === "BENEFICIARY"
                  ? "We need this to verify your account. You’ll complete your profile (including ID) on the next page."
                  : "We use this information to verify accounts and route funds safely."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Phone Number"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  error={errors.phoneNumber}
                  required
                  placeholder="e.g. +254700000000"
                  autoComplete="tel"
                />
                <FormInput
                  label="Country"
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  error={errors.country}
                  required
                  placeholder="Country"
                  autoComplete="country-name"
                />
                <FormInput
                  label="City"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                  required
                  placeholder="City"
                  autoComplete="address-level2"
                />
              </div>

              {selectedRole === "PROVIDER" && (
                <FormInput
                  label="Organization Name"
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  error={errors.organization}
                  required
                  placeholder="Hospital, school, pharmacy, or business name"
                />
              )}

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={submitting}
                  onClick={selectedRole === "PROVIDER" ? handleStep2Next : handleSubmit}
                >
                  {selectedRole === "DONOR" ? (submitting ? "Saving…" : "Finish") : "Next"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && selectedRole === "PROVIDER" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-light)]">
                  Organization profile
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  Complete your provider profile. You can update any of this later in Settings → Profile.
                </p>
              </div>

              <Card className="p-6 bg-[#151D2C]/50 border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-lg font-medium text-[var(--color-text-light)]">Organization details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                      Organization Type
                    </label>
                    <select
                      name="organizationType"
                      value={providerProfile.organizationType}
                      onChange={handleProviderChange}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-primary-bg)] border border-white/20 text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    >
                      <option value="">Select type (optional)</option>
                      <option value="hospital">Hospital</option>
                      <option value="school">School</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="vendor">Vendor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <FormInput
                    label="Business Registration Number (optional)"
                    type="text"
                    name="businessRegNumber"
                    value={providerProfile.businessRegNumber}
                    onChange={handleProviderChange}
                    placeholder="CAC / Business registration number"
                  />
                  <FormInput
                    label="Primary Contact Person (optional)"
                    type="text"
                    name="contactPerson"
                    value={providerProfile.contactPerson}
                    onChange={handleProviderChange}
                    placeholder="Contact person's name"
                  />
                </div>
              </Card>

              <Card className="p-6 bg-[#151D2C]/50 border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Landmark className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-lg font-medium text-[var(--color-text-light)]">Banking (optional)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Bank Account Name"
                    type="text"
                    name="bankAccountName"
                    value={providerProfile.bankAccountName}
                    onChange={handleProviderChange}
                    placeholder="Account name"
                  />
                  <FormInput
                    label="Bank Account Number"
                    type="text"
                    name="bankAccountNumber"
                    value={providerProfile.bankAccountNumber}
                    onChange={handleProviderChange}
                    placeholder="Account number"
                  />
                  <FormInput
                    label="Bank Name"
                    type="text"
                    name="bankName"
                    value={providerProfile.bankName}
                    onChange={handleProviderChange}
                    placeholder="Bank name"
                    className="md:col-span-2"
                  />
                </div>
              </Card>

              <Card className="p-6 bg-[#151D2C]/50 border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-lg font-medium text-[var(--color-text-light)]">Lightning / Bitcoin</h3>
                </div>
                <FormInput
                  label="Lightning Pubkey or Wallet Address (optional)"
                  type="text"
                  name="lightningPubkey"
                  value={providerProfile.lightningPubkey}
                  onChange={handleProviderChange}
                  placeholder="For receiving Bitcoin payments"
                />
              </Card>

              <Card className="p-6 bg-[#151D2C]/50 border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-lg font-medium text-[var(--color-text-light)]">About your organization</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                    Short description (optional)
                  </label>
                  <textarea
                    name="shortDescription"
                    value={providerProfile.shortDescription}
                    onChange={handleProviderChange}
                    rows={4}
                    placeholder="A short description about your organization and how you help beneficiaries..."
                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-primary-bg)] border border-white/20 text-[var(--color-text-light)] placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                  />
                </div>
              </Card>

              <Card className="p-6 bg-[#151D2C]/50 border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <UploadCloud className="w-5 h-5 text-[var(--color-accent)]" />
                  <h3 className="text-lg font-medium text-[var(--color-text-light)]">License / proof of business</h3>
                </div>
                <p className="text-sm text-white/60 mb-4">
                  PDF or image. You can upload later in Settings if you prefer.
                </p>
                <input
                  ref={licenseDocsRef}
                  type="file"
                  accept=".pdf,image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload license documents"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => licenseDocsRef.current?.click()}
                  className="gap-2"
                >
                  <UploadCloud className="w-4 h-4" /> Choose files
                </Button>
                {providerProfile.licenseDocs.length > 0 && (
                  <ul className="space-y-2 mt-4">
                    {providerProfile.licenseDocs.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-primary-bg)] border border-white/10"
                      >
                        <span className="text-sm text-white/80 truncate flex-1">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-300 text-sm ml-2 font-medium"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? "Saving…" : "Continue to profile"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
