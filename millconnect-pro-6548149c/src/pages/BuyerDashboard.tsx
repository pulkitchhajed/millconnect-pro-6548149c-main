import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Package, ClipboardList, FileText, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning border-warning/20",
  Confirmed: "bg-primary/10 text-primary border-primary/20",
  Shipped: "bg-success/10 text-success border-success/20",
  Delivered: "bg-success/15 text-success border-success/30",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const BuyerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: favorites } = useFavorites();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [stats, setStats] = useState({ activeOrders: 0, totalOrders: 0, totalSpent: 0 });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("*, fabrics:fabric_id_ref(image_url)")
        .eq("user_id", user.id)
        .neq("status", "Delivered")
        .neq("status", "Cancelled")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentOrders(orders || []);

      const { data: allOrders } = await supabase
        .from("orders")
        .select("status, total")
        .eq("user_id", user.id);
      const active = (allOrders || []).filter((o) => o.status !== "Delivered").length;
      const total = (allOrders || []).reduce((sum, o) => sum + Number(o.total), 0);
      setStats({ activeOrders: active, totalOrders: (allOrders || []).length, totalSpent: total });

      const { data: q } = await supabase
        .from("quote_requests")
        .select("*, fabrics:fabric_id(image_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setQuotes(q || []);
    };
    fetch();
  }, [user]);

  if (authLoading) {
    return <div className="min-h-screen"><Navbar /><div className="container mx-auto flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Loading...</p></div><Footer /></div>;
  }

  if (!user) {
    navigate("/auth?redirect=/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background/50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-primary px-8 py-12 text-primary-foreground shadow-2xl">
          <div className="relative z-10">
            <h1 className="font-display text-4xl font-bold md:text-5xl">Dashboard</h1>
            <p className="mt-4 max-w-lg text-lg text-primary-foreground/80">
              Welcome back! Here's your personalized overview of active orders and favorite fabrics.
            </p>
          </div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute -bottom-10 right-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
        </div>

        {/* Stats Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute right-0 top-0 h-2 bg-primary transition-all group-hover:w-full w-0" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Orders</p>
                <p className="mt-2 text-4xl font-bold">{stats.activeOrders}</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute right-0 top-0 h-2 bg-secondary transition-all group-hover:w-full w-0" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Orders</p>
                <p className="mt-2 text-4xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="rounded-xl bg-secondary/10 p-3 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute right-0 top-0 h-2 bg-accent transition-all group-hover:w-full w-0" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Spent</p>
                <p className="mt-2 text-4xl font-bold">₹{stats.totalSpent.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl bg-accent/10 p-3 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Recent Active Orders Card */}
          <div className="rounded-3xl border bg-card/50 backdrop-blur-sm p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Recent Active Orders</h2>
                <p className="text-sm text-muted-foreground mt-1">Updates on your ongoing shipments</p>
              </div>
              <Button asChild variant="ghost" className="hover:bg-primary/5 text-primary">
                <Link to="/orders">View History <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted/30 mb-4" />
                <p className="text-muted-foreground mb-4">No active orders right now.</p>
                <Button asChild variant="outline">
                  <Link to="/catalog">Browse Catalog</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((o) => (
                  <Link key={o.id} to={`/orders/${o.id}`} className="group relative flex items-center justify-between overflow-hidden rounded-xl border bg-background p-5 transition-all hover:bg-muted/30 hover:shadow-md">
                    <div className="flex items-center gap-4 z-10">
                      {o.fabrics?.image_url ? (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <img src={o.fabrics.image_url} alt={o.fabric_name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{o.fabric_name}</p>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {o.items && Array.isArray(o.items) && o.items.length > 0
                              ? `${o.items.length} color${o.items.length > 1 ? 's' : ''}`
                              : (o.selected_color || "Standard")}
                          </span>
                          <span>·</span>
                          <span>{o.quantity}m</span>
                          <span>·</span>
                          <span className="font-medium text-foreground">₹{Number(o.total).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={`${statusColors[o.status] || ""} border px-3 py-1`}>{o.status}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all group-hover:w-full" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Favorites Section */}
          <div className="rounded-3xl border bg-card/50 backdrop-blur-sm p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">My Favorites</h2>
                <p className="text-sm text-muted-foreground mt-1">Quick access to fabrics you loved</p>
              </div>
              <div className="rounded-full bg-destructive/10 p-2 text-destructive">
                <Heart className="h-5 w-5 fill-destructive" />
              </div>
            </div>

            {!favorites || favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="h-12 w-12 text-muted/30 mb-4" />
                <p className="text-muted-foreground mb-4">Your saved fabrics will appear here.</p>
                <Button asChild variant="outline">
                  <Link to="/catalog">Explore Fabrics</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.slice(0, 5).map((f: any) => (
                  <Link key={f.id} to={`/fabric/${f.fabric_id}`} className="group flex items-center justify-between rounded-xl border bg-background p-5 transition-all hover:bg-muted/30 hover:shadow-md">
                    <div className="flex items-center gap-4">
                      {f.fabrics?.image_url ? (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <img src={f.fabrics.image_url} alt={f.fabrics.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{f.fabrics?.name}</p>
                        <p className="text-xs text-muted-foreground">{f.fabrics?.type} · ₹{Number(f.fabrics?.price_per_meter || 0).toLocaleString("en-IN")}/m</p>
                      </div>
                    </div>
                    <Heart className="h-5 w-5 fill-destructive text-destructive transition-transform group-hover:scale-125" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quote Requests Section */}
        {quotes.length > 0 && (
          <div className="mt-12 overflow-hidden rounded-3xl border bg-card shadow-sm">
            <div className="border-b bg-muted/30 px-8 py-6">
              <h2 className="font-display text-2xl font-bold">Recent Quote Requests</h2>
              <p className="text-sm text-muted-foreground mt-1">Tracking your price inquiries</p>
            </div>
            <div className="p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {quotes.map((q) => (
                   <div key={q.id} className="group relative rounded-2xl border bg-background p-6 transition-all hover:shadow-md">
                     <div className="flex items-center gap-4 mb-4">
                       {q.fabrics?.image_url ? (
                         <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                           <img src={q.fabrics.image_url} alt={q.fabric_name} className="h-full w-full object-cover" />
                         </div>
                       ) : (
                         <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                           <Package className="h-6 w-6" />
                         </div>
                       )}
                       <div>
                         <p className="font-bold text-lg">{q.fabric_name}</p>
                         <Badge variant="outline" className="border-primary/20 text-primary mt-1">{q.status}</Badge>
                       </div>
                     </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" />
                        {q.items && Array.isArray(q.items) && q.items.length > 0
                          ? `${q.items.length} color${q.items.length > 1 ? 's' : ''}`
                          : (q.selected_color || "Standard")}
                      </span>
                      <span>·</span>
                      <span>{q.quantity} units</span>
                      <span>·</span>
                      <span>{new Date(q.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                    {q.admin_response && (
                      <div className="mt-4 flex gap-3 rounded-xl bg-primary/5 p-4 text-sm text-foreground/90 border border-primary/10">
                        <ClipboardList className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        <p>{q.admin_response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BuyerDashboard;
