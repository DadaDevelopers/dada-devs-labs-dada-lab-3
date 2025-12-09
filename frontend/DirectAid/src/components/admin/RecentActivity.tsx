// components/admin/RecentActivity.tsx
import { Bell } from "lucide-react";

const RecentActivity = () => {
  return (
    <div className="bg-[#1E293B]/80 backdrop-blur rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <a href="#" className="text-cyan-400 text-sm hover:underline">View All</a>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Bell size={20} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm">Campaign "Heart Surgery for Chioma" approved</p>
            <p className="text-xs text-gray-500 mt-1">2 mins ago • by Dr. A. Bello</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;