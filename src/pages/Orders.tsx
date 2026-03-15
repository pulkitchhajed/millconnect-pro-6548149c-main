import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning border-warning/20",
  Confirmed: "bg-primary/10 text-primary border-primary/20",
<<<<<<< HEAD
  Shipped: "bg-success/10 text-success border-success/20",
  Delivered: "bg-success/15 text-success border-success/30",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
=======
  "In Production": "bg-secondary/10 text-secondary border-secondary/20",
  Shipped: "bg-success/10 text-success border-success/20",
  Delivered: "bg-success/15 text-success border-success/30",
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
};

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold md:text-4xl">My Orders</h1>
        <p className="mt-2 text-muted-foreground">Track your fabric orders and their status</p>

        {(authLoading || loading) ? (
          <p className="mt-12 text-center text-muted-foreground">Loading orders...</p>
        ) : !user ? (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted"><ClipboardList className="h-10 w-10 text-muted-foreground" /></div>
            <h2 className="mt-6 font-display text-xl font-semibold">Sign in to view orders</h2>
            <Button asChild className="mt-6"><Link to="/auth">Sign In</Link></Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted"><ClipboardList className="h-10 w-10 text-muted-foreground" /></div>
            <h2 className="mt-6 font-display text-xl font-semibold">No orders yet</h2>
            <Button asChild className="mt-6"><Link to="/catalog">Browse Catalog</Link></Button>
          </div>
        ) : (
<<<<<<< HEAD
          <div className="mt-8 space-y-10">
            {/* Active Orders Section */}
            <div>
              <h2 className="text-xl font-display font-semibold mb-4 text-primary">Active Orders</h2>
              {orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length === 0 ? (
                <p className="text-muted-foreground text-sm">No active orders.</p>
              ) : (
                <div className="space-y-4">
                  {orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").map((order) => (
                    <Link key={order.id} to={`/orders/${order.id}`} className="block rounded-xl border bg-card p-5 transition-all hover:shadow-md">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-display text-lg font-semibold">{order.fabric_name}</h3>
                            <Badge variant="outline" className={statusColors[order.status] || ""}>{order.status}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {order.company_name} · {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{order.quantity} meters</p>
                          <p className="text-xl font-bold text-primary">₹{Number(order.total).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.preventDefault(); window.location.href = `/order/${order.fabric_id_ref || order.fabric_id}`; }}
                        >
                          <RefreshCw className="mr-1 h-3 w-3" /> Reorder
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Order History Section */}
            <div>
              <h2 className="text-xl font-display font-semibold mb-4 text-muted-foreground">Order History</h2>
              {orders.filter(o => o.status === "Delivered" || o.status === "Cancelled").length === 0 ? (
                <p className="text-muted-foreground text-sm">No past orders.</p>
              ) : (
                <div className="space-y-4 opacity-80">
                  {orders.filter(o => o.status === "Delivered" || o.status === "Cancelled").map((order) => (
                    <Link key={order.id} to={`/orders/${order.id}`} className="block rounded-xl border bg-card p-5 transition-all hover:shadow-md">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-display text-lg font-semibold text-muted-foreground">{order.fabric_name}</h3>
                            <Badge variant="outline" className={statusColors[order.status] || ""}>{order.status}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {order.company_name} · {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{order.quantity} meters</p>
                          <p className="text-xl font-bold text-muted-foreground">₹{Number(order.total).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.preventDefault(); window.location.href = `/order/${order.fabric_id_ref || order.fabric_id}`; }}
                        >
                          <RefreshCw className="mr-1 h-3 w-3" /> Reorder
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
=======
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="block rounded-xl border bg-card p-5 transition-all hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-lg font-semibold">{order.fabric_name}</h3>
                      <Badge variant="outline" className={statusColors[order.status] || ""}>{order.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.company_name} · {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{order.quantity} meters</p>
                    <p className="text-xl font-bold text-primary">₹{Number(order.total).toLocaleString("en-IN")}</p>
                  </div>
                </div>
                {/* Reorder button */}
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.preventDefault(); window.location.href = `/order/${order.fabric_id_ref || order.fabric_id}`; }}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" /> Reorder
                  </Button>
                </div>
              </Link>
            ))}
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Orders;
