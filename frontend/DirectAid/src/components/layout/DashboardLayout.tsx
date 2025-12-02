import  { type ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Sheet, SheetContent } from "../../components/ui/sheet";
import { Search, Bell , Menu} from "lucide-react";

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

export const DashboardLayout = ({ children, navItems, userName, userRole }: DashboardLayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavContent = () => (
    <nav className="p-4 space-y-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive && "bg-primary text-primary-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border bg-card flex-shrink-0">
        <div className="p-6 border-b border-border">
          <Link to="/">
            <h1 className="text-2xl font-bold">
              <span className="text-primary">DirectAid</span>
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
              <h1 className="text-2xl font-bold">
                Aid<span className="text-primary">Chain</span>
              </h1>
            </Link>
          </div>
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="border-b border-border bg-card px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden flex-shrink-0"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Search - Hidden on mobile, visible on tablet+ */}
            <div className="hidden sm:block flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search campaigns..." 
                className="pl-10 rounded-full"
              />
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              {/* Mobile Search Button */}
              <Button variant="ghost" size="icon" className="rounded-full sm:hidden">
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
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                    {userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
