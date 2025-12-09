import { X, LayoutDashboard, Users, FolderCheck, AlertTriangle, Settings, BarChart2 } from "lucide-react";
import type { ReactNode } from "react";

// 1. Define props type for Sidebar
type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

// 2. Define props type for NavItem
type NavItemProps = {
  icon: ReactNode;
  label: string;
  active?: boolean; // Made optional with ? (only Dashboard uses it)
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed sm:static top-0 left-0 h-full w-64 z-30 bg-[#111827] 
          border-r border-white/10 p-6 flex flex-col gap-6
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="flex justify-between items-center mb-6 sm:mb-0">
          <h1 className="text-2xl font-bold text-[var(--color-accent)]">DirectAid</h1>

          <button
            className="sm:hidden p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-4">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active />
          <NavItem icon={<Users />} label="User Management" />
          <NavItem icon={<FolderCheck />} label="Campaign Approvals" />
          <NavItem icon={<BarChart2 />} label="Analytics" />
          <NavItem icon={<AlertTriangle />} label="Flagged Reports" />
          <NavItem icon={<Settings />} label="Settings" />
        </nav>
      </aside>
    </>
  );
};

// 3. Properly typed NavItem component
const NavItem = ({ icon, label, active = false }: NavItemProps) => (
  <div
    className={`
      flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer 
      hover:bg-white/10 transition
      ${active ? "bg-white/10 text-[var(--color-accent)]" : "text-gray-300"}
    `}
  >
    {icon}
    <span>{label}</span>
  </div>
);

export default Sidebar;