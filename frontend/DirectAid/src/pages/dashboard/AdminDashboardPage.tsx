import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";

import OverviewPage from "../../components/admin/overview/OverviewPage";
import AdminCampaignPage from "../../components/admin/campaignManagement/AdminCampaignPage";
import AdminUserManagementPage from "../../components/admin/userManagement/AdminUserManagementPage";

const AdminDashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#0B1120] text-white min-h-screen">
      
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar setSidebarOpen={setSidebarOpen} />

        {/* Main Switch Area */}
        <main className="flex-1 p-6 space-y-6">
          <Routes>
            {/* Default redirect */}
            <Route index element={<Navigate to="overview" />} />

            <Route path="overview" element={<OverviewPage />} />
            <Route path="campaigns" element={<AdminCampaignPage />} />
            <Route path="users" element={<AdminUserManagementPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
