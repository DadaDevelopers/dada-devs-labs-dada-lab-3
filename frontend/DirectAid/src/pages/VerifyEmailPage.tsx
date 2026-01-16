import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "../services/api";

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    if (!token) return;

    // Let the backend handle verification and redirect logic.
    const url = `${API_BASE}/auth/verify-email/${token}`;
    window.location.href = url;
  }, [token]);

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[var(--color-secondary-bg)] rounded-lg shadow-xl p-8 border border-white/10 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-light)] mb-3">
          Verifying your email…
        </h1>
        <p className="text-white/70 text-sm mb-6">
          We’re confirming your email address. You’ll be redirected shortly. If
          nothing happens, you can continue to login manually.
        </p>
        <button
          onClick={handleGoToLogin}
          className="text-[var(--color-accent)] hover:underline text-sm"
        >
          Go to login
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

