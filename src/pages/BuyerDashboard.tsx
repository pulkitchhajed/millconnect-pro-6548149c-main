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
  "In Production": "bg-secondary/10 text-secondary border-secondary/20",
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
        .select("*")
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
        .select("*")
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
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome back! Here's your activity overview.</p>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 text-center">
            <Package className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-2 text-2xl font-bold">{stats.activeOrders}</p>
            <p className="text-sm text-muted-foreground">Active Orders</p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-2 text-2xl font-bold">{stats.totalOrders}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center">
            <FileText className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-2 text-2xl font-bold">₹{stats.totalSpent.toLocaleString("en-IN")}</p>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Recent Active Orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">Recent Active Orders</h2>
              <Button asChild variant="ghost" size="sm"><Link to="/orders">Order History <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active orders right now. <Link to="/catalog" className="text-primary underline">Browse catalog</Link></p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <Link key={o.id} to={`/orders/${o.id}`} className="block rounded-lg border bg-card p-4 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{o.fabric_name}</p>
                        <p className="text-xs text-muted-foreground">{o.quantity}m · ₹{Number(o.total).toLocaleString("en-IN")}</p>
                      </div>
                      <Badge variant="outline" className={statusColors[o.status] || ""}>{o.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Favorites */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">Favorites</h2>
              <Heart className="h-5 w-5 text-destructive" />
            </div>
            {!favorites || favorites.length === 0 ? (
              <p className="text-muted-foreground text-sm">No favorites yet. Heart fabrics from the <Link to="/catalog" className="text-primary underline">catalog</Link>.</p>
            ) : (
              <div className="space-y-3">
                {favorites.slice(0, 5).map((f: any) => (
                  <Link key={f.id} to={`/fabric/${f.fabric_id}`} className="block rounded-lg border bg-card p-4 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{f.fabrics?.name}</p>
                        <p className="text-xs text-muted-foreground">{f.fabrics?.type} · ₹{Number(f.fabrics?.price_per_meter || 0).toLocaleString("en-IN")}/m</p>
                      </div>
                      <Heart className="h-4 w-4 fill-destructive text-destructive" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quote Requests */}
        {quotes.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-semibold mb-4">Quote Requests</h2>
            <div className="space-y-3">
              {quotes.map((q) => (
                <div key={q.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{q.fabric_name}</p>
                      <p className="text-xs text-muted-foreground">{q.quantity} units · {new Date(q.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                    <Badge variant="outline">{q.status}</Badge>
                  </div>
                  {q.admin_response && (
                    <p className="mt-2 text-sm rounded-lg bg-muted/50 p-3">{q.admin_response}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BuyerDashboard;
