import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
// import Login from "../pages/auth/Login";
// import Signup from "../pages/auth/Signup";
import AdminDashboard from "../pages/dashboard/AdminDashboardPage";
import BeneficiaryDashboard from "../pages/dashboard/BeneficiaryDashboard";
import ProviderDashboard from "../pages/dashboard/ProviderDashboard";
import DonorDashboard from "../pages/dashboard/DonorDashboard";
import CampaignPage from "../pages/CampaignPage";
import CampaignDetail from "../pages/CampaignDetail";
import CampaignCreationWizard from "../pages/CampaignCreationWizard";
import DonationFlow from "../pages/DonationFlow";
import ProviderInvoiceUpload from "../pages/ProviderInvoiceUpload";
import ProviderConfirmation from "../pages/ProviderConfirmation";
import BeneficiaryConfirmation from "../pages/BeneficiaryConfirmation";
import ProviderSettings from "../pages/ProviderSettings";
import BeneficiarySettings from "../pages/BeneficiarySettings";
import DonorSettings from "../pages/DonorSettings";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      {/* <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} /> */}

      {/* Campaign */}
      <Route path="/campaigns" element={<CampaignPage />} />
      <Route path="/campaigns/:id" element={<CampaignDetail />} />
      <Route path="/campaigns/create" element={<CampaignCreationWizard />} />
      <Route path="/donate" element={<DonationFlow />} />

      {/* Provider */}
      <Route path="/provider/invoices" element={<ProviderInvoiceUpload />} />
      <Route
        path="/provider/confirmations"
        element={<ProviderConfirmation />}
      />
      <Route path="/provider/settings" element={<ProviderSettings />} />

      {/* Beneficiary */}
      <Route
        path="/beneficiary/confirmations"
        element={<BeneficiaryConfirmation />}
      />
      <Route path="/beneficiary/settings" element={<BeneficiarySettings />} />

      {/* Donor */}
      <Route path="/donor/settings" element={<DonorSettings />} />

      {/* Dashboards */}
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/beneficiary" element={<BeneficiaryDashboard />} />
      <Route path="/provider" element={<ProviderDashboard />} />
      <Route path="/donor" element={<DonorDashboard />} />
    </Routes>
  );
}
