import { useState } from "react";
import { Users, ShieldCheck, HandCoins, User } from "lucide-react";

export default function AdminUserManagementPage() {
  const [filter, setFilter] = useState("All");

  // MOCK DATA — replace with backend later
  const users = [
    {
      id: 1,
      name: "John Doe",
      role: "Donor",
      email: "john@example.com",
      status: "Active",
    },
    {
      id: 2,
      name: "Grace Provider",
      role: "Provider",
      email: "provider@example.com",
      status: "Pending Verification",
    },
    {
      id: 3,
      name: "Blessing U.",
      role: "Beneficiary",
      email: "blessing@example.com",
      status: "Verified",
    },
  ];

  // FILTERING LOGIC
  const filteredUsers =
    filter === "All"
      ? users
      : users.filter((u) => u.role === filter);

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>

      {/* FILTER BUTTONS */}
      <div className="flex gap-3 mb-6">
        <FilterButton 
          label="All"
          icon={<Users size={16} />}
          active={filter === "All"}
          onClick={() => setFilter("All")}
        />
        <FilterButton 
          label="Providers"
          icon={<ShieldCheck size={16} />}
          active={filter === "Provider"}
          onClick={() => setFilter("Provider")}
        />
        <FilterButton 
          label="Beneficiaries"
          icon={<HandCoins size={16} />}
          active={filter === "Beneficiary"}
          onClick={() => setFilter("Beneficiary")}
        />
        <FilterButton 
          label="Donors"
          icon={<User size={16} />}
          active={filter === "Donor"}
          onClick={() => setFilter("Donor")}
        />
      </div>

      {/* USER TABLE */}
      <div className="bg-[#111827] rounded-xl p-4 shadow-md overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-300">
                  No users found for "{filter}"
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-800 hover:bg-[#1a2234] transition-colors"
                >
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.role}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        user.status.includes("Pending")
                          ? "bg-yellow-600/30 text-yellow-400"
                          : user.status.includes("Verified")
                          ? "bg-green-600/30 text-green-400"
                          : "bg-blue-600/30 text-blue-400"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {user.role === "Provider" &&
                      user.status === "Pending Verification" && (
                        <button className="px-4 py-1 bg-green-600 rounded-lg text-sm hover:bg-green-700">
                          Verify
                        </button>
                      )}

                    {user.role !== "Provider" && (
                      <button className="px-4 py-1 bg-blue-600 rounded-lg text-sm hover:bg-blue-700">
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// COMPONENT: Filter Button
type FilterButtonProps = {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
};

function FilterButton({ label, icon, active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        active
          ? "bg-blue-600 text-white"
          : "bg-[#1f2937] text-gray-300 hover:bg-[#374151]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

