import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, CheckCircle, Truck, MapPin, Clock, Download, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

const statusSteps = ["Pending", "Confirmed", "In Production", "Shipped", "Delivered"];
const statusIcons: Record<string, any> = {
  Pending: Clock,
  Confirmed: CheckCircle,
  "In Production": Package,
  Shipped: Truck,
  Delivered: MapPin,
  Cancelled: XCircle,
};

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning border-warning/20",
  Confirmed: "bg-primary/10 text-primary border-primary/20",
  "In Production": "bg-secondary/10 text-secondary border-secondary/20",
  Shipped: "bg-success/10 text-success border-success/20",
  Delivered: "bg-success/15 text-success border-success/30",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
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
    ["Quantity", `${o.quantity} meters`],
    ["Rate", `₹${Number(o.price_per_meter).toLocaleString("en-IN")}/meter`],
    ["Total", `₹${Number(o.total).toLocaleString("en-IN")}`],
  ];
  info.forEach(([l, v]) => {
    doc.setTextColor(120); doc.text(l, m, y);
    doc.setTextColor(0); doc.text(v, 70, y);
    y += 7;
  });

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
        .select("*")
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
              {order.status === "Cancelled" ? (
                <div className="flex flex-col items-center justify-center py-6 text-destructive">
                  <XCircle className="h-12 w-12 mb-4" />
                  <p className="text-lg font-semibold">This order has been cancelled.</p>
                </div>
              ) : (
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
                </div>
              )}
            </div>

            {/* Shipment Tracking */}
            {(order.courier_name || order.tracking_number) && (
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
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {notes.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Updates</h2>
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm">{note.note}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
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
                  </div>
                </div>
              </div>

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
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderDetail;
