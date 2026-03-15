import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Search, ShoppingCart, CreditCard, MapPin, Loader2, Truck, SlidersHorizontal, Clock, ArrowRight, Wand2, CheckCircle, HandCoins, MessageSquare } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useFabric } from "@/hooks/useFabrics";
import { supabase } from "@/integrations/supabase/client";
import { useFieldArray } from "react-hook-form";

const itemSchema = z.object({
  colors: z.array(z.string()).min(1, "At least one color must be selected"),
  quantity: z.coerce.number().min(0.1, "Quantity must be at least 0.1"),
  quantityType: z.enum(["Lump", "Cut Pack"]),
});

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const orderSchema = z.object({
  billingName: z.string().trim().min(1, "Billing name is required").max(100),
  gstNumber: z.string().trim().max(15).regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$|^$/, "Invalid GST format").optional(),
  phone: z.string().trim().min(10, "Valid phone required").max(15),
  email: z.string().trim().email("Valid email required").max(255),
  items: z.array(itemSchema).min(1, "At least one item is required"),
  addressLine1: z.string().trim().min(5, "Flat/House No. etc. is required"),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Valid 6-digit PIN code required"),
  notes: z.string().max(500).optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const ColorSelector = ({ availableColors, selectedColors, onToggle }: { availableColors: string; selectedColors: string[]; onToggle: (color: string) => void }) => {
  const [search, setSearch] = useState("");
  const allColors = availableColors.split(",").map(c => {
    const parts = c.trim().split(":");
    return { name: parts[0]?.trim() || "", hex: parts[1]?.trim() || "#CCCCCC" };
  }).filter(c => c.name);
  const filteredColors = allColors.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search colors..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="max-h-[200px] overflow-y-auto pr-2">
        <div className="flex flex-wrap gap-2">
          {filteredColors.map((c, idx) => {
            const isSelected = selectedColors.includes(c.name);
            return (
              <button key={idx} type="button" onClick={() => onToggle(c.name)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all outline-none ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background hover:border-primary/50"}`}>
                <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: c.hex }} />
                <span className="text-xs font-medium">{c.name}</span>
              </button>
            );
          })}
          {filteredColors.length === 0 && <p className="py-2 text-xs text-muted-foreground">No colors found</p>}
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ number, icon: Icon, title, subtitle }: { number: number; icon: any; title: string; subtitle: string }) => (
  <div className="flex items-center gap-4 mb-6 pb-4 border-b">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-md">
      {number}
    </div>
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="font-display font-bold text-lg leading-none">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  </div>
);

