import { useParams, useNavigate } from "react-router-dom";
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
import { ArrowLeft, Plus, Trash2, Search } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { useFabric, useFabricImages } from "@/hooks/useFabrics";
import { supabase } from "@/integrations/supabase/client";
import { useFieldArray } from "react-hook-form";

const itemSchema = z.object({
  color: z.string().min(1, "Color is required"),
  quantity: z.coerce.number().min(0.1, "Quantity must be at least 0.1"),
  quantityType: z.enum(["Lump", "Cut Pack"]),
  apcCode: z.string().optional(),
});

const orderSchema = z.object({
  billingName: z.string().trim().min(1, "Billing name is required").max(100),
  gstNumber: z.string().trim().max(15).regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$|^$/, "Invalid GST format").optional(),
  companyName: z.string().trim().min(1, "Company name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone required").max(15),
  state: z.string().min(1, "State is required"),
  email: z.string().trim().email("Valid email required").max(255),
  items: z.array(itemSchema).min(1, "At least one item is required"),
  deliveryAddress: z.string().trim().min(10, "Full address required").max(500),
  notes: z.string().max(500).optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const ColorSelector = ({ colors, selectedColor, onSelect }: { colors: string; selectedColor: string; onSelect: (color: string) => void }) => {
  const [search, setSearch] = useState("");

  const allColors = colors.split(",").map(c => {
    const parts = c.trim().split(":");
    return {
      name: parts[0]?.trim() || "",
      hex: parts[1]?.trim() || "#CCCCCC"
    };
  }).filter(c => c.name);

  const filteredColors = allColors.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search colors..."
          className="pl-9 h-9 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-wrap gap-2">
          {filteredColors.map((c, idx) => {
            const isSelected = selectedColor === c.name;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelect(c.name)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all outline-none ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background hover:border-primary/50"
                  }`}
              >
                <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: c.hex }} />
                <span className="text-xs font-medium">{c.name}</span>
              </button>
            );
          })}
          {filteredColors.length === 0 && (
            <p className="py-2 text-xs text-muted-foreground">No colors found</p>
          )}
        </div>
      </div>
    </div>
  );
};

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const OrderPage = () => {
  const { fabricId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: fabric, isLoading: fabricLoading } = useFabric(fabricId);
  const [submitted, setSubmitted] = useState(false);

  const queryParams = new URLSearchParams(window.location.search);
  const colorsParam = queryParams.get("colors") || queryParams.get("color") || "";
  const initialColors = useMemo(() => colorsParam ? colorsParam.split(",").map(c => c.trim()).filter(Boolean) : [], [colorsParam]);

  const { register, handleSubmit, formState: { errors }, watch, reset, setValue, control } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: initialColors.length > 0
        ? initialColors.map(c => ({ color: c, quantity: 100, quantityType: "Lump" }))
        : [{ color: "", quantity: 100, quantityType: "Lump" }],
    },
  });

  const [gstLegalName, setGstLegalName] = useState("");
  const watchedGst = watch("gstNumber");

  useEffect(() => {
    const fetchGstLegalName = async (gst: string) => {
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)) {
        setGstLegalName("");
        return;
      }

      // Simulated API call to fetch GST legal name
      setTimeout(() => {
        setGstLegalName("MOCK LEGAL ENTITY PVT LTD"); // In real life, fetch from GST API
      }, 500);
    };

    if (watchedGst) {
      fetchGstLegalName(watchedGst);
    } else {
      setGstLegalName("");
    }
  }, [watchedGst]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Please sign in to place an order");
      navigate(`/auth?redirect=/order/${fabricId}`);
    }
  }, [authLoading, user, navigate, fabricId]);

  useEffect(() => {
    if (fabric) {
      const isDefaultState = fields.length === 1 && !fields[0].color;
      if (isDefaultState || initialColors.length > 0) {
        const items = initialColors.length > 0
          ? initialColors.map(c => ({ color: c, quantity: fabric.min_order, quantityType: "Lump" as const }))
          : [{ color: fabric.colors?.split(",")[0]?.split(":")[0]?.trim() || "", quantity: fabric.min_order, quantityType: "Lump" as const }];

        reset((prev) => ({
          ...prev,
          items
        }));
      }
    }
  }, [fabric, reset, initialColors]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("gst_number, company_name, phone, delivery_address, state")
        .eq("user_id", user.id)
        .single() as any;
      if (data) {
        reset((prev) => ({
          ...prev,
          gstNumber: data.gst_number || "",
          gstLegalName: data.gst_legal_name || "",
          billingName: data.billing_name || "",
          companyName: data.company_name || "",
          phone: data.phone || "",
          email: user.email || "",
          deliveryAddress: data.delivery_address || "",
          state: data.state || "Madhya Pradesh",
        }));
      } else {
        reset((prev) => ({ ...prev, email: user.email || "" }));
      }
    };
    fetchProfile();
  }, [user, reset]);

  useEffect(() => {
    if (gstLegalName) {
      // Potentially sync or just display
    }
  }, [gstLegalName]);

  const watchedItems = watch("items");
  const watchedState = watch("state");
  const subtotal = fabric ? watchedItems.reduce((sum, item) => sum + (item.quantity * Number(fabric.price_per_meter)), 0) : 0;
  const totalQuantity = watchedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const gstRate = 0.05;
  const isMP = watchedState === "Madhya Pradesh";
  const cgst = isMP ? subtotal * (gstRate / 2) : 0;
  const sgst = isMP ? subtotal * (gstRate / 2) : 0;
  const igst = !isMP ? subtotal * gstRate : 0;
  const totalGst = cgst + sgst + igst;
  const totalWithTax = subtotal + totalGst;

  if (authLoading || fabricLoading) {
    return <div className="min-h-screen"><Navbar /><div className="container mx-auto flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Loading...</p></div><Footer /></div>;
  }

  if (!fabric) {
    return (
      <div className="min-h-screen"><Navbar /><div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4"><div className="text-center"><h1 className="font-display text-2xl font-bold">Fabric not found</h1><Button variant="ghost" className="mt-4" onClick={() => navigate("/catalog")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog</Button></div></div><Footer /></div>
    );
  }

  const onSubmit = async (data: OrderFormData) => {
    if (!user) return;
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      fabric_id: fabric.id,
      fabric_name: fabric.name,
      gst_number: data.gstNumber || "URD",
      gst_legal_name: gstLegalName || (data.gstNumber ? null : "Unregistered Dealer"),
      billing_name: data.billingName,
      company_name: data.companyName,
      phone: data.phone,
      email: data.email,
      quantity: totalQuantity,
      price_per_meter: Number(fabric.price_per_meter),
      subtotal: subtotal,
      cgst,
      sgst,
      igst,
      total_gst: totalGst,
      total: totalWithTax,
      delivery_address: data.deliveryAddress,
      state: data.state,
      notes: data.notes || null,
      fabric_id_ref: fabric.id,
      selected_color: data.items.map(i => i.color).join(", "),
      quantity_type: data.items.length > 1 ? "Mixed" : data.items[0].quantityType,
      items: data.items, // JSONB field
    } as any);

    if (error) { toast.error("Failed to place order. Please try again."); return; }

    await supabase.from("profiles").update({
      gst_number: data.gstNumber || "URD",
      gst_legal_name: gstLegalName || (data.gstNumber ? null : "Unregistered Dealer"),
      billing_name: data.billingName,
      company_name: data.companyName,
      phone: data.phone,
      state: data.state,
      delivery_address: data.deliveryAddress,
    } as any).eq("user_id", user.id);

    setSubmitted(true);
    toast.success("Order placed successfully!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-md text-center animate-fade-in">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <svg className="h-10 w-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-bold">Order Placed!</h1>
            <p className="mt-3 text-muted-foreground">Your order for <strong>{fabric.name}</strong> has been received.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => navigate("/orders")}>View Orders</Button>
              <Button variant="outline" onClick={() => navigate("/catalog")}>Continue Shopping</Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/catalog")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog
        </Button>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {fabric.image_url && (
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border bg-muted shadow-sm group">
                  <img src={fabric.image_url} alt={fabric.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                </div>
              )}
              <div>
                <h1 className="font-display text-4xl font-bold">{fabric.name}</h1>
                <p className="mt-1 text-muted-foreground">Configure your order specifications</p>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-12">
              {/* Section 1: Billing Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
                  <h2 className="text-xl font-bold tracking-tight">Billing Information</h2>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="billingName">Billing Legal Name *</Label>
                    <Input id="billingName" {...register("billingName")} className="bg-background/50" placeholder="Person or Entity Name for Invoice" />
                    {errors.billingName && <p className="text-xs text-destructive font-medium">{errors.billingName.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                    <Input id="gstNumber" {...register("gstNumber")} className="bg-background/50" placeholder="e.g. 22AAAAA0000A1Z5" />
                    {errors.gstNumber && <p className="text-xs text-destructive font-medium">{errors.gstNumber.message}</p>}
                  </div>

                  {gstLegalName && (
                    <div className="sm:col-span-2 bg-primary/5 p-4 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <Label className="text-[10px] text-primary uppercase font-black tracking-widest leading-none">Verified GST Entity</Label>
                      </div>
                      <p className="text-sm font-bold text-foreground pl-3">{gstLegalName}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Registered Company Name *</Label>
                    <Input id="companyName" {...register("companyName")} className="bg-background/50" />
                    {errors.companyName && <p className="text-xs text-destructive font-medium">{errors.companyName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Billing State *</Label>
                    <select
                      id="state"
                      {...register("state")}
                      className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    >
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="text-xs text-destructive font-medium">{errors.state.message}</p>}
                    <p className="text-[10px] text-muted-foreground italic pl-1 mt-1">Used for GST calculation (IGST vs CGST/SGST)</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Logistics & Contact */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">2</div>
                  <h2 className="text-xl font-bold tracking-tight">Logistics & Contact Detail</h2>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                    <Textarea 
                      id="deliveryAddress" 
                      {...register("deliveryAddress")} 
                      className="bg-background/50 min-h-[100px] resize-none" 
                      placeholder="Street, Landmark, City, Pincode..."
                    />
                    {errors.deliveryAddress && <p className="text-xs text-destructive font-medium">{errors.deliveryAddress.message}</p>}
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Contact Phone *</Label>
                      <Input id="phone" {...register("phone")} className="bg-background/50" placeholder="+91 XXXXX XXXXX" />
                      {errors.phone && <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Corporate Email *</Label>
                      <Input id="email" type="email" {...register("email")} className="bg-background/50" placeholder="corporate@domain.com" />
                      {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Order Configuration */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">3</div>
                    <h2 className="text-xl font-bold tracking-tight">Order Configuration</h2>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 font-bold text-[10px] tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all"
                    onClick={() => append({ color: "", quantity: fabric.min_order, quantityType: "Lump" })}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Color variant
                  </Button>
                </div>

                <div className="grid gap-6">
                  {fields.map((field, index) => {
                    const itemColor = watch(`items.${index}.color`);
                    const itemQuantityType = watch(`items.${index}.quantityType`);

                    return (
                      <div key={field.id} className="relative rounded-[2rem] border bg-card/30 backdrop-blur-sm p-8 shadow-sm transition-all hover:shadow-md ring-1 ring-border/50">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}

                        <div className="space-y-8">
                          <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">1. Select Color Tone *</Label>
                            <ColorSelector
                              colors={fabric.colors || ""}
                              selectedColor={itemColor}
                              onSelect={(color) => setValue(`items.${index}.color`, color)}
                            />
                            {errors.items?.[index]?.color && <p className="text-xs text-destructive font-medium mt-1">{errors.items[index]?.color?.message}</p>}
                          </div>

                          <div className="grid gap-8 sm:grid-cols-2">
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">2. Quantity Type *</Label>
                              <RadioGroup
                                defaultValue="Lump"
                                value={itemQuantityType}
                                onValueChange={(v: "Lump" | "Cut Pack") => setValue(`items.${index}.quantityType`, v)}
                                className="flex gap-4 p-1 bg-muted/50 rounded-xl"
                              >
                                <div className={`flex flex-1 items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer ${itemQuantityType === "Lump" ? "bg-background shadow-sm border-primary/20" : "border-transparent text-muted-foreground"}`} onClick={() => setValue(`items.${index}.quantityType`, "Lump")}>
                                  <RadioGroupItem value="Lump" id={`lump-${index}`} className="sr-only" />
                                  <Label htmlFor={`lump-${index}`} className="flex-1 cursor-pointer font-bold text-xs uppercase tracking-tighter">Lump (Min 40m)</Label>
                                </div>
                                <div className={`flex flex-1 items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer ${itemQuantityType === "Cut Pack" ? "bg-background shadow-sm border-primary/20" : "border-transparent text-muted-foreground"}`} onClick={() => setValue(`items.${index}.quantityType`, "Cut Pack")}>
                                  <RadioGroupItem value="Cut Pack" id={`cutpack-${index}`} className="sr-only" />
                                  <Label htmlFor={`cutpack-${index}`} className="flex-1 cursor-pointer font-bold text-xs uppercase tracking-tighter">Cut Pack (Max 20m)</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor={`quantity-${index}`} className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">3. Requirement ({fabric.unit}) *</Label>
                              <div className="relative">
                                <Input
                                  id={`quantity-${index}`}
                                  type="number"
                                  step="any"
                                  {...register(`items.${index}.quantity` as const, {
                                    validate: (val) => {
                                      if (itemQuantityType === "Lump" && val < 40) return "Lump packing must be at least 40m";
                                      if (itemQuantityType === "Cut Pack" && val > 20) {
                                        return "Max 20m for Cut Pack. For larger orders, please select Lump packing (>40m).";
                                      }
                                      return true;
                                    },
                                  })}
                                  className="h-12 bg-background/50 font-bold text-lg rounded-xl pr-12 focus:ring-primary/10"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground uppercase">{fabric.unit}</span>
                              </div>
                              {errors.items?.[index]?.quantity && <p className="text-xs text-destructive font-semibold mt-1 animate-pulse">{errors.items[index]?.quantity?.message}</p>}
                            </div>
                          </div>

                          {!!fabric?.apc_enabled && (
                            <div className="bg-muted/30 p-4 rounded-2xl border border-dashed hover:border-primary/30 transition-colors">
                              <Label htmlFor={`apc-${index}`} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">APC Code (Dyeing Unit Reference)</Label>
                              <Input
                                id={`apc-${index}`}
                                {...register(`items.${index}.apcCode` as const)}
                                placeholder="Enter APC code for precision matching"
                                className="h-10 bg-background/50 border-white/10 rounded-xl"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Finalization */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">4</div>
                  <h2 className="text-xl font-bold tracking-tight">Finalization</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Requirements / Shipping Notes</Label>
                    <Textarea 
                      id="notes" 
                      {...register("notes")} 
                      className="bg-background/50 min-h-[80px] resize-none" 
                      placeholder="Any specific instructions for processing or dispatch..." 
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-16 text-lg font-black tracking-[0.1em] rounded-2xl shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-2xl active:scale-95 group uppercase"
                  >
                    <span className="flex items-center gap-3">
                      GENERATE PURCHASE ORDER — ₹{totalWithTax.toLocaleString("en-IN")}
                    </span>
                  </Button>
                  <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mt-4 animate-pulse">
                    * Final logistics charges will be added post-dispatch
                  </p>
                </div>
              </div>
            </form>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">Order Summary</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Fabric</span><span className="font-medium">{fabric.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{fabric.category || "Uncategorized"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{fabric.type}</span></div>

                <div className="border-t pt-2 mt-2">
                  <p className="font-semibold mb-2">Items Highlights:</p>
                  {watchedItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs mb-1">
                      <span>{item.color || "Color"} ({item.quantity}m)</span>
                      <span className="text-muted-foreground">{item.quantityType}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span>₹{Number(fabric.price_per_meter).toLocaleString("en-IN")}/meter</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between font-medium text-xs">
                  <span className="text-muted-foreground">GST (5%)</span>
                  <div className="text-right">
                    {isMP ? (
                      <>
                        <div>CGST (2.5%): ₹{cgst.toLocaleString("en-IN")}</div>
                        <div>SGST (2.5%): ₹{sgst.toLocaleString("en-IN")}</div>
                      </>
                    ) : (
                      <div>IGST (5%): ₹{igst.toLocaleString("en-IN")}</div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Quantity</span><span>{totalQuantity} {fabric.unit}</span></div>
                <div className="border-t pt-3">
                  <div className="flex justify-between"><span className="font-semibold">Grand Total</span><span className="text-xl font-bold text-primary">₹{totalWithTax.toLocaleString("en-IN")}</span></div>
                  <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes.</p>
                  <p className="mt-2 text-[10px] font-bold text-primary animate-pulse italic">
                    * Transportation charges would be added to the final billing.
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
