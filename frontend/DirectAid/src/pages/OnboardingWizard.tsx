import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FormInput from "../components/ui/FormInput";
import { Button } from "../components/ui/Button";

type BackendRole = "DONOR" | "BENEFICIARY" | "PROVIDER";

interface Step2Data {
  phoneNumber: string;
  country: string;
  city: string;
  organization: string;
}

interface BeneficiaryProfileData {
  nationalId: string;
  shortStory: string;
  category: "medical" | "education" | "business" | "emergency" | "other" | "";
  consentContact: boolean;
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
  // Step 3 errors
  category?: string;
  shortStory?: string;
  organizationType?: string;
}

const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectRoleAndOnboard } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<BackendRole | null>(null);
  const [formData, setFormData] = useState<Step2Data>({
    phoneNumber: "",
    country: "",
    city: "",
    organization: "",
  });
  const [beneficiaryProfile, setBeneficiaryProfile] = useState<BeneficiaryProfileData>({
    nationalId: "",
    shortStory: "",
    category: "",
    consentContact: false,
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
  const [savingProfile, setSavingProfile] = useState(false);

  // File input refs
  const licenseDocsRef = useRef<HTMLInputElement>(null);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleBasicNext = () => {
    const newErrors: FormErrors = {};
    if (!selectedRole) {
      newErrors.role = "Please choose a role to continue.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep(2);
    }
  };

  const handleStep2Next = () => {
    if (!validateStep2()) return;
    // Only show Step 3 for BENEFICIARY and PROVIDER (Donors can skip)
    if (selectedRole === "BENEFICIARY" || selectedRole === "PROVIDER") {
      setStep(3);
    } else {
      // Skip directly to finish for Donors
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep2 = () => {
    const newErrors: FormErrors = {};
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required.";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }
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
      if (!result.ok) {
        setErrors({
          general:
            result.error ||
            "There was a problem saving your onboarding details. Please try again.",
        });
        setSubmitting(false);
        return;
      }

      // If we're on Step 3, save profile data (for now just store locally, backend integration later)
      if (step === 3) {
        await handleSaveProfile();
      }

      const finalRole = result.user?.role;
      if (finalRole === "PROVIDER") navigate("/provider");
      else if (finalRole === "BENEFICIARY") navigate("/beneficiary");
      else navigate("/donor");
    } catch (e) {
      setErrors({
        general:
          "There was a problem saving your onboarding details. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveProfile = async () => {
    // TODO: When backend is ready, call PUT /user/me with profile data
    // For now, just store in localStorage or state for later submission
    setSavingProfile(true);
    try {
      const profileData: any = {};
      
      if (selectedRole === "BENEFICIARY") {
        profileData.beneficiaryProfile = {
          nationalId: beneficiaryProfile.nationalId || null,
          shortStory: beneficiaryProfile.shortStory || null,
          category: beneficiaryProfile.category || null,
          consentContact: beneficiaryProfile.consentContact,
        };
      } else if (selectedRole === "PROVIDER") {
        profileData.providerProfile = {
          organizationType: providerProfile.organizationType || null,
          businessRegNumber: providerProfile.businessRegNumber || null,
          contactPerson: providerProfile.contactPerson || null,
          bankAccountName: providerProfile.bankAccountName || null,
          bankAccountNumber: providerProfile.bankAccountNumber || null,
          bankName: providerProfile.bankName || null,
          lightningPubkey: providerProfile.lightningPubkey || null,
          shortDescription: providerProfile.shortDescription || null,
          licenseDocs: [], // Will be populated after file uploads
        };
      }

      // Store temporarily (backend integration pending)
      localStorage.setItem(`pending_profile_${user?.id}`, JSON.stringify(profileData));
      
      // TODO: Uncomment when backend endpoint is ready
      // const res = await api.put("/user/me", profileData);
      // if (!res.ok) throw new Error("Failed to save profile");
    } catch (e) {
      console.warn("Profile data saved locally. Backend integration pending.", e);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleBeneficiaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const type = (e.target as HTMLInputElement).type;
    
    setBeneficiaryProfile(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setProviderProfile(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProviderProfile(prev => ({
      ...prev,
      licenseDocs: [...prev.licenseDocs, ...files],
    }));
  };

  const removeFile = (index: number) => {
    setProviderProfile(prev => ({
      ...prev,
      licenseDocs: prev.licenseDocs.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="mb-6 text-center">
          <p className="text-sm text-white/60 mb-2">
            Step {step} of {selectedRole === "DONOR" ? 2 : 3}
          </p>
          <h1 className="text-3xl font-bold text-[var(--color-text-light)] mb-2">
            Complete your DirectAid profile
          </h1>
          <p className="text-white/60">
            {step === 1 && "This helps us personalize your experience and keep everyone safe."}
            {step === 2 && "We use this information to verify accounts and route funds safely."}
            {step === 3 && "Tell us more about yourself to help us match you with the right opportunities."}
          </p>
        </div>

        <div className="bg-[var(--color-secondary-bg)] rounded-lg shadow-xl p-8 border border-white/10">
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
              {errors.general}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-light)]">
                Choose how you will use DirectAid
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                ].map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(option.id);
                      if (errors.role) {
                        setErrors(prev => ({ ...prev, role: undefined }));
                      }
                    }}
                    className={`text-left p-4 rounded-lg border transition ${
                      selectedRole === option.id
                        ? "border-[var(--color-accent)] bg-[var(--color-primary-bg)]"
                        : "border-white/10 bg-[#151D2C] hover:border-[var(--color-accent)]/60"
                    }`}
                  >
                    <h3 className="text-[var(--color-text-light)] font-semibold mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-white/60">
                      {option.description}
                    </p>
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
                Basic contact details
              </h2>
              <p className="text-sm text-white/60">
                We use this information to verify accounts and route funds safely.
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
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                />

                <div className="space-y-4">
                  <FormInput
                    label="Country"
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    error={errors.country}
                    required
                    placeholder="Country"
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
                  />
                </div>
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

              <div className="flex items-center justify-between mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={submitting}
                  onClick={handleStep2Next}
                >
                  {selectedRole === "DONOR" ? (submitting ? "Saving..." : "Finish") : "Next"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-light)]">
                Additional profile details
              </h2>
              <p className="text-sm text-white/60">
                Tell us more about yourself. All fields are optional and can be updated later.
              </p>

              {selectedRole === "BENEFICIARY" && (
                <div className="space-y-6">
                  <FormInput
                    label="National ID (Optional)"
                    type="text"
                    name="nationalId"
                    value={beneficiaryProfile.nationalId}
                    onChange={handleBeneficiaryChange}
                    placeholder="Your national identification number"
                  />

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={beneficiaryProfile.category}
                      onChange={handleBeneficiaryChange}
                      className="w-full px-4 py-3 rounded-lg bg-[#151D2C] border border-white/20 text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    >
                      <option value="">Select a category (optional)</option>
                      <option value="medical">Medical</option>
                      <option value="education">Education</option>
                      <option value="business">Business</option>
                      <option value="emergency">Emergency</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                      Short Story / Description
                    </label>
                    <textarea
                      name="shortStory"
                      value={beneficiaryProfile.shortStory}
                      onChange={handleBeneficiaryChange}
                      rows={4}
                      placeholder="Tell us about your situation and how DirectAid can help..."
                      className="w-full px-4 py-3 rounded-lg bg-[#151D2C] border border-white/20 text-[var(--color-text-light)] placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="consentContact"
                      name="consentContact"
                      checked={beneficiaryProfile.consentContact}
                      onChange={handleBeneficiaryChange}
                      className="w-4 h-4 rounded border-white/20 bg-[#151D2C] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                    <label
                      htmlFor="consentContact"
                      className="text-sm text-[var(--color-text-light)]"
                    >
                      I agree to be contacted regarding my request
                    </label>
                  </div>
                </div>
              )}

              {selectedRole === "PROVIDER" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                      Organization Type
                    </label>
                    <select
                      name="organizationType"
                      value={providerProfile.organizationType}
                      onChange={handleProviderChange}
                      className="w-full px-4 py-3 rounded-lg bg-[#151D2C] border border-white/20 text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    >
                      <option value="">Select organization type (optional)</option>
                      <option value="hospital">Hospital</option>
                      <option value="school">School</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="vendor">Vendor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <FormInput
                    label="Business Registration Number (Optional)"
                    type="text"
                    name="businessRegNumber"
                    value={providerProfile.businessRegNumber}
                    onChange={handleProviderChange}
                    placeholder="CAC / Business registration number"
                  />

                  <FormInput
                    label="Primary Contact Person (Optional)"
                    type="text"
                    name="contactPerson"
                    value={providerProfile.contactPerson}
                    onChange={handleProviderChange}
                    placeholder="Contact person's name"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Bank Account Name (Optional)"
                      type="text"
                      name="bankAccountName"
                      value={providerProfile.bankAccountName}
                      onChange={handleProviderChange}
                      placeholder="Account name"
                    />
                    <FormInput
                      label="Bank Account Number (Optional)"
                      type="text"
                      name="bankAccountNumber"
                      value={providerProfile.bankAccountNumber}
                      onChange={handleProviderChange}
                      placeholder="Account number"
                    />
                    <FormInput
                      label="Bank Name (Optional)"
                      type="text"
                      name="bankName"
                      value={providerProfile.bankName}
                      onChange={handleProviderChange}
                      placeholder="Bank name"
                      className="md:col-span-2"
                    />
                  </div>

                  <FormInput
                    label="Lightning Pubkey / Wallet Address (Optional)"
                    type="text"
                    name="lightningPubkey"
                    value={providerProfile.lightningPubkey}
                    onChange={handleProviderChange}
                    placeholder="Lightning pubkey or wallet address"
                  />

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                      Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      value={providerProfile.shortDescription}
                      onChange={handleProviderChange}
                      rows={4}
                      placeholder="A short description about your organization..."
                      className="w-full px-4 py-3 rounded-lg bg-[#151D2C] border border-white/20 text-[var(--color-text-light)] placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                      Upload License / Proof of Business (Optional)
                    </label>
                    <p className="text-xs text-white/60 mb-3">
                      Upload business license, registration documents, or proof of business (PDF, PNG, JPG)
                    </p>
                    <input
                      ref={licenseDocsRef}
                      type="file"
                      accept=".pdf,image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => licenseDocsRef.current?.click()}
                      className="mb-3"
                    >
                      Choose Files
                    </Button>
                    {providerProfile.licenseDocs.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {providerProfile.licenseDocs.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-[#151D2C] rounded border border-white/10"
                          >
                            <span className="text-sm text-white/80 truncate flex-1">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300 text-sm ml-2"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSubmit}
                    disabled={submitting || savingProfile}
                  >
                    Skip for now
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={submitting || savingProfile}
                    onClick={handleSubmit}
                  >
                    {submitting || savingProfile ? "Saving..." : "Finish"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;

