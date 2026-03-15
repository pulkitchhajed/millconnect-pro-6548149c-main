import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Wand2 } from "lucide-react";
import { useFabrics } from "@/hooks/useFabrics";
import SEO from "@/components/SEO";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const FabricMatcher = () => {
  const { data: fabrics } = useFabrics();

  const [specs, setSpecs] = useState({
    category: "all",
    weave: "",
    minGm: "",
    maxGm: "",
    composition: "",
    minWidth: "",
  });
  const [results, setResults] = useState<any[] | null>(null);

  const handleMatch = () => {
    if (!fabrics) return;
    const matched = fabrics.filter((f) => {
      if (specs.category !== "all" && (!f.category || !f.category.includes(specs.category))) return false;
      if (specs.weave && f.weave && !f.weave.toLowerCase().includes(specs.weave.toLowerCase())) return false;
      if (specs.composition && f.composition && !f.composition.toLowerCase().includes(specs.composition.toLowerCase())) return false;
      if (specs.minGm && f.gm && f.gm < Number(specs.minGm)) return false;
      if (specs.maxGm && f.gm && f.gm > Number(specs.maxGm)) return false;
      return true;
    });
    setResults(matched);
  };

  const categories = ["Cotton", "Polyester", "Uniform", "Linen", "Silk", "Other"];

  return (
    <div className="min-h-screen">
      <SEO
        title="Fabric Matching Tool"
        description="Enter your garment specifications to find the best matching fabrics from our catalog."
      />
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-10 text-primary-foreground shadow-2xl">
          <div className="flex items-center gap-4 mb-3">
            <div className="rounded-full bg-white/10 p-3">
              <Wand2 className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="border-white/30 text-white/90 text-sm">Smart Matcher</Badge>
          </div>
          <h1 className="font-display text-4xl font-bold md:text-5xl">Fabric Matching Tool</h1>
          <p className="mt-3 max-w-lg text-lg text-primary-foreground/80">
            Enter your garment specifications and we'll instantly show you the best matching fabrics.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Specs Form */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border bg-card p-6 shadow-sm sticky top-6">
              <h2 className="font-display text-xl font-bold mb-6">Your Requirements</h2>
              <div className="space-y-5">
                <div>
                  <Label>Category</Label>
                  <Select value={specs.category} onValueChange={(v) => setSpecs((p) => ({ ...p, category: v }))}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Any category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Weave Type</Label>
                  <Input
                    placeholder="e.g. Plain, Twill, Jersey"
                    value={specs.weave}
                    onChange={(e) => setSpecs((p) => ({ ...p, weave: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Composition</Label>
                  <Input
                    placeholder="e.g. 100% Cotton, Polyester blend"
                    value={specs.composition}
                    onChange={(e) => setSpecs((p) => ({ ...p, composition: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>GM Range</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Input
                      type="number"
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      placeholder="Min"
                      value={specs.minGm}
                      onChange={(e) => setSpecs((p) => ({ ...p, minGm: e.target.value }))}
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="number"
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      placeholder="Max"
                      value={specs.maxGm}
                      onChange={(e) => setSpecs((p) => ({ ...p, maxGm: e.target.value }))}
                    />
                  </div>
                </div>

                <Button className="w-full mt-4" size="lg" onClick={handleMatch}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Find Matching Fabrics
                </Button>

                {results !== null && (
                  <button
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => { setResults(null); setSpecs({ category: "all", weave: "", minGm: "", maxGm: "", composition: "", minWidth: "" }); }}
                  >
                    Clear & Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {results === null ? (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-10 text-center">
                <Wand2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Enter your requirements and click  "Find Matching Fabrics"</p>
                <p className="text-sm text-muted-foreground mt-1">Leave fields blank to match any value</p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-10 text-center">
                <p className="text-lg font-semibold text-muted-foreground">No fabrics matched your specifications</p>
                <p className="text-sm text-muted-foreground mt-1">Try relaxing some criteria or clearing filters</p>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-sm text-muted-foreground font-medium">{results.length} fabric{results.length > 1 ? "s" : ""} matched</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  {results.map((fabric) => (
                    <div key={fabric.id} className="group rounded-2xl border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
                      {fabric.image_url && (
                        <div className="mb-4 aspect-[4/3] overflow-hidden rounded-lg">
                          <img src={fabric.image_url} alt={fabric.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-display text-lg font-semibold">{fabric.name}</h3>
                        {fabric.category && <Badge variant="outline" className="text-xs">{fabric.category}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{fabric.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs mb-4">
                        {fabric.weave && <Badge variant="secondary">{fabric.weave}</Badge>}
                        {fabric.gm && <Badge variant="secondary">{fabric.gm} GM</Badge>}
                        {fabric.composition && <Badge variant="secondary">{fabric.composition}</Badge>}
                      </div>
                      <div className="flex items-center justify-between border-t pt-3">
                        <span className="text-lg font-bold text-primary">₹{Number(fabric.price_per_meter).toLocaleString("en-IN")}/m</span>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/fabric/${fabric.id}`}>View <ArrowRight className="ml-1 h-3 w-3" /></Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FabricMatcher;
