import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
<<<<<<< HEAD
  Package, TrendingUp, Users, ClipboardList, Plus, Edit, Trash2, MessageSquare, BarChart3, Truck, X
=======
  Package, TrendingUp, Users, ClipboardList, Plus, Edit, Trash2, MessageSquare, BarChart3, Truck,
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Fabric } from "@/hooks/useFabrics";

<<<<<<< HEAD
const statusSteps = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
=======
const statusSteps = ["Pending", "Confirmed", "In Production", "Shipped", "Delivered"];
>>>>>>> e46736471f833d2da9d10d2067485c256946635b

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

const AdminDashboard = () => {
  const { user } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, monthlyOrders: 0, revenue: 0, topFabrics: [] as any[], topBuyers: [] as any[] });
  const [loading, setLoading] = useState(true);

  // Fabric form
  const [fabricDialog, setFabricDialog] = useState(false);
  const [editingFabric, setEditingFabric] = useState<Fabric | null>(null);
  const [fabricForm, setFabricForm] = useState({
    name: "", type: "", description: "", colors: "", min_order: 100, price_per_meter: 0,
<<<<<<< HEAD
    unit: "meters", available: true, image_url: "", gsm: "", weave: "", width: "", composition: "", finish: "", shrinkage: "", category: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
=======
    unit: "meters", available: true, image_url: "", gsm: "", weave: "", width: "", composition: "", finish: "", shrinkage: "",
  });
>>>>>>> e46736471f833d2da9d10d2067485c256946635b

  // Note form
  const [noteDialog, setNoteDialog] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // Shipment form
  const [shipmentDialog, setShipmentDialog] = useState<string | null>(null);
  const [shipmentForm, setShipmentForm] = useState({ courier_name: "", tracking_number: "", dispatch_date: "" });

  const fetchAll = async () => {
    const [ordersRes, fabricsRes, quotesRes] = await Promise.all([
<<<<<<< HEAD
      supabase.from("orders").select("*, fabrics:fabric_id_ref(image_url)").order("created_at", { ascending: false }),
      supabase.from("fabrics").select("*").order("created_at", { ascending: true }),
      supabase.from("quote_requests").select("*, fabrics:fabric_id(image_url)").order("created_at", { ascending: false }),
=======
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("fabrics").select("*").order("created_at", { ascending: true }),
      supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
    ]);
    const allOrders = ordersRes.data || [];
    setOrders(allOrders);
    setFabrics((fabricsRes.data || []) as Fabric[]);
    setQuotes(quotesRes.data || []);

    // Analytics
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthly = allOrders.filter((o) => o.created_at >= monthStart).length;
    const revenue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);

    // Top fabrics
    const fabricCount: Record<string, { name: string; count: number }> = {};
    allOrders.forEach((o) => {
      if (!fabricCount[o.fabric_name]) fabricCount[o.fabric_name] = { name: o.fabric_name, count: 0 };
      fabricCount[o.fabric_name].count++;
    });
    const topFabrics = Object.values(fabricCount).sort((a, b) => b.count - a.count).slice(0, 5);

    // Top buyers
    const buyerCount: Record<string, { name: string; total: number }> = {};
    allOrders.forEach((o) => {
      const key = o.company_name || o.buyer_name;
      if (!buyerCount[key]) buyerCount[key] = { name: key, total: 0 };
      buyerCount[key].total += Number(o.total);
    });
    const topBuyers = Object.values(buyerCount).sort((a, b) => b.total - a.total).slice(0, 5);

    setStats({ totalOrders: allOrders.length, monthlyOrders: monthly, revenue, topFabrics, topBuyers });
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  // Realtime subscription
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  if (adminLoading || loading) {
    return <div className="min-h-screen"><Navbar /><div className="container mx-auto flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Loading...</p></div><Footer /></div>;
  }

  if (!isAdmin) {
    return <div className="min-h-screen"><Navbar /><div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4"><div className="text-center"><h1 className="font-display text-2xl font-bold">Access Denied</h1><p className="mt-2 text-muted-foreground">You don't have admin permissions.</p><Button className="mt-4" onClick={() => navigate("/")}>Go Home</Button></div></div><Footer /></div>;
  }

