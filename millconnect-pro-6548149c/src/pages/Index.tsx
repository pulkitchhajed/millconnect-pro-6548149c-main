import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFabrics } from "@/hooks/useFabrics";
import SEO from "@/components/SEO";

const Index = () => {
  const { data: fabrics } = useFabrics();
  const featured = (fabrics || []).filter((f) => f.available).slice(0, 3);

  return (
    <div className="min-h-screen">
      <SEO 
        title="Home" 
        description="Premium cloth delivered to your factory. Mill-Connect connects you with top textile mills for quality fabric sourcing."
      />
      <Navbar />
      <HeroSection />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Featured Fabrics</h2>
              <p className="mt-2 text-muted-foreground">Top picks from our latest mill collections</p>
            </div>
            <Button asChild variant="ghost" className="hidden md:flex">
              <Link to="/catalog">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((fabric) => (
              <Link key={fabric.id} to={`/fabric/${fabric.id}`} className="group rounded-xl border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
                {fabric.image_url && (
                  <div className="mb-4 aspect-[4/3] overflow-hidden rounded-lg">
                    <img src={fabric.image_url} alt={`${fabric.name} - ${fabric.type} Fabric`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                )}
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{fabric.type}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{fabric.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{fabric.description}</p>
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div>
                    <span className="text-2xl font-bold text-primary">₹{Number(fabric.price_per_meter).toLocaleString("en-IN")}</span>
                    <span className="text-sm text-muted-foreground">/meter</span>
                  </div>
                  <span className="text-sm font-medium text-primary">View Details <ArrowRight className="ml-1 inline h-3 w-3" /></span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Button asChild><Link to="/catalog">View Full Catalog <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>

      <section className="border-y bg-card py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center font-display text-3xl font-bold md:text-4xl">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: "01", title: "Browse Catalog", desc: "Explore our wide range of fabrics from verified mills" },
              { step: "02", title: "Place Order", desc: "Select quantity, color, and delivery preferences" },
              { step: "03", title: "We Process", desc: "We forward your order to the mill and handle logistics" },
              { step: "04", title: "Get Delivered", desc: "Receive quality-checked fabric at your factory" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">{item.step}</div>
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
