import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Search, SlidersHorizontal, X, BookmarkPlus, Bookmark, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFabrics } from "@/hooks/useFabrics";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingBag, LayoutGrid } from "lucide-react";
import { ColorSwatchList } from "@/components/ColorSwatch.tsx";

interface FilterState {
  search: string;
  typeFilter: string;
  categoryFilter: string;
  weaveFilter: string;
  compositionFilter: string;
  availableOnly: boolean;
}

const defaultFilters: FilterState = {
  search: "",
  typeFilter: "All",
  categoryFilter: "All",
  weaveFilter: "",
  compositionFilter: "",
  availableOnly: false,
};

const Catalog = () => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<"fabrics" | "samples">("fabrics");
  const [samplePacks, setSamplePacks] = useState<any[]>([]);
  const [requestPack, setRequestPack] = useState<any | null>(null);
  const [requestForm, setRequestForm] = useState({ buyer_name: "", phone: "", delivery_address: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { data: fabrics, isLoading } = useFabrics();
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSamplePacks = async () => {
      const { data } = await supabase
        .from("sample_packs")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      setSamplePacks(data || []);
    };
    fetchSamplePacks();

    // Fill request form from profile if user exists
    if (user?.id) {
      const fetchProfile = async () => {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
          setRequestForm({
            buyer_name: data.billing_name || data.full_name || "",
            phone: data.phone || "",
            delivery_address: data.delivery_address || "",
            notes: ""
          });
        }
      };
      fetchProfile();
    }
  }, [user]);

  const submitSampleRequest = async () => {
    if (!user) {
      toast.error("Please login to request samples");
      return;
    }
    if (!requestPack) return;
    if (!requestForm.buyer_name || !requestForm.phone || !requestForm.delivery_address) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("sample_requests").insert({
        user_id: user.id,
        sample_pack_id: requestPack.id,
        price: requestPack.price,
        status: "Pending",
        fabric_name: requestPack.name,
        delivery_address: requestForm.delivery_address,
        notes: requestForm.notes || null,
      });

      if (error) throw error;

      toast.success("Sample pack request submitted successfully!");
      setRequestPack(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Derived data ── */
  const getCategories = (category: string | string[] | null | undefined) => {
    if (!category) return [];
    if (Array.isArray(category)) return category.map((c) => c.trim()).filter(Boolean);
    return category.split(',').map((c) => c.trim()).filter(Boolean);
  };

  const types = useMemo(() => ["All", ...Array.from(new Set(fabrics?.map((f) => f.type).filter(Boolean) || []))], [fabrics]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(fabrics?.flatMap((f) => getCategories(f.category)).filter(Boolean) || []))], [fabrics]);
  const weaves = useMemo(() => [...new Set(fabrics?.map((f) => f.weave).filter(Boolean) || [])], [fabrics]);
  const compositions = useMemo(() => [...new Set(fabrics?.map((f) => f.composition).filter(Boolean) || [])], [fabrics]);

  const filtered = useMemo(() => (fabrics || []).filter((f) => {
    if (filters.typeFilter !== "All" && f.type !== filters.typeFilter) return false;
    const fCats = getCategories(f.category);
    if (filters.categoryFilter !== "All" && (!fCats.length || !fCats.includes(filters.categoryFilter))) return false;
    if (filters.weaveFilter && f.weave !== filters.weaveFilter) return false;
    if (filters.compositionFilter && f.composition !== filters.compositionFilter) return false;
    if (filters.availableOnly && !f.available) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const categoryString = fCats.join(', ').toLowerCase();
      if (!f.name.toLowerCase().includes(q) &&
        !(f.type || "").toLowerCase().includes(q) &&
        !categoryString.includes(q) &&
        !(f.colors || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [fabrics, filters]);

  const filteredSamplePacks = useMemo(() => (samplePacks || []).filter((p) => {
    if (filters.categoryFilter !== "All" && p.pack_type === 'category' && p.category !== filters.categoryFilter) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.category || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [samplePacks, filters]);

  const activeFilterCount = useMemo(() => [
    filters.typeFilter !== "All",
    filters.categoryFilter !== "All",
    filters.weaveFilter !== "",
    filters.compositionFilter !== "",
    filters.availableOnly,
  ].filter(Boolean).length, [filters]);

  const colorMap: Record<string, string> = {
    Cotton: "bg-secondary/10 text-secondary",
    "Linen Blend": "bg-primary/10 text-primary",
    Denim: "bg-primary/15 text-primary",
    Silk: "bg-secondary/15 text-secondary",
    Polyester: "bg-muted text-muted-foreground",
  };

  return (
    <div className="min-h-screen bg-background/50">
      <SEO
        title="Fabric Catalog"
        description="Explore our wide range of fabrics from verified mills. Filter by type, color, and more to find the perfect fabric for your needs."
      />
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="section-premium mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-10">
            <div>
              <h1 className="font-display text-4xl font-black text-foreground tracking-tight">Fabric Catalog</h1>
              <p className="text-muted-foreground mt-2 font-medium">Explore our premium collection of high-quality fabrics</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex rounded-2xl bg-muted/50 p-1 backdrop-blur-sm border border-black/5">
                <button
                  onClick={() => setView("fabrics")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-tight transition-premium ${view === "fabrics" ? "bg-background shadow-premium text-primary scale-[1.02]" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <LayoutGrid className="h-4 w-4" /> Qualities
                </button>
                <button
                  onClick={() => setView("samples")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-tight transition-premium ${view === "samples" ? "bg-background shadow-premium text-primary scale-[1.02]" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <ShoppingBag className="h-4 w-4" /> Samples
                </button>
              </div>
              <Button asChild variant="outline" className="h-12 rounded-2xl gap-2 font-black uppercase tracking-wider shadow-soft hover:bg-primary/5 transition-premium">
                <Link to="/fabric-matcher">
                  <Wand2 className="h-5 w-5 text-primary" />
                  Fabric Matcher
                </Link>
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground group-focus-within:text-primary transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <Input
                placeholder="Search by name, type, or color..."
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                className="pl-12 h-14 rounded-2xl border-none bg-background/50 shadow-inner focus-visible:ring-primary/20 transition-premium text-lg font-medium"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-14 rounded-2xl gap-3 px-6 font-black uppercase tracking-widest transition-premium ${showFilters ? "bg-primary/10 border-primary text-primary" : "shadow-soft"}`}
              >
                <SlidersHorizontal className="h-5 w-5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-black shadow-primary">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              {(activeFilterCount > 0 || filters.search) && (
                <Button variant="ghost" onClick={() => setFilters(defaultFilters)} className="h-14 rounded-2xl text-muted-foreground hover:text-destructive font-bold transition-premium px-6">
                  <X className="h-5 w-5 mr-2" /> Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mb-12 section-premium grid gap-8 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Quality Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilters((p) => ({ ...p, categoryFilter: c }))}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-premium ${filters.categoryFilter === c ? "bg-primary text-white shadow-primary scale-105" : "bg-background/80 text-muted-foreground hover:bg-primary/5 hover:text-primary"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Fabric Type</p>
              <div className="flex flex-wrap gap-2">
                {types.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilters((p) => ({ ...p, typeFilter: t }))}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-premium ${filters.typeFilter === t ? "bg-primary text-white shadow-primary scale-105" : "bg-background/80 text-muted-foreground hover:bg-primary/5 hover:text-primary"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Weave & Structure</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters((p) => ({ ...p, weaveFilter: "" }))}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-premium ${filters.weaveFilter === "" ? "bg-primary text-white shadow-primary scale-105" : "bg-background/80 text-muted-foreground hover:bg-primary/5 hover:text-primary"}`}
                >
                  All
                </button>
                {weaves.map((w) => (
                  <button
                    key={w}
                    onClick={() => setFilters((p) => ({ ...p, weaveFilter: w || "" }))}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-premium ${filters.weaveFilter === w ? "bg-primary text-white shadow-primary scale-105" : "bg-background/80 text-muted-foreground hover:bg-primary/5 hover:text-primary"}`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Availability</p>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-premium ${filters.availableOnly ? "bg-primary border-primary" : "border-muted group-hover:border-primary/50"}`}>
                    {filters.availableOnly && <div className="h-2 w-2 rounded-full bg-white animate-scale-in" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.availableOnly}
                    onChange={(e) => setFilters((p) => ({ ...p, availableOnly: e.target.checked }))}
                    className="hidden"
                  />
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">In Stock only</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Results Metadata */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-8 px-4">
            <p className="text-sm font-medium text-muted-foreground italic">
              Found <span className="font-black text-foreground not-italic">{view === "fabrics" ? filtered.length : filteredSamplePacks.length}</span> premium results
            </p>
          </div>
        )}

        {/* Main Content Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="font-display font-bold text-lg text-muted-foreground">Curating collection...</p>
          </div>
        ) : view === "fabrics" ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((fabric) => (
              <div
                key={fabric.id}
                onClick={() => navigate(`/fabric/${fabric.id}`)}
                className="card-premium flex flex-col p-0 group overflow-hidden bg-background/60 backdrop-blur-sm border-white/40 cursor-pointer"
              >
                <div className="aspect-[4/5] w-full overflow-hidden relative">
                  {fabric.image_url ? (
                    <img
                      src={fabric.image_url}
                      alt={fabric.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/30">
                      <LayoutGrid className="h-12 w-12 text-muted/20" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-white/95 text-primary hover:bg-white font-black text-[10px] uppercase tracking-widest border-none h-7 px-3 shadow-soft">
                      {fabric.type}
                    </Badge>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite.mutate({ fabricId: fabric.id, isFavorite: favoriteIds?.has(fabric.id) || false });
                    }}
                    className="absolute bottom-4 right-4 z-10 transition-premium hover:scale-110 active:scale-90"
                  >
                    <div className={`p-3 rounded-2xl glass ${favoriteIds?.has(fabric.id) ? "text-destructive" : "text-white/80"}`}>
                      <Heart className={`h-5 w-5 ${favoriteIds?.has(fabric.id) ? "fill-current" : ""}`} />
                    </div>
                  </button>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-black text-lg uppercase tracking-tight text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                    {fabric.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4 font-medium tracking-tight h-8 line-clamp-2">
                    {fabric.composition || "Premium Multi-weave Construction"}
                  </p>

                  <div className="mb-6">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Available Colors</p>
                    <ColorSwatchList colors={fabric.colors} limit={8} size="sm" />
                    {!fabric.colors && <p className="text-[10px] italic text-muted-foreground">Standard Industry Shades</p>}
                  </div>

                  <div className="mt-auto pt-6 border-t border-black/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Base Price</p>
                      <p className="text-xl font-black text-primary tracking-tighter">
                        ₹{Number(fabric.price_per_meter).toLocaleString("en-IN")}<span className="text-[10px] text-muted-foreground ml-0.5">/m</span>
                      </p>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="rounded-xl font-black uppercase tracking-wider text-[10px] hover:bg-primary hover:text-white hover:border-primary transition-premium h-10 px-6"
                    >
                      <Link to={`/fabric/${fabric.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSamplePacks.map((pack) => (
              <div key={pack.id} className="card-premium space-y-6 flex flex-col bg-background/80 hover:border-primary/40 group relative overflow-hidden">
                <div className="absolute -top-12 -right-12 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                <div className="flex items-start justify-between relative">
                  <div className="space-y-1">
                    <h3 className="font-black text-xl uppercase tracking-tight group-hover:text-primary transition-colors">{pack.name}</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{pack.pack_type === 'category' ? `Full ${pack.category} Collection` : "Multi-fabric selection"}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-none shadow-soft font-black text-sm h-10 px-5 flex items-center justify-center rounded-xl">
                    ₹{Number(pack.price).toLocaleString("en-IN")}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground italic line-clamp-3 leading-relaxed font-medium h-12">
                  "{pack.description || "Get a feel of our premium textures and weighted fabrics."}"
                </p>

                <div className="space-y-3 mt-auto">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground py-2 border-y border-black/5">
                    <LayoutGrid className="h-3 w-3 text-primary" />
                    <span>Includes {pack.fabric_ids?.length || "All"} Selected Qualities</span>
                  </div>
                  <Button
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-wider shadow-soft hover:shadow-premium transition-premium group-hover:scale-[1.02] text-lg"
                    onClick={() => setRequestPack(pack)}
                  >
                    Order Sample Pack
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && ((view === "fabrics" && filtered.length === 0) || (view === "samples" && filteredSamplePacks.length === 0)) && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 rounded-3xl bg-muted/20 flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-muted/30" />
            </div>
            <h3 className="font-display text-2xl font-black text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground font-medium mb-8">Try adjusting your filters or search terms.</p>
            <Button variant="outline" onClick={() => setFilters(defaultFilters)} className="rounded-2xl font-black uppercase tracking-widest h-12 px-8">
              Reset All Filters
            </Button>
          </div>
        )}
      </main>

      <Footer />

      {/* Sample Request Dialog */}
      <Dialog open={!!requestPack} onOpenChange={(v) => !v && setRequestPack(null)}>
        <DialogContent className="sm:max-w-md section-premium p-0 border-none shadow-premium overflow-hidden">
          <div className="bg-primary/5 px-8 py-8 border-b border-primary/10">
            <DialogTitle className="font-display text-2xl font-black text-foreground tracking-tight uppercase">Request Sample Pack</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1 font-medium italic">"{requestPack?.name}" set</p>
          </div>
          <div className="px-8 py-8 space-y-6">
            <div className="card-premium bg-background p-6 border-primary/20 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Order Summary</p>
                <Badge className="bg-primary font-black text-xs px-4 py-1">₹{Number(requestPack?.price || 0).toLocaleString("en-IN")}</Badge>
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                You will receive physical swatches of {requestPack?.pack_type === 'category' ? `the entire ${requestPack?.category} quality line` : "selected fabric qualities"}.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Contact Name *</label>
                <Input
                  value={requestForm.buyer_name}
                  onChange={(e) => setRequestForm(p => ({ ...p, buyer_name: e.target.value }))}
                  className="h-12 rounded-xl bg-muted/30 border-none shadow-inner font-medium focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Phone Number *</label>
                <Input
                  value={requestForm.phone}
                  onChange={(e) => setRequestForm(p => ({ ...p, phone: e.target.value }))}
                  className="h-12 rounded-xl bg-muted/30 border-none shadow-inner font-medium focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Delivery Address *</label>
                <Input
                  value={requestForm.delivery_address}
                  onChange={(e) => setRequestForm(p => ({ ...p, delivery_address: e.target.value }))}
                  className="h-12 rounded-xl bg-muted/30 border-none shadow-inner font-medium focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <Button
              className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-wider shadow-premium hover:scale-[1.02] transition-premium mt-4"
              onClick={submitSampleRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : `Confirm Request`}
            </Button>
            <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-60">
              Our team will review your request and contact you for dispatch.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Catalog;
