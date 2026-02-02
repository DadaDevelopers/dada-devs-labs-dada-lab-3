import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FormInput from "../ui/FormInput";
import {Button} from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Use auth context to login
      const result = await login(formData.email, formData.password);

      if (!result.ok) {
        setErrors({
          general:
            result.error || "Invalid email or password. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }

      // Login successful - use role from login result (context state may not have updated yet)
      const roleFromApi = result?.user?.role ?? user?.role;
      const finalRole = (roleFromApi ?? "").toString().trim().toUpperCase() || "UNASSIGNED";

      const destination =
        finalRole === "UNASSIGNED"
          ? "/onboarding"
          : finalRole === "PROVIDER"
            ? "/provider"
            : finalRole === "BENEFICIARY"
              ? "/beneficiary"
              : finalRole === "ADMIN"
                ? "/admin"
                : "/donor";
      console.log("[auth] login redirect — result.user:", result?.user, "roleFromApi:", roleFromApi, "finalRole:", finalRole, "navigating to:", destination);

      // New users and anyone without a set role go to onboarding to select role; only explicit roles go to dashboards
      if (finalRole === "UNASSIGNED") {
        navigate("/onboarding");
      } else if (finalRole === "PROVIDER") {
        navigate("/provider");
      } else if (finalRole === "BENEFICIARY") {
        navigate("/beneficiary");
      } else if (finalRole === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/donor");
      }
    } catch {
      setErrors({
        general: "Invalid email or password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-light)] mb-2">
            Welcome Back
          </h1>
          <p className="text-white/60">Sign in to your DirectAid account</p>
        </div>

        <div className="bg-[var(--color-secondary-bg)] rounded-lg shadow-xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

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

            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-[#151D2C] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <span className="ml-2 text-sm text-white/70">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[var(--color-accent)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              className="w-full btn-cta">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[var(--color-accent)] hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
