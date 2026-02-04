// components/admin/DonationsChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", amount: 120000 },
  { month: "Feb", amount: 180000 },
  { month: "Mar", amount: 140000 },
  { month: "Apr", amount: 220000 },
  { month: "May", amount: 280000 },
  { month: "Jun", amount: 380000 },
  { month: "Jul", amount: 520000 },
];

const DonationsChart = () => {
  return (
    <div className="bg-[#1E293B]/80 backdrop-blur rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Donations Over Time (USD)</h3>
        <select className="bg-white/10 text-sm text-gray-300 rounded-lg px-4 py-2 border border-white/20">
          <option>Last 6 Months</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis 
            stroke="#94a3b8" 
            tickFormatter={(value: number | string) => {
                const num = typeof value === "string" ? parseFloat(value) : value;
                return `$${(num / 1000).toFixed(0)}k`;
            }}
            />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Line type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonationsChart;