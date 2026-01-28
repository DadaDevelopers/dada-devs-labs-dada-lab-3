import StatsCard from "../StatsCard";
import DonationsChart from "../DonationsChart";
import UserRolesPieChart from "../UserRolesPieChart";
import RecentActivity from "../RecentActivity";
import { Users, DollarSign, FileText, Clock } from "lucide-react";

const OverviewPage = () => {
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value="24,593"
          change="12.5%"
          icon={<Users size={28} />}
        />
        <StatsCard
          title="Total Donations"
          value="$4,203,000"
          change="340k"
          changePositive={true}
          icon={<DollarSign size={28} />}
        />
        <StatsCard
          title="Pending Approvals"
          value="14"
          badge="3 Critical"
          badgeColor="yellow"
          icon={<FileText size={28} />}
        />
        <StatsCard
          title="Pending Withdrawals"
          value="$125,400"
          badge="8 Requests"
          badgeColor="red"
          icon={<Clock size={28} />}
        />
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
    </>
  );
};

export default OverviewPage;
