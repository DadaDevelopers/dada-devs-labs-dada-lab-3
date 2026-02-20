import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";

import OverviewPage from "../../components/admin/overview/OverviewPage";
import AdminCampaignPage from "../../components/admin/campaignManagement/AdminCampaignPage";
import AdminUserManagementPage from "../../components/admin/userManagement/AdminUserManagementPage";
import AdminSettingsPage from "../../components/admin/AdminSettingsPage";
import IncidentLogPage from "../../components/admin/overview/IncidentLogPage";
import AdminCampaignDetailPage from "../../components/admin/campaignManagement/AdminCampaignDetailPage";
import AdminPayoutsPage from "../../components/admin/payouts/AdminPayoutsPage";

const AdminDashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex bg-[#0B1120] text-white h-screen overflow-hidden">
      {/* Sidebar — does not scroll */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Topbar setSidebarOpen={setSidebarOpen} />

        {/* Main content — only this area scrolls */}
        <main className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          <Routes>
            <Route index element={<Navigate to="overview" />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="campaigns" element={<AdminCampaignPage />} />
            <Route path="campaigns/:id" element={<AdminCampaignDetailPage />} />
            <Route path="users" element={<AdminUserManagementPage />} />
            <Route path="payouts" element={<AdminPayoutsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="incident-log" element={<IncidentLogPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
