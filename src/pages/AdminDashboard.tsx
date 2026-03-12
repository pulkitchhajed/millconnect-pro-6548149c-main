import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import namer from "color-namer";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package, TrendingUp, Users, ClipboardList, Plus, Edit, Trash2, MessageSquare, BarChart3, Truck, X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Fabric } from "@/hooks/useFabrics";

const statusSteps = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning border-warning/20",
  Confirmed: "bg-primary/10 text-primary border-primary/20",
  Shipped: "bg-success/10 text-success border-success/20",
  Delivered: "bg-success/15 text-success border-success/30",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
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
    unit: "meters", available: true, image_url: "", gsm: "", weave: "", width: "", composition: "", finish: "", shrinkage: "", category: "", apc_enabled: false,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Color picker form
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");

  // Note form
  const [noteDialog, setNoteDialog] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // Shipment form
  const [shipmentDialog, setShipmentDialog] = useState<string | null>(null);
  const [shipmentForm, setShipmentForm] = useState({ courier_name: "", tracking_number: "", dispatch_date: "" });

  const fetchAll = async () => {
    const [ordersRes, fabricsRes, quotesRes] = await Promise.all([
      supabase.from("orders").select("*, fabrics:fabric_id_ref(image_url)").order("created_at", { ascending: false }),
      supabase.from("fabrics").select("*").order("created_at", { ascending: true }),
      supabase.from("quote_requests").select("*, fabrics:fabric_id(image_url)").order("created_at", { ascending: false }),
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
  };

  const addNote = async () => {
    if (!noteDialog || !noteText.trim()) return;
    const { error } = await supabase.from("order_notes").insert({
      order_id: noteDialog, admin_user_id: user!.id, note: noteText.trim(),
    });
    if (error) toast.error("Failed to add note");
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

  const openFabricForm = async (fabric?: Fabric) => {
    setImageFiles([]);
    setImagesToDelete([]);
    if (fabric) {
      setEditingFabric(fabric);
      setFabricForm({
        name: fabric.name, type: fabric.type, description: fabric.description, colors: fabric.colors,
        min_order: fabric.min_order, price_per_meter: Number(fabric.price_per_meter), unit: fabric.unit,
        available: fabric.available, image_url: fabric.image_url || "",
        gsm: fabric.gsm?.toString() || "", weave: fabric.weave || "", width: fabric.width || "",
        composition: fabric.composition || "", finish: fabric.finish || "", shrinkage: fabric.shrinkage || "", category: fabric.category || "",
        apc_enabled: fabric.apc_enabled || false,
      });
      // Fetch existing images
      const { data } = await supabase.from("fabric_images").select("*").eq("fabric_id", fabric.id).order("sort_order");
      setExistingImages(data || []);
    } else {
      setEditingFabric(null);
      setFabricForm({ name: "", type: "", description: "", colors: "", min_order: 100, price_per_meter: 0, unit: "meters", available: true, image_url: "", gsm: "", weave: "", width: "", composition: "", finish: "", shrinkage: "", category: "", apc_enabled: false });
      setExistingImages([]);
    }
    setColorName("");
    setColorHex("#000000");
    setFabricDialog(true);
  };

  const saveFabric = async () => {
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
      apc_enabled: fabricForm.apc_enabled,
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

        const { error: dbError } = await supabase.from("fabric_images").insert({
          fabric_id: fabricId,
          image_url: publicUrl,
          sort_order: sortOrderOffset + i
        });
        
        if (dbError) {
          console.error("fabric_images insert error:", dbError);
          toast.error(`Failed to save image reference: ${dbError.message}`);
        }

        // Set the first uploaded image as main image if there is no main image set
        if (!mainImageUrl && i === 0) {
          mainImageUrl = publicUrl;
          await supabase.from("fabrics").update({ image_url: mainImageUrl }).eq("id", fabricId);
        }
      } else {
        console.error("Storage upload error:", uploadError);
        toast.error(`Failed to upload ${file.name}: ${uploadError.message || 'Unknown error'}`);
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
  };

  const deleteFabric = async (id: string) => {
    if (!confirm("Delete this fabric?")) return;
    const { error } = await supabase.from("fabrics").delete().eq("id", id);
    if (error) toast.error("Failed to delete fabric");
    else { toast.success("Fabric deleted"); fetchAll(); }
  };

  const respondToQuote = async (quoteId: string, response: string, status: string, newPrice?: number) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;
    
    // Add counter-offer text to the response if provided
    let fullResponse = response;
    if (newPrice) {
      fullResponse += `\n\nCounter Offer: ₹${newPrice.toLocaleString("en-IN")}/m`;
    }

    const newMessage = {
      sender: "admin",
      text: fullResponse,
      timestamp: new Date().toISOString()
    };
    
    const messages = quote.messages || [];
    const updatedMessages = [...messages, newMessage];

    const { error } = await supabase.from("quote_requests").update({ 
      admin_response: fullResponse, 
      status,
      messages: updatedMessages
    }).eq("id", quoteId);
    
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
            <TabsTrigger value="roles">Users</TabsTrigger>
          </TabsList>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="mt-6">
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-xl border bg-card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        {order.fabrics?.image_url && (
                          <img src={order.fabrics.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <h3 className="font-display text-lg font-semibold">{order.fabric_name}</h3>
                          <Badge variant="outline" className={statusColors[order.status] || ""}>{order.status}</Badge>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.buyer_name} · {order.company_name} · {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </p>
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
                      {order.items && Array.isArray(order.items) && (order.items as any[]).some(i => i.apcCode) && (
                        <div className="mt-2 text-[10px] text-primary font-bold bg-primary/5 px-2 py-1 rounded inline-block">
                          APC Codes: {(order.items as any[]).filter(i => i.apcCode).map(i => `${i.color?.split(":")[0]}: ${i.apcCode}`).join(", ")}
                        </div>
                      )}
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
                      <p className="text-xs text-muted-foreground">
                        {f.type} · ₹{Number(f.price_per_meter).toLocaleString("en-IN")}/m · {f.available ? "In Stock" : "Out of Stock"}
                        {f.apc_enabled && <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] h-4 ml-2">APC ENABLED</Badge>}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px] truncate">
                        Colors: {f.colors?.split(",").map(c => c.split(":")[0].trim()).join(", ")}
                      </p>
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
                            <span className="text-[10px] ml-1">
                              ({q.items.map((i: any) => i.color?.split(":")[0].trim()).join(", ")})
                            </span>
                          </>
                        )}
                      </div>
                      {q.message && !q.messages?.length && <p className="mt-2 text-sm">{q.message}</p>}
                      {q.items && Array.isArray(q.items) && (q.items as any[]).some(i => i.apcCode) && (
                        <div className="mt-2 text-[10px] text-primary font-bold bg-primary/5 px-2 py-1 rounded inline-block">
                          APC Codes: {(q.items as any[]).filter(i => i.apcCode).map(i => `${i.color?.split(":")[0]}: ${i.apcCode}`).join(", ")}
                        </div>
                      )}
                      </div>
                    </div>
                    <Badge variant="outline">{q.status}</Badge>
                  </div>
                  
                  {/* Messages Thread */}
                  <div className="mt-4 space-y-3 bg-muted/30 p-4 rounded-lg">
                    {/* Initial message */}
                    {q.message && (
                      <div className="flex flex-col items-start text-sm">
                        <span className="font-semibold text-xs text-muted-foreground mb-1">Buyer (Initial)</span>
                        <div className="bg-background border rounded-md px-3 py-2 max-w-[80%]">
                          {q.message}
                        </div>
                      </div>
                    )}
                    
                    {/* Chat history */}
                    {q.messages && Array.isArray(q.messages) && q.messages.map((msg: any, idx: number) => (
                      <div key={idx} className={`flex flex-col text-sm ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                        <span className="font-semibold text-xs text-muted-foreground mb-1">
                          {msg.sender === 'admin' ? 'You' : 'Buyer'}
                        </span>
                        <div className={`rounded-md px-3 py-2 max-w-[80%] whitespace-pre-line ${
                          msg.sender === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-background border'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {q.status !== "Declined" && q.status !== "Accepted" && (
                    <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                      <Label>Send Response / Counter Offer</Label>
                      <Textarea 
                        id={`reply-${q.id}`} 
                        placeholder="Type your message here..." 
                        className="min-h-[80px]" 
                      />
                      <div className="flex gap-2 items-center mt-2">
                        <div className="flex-1 max-w-[200px]">
                          <Label className="text-xs mb-1 block">Counter Price (Optional)</Label>
                          <Input id={`price-${q.id}`} type="number" placeholder="₹/m" />
                        </div>
                        <div className="ml-auto flex gap-2 self-end">
                          <Button size="sm" onClick={() => {
                            const responseBox = document.getElementById(`reply-${q.id}`) as HTMLTextAreaElement;
                            const priceBox = document.getElementById(`price-${q.id}`) as HTMLInputElement;
                            if (responseBox?.value) {
                              respondToQuote(
                                q.id, 
                                responseBox.value, 
                                "Responded", 
                                priceBox?.value ? Number(priceBox.value) : undefined
                              );
                              responseBox.value = "";
                              if(priceBox) priceBox.value = "";
                            } else {
                              toast.error("Please enter a response message");
                            }
                          }}>Send Reply</Button>
                          <Button size="sm" variant="outline" className="text-success border-success hover:bg-success hover:text-success-foreground transition-colors" onClick={() => respondToQuote(q.id, "Admin Approved Offer", "Accepted")}>Approve</Button>
                          {q.status === "Pending" && (
                            <Button size="sm" variant="destructive" onClick={() => respondToQuote(q.id, "Declined Quote", "Declined")}>Decline</Button>
                          )}
                        </div>
                      </div>
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
            <div><Label>Transport Name</Label><Input value={shipmentForm.courier_name} onChange={(e) => setShipmentForm((p) => ({ ...p, courier_name: e.target.value }))} className="mt-1.5" /></div>
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
            <div className="sm:col-span-2">
              <Label>Colors</Label>
              <div className="mt-1.5 flex gap-2 items-center">
                <Input placeholder="Color Name (e.g. Red)" value={colorName} onChange={(e) => setColorName(e.target.value)} className="flex-1" />
                <div className="flex items-center gap-2 border rounded-md p-1 pl-3 bg-muted/30">
                  <span className="text-sm">Hex:</span>
                  <input 
                    type="color" 
                    value={colorHex} 
                    onChange={(e) => {
                      const hex = e.target.value;
                      setColorHex(hex);
                      // Automatically name the color
                      const names = namer(hex);
                      if (names && names.ntc && names.ntc[0]) {
                        setColorName(names.ntc[0].name);
                      }
                    }} 
                    className="w-8 h-8 rounded cursor-pointer" 
                  />
                </div>
                <Button type="button" variant="secondary" onClick={() => {
                  if (colorName.trim()) {
                    const newColor = `${colorName.trim()}:${colorHex}`;
                    setFabricForm(p => ({ ...p, colors: p.colors ? `${p.colors}, ${newColor}` : newColor }));
                    // Don't clear name immediately so user can see what was added, or clear it?
                    // Let's clear it for next entry.
                    setColorName("");
                  } else {
                    toast.error("Please provide a name for the color");
                  }
                }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md bg-muted/10 min-h-[40px]">
                {fabricForm.colors.split(",").filter(c => c.trim()).map((c, i) => {
                  const parts = c.split(":");
                  const name = parts[0]?.trim();
                  const hex = parts[1]?.trim();
                  return (
                    <Badge key={i} variant="outline" className="flex items-center gap-1.5 px-2 py-1">
                      <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: hex || '#ccc' }} />
                      <span>{name}</span>
                      <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => {
                        const newColors = fabricForm.colors.split(",").filter((_, idx) => idx !== i).join(", ");
                        setFabricForm(p => ({ ...p, colors: newColors }));
                      }} />
                    </Badge>
                  );
                })}
                {fabricForm.colors.split(",").filter(c => c.trim()).length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No colors added yet</span>
                )}
              </div>
              <Input 
                value={fabricForm.colors} 
                onChange={(e) => setFabricForm((p) => ({ ...p, colors: e.target.value }))} 
                className="mt-2 text-xs text-muted-foreground font-mono" 
                placeholder="Internal format: Name:#HexCode, ..."
                readOnly
              />
              <p className="text-[10px] text-muted-foreground mt-1">Format: Name:HexCode, ... (e.g. Red:#FF0000). You can also type directly.</p>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4 bg-primary/5">
              <div className="space-y-0.5">
                <Label className="text-base">Enable APC Support</Label>
                <p className="text-xs text-muted-foreground">
                  Show APC Code field in order and quote forms for this fabric.
                </p>
              </div>
              <Switch 
                checked={fabricForm.apc_enabled} 
                onCheckedChange={(v) => setFabricForm(p => ({ ...p, apc_enabled: v }))} 
              />
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
          <Button onClick={saveFabric} className="mt-4" disabled={isUploading}>
            {isUploading ? "Saving..." : (editingFabric ? "Update" : "Add")} Fabric
          </Button>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

// Admin Roles Manager sub-component
const AdminRolesManager = () => {
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
        <div>
          <h3 className="font-display text-lg font-semibold">Manage User Access</h3>
          <p className="text-sm text-muted-foreground mt-1">New admins must sign up first before they can be granted admin privileges here.</p>
        </div>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
