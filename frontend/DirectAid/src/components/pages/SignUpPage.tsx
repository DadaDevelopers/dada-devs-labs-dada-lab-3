import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../ui/FormInput";
import Button from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";

type UserRole = "provider" | "beneficiary" | "donor" | "ngo";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  organization: string;
  role: UserRole;
  // Provider-specific
  organizationType?: string;
  businessRegNumber?: string;
  contactPerson?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  lightningPubkey?: string;
  shortDescription?: string;
  // Beneficiary-specific
  nationalId?: string;
  shortStory?: string;
  category?: string;
  preferredProvider?: string;
  acceptTerms?: boolean;
  // File uploads
  licenseFile?: File | null;
  supportingDocs?: File | null;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  address?: string;
  organization?: string;
  role?: string;
  general?: string;
}

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    organization: "",
    role: "beneficiary",
    acceptTerms: false,
    licenseFile: null,
    supportingDocs: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.country?.trim()) {
      newErrors.address = "Country is required";
    }

    if (formData.role === "provider" && !formData.organization.trim()) {
      newErrors.organization = "Organization name is required for providers";
    }

    if (!formData.acceptTerms) {
      newErrors.general =
        "You must accept the terms and conditions to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files && files.length > 0 ? files[0] : null,
    }));
  };

  const licenseInputRef = useRef<HTMLInputElement | null>(null);
  const supportingInputRef = useRef<HTMLInputElement | null>(null);

  const triggerLicensePicker = () => licenseInputRef.current?.click();
  const triggerSupportingPicker = () => supportingInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Use auth context to signup
      const result = await signup({ ...formData });

      if (!result.ok) {
        setErrors({
          general:
            result.error ||
            "An error occurred during signup. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }

      // Signup successful - navigate to appropriate dashboard based on role
      const role = formData.role || "donor";
      if (role === "provider") navigate("/providerdashboard");
      else if (role === "beneficiary") navigate("/userdashboard");
      else navigate("/donordashboard");
    } catch {
      setErrors({
        general: "An error occurred during signup. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (
    password: string
  ): { strength: string; color: string } => {
    if (password.length === 0) return { strength: "", color: "" };
    if (password.length < 8) return { strength: "Weak", color: "text-red-500" };
    if (password.length < 12)
      return { strength: "Medium", color: "text-yellow-500" };
    return { strength: "Strong", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-[var(--color-primary-bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-light)] mb-2">
            Create Your Account
          </h1>
          <p className="text-white/60">Join DirectAid and make a difference</p>
        </div>

        <div className="bg-[var(--color-secondary-bg)] rounded-lg shadow-xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Role Selection */}
            <div className="w-full">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-[var(--color-text-light)] mb-2"
              >
                I am a <span className="text-[var(--color-accent)]">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`
                  w-full px-4 py-3 rounded-lg
                  bg-[#151D2C] border
                  text-[var(--color-text-light)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent
                  transition duration-300
                  ${errors.role ? "border-red-500" : "border-white/20"}
                `}
                aria-invalid={errors.role ? "true" : "false"}
              >
                <option value="beneficiary">Beneficiary</option>
                <option value="provider">Provider</option>
                <option value="donor">Donor</option>
              </select>
              {errors.role && (
                <p className="mt-2 text-sm text-red-500" role="alert">
                  {errors.role}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                placeholder="Enter your full name"
                autoComplete="name"
              />

              <FormInput
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormInput
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                {formData.password && (
                  <p className={`mt-1 text-xs ${passwordStrength.color}`}>
                    Password strength: {passwordStrength.strength}
                  </p>
                )}
              </div>

              <FormInput
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
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
                  error={errors.address}
                  required
                  placeholder="Country"
                />

                <FormInput
                  label="City"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.address}
                  required
                  placeholder="City"
                />
              </div>
            </div>

            <FormInput
              label={
                formData.role === "provider"
                  ? "Organization Name"
                  : "Organization (Optional)"
              }
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              error={errors.organization}
              required={formData.role === "provider"}
              placeholder="Enter organization name"
            />

            {/* Provider-specific fields */}
            {formData.role === "provider" && (
              <div className="space-y-4 mt-4">
                <FormInput
                  label="Organization Type"
                  type="text"
                  name="organizationType"
                  value={formData.organizationType || ""}
                  onChange={handleChange}
                  placeholder="Hospital | School | Pharmacy | Vendor | NGO"
                />

                <FormInput
                  label="Business Registration Number (optional)"
                  type="text"
                  name="businessRegNumber"
                  value={formData.businessRegNumber || ""}
                  onChange={handleChange}
                  placeholder="CAC / Business registration no."
                />

                <FormInput
                  label="Primary Contact Person"
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson || ""}
                  onChange={handleChange}
                  placeholder="Contact person's name"
                />

                <FormInput
                  label="Bank Account Name"
                  type="text"
                  name="bankAccountName"
                  value={formData.bankAccountName || ""}
                  onChange={handleChange}
                  placeholder="Account name"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Bank Account Number"
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber || ""}
                    onChange={handleChange}
                    placeholder="Account number"
                  />

                  <FormInput
                    label="Bank Name"
                    type="text"
                    name="bankName"
                    value={formData.bankName || ""}
                    onChange={handleChange}
                    placeholder="Bank name"
                  />
                </div>

                <FormInput
                  label="Lightning Pubkey / Wallet Address (optional)"
                  type="text"
                  name="lightningPubkey"
                  value={formData.lightningPubkey || ""}
                  onChange={handleChange}
                  placeholder="Lightning pubkey or wallet address"
                />

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                    Upload License / Proof of Business (PDF/PNG)
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={triggerLicensePicker}
                    >
                      Choose file
                    </Button>
                    <input
                      ref={licenseInputRef}
                      id="licenseFile"
                      type="file"
                      name="licenseFile"
                      onChange={handleFileChange}
                      accept=".pdf,image/*"
                      className="hidden"
                    />
                    <span className="text-sm text-white/60">
                      {formData.licenseFile
                        ? formData.licenseFile.name
                        : "No file chosen"}
                    </span>
                  </div>
                </div>

                <FormInput
                  label="Short Description"
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription || ""}
                  onChange={handleChange}
                  placeholder="A short description about your organization"
                />
              </div>
            )}

            {/* Beneficiary-specific fields */}
            {formData.role === "beneficiary" && (
              <div className="space-y-4 mt-4">
                <FormInput
                  label="National ID (optional)"
                  type="text"
                  name="nationalId"
                  value={formData.nationalId || ""}
                  onChange={handleChange}
                  placeholder="National ID"
                />

                <FormInput
                  label="Short Story / Description"
                  type="text"
                  name="shortStory"
                  value={formData.shortStory || ""}
                  onChange={handleChange}
                  placeholder="Tell us about your situation"
                />

                <FormInput
                  label="Category"
                  type="text"
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  placeholder="Medical, Education, Business, Emergency"
                />

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                    Upload Supporting Docs (invoice, doctor letter)
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={triggerSupportingPicker}
                    >
                      Choose file
                    </Button>
                    <input
                      ref={supportingInputRef}
                      id="supportingDocs"
                      type="file"
                      name="supportingDocs"
                      onChange={handleFileChange}
                      accept=".pdf,image/*"
                      className="hidden"
                    />
                    <span className="text-sm text-white/60">
                      {formData.supportingDocs
                        ? formData.supportingDocs.name
                        : "No file chosen"}
                    </span>
                  </div>
                </div>

                <FormInput
                  label="Preferred Provider (optional)"
                  type="text"
                  name="preferredProvider"
                  value={formData.preferredProvider || ""}
                  onChange={handleChange}
                  placeholder="Provider name or leave blank for 'match me'"
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="consentContact"
                    name="consentContact"
                    onChange={handleCheckbox}
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

            <div className="flex items-center space-x-3 mt-4">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={!!formData.acceptTerms}
                onChange={handleCheckbox}
              />
              <label
                htmlFor="acceptTerms"
                className="text-sm text-[var(--color-text-light)]"
              >
                I accept the{" "}
                <a href="#" className="text-[var(--color-accent)] underline">
                  Terms & Conditions
                </a>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[var(--color-accent)] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
