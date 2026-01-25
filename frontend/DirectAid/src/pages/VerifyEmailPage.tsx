import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "../services/api";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState<string>("");
  const [errorDetails, setErrorDetails] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      setErrorDetails("No token provided in the verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const url = `${API_BASE}/auth/verify-email/${token}`;
        
        // Make API call with manual redirect handling
        const response = await fetch(url, {
          method: "GET",
          redirect: "manual", // Don't automatically follow redirects
        });

        // Handle redirect (success case - backend redirects to /login?verified=true)
        if (response.status === 302 || response.status === 301) {
          const location = response.headers.get("Location");
          setStatus("success");
          setMessage("Email verified successfully!");
          
          // Navigate to login after a short delay to show success message
          setTimeout(() => {
            if (location) {
              // Extract the path from the full URL if it's absolute
              const urlObj = new URL(location);
              navigate(urlObj.pathname + urlObj.search);
            } else {
              navigate("/login?verified=true");
            }
          }, 2000);
          return;
        }

        // Handle success (200 status - though backend currently redirects)
        if (response.ok) {
          setStatus("success");
          setMessage("Email verified successfully!");
          setTimeout(() => {
            navigate("/login?verified=true");
          }, 2000);
          return;
        }

        // Handle error (400, 404, etc.)
        if (response.status === 400 || response.status === 404) {
          const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
          setStatus("error");
          setMessage("Verification failed");
          
          // Provide user-friendly error messages
          if (errorData.message?.includes("expired")) {
            setErrorDetails("This verification link has expired. Please request a new verification email.");
          } else if (errorData.message?.includes("Invalid")) {
            setErrorDetails("This verification link is invalid or has already been used. Please request a new verification email.");
          } else if (errorData.message?.includes("No token")) {
            setErrorDetails("The verification link is missing required information. Please check your email and try again.");
          } else {
            setErrorDetails(errorData.message || "An error occurred during verification.");
          }
          return;
        }

        // Handle other status codes
        setStatus("error");
        setMessage("Verification failed");
        setErrorDetails("An unexpected error occurred. Please try again later.");
      } catch (error: any) {
        setStatus("error");
        setMessage("Verification failed");
        setErrorDetails(
          error.message || "Unable to connect to the server. Please check your internet connection and try again."
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleResendVerification = async () => {
    // You could add a resend verification flow here
    // For now, just navigate to login where they can request resend
    navigate("/login?resend=true");
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[var(--color-secondary-bg)] rounded-lg shadow-xl p-8 border border-white/10 text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="w-12 h-12 text-[var(--color-accent)] animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[var(--color-text-light)] mb-3">
              Verifying your email…
            </h1>
            <p className="text-white/70 text-sm mb-6">
              We're confirming your email address. This may take a moment if the server is starting up.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[var(--color-text-light)] mb-3">
              {message}
            </h1>
            <p className="text-white/70 text-sm mb-6">
              Redirecting you to login...
            </p>
            <button
              onClick={handleGoToLogin}
              className="text-[var(--color-accent)] hover:underline text-sm"
            >
              Go to login now
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[var(--color-text-light)] mb-3">
              {message}
            </h1>
            <p className="text-white/70 text-sm mb-6">
              {errorDetails}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleResendVerification}
                className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                Request New Verification Email
              </button>
              <button
                onClick={handleGoToLogin}
                className="text-[var(--color-accent)] hover:underline text-sm"
              >
                Go to login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;