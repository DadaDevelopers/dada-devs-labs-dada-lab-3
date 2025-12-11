import { X, LayoutDashboard, Users, NotebookText, AlertTriangle, Settings, BarChart2 } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

// 1. Define props type for Sidebar
type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

// 2. Define props type for NavItem
type NavItemProps = {
  icon: ReactNode;
  label: string;
  to: string;
  active?: boolean;
};

// 3. NavItem component with proper typing
const NavItem = ({ icon, label, active = false, to }: NavItemProps) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer 
      hover:bg-white/10 transition
      ${active ? "bg-white/10 text-[var(--color-accent)]" : "text-gray-300"}
    `}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

// Navigation configuration
const navItems = [
  { icon: <LayoutDashboard />, label: "Dashboard", to: "/admin/dashboard" },
  { icon: <Users />, label: "User Management", to: "/admin/users" },
  { icon: <NotebookText />, label: "Campaigns", to: "/admin/campaigns" },
  { icon: <BarChart2 />, label: "Analytics", to: "#", placeholder: true },
  { icon: <AlertTriangle />, label: "Flagged Reports", to: "#", placeholder: true },
  { icon: <Settings />, label: "Settings", to: "#", placeholder: true },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

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
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              active={currentPath === item.to}
            />
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;


// import { X, LayoutDashboard, Users, FolderCheck, NotebookText, AlertTriangle, Settings, BarChart2 } from "lucide-react";
// import type { ReactNode } from "react";
// import { Link } from "react-router-dom";

// // 1. Define props type for Sidebar
// type SidebarProps = {
//   sidebarOpen: boolean;
//   setSidebarOpen: (open: boolean) => void;
// };

// // 2. Define props type for NavItem
// type NavItemProps = {
//   icon: ReactNode;
//   label: string;
//   active?: boolean; // Made optional with ? (only Dashboard uses it)
// };

// const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
//   const NavItem = ({icon, label, active = false, to}) => (
//     <Link
//       to={to}
//       className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer 
//         hover:bg-white/10 transition
//         ${active ? "bg-white/10 text-[var(--color-accent)]" : "text-gray-300"}
//       `}
//     >
//       {icon}
//       <span>{label}</span>
//     </Link>
//   )
//   return (
//     <>
//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/40 z-20 sm:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       <aside
//         className={`
//           fixed sm:static top-0 left-0 h-full w-64 z-30 bg-[#111827] 
//           border-r border-white/10 p-6 flex flex-col gap-6
//           transform transition-transform duration-300
//           ${sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
//         `}
//       >
//         {/* Brand */}
//         <div className="flex justify-between items-center mb-6 sm:mb-0">
//           <h1 className="text-2xl font-bold text-[var(--color-accent)]">DirectAid</h1>

//           <button
//             className="sm:hidden p-1"
//             onClick={() => setSidebarOpen(false)}
//           >
//             <X size={24} />
//           </button>
//         </div>

//         {/* Nav */}
//         <nav className="flex flex-col gap-4">
//           <NavItem icon={<LayoutDashboard />} label="Dashboard" active />
//           <NavItem icon={<Users />} label="User Management" />
//           <NavItem icon={<NotebookText />} label="Campaigns" to="/admin/campaigns" />
//           <NavItem icon={<BarChart2 />} label="Analytics" />
//           <NavItem icon={<AlertTriangle />} label="Flagged Reports" />
//           <NavItem icon={<Settings />} label="Settings" />
//         </nav>
//       </aside>
//     </>
//   );
// };

// // 3. Properly typed NavItem component
// const NavItem = ({ icon, label, active = false }: NavItemProps) => (
//   <div
//     className={`
//       flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer 
//       hover:bg-white/10 transition
//       ${active ? "bg-white/10 text-[var(--color-accent)]" : "text-gray-300"}
//     `}
//   >
//     {icon}
//     <span>{label}</span>
//   </div>
// );

// export default Sidebar;

