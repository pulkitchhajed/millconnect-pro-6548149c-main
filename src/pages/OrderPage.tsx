import { useParams, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { useState, useEffect, useMemo } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
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
<<<<<<< HEAD
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
});

const orderSchema = z.object({
  billingName: z.string().trim().min(1, "Billing name is required").max(100),
  gstNumber: z.string().trim().max(15).regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$|^$/, "Invalid GST format").optional(),
  companyName: z.string().trim().min(1, "Company name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone required").max(15),
  email: z.string().trim().email("Valid email required").max(255),
  items: z.array(itemSchema).min(1, "At least one item is required"),
=======
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFabric } from "@/hooks/useFabrics";
import { supabase } from "@/integrations/supabase/client";

const orderSchema = z.object({
  buyerName: z.string().trim().min(1, "Name is required").max(100),
  companyName: z.string().trim().min(1, "Company name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone required").max(15),
  email: z.string().trim().email("Valid email required").max(255),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
  deliveryAddress: z.string().trim().min(10, "Full address required").max(500),
  notes: z.string().max(500).optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

<<<<<<< HEAD
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

=======
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
const OrderPage = () => {
  const { fabricId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: fabric, isLoading: fabricLoading } = useFabric(fabricId);
  const [submitted, setSubmitted] = useState(false);

<<<<<<< HEAD
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
=======
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { quantity: 500 },
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Please sign in to place an order");
      navigate(`/auth?redirect=/order/${fabricId}`);
    }
  }, [authLoading, user, navigate, fabricId]);

  useEffect(() => {
    if (fabric) {
<<<<<<< HEAD
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
=======
      reset((prev) => ({ ...prev, quantity: fabric.min_order }));
    }
  }, [fabric, reset]);
>>>>>>> e46736471f833d2da9d10d2067485c256946635b

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
<<<<<<< HEAD
        .select("gst_number, company_name, phone, delivery_address")
        .eq("user_id", user.id)
        .single() as any;
      if (data) {
        reset((prev) => ({
          ...prev,
          gstNumber: data.gst_number || "",
          gstLegalName: data.gst_legal_name || "",
          billingName: data.billing_name || "",
=======
        .select("buyer_name, company_name, phone, delivery_address")
        .eq("user_id", user.id)
        .single();
      if (data) {
        reset((prev) => ({
          ...prev,
          buyerName: data.buyer_name || "",
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
          companyName: data.company_name || "",
          phone: data.phone || "",
          email: user.email || "",
          deliveryAddress: data.delivery_address || "",
        }));
      } else {
        reset((prev) => ({ ...prev, email: user.email || "" }));
      }
    };
    fetchProfile();
  }, [user, reset]);

<<<<<<< HEAD
  useEffect(() => {
    if (gstLegalName) {
      // Potentially sync or just display
    }
  }, [gstLegalName]);

  const watchedItems = watch("items");
  const total = fabric ? watchedItems.reduce((sum, item) => sum + (item.quantity * Number(fabric.price_per_meter)), 0) : 0;
  const totalQuantity = watchedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
=======
  const quantity = watch("quantity");
  const total = fabric ? quantity * Number(fabric.price_per_meter) : 0;
>>>>>>> e46736471f833d2da9d10d2067485c256946635b

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
<<<<<<< HEAD
      gst_number: data.gstNumber || "URD",
      gst_legal_name: gstLegalName || (data.gstNumber ? null : "Unregistered Dealer"),
      billing_name: data.billingName,
      company_name: data.companyName,
      phone: data.phone,
      email: data.email,
      quantity: totalQuantity,
=======
      buyer_name: data.buyerName,
      company_name: data.companyName,
      phone: data.phone,
      email: data.email,
      quantity: data.quantity,
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
      price_per_meter: Number(fabric.price_per_meter),
      total,
      delivery_address: data.deliveryAddress,
      notes: data.notes || null,
      fabric_id_ref: fabric.id,
<<<<<<< HEAD
      selected_color: data.items.map(i => i.color).join(", "),
      quantity_type: data.items.length > 1 ? "Mixed" : data.items[0].quantityType,
      items: data.items, // JSONB field
    } as any);
=======
    });
>>>>>>> e46736471f833d2da9d10d2067485c256946635b

    if (error) { toast.error("Failed to place order. Please try again."); return; }

    await supabase.from("profiles").update({
<<<<<<< HEAD
      gst_number: data.gstNumber || "URD",
      gst_legal_name: gstLegalName || (data.gstNumber ? null : "Unregistered Dealer"),
      billing_name: data.billingName,
      company_name: data.companyName,
      phone: data.phone,
      delivery_address: data.deliveryAddress,
    } as any).eq("user_id", user.id);
=======
      buyer_name: data.buyerName, company_name: data.companyName,
      phone: data.phone, delivery_address: data.deliveryAddress,
    }).eq("user_id", user.id);
