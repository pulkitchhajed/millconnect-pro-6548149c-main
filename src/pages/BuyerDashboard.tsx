import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Package, ClipboardList, FileText, ArrowRight, FlaskConical, Paintbrush } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
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

const BuyerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: favorites } = useFavorites();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [sampleRequests, setSampleRequests] = useState<any[]>([]);
  const [designRequests, setDesignRequests] = useState<any[]>([]);
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

      const { data: samples } = await supabase
        .from("sample_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setSampleRequests(samples || []);

      const { data: designs } = await supabase
        .from("design_requests" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setDesignRequests(designs || []);
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
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary/80 py-16 text-white shadow-soft">
        <div className="container mx-auto px-6">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-5xl font-black tracking-tighter">Your Workspace</h1>
            <p className="max-w-xl text-primary-foreground/80 font-medium text-lg">
              Manage your orders, track shipments, and explore premium fabrics in your personalized command center.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto -mt-12 px-6 pb-20">

        {/* Glass Stats Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card-premium p-8 group relative overflow-hidden">
            <div className="absolute top-0 right-0 h-1.5 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Active Orders</p>
                <p className="mt-3 text-4xl font-black tracking-tighter">{stats.activeOrders}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-4 text-primary transition-premium group-hover:bg-primary group-hover:text-white shadow-soft">
                <Package className="h-7 w-7" />
              </div>
            </div>
          </div>

          <div className="card-premium p-8 group relative overflow-hidden">
            <div className="absolute top-0 right-0 h-1.5 w-0 bg-secondary transition-all duration-500 group-hover:w-full" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Total Orders</p>
                <p className="mt-3 text-4xl font-black tracking-tighter">{stats.totalOrders}</p>
              </div>
              <div className="rounded-2xl bg-secondary/10 p-4 text-secondary transition-premium group-hover:bg-secondary group-hover:text-white shadow-soft">
                <ClipboardList className="h-7 w-7" />
              </div>
            </div>
          </div>

          <div className="card-premium p-8 group relative overflow-hidden">
            <div className="absolute top-0 right-0 h-1.5 w-0 bg-accent transition-all duration-500 group-hover:w-full" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Total Investment</p>
                <p className="mt-3 text-3xl font-black tracking-tighter">₹{stats.totalSpent.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-2xl bg-accent/10 p-4 text-accent transition-premium group-hover:bg-accent group-hover:text-white shadow-soft">
                <FileText className="h-7 w-7" />
              </div>
            </div>
          </div>

          <div className="card-premium p-8 group relative overflow-hidden">
            <div className="absolute top-0 right-0 h-1.5 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px]">APC Requests</p>
                <p className="mt-3 text-4xl font-black tracking-tighter">{designRequests.length}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-4 text-primary transition-premium group-hover:bg-primary group-hover:text-white shadow-soft">
                <Paintbrush className="h-7 w-7" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Active Orders Card */}
          <div className="section-premium">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-black text-foreground">Recent Orders</h2>
                <p className="text-sm text-muted-foreground mt-1">Updates on your ongoing shipments</p>
              </div>
              <Button asChild variant="ghost" className="hover:bg-primary/10 text-primary font-bold transition-premium">
                <Link to="/orders">View History <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted/30 mb-4" />
                <p className="text-muted-foreground mb-4 font-medium">No active orders right now.</p>
                <Button asChild size="lg" className="rounded-2xl font-black uppercase tracking-wider">
                  <Link to="/catalog">Browse Catalog</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((o) => (
                  <Link key={o.id} to={`/orders/${o.id}`} className="card-premium flex items-center justify-between bg-background p-5 hover:border-primary/40 group overflow-hidden">
                    <div className="flex items-center gap-4 z-10">
                      {o.fabrics?.image_url ? (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted shadow-inner">
                          <img src={o.fabrics.image_url} alt={o.fabric_name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground shadow-inner">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">{o.fabric_name}</p>
                        <div className="mt-1 flex items-center gap-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {o.items && Array.isArray(o.items) && o.items.length > 0
                              ? `${o.items.length} color${o.items.length > 1 ? 's' : ''}`
                              : (o.selected_color || "Standard")}
                          </span>
                          <span>·</span>
                          <span>{o.quantity}m</span>
                          <span>·</span>
                          <span className="text-primary font-black">₹{Number(o.total).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={`${statusColors[o.status] || ""} border-none px-3 py-1 font-black text-[10px] uppercase tracking-wider`}>{o.status}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Favorites Section */}
          <div className="section-premium">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-black text-foreground">My Favorites</h2>
                <p className="text-sm text-muted-foreground mt-1">Quick access to fabrics you loved</p>
              </div>
              <div className="rounded-2xl bg-destructive/10 p-3 text-destructive shadow-soft animate-bounce-subtle">
                <Heart className="h-5 w-5 fill-destructive" />
              </div>
            </div>

            {!favorites || favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="h-12 w-12 text-muted/30 mb-4" />
                <p className="text-muted-foreground mb-4 font-medium">Your saved fabrics will appear here.</p>
                <Button asChild size="lg" className="rounded-2xl font-black uppercase tracking-wider">
                  <Link to="/catalog">Explore Fabrics</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.slice(0, 5).map((f: any) => (
                  <Link key={f.id} to={`/fabric/${f.fabric_id}`} className="card-premium flex items-center justify-between bg-background p-5 hover:border-destructive/40 group overflow-hidden">
                    <div className="flex items-center gap-4">
                      {f.fabrics?.image_url ? (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted shadow-inner">
                          <img src={f.fabrics.image_url} alt={f.fabrics.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground shadow-inner">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">{f.fabrics?.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{f.fabrics?.type} · ₹{Number(f.fabrics?.price_per_meter || 0).toLocaleString("en-IN")}/m</p>
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
          <div className="mt-12 overflow-hidden section-premium p-0">
            <div className="border-b border-white/10 bg-muted/30 px-8 py-6">
              <h2 className="font-display text-2xl font-black text-foreground">Recent Quote Requests</h2>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Tracking your price inquiries</p>
            </div>
            <div className="p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {quotes.map((q) => (
                  <div key={q.id} className="card-premium group relative bg-background p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {q.fabrics?.image_url ? (
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted shadow-inner">
                          <img src={q.fabrics.image_url} alt={q.fabric_name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground shadow-inner">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                      <div>
                        <p className="font-black text-lg leading-tight uppercase tracking-tight">{q.fabric_name}</p>
                        <Badge variant="outline" className="border-primary/20 text-primary mt-2 font-black text-[10px] uppercase tracking-wider">{q.status}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Package className="h-3 w-3" />
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
                      <div className="mt-4 flex gap-3 rounded-2xl bg-primary/5 p-4 text-sm text-foreground/90 border border-primary/10 shadow-inner">
                        <ClipboardList className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        <p className="font-medium italic leading-relaxed">"{q.admin_response}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sample Requests Section */}
        {sampleRequests.length > 0 && (
          <div className="mt-12 overflow-hidden section-premium p-0">
            <div className="border-b border-white/10 bg-muted/30 px-8 py-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black text-foreground">Sample Requests</h2>
                <p className="text-sm text-muted-foreground mt-1 font-medium">Track your physical sample deliveries</p>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {sampleRequests.map((s) => (
                  <div key={s.id} className="card-premium flex items-center justify-between bg-background p-4 hover:border-secondary/30">
                    <div className="flex items-center gap-4">
                      {s.fabric_image ? (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted shadow-inner">
                          <img src={s.fabric_image} alt={s.fabric_name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-secondary/10 bg-secondary/5 text-secondary shadow-inner"><Package className="h-6 w-6" /></div>
                      )}
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">{s.fabric_name}</p>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>{new Date(s.created_at).toLocaleDateString("en-IN")}</span>
                          {s.price && (
                            <>
                              <span>·</span>
                              <span className="text-primary font-black">₹{Number(s.price).toLocaleString("en-IN")}</span>
                            </>
                          )}
                          {s.sample_pack_id && <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 leading-none shadow-soft">Pack</Badge>}
                        </div>
                      </div>
                    </div>
                    <Badge className={`rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-wider border-none ${s.status === 'Approved' ? 'bg-success/10 text-success' :
                        s.status === 'Shipped' ? 'bg-primary/10 text-primary' :
                          s.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
                            'bg-warning/10 text-warning'
                      }`}>{s.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Custom APC Requests Section */}
        <div className="mt-12 overflow-hidden section-premium p-0">
          <div className="border-b border-white/10 bg-muted/30 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Paintbrush className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black text-foreground">Custom APC Requests</h2>
                <p className="text-sm text-muted-foreground mt-1 font-medium">Submit or track your personal cloth designs</p>
              </div>
            </div>
            <Button asChild size="lg" className="rounded-2xl font-black uppercase tracking-wider shadow-premium">
              <Link to="/design-requests">Submit New Design</Link>
            </Button>
          </div>
          <div className="p-8">
            {designRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Paintbrush className="h-16 w-16 text-muted/20 mb-4" />
                <p className="text-muted-foreground font-medium">No APC Requests yet. Start your vision today.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {designRequests.map((d) => (
                  <Link
                    key={d.id}
                    to="/design-requests"
                    className="card-premium flex flex-col bg-background p-0 group overflow-hidden"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-muted shadow-inner relative">
                      <img src={d.image_url} alt="Design" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`${d.status === 'Responded' ? 'bg-primary/20 text-primary' :
                            d.status === 'Countered' ? 'bg-secondary/20 text-secondary' :
                              d.status === 'Accepted' ? 'bg-success/20 text-success' :
                                d.status === 'Rejected' ? 'bg-destructive/20 text-destructive' :
                                  'bg-warning/20 text-warning'
                          } font-black text-[10px] uppercase tracking-widest border-none px-3 py-1 shadow-soft`}>{d.status}</Badge>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{new Date(d.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-black uppercase tracking-tight mb-2">Quantity: {d.quantity}m</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 italic font-medium leading-relaxed mb-4">
                        "{d.description || "No description provided."}"
                      </p>
                      {d.status === 'Responded' && (
                        <div className="mt-auto pt-4 border-t border-black/5 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Price Point</p>
                            <p className="text-sm font-black text-primary">₹{d.admin_price}/m</p>
                          </div>
                          {d.admin_weight && (
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Program</p>
                              <p className="text-[10px] font-bold truncate leading-tight">{d.admin_weight}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-10 text-center">
              <Button asChild variant="ghost" className="text-muted-foreground font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-premium group">
                <Link to="/design-requests">Manage All Requests <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BuyerDashboard;
