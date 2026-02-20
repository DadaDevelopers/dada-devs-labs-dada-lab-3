import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LandingPage from "../pages/LandingPage";
import AdminDashboard from "../pages/dashboard/AdminDashboardPage";
import LoginPage from "../components/pages/LoginPage";
import SignUpPage from "../components/pages/SignUpPage";
import ForgotPasswordPage from "../components/pages/ForgotPasswordPage";
import OnboardingWizard from "../pages/OnboardingWizard";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import BeneficiaryDashboard from "../pages/dashboard/BeneficiaryDashboard";
import ProviderDashboard from "../pages/dashboard/ProviderDashboard";
import DonorDashboard from "../pages/dashboard/DonorDashboard";
import CampaignPage from "../pages/CampaignPage";
import CampaignDetail from "../pages/CampaignDetail";
import CampaignCreationWizard from "../pages/CampaignCreationWizard";
import DonationFlow from "../pages/DonationFlow";
import ProviderInvoiceUpload from "../pages/ProviderInvoiceUpload";
// import ProviderConfirmation from "../pages/ProviderConfirmation";
import ProviderWithdrawal from "../pages/ProviderWithdrawal";
import ProviderProofUpload from "../pages/ProviderProofUpload";
import BeneficiaryConfirmation from "../pages/BeneficiaryConfirmation";
import ProviderSettings from "../pages/ProviderSettings";
import BeneficiarySettings from "../pages/BeneficiarySettings";
import DonorSettings from "../pages/DonorSettings";
import DonorDonations from "../pages/donor/DonorDonations";
import DonorReceipts from "../pages/donor/DonorReceipts";
import BeneficiaryReporting from "../pages/beneficiary/BeneficiaryReporting";
import BeneficiaryFunds from "../pages/beneficiary/BeneficiaryFunds";
import BeneficiaryCampaignsPage from "../pages/beneficiary/BeneficiaryCampaignsPage";
import BeneficiaryCampaignDetail from "../pages/beneficiary/BeneficiaryCampaignDetail";
import ProvidersPage from "../pages/ProvidersPage";

/** If user is logged in but has no role / UNASSIGNED, send them to onboarding when they hit a role-specific path. */
function useOnboardingRedirect() {
  const { user, role } = useAuth();
  const { pathname } = useLocation();
  const isRolePath = /^\/(admin|donor|provider|beneficiary)(\/|$)/.test(pathname);
  const effectiveRole = String(role ?? "").trim().toUpperCase();
  const needsOnboarding =
    user && (effectiveRole === "UNASSIGNED" || !effectiveRole) && isRolePath;
  return needsOnboarding;
}

export default function AppRouter() {
  const redirectToOnboarding = useOnboardingRedirect();

  if (redirectToOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/providers" element={<ProvidersPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/onboarding" element={<OnboardingWizard />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* Campaign */}
      <Route path="/campaigns" element={<CampaignPage />} />
      <Route path="/campaigns/:id" element={<CampaignDetail />} />
      <Route path="/campaigns/create" element={<CampaignCreationWizard />} />
      <Route path="/donate" element={<DonationFlow />} />

      {/* Provider */}
      <Route path="/provider/campaigns" element={<CampaignPage />} />
      <Route path="/provider/invoices" element={<ProviderInvoiceUpload />} />
      <Route path="/provider/withdrawals" element={<ProviderWithdrawal />} />
      <Route path="/provider/proof-upload" element={<ProviderProofUpload />} />
      {/* <Route
        path="/provider/confirmations"
        element={<ProviderConfirmation />}
      /> */}
      <Route path="/provider/settings" element={<ProviderSettings />} />
      <Route path="/provider/settings/profile" element={<ProviderSettings />} />
      <Route path="/provider/settings/payouts" element={<ProviderSettings />} />
      <Route path="/provider/settings/notifications" element={<ProviderSettings />} />
      <Route path="/provider/settings/change-password" element={<ProviderSettings />} />

      {/* Beneficiary */}
      <Route
        path="/beneficiary/confirmations"
        element={<BeneficiaryConfirmation />}
      />
      <Route path="/beneficiary/settings" element={<BeneficiarySettings />} />
      <Route path="/beneficiary/settings/profile" element={<BeneficiarySettings />} />
      <Route path="/beneficiary/settings/address" element={<BeneficiarySettings />} />
      <Route path="/beneficiary/settings/notifications" element={<BeneficiarySettings />} />
      <Route path="/beneficiary/settings/change-password" element={<BeneficiarySettings />} />
      <Route path="/beneficiary/reporting" element={<BeneficiaryReporting />} />
      <Route path="/beneficiary/funds" element={<BeneficiaryFunds />} />
      <Route path="/beneficiary/campaigns" element={<BeneficiaryCampaignsPage />} />
      <Route path="/beneficiary/campaigns/:id" element={<BeneficiaryCampaignDetail />} />
      <Route path="/beneficiary/campaigns" element={<BeneficiaryCampaignsPage />} />
      <Route path="/beneficiary/campaigns/:id" element={<BeneficiaryCampaignDetail />} />

      {/* Donor */}
      <Route path="/donor/settings" element={<DonorSettings />} />
      <Route path="/donor/settings/profile" element={<DonorSettings />} />
      <Route path="/donor/settings/payment" element={<DonorSettings />} />
      <Route path="/donor/settings/notifications" element={<DonorSettings />} />
      <Route path="/donor/settings/change-password" element={<DonorSettings />} />
      <Route path="/donor/campaigns" element={<CampaignPage />} />
      <Route path="/donor/campaigns/:id" element={<CampaignDetail />} />
      <Route path="/donor/donations" element={<DonorDonations />} />
      <Route path="/donor/receipts" element={<DonorReceipts />} />

      {/* Dashboards */}
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/beneficiary" element={<BeneficiaryDashboard />} />
      <Route path="/provider" element={<ProviderDashboard />} />
      <Route path="/donor" element={<DonorDashboard />} />
    </Routes>
  );
}
