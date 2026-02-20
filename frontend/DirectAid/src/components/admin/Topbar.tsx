import { Menu } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

type TopbarProps = {
  setSidebarOpen: (open: boolean) => void;
};

const routeTitles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/overview": "Overview",
  "/admin/users": "User Management",
  "/admin/campaigns": "Campaign Management",
  "/admin/payouts": "Payouts",
  "/admin/settings": "Settings",
  "/admin/incident-log": "Incident log",
};

const Topbar = ({ setSidebarOpen }: TopbarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const pathname = location.pathname.replace(/\/$/, "") || "/admin";
  const title =
    routeTitles[pathname] ??
    (/^\/admin\/campaigns\/[^/]+$/.test(pathname) ? "Campaign detail" : "Admin");

  const displayName =
    user &&
    [
      (user as { firstName?: string }).firstName,
      (user as { lastName?: string }).lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    user?.name ||
    user?.email ||
    "Admin";

  return (
    <header className="w-full bg-[#0F172A] border-b border-white/10 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
      <button
        className="sm:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      <h1 className="text-xl font-bold tracking-tight text-white">
        {title}
      </h1>

      <Link
        to="/admin/settings"
        className="flex items-center gap-2 min-w-0 max-w-[180px] sm:max-w-none"
        title="Profile settings"
      >
        <span className="truncate text-sm font-medium text-slate-300 hover:text-white transition-colors">
          {displayName}
        </span>
        <div className="w-8 h-8 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </Link>
    </header>
  );
};

export default Topbar;