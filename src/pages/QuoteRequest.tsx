import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
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

const quoteSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantity required"),
  message: z.string().max(1000).optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

const QuoteRequest = () => {
  const { fabricId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: fabric, isLoading } = useFabric(fabricId);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { quantity: fabric?.min_order || 1000 },
  });

  if (!user) {
    navigate(`/auth?redirect=/quote/${fabricId}`);
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen"><Navbar /><div className="container mx-auto flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Loading...</p></div><Footer /></div>
    );
  }

  if (!fabric) {
    return (
      <div className="min-h-screen"><Navbar /><div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4"><div className="text-center"><h1 className="font-display text-2xl font-bold">Fabric not found</h1><Button variant="ghost" className="mt-4" onClick={() => navigate("/catalog")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></div></div><Footer /></div>
    );
  }

  const onSubmit = async (data: QuoteFormData) => {
    const { error } = await supabase.from("quote_requests").insert({
      user_id: user.id,
      fabric_id: fabric.id,
      fabric_name: fabric.name,
      quantity: data.quantity,
      message: data.message || null,
    });
    if (error) { toast.error("Failed to submit quote request"); return; }
    setSubmitted(true);
    toast.success("Quote request submitted!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen"><Navbar /><div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4"><div className="max-w-md text-center animate-fade-in"><h1 className="font-display text-3xl font-bold">Quote Requested!</h1><p className="mt-3 text-muted-foreground">We'll review your request for <strong>{fabric.name}</strong> and get back to you shortly.</p><div className="mt-6 flex justify-center gap-3"><Button onClick={() => navigate("/dashboard")}>Dashboard</Button><Button variant="outline" onClick={() => navigate("/catalog")}>Continue Browsing</Button></div></div></div><Footer /></div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto max-w-lg px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="font-display text-3xl font-bold">Request Quote</h1>
        <p className="mt-2 text-muted-foreground">Get a custom quote for <strong>{fabric.name}</strong></p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <Label htmlFor="quantity">Quantity ({fabric.unit}) *</Label>
            <Input id="quantity" type="number" {...register("quantity")} className="mt-1.5" />
            {errors.quantity && <p className="mt-1 text-sm text-destructive">{errors.quantity.message}</p>}
          </div>
          <div>
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea id="message" {...register("message")} className="mt-1.5" rows={4} placeholder="Specific requirements, delivery timeline, etc." />
          </div>
          <Button type="submit" size="lg" className="w-full">Submit Quote Request</Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default QuoteRequest;
