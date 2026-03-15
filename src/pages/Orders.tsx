import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, RefreshCw, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning border-warning/20",
  Confirmed: "bg-primary/10 text-primary border-primary/20",
  "Advance Payment Received": "bg-secondary/10 text-secondary border-secondary/20",
  "Bill Amount Received": "bg-success/10 text-success border-success/20",
  Staged: "bg-secondary/15 text-secondary border-secondary/30",
  Shipped: "bg-success/10 text-success border-success/20",
  Delivered: "bg-success/15 text-success border-success/30",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
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
    <div className="min-h-screen bg-background/50">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <header className="section-premium mb-12">
          <h1 className="font-display text-4xl font-black text-foreground tracking-tight uppercase">My Orders</h1>
          <p className="mt-2 text-muted-foreground font-medium italic">Track your fabric orders and their journey</p>
        </header>

        {(authLoading || loading) ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="font-display font-bold text-lg text-muted-foreground">Fetching your history...</p>
          </div>
        ) : !user ? (
          <div className="mt-20 flex flex-col items-center text-center section-premium py-20">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-muted/20 text-muted/40 mb-8 blur-[0.5px]">
              <ClipboardList className="h-12 w-12" />
            </div>
            <h2 className="font-display text-2xl font-black text-foreground uppercase tracking-tight">Sign in to view orders</h2>
            <Button asChild className="mt-8 h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-premium transition-premium hover:scale-[1.02]">
              <Link to="/auth">Sign In Now</Link>
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-20 flex flex-col items-center text-center section-premium py-20">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-muted/20 text-muted/40 mb-8">
              <ClipboardList className="h-12 w-12" />
            </div>
            <h2 className="font-display text-2xl font-black text-foreground uppercase tracking-tight">No orders yet</h2>
            <p className="text-muted-foreground mt-2 font-medium italic">Start your collection today</p>
            <Button asChild className="mt-8 h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-premium transition-premium hover:scale-[1.02]">
              <Link to="/catalog">Browse Catalog</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Active Orders Section */}
            <div>
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="h-8 w-1.5 bg-primary rounded-full shadow-primary" />
                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Active Shipments</h2>
              </div>
              
              {orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length === 0 ? (
                <div className="card-premium py-12 text-center bg-background/40">
                  <p className="text-muted-foreground font-medium italic">No active shipments at the moment.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").map((order) => (
                    <Link key={order.id} to={`/orders/${order.id}`} className="card-premium group hover:border-primary/40 transition-premium relative overflow-hidden">
                      <div className="absolute -top-12 -right-12 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between relative">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-soft">
                            <ClipboardList className="h-8 w-8" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-black text-xl uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{order.fabric_name}</h3>
                              <Badge variant="outline" className={`font-black text-[10px] uppercase tracking-widest border-none px-3 h-6 rounded-lg ${statusColors[order.status] || ""}`}>
                                {order.status}
                              </Badge>
                              {order.status === "Confirmed" && (
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[10px] uppercase tracking-widest px-2 h-6 rounded-lg gap-1">
                                  <CreditCard className="h-3 w-3" /> Payment Pending
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
                              <span>Order #{order.id.slice(0, 8)}</span>
                              <span className="opacity-20">•</span>
                              <span>{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:text-right gap-8 border-t sm:border-t-0 pt-4 sm:pt-0 border-black/5">
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Quantity</p>
                            <p className="font-black text-lg text-foreground tracking-tight">{order.quantity}m</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1 text-right">Total Payable</p>
                            <p className="text-2xl font-black text-primary tracking-tighter">₹{Number(order.total).toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end border-t border-black/5 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 h-9 px-4 hover:bg-primary hover:text-white transition-premium border-black/10"
                          onClick={(e) => { e.preventDefault(); window.location.href = `/order/${order.fabric_id_ref || order.fabric_id}`; }}
                        >
                          <RefreshCw className="h-3 w-3" /> Reorder Quality
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Order History Section */}
            <div className="opacity-80">
               <div className="flex items-center gap-3 mb-8 px-2">
                <div className="h-8 w-1.5 bg-muted rounded-full" />
                <h2 className="text-2xl font-black text-muted-foreground uppercase tracking-tight">Order History</h2>
              </div>
              
              {orders.filter(o => o.status === "Delivered" || o.status === "Cancelled").length === 0 ? (
                <div className="py-12 text-center rounded-3xl border-2 border-dashed border-muted/20">
                  <p className="text-muted-foreground font-medium italic opacity-50">No past orders in your history.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {orders.filter(o => o.status === "Delivered" || o.status === "Cancelled").map((order) => (
                    <Link key={order.id} to={`/orders/${order.id}`} className="card-premium group hover:border-primary/20 transition-premium py-4 opacity-70 hover:opacity-100 grayscale hover:grayscale-0">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground">
                            <ClipboardList className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-black text-base uppercase tracking-tight text-foreground">{order.fabric_name}</h3>
                              <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-widest border-none px-2 h-5 rounded-md ${statusColors[order.status] || ""}`}>
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              Completed · {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-10 sm:text-right">
                          <div className="hidden sm:block">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Quantity</p>
                            <p className="font-black text-sm text-foreground">{order.quantity}m</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Paid</p>
                            <p className="text-xl font-black text-foreground/60 tracking-tighter">₹{Number(order.total).toLocaleString("en-IN")}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-premium"
                            onClick={(e) => { e.preventDefault(); window.location.href = `/order/${order.fabric_id_ref || order.fabric_id}`; }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
