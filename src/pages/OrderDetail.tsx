import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
<<<<<<< HEAD
import { ArrowLeft, Package, CheckCircle, Truck, MapPin, Clock, Download, XCircle, ClipboardList, FileText } from "lucide-react";
=======
import { ArrowLeft, Package, CheckCircle, Truck, MapPin, Clock, Download } from "lucide-react";
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

<<<<<<< HEAD
const statusSteps = ["Pending", "Confirmed", "Shipped", "Delivered"];
const statusIcons: Record<string, any> = {
  Pending: Clock,
  Confirmed: CheckCircle,
  Shipped: Truck,
  Delivered: MapPin,
  Cancelled: XCircle,
=======
const statusSteps = ["Pending", "Confirmed", "In Production", "Shipped", "Delivered"];
const statusIcons: Record<string, any> = {
  Pending: Clock,
  Confirmed: CheckCircle,
  "In Production": Package,
  Shipped: Truck,
  Delivered: MapPin,
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
};

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

const generateOrderPDF = (o: any) => {
  const doc = new jsPDF();
  const m = 20;
  let y = m;

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Hera Textiles", m, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text("Order Confirmation", m, y);
  y += 12;
  doc.setDrawColor(200);
  doc.line(m, y, 190, y);
  y += 10;

  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Order Details", m, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const info: [string, string][] = [
    ["Order ID", o.id],
    ["Date", new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
    ["Status", o.status],
    ["Fabric", o.fabric_name],
<<<<<<< HEAD
  ];

  if (o.items && Array.isArray(o.items) && o.items.length > 0) {
    info.push(["Total Quantity", `${o.quantity} meters`]);
  } else {
    info.push(["Color", o.selected_color || "Standard"]);
    info.push(["Quantity Type", o.quantity_type || "Lump"]);
    info.push(["Quantity", `${o.quantity} meters`]);
  }
  
  info.push(["Rate", `₹${Number(o.price_per_meter).toLocaleString("en-IN")}/meter`]);
  info.push(["Total Amount", `₹${Number(o.total).toLocaleString("en-IN")}`]);

=======
    ["Quantity", `${o.quantity} meters`],
    ["Rate", `₹${Number(o.price_per_meter).toLocaleString("en-IN")}/meter`],
    ["Total", `₹${Number(o.total).toLocaleString("en-IN")}`],
  ];
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
  info.forEach(([l, v]) => {
    doc.setTextColor(120); doc.text(l, m, y);
    doc.setTextColor(0); doc.text(v, 70, y);
    y += 7;
  });

<<<<<<< HEAD
  if (o.items && Array.isArray(o.items) && o.items.length > 0) {
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Order Items Breakdown", m, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    // Header for items table
    doc.setTextColor(120);
    doc.text("Color", m, y);
    doc.text("Type", 70, y);
    doc.text("Quantity", 110, y);
    y += 6;
    doc.line(m, y - 4, 150, y - 4);

    o.items.forEach((item: any) => {
      doc.setTextColor(0);
      doc.text(item.color || "Standard", m, y);
      doc.text(item.quantityType || "Lump", 70, y);
      doc.text(`${item.quantity}m`, 110, y);
      y += 6;
    });
    doc.setFontSize(10);
    y += 4;
  }

=======
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Delivery Information", m, y);
  y += 8;
  doc.setFont("helvetica", "normal");

  const del: [string, string][] = [
    ["Name", o.buyer_name],
    ["Company", o.company_name],
    ["Phone", o.phone],
    ["Email", o.email],
    ["Address", o.delivery_address],
  ];
  del.forEach(([l, v]) => {
    doc.setTextColor(120); doc.text(l, m, y);
    doc.setTextColor(0);
    const lines = doc.splitTextToSize(String(v), 110);
    doc.text(lines, 70, y);
    y += lines.length * 6 + 2;
  });

  if (o.courier_name || o.tracking_number) {
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Shipment Details", m, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    if (o.courier_name) { doc.setTextColor(120); doc.text("Courier", m, y); doc.setTextColor(0); doc.text(o.courier_name, 70, y); y += 7; }
    if (o.tracking_number) { doc.setTextColor(120); doc.text("Tracking", m, y); doc.setTextColor(0); doc.text(o.tracking_number, 70, y); y += 7; }
    if (o.dispatch_date) { doc.setTextColor(120); doc.text("Dispatched", m, y); doc.setTextColor(0); doc.text(new Date(o.dispatch_date).toLocaleDateString("en-IN"), 70, y); y += 7; }
  }

  if (o.notes) {
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Notes", m, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(doc.splitTextToSize(o.notes, 160), m, y);
  }

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Thank you for your order — Hera Textiles", m, 280);
  doc.save(`Hera-Order-${o.id.slice(0, 8)}.pdf`);
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !orderId) return;
    const fetchOrder = async () => {
      const { data } = await supabase
        .from("orders")
<<<<<<< HEAD
        .select("*, fabrics:fabric_id_ref(image_url, type, name)")
=======
        .select("*")
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
        .eq("id", orderId)
        .single();
      setOrder(data);

      const { data: notesData } = await supabase
        .from("order_notes")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });
      setNotes(notesData || []);
      setLoading(false);
    };
    fetchOrder();
  }, [user, orderId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold">Order not found</h1>
            <Button variant="ghost" className="mt-4" onClick={() => navigate("/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-background/50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" className="mb-8 hover:bg-primary/5 text-primary group" onClick={() => navigate("/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Orders
        </Button>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            {/* Header Card */}
            <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
              <div className="bg-primary px-8 py-10 text-primary-foreground relative">
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-6 items-center">
                    {order.fabrics?.image_url && (
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 shadow-xl">
                        <img src={order.fabrics.image_url} alt={order.fabric_name} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h1 className="font-display text-4xl font-bold">{order.fabric_name}</h1>
                      <p className="mt-2 text-primary-foreground/70">
                        Order placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${statusColors[order.status] || ""} border-none px-4 py-1.5 text-sm font-semibold`}>
                    {order.status}
                  </Badge>
                </div>
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              </div>

              {/* Status Timeline */}
              <div className="px-8 py-12">
                <h2 className="font-display text-2xl font-bold mb-10">Order Progress</h2>
                {order.status === "Cancelled" ? (
                  <div className="flex flex-col items-center justify-center py-10 text-destructive bg-destructive/5 rounded-2xl border border-destructive/10">
                    <XCircle className="h-16 w-16 mb-4" />
                    <p className="text-xl font-bold">This order has been cancelled.</p>
                  </div>
                ) : (
                  <div className="relative flex items-center justify-between">
                    <div className="absolute left-0 right-0 top-6 h-1 -translate-y-1/2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                      />
                    </div>
                    {statusSteps.map((step, i) => {
                      const Icon = statusIcons[step] || Clock;
                      const isCompleted = i <= currentStepIndex;
                      const isCurrent = i === currentStepIndex;
                      return (
                        <div key={step} className="flex flex-col items-center relative z-10">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                            isCurrent
                              ? "bg-primary text-primary-foreground ring-8 ring-primary/10 scale-110"
                              : isCompleted
                              ? "bg-primary text-primary-foreground"
                              : "bg-background border-2 border-muted text-muted-foreground"
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className={`mt-3 text-xs font-bold uppercase tracking-tighter ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
=======
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl font-bold">{order.fabric_name}</h1>
                <Badge variant="outline" className={statusColors[order.status] || ""}>
                  {order.status}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Order placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            {/* Status Timeline */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-display text-lg font-semibold mb-6">Order Progress</h2>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, i) => {
                  const Icon = statusIcons[step] || Clock;
                  const isCompleted = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  return (
                    <div key={step} className="flex flex-col items-center relative flex-1">
                      {i > 0 && (
                        <div className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                          i <= currentStepIndex ? "bg-primary" : "bg-muted"
                        }`} />
                      )}
                      <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={`mt-2 text-xs text-center ${isCurrent ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
              </div>
            </div>

            {/* Shipment Tracking */}
            {(order.courier_name || order.tracking_number) && (
<<<<<<< HEAD
              <div className="rounded-3xl border bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-lg bg-success/10 p-2 text-success">
                    <Truck className="h-6 w-6" />
                  </div>
                  <h2 className="font-display text-2xl font-bold">Shipment Tracking</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {order.courier_name && (
                    <div className="rounded-2xl bg-muted/30 p-5">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Courier</span>
                      <p className="mt-1 text-lg font-bold">{order.courier_name}</p>
                    </div>
                  )}
                  {order.tracking_number && (
                    <div className="rounded-2xl bg-muted/30 p-5">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tracking ID</span>
                      <p className="mt-1 text-lg font-bold font-mono">{order.tracking_number}</p>
                    </div>
                  )}
                  {order.dispatch_date && (
                    <div className="rounded-2xl bg-muted/30 p-5">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Dispatched</span>
                      <p className="mt-1 text-lg font-bold">{new Date(order.dispatch_date).toLocaleDateString("en-IN")}</p>
=======
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Shipment Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {order.courier_name && (
                    <div>
                      <span className="text-muted-foreground">Courier</span>
                      <p className="font-medium">{order.courier_name}</p>
                    </div>
                  )}
                  {order.tracking_number && (
                    <div>
                      <span className="text-muted-foreground">Tracking Number</span>
                      <p className="font-medium">{order.tracking_number}</p>
                    </div>
                  )}
                  {order.dispatch_date && (
                    <div>
                      <span className="text-muted-foreground">Dispatch Date</span>
                      <p className="font-medium">{new Date(order.dispatch_date).toLocaleDateString("en-IN")}</p>
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {notes.length > 0 && (
<<<<<<< HEAD
              <div className="rounded-3xl border bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <h2 className="font-display text-2xl font-bold">Recent Updates</h2>
                </div>
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="group rounded-2xl border bg-background p-6 transition-all hover:bg-muted/30">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-foreground leading-relaxed">{note.note}</p>
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">
=======
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Updates</h2>
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm">{note.note}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
                        {new Date(note.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
<<<<<<< HEAD
            <div className="sticky top-24 space-y-8">
              {/* Summary Card */}
              <div className="rounded-3xl border bg-card p-8 shadow-sm">
                <h3 className="font-display text-2xl font-bold mb-6">Order Summary</h3>
                <div className="space-y-6 text-sm">
                  {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Itemized List</p>
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="group rounded-xl bg-muted/30 p-4 transition-all hover:bg-muted/50">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-muted-foreground uppercase">{item.color}</span>
                            <Badge variant="outline" className="text-[10px] font-bold px-2 py-0">{item.quantityType}</Badge>
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="text-lg font-bold">{item.quantity}m</span>
                            <span className="text-xs text-muted-foreground">₹{Number(order.price_per_meter).toLocaleString("en-IN")}/m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 pb-6 border-b">
                       <div className="flex justify-between">
                        <span className="text-muted-foreground">Color</span>
                        <span className="font-bold">{order.selected_color || "Standard"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity Type</span>
                        <span className="font-bold">{order.quantity_type || "Lump"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-bold">{order.quantity} meters</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal Rate</span>
                      <span className="font-medium">₹{Number(order.price_per_meter).toLocaleString("en-IN")}/m</span>
                    </div>
                    <div className="flex justify-between mt-4 rounded-2xl bg-primary/5 p-5 border border-primary/10">
                      <span className="font-bold text-lg">Total</span>
                      <span className="text-2xl font-black text-primary">₹{Number(order.total).toLocaleString("en-IN")}</span>
                    </div>
=======
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-display text-lg font-semibold">Order Details</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{order.quantity} meters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-medium">₹{Number(order.price_per_meter).toLocaleString("en-IN")}/m</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">₹{Number(order.total).toLocaleString("en-IN")}</span>
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
                  </div>
                </div>
              </div>

<<<<<<< HEAD
              {/* Delivery Details */}
              <div className="rounded-3xl border bg-card p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-bold">Delivery Info</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-bold text-lg">{order.buyer_name}</p>
                    <p className="font-medium text-muted-foreground">{order.company_name}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 p-4 font-medium leading-relaxed">
                    {order.delivery_address}
                  </div>
                  <div className="pt-2 space-y-2">
                    <p className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> {order.phone}</p>
                    <p className="flex items-center gap-2 text-muted-foreground truncate"><FileText className="h-4 w-4" /> {order.email}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full rounded-2xl py-6 border-2 hover:bg-primary/5 hover:text-primary transition-all font-bold"
                  onClick={() => generateOrderPDF(order)}
                >
                  <Download className="mr-2 h-5 w-5" /> Download Confirmation
                </Button>

                <Button
                  className="w-full rounded-2xl py-6 shadow-lg shadow-primary/20 font-bold text-lg"
                  onClick={() => navigate(`/order/${order.fabric_id_ref || order.fabric_id}`)}
                >
                  Reorder This Fabric
                </Button>

                {order.notes && (
                  <div className="rounded-2xl bg-secondary/10 p-5 border border-secondary/20">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Your Original Notes</h4>
                    <p className="text-sm italic text-secondary-foreground/80">"{order.notes}"</p>
                  </div>
                )}
              </div>
=======
              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-display text-lg font-semibold">Delivery</h3>
                <div className="mt-4 text-sm">
                  <p className="font-medium">{order.buyer_name}</p>
                  <p className="text-muted-foreground">{order.company_name}</p>
                  <p className="mt-2 text-muted-foreground">{order.delivery_address}</p>
                  <p className="mt-2 text-muted-foreground">{order.phone}</p>
                  <p className="text-muted-foreground">{order.email}</p>
                </div>
              </div>

              {order.notes && (
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold">Your Notes</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}

              {/* Download PDF */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => generateOrderPDF(order)}
              >
                <Download className="mr-2 h-4 w-4" /> Download Order Confirmation
              </Button>

              {/* Repeat Order */}
              <Button
                className="w-full"
                onClick={() => navigate(`/order/${order.fabric_id_ref || order.fabric_id}`)}
              >
                Reorder This Fabric
              </Button>
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderDetail;
