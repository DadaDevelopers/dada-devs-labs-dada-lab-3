import { type ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Sheet, SheetContent } from "../../components/ui/sheet";
import { Bell, Menu } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface SettingsNavItem {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  userName: string;
  userRole: string;
  settingsNavItems?: SettingsNavItem[];
  onLogout?: () => void;
}

export const DashboardLayout = ({
  children,
  navItems,
  userName,
  userRole,
  settingsNavItems,
  onLogout,
}: DashboardLayoutProps) => {
  const location = useLocation();
  const { user: authUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profilePictureUrl = (authUser as any)?.beneficiaryProfile?.profilePicture?.url;

  const NavContent = () => {
    return (
      <nav className="p-4 space-y-1">
        {/* Main Navigation Items */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
            >
              <button
                className={`
                  flex w-full items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${
                    isActive
                      ? "bg-white/5 text-[var(--color-text-light)]"
                      : "bg-transparent text-white/70 hover:bg-white/5 hover:text-white/90"
                  }
                `}
              >
                {item.icon}
                {item.label}
              </button>
            </Link>
          );
        })}
        
        {/* Settings Navigation - Always Visible */}
        {settingsNavItems && settingsNavItems.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            {/* Settings Heading - Non-clickable */}
            <div className="px-3 py-2 mb-1">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Settings
              </h3>
            </div>
            {settingsNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <button
                    className={`
                      flex w-full items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium
                      transition-colors duration-200
                      ${
                        isActive
                          ? "bg-white/5 text-[var(--color-text-light)]"
                          : "bg-transparent text-white/70 hover:bg-white/5 hover:text-white/90"
                      }
                    `}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </Link>
              );
            })}
            
            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="
                  flex w-full items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  bg-transparent text-white/70 hover:bg-white/5 hover:text-white/90
                  mt-1
                "
              >
                Logout
              </button>
            )}
          </div>
        )}
      </nav>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col w-64 h-screen border-r border-border  flex-shrink-0 sticky top-0 overflow-y-auto"
        style={{ backgroundColor: "var(--color-secondary-bg)" }}
      >
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/">
            <h1 className="text-2xl font-bold text-[var(--color-accent)]">
              DirectAid
            </h1>
          </Link>
        </div>
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-card">
          <div className="p-6 border-b border-border">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <h1 className="text-2xl font-bold text-primary">DirectAid</h1>
            </Link>
          </div>
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Top Bar */}
        <header
          className="min-h-[4.5rem] py-3 border-b border-border bg-card px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4"
          style={{ backgroundColor: "var(--color-secondary-bg)" }}
        >
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden flex-shrink-0"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                {profilePictureUrl ? (
                  <AvatarImage src={profilePictureUrl} alt={userName} className="object-cover" />
                ) : null}
                <AvatarFallback className="text-black text-xs sm:text-sm bg-[var(--color-accent)]">
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#0B1221] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
