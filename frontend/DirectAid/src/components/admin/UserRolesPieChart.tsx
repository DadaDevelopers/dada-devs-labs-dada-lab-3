// components/admin/UserRolesPieChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Donors", value: 15400, color: "#06b6d4" },
  { name: "Beneficiaries", value: 8500, color: "#8b5cf6" },
  { name: "Providers", value: 693, color: "#22c55e" },
];

const UserRolesPieChart = () => {
  return (
    <div className="bg-[#1E293B]/80 backdrop-blur rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-6">User Roles Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Legend 
            layout="vertical" 
            align="right" 
            verticalAlign="middle"
            // This is the magic line that kills the error forever
            formatter={(value: any) => <span className="text-gray-300">{value}</span>}
          />
          <text x="50%" y="45%" textAnchor="middle" className="text-3xl font-bold fill-white">
            24k
          </text>
          <text x="50%" y="55%" textAnchor="middle" className="text-sm fill-gray-400">
            Total
          </text>
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        {data.map((item) => (
          <div key={item.name}>
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-gray-400">{item.name}</span>
            </div>
            <p className="text-xl font-bold text-white mt-1">{item.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserRolesPieChart;