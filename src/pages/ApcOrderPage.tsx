import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Clock, MapPin, Loader2, Scissors, Truck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useFabric } from "@/hooks/useFabrics";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const orderSchema = z.object({});

type OrderFormData = z.infer<typeof orderSchema>;

export default function ApcOrderPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  const { data: fabric, isLoading: fabricLoading } = useFabric(id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const DEFAULT_APC_ADDRESS = "240 MT Cloth Market, Indore 452005 (9425062020)";

  const initialColorsParam = searchParams.get("colors");
  const initialColorsArray = initialColorsParam ? initialColorsParam.split(",") : [];

  const { register, handleSubmit, formState: { errors } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {},
  });


  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Please sign in to place an APC order");
      navigate("/auth", { state: { returnTo: `/apc-order/${id}${initialColorsParam ? `?colors=${initialColorsParam}` : ""}` } });
    }
  }, [user, authLoading, navigate, id, initialColorsParam]);

  useEffect(() => {
    async function getProfile() {
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
        if (data) {
          setProfile(data);
        }
      }
    }
    getProfile();
  }, [user]);

  if (authLoading || fabricLoading) {
    return <div className="min-h-screen"><Navbar /><div className="container mx-auto flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Loading...</p></div><Footer /></div>;
  }
  if (!fabric) {
    return <div className="min-h-screen"><Navbar /><div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4"><div className="text-center"><h1 className="font-display text-2xl font-bold">Fabric not found</h1><Button variant="ghost" className="mt-4" onClick={() => navigate("/catalog")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog</Button></div></div><Footer /></div>;
  }
  if (!fabric.apc_available) {
    return <div className="min-h-screen"><Navbar /><div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4"><div className="text-center"><h1 className="font-display text-2xl font-bold text-destructive">APC Not Available</h1><p className="mt-2 text-muted-foreground">This fabric does not support custom cutting requests.</p><Button className="mt-4" onClick={() => navigate(`/fabric/${fabric.id}`)}><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button></div></div><Footer /></div>;
  }

  const onSubmit = async (data: OrderFormData) => {
    if (!user) return;
    setIsSubmitting(true);

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      fabric_id: fabric.id,
      fabric_name: fabric.name,
      fabric_id_ref: fabric.id,
      status: 'Pending',
      quantity: 1, // Placeholder for request record
      total: 0,
      price_per_meter: Number(fabric.price_per_meter),
      billing_name: profile?.billing_name || profile?.buyer_name || "Unknown Buyer",
      gst_number: profile?.gst_number && profile?.gst_number !== "URD" ? profile.gst_number : null,
      phone: profile?.phone || "Not Specified",
      email: user.email || "Not Specified",
      notes: "APC Request",
      apc_details: {
        is_apc: true,
        cutting_address: DEFAULT_APC_ADDRESS,
        buyer_address: profile?.delivery_address || "Not Provided",
      },
      selected_color: initialColorsArray.length > 0 ? initialColorsArray.join(", ") : "APC Matching",
      buyer_name: profile?.buyer_name || "Unknown Buyer",
      company_name: profile?.billing_name || profile?.buyer_name || "Unknown Company",
      address_line1: "Registered Buyer Address",
      city: "APC Request",
      state: "APC Request",
      pincode: "000000",
      delivery_address: DEFAULT_APC_ADDRESS,
      quantity_type: "APC",
      items: initialColorsArray.length > 0
        ? initialColorsArray.map(c => ({ color: c, quantity: 1, quantityType: "APC" }))
        : [{ color: "APC Matching", quantity: 1, quantityType: "APC" }]
    } as any);

    if (error) {
      console.error("APC Submission Error:", error);
      toast.error("Failed to submit APC request. Please try again.");
      setIsSubmitting(false);
      return;
    }

    toast.success("APC Request submitted successfully!");
    navigate("/orders");
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <div className="border-b bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 h-8 px-3 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to details
          </Button>
          <div className="flex items-start gap-5">
            <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-secondary/30 bg-secondary/10 text-secondary">
              <Scissors className="h-6 w-6" />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                <Scissors className="h-3 w-3" /> As Per Cutting (APC)
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">Custom Cutting Request</h1>
              <p className="mt-1 text-muted-foreground">For <span className="font-semibold text-foreground">{fabric.name}</span> — pricing will be determined after matching</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl mb-24">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">


          {/* ── SECTION 1: REQUEST OVERVIEW ── */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Fabric Details */}
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="bg-secondary/5 px-6 py-4 border-b border-secondary/10">
                <h2 className="font-display text-sm font-bold text-secondary flex items-center gap-2">
                  <Scissors className="h-4 w-4" /> Fabric Details
                </h2>
              </div>
              <div className="p-6 flex gap-4">
                <div className="h-24 w-24 shrink-0 rounded-xl overflow-hidden border-2 border-secondary/20 shadow-inner">
                  <img src={fabric.image_url || "/placeholder.svg"} alt={fabric.name} className="h-full w-full object-cover" />
                </div>
                <div>
                <h3 className="text-xl font-display font-bold text-foreground leading-tight">{fabric.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{fabric.type}</p>
                </div>
              </div>
            </div>

            {/* Buyer Details Summary */}
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                <h2 className="font-display text-sm font-bold text-primary flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Requesting As
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-bold uppercase tracking-tighter">Billing Name</span>
                  <span className="font-black text-foreground">{profile?.billing_name || profile?.buyer_name || "Guest User"}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-dashed pt-2">
                  <span className="text-muted-foreground font-bold uppercase tracking-tighter">Phone</span>
                  <span className="font-bold text-foreground font-mono">{profile?.phone || "Not Set"}</span>
                </div>
                {profile?.gst_number && profile.gst_number !== "URD" && (
                  <div className="flex justify-between items-center text-sm border-t border-dashed pt-2">
                    <span className="text-muted-foreground font-bold uppercase tracking-tighter">GST Number</span>
                    <span className="font-bold text-success font-mono">{profile.gst_number}</span>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground italic mt-2 text-right">* Pulling details from your registered profile</p>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: COURIER INSTRUCTIONS ── */}
          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="bg-secondary/5 px-6 py-4 flex items-center justify-between border-b border-secondary/10">
              <h2 className="font-display text-sm font-bold text-secondary flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white text-xs font-bold">1</span>
                Courier Instructions
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid gap-8 md:grid-cols-1">
                <div className="space-y-4">
                  <Label className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Truck className="h-4 w-4 text-muted-foreground" /> Delivery Destination
                  </Label>
                  <div className="rounded-xl border-2 border-dashed border-secondary/30 bg-secondary/5 p-6 relative overflow-hidden min-h-[132px] flex items-center">
                    <MapPin className="absolute -right-4 -bottom-4 h-24 w-24 text-secondary/10 rotate-12" />
                    <div className="z-10 w-full">
                      <p className="text-[10px] font-black tracking-widest text-secondary uppercase mb-2">Standard Dispatch Unit</p>
                      <p className="text-lg font-black text-secondary leading-tight">240 MT Cloth Market, Indore</p>
                      <div className="flex gap-4 mt-2 text-xs font-bold text-muted-foreground italic">
                        <span>PIN: 452005</span>
                        <span>M: 9425062020</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-black text-secondary/70 uppercase tracking-tighter bg-secondary/10 p-2 rounded-lg border border-secondary/20 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" /> Please Courier your cutting for APC Dying at this address
                  </p>
                </div>
              </div>
            </div>
          </div>


          <Alert className="bg-orange-50/80 text-orange-800 border-orange-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <Clock className="h-5 w-5 !text-orange-600" />
            <AlertTitle className="font-bold uppercase tracking-widest text-orange-900 border-b border-orange-200/50 pb-1 mb-2">Manual Verification Required</AlertTitle>
            <AlertDescription className="font-medium text-[13px] leading-relaxed">
              As Per Cutting (APC) orders require manual matching and verification by our dispatch team. This process generally extends standard dispatch timelines by <strong className="text-orange-900 bg-orange-200/50 px-1 rounded">2-3 business days</strong> depending on color matching complexity.
            </AlertDescription>
          </Alert>

          <div className="h-12" /> {/* Spacer for sticky footer */}

          <div className="rounded-2xl border-2 border-secondary bg-white p-6 shadow-xl sticky bottom-8 z-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">No Upfront Payment</p>
                  <p className="text-xs font-medium text-muted-foreground">Delivery charges would apply</p>
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full sm:w-auto h-14 px-8 text-lg font-black uppercase tracking-wider shadow-lg"
              >
                {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Raising Request...</> : "Raise APC Request"}
              </Button>
            </div>
          </div>

        </form>
      </main>
      <Footer />
    </div>
  );
}
