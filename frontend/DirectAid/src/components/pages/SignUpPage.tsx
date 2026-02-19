// /components/pages/SignUpPage.tsx
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FormInput from "../ui/FormInput";
import { Button } from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms?: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
  success?: string;
}

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [_searchParams] = useSearchParams();
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.name = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.name = "Last name is required";
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

    if (!formData.acceptTerms) {
      newErrors.general =
        "You must accept the terms and conditions to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      if (!result.ok) {
        setErrors({
          general:
            result.error ||
            "An error occurred during signup. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }

      setErrors({
        success:
          "Account created. Please check your email to verify your account, then log in.",
      });

      // Optionally redirect to login after a short delay
      setTimeout(() => {
        navigate("/login?justRegistered=true");
      }, 1500);
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
            {(errors.general || errors.success) && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}
            {errors.success && (
              <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-lg text-sm">
                {errors.success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="First Name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.name}
                required
                placeholder="Enter your first name"
                autoComplete="name"
              />

              <FormInput
                label="Last Name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.name}
                required
                placeholder="Enter your last name"
                autoComplete="family-name"
              />
            </div>

            <div>
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
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              className="w-full btn-cta">
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
