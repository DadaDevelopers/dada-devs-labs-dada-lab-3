import React, { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../ui/FormInput";
import Button from "../ui/Button";
import { forgotPassword } from "../../services/api";

interface FormErrors {
  email?: string;
  general?: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({
        ...prev,
        email: undefined,
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
      // Call the forgot password API
      await forgotPassword(email);

      // Show success message
      setIsSuccess(true);
    } catch (error) {
      setErrors({
        general: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--color-primary-bg)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-[var(--color-secondary-bg)] rounded-lg shadow-xl p-8 border border-white/10">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[var(--color-text-light)] mb-4">
                Check Your Email
              </h1>
              <p className="text-white/70 mb-6">
                We've sent password reset instructions to{" "}
                <strong className="text-[var(--color-accent)]">{email}</strong>
              </p>
              <p className="text-sm text-white/60 mb-8">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="space-y-3">
                <Link to="/login">
                  <Button variant="primary" size="md" className="w-full">
                    Back to Login
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  className="w-full text-sm text-[var(--color-accent)] hover:underline"
                >
                  Try a different email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary-bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-light)] mb-2">
            Forgot Password?
          </h1>
          <p className="text-white/60">
            Enter your email and we'll send you reset instructions
          </p>
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
              value={email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Remember your password?{" "}
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

export default ForgotPasswordPage;
