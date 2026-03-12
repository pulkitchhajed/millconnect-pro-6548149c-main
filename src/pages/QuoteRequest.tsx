import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
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
import { useFabric } from "@/hooks/useFabrics";
import { supabase } from "@/integrations/supabase/client";
import { useFieldArray } from "react-hook-form";

const itemSchema = z.object({
  color: z.string().min(1, "Color is required"),
  quantity: z.coerce.number().min(0.1, "Quantity must be at least 0.1"),
  quantityType: z.enum(["Lump", "Cut Pack"]),
});

const quoteSchema = z.object({
  items: z.array(itemSchema).min(1, "At least one item required"),
  message: z.string().max(1000).optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

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
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all outline-none ${
                  isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background hover:border-primary/50"
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

const QuoteRequest = () => {
  const { fabricId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: fabric, isLoading } = useFabric(fabricId);
  const [submitted, setSubmitted] = useState(false);

  const queryParams = new URLSearchParams(window.location.search);
  const colorsParam = queryParams.get("colors") || queryParams.get("color") || "";
  const initialColors = useMemo(() => colorsParam ? colorsParam.split(",").map(c => c.trim()).filter(Boolean) : [], [colorsParam]);

  const { register, handleSubmit, formState: { errors }, watch, setValue, control, reset } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { 
      items: initialColors.length > 0 
        ? initialColors.map(c => ({ color: c, quantity: fabric?.min_order || 100, quantityType: "Lump" }))
        : [{ color: "", quantity: 100, quantityType: "Lump" }] 
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

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

  // Effect to handle initial colors when fabric loads
  useEffect(() => {
    if (fabric) {
      const isDefaultState = fields.length === 1 && !fields[0].color;
      if (isDefaultState || initialColors.length > 0) {
        const itemsToSet = initialColors.length > 0
          ? initialColors.map(c => ({ color: c, quantity: fabric.min_order, quantityType: "Lump" as const }))
          : [{ color: fabric.colors?.split(",")[0]?.split(":")[0]?.trim() || "", quantity: fabric.min_order, quantityType: "Lump" as const }];
        
        reset((prev) => ({ 
          ...prev, 
          items: itemsToSet
        }));
      }
    }
  }, [fabric, reset, initialColors]);

  const onSubmit = async (data: QuoteFormData) => {
    const totalQuantity = data.items.reduce((sum, item) => sum + Number(item.quantity), 0);
    const { error } = await supabase.from("quote_requests").insert({
      user_id: user.id,
      fabric_id: fabric.id,
      fabric_name: fabric.name,
      quantity: totalQuantity,
      message: data.message || null,
      selected_color: data.items.map(i => i.color).join(", "),
      quantity_type: data.items.length > 1 ? "Mixed" : data.items[0].quantityType,
      items: data.items, // JSONB field
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
        <div className="flex flex-col items-center text-center">
          {fabric.image_url && (
            <div className="mb-6 h-32 w-32 overflow-hidden rounded-3xl border-4 border-background shadow-xl ring-1 ring-border">
              <img src={fabric.image_url} alt={fabric.name} className="h-full w-full object-cover" />
            </div>
          )}
          <h1 className="font-display text-4xl font-bold">Request Quote</h1>
          <p className="mt-2 text-muted-foreground max-w-sm">Get specialized pricing for <strong>{fabric.name}</strong></p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xl font-semibold text-foreground">Requested Items</h2>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => append({ color: "", quantity: fabric.min_order, quantityType: "Lump" })}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Color
              </Button>
            </div>

            {fields.map((field, index) => {
              const itemColor = watch(`items.${index}.color`);
              const itemQuantityType = watch(`items.${index}.quantityType`);
              
              return (
                <div key={field.id} className="relative rounded-xl border bg-card p-6 shadow-sm">
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
                            <RadioGroupItem value="Lump" id={`q-lump-${index}`} />
                            <Label htmlFor={`q-lump-${index}`} className="font-normal cursor-pointer">Lump</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Cut Pack" id={`q-cutpack-${index}`} />
                            <Label htmlFor={`q-cutpack-${index}`} className="font-normal cursor-pointer">Cut Pack</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label htmlFor={`q-quantity-${index}`}>Quantity ({fabric.unit}) *</Label>
                        <Input
                          id={`q-quantity-${index}`}
                          type="number"
                          step={itemQuantityType === "Cut Pack" ? "1.20" : "1"}
                          {...register(`items.${index}.quantity` as const, {
                            validate: (val) => {
                              if (itemQuantityType === "Lump" && val < 40) return "Min. 40m for Lump";
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
