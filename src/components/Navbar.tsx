import { Link, useLocation } from "react-router-dom";
import { Package, ShoppingCart, ClipboardList, Menu, X, LogIn, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdmin";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();

  const navItems = [
    { to: "/", label: "Home", icon: Package },
    { to: "/catalog", label: "Catalog", icon: ShoppingCart },
    { to: "/orders", label: "My Orders", icon: ClipboardList },
    ...(user ? [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">Mill-Connect</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === item.to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut} className="ml-2 text-muted-foreground">
              <LogOut className="mr-1 h-4 w-4" /> Sign Out
            </Button>
          ) : (
            <Button asChild size="sm" className="ml-2">
              <Link to="/auth"><LogIn className="mr-1 h-4 w-4" /> Sign In</Link>
            </Button>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background p-4 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                location.pathname === item.to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          ) : (
            <Link to="/auth" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-primary">
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
