import { Link, useLocation } from "react-router-dom";
import { Package, ShoppingCart, ClipboardList, Menu, X, LogIn, LogOut, LayoutDashboard, Shield, Wand2 } from "lucide-react";
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
    ...(user ? [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/design-requests", label: "APC Requests", icon: Wand2 }
    ] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-none">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-premium">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-black tracking-tighter text-foreground">Mill-Connect</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-premium ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-4 right-4 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut} className="ml-2 font-bold text-muted-foreground hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          ) : (
            <Button asChild size="sm" className="ml-4 rounded-xl font-black shadow-premium">
              <Link to="/auth"><LogIn className="mr-2 h-4 w-4" /> Sign In</Link>
            </Button>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-background/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
        mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      }`}>
        <div className="flex h-full flex-col p-8 pt-24">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-4 rounded-2xl px-6 py-4 text-lg font-black transition-premium ${
                  location.pathname === item.to
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-foreground/70 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <item.icon className={`h-6 w-6 ${location.pathname === item.to ? 'text-primary-foreground' : 'text-primary/60'}`} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto space-y-4 pt-8">
            {user ? (
              <div className="space-y-4">
                <p className="px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account</p>
                <button 
                  onClick={() => { signOut(); setMobileOpen(false); }} 
                  className="flex w-full items-center gap-4 rounded-2xl px-6 py-4 text-lg font-black text-destructive hover:bg-destructive/5 transition-premium"
                >
                  <LogOut className="h-6 w-6" /> Sign Out
                </button>
              </div>
            ) : (
              <Button asChild size="lg" className="h-16 w-full rounded-2xl font-black text-xl shadow-premium" onClick={() => setMobileOpen(false)}>
                <Link to="/auth"><LogIn className="mr-3 h-6 w-6" /> Sign In Now</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
