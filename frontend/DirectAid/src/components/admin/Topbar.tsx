import type { ReactNode } from "react";
import { Menu } from "lucide-react";

// Define props type
type TopbarProps = {
  setSidebarOpen: (open: boolean) => void;
};

const Topbar = ({ setSidebarOpen }: TopbarProps) => {
  return (
    <header className="w-full bg-[#0F172A] border-b border-white/10 p-4 flex justify-between items-center sticky top-0 z-10">
      
      {/* Hamburger menu - only visible on mobile */}
      <button
        className="sm:hidden text-white hover:bg-white/10 p-2 rounded-lg transition"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={26} />
      </button>

      <h2 className="text-lg font-medium">Dashboard Overview</h2>

      {/* Placeholder avatar */}
      <div className="w-10 h-10 rounded-full bg-white/20" />
    </header>
  );
};

export default Topbar;