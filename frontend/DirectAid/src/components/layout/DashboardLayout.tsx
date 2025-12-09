import { type ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Sheet, SheetContent } from "../../components/ui/sheet";
import { Search, Bell, Menu } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  userName: string;
  userRole: string;
}

export const DashboardLayout = ({
  children,
  navItems,
  userName,
  userRole,
}: DashboardLayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavContent = () => (
    <nav className="p-4 space-y-2">
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
              flex w-full items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300
              ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md btn-cta"
                  : "bg-card text-card-foreground hover:text-[var(--color-accent)] hover:shadow-lg hover:bg-card/80"
              }
            `}
            >
              {item.icon}
              {item.label}
            </button>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col w-64 h-screen border-r border-border  flex-shrink-0 sticky top-0 overflow-y-auto"
        style={{ backgroundColor: "var(--color-secondary-bg)" }}
      >
        <div className="p-6 border-b border-border">
          <Link to="/">
            <h1 className="text-3xl font-bold text-[var(--color-accent)]">
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
          className="border-b border-border bg-card px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4"
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

          {/* Search - Hidden on mobile */}
          <div className="hidden sm:block flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              className="pl-10 rounded-full bg-[#0B1221]"
            />
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full sm:hidden"
            >
              <Search className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                <AvatarFallback className=" text-black text-xs sm:text-sm bg-[var(--color-accent)]">
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
