import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useFabric, useFabricImages } from "@/hooks/useFabrics";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import SEO from "@/components/SEO";

const FabricDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: fabric, isLoading } = useFabric(id);
  const { data: images } = useFabricImages(id);
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const isFav = favoriteIds?.has(id || "") || false;

  const allImages = [
    ...(fabric?.image_url ? [fabric.image_url] : []),
    ...(images?.map((i) => i.image_url) || []),
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!fabric) {
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

  const specs = [
    { label: "GSM", value: fabric.gsm },
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
      {/* JSON-LD Structured Data for AI/Search Bots */}
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
                <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
                  <img
                    src={allImages[currentImage]}
                    alt={fabric.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage((p) => (p > 0 ? p - 1 : allImages.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow backdrop-blur-sm"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImage((p) => (p < allImages.length - 1 ? p + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow backdrop-blur-sm"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {allImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImage(i)}
                          className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                            i === currentImage ? "border-primary" : "border-transparent"
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
          <div>
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="outline" className="mb-3">{fabric.type}</Badge>
                <h1 className="font-display text-3xl font-bold">{fabric.name}</h1>
              </div>
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite.mutate({ fabricId: fabric.id, isFavorite: isFav })}
                >
                  <Heart className={`h-5 w-5 ${isFav ? "fill-destructive text-destructive" : ""}`} />
                </Button>
              )}
            </div>

            <p className="mt-4 text-muted-foreground">{fabric.description}</p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">₹{Number(fabric.price_per_meter).toLocaleString("en-IN")}</span>
              <span className="text-muted-foreground">/ meter</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Colors</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {fabric.colors && fabric.colors.split(",").map((c: string, idx: number) => {
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
                        className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all hover:border-primary ${
                          isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background"
                        }`}
                        title={name}
                      >
                        <span 
                          className="h-4 w-4 rounded-full border shadow-sm" 
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-xs font-medium">{name}</span>
                        {isSelected && (
                          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {!fabric.colors && <p className="font-medium">N/A</p>}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Min. Order</span>
                <p className="font-medium">{fabric.min_order} {fabric.unit}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Availability</span>
                <p className="font-medium">{fabric.available ? "In Stock" : "Out of Stock"}</p>
              </div>
            </div>

            {specs.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-lg font-semibold">Specifications</h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {specs.map((s) => (
                    <div key={s.label} className="rounded-lg border bg-muted/50 p-3">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <p className="mt-1 font-medium">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <Button asChild size="lg" disabled={!fabric.available}>
                <Link to={`/order/${fabric.id}${selectedColors.length > 0 ? `?colors=${encodeURIComponent(selectedColors.join(","))}` : ""}`}>
                  {selectedColors.length > 1 ? `Order ${selectedColors.length} Colors` : "Order Now"} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              {user && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(`/quote/${fabric.id}${selectedColors.length > 0 ? `?colors=${encodeURIComponent(selectedColors.join(","))}` : ""}`)}
                >
                  {selectedColors.length > 1 ? `Request ${selectedColors.length} Quotes` : "Request Quote"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FabricDetail;
