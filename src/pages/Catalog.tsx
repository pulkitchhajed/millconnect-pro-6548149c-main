import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFabrics } from "@/hooks/useFabrics";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";

const Catalog = () => {
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { data: fabrics, isLoading } = useFabrics();
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const { user } = useAuth();

  const types = ["All", ...Array.from(new Set(fabrics?.map((f) => f.type).filter(Boolean) || []))];
  const categories = ["All", ...Array.from(new Set(fabrics?.map((f) => f.category).filter(Boolean) || []))];

  const filtered = (fabrics || []).filter((f) => {
    const matchesType = typeFilter === "All" || f.type === typeFilter;
    const matchesCategory = categoryFilter === "All" || f.category === categoryFilter;
    const matchesSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.type || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.colors || "").toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  const colorMap: Record<string, string> = {
    Cotton: "bg-secondary/10 text-secondary",
    "Linen Blend": "bg-primary/10 text-primary",
    Denim: "bg-primary/15 text-primary",
    Silk: "bg-secondary/15 text-secondary",
    Polyester: "bg-muted text-muted-foreground",
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Fabric Catalog"
        description="Explore our wide range of fabrics from verified mills. Filter by type, color, and more to find the perfect fabric for your needs."
      />
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Fabric Catalog</h1>
        <p className="mt-2 text-muted-foreground">Browse our complete collection of premium fabrics</p>

        {/* Search */}
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, type, or color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Product Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${categoryFilter === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="mt-12 text-center text-muted-foreground">Loading fabrics...</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((fabric) => {
              const badgeClass = colorMap[fabric.type] || "bg-muted text-muted-foreground";
              const isFav = favoriteIds?.has(fabric.id) || false;
              return (
                <div key={fabric.id} className="group rounded-xl border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
                  {fabric.image_url && (
                    <Link to={`/fabric/${fabric.id}`}>
                      <div className="mb-4 aspect-[4/3] overflow-hidden rounded-lg">
                        <img src={fabric.image_url} alt={`${fabric.name} - ${fabric.type} Fabric`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                    </Link>
                  )}
                  <div className="mb-3 flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>{fabric.type}</span>
                    <div className="flex items-center gap-2">
                      {!fabric.available && (
                        <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">Out of Stock</span>
                      )}
                      {user && (
                        <button
                          onClick={() => toggleFavorite.mutate({ fabricId: fabric.id, isFavorite: isFav })}
                          className="rounded-full p-1 hover:bg-muted"
                        >
                          <Heart className={`h-4 w-4 ${isFav ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                        </button>
                      )}
                    </div>
                  </div>
                  <Link to={`/fabric/${fabric.id}`}>
                    <h3 className="font-display text-lg font-semibold hover:text-primary">{fabric.name}</h3>
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{fabric.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Color</span>
                      <p className="font-medium">
                        {fabric.colors?.split(",").map(c => c.split(":")[0].trim()).join(", ") || "Standard"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Min. Order</span>
                      <p className="font-medium">{fabric.min_order} {fabric.unit}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <div>
                      <span className="text-2xl font-bold text-primary">₹{Number(fabric.price_per_meter).toLocaleString("en-IN")}</span>
                      <span className="text-sm text-muted-foreground">/meter</span>
                    </div>
                    <Button asChild size="sm" disabled={!fabric.available}>
                      <Link to={`/fabric/${fabric.id}`}>
                        View Details <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">No fabrics found.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Catalog;
