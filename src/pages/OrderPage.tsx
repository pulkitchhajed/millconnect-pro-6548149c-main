import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  deliveryAddress: z.string().trim().min(10, "Full address required").max(500),
  notes: z.string().max(500).optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const OrderPage = () => {
  const { fabricId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: fabric, isLoading: fabricLoading } = useFabric(fabricId);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { quantity: 500 },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Please sign in to place an order");
      navigate(`/auth?redirect=/order/${fabricId}`);
    }
  }, [authLoading, user, navigate, fabricId]);

  useEffect(() => {
    if (fabric) {
      reset((prev) => ({ ...prev, quantity: fabric.min_order }));
    }
  }, [fabric, reset]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("buyer_name, company_name, phone, delivery_address")
        .eq("user_id", user.id)
        .single();
      if (data) {
        reset((prev) => ({
          ...prev,
          buyerName: data.buyer_name || "",
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

  const quantity = watch("quantity");
  const total = fabric ? quantity * Number(fabric.price_per_meter) : 0;

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
      buyer_name: data.buyerName,
      company_name: data.companyName,
      phone: data.phone,
      email: data.email,
      quantity: data.quantity,
      price_per_meter: Number(fabric.price_per_meter),
      total,
      delivery_address: data.deliveryAddress,
      notes: data.notes || null,
      fabric_id_ref: fabric.id,
    });

    if (error) { toast.error("Failed to place order. Please try again."); return; }

    await supabase.from("profiles").update({
      buyer_name: data.buyerName, company_name: data.companyName,
      phone: data.phone, delivery_address: data.deliveryAddress,
    }).eq("user_id", user.id);

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
            <h1 className="font-display text-3xl font-bold">Place Order</h1>
            <p className="mt-2 text-muted-foreground">Fill in your details to order {fabric.name}</p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div><Label htmlFor="buyerName">Your Name *</Label><Input id="buyerName" {...register("buyerName")} className="mt-1.5" />{errors.buyerName && <p className="mt-1 text-sm text-destructive">{errors.buyerName.message}</p>}</div>
                <div><Label htmlFor="companyName">Company Name *</Label><Input id="companyName" {...register("companyName")} className="mt-1.5" />{errors.companyName && <p className="mt-1 text-sm text-destructive">{errors.companyName.message}</p>}</div>
                <div><Label htmlFor="phone">Phone *</Label><Input id="phone" {...register("phone")} className="mt-1.5" />{errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>}</div>
                <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" {...register("email")} className="mt-1.5" />{errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}</div>
              </div>
              <div><Label htmlFor="quantity">Quantity ({fabric.unit}) *</Label><Input id="quantity" type="number" {...register("quantity")} className="mt-1.5 max-w-xs" />{errors.quantity && <p className="mt-1 text-sm text-destructive">{errors.quantity.message}</p>}<p className="mt-1 text-sm text-muted-foreground">Minimum order: {fabric.min_order} {fabric.unit}</p></div>
              <div><Label htmlFor="deliveryAddress">Delivery Address *</Label><Textarea id="deliveryAddress" {...register("deliveryAddress")} className="mt-1.5" rows={3} />{errors.deliveryAddress && <p className="mt-1 text-sm text-destructive">{errors.deliveryAddress.message}</p>}</div>
              <div><Label htmlFor="notes">Additional Notes</Label><Textarea id="notes" {...register("notes")} className="mt-1.5" rows={2} placeholder="Special requirements, color preferences, etc." /></div>
              <Button type="submit" size="lg" className="w-full sm:w-auto">Place Order — ₹{total.toLocaleString("en-IN")}</Button>
            </form>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">Order Summary</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Fabric</span><span className="font-medium">{fabric.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{fabric.type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Color</span><span>{fabric.colors}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span>₹{Number(fabric.price_per_meter).toLocaleString("en-IN")}/meter</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span>{quantity} {fabric.unit}</span></div>
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
