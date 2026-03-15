import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Heart, ChevronLeft, ChevronRight, Package, Loader2, Wand2, MapPin, Truck } from "lucide-react";
import { useFabric, useFabricImages, useFabrics } from "@/hooks/useFabrics";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const FabricDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: fabric, isLoading } = useFabric(id);
  const { data: images } = useFabricImages(id);
  const { data: favoriteIds } = useFavoriteIds();
  const { data: allFabrics } = useFabrics();
  const toggleFavorite = useToggleFavorite();
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sampleDialog, setSampleDialog] = useState(false);
  const [sampleAddress, setSampleAddress] = useState("");
  const [sampleNotes, setSampleNotes] = useState("");
  const [submittingSample, setSubmittingSample] = useState(false);
  const [samplePacks, setSamplePacks] = useState<any[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string>("individual");

  useEffect(() => {
    const fetchPacks = async () => {
      const { data } = await supabase.from("sample_packs").select("*").eq("active", true).order("price");
      setSamplePacks(data || []);
    };
    fetchPacks();
  }, []);

  const isFav = favoriteIds?.has(id || "") || false;

  const fabricImages = images?.map((i) => i.image_url) || [];
  const allImages = fabricImages.length > 0
    ? fabricImages
    : (fabric?.image_url ? [fabric.image_url] : []);

  const parseCategories = (category: string | string[] | null | undefined) => {
    if (!category) return [];
    if (Array.isArray(category)) return category.map((c) => c.trim()).filter(Boolean);
    return category.split(',').map((c) => c.trim()).filter(Boolean);
  };

  const similarFabrics = (allFabrics || []).filter((f) => {
    if (f.id === fabric?.id) return false;
    const fCats = parseCategories(f.category as any);
    const thisCats = parseCategories(fabric?.category as any);
    const hasSharedCat = fCats.some((c) => thisCats.includes(c));
    return hasSharedCat || f.type === fabric?.type;
  }).slice(0, 4);

  const requestSample = async () => {
    if (!user) { toast.error("Please log in to request a sample."); return; }
    if (!sampleAddress.trim()) { toast.error("Please enter a delivery address."); return; }
    setSubmittingSample(true);

    const pack = selectedPackId === "individual" ? null : samplePacks.find(p => p.id === selectedPackId);

    const { error } = await supabase.from("sample_requests").insert({
      user_id: user.id,
      fabric_id: (selectedPackId === "individual" || (pack?.pack_type === 'custom')) ? fabric!.id : null,
      fabric_name: (selectedPackId === "individual") ? fabric!.name : (pack?.name || "Sample Pack"),
      fabric_image: (selectedPackId === "individual") ? fabric!.image_url : null,
      delivery_address: sampleAddress.trim(),
      notes: sampleNotes.trim() || null,
      sample_pack_id: pack?.id || null,
      price: pack ? pack.price : null,
      status: 'Pending'
    });

    setSubmittingSample(false);
    if (error) { toast.error("Failed to submit sample request."); return; }
    toast.success("Sample request submitted!");
    setSampleDialog(false);
    setSampleAddress("");
    setSampleNotes("");
    setSelectedPackId("individual");
  };

  if (!fabric && !isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold">Fabric not found</h1>
            <Button variant="ghost" className="mt-4" onClick={() => navigate("/catalog")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If loading and no fabric yet, show loader
  if (isLoading && !fabric) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  const specs = [
    { label: "GM", value: fabric.gm },
    { label: "Weave", value: fabric.weave },
    { label: "Width", value: fabric.width },
    { label: "Composition", value: fabric.composition },
    { label: "Finish", value: fabric.finish },
    { label: "Shrinkage", value: fabric.shrinkage },
  ].filter((s) => s.value);

  return (
    <div className="min-h-screen">
      <SEO
        title={fabric.name}
        description={`${fabric.name} - ${fabric.type} fabric. ${fabric.description?.slice(0, 150)}...`}
        ogType="product"
        ogImage={fabric.image_url}
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": fabric.name,
          "image": fabric.image_url,
          "description": fabric.description,
          "brand": {
            "@type": "Brand",
            "name": "Mill-Connect"
          },
          "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "INR",
            "price": fabric.price_per_meter,
            "availability": fabric.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          },
          "additionalProperty": specs.map(s => ({
            "@type": "PropertyValue",
            "name": s.label,
            "value": s.value
          }))
        })}
      </script>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/catalog")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog
        </Button>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image Gallery */}
          <div>
            {allImages.length > 0 ? (
              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-xl border bg-muted shadow-lg">
                  <img
                    src={allImages[currentImage]}
                    alt={fabric.name}
                    className="h-full w-full object-cover transition-all duration-500 hover:scale-105"
                  />
                </div>
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage((p) => (p > 0 ? p - 1 : allImages.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-background"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImage((p) => (p < allImages.length - 1 ? p + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-background"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {allImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImage(i)}
                          className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${i === currentImage ? "border-primary shadow-md scale-105" : "border-muted hover:border-primary/50"
                            }`}
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-xl border bg-muted">
                <p className="text-muted-foreground">No images available</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-4 px-3 py-1 text-xs uppercase tracking-wider">{fabric.type}</Badge>
                  <h1 className="font-display text-4xl font-bold text-secondary">{fabric.name}</h1>
                </div>
                {user && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full shadow-sm ${isFav ? "bg-destructive/10" : "bg-muted"}`}
                    onClick={() => toggleFavorite.mutate({ fabricId: fabric.id, isFavorite: isFav })}
                  >
                    <Heart className={`h-5 w-5 ${isFav ? "fill-destructive text-destructive" : ""}`} />
                  </Button>
                )}
              </div>

              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{fabric.description}</p>

              <div className="mt-8 flex flex-wrap items-center gap-8">
                <div className="flex items-baseline gap-2 p-5 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm transition-all hover:shadow-md">
                  <span className="text-4xl font-black text-primary">₹{Number(fabric.price_per_meter).toLocaleString("en-IN")}</span>
                  <span className="text-muted-foreground font-semibold">/ meter</span>
                </div>

                <div className="flex gap-10">
                  <div>
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest block mb-1">Min. Order</span>
                    <p className="text-xl font-bold text-secondary">{fabric.min_order} {fabric.unit}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest block mb-1">Availability</span>
                    <p className={`text-xl font-bold ${fabric.available ? "text-green-600" : "text-destructive"}`}>
                      {fabric.available ? "In Stock" : "Out of Stock"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-8 border-y border-muted">
              <span className="text-xs uppercase font-black text-muted-foreground tracking-widest mb-4 block">Available Colors</span>
              <div className="flex flex-wrap gap-3">
                {fabric.colors && fabric.colors.split(",").filter((s: string) => s.trim()).map((c: string, idx: number) => {
                  const parts = c.trim().split(":");
                  const name = parts[0]?.trim() || "";
                  const hex = parts[1]?.trim() || "#CCCCCC";
                  const isSelected = selectedColors.includes(name);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedColors(prev =>
                          isSelected ? prev.filter(n => n !== name) : [...prev, name]
                        );
                      }}
                      className={`group relative flex items-center gap-2 rounded-full border px-5 py-2.5 transition-all hover:border-primary hover:scale-105 active:scale-95 ${isSelected ? "border-primary bg-primary/10 ring-1 ring-primary shadow-sm" : "border-border bg-background hover:bg-muted/30"
                        }`}
                      title={name}
                    >
                      <span
                        className="h-6 w-6 rounded-full border shadow-inner transition-transform group-hover:scale-110"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-sm font-bold">{name}</span>
                      {isSelected && (
                        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white shadow-md animate-in zoom-in">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
                {!fabric.colors && <p className="font-medium text-muted-foreground italic">No specific colors listed (Standard only)</p>}
              </div>
            </div>

            {specs.length > 0 && (
              <div>
                <h2 className="text-xs uppercase font-black text-muted-foreground tracking-widest mb-4">Quality Specifications</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {specs.map((s) => (
                    <div key={s.label} className="rounded-xl border bg-muted/30 p-3 hover:bg-muted/50 transition-colors">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">{s.label}</span>
                      <p className="mt-1 font-black text-secondary">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fabric.apc_available && (
              <div className="rounded-2xl border-2 border-secondary/20 bg-secondary/5 p-6 shadow-sm border-l-8 border-l-secondary animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-white shadow-xl">
                    <Wand2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-secondary">APC Available</h3>
                    <p className="text-xs text-muted-foreground font-bold italic">Premium service for specific requirements</p>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    to={`/apc-order/${fabric.id}${selectedColors.length > 0 ? `?colors=${encodeURIComponent(selectedColors.join(","))}` : ""}`}
                    className="block rounded-xl bg-white p-5 border border-secondary/30 hover:border-secondary transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <MapPin className="h-16 w-16" />
                    </div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-[10px] font-bold text-secondary/70 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" /> Standard Dispatch (Indore)
                        </p>
                        <div className="space-y-0.5">
                          <p className="text-[1.1rem] font-bold text-[#CD853F] leading-tight">240 MT Cloth Market, Indore</p>
                          <div className="flex gap-x-4 text-[11px] text-[#55677d] italic tracking-wide">
                            <span>Pincode: 452005</span>
                            <span>M: 9425062020</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4e6d9] text-[#b36b22] group-hover:bg-[#e0c0a3] group-hover:text-white transition-colors">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="h-14 flex-1 text-lg font-black uppercase tracking-wider shadow-lg shadow-primary/20" disabled={!fabric.available}>
                <Link to={`/order/${fabric.id}${selectedColors.length > 0 ? `?colors=${encodeURIComponent(selectedColors.join(","))}` : ""}`}>
                  {selectedColors.length > 1 ? `Order ${selectedColors.length} Colors` : "Order Now"} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <div className="flex gap-4 flex-1">
                {user && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 flex-1 font-bold border-2"
                    onClick={() => navigate(`/quote/${fabric.id}${selectedColors.length > 0 ? `?colors=${encodeURIComponent(selectedColors.join(","))}` : ""}`)}
                  >
                    {selectedColors.length > 1 ? `Request ${selectedColors.length} Quotes` : "Request Quote"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 flex-1 font-bold border-2"
                  onClick={() => {
                    if (!user) {
                      toast.info("Please login to request samples");
                      navigate(`/auth?redirect=/fabric/${fabric.id}`);
                    } else {
                      setSampleDialog(true);
                    }
                  }}
                >
                  <Package className="mr-2 h-5 w-5" /> Samples
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Fabrics Section */}
      {similarFabrics.length > 0 && (
        <div className="bg-muted/30 py-20 border-t">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-display text-3xl font-bold text-secondary">Similar Fabrics</h2>
              <Link to="/catalog" className="text-sm font-bold text-primary hover:underline underline-offset-4">View All Fabrics</Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {similarFabrics.map((f: any) => (
                <Link key={f.id} to={`/fabric/${f.id}`} className="group rounded-2xl border-2 border-transparent bg-card p-5 transition-all hover:shadow-2xl hover:border-primary/20 hover:-translate-y-1">
                  {f.image_url && (
                    <div className="mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                      <img src={f.image_url} alt={f.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  )}
                  <Badge variant="outline" className="text-[10px] uppercase font-bold mb-3 tracking-widest">{f.type}</Badge>
                  <p className="font-black text-secondary group-hover:text-primary transition-colors leading-tight">{f.name}</p>
                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <p className="text-primary font-black text-lg">₹{Number(f.price_per_meter).toLocaleString("en-IN")}<span className="text-[10px] text-muted-foreground font-bold ml-1">/m</span></p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sample Request Dialog */}
      <Dialog open={sampleDialog} onOpenChange={setSampleDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-secondary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-bold">Request Fabric Samples</DialogTitle>
              <p className="text-secondary-foreground font-medium opacity-80">Experience the quality before you buy</p>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest mb-3 block">Selection Option</Label>
              <div className="grid gap-3">
                <div
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${selectedPackId === "individual" ? "border-primary bg-primary/5 ring-1 ring-primary shadow-md" : "hover:border-primary/50"}`}
                  onClick={() => setSelectedPackId("individual")}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-black text-secondary">Individual Sample: {fabric.name}</p>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Free</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Standard shipping charges may apply</p>
                </div>

                {samplePacks.filter((p: any) => p.pack_type === 'custom' || (p.pack_type === 'category' && fabric.category?.includes(p.category))).map((p: any) => (
                  <div
                    key={p.id}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${selectedPackId === p.id ? "border-primary bg-primary/5 ring-1 ring-primary shadow-md" : "hover:border-primary/50"}`}
                    onClick={() => setSelectedPackId(p.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-black text-secondary">{p.name}</p>
                      <p className="font-black text-primary">₹{Number(p.price).toLocaleString("en-IN")}</p>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      {p.pack_type === 'category' ? `Complete set of all fabrics in the ${p.category} category` : `Custom quality kit featuring this premium fabric`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest">Delivery Address *</Label>
                <Textarea
                  value={sampleAddress}
                  onChange={(e) => setSampleAddress(e.target.value)}
                  placeholder="Street, City, Pincode, State..."
                  rows={2}
                  className="rounded-xl border-2 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest">Additional Notes</Label>
                <Input
                  value={sampleNotes}
                  onChange={(e) => setSampleNotes(e.target.value)}
                  placeholder="Need a specific color sample?"
                  className="h-12 rounded-xl border-2 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="rounded-xl bg-muted p-4 flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Amount:</span>
              <span className="text-2xl font-black text-secondary">
                {selectedPackId === 'individual' ? 'Free' : `₹${Number(samplePacks.find((p: any) => p.id === selectedPackId)?.price || 0).toLocaleString("en-IN")}`}
              </span>
            </div>

            <Button onClick={requestSample} disabled={submittingSample} className="w-full h-14 text-lg font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              {submittingSample ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</> : "Confirm Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default FabricDetail;