<<<<<<< HEAD
  const sendEmailNotification = async (order: any, type: 'status' | 'note', extraData?: string) => {
    console.log("Triggering email notification for:", order.email, type, extraData);
    const subject = type === 'status'
      ? `Order Status Updated: ${order.fabric_name}`
      : `New Update on your Order: ${order.fabric_name}`;

    const html = type === 'status'
      ? `<p>Hello ${order.buyer_name},</p><p>Your order for <b>${order.fabric_name}</b> has been updated to: <b>${extraData}</b>.</p><p>Check your dashboard for details.</p>`
      : `<p>Hello ${order.buyer_name},</p><p>A new note has been added to your order for <b>${order.fabric_name}</b>:</p><blockquote>${extraData}</blockquote><p>Check your dashboard for details.</p>`;

    try {
      const { data, error } = await supabase.functions.invoke('send-order-update', {
        body: { email: order.email, subject, html }
      });
      console.log("Edge Function Response:", { data, error });
      if (error) {
        console.error("Email notification failed:", error);
        toast.error("Email notification failed. (Note: On Resend Free tier, you can only send to your own email until domain is verified)");
      } else {
        toast.success("Notification email sent to buyer");
      }
    } catch (err) {
      console.error("Email error:", err);
    }
  };

  const getWhatsAppUrl = (order: any, type: 'status' | 'note', extraData?: string) => {
    const message = type === 'status'
      ? `Hello ${order.buyer_name}, your order for ${order.fabric_name} status has been updated to: ${extraData}. Check details here: ${window.location.origin}/orders/${order.id}`
      : `Hello ${order.buyer_name}, a new update has been added to your order for ${order.fabric_name}: "${extraData}". Check details here: ${window.location.origin}/orders/${order.id}`;

    let cleanPhone = order.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const triggerWhatsApp = (order: any, type: 'status' | 'note', extraData?: string) => {
    const whatsappUrl = getWhatsAppUrl(order, type, extraData);
    const win = window.open(whatsappUrl, '_blank');
    if (!win) {
      toast("WhatsApp blocked by popup blocker. Use the button below.", {
        action: {
          label: "Open WhatsApp",
          onClick: () => window.open(whatsappUrl, '_blank')
        }
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) toast.error("Failed to update status");
    else {
      toast.success(`Status updated to ${status}`);
      const order = orders.find(o => o.id === orderId);
      if (order) {
        sendEmailNotification(order, 'status', status);
        if (confirm("Would you like to send a WhatsApp notification as well?")) {
          triggerWhatsApp(order, 'status', status);
        }
      }
      fetchAll();
    }
=======
  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) toast.error("Failed to update status");
    else { toast.success(`Status updated to ${status}`); fetchAll(); }
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
  };

  const addNote = async () => {
    if (!noteDialog || !noteText.trim()) return;
    const { error } = await supabase.from("order_notes").insert({
      order_id: noteDialog, admin_user_id: user!.id, note: noteText.trim(),
    });
    if (error) toast.error("Failed to add note");
<<<<<<< HEAD
    else {
      toast.success("Note added");
      const order = orders.find(o => o.id === noteDialog);
      if (order) {
        sendEmailNotification(order, 'note', noteText.trim());
        if (confirm("Would you like to send a WhatsApp notification as well?")) {
          triggerWhatsApp(order, 'note', noteText.trim());
        }
      }
      setNoteDialog(null);
      setNoteText("");
    }
=======
    else { toast.success("Note added"); setNoteDialog(null); setNoteText(""); }
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
  };

  const updateShipment = async () => {
    if (!shipmentDialog) return;
    const { error } = await supabase.from("orders").update({
      courier_name: shipmentForm.courier_name || null,
      tracking_number: shipmentForm.tracking_number || null,
      dispatch_date: shipmentForm.dispatch_date || null,
    }).eq("id", shipmentDialog);
    if (error) toast.error("Failed to update shipment");
    else { toast.success("Shipment updated"); setShipmentDialog(null); fetchAll(); }
  };

<<<<<<< HEAD
  const openFabricForm = async (fabric?: Fabric) => {
    setImageFiles([]);
    setImagesToDelete([]);
=======
  const openFabricForm = (fabric?: Fabric) => {
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
    if (fabric) {
      setEditingFabric(fabric);
      setFabricForm({
        name: fabric.name, type: fabric.type, description: fabric.description, colors: fabric.colors,
        min_order: fabric.min_order, price_per_meter: Number(fabric.price_per_meter), unit: fabric.unit,
        available: fabric.available, image_url: fabric.image_url || "",
        gsm: fabric.gsm?.toString() || "", weave: fabric.weave || "", width: fabric.width || "",
<<<<<<< HEAD
        composition: fabric.composition || "", finish: fabric.finish || "", shrinkage: fabric.shrinkage || "", category: fabric.category || "",
      });
      // Fetch existing images
      const { data } = await supabase.from("fabric_images").select("*").eq("fabric_id", fabric.id).order("sort_order");
      setExistingImages(data || []);
    } else {
      setEditingFabric(null);
      setFabricForm({ name: "", type: "", description: "", colors: "", min_order: 100, price_per_meter: 0, unit: "meters", available: true, image_url: "", gsm: "", weave: "", width: "", composition: "", finish: "", shrinkage: "", category: "" });
      setExistingImages([]);
=======
        composition: fabric.composition || "", finish: fabric.finish || "", shrinkage: fabric.shrinkage || "",
      });
    } else {
      setEditingFabric(null);
      setFabricForm({ name: "", type: "", description: "", colors: "", min_order: 100, price_per_meter: 0, unit: "meters", available: true, image_url: "", gsm: "", weave: "", width: "", composition: "", finish: "", shrinkage: "" });
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
    }
    setFabricDialog(true);
  };

  const saveFabric = async () => {
<<<<<<< HEAD
    if (imageFiles.length > 5 || (existingImages.length - imagesToDelete.length + imageFiles.length) > 5) {
      toast.error("You can only have up to 5 images per fabric");
      return;
    }

    setIsUploading(true);
    let mainImageUrl = fabricForm.image_url;

    const payload = {
      name: fabricForm.name, type: fabricForm.type, description: fabricForm.description,
      colors: fabricForm.colors, min_order: fabricForm.min_order, price_per_meter: fabricForm.price_per_meter,
      unit: fabricForm.unit, available: fabricForm.available, image_url: mainImageUrl || null,
      gsm: fabricForm.gsm ? parseInt(fabricForm.gsm) : null, weave: fabricForm.weave || null,
      width: fabricForm.width || null, composition: fabricForm.composition || null,
      finish: fabricForm.finish || null, shrinkage: fabricForm.shrinkage || null, category: fabricForm.category || null,
    };

    let error;
    let fabricId = editingFabric?.id;

    if (editingFabric) {
      ({ error } = await supabase.from("fabrics").update(payload).eq("id", editingFabric.id));
    } else {
      const { data, error: insertError } = await supabase.from("fabrics").insert(payload).select().single();
      error = insertError;
      if (data) fabricId = data.id;
    }

    if (error || !fabricId) {
      toast.error("Failed to save fabric");
      setIsUploading(false);
      return;
    }

    // Process image deletions
    if (imagesToDelete.length > 0) {
      await supabase.from("fabric_images").delete().in("id", imagesToDelete);
    }

    // Process new image uploads
    let sortOrderOffset = existingImages.length - imagesToDelete.length;

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${fabricId}/${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("fabric-images").upload(fileName, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from("fabric-images").getPublicUrl(fileName);

        await supabase.from("fabric_images").insert({
          fabric_id: fabricId,
          image_url: publicUrl,
          sort_order: sortOrderOffset + i
        });

        // Set the first uploaded image as main image if there is no main image set
        if (!mainImageUrl && i === 0) {
          mainImageUrl = publicUrl;
          await supabase.from("fabrics").update({ image_url: mainImageUrl }).eq("id", fabricId);
        }
      } else {
        toast.error(`Failed to upload image: ${file.name}`);
      }
    }

    // If we have existing images but no main image, set the first existing image as main
    if (!mainImageUrl && existingImages.length > 0 && !imagesToDelete.includes(existingImages[0].id)) {
      mainImageUrl = existingImages[0].image_url;
      await supabase.from("fabrics").update({ image_url: mainImageUrl }).eq("id", fabricId);
    }

    toast.success(editingFabric ? "Fabric updated" : "Fabric added");
    setFabricDialog(false);
    fetchAll();
    setIsUploading(false);
=======
    const payload = {
      name: fabricForm.name, type: fabricForm.type, description: fabricForm.description,
      colors: fabricForm.colors, min_order: fabricForm.min_order, price_per_meter: fabricForm.price_per_meter,
      unit: fabricForm.unit, available: fabricForm.available, image_url: fabricForm.image_url || null,
      gsm: fabricForm.gsm ? parseInt(fabricForm.gsm) : null, weave: fabricForm.weave || null,
      width: fabricForm.width || null, composition: fabricForm.composition || null,
      finish: fabricForm.finish || null, shrinkage: fabricForm.shrinkage || null,
    };
    let error;
    if (editingFabric) {
      ({ error } = await supabase.from("fabrics").update(payload).eq("id", editingFabric.id));
    } else {
      ({ error } = await supabase.from("fabrics").insert(payload));
    }
    if (error) toast.error("Failed to save fabric");
    else { toast.success(editingFabric ? "Fabric updated" : "Fabric added"); setFabricDialog(false); fetchAll(); }
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
  };

  const deleteFabric = async (id: string) => {
    if (!confirm("Delete this fabric?")) return;
    const { error } = await supabase.from("fabrics").delete().eq("id", id);
    if (error) toast.error("Failed to delete fabric");
    else { toast.success("Fabric deleted"); fetchAll(); }
  };

  const respondToQuote = async (quoteId: string, response: string, status: string) => {
    const { error } = await supabase.from("quote_requests").update({ admin_response: response, status }).eq("id", quoteId);
    if (error) toast.error("Failed to respond");
    else { toast.success("Quote updated"); fetchAll(); }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>

        {/* Analytics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-6 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-2 text-2xl font-bold">{stats.totalOrders}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center">
            <TrendingUp className="mx-auto h-8 w-8 text-success" />
            <p className="mt-2 text-2xl font-bold">{stats.monthlyOrders}</p>
            <p className="text-sm text-muted-foreground">This Month</p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center">
            <BarChart3 className="mx-auto h-8 w-8 text-secondary" />
            <p className="mt-2 text-2xl font-bold">₹{stats.revenue.toLocaleString("en-IN")}</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center">
            <Package className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-2 text-2xl font-bold">{fabrics.length}</p>
            <p className="text-sm text-muted-foreground">Fabrics</p>
          </div>
        </div>

        <Tabs defaultValue="orders" className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="fabrics">Fabrics</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
<<<<<<< HEAD
            <TabsTrigger value="roles">Users</TabsTrigger>
=======
            <TabsTrigger value="roles">Roles</TabsTrigger>
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
          </TabsList>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="mt-6">
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-xl border bg-card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
<<<<<<< HEAD
                        {order.fabrics?.image_url && (
                          <img src={order.fabrics.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <h3 className="font-display text-lg font-semibold">{order.fabric_name}</h3>
                          <Badge variant="outline" className={statusColors[order.status] || ""}>{order.status}</Badge>
                        </div>
=======
                        <h3 className="font-display text-lg font-semibold">{order.fabric_name}</h3>
                        <Badge variant="outline" className={statusColors[order.status] || ""}>{order.status}</Badge>
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.buyer_name} · {order.company_name} · {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </p>
<<<<<<< HEAD
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{order.quantity}m</span>
                        <span>·</span>
                        <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
                        {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                          <>
                            <span>·</span>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">{order.items.length} colors</Badge>
                          </>
                        )}
                      </div>
=======
                      <p className="text-sm text-muted-foreground">{order.quantity}m · ₹{Number(order.total).toLocaleString("en-IN")}</p>
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Select defaultValue={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                        <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statusSteps.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => { setNoteDialog(order.id); setNoteText(""); }}>
                        <MessageSquare className="mr-1 h-3 w-3" /> Note
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setShipmentDialog(order.id);
                        setShipmentForm({ courier_name: order.courier_name || "", tracking_number: order.tracking_number || "", dispatch_date: order.dispatch_date ? new Date(order.dispatch_date).toISOString().split("T")[0] : "" });
                      }}>
                        <Truck className="mr-1 h-3 w-3" /> Shipment
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center text-muted-foreground">No orders yet.</p>}
            </div>
          </TabsContent>

          {/* FABRICS TAB */}
          <TabsContent value="fabrics" className="mt-6">
            <div className="mb-4 flex justify-end">
              <Button onClick={() => openFabricForm()}><Plus className="mr-1 h-4 w-4" /> Add Fabric</Button>
            </div>
            <div className="space-y-3">
              {fabrics.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-4">
                    {f.image_url && <img src={f.image_url} alt={f.name} className="h-12 w-12 rounded-lg object-cover" />}
                    <div>
                      <p className="font-medium">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.type} · ₹{Number(f.price_per_meter).toLocaleString("en-IN")}/m · {f.available ? "In Stock" : "Out of Stock"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openFabricForm(f)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteFabric(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* QUOTES TAB */}
          <TabsContent value="quotes" className="mt-6">
            <div className="space-y-4">
              {quotes.map((q) => (
                <div key={q.id} className="rounded-xl border bg-card p-5">
                  <div className="flex items-start justify-between">
<<<<<<< HEAD
                    <div className="flex items-center gap-4">
                      {q.fabrics?.image_url && (
                        <img src={q.fabrics.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-medium">{q.fabric_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{q.quantity} units</span>
                        <span>·</span>
                        <span>{new Date(q.created_at).toLocaleDateString("en-IN")}</span>
                        {q.items && Array.isArray(q.items) && q.items.length > 0 && (
                          <>
                            <span>·</span>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">{q.items.length} colors</Badge>
                          </>
                        )}
                      </div>
                      {q.message && <p className="mt-2 text-sm">{q.message}</p>}
                      </div>
=======
                    <div>
                      <p className="font-medium">{q.fabric_name}</p>
                      <p className="text-sm text-muted-foreground">{q.quantity} units · {new Date(q.created_at).toLocaleDateString("en-IN")}</p>
                      {q.message && <p className="mt-2 text-sm">{q.message}</p>}
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
                    </div>
                    <Badge variant="outline">{q.status}</Badge>
                  </div>
                  {q.status === "Pending" && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={() => {
                        const response = prompt("Enter response to buyer:");
                        if (response) respondToQuote(q.id, response, "Responded");
                      }}>Respond</Button>
                      <Button size="sm" variant="destructive" onClick={() => respondToQuote(q.id, "Declined", "Declined")}>Decline</Button>
                    </div>
                  )}
                </div>
              ))}
              {quotes.length === 0 && <p className="text-center text-muted-foreground">No quote requests.</p>}
            </div>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Top Fabrics</h3>
                {stats.topFabrics.map((f, i) => (
                  <div key={i} className="flex justify-between py-2 border-b last:border-0">
                    <span>{f.name}</span>
                    <span className="font-medium">{f.count} orders</span>
                  </div>
                ))}
                {stats.topFabrics.length === 0 && <p className="text-muted-foreground text-sm">No data yet.</p>}
              </div>
              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Top Buyers</h3>
                {stats.topBuyers.map((b, i) => (
                  <div key={i} className="flex justify-between py-2 border-b last:border-0">
                    <span>{b.name}</span>
                    <span className="font-medium">₹{b.total.toLocaleString("en-IN")}</span>
                  </div>
                ))}
                {stats.topBuyers.length === 0 && <p className="text-muted-foreground text-sm">No data yet.</p>}
              </div>
            </div>
          </TabsContent>

          {/* ROLES TAB */}
          <TabsContent value="roles" className="mt-6">
            <AdminRolesManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Note Dialog */}
      <Dialog open={!!noteDialog} onOpenChange={(v) => !v && setNoteDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Order Note</DialogTitle></DialogHeader>
          <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Production update, shipping info..." rows={4} />
          <Button onClick={addNote} disabled={!noteText.trim()}>Add Note</Button>
        </DialogContent>
      </Dialog>

      {/* Shipment Dialog */}
      <Dialog open={!!shipmentDialog} onOpenChange={(v) => !v && setShipmentDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Shipment</DialogTitle></DialogHeader>
          <div className="space-y-4">
<<<<<<< HEAD
            <div><Label>Transport Name</Label><Input value={shipmentForm.courier_name} onChange={(e) => setShipmentForm((p) => ({ ...p, courier_name: e.target.value }))} className="mt-1.5" /></div>
=======
            <div><Label>Courier Name</Label><Input value={shipmentForm.courier_name} onChange={(e) => setShipmentForm((p) => ({ ...p, courier_name: e.target.value }))} className="mt-1.5" /></div>
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
            <div><Label>Tracking Number</Label><Input value={shipmentForm.tracking_number} onChange={(e) => setShipmentForm((p) => ({ ...p, tracking_number: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Dispatch Date</Label><Input type="date" value={shipmentForm.dispatch_date} onChange={(e) => setShipmentForm((p) => ({ ...p, dispatch_date: e.target.value }))} className="mt-1.5" /></div>
            <Button onClick={updateShipment}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fabric Dialog */}
      <Dialog open={fabricDialog} onOpenChange={setFabricDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingFabric ? "Edit Fabric" : "Add Fabric"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Name *</Label><Input value={fabricForm.name} onChange={(e) => setFabricForm((p) => ({ ...p, name: e.target.value }))} className="mt-1.5" /></div>
<<<<<<< HEAD
            <div className="sm:col-span-2"><Label>Description</Label><Textarea value={fabricForm.description} onChange={(e) => setFabricForm((p) => ({ ...p, description: e.target.value }))} className="mt-1.5" /></div>
            <div>
              <Label>Category *</Label>
              <Select value={fabricForm.category} onValueChange={(v) => setFabricForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cotton">Cotton</SelectItem>
                  <SelectItem value="Polyester">Polyester</SelectItem>
                  <SelectItem value="Uniform">Uniform</SelectItem>
                  <SelectItem value="Linen">Linen</SelectItem>
                  <SelectItem value="Silk">Silk</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Type *</Label><Input value={fabricForm.type} onChange={(e) => setFabricForm((p) => ({ ...p, type: e.target.value }))} className="mt-1.5" /></div>
            <div>
              <Label>Colors</Label>
              <Input 
                value={fabricForm.colors} 
                onChange={(e) => setFabricForm((p) => ({ ...p, colors: e.target.value }))} 
                className="mt-1.5" 
                placeholder="Red:#FF0000, Blue:#0000FF"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Format: Name:HexCode, ... (e.g. Red:#FF0000)</p>
            </div>
            <div><Label>Price/Meter (₹)</Label><Input type="number" value={fabricForm.price_per_meter} onChange={(e) => setFabricForm((p) => ({ ...p, price_per_meter: Number(e.target.value) }))} className="mt-1.5" /></div>
            <div><Label>Min Order</Label><Input type="number" value={fabricForm.min_order} onChange={(e) => setFabricForm((p) => ({ ...p, min_order: Number(e.target.value) }))} className="mt-1.5" /></div>
            <div><Label>Unit</Label><Input value={fabricForm.unit} onChange={(e) => setFabricForm((p) => ({ ...p, unit: e.target.value }))} className="mt-1.5" /></div>
            <div className="sm:col-span-2">
              <Label>Images (Up to 5)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="mt-1.5"
                onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    const totalImages = existingImages.length - imagesToDelete.length + imageFiles.length + files.length;
                    if (totalImages > 5) {
                      toast.error("You can only have up to 5 images per fabric");
                      return;
                    }
                    setImageFiles([...imageFiles, ...files]);
                    // Clear the input value so the same file can be selected again if removed
                    e.target.value = "";
                  }
                }}
                disabled={existingImages.length - imagesToDelete.length + imageFiles.length >= 5 || isUploading}
              />

              {/* Image preview area */}
              {(existingImages.length > 0 || imageFiles.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {existingImages.filter(img => !imagesToDelete.includes(img.id)).map((img) => (
                    <div key={img.id} className="relative h-20 w-20 rounded-md border overflow-hidden">
                      <img src={img.image_url} alt="existing" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagesToDelete([...imagesToDelete, img.id])}
                        disabled={isUploading}
                        className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5 text-destructive hover:bg-background"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {imageFiles.map((file, i) => (
                    <div key={i} className="relative h-20 w-20 rounded-md border overflow-hidden">
                      <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = [...imageFiles];
                          newFiles.splice(i, 1);
                          setImageFiles(newFiles);
                        }}
                        disabled={isUploading}
                        className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5 text-destructive hover:bg-background"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
=======
            <div><Label>Type *</Label><Input value={fabricForm.type} onChange={(e) => setFabricForm((p) => ({ ...p, type: e.target.value }))} className="mt-1.5" /></div>
            <div className="sm:col-span-2"><Label>Description</Label><Textarea value={fabricForm.description} onChange={(e) => setFabricForm((p) => ({ ...p, description: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Colors</Label><Input value={fabricForm.colors} onChange={(e) => setFabricForm((p) => ({ ...p, colors: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Price/Meter (₹)</Label><Input type="number" value={fabricForm.price_per_meter} onChange={(e) => setFabricForm((p) => ({ ...p, price_per_meter: Number(e.target.value) }))} className="mt-1.5" /></div>
            <div><Label>Min Order</Label><Input type="number" value={fabricForm.min_order} onChange={(e) => setFabricForm((p) => ({ ...p, min_order: Number(e.target.value) }))} className="mt-1.5" /></div>
            <div><Label>Unit</Label><Input value={fabricForm.unit} onChange={(e) => setFabricForm((p) => ({ ...p, unit: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Image URL</Label><Input value={fabricForm.image_url} onChange={(e) => setFabricForm((p) => ({ ...p, image_url: e.target.value }))} className="mt-1.5" /></div>
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={fabricForm.available} onChange={(e) => setFabricForm((p) => ({ ...p, available: e.target.checked }))} id="avail" />
              <Label htmlFor="avail">Available</Label>
            </div>
            <div className="sm:col-span-2 border-t pt-4"><h3 className="font-semibold mb-2">Specifications</h3></div>
            <div><Label>GSM</Label><Input value={fabricForm.gsm} onChange={(e) => setFabricForm((p) => ({ ...p, gsm: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Weave</Label><Input value={fabricForm.weave} onChange={(e) => setFabricForm((p) => ({ ...p, weave: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Width</Label><Input value={fabricForm.width} onChange={(e) => setFabricForm((p) => ({ ...p, width: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Composition</Label><Input value={fabricForm.composition} onChange={(e) => setFabricForm((p) => ({ ...p, composition: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Finish</Label><Input value={fabricForm.finish} onChange={(e) => setFabricForm((p) => ({ ...p, finish: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Shrinkage</Label><Input value={fabricForm.shrinkage} onChange={(e) => setFabricForm((p) => ({ ...p, shrinkage: e.target.value }))} className="mt-1.5" /></div>
          </div>
<<<<<<< HEAD
          <Button onClick={saveFabric} className="mt-4" disabled={isUploading}>
            {isUploading ? "Saving..." : (editingFabric ? "Update" : "Add")} Fabric
          </Button>
=======
          <Button onClick={saveFabric} className="mt-4">{editingFabric ? "Update" : "Add"} Fabric</Button>
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

// Admin Roles Manager sub-component
const AdminRolesManager = () => {
<<<<<<< HEAD
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*")
    ]);
    
    setProfiles(profilesRes.data || []);
    setRoles(rolesRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggleAdmin = async (userId: string, currentRole?: string) => {
    if (currentRole === "admin") {
      // Revoke
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");
      
      if (error) toast.error("Failed to revoke admin rights");
      else {
        toast.success("Admin rights revoked");
        fetchData();
      }
    } else {
      // Grant
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      
      if (error) toast.error("Failed to grant admin rights");
      else {
        toast.success("Admin rights granted");
        fetchData();
      }
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.buyer_name?.toLowerCase().includes(search.toLowerCase()) || 
    p.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Manage User Access</h3>
        <div className="relative w-64">
          <Input 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
          <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-10">Loading users...</p>
        ) : filteredProfiles.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No users found.</p>
        ) : (
          filteredProfiles.map((p) => {
            const isAdmin = roles.some(r => r.user_id === p.user_id && r.role === "admin");
            return (
              <div key={p.id} className="flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {p.buyer_name?.[0] || p.company_name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="font-medium">{p.buyer_name || "New User"}</p>
                    <p className="text-xs text-muted-foreground">{p.company_name || "No company"} · Joined {new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isAdmin ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20">Admin</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Buyer</Badge>
                  )}
                  <Button 
                    variant={isAdmin ? "destructive" : "outline"} 
                    size="sm"
                    onClick={() => toggleAdmin(p.user_id, isAdmin ? "admin" : undefined)}
                  >
                    {isAdmin ? "Revoke Admin" : "Grant Admin"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
=======
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("admin");
  const [roles, setRoles] = useState<any[]>([]);

  const fetchRoles = async () => {
    const { data: rolesData } = await supabase.from("user_roles").select("*");
    if (!rolesData || rolesData.length === 0) { setRoles([]); return; }
    // Fetch profiles to get buyer names
    const userIds = rolesData.map((r) => r.user_id);
    const { data: profilesData } = await supabase.from("profiles").select("user_id, buyer_name, company_name").in("user_id", userIds);
    const profileMap: Record<string, { buyer_name: string; company_name: string }> = {};
    (profilesData || []).forEach((p) => { profileMap[p.user_id] = p; });
    setRoles(rolesData.map((r) => ({ ...r, buyer_name: profileMap[r.user_id]?.buyer_name || "", company_name: profileMap[r.user_id]?.company_name || "" })));
  };

  useEffect(() => { fetchRoles(); }, []);

  const addRole = async () => {
    // We need to find user by email - using profiles or a lookup
    toast.info("To assign roles, add the user_id and role directly via the backend. Email lookup requires additional setup.");
  };

  const removeRole = async (roleId: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) toast.error("Failed to remove role");
    else { toast.success("Role removed"); fetchRoles(); }
  };

  return (
    <div>
      <h3 className="font-display text-lg font-semibold mb-4">User Roles</h3>
      <div className="space-y-3">
        {roles.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <p className="font-medium text-sm">{r.buyer_name || r.company_name || r.user_id}</p>
              <Badge variant="outline" className="mt-1">{r.role}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeRole(r.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        {roles.length === 0 && <p className="text-muted-foreground text-sm">No roles assigned yet.</p>}
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
      </div>
    </div>
  );
};

export default AdminDashboard;