>>>>>>> e46736471f833d2da9d10d2067485c256946635b

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
<<<<<<< HEAD
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
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div><Label htmlFor="billingName">Billing Name *</Label><Input id="billingName" {...register("billingName")} className="mt-1.5" placeholder="e.g. Rahul Sharma" />{errors.billingName && <p className="mt-1 text-sm text-destructive">{errors.billingName.message}</p>}</div>
                <div><Label htmlFor="gstNumber">GST Number</Label><Input id="gstNumber" {...register("gstNumber")} className="mt-1.5" placeholder="e.g. 22AAAAA0000A1Z5" />{errors.gstNumber && <p className="mt-1 text-sm text-destructive">{errors.gstNumber.message}</p>}</div>
                {gstLegalName && (
                  <div className="sm:col-span-2 bg-muted/30 p-3 rounded-lg border border-dashed animate-in fade-in slide-in-from-top-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">GST Legal Name</Label>
                    <p className="text-sm font-semibold text-primary">{gstLegalName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 italic">Verified from GST record</p>
                  </div>
                )}
=======
            <h1 className="font-display text-3xl font-bold">Place Order</h1>
            <p className="mt-2 text-muted-foreground">Fill in your details to order {fabric.name}</p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div><Label htmlFor="buyerName">Your Name *</Label><Input id="buyerName" {...register("buyerName")} className="mt-1.5" />{errors.buyerName && <p className="mt-1 text-sm text-destructive">{errors.buyerName.message}</p>}</div>
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
                <div><Label htmlFor="companyName">Company Name *</Label><Input id="companyName" {...register("companyName")} className="mt-1.5" />{errors.companyName && <p className="mt-1 text-sm text-destructive">{errors.companyName.message}</p>}</div>
                <div><Label htmlFor="phone">Phone *</Label><Input id="phone" {...register("phone")} className="mt-1.5" />{errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>}</div>
                <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" {...register("email")} className="mt-1.5" />{errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}</div>
              </div>
<<<<<<< HEAD
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-xl font-semibold">Order Items</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ color: "", quantity: fabric.min_order, quantityType: "Lump" })}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Item
                  </Button>
                </div>

                {fields.map((field, index) => {
                  const itemColor = watch(`items.${index}.color`);
                  const itemQuantityType = watch(`items.${index}.quantityType`);

                  return (
                    <div key={field.id} className="relative rounded-xl border bg-card p-6 pt-10 sm:pt-6">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}

                      <div className="space-y-6">
                        <div>
                          <Label className="mb-2 block">Select Color *</Label>
                          <ColorSelector
                            colors={fabric.colors || ""}
                            selectedColor={itemColor}
                            onSelect={(color) => setValue(`items.${index}.color`, color)}
                          />
                          {errors.items?.[index]?.color && <p className="mt-1 text-sm text-destructive">{errors.items[index]?.color?.message}</p>}
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                          <div>
                            <Label>Quantity Type *</Label>
                            <RadioGroup
                              defaultValue="Lump"
                              value={itemQuantityType}
                              onValueChange={(v: "Lump" | "Cut Pack") => setValue(`items.${index}.quantityType`, v)}
                              className="mt-3 flex gap-4"
                            >
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
                            <Input
                              id={`quantity-${index}`}
                              type="number"
                              step={itemQuantityType === "Cut Pack" ? "1.20" : "1"}
                              {...register(`items.${index}.quantity` as const, {
                                validate: (val) => {
                                  if (itemQuantityType === "Lump" && val < 40) return "Lump order must be at least 40m";
                                  if (itemQuantityType === "Cut Pack") {
                                    const isMultiple = Math.abs((val % 1.20)) < 0.01 || Math.abs((val % 1.20) - 1.20) < 0.01;
                                    if (!isMultiple) return "Must be a multiple of 1.20m";
                                  }
                                  return true;
                                }
                              })}
                              className="mt-1.5"
                            />
                            {errors.items?.[index]?.quantity && <p className="mt-1 text-sm text-destructive">{errors.items[index]?.quantity?.message}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div><Label htmlFor="deliveryAddress">Delivery Address *</Label><Textarea id="deliveryAddress" {...register("deliveryAddress")} className="mt-1.5" rows={3} />{errors.deliveryAddress && <p className="mt-1 text-sm text-destructive">{errors.deliveryAddress.message}</p>}</div>
              <div><Label htmlFor="notes">Additional Notes</Label><Textarea id="notes" {...register("notes")} className="mt-1.5" rows={2} placeholder="Special requirements, shipping instructions, etc." /></div>
=======
              <div><Label htmlFor="quantity">Quantity ({fabric.unit}) *</Label><Input id="quantity" type="number" {...register("quantity")} className="mt-1.5 max-w-xs" />{errors.quantity && <p className="mt-1 text-sm text-destructive">{errors.quantity.message}</p>}<p className="mt-1 text-sm text-muted-foreground">Minimum order: {fabric.min_order} {fabric.unit}</p></div>
              <div><Label htmlFor="deliveryAddress">Delivery Address *</Label><Textarea id="deliveryAddress" {...register("deliveryAddress")} className="mt-1.5" rows={3} />{errors.deliveryAddress && <p className="mt-1 text-sm text-destructive">{errors.deliveryAddress.message}</p>}</div>
              <div><Label htmlFor="notes">Additional Notes</Label><Textarea id="notes" {...register("notes")} className="mt-1.5" rows={2} placeholder="Special requirements, color preferences, etc." /></div>
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
              <Button type="submit" size="lg" className="w-full sm:w-auto">Place Order — ₹{total.toLocaleString("en-IN")}</Button>
            </form>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">Order Summary</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Fabric</span><span className="font-medium">{fabric.name}</span></div>
<<<<<<< HEAD
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
                <div className="flex justify-between"><span className="text-muted-foreground">Total Quantity</span><span>{totalQuantity} {fabric.unit}</span></div>
=======
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{fabric.type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Color</span><span>{fabric.colors}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span>₹{Number(fabric.price_per_meter).toLocaleString("en-IN")}/meter</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span>{quantity} {fabric.unit}</span></div>
>>>>>>> e46736471f833d2da9d10d2067485c256946635b
                <div className="border-t pt-3">
                  <div className="flex justify-between"><span className="font-semibold">Estimated Total</span><span className="text-xl font-bold text-primary">₹{total.toLocaleString("en-IN")}</span></div>
                  <p className="mt-1 text-xs text-muted-foreground">Final price may vary. Payment details shared after confirmation.</p>
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