const OrderPage = () => {
  const { fabricId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: fabric, isLoading: fabricLoading } = useFabric(fabricId);
  const [submitted, setSubmitted] = useState<any>(null);

  const queryParams = new URLSearchParams(window.location.search);
  const colorsParam = queryParams.get("colors") || queryParams.get("color") || "";
  const initialColors = useMemo(() => colorsParam ? colorsParam.split(",").map(c => c.trim()).filter(Boolean) : [], [colorsParam]);

  const { register, handleSubmit, formState: { errors }, watch, reset, setValue, control } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: [{
        colors: initialColors.length > 0 ? initialColors : [],
        quantity: "" as any,
        quantityType: "" as any
      }],
    },
  });

  const watchedGst = watch("gstNumber");

  const watchedPincode = watch("pincode");
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Please sign in to place an order");
      navigate(`/auth?redirect=/order/${fabricId}`);
    }
  }, [authLoading, user, navigate, fabricId]);

  useEffect(() => {
    if (watchedPincode?.length === 6) {
      const fetchPincodeDetails = async () => {
        setIsFetchingPincode(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${watchedPincode}`);
          const data = await res.json();
          if (data && data[0]?.Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            const currentCity = watch("city");
            const currentState = watch("state");
            if (!currentCity) setValue("city", postOffice.District, { shouldValidate: true });
            if (!currentState) setValue("state", postOffice.State, { shouldValidate: true });
          }
        } catch (error) {
          console.error("Error fetching pincode:", error);
        } finally {
          setIsFetchingPincode(false);
        }
      };
      fetchPincodeDetails();
    }
  }, [watchedPincode, setValue, watch]);

  // Auto-fill initial colors if fabric is loaded and form is empty
  useEffect(() => {
    if (fabric && initialColors.length > 0) {
      const currentItems = watch("items");
      if (currentItems.length === 1 && currentItems[0].colors.length === 0) {
        setValue("items", [{
          colors: initialColors,
          quantity: "" as any,
          quantityType: "" as any
        }], { shouldValidate: true });
      }
    }
  }, [fabric, initialColors, setValue, watch]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles")
        .select("gst_number, billing_name, phone, delivery_address")
        .eq("user_id", user.id).single() as any;
      if (data) {
        reset((prev) => ({
          ...prev,
          gstNumber: data.gst_number || "",
          billingName: data.billing_name || "",
          phone: data.phone || "",
          email: user.email || "",
          addressLine1: data.delivery_address || "",
        }));
      } else {
        reset((prev) => ({ ...prev, email: user.email || "" }));
      }
    };
    fetchProfile();
  }, [user, reset]);

  const watchedItems = watch("items");
  const flattenItems = (items: { colors: string[], quantity: number, quantityType: string }[]) => {
    return items.flatMap(item => item.colors.map(color => ({ ...item, color })));
  };
  const flatItems = watchedItems ? flattenItems(watchedItems as any) : [];

  const total = fabric ? flatItems.reduce((sum, item) => sum + (item.quantity * Number(fabric.price_per_meter)), 0) : 0;
  const totalQuantity = flatItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  if (authLoading || fabricLoading) {
    return <div className="min-h-screen"><Navbar /><div className="container mx-auto flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Loading...</p></div><Footer /></div>;
  }
  if (!fabric) {
    return <div className="min-h-screen"><Navbar /><div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4"><div className="text-center"><h1 className="font-display text-2xl font-bold">Fabric not found</h1><Button variant="ghost" className="mt-4" onClick={() => navigate("/catalog")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog</Button></div></div><Footer /></div>;
  }

  const onSubmit = async (data: OrderFormData) => {
    if (!user) return;

    const fullAddress = [data.addressLine1, data.addressLine2, data.city, `${data.state} - ${data.pincode}`].filter(Boolean).join(", ");

    const { data: orderData, error } = await supabase.from("orders").insert({
      user_id: user.id,
      fabric_id: fabric.id,
      fabric_name: fabric.name,
      fabric_id_ref: fabric!.id,
      status: 'Pending',
      quantity: totalQuantity,
      total: total,
      price_per_meter: fabric!.price_per_meter,
      billing_name: data.billingName,
      gst_number: data.gstNumber || null,
      phone: data.phone,
      email: data.email,
      address_line1: data.addressLine1,
      address_line2: data.addressLine2,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      notes: data.notes,
      selected_color: flatItems.map(i => i.color).join(", "),
      quantity_type: flatItems.length > 1 ? "Mixed" : (flatItems[0]?.quantityType || "Lump"),
      items: flatItems,
      buyer_name: data.billingName,
      company_name: data.billingName,
      delivery_address: fullAddress,
    } as any).select().single();

    if (error) {
      console.error("Order Submission Error:", error);
      toast.error("Failed to place order. Please try again.");
      return;
    }

    await supabase.from("profiles").update({
      gst_number: data.gstNumber || "URD",
      billing_name: data.billingName,
      phone: data.phone,
      delivery_address: fullAddress,
    } as any).eq("user_id", user.id);

    setSubmitted(orderData);
    toast.success("Order placed successfully!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen"><Navbar />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-md text-center animate-fade-in bg-card border rounded-3xl p-10 shadow-premium">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-success/10 rotate-3 transition-transform hover:rotate-0">
              <svg className="h-12 w-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight uppercase">Order Received!</h1>
            <p className="mt-4 text-muted-foreground font-medium italic">Your order for <strong>{fabric.name}</strong> is in our system.</p>

            <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-sm font-bold text-primary uppercase tracking-widest leading-none mb-6">Your Order Roadmap</p>

              {/* Process Roadmap */}
              <div className="relative mb-8 px-2">
                <div className="absolute top-5 left-8 right-8 h-0.5 bg-muted/40" />
                <div className="flex justify-between relative">
                  {[
                    { label: "Ordered", icon: CheckCircle, active: true, done: true },
                    { label: "Advance", icon: HandCoins, active: true },
                    { label: "Dispatching", icon: Wand2 },
                    { label: "Billing", icon: CreditCard },
                    { label: "Shipping", icon: Truck },
                  ].map((step, i) => {
                    const StepIcon = step.icon;
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 group">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 transition-all ${step.done ? "bg-success text-white" : step.active ? "bg-primary text-white shadow-premium animate-pulse" : "bg-muted text-muted-foreground border"}`}>
                          <StepIcon className="h-5 w-5" />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${step.active ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">Please verify your order on WhatsApp to receive the bank details for your <span className="text-foreground font-bold">₹5000 advance payment</span>. Dispatching starts immediately after payment.</p>
                <Button
                  className="w-full h-14 rounded-xl font-black uppercase tracking-widest shadow-premium bg-[#25D366] hover:bg-[#128C7E] text-white transition-premium py-2 px-4 flex items-center justify-center gap-2"
                  onClick={() => {
                    const msg = `Hi, I just placed order #${submitted.id.slice(0, 8)} for ${fabric.name} (${totalQuantity}${fabric.unit}). Please share bank details for the ₹5000 advance payment.`;
                    window.open(`https://wa.me/910000000000?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                >
                  <MessageSquare className="h-6 w-6" />
                  Verify & Pay on WhatsApp
                </Button>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={() => navigate("/orders")} variant="ghost" className="h-12 px-8 rounded-xl font-bold hover:bg-primary/5 text-primary">View My Orders</Button>
              <Button onClick={() => navigate("/catalog")} variant="outline" className="h-12 px-8 rounded-xl font-bold border-black/10">Continue Shopping</Button>
            </div>
          </div>
        </div>
        <Footer /></div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/catalog")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog
        </Button>

        {/* Fabric header */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-10">
          {fabric.image_url && (
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-muted shadow-sm">
              <img src={fabric.image_url} alt={fabric.name} className="h-full w-full object-cover" />
            </div>
          )}
          <div>
            <h1 className="font-display text-4xl font-bold">{fabric.name}</h1>
            <p className="mt-1 text-muted-foreground">Complete the three sections below to place your order</p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* ── SECTION 1: ORDER ITEMS ── */}
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <SectionHeader number={1} icon={ShoppingCart} title="Order Items" subtitle="Select colors and quantities" />
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">Add one or more color–quantity combinations</p>
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => append({ colors: [], quantity: "", quantityType: "" } as any)}>
                    <Plus className="mr-1 h-4 w-4" /> Add Item Config
                  </Button>
                </div>
                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const itemColors = watch(`items.${index}.colors`) || [];
                    const itemQuantityType = watch(`items.${index}.quantityType`);

                    const handleColorToggle = (color: string) => {
                      const newColors = itemColors.includes(color)
                        ? itemColors.filter(c => c !== color)
                        : [...itemColors, color];
                      setValue(`items.${index}.colors`, newColors, { shouldValidate: true, shouldDirty: true });
                    };

                    return (
                      <div key={field.id} className="relative rounded-xl border bg-background p-5">
                        {fields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon"
                            className="absolute right-2 top-2 text-destructive hover:bg-destructive/10"
                            onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <div className="space-y-5">
                          <div>
                            <Label className="mb-2 block">Select Colors * <span className="text-xs text-muted-foreground font-normal">(choose one or more)</span></Label>
                            <ColorSelector availableColors={fabric.colors || ""} selectedColors={itemColors}
                              onToggle={handleColorToggle} />
                            {errors.items?.[index]?.colors && <p className="mt-1 text-sm text-destructive">{errors.items[index]?.colors?.message}</p>}
                          </div>
                          <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                              <Label>Quantity Type *</Label>
                              <RadioGroup value={itemQuantityType}
                                onValueChange={(v: "Lump" | "Cut Pack") => setValue(`items.${index}.quantityType`, v, { shouldValidate: true, shouldDirty: true })}
                                className="mt-3 flex gap-4">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Lump" id={`lump-${index}`} />
                                  <Label htmlFor={`lump-${index}`} className="font-normal cursor-pointer">Lump ({">"}40m)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Cut Pack" id={`cutpack-${index}`} />
                                  <Label htmlFor={`cutpack-${index}`} className="font-normal cursor-pointer">Cut Pack (1.2m)</Label>
                                </div>
                              </RadioGroup>
                            </div>
                            <div>
                              <Label htmlFor={`quantity-${index}`}>Quantity ({fabric.unit}) *</Label>
                              <Input id={`quantity-${index}`} type="number"
                                step={itemQuantityType === "Cut Pack" ? "1.20" : "1"}
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                {...register(`items.${index}.quantity` as const, {
                                  validate: (val) => {
                                    if (itemQuantityType === "Lump" && val < 40) return "Lump order must be at least 40m";
                                    if (itemQuantityType === "Cut Pack") {
                                      const ok = Math.abs(val % 1.20) < 0.01 || Math.abs((val % 1.20) - 1.20) < 0.01;
                                      if (!ok) return "Must be a multiple of 1.20m";
                                    }
                                    return true;
                                  }
                                })} className="mt-1.5" />
                              {errors.items?.[index]?.quantity && <p className="mt-1 text-sm text-destructive">{errors.items[index]?.quantity?.message}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>


              {/* ── SECTION 2: BILLING & DELIVERY DETAILS ── */}
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <SectionHeader number={2} icon={CreditCard} title="Billing & Delivery Details" subtitle="For invoice, contact, and shipping" />
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="billingName">Billing Name *</Label>
                    <Input id="billingName" {...register("billingName")} className="mt-1.5" placeholder="Full name or company for invoice" />
                    {errors.billingName && <p className="mt-1 text-sm text-destructive">{errors.billingName.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="gstNumber">GST Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input id="gstNumber" {...register("gstNumber")} className="mt-1.5" placeholder="e.g. 22AAAAA0000A1Z5" />
                    {errors.gstNumber && <p className="mt-1 text-sm text-destructive">{errors.gstNumber.message}</p>}
                  </div>


                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" {...register("phone")} className="mt-1.5" placeholder="10-digit mobile number" />
                    {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register("email")} className="mt-1.5" />
                    {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="sm:col-span-2 pt-4 border-t mt-2">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold">Delivery Address</h4>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label htmlFor="addressLine1">Flat, House no., Building, Company *</Label>
                        <Input id="addressLine1" {...register("addressLine1")} className="mt-1.5" />
                        {errors.addressLine1 && <p className="mt-1 text-sm text-destructive">{errors.addressLine1.message}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="addressLine2">Area, Street, Sector, Village <span className="text-muted-foreground text-xs">(optional)</span></Label>
                        <Input id="addressLine2" {...register("addressLine2")} className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor="city">Town/City *</Label>
                        <Input id="city" {...register("city")} className="mt-1.5" />
                        {errors.city && <p className="mt-1 text-sm text-destructive">{errors.city.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="pincode">PIN Code *</Label>
                        <div className="relative">
                          <Input id="pincode" {...register("pincode")} className="mt-1.5" placeholder="6 digits" maxLength={6} />
                          {isFetchingPincode && <Loader2 className="absolute right-3 top-4 h-4 w-4 animate-spin text-muted-foreground" />}
                        </div>
                        {errors.pincode && <p className="mt-1 text-sm text-destructive">{errors.pincode.message}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="state">State *</Label>
                        <Select
                          value={watch("state")}
                          onValueChange={(val) => setValue("state", val, { shouldValidate: true })}
                        >
                          <SelectTrigger className="mt-1.5 h-10 w-full bg-background">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[250px]">
                            {INDIAN_STATES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.state && <p className="mt-1 text-sm text-destructive">{errors.state.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="notes">Additional Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Textarea id="notes" {...register("notes")} rows={2} className="mt-1.5"
                      placeholder="Special requirements, preferred delivery time, etc." />
                  </div>
                </div>
              </div>




              <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">By placing this order, you agree to our terms of service.</p>
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-black shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Confirm Order & Proceed — ₹{total.toLocaleString("en-IN")}
                </Button>
              </div>
            </form>
          </div>

          {/* ── ORDER SUMMARY SIDEBAR ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-sm space-y-5">
              <h3 className="font-display text-lg font-semibold">Order Summary</h3>
              {fabric.image_url && (
                <div className="aspect-[4/3] overflow-hidden rounded-xl">
                  <img src={fabric.image_url} alt={fabric.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Fabric</span><span className="font-medium text-right max-w-[60%]">{fabric.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{fabric.category || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{fabric.type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span>₹{Number(fabric.price_per_meter).toLocaleString("en-IN")}/m</span></div>
              </div>

              {flatItems.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Items</p>
                  {flatItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm rounded-lg bg-muted/30 px-3 py-2">
                      <span className="truncate mr-2">{item.color || "—"} <span className="text-xs text-muted-foreground">({item.quantityType})</span></span>
                      <span className="font-medium shrink-0">{Number(item.quantity) > 0 ? `${item.quantity} ${fabric.unit || 'meters'}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Quantity</span>
                  <span className="font-medium">{totalQuantity > 0 ? `${totalQuantity} ${fabric.unit || 'meters'}` : '0'}</span>
                </div>
                <div className="flex justify-between items-center rounded-xl bg-primary/5 border border-primary/10 px-4 py-3">
                  <span className="font-bold">Estimated Total</span>
                  <span className="text-xl font-black text-primary">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-dashed text-[11px] leading-relaxed space-y-2">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Note on Quantity
                  </p>
                  <p className="text-muted-foreground">
                    The final quantity may vary by <strong>5-10 meters</strong> from your selection.
                    This is an estimate; the final invoice will reflect the actual quantity dispatched.
                  </p>
                  <p className="text-muted-foreground">
                    Final price will be confirmed after our team reviews the order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderPage;
