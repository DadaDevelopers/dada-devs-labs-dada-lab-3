// pages/AdminDashboardPage.tsx or wherever you have it
import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import StatsCard from "../../components/admin/StatsCard";
import DonationsChart from "../../components/admin/DonationsChart";
import UserRolesPieChart from "../../components/admin/UserRolesPieChart";
import RecentActivity from "../../components/admin/RecentActivity";
import { Users, DollarSign, FileText, Clock, TrendingUp, AlertCircle } from "lucide-react";

const AdminDashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#0B1120] text-white min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Total Users" value="24,593" change="12.5%" icon={<Users size={28} />} />
            <StatsCard title="Total Donations" value="$4,203,000" change="340k" changePositive={true} icon={<DollarSign size={28} />} />
            <StatsCard title="Pending Approvals" value="14" badge="3 Critical" badgeColor="yellow" icon={<FileText size={28} />} />
            <StatsCard title="Pending Withdrawals" value="$125,400" badge="8 Requests" badgeColor="red" icon={<Clock size={28} />} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DonationsChart />
            </div>
            <UserRolesPieChart />
          </div>

          {/* Recent Activity */}
          <RecentActivity />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;