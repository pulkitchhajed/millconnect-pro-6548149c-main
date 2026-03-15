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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, SlidersHorizontal, Package, LayoutGrid, Trash2, Edit, ChevronLeft, ChevronRight, Import, Clipboard, MousePointer2, Settings, Truck, Wand2, CheckCircle, Clock, Users, ClipboardList, TrendingUp, BarChart3, MessageSquare, X, Image as ImageIcon, MapPin, Scan, PlusCircle, CreditCard } from "lucide-react";
import { ColorSwatchList } from "@/components/ColorSwatch";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Fabric } from "@/hooks/useFabrics";

type ColorLibrary = {
  id: string;
  name: string;
  colors: string;
  created_at: string;
};

const statusSteps = ["Pending", "Confirmed", "Advance Payment Received", "Bill Amount Received", "Staged", "Shipped", "Delivered", "Cancelled"];

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
    p.buyer_name?.toLowerCase().includes(search.toLowerCase())
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
              <div key={p.id} className="flex items-center justify-between rounded-2xl border bg-white p-5 transition-premium hover:shadow-premium hover:-translate-y-0.5">
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-lg font-black shadow-inner">
                    {p.buyer_name?.[0] || "?"}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-none">{p.buyer_name || "New User"}</h4>
                    <p className="mt-1.5 text-xs text-muted-foreground font-medium">
                      Joined <span className="text-foreground/80 font-bold">{new Date(p.created_at).toLocaleDateString()}</span> · {p.user_id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {isAdmin ? (
                    <Badge className="bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-soft">Admin Access</Badge>
                  ) : (
                    <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-dashed">Standard Buyer</Badge>
                  )}
                  <Button
                    variant={isAdmin ? "destructive" : "outline"}
                    size="sm"
                    className="rounded-xl px-5 font-bold shadow-soft transition-premium active:scale-95"
                    onClick={() => toggleAdmin(p.user_id, isAdmin ? "admin" : undefined)}
                  >
                    {isAdmin ? "Revoke Access" : "Grant Access"}
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [sampleRequests, setSampleRequests] = useState<any[]>([]);
  const [samplePacks, setSamplePacks] = useState<any[]>([]);
  const [designRequests, setDesignRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, monthlyOrders: 0, revenue: 0, topFabrics: [] as any[], topBuyers: [] as any[] });
  const [loading, setLoading] = useState(true);

  // Fabric form
  const [fabricDialog, setFabricDialog] = useState(false);
  const [editingFabric, setEditingFabric] = useState<Fabric | null>(null);
  const [fabricForm, setFabricForm] = useState<{
    name: string; type: string; description: string; colors: string; min_order: number; price_per_meter: number;
    unit: string; available: boolean; is_featured: boolean; apc_available: boolean; image_url: string; gm: string; weave: string; width: string; composition: string; finish: string; shrinkage: string; category: string;
  }>({
    name: "", type: "", description: "", colors: "", min_order: 100, price_per_meter: 0,
    unit: "meters", available: true, is_featured: false, apc_available: false, image_url: "", gm: "", weave: "", width: "", composition: "", finish: "", shrinkage: "", category: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Note form
  const [noteDialog, setNoteDialog] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // Shipment form
  const [shipmentDialog, setShipmentDialog] = useState<string | null>(null);
  const [shipmentForm, setShipmentForm] = useState({ courier_name: "", tracking_number: "", dispatch_date: "" });

  // Payment Request form
  const [paymentDialog, setPaymentDialog] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({ payment_link: "", payment_message: "" });

  // Color Library state
  const [colorLibraries, setColorLibraries] = useState<ColorLibrary[]>([]);
  const [colorLibraryDialog, setColorLibraryDialog] = useState(false);
  const [editingLibrary, setEditingLibrary] = useState<ColorLibrary | null>(null);
  const [libraryForm, setLibraryForm] = useState({ name: "", colors: "" });

  // Advanced Color Manager state (for use within the fabric form)
  const [colorManagerOpen, setColorManagerOpen] = useState(false);
  const [bulkColorText, setBulkColorText] = useState("");
  const [visualPickerImage, setVisualPickerImage] = useState<string | null>(null);
  const [pickedColors, setPickedColors] = useState<{ name: string, hex: string }[]>([]);

  // Sample Pack form
  const [samplePackDialog, setSamplePackDialog] = useState(false);
  const [editingSamplePack, setEditingSamplePack] = useState<any | null>(null);
  const [samplePackForm, setSamplePackForm] = useState({
    name: "", pack_type: "category", category: "", max_items: 5, fabric_ids: [] as string[], price: 0, active: true
  });
  const [orderDetailDialog, setOrderDetailDialog] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);

  // Design request response form
  const [designResponseDialog, setDesignResponseDialog] = useState<string | null>(null);
  const [designResponseForm, setDesignResponseForm] = useState({
    admin_availability: "Available",
    admin_program: "",
    admin_weight: "",
    admin_price: 0,
    admin_note: ""
  });

  async function fetchAll() {
    const [ordersRes, fabricsRes, quotesRes, librariesRes] = await Promise.all([
      supabase.from("orders").select("*, fabrics:fabric_id_ref(image_url)").order("created_at", { ascending: false }) as any,
      supabase.from("fabrics").select("*").order("created_at", { ascending: true }) as any,
      supabase.from("quote_requests").select("*, fabrics:fabric_id(image_url)").order("created_at", { ascending: false }) as any,
      supabase.from("color_libraries" as any).select("*").order("name", { ascending: true }),
    ]);
    const allOrders = ordersRes.data || [];
    setOrders(allOrders);
    setFabrics((fabricsRes.data || []) as Fabric[]);
    setQuotes(quotesRes.data || []);
    setColorLibraries((librariesRes.data || []) as any);
    const samplesRes = await supabase.from("sample_requests").select("*").order("created_at", { ascending: false });
    setSampleRequests(samplesRes.data || []);
    const packsRes = await supabase.from("sample_packs").select("*").order("created_at", { ascending: false });
    setSamplePacks(packsRes.data || []);
    const { data: designs, error: designError } = await supabase
      .from("design_requests" as any)
      .select("*, profiles!inner(buyer_name, billing_name)")
      .order("created_at", { ascending: false });

    if (designError) {
      console.error("Design requests fetch error:", designError);
      // Fallback to simple fetch if join fails
      const { data: fallbackData } = await supabase
        .from("design_requests" as any)
        .select("*")
        .order("created_at", { ascending: false });
      setDesignRequests(fallbackData || []);
    } else {
      setDesignRequests(designs || []);
    }

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
      const key = o.billing_name || o.buyer_name;
      if (!buyerCount[key]) buyerCount[key] = { name: key, total: 0 };
      buyerCount[key].total += Number(o.total);
    });
    const topBuyers = Object.values(buyerCount).sort((a, b) => b.total - a.total).slice(0, 5);

    setStats({ totalOrders: allOrders.length, monthlyOrders: monthly, revenue, topFabrics, topBuyers });
    setLoading(false);
  }

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

  const openLibraryForm = (library?: ColorLibrary) => {
    if (library) {
      setEditingLibrary(library);
      setLibraryForm({ name: library.name, colors: library.colors });
    } else {
      setEditingLibrary(null);
      setLibraryForm({ name: "", colors: "" });
    }
    setColorLibraryDialog(true);
  };

  const saveLibrary = async () => {
    if (!libraryForm.name) {
      toast.error("Library name is required");
      return;
    }

    if (editingLibrary) {
      const { error } = await supabase
        .from("color_libraries" as any)
        .update({ name: libraryForm.name, colors: libraryForm.colors } as any)
        .eq("id", editingLibrary.id);

      if (error) toast.error("Failed to update library: " + error.message);
      else {
        toast.success("Library updated");
        setColorLibraryDialog(false);
        fetchAll();
      }
    } else {
      const { error } = await supabase
        .from("color_libraries" as any)
        .insert({ name: libraryForm.name, colors: libraryForm.colors } as any);

      if (error) toast.error("Failed to create library: " + error.message);
      else {
        toast.success("Library created");
        setColorLibraryDialog(false);
        fetchAll();
      }
    }
  };

  const deleteLibrary = async (id: string) => {
    if (!confirm("Are you sure you want to delete this library?")) return;
    const { error } = await supabase.from("color_libraries" as any).delete().eq("id", id);
    if (error) toast.error("Failed to delete library");
    else {
      toast.success("Library deleted");
      fetchAll();
    }
  };

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

  const openPaymentDialog = (order: any) => {
    setPaymentDialog(order.id);
    const defaultMsg = `Hello ${order.buyer_name},\n\nThank you for your order focusing on ${order.fabric_name}. To proceed, we request an advance payment of ₹5000.\n\nBank Details:\nBank: Your Bank Name\nA/c No: 1234567890\nIFSC: BANK0001234\n\nYou can also pay via this link:`;
    setPaymentForm({
      payment_link: order.payment_link || "https://payment.example.com",
      payment_message: order.payment_message || defaultMsg
    });
  };

  const sendPaymentRequest = async () => {
    if (!paymentDialog) return;
    const order = orders.find(o => o.id === paymentDialog);
    if (!order) return;

    const { error } = await supabase.from("orders").update({
      payment_link: paymentForm.payment_link,
      payment_message: paymentForm.payment_message,
    }).eq("id", paymentDialog);

    if (error) {
      toast.error("Failed to save payment info");
      return;
    }

    const fullMsg = `${paymentForm.payment_message} ${paymentForm.payment_link}`;
    let cleanPhone = order.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullMsg)}`;
    window.open(whatsappUrl, '_blank');

    toast.success("Payment request generated and WhatsApp opened");
    setPaymentDialog(null);
    fetchAll();
  };

  const submitDesignResponse = async () => {
    if (!designResponseDialog) return;
    const { error } = await supabase
      .from("design_requests" as any)
      .update({
        ...designResponseForm,
        status: "Responded",
        buyer_response: null, // Reset so buyer can accept/counter again
        counter_price: null, // Clear the countered price since we're responding to it
        updated_at: new Date().toISOString()
      } as any)
      .eq("id", designResponseDialog);

    if (error) {
      toast.error("Failed to send response");
    } else {
      toast.success("Response sent to buyer");
      setDesignResponseDialog(null);
      fetchAll();
    }
  };

  const openFabricForm = async (fabric?: Fabric) => {
    setImageFiles([]);
    setImagesToDelete([]);
    if (fabric) {
      setEditingFabric(fabric);
      setFabricForm({
        name: fabric.name, type: fabric.type, description: fabric.description,
        colors: fabric.colors || "",
        min_order: fabric.min_order, price_per_meter: Number(fabric.price_per_meter), unit: fabric.unit,
        available: fabric.available, is_featured: fabric.is_featured || false, apc_available: (fabric as any).apc_available || false, image_url: fabric.image_url || "",
        gm: fabric.gm?.toString() || "", weave: fabric.weave || "", width: fabric.width || "",
        composition: fabric.composition || "", finish: fabric.finish || "", shrinkage: fabric.shrinkage || "", category: Array.isArray(fabric.category) ? fabric.category.join(", ") : (fabric.category || ""),
      });
      // Fetch existing images
      const { data } = await supabase.from("fabric_images").select("*").eq("fabric_id", fabric.id).order("sort_order");
      setExistingImages(data || []);
    } else {
      setEditingFabric(null);
      setFabricForm({ name: "", type: "", description: "", colors: "", min_order: 100, price_per_meter: 0, unit: "meters", available: true, is_featured: false, apc_available: false, image_url: "", gm: "", weave: "", width: "", composition: "", finish: "", shrinkage: "", category: "" });
      setExistingImages([]);
    }
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
      unit: fabricForm.unit, available: fabricForm.available, is_featured: fabricForm.is_featured,
      apc_available: fabricForm.apc_available, image_url: mainImageUrl || null,
      gm: fabricForm.gm ? parseInt(fabricForm.gm) : null, weave: fabricForm.weave || null,
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
  };

  const openSamplePackForm = (pack?: any) => {
    if (pack) {
      setEditingSamplePack(pack);
      setSamplePackForm({
        name: pack.name,
        pack_type: pack.pack_type,
        category: pack.category || "",
        max_items: pack.max_items || 5,
        fabric_ids: pack.fabric_ids || [],
        price: Number(pack.price),
        active: pack.active
      });
    } else {
      setEditingSamplePack(null);
      setSamplePackForm({ name: "", pack_type: "category", category: "", max_items: 5, fabric_ids: [], price: 0, active: true });
    }
    setSamplePackDialog(true);
  };

  const saveSamplePack = async () => {
    if (!samplePackForm.name) { toast.error("Name is required"); return; }

    // Convert fabric_ids to postgres-style array string if needed, 
    // but supabase-js handles js arrays for UUID[] automatically.
    const payload = { ...samplePackForm };
    let res;
    if (editingSamplePack) {
      res = await supabase.from("sample_packs").update(payload).eq("id", editingSamplePack.id);
    } else {
      res = await supabase.from("sample_packs").insert(payload);
    }

    if (res.error) {
      console.error("Save error:", res.error);
      toast.error(`Failed to save: ${res.error.message}`);
    } else {
      toast.success(editingSamplePack ? "Pack updated" : "Pack created");
      setSamplePackDialog(false);
      fetchAll();
    }
  };

  const deleteSamplePack = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("sample_packs").delete().eq("id", id);
    if (error) toast.error("Failed to delete pack");
    else { toast.success("Pack deleted"); fetchAll(); }
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
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-16 text-white shadow-premium relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-[-20deg] translate-x-1/2" />
        <div className="container mx-auto px-6 relative">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-5xl font-black tracking-tight uppercase">Admin Command Center</h1>
            <p className="max-w-2xl text-primary-foreground/90 font-medium text-lg italic">Control your boutique ecosystem with surgical precision.</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-24">

        {/* Premium Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-4">
          <div className="card-premium p-8 transition-premium hover:-translate-y-2 group bg-white/60">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-premium group-hover:bg-primary group-hover:text-white shadow-soft">
              <ClipboardList className="h-7 w-7" />
            </div>
            <p className="mt-6 text-4xl font-black tracking-tighter text-foreground">{stats.totalOrders}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Lifetime Orders</p>
          </div>
          <div className="card-premium p-8 transition-premium hover:-translate-y-2 group bg-white/60">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success transition-premium group-hover:bg-success group-hover:text-white shadow-soft">
              <TrendingUp className="h-7 w-7" />
            </div>
            <p className="mt-6 text-4xl font-black tracking-tighter text-foreground">{stats.monthlyOrders}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active This Month</p>
          </div>
          <div className="card-premium p-8 transition-premium hover:-translate-y-2 group bg-white/60">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary transition-premium group-hover:bg-secondary group-hover:text-white shadow-soft">
              <BarChart3 className="h-7 w-7" />
            </div>
            <p className="mt-6 text-4xl font-black tracking-tighter text-foreground">₹{stats.revenue.toLocaleString("en-IN")}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gross Revenue</p>
          </div>
          <div className="card-premium p-8 transition-premium hover:-translate-y-2 group bg-white/60">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-premium group-hover:bg-primary group-hover:text-white shadow-soft">
              <Package className="h-7 w-7" />
            </div>
            <p className="mt-6 text-4xl font-black tracking-tighter text-foreground">{fabrics.length}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Stock Varieties</p>
          </div>
        </div>

        <Tabs defaultValue="orders" className="mt-12">
          <div className="mb-8 overflow-hidden rounded-2xl border bg-white/50 p-1.5 shadow-soft backdrop-blur-sm">
            <TabsList className="grid w-full grid-cols-8 gap-1 bg-transparent border-none p-0">
              <TabsTrigger value="orders" className="rounded-xl py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-premium transition-premium">Orders</TabsTrigger>
              <TabsTrigger value="apc" className="rounded-xl py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-premium transition-premium text-xs">
                APC {orders.filter(o => o.apc_details?.is_apc && o.status === 'Pending').length > 0 && <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] text-white animate-pulse">{orders.filter(o => o.apc_details?.is_apc && o.status === 'Pending').length}</span>}
              </TabsTrigger>
              <TabsTrigger value="design" className="rounded-xl py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-premium transition-premium">Design</TabsTrigger>
              <TabsTrigger value="fabrics" className="rounded-xl py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-premium transition-premium">Fabrics</TabsTrigger>
              <TabsTrigger value="quotes" className="rounded-xl py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-premium transition-premium">Quotes</TabsTrigger>
              <TabsTrigger value="samples" className="rounded-xl py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-premium transition-premium text-xs">
                Samples {sampleRequests.filter(s => s.status === 'Pending').length > 0 && <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground border border-white/20">{sampleRequests.filter(s => s.status === 'Pending').length}</span>}
              </TabsTrigger>
              <TabsTrigger value="colors" className="rounded-xl py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-premium transition-premium">Libraries</TabsTrigger>
              <TabsTrigger value="roles" className="rounded-xl py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-premium transition-premium">Users</TabsTrigger>
            </TabsList>
          </div>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="mt-6">
            <div className="grid gap-4">
              {orders.filter(o => !o.apc_details?.is_apc).map((order) => (
                <div key={order.id} className="card-premium p-6 group transition-premium">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        {order.fabrics?.image_url ? (
                          <img src={order.fabrics.image_url} alt="" className="h-14 w-14 rounded-xl object-cover shadow-soft" />
                        ) : (
                          <div className="h-14 w-14 rounded-xl bg-primary/5 flex items-center justify-center text-primary/40">
                            <Package className="h-8 w-8" />
                          </div>
                        )}
                        <Badge variant="outline" className={`absolute -top-2 -right-2 font-black text-[9px] uppercase tracking-widest border-none px-2 h-5 rounded-md shadow-premium ${statusColors[order.status] || ""}`}>
                          {order.status}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-black text-lg uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{order.fabric_name}</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          {order.buyer_name} · <span className="text-foreground/60">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-sm font-black text-foreground">{order.quantity}m</span>
                          <span className="h-1 w-1 rounded-full bg-black/10" />
                          <span className="text-base font-black text-primary">₹{Number(order.total || 0).toLocaleString("en-IN")}</span>
                          {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                            <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter h-5 px-1.5 rounded-md bg-primary/5 text-primary border-none">
                              {order.items.length} shades
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-black/5">
                      <Select defaultValue={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                        <SelectTrigger className="w-[190px] h-10 rounded-xl font-bold bg-muted/20 border-none transition-premium hover:bg-muted/40 shadow-soft">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-premium font-bold">
                          {statusSteps.map((s) => (
                            <SelectItem key={s} value={s} className="rounded-lg transition-colors focus:bg-primary/10">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="h-10 rounded-xl font-bold gap-2 px-4 shadow-soft hover:shadow-premium transition-premium" onClick={() => { setViewingOrder(order); setOrderDetailDialog(true); }}>
                        <ClipboardList className="h-4 w-4" /> Details
                      </Button>
                      <Button variant="outline" size="sm" className="h-10 rounded-xl font-bold px-4 shadow-soft hover:shadow-premium transition-premium" onClick={() => { setNoteDialog(order.id); setNoteText(""); }}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-10 rounded-xl font-bold px-4 shadow-soft hover:shadow-premium transition-premium text-success hover:bg-success/5" onClick={() => openPaymentDialog(order)}>
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-10 rounded-xl font-bold px-4 shadow-soft hover:shadow-premium transition-premium" onClick={() => {
                        setShipmentDialog(order.id);
                        setShipmentForm({ courier_name: order.courier_name || "", tracking_number: order.tracking_number || "", dispatch_date: order.dispatch_date ? new Date(order.dispatch_date).toISOString().split("T")[0] : "" });
                      }}>
                        <Truck className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {orders.filter(o => !o.apc_details?.is_apc).length === 0 && (
                <div className="section-premium py-20 text-center opacity-50">
                  <ClipboardList className="h-16 w-16 mx-auto text-muted/30 mb-6" />
                  <p className="font-display text-xl font-bold text-muted-foreground uppercase tracking-widest">No standard orders recorded</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* APC REQUESTS TAB */}
          <TabsContent value="apc" className="mt-6">
            <div className="grid gap-4">
              {orders.filter(o => o.apc_details?.is_apc).map((order) => (
                <div key={order.id} className="card-premium p-6 border-secondary/20 bg-secondary/[0.02] transition-premium group">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        {order.fabrics?.image_url ? (
                          <img src={order.fabrics.image_url} alt="" className="h-16 w-16 rounded-xl object-cover border-2 border-secondary/20 shadow-soft" />
                        ) : (
                          <div className="h-16 w-16 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary/40 border-2 border-secondary/20 border-dashed">
                            <Wand2 className="h-8 w-8" />
                          </div>
                        )}
                        <Badge className="absolute -top-3 -right-3 font-black text-[9px] uppercase tracking-widest bg-secondary text-white shadow-premium px-3 py-1 rounded-full">
                          APC Matching
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-black text-xl uppercase tracking-tight text-secondary group-hover:scale-[1.01] transition-transform origin-left">{order.fabric_name}</h3>
                        <p className="mt-1 text-sm font-black text-muted-foreground uppercase tracking-widest">
                          {order.buyer_name} · <span className="text-secondary/60 italic">{new Date(order.created_at).toLocaleDateString("en-IN")}</span>
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-2 bg-black/5 w-fit px-3 py-1 rounded-lg">
                          <MapPin className="h-3.5 w-3.5 text-secondary" />
                          <span className="italic">{order.apc_details?.buyer_address?.slice(0, 50)}...</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Select defaultValue={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                        <SelectTrigger className="w-[190px] h-11 border-secondary/30 rounded-xl font-black uppercase text-[10px] tracking-widest bg-white shadow-soft hover:shadow-premium transition-premium focus:ring-secondary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl font-bold">
                          {statusSteps.map((s) => (
                            <SelectItem key={s} value={s} className="focus:bg-secondary/10">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="secondary" size="sm" className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-soft hover:scale-[1.02] active:scale-95 transition-premium" onClick={() => { setViewingOrder(order); setOrderDetailDialog(true); }}>
                        <ClipboardList className="mr-2 h-4 w-4" /> View Match Set
                      </Button>
                      <Button variant="outline" size="sm" className="h-11 border-secondary/20 text-secondary rounded-xl font-black uppercase tracking-widest text-[10px] px-5 shadow-soft hover:bg-secondary/5 transition-premium" onClick={() => openPaymentDialog(order)}>
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {orders.filter(o => o.apc_details?.is_apc).length === 0 && (
                <div className="section-premium py-20 text-center opacity-40">
                  <Wand2 className="h-16 w-16 mx-auto text-muted/30 mb-6" />
                  <p className="font-display text-xl font-bold text-muted-foreground uppercase tracking-widest">No APC Color Matching requests</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* DESIGN REQUESTS TAB */}
          <TabsContent value="design" className="mt-6">
            <div className="grid gap-5">
              {designRequests.map((req) => (
                <div key={req.id} className="card-premium p-6 border-primary/20 bg-primary/[0.01] transition-premium group overflow-hidden relative">
                  <div className="absolute -top-10 -right-10 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between relative">
                    <div className="flex gap-6">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-premium group-hover:scale-105 transition-premium relative">
                        <img src={req.image_url} alt="Design" className="h-full w-full object-cover" />
                        <div className="absolute top-0 left-0 w-full h-full bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-black text-xl uppercase tracking-tight text-foreground">Custom Creation</h3>
                          <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-widest border-none px-2 h-5 rounded-md shadow-soft ${statusColors[req.status] || ""}`}>{req.status}</Badge>
                          {req.status === 'Countered' && (
                            <Badge className="bg-secondary/10 text-secondary border-none font-black text-[10px] tracking-tight px-3 h-5">Counter: ₹{req.counter_price}/m</Badge>
                          )}
                        </div>
                        <p className="text-sm font-black text-primary uppercase tracking-widest">
                          {req.profiles?.buyer_name || "Boutique Member"} · <span className="text-foreground tracking-tight">{req.quantity}m Target</span>
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 font-medium italic leading-relaxed max-w-md">
                          "{req.description || "Premium custom weave request."}"
                        </p>
                        <div className="pt-2 flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                          <Clock className="h-3 w-3" />
                          <span>Submitted {new Date(req.created_at).toLocaleDateString("en-IN", { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4 md:pt-0 min-w-[200px] justify-end">
                      {(req.status === 'Pending' || req.status === 'Countered' || req.status === 'Responded') ? (
                        <div className="flex flex-col gap-3 w-full sm:w-auto">
                          {req.status === 'Responded' && (
                            <div className="rounded-xl border border-primary/20 bg-background p-3 text-center shadow-soft">
                              <p className="font-black text-primary uppercase tracking-widest text-[9px] mb-1 leading-none">Your Active Offer</p>
                              <p className="text-xl font-black tracking-tighter">₹{req.admin_price}<span className="text-sm font-bold opacity-50">/m</span></p>
                            </div>
                          )}
                          <Button size="sm" className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] px-8 shadow-premium hover:scale-[1.02] transition-premium" onClick={() => {
                            setDesignResponseDialog(req.id);
                            setDesignResponseForm({
                              admin_availability: req.admin_availability || "Available",
                              admin_program: req.admin_program || "",
                              admin_weight: req.admin_weight || "",
                              admin_price: req.admin_price || 0,
                              admin_note: req.admin_note || ""
                            });
                          }}>
                            {req.status === 'Countered' ? 'Analyze Counter' :
                              req.status === 'Responded' ? 'Modify Offer' : 'Send Quotation'}
                          </Button>
                        </div>
                      ) : (
                        <div className="card-premium bg-white p-4 text-xs shadow-soft min-w-[180px] border-black/5">
                          <p className="font-black text-primary mb-3 uppercase tracking-widest text-[9px] border-b pb-2 leading-none">Decision Matrix</p>
                          <div className="grid gap-y-2">
                            <div className="flex justify-between items-center"><p className="text-[10px] font-black uppercase text-muted-foreground">Status</p><Badge variant="outline" className="h-5 text-[9px] font-black uppercase border-none bg-primary/5 text-primary tracking-tighter">{req.admin_availability}</Badge></div>
                            <div className="flex justify-between items-center"><p className="text-[10px] font-black uppercase text-muted-foreground">Price</p><p className="font-black text-foreground">₹{req.admin_price}/m</p></div>
                            {req.buyer_response && (
                              <div className="pt-2 mt-1 border-t border-black/5 flex justify-between items-center">
                                <p className="text-[10px] font-black uppercase text-primary">Buyer</p>
                                <p className="font-black text-primary tracking-tight">
                                  {req.buyer_response === 'Countered' ? `Counter ₹${req.counter_price}` : req.buyer_response}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {designRequests.length === 0 && (
                <div className="section-premium py-20 text-center opacity-40">
                  <LayoutGrid className="h-16 w-16 mx-auto text-muted/30 mb-6" />
                  <p className="font-display text-xl font-bold text-muted-foreground uppercase tracking-widest">No custom design inquiries</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* FABRICS TAB */}
          <TabsContent value="fabrics" className="mt-6">
            <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-soft border">
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight">Quality Master List</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total {fabrics.length} unique varieties</p>
              </div>
              <Button onClick={() => openFabricForm()} className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-xs shadow-premium hover:scale-[1.02] transition-premium">
                <Plus className="mr-2 h-5 w-5" /> New Quality
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fabrics.map((f) => (
                <div key={f.id} className="card-premium p-5 group transition-premium flex flex-col justify-between hover:border-primary/40 h-full">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-20 w-20 rounded-2xl overflow-hidden border bg-muted shadow-soft relative group-hover:scale-105 transition-premium">
                        {f.image_url ? (
                          <img src={f.image_url} alt={f.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted/30">
                            <ImageIcon className="h-10 w-10" />
                          </div>
                        )}
                        {f.is_featured && <div className="absolute top-0 left-0 w-full h-full border-4 border-success/40 rounded-2xl pointer-events-none" />}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-premium" onClick={() => openFabricForm(f)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/5 hover:text-destructive transition-premium" onClick={() => deleteFabric(f.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black text-lg uppercase tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">{f.name}</h4>
                      {f.is_featured && <Badge className="bg-success/10 text-success border-none py-0 h-4 text-[9px] font-black uppercase tracking-tighter">Gold</Badge>}
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">{f.type} · ₹{Number(f.price_per_meter).toLocaleString("en-IN")}/m</p>

                    <div className="bg-muted/10 p-3 rounded-xl border border-dashed border-black/5 mb-4">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 leading-none">Available Colors</p>
                      <ColorSwatchList colors={f.colors} limit={12} size="sm" />
                      {!f.colors && <p className="text-[9px] italic text-muted-foreground">No colors defined</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-black/5 mt-auto">
                    <Badge variant="outline" className={`h-6 text-[9px] font-black uppercase tracking-widest border-none px-3 ${f.available ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {f.available ? "Live" : "Archived"}
                    </Badge>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter leading-none">Min: <span className="text-foreground">{f.min_order}{f.unit || 'm'}</span></p>
                  </div>
                </div>
              ))}
            </div>
            {fabrics.length === 0 && (
              <div className="section-premium py-24 text-center">
                <Package className="h-20 w-20 mx-auto text-muted/20 mb-6" />
                <p className="font-display text-xl font-bold text-muted-foreground uppercase tracking-widest">Inventory is empty</p>
                <Button variant="outline" className="mt-6" onClick={() => openFabricForm()}>Add First Quality</Button>
              </div>
            )}
          </TabsContent>

          {/* QUOTES TAB */}
          <TabsContent value="quotes" className="mt-6">
            <div className="grid gap-4">
              {quotes.map((q) => (
                <div key={q.id} className="card-premium p-6 group transition-premium">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-5">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-soft">
                        {q.fabrics?.image_url ? (
                          <img src={q.fabrics.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-primary/30"><LayoutGrid className="h-8 w-8" /></div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-black text-lg uppercase tracking-tight">{q.fabric_name}</h3>
                          <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-widest border-none px-2 h-5 rounded-md shadow-soft ${statusColors[q.status] || ""}`}>{q.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <span className="text-foreground">{q.quantity} Units</span>
                          <span className="h-1 w-1 rounded-full bg-black/10" />
                          <span>{new Date(q.created_at).toLocaleDateString("en-IN")}</span>
                        </div>
                        {q.message && (
                          <div className="mt-2 bg-muted/20 p-3 rounded-lg border border-dashed text-xs italic text-muted-foreground leading-relaxed">
                            "{q.message}"
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {q.status === "Pending" && (
                        <>
                          <Button size="sm" className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 shadow-premium hover:scale-105 transition-premium" onClick={() => {
                            const response = prompt("Enter response to buyer:");
                            if (response) respondToQuote(q.id, response, "Responded");
                          }}>Send Quote</Button>
                          <Button size="sm" variant="ghost" className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] text-destructive hover:bg-destructive/5" onClick={() => respondToQuote(q.id, "Declined", "Declined")}>Decline</Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {quotes.length === 0 && (
                <div className="section-premium py-20 text-center opacity-40">
                  <MessageSquare className="h-16 w-16 mx-auto text-muted/30 mb-6" />
                  <p className="font-display text-xl font-bold text-muted-foreground uppercase tracking-widest">No bulk quote requests</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* SAMPLES TAB */}
          <TabsContent value="samples" className="mt-6">
            <Tabs defaultValue="requests">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full grid-cols-2 lg:w-[480px] bg-muted/30 p-1 rounded-2xl border">
                  <TabsTrigger value="requests" className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-soft">Sample Requests</TabsTrigger>
                  <TabsTrigger value="pricing" className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-soft">Pricing & Packs</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="requests" className="mt-0">
                <div className="grid gap-4">
                  {sampleRequests.map((s) => (
                    <div key={s.id} className="card-premium p-6 group transition-premium">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-5">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-soft">
                            {s.fabric_image ? (
                              <img src={s.fabric_image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-primary/30"><Scan className="h-8 w-8" /></div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-black text-lg uppercase tracking-tight">{s.fabric_name}</h3>
                            <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                              <span className="text-foreground">{new Date(s.created_at).toLocaleDateString("en-IN")}</span>
                              <span className="h-1 w-1 rounded-full bg-black/10" />
                              {s.price && <span className="text-primary italic">₹{Number(s.price).toLocaleString("en-IN")} collected</span>}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground mt-2 bg-black/5 w-fit px-2 py-0.5 rounded-md">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[200px]">{s.delivery_address}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-black/5">
                          <Badge variant="outline" className={`h-8 font-black uppercase tracking-widest px-4 border-none shadow-soft ${s.status === 'Approved' ? 'bg-success/10 text-success' :
                            s.status === 'Shipped' ? 'bg-primary/10 text-primary' :
                              s.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
                                'bg-warning/10 text-warning'
                            }`}>{s.status}</Badge>

                          {s.status === 'Pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" className="h-10 rounded-xl font-black uppercase tracking-widest text-[9px] px-5 shadow-premium" onClick={async () => { await supabase.from("sample_requests").update({ status: 'Approved' }).eq('id', s.id); fetchAll(); toast.success('Sample approved'); }}>Approve</Button>
                              <Button size="sm" variant="ghost" className="h-10 rounded-xl font-black uppercase tracking-widest text-[9px] text-destructive hover:bg-destructive/5" onClick={async () => { await supabase.from("sample_requests").update({ status: 'Rejected' }).eq('id', s.id); fetchAll(); toast.success('Sample rejected'); }}>Reject</Button>
                            </div>
                          )}
                          {s.status === 'Approved' && (
                            <Button size="sm" className="h-10 rounded-xl font-black uppercase tracking-widest text-[9px] px-6 shadow-premium" onClick={async () => { await supabase.from("sample_requests").update({ status: 'Shipped' }).eq('id', s.id); fetchAll(); toast.success('Marked as shipped'); }}>Mark Shipped</Button>
                          )}
                        </div>
                      </div>
                      {s.notes && (
                        <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs italic text-muted-foreground">
                          "Request Note: {s.notes}"
                        </div>
                      )}
                    </div>
                  ))}
                  {sampleRequests.length === 0 && (
                    <div className="section-premium py-20 text-center opacity-40">
                      <Scan className="h-16 w-16 mx-auto text-muted/30 mb-6" />
                      <p className="font-display text-xl font-bold text-muted-foreground uppercase tracking-widest">No sample requests yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="mt-0">
                <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-soft border">
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-tight">Curation Hub</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Manage Sample Packs & Pricing</p>
                  </div>
                  <Button onClick={() => openSamplePackForm()} className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-xs shadow-premium">
                    <Plus className="mr-2 h-5 w-5" /> New Pack
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {samplePacks.map((p) => (
                    <div key={p.id} className="card-premium p-6 group transition-premium flex flex-col justify-between hover:border-primary/40">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-black text-xl uppercase tracking-tight text-foreground">{p.name}</h4>
                            {!p.active && <Badge variant="secondary" className="font-black text-[9px] uppercase h-5 bg-muted">Archived</Badge>}
                          </div>
                          <p className="text-xs font-black text-primary uppercase tracking-widest mt-1">₹{Number(p.price).toLocaleString("en-IN")}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-premium" onClick={() => openSamplePackForm(p)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-premium" onClick={() => deleteSamplePack(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-xl space-y-2 mb-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>Pack Logic</span>
                          <span className="text-foreground">{p.pack_type === 'category' ? `Full Category: ${p.category}` : `Custom Curator Set`}</span>
                        </div>
                        {p.pack_type === 'custom' && (
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <span>Capacity</span>
                            <span className="text-foreground">Max {p.max_items} Fabrics</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>Selections</span>
                          <span className="text-foreground">{p.fabric_ids?.length || 0} Qualities</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 overflow-hidden">
                        {p.fabric_ids?.slice(0, 6).map((fid, i) => {
                          const f = fabrics.find(fb => fb.id === fid);
                          return f?.image_url ? (
                            <img key={i} src={f.image_url} alt="" className="h-8 w-8 rounded-lg object-cover border-2 border-white shadow-soft" />
                          ) : (
                            <div key={i} className="h-8 w-8 rounded-lg bg-muted border-2 border-white flex items-center justify-center text-[8px] font-bold">FA</div>
                          );
                        })}
                        {(p.fabric_ids?.length || 0) > 6 && <span className="text-[10px] font-black text-muted-foreground ml-2">+{p.fabric_ids.length - 6} more</span>}
                      </div>
                    </div>
                  ))}
                  {samplePacks.length === 0 && (
                    <div className="col-span-2 section-premium py-24 text-center">
                      <PlusCircle className="h-20 w-20 mx-auto text-muted/20 mb-6" />
                      <p className="font-display text-xl font-bold text-muted-foreground uppercase tracking-widest">No sample kits created</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* LIBRARIES TAB */}
          <TabsContent value="colors" className="mt-6">
            <div className="flex flex-col gap-10">
              <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-soft border">
                <div>
                  <h2 className="font-black text-2xl uppercase tracking-tight">Master Color Libraries</h2>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Global reusable color configurations</p>
                </div>
                <Button onClick={() => openLibraryForm()} className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-xs shadow-premium">
                  <Plus className="mr-2 h-5 w-5" /> New Library
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {colorLibraries.map((lib) => (
                  <div key={lib.id} className="card-premium p-6 group transition-premium hover:border-primary/40">
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary shadow-soft group-hover:bg-primary group-hover:text-white transition-premium">
                        <Wand2 className="h-7 w-7" />
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-premium" onClick={() => openLibraryForm(lib)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-premium" onClick={() => deleteLibrary(lib.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="font-black text-lg uppercase tracking-tight">{lib.name}</h3>
                      <p className="mt-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {lib.colors.split(',').filter(Boolean).length} Shades Defined
                      </p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-1.5 p-3 rounded-xl bg-muted/20 border border-dashed border-black/5">
                      {lib.colors.split(',').filter(Boolean).slice(0, 15).map((c, i) => {
                        const parts = c.trim().split(':');
                        return (
                          <div key={i} className="h-5 w-5 rounded-full border-2 border-white shadow-soft" style={{ backgroundColor: parts[1] || '#ccc' }} title={parts[0]} />
                        );
                      })}
                      {lib.colors.split(',').filter(Boolean).length > 15 && (
                        <div className="h-5 w-5 flex items-center justify-center text-[8px] font-black bg-white rounded-full shadow-soft border">
                          +{lib.colors.split(',').filter(Boolean).length - 15}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {colorLibraries.length === 0 && (
                <div className="section-premium py-24 text-center opacity-40">
                  <PlusCircle className="h-20 w-20 mx-auto text-muted/20 mb-6" />
                  <p className="font-display text-xl font-bold text-muted-foreground uppercase tracking-widest">No master color libraries</p>
                  <Button variant="outline" className="mt-8 rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={() => openLibraryForm()}>Bootstrap Library</Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="card-premium p-8 transition-premium group hover:border-primary/40 bg-white/60">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-soft">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="font-black text-xl uppercase tracking-tight">Performance Qualities</h3>
                </div>
                <div className="space-y-4">
                  {stats.topFabrics.map((f, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-black/5 last:border-0 group-hover:px-2 transition-all rounded-lg hover:bg-primary/5">
                      <span className="font-bold text-foreground/80 uppercase tracking-tight text-sm">{f.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-primary">{f.count}</span>
                        <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50">Orders</span>
                      </div>
                    </div>
                  ))}
                  {stats.topFabrics.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground opacity-40">
                      <LayoutGrid className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Insufficient Data</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-premium p-8 transition-premium group hover:border-secondary/40 bg-white/60">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shadow-soft">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="font-black text-xl uppercase tracking-tight">Elite Partners</h3>
                </div>
                <div className="space-y-4">
                  {stats.topBuyers.map((b, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-black/5 last:border-0 group-hover:px-2 transition-all rounded-lg hover:bg-secondary/5">
                      <span className="font-bold text-foreground/80 uppercase tracking-tight text-sm">{b.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-secondary">₹{b.total.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50">Yield</span>
                      </div>
                    </div>
                  ))}
                  {stats.topBuyers.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground opacity-40">
                      <CreditCard className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Zero Transactional History</p>
                    </div>
                  )}
                </div>
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
          <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Dispatch update, shipping info..." rows={4} />
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

      {/* Payment Request Dialog */}
      <Dialog open={!!paymentDialog} onOpenChange={(v) => !v && setPaymentDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>WhatsApp Payment Request</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-xl bg-primary/5 p-4 text-xs text-primary font-bold border border-primary/10">
              This will generate a WhatsApp message to the buyer requesting a ₹5000 advance.
            </div>
            <div>
              <Label>Bank Details / Message</Label>
              <Textarea
                value={paymentForm.payment_message}
                onChange={(e) => setPaymentForm(p => ({ ...p, payment_message: e.target.value }))}
                className="mt-1.5 h-40 text-sm"
              />
            </div>
            <div>
              <Label>Payment Link</Label>
              <Input
                value={paymentForm.payment_link}
                onChange={(e) => setPaymentForm(p => ({ ...p, payment_link: e.target.value }))}
                className="mt-1.5"
                placeholder="https://pay.example.com/..."
              />
            </div>
            <Button onClick={sendPaymentRequest} className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-premium">
              <MessageSquare className="mr-2 h-5 w-5" /> Open WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sample Pack Dialog */}
      <Dialog open={samplePackDialog} onOpenChange={setSamplePackDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingSamplePack ? "Edit Sample Pack" : "Create Sample Pack"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Pack Name *</Label>
              <Input value={samplePackForm.name} onChange={(e) => setSamplePackForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Cotton Basics Set" className="mt-1.5" />
            </div>
            <div>
              <Label>Pack Type</Label>
              <Select value={samplePackForm.pack_type} onValueChange={(v) => setSamplePackForm(p => ({ ...p, pack_type: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Full Category</SelectItem>
                  <SelectItem value="custom">Custom Quality Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {samplePackForm.pack_type === 'category' ? (
              <div>
                <Label>Category</Label>
                <Select value={samplePackForm.category} onValueChange={(v) => setSamplePackForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {["Cotton", "Polyester", "Uniform", "Linen", "Silk", "Other"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label>Max Fabrics in Set</Label>
                <Input type="number"
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  value={samplePackForm.max_items}
                  onChange={(e) => setSamplePackForm(p => ({ ...p, max_items: Number(e.target.value) }))}
                  className="mt-1.5"
                />
              </div>
            )}
            <div>
              <Label>Price (₹) *</Label>
              <Input type="number"
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                value={samplePackForm.price}
                onChange={(e) => setSamplePackForm(p => ({ ...p, price: Number(e.target.value) }))}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Included Fabrics (Qualities)</Label>
              <div className="mt-2 rounded-lg border p-3 max-h-[300px] overflow-y-auto space-y-2">
                {fabrics.map((fabric) => (
                  <div key={fabric.id} className="flex items-center gap-2 px-1 hover:bg-muted/50 rounded transition-colors py-1">
                    <input
                      type="checkbox"
                      id={`fabric-${fabric.id}`}
                      checked={samplePackForm.fabric_ids.includes(fabric.id)}
                      onChange={(e) => {
                        const ids = e.target.checked
                          ? [...samplePackForm.fabric_ids, fabric.id]
                          : samplePackForm.fabric_ids.filter(id => id !== fabric.id);
                        setSamplePackForm(p => ({ ...p, fabric_ids: ids }));
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor={`fabric-${fabric.id}`} className="text-sm font-normal cursor-pointer flex-1 flex justify-between">
                      <span>{fabric.name}</span>
                      <span className="text-[10px] text-muted-foreground">{fabric.category}</span>
                    </Label>
                  </div>
                ))}
                {fabrics.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-4">No fabrics available</p>}
              </div>
              <p className="mt-1.5 text-[10px] text-muted-foreground">{samplePackForm.fabric_ids.length} fabrics selected for this pack</p>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={samplePackForm.active} onChange={(e) => setSamplePackForm(p => ({ ...p, active: e.target.checked }))} id="pack-active" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <Label htmlFor="pack-active" className="font-medium">Active (Visible to Buyers)</Label>
            </div>
          </div>
          <Button onClick={saveSamplePack}>{editingSamplePack ? "Update" : "Create"} Pack</Button>
        </DialogContent>
      </Dialog>
      <Dialog open={fabricDialog} onOpenChange={setFabricDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingFabric ? "Edit Fabric" : "Add Fabric"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Name *</Label><Input value={fabricForm.name} onChange={(e) => setFabricForm((p) => ({ ...p, name: e.target.value }))} className="mt-1.5" /></div>
            <div className="sm:col-span-2"><Label>Description</Label><Textarea value={fabricForm.description} onChange={(e) => setFabricForm((p) => ({ ...p, description: e.target.value }))} className="mt-1.5" /></div>
            <div>
              <Label>Categories *</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Cotton", "Polyester", "Uniform", "Linen", "Silk", "Other"].map(cat => {
                  const currentCats = fabricForm.category ? fabricForm.category.split(',').map(c => c.trim()).filter(Boolean) : [];
                  const isSelected = currentCats.includes(cat);
                  return (
                    <Badge
                      key={cat}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        let next;
                        if (isSelected) {
                          next = currentCats.filter(c => c !== cat);
                        } else {
                          next = [...currentCats, cat];
                        }
                        setFabricForm(p => ({ ...p, category: next.join(', ') }));
                      }}
                    >
                      {cat}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div><Label>Type *</Label><Input value={fabricForm.type} onChange={(e) => setFabricForm((p) => ({ ...p, type: e.target.value }))} className="mt-1.5" /></div>
            <div>
              <Label className="flex justify-between items-center">
                <span>Colors</span>
                <Button type="button" variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => setColorManagerOpen(true)}>
                  <Settings className="mr-1 h-3 w-3" /> Advanced Manager
                </Button>
              </Label>
              <div className="mt-1.5 flex flex-col gap-2">
                <Input
                  value={fabricForm.colors}
                  onChange={(e) => setFabricForm((p) => ({ ...p, colors: e.target.value }))}
                  placeholder="Red:#FF0000, Blue:#0000FF"
                  className="font-mono text-xs"
                />
                {fabricForm.colors && (
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-2 bg-muted/30 rounded-md border border-dashed">
                    {fabricForm.colors.split(',').filter(s => s.trim()).map((c, i) => {
                      const [name, hex] = c.trim().split(':');
                      return (
                        <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background border text-[10px] font-medium">
                          <span className="h-2 w-2 rounded-full border border-black/10" style={{ backgroundColor: hex || '#ccc' }} />
                          {name}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div><Label>Price/Meter (₹)</Label><Input type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} value={fabricForm.price_per_meter} onChange={(e) => setFabricForm((p) => ({ ...p, price_per_meter: Number(e.target.value) }))} className="mt-1.5" /></div>
            <div><Label>Min Order</Label><Input type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} value={fabricForm.min_order} onChange={(e) => setFabricForm((p) => ({ ...p, min_order: Number(e.target.value) }))} className="mt-1.5" /></div>
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
              <input type="checkbox" checked={fabricForm.available} onChange={(e) => setFabricForm((p) => ({ ...p, available: e.target.checked }))} id="avail" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <Label htmlFor="avail">Available</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={fabricForm.is_featured} onChange={(e) => setFabricForm((p) => ({ ...p, is_featured: e.target.checked }))} id="featured" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <Label htmlFor="featured" className="font-semibold text-primary">Show on Landing Page (Featured)</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={fabricForm.apc_available} onChange={(e) => setFabricForm((p) => ({ ...p, apc_available: e.target.checked }))} id="apc" className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary" />
              <Label htmlFor="apc" className="font-semibold text-secondary">APC Compatible (As Per Cutting)</Label>
            </div>
            <div className="sm:col-span-2 border-t pt-4"><h3 className="font-semibold mb-2">Specifications</h3></div>
            <div><Label>GM</Label><Input value={fabricForm.gm} onChange={(e) => setFabricForm((p) => ({ ...p, gm: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Weave</Label><Input value={fabricForm.weave} onChange={(e) => setFabricForm((p) => ({ ...p, weave: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Width</Label><Input value={fabricForm.width} onChange={(e) => setFabricForm((p) => ({ ...p, width: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Composition</Label><Input value={fabricForm.composition} onChange={(e) => setFabricForm((p) => ({ ...p, composition: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Finish</Label><Input value={fabricForm.finish} onChange={(e) => setFabricForm((p) => ({ ...p, finish: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Shrinkage</Label><Input value={fabricForm.shrinkage} onChange={(e) => setFabricForm((p) => ({ ...p, shrinkage: e.target.value }))} className="mt-1.5" /></div>
          </div>
          <Button onClick={saveFabric} className="w-full" disabled={isUploading}>
            {isUploading ? "Saving..." : (editingFabric ? "Update Fabric" : "Add Fabric")}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={orderDetailDialog} onOpenChange={setOrderDetailDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order Details: {viewingOrder?.fabric_name}
              {viewingOrder && (
                <Badge className={statusColors[viewingOrder.status]}>{viewingOrder.status}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {viewingOrder && (
            <div className="space-y-6 py-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Fabric Info</h4>
                    <div className="flex gap-4 items-center rounded-xl border bg-muted/30 p-3">
                      {viewingOrder.fabrics?.image_url && (
                        <img src={viewingOrder.fabrics.image_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-bold">{viewingOrder.fabric_name}</p>
                        <p className="text-sm text-muted-foreground">{viewingOrder.fabrics?.type || 'Fabric Quality'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Buyer Information</h4>
                    <div className="space-y-1.5 rounded-xl border p-4 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> <span className="font-bold">{viewingOrder.buyer_name}</span></p>
                      {viewingOrder.billing_name && <p><span className="text-muted-foreground">Billing:</span> <span className="font-bold">{viewingOrder.billing_name}</span></p>}
                      <p><span className="text-muted-foreground">Phone:</span> <span className="font-bold">{viewingOrder.phone}</span></p>
                      <p><span className="text-muted-foreground">Email:</span> <span className="font-bold underline">{viewingOrder.email}</span></p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Delivery Address</h4>
                    <div className="rounded-xl border p-4 text-sm leading-relaxed">
                      {viewingOrder.delivery_address}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Items Breakdown</h4>
                    <div className="space-y-2">
                      {viewingOrder.items && Array.isArray(viewingOrder.items) && viewingOrder.items.length > 0 ? (
                        viewingOrder.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center rounded-lg bg-muted/50 px-3 py-2 text-sm">
                            <span className="font-medium">
                              {item.color === "Not Specified" ? (viewingOrder.apc_details?.target_color || "Not Specified") : item.color}
                              ({item.quantityType})
                            </span>
                            <span className="font-bold">{item.quantity} {viewingOrder.fabrics?.unit || 'meters'}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-between items-center rounded-lg bg-muted/50 px-3 py-2 text-sm">
                          <span className="font-medium">
                            {(viewingOrder.selected_color === "Not Specified" || !viewingOrder.selected_color)
                              ? (viewingOrder.apc_details?.target_color || 'Standard')
                              : viewingOrder.selected_color}
                            ({viewingOrder.quantity_type || 'Lump'})
                          </span>
                          <span className="font-bold">{viewingOrder.quantity} {viewingOrder.fabrics?.unit || 'meters'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Total Order Value</p>
                    <p className="text-3xl font-black text-primary">
                      {viewingOrder.total == 0 ? "Matching Request" : `₹${Number(viewingOrder.total).toLocaleString("en-IN")}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase">Rate</p>
                    <p className="font-bold">₹{Number(viewingOrder.price_per_meter || 0).toLocaleString("en-IN")}/m</p>
                  </div>
                </div>
              </div>

              {viewingOrder.apc_details && viewingOrder.apc_details.is_apc && (
                <div className="rounded-xl bg-secondary/5 p-4 border border-secondary/20 space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-secondary">
                    <Wand2 className="h-4 w-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">APC Request (As Per Cutting)</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 text-sm">
                    {viewingOrder.apc_details.target_color && (
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold">Target Color</p>
                        <p className="font-bold text-secondary">{viewingOrder.apc_details.target_color}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Courier Dest. Address</p>
                      <p className="italic">{viewingOrder.apc_details.cutting_address}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Request Type</p>
                      <p className="font-bold">{viewingOrder.apc_details.quantity_type || "General APC"}</p>
                    </div>
                    {viewingOrder.apc_details.buyer_address && (
                      <div className="md:col-span-2 border-t border-secondary/10 pt-2 mt-2">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold">Buyer's Registered Address</p>
                        <p className="font-medium text-foreground">{viewingOrder.apc_details.buyer_address}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] bg-secondary/10 p-2 rounded text-secondary font-medium">
                    Note: This is a custom matching request. No payment has been collected.
                  </div>
                </div>
              )}

              {viewingOrder.notes && (
                <div className="rounded-xl bg-orange-50 p-4 border border-orange-100 text-sm">
                  <p className="text-xs font-bold text-orange-800 uppercase mb-1">Customer Notes</p>
                  <p className="italic text-orange-900">"{viewingOrder.notes}"</p>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                {(viewingOrder.status === 'Pending' || viewingOrder.status === 'Confirmed') && (
                  <Button
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-bold"
                    onClick={() => {
                      updateOrderStatus(viewingOrder.id, 'Staged');
                      setOrderDetailDialog(false);
                    }}
                  >
                    Stage Order
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOrderDetailDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Color Manager Dialog (Advanced) */}
      <Dialog open={colorManagerOpen} onOpenChange={setColorManagerOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Color Manager</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="bulk" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bulk"><Clipboard className="mr-2 h-4 w-4" /> Bulk Paste</TabsTrigger>
              <TabsTrigger value="visual"><MousePointer2 className="mr-2 h-4 w-4" /> Visual Picker</TabsTrigger>
              <TabsTrigger value="library"><Import className="mr-2 h-4 w-4" /> Master Sets</TabsTrigger>
            </TabsList>

            {/* BULK PASTE TAB */}
            <TabsContent value="bulk" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Paste from Excel/Text</Label>
                <Textarea
                  value={bulkColorText}
                  onChange={(e) => setBulkColorText(e.target.value)}
                  placeholder="Red #FF0000&#10;Blue #0000FF&#10;...or ColorName,HexCode"
                  className="min-h-[250px] font-mono text-xs"
                />
                <p className="text-[10px] text-muted-foreground">Supported formats: "Name Hex", "Name:Hex", "Name,Hex". One color per line.</p>
              </div>
              <Button className="w-full" onClick={() => {
                const lines = bulkColorText.split('\n').filter(l => l.trim());
                const detected = lines.map(line => {
                  const cleaned = line.trim().replace(/[,:]/g, ' ');
                  const parts = cleaned.split(/\s+/);
                  if (parts.length >= 2) {
                    const name = parts.slice(0, -1).join(' ');
                    const hex = parts[parts.length - 1];
                    if (hex.startsWith('#') || hex.match(/^[0-9a-fA-F]{3,6}$/)) {
                      return `${name}:${hex.startsWith('#') ? hex : '#' + hex}`;
                    }
                  }
                  return null;
                }).filter(Boolean);

                if (detected.length > 0) {
                  setFabricForm(p => ({ ...p, colors: [p.colors, ...detected].filter(Boolean).join(', ') }));
                  setBulkColorText("");
                  setColorManagerOpen(false);
                  toast.success(`Imported ${detected.length} colors`);
                } else {
                  toast.error("No valid colors detected. Check your format.");
                }
              }}>
                Append Colors
              </Button>
            </TabsContent>

            {/* VISUAL PICKER TAB */}
            <TabsContent value="visual" className="space-y-4 pt-4">
              <div className="flex flex-col items-center gap-4">
                {!visualPickerImage ? (
                  <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <Label htmlFor="chart-upload" className="cursor-pointer">
                      <div className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Upload Color Chart Image</div>
                      <input id="chart-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setVisualPickerImage(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </Label>
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    <div className="relative overflow-hidden rounded-xl border bg-black/5 flex justify-center">
                      <img
                        id="chart-img"
                        src={visualPickerImage}
                        alt="Color Chart"
                        className="max-h-[400px] object-contain cursor-crosshair"
                        onClick={(e) => {
                          const img = e.currentTarget;
                          const canvas = document.createElement('canvas');
                          canvas.width = img.naturalWidth;
                          canvas.height = img.naturalHeight;
                          const ctx = canvas.getContext('2d');
                          if (!ctx) return;
                          ctx.drawImage(img, 0, 0);

                          const rect = img.getBoundingClientRect();
                          const scaleX = img.naturalWidth / rect.width;
                          const scaleY = img.naturalHeight / rect.height;
                          const x = (e.clientX - rect.left) * scaleX;
                          const y = (e.clientY - rect.top) * scaleY;

                          const pixel = ctx.getImageData(x, y, 1, 1).data;
                          const hex = "#" + ("000000" + ((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16)).slice(-6);

                          const name = prompt("Color Name (e.g. Navy Blue)", `Color ${pickedColors.length + 1}`);
                          if (name) {
                            setPickedColors([...pickedColors, { name, hex }]);
                            toast.success(`Picked ${hex}`);
                          }
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">Click on the image to pick colors</p>
                      <Button variant="ghost" size="sm" onClick={() => setVisualPickerImage(null)}>Clear Image</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {pickedColors.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg border bg-card p-2 text-[10px] font-medium group">
                          <div className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                          <span className="flex-1 truncate">{c.name}</span>
                          <Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover:opacity-100" onClick={() => setPickedColors(p => p.filter((_, idx) => idx !== i))}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" disabled={pickedColors.length === 0} onClick={() => {
                      const formatted = pickedColors.map(p => `${p.name}:${p.hex}`).join(', ');
                      setFabricForm(p => ({ ...p, colors: [p.colors, formatted].filter(Boolean).join(', ') }));
                      setPickedColors([]);
                      setColorManagerOpen(false);
                      toast.success(`Added ${pickedColors.length} colors`);
                    }}>
                      Add Picked Colors to Fabric
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* MASTER LIBRARY TAB */}
            <TabsContent value="library" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-3">
                {colorLibraries.map((lib) => (
                  <button
                    key={lib.id}
                    className="flex items-center justify-between rounded-xl border p-4 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setFabricForm(p => ({ ...p, colors: lib.colors }));
                      setColorManagerOpen(false);
                      toast.success(`Applied ${lib.name} library`);
                    }}
                  >
                    <div>
                      <h4 className="font-bold">{lib.name}</h4>
                      <p className="text-xs text-muted-foreground">{lib.colors.split(',').length} Colors</p>
                    </div>
                    <div className="flex gap-1">
                      {lib.colors.split(',').slice(0, 5).map((c, i) => (
                        <div key={i} className="h-3 w-3 rounded-full border border-black/5" style={{ backgroundColor: c.split(':')[1] || '#ccc' }} />
                      ))}
                    </div>
                  </button>
                ))}
                {colorLibraries.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No libraries saved. Create them in the "Libraries" tab.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Color Library Management Dialog */}
      <Dialog open={colorLibraryDialog} onOpenChange={setColorLibraryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLibrary ? "Edit Library" : "Create Color Library"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lib-name">Library Name</Label>
              <Input id="lib-name" value={libraryForm.name} onChange={(e) => setLibraryForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Earth Tones 2024" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lib-colors">Colors (Format: Name:HexCode, ...)</Label>
              <Textarea id="lib-colors" value={libraryForm.colors} onChange={(e) => setLibraryForm(p => ({ ...p, colors: e.target.value }))} placeholder="Red:#FF0000, Blue:#0000FF" className="min-h-[150px]" />
              <p className="text-[10px] text-muted-foreground">Tip: You can use the Advanced Color Manager in any fabric to generate this list easily.</p>
            </div>
          </div>
          <Button onClick={saveLibrary}>{editingLibrary ? "Update" : "Create"} Library</Button>
        </DialogContent>
      </Dialog>

      {/* Design Request Response Dialog */}
      <Dialog open={!!designResponseDialog} onOpenChange={(open) => !open && setDesignResponseDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Design Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={designResponseForm.admin_availability}
                  onValueChange={(v) => setDesignResponseForm(p => ({ ...p, admin_availability: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Program">Program</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price (₹/meter)</Label>
                <Input
                  type="number"
                  value={designResponseForm.admin_price}
                  onChange={(e) => setDesignResponseForm(p => ({ ...p, admin_price: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight/Quality</Label>
                <Input
                  placeholder="e.g. 180 GM"
                  value={designResponseForm.admin_weight}
                  onChange={(e) => setDesignResponseForm(p => ({ ...p, admin_weight: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Delivery Days</Label>
                <Input
                  placeholder="e.g. 15 Days"
                  value={designResponseForm.admin_program}
                  onChange={(e) => setDesignResponseForm(p => ({ ...p, admin_program: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Internal Note/Revert</Label>
              <Textarea
                placeholder="Write your response to the buyer..."
                value={designResponseForm.admin_note}
                onChange={(e) => setDesignResponseForm(p => ({ ...p, admin_note: e.target.value }))}
              />
            </div>
          </div>
          <Button className="w-full" onClick={submitDesignResponse}>Send Revert to Buyer</Button>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
