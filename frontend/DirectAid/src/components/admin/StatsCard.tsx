// components/admin/StatsCard.tsx
import type { ReactNode } from "react";

type StatsCardProps = {
  title: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  badge?: string;
  badgeColor?: "green" | "yellow" | "red";
  icon: ReactNode;
};

const StatsCard = ({ title, value, change, changePositive = true, badge, badgeColor = "green", icon }: StatsCardProps) => {
  return (
    <div className="bg-[#1E293B]/80 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-white/20 transition">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/10 rounded-xl">{icon}</div>
        <div className="flex items-center gap-2">
          {change && (
            <span className={`text-sm ${changePositive ? "text-green-400" : "text-red-400"}`}>
              {changePositive ? "↑" : "↓"} {change}
            </span>
          )}
          {badge && (
            <span className={`text-xs px-3 py-1 rounded-full ${
              badgeColor === "green" ? "bg-green-500/20 text-green-400" :
              badgeColor === "yellow" ? "bg-yellow-500/20 text-yellow-400" :
              "bg-red-500/20 text-red-400"
            }`}>
              {badge}
            </span>
          )}
        </div>
      </div>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
      <p className="text-gray-400 text-sm mt-1">{title}</p>
    </div>
  );
};

export default StatsCard;