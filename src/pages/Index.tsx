import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeaturedFabrics } from "@/hooks/useFabrics";
import SEO from "@/components/SEO";
import { ColorSwatchList } from "@/components/ColorSwatch.tsx";

const Index = () => {
  const { data: featured } = useFeaturedFabrics();

  return (
    <div className="min-h-screen">
      <SEO
        title="Home"
        description="Premium cloth delivered to your factory. Mill-Connect connects you with top textile mills for quality fabric sourcing."
      />
      <Navbar />
      <HeroSection />

      <section className="relative -mt-6 md:-mt-10 mb-8 md:mb-12">
        <div className="container mx-auto px-4 text-center">
          <Link
            to="/design-requests"
            className="group block relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/95 to-secondary p-6 md:p-16 shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99] border-2 md:border-4 border-white"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] bg-[length:20px_20px]" />

            <div className="relative z-10 flex flex-col items-center justify-center gap-4 md:gap-8">
              <div className="flex h-12 w-12 md:h-20 md:w-20 items-center justify-center rounded-xl md:rounded-3xl bg-white/20 backdrop-blur-md shadow-inner transition-transform group-hover:rotate-12">
                <div className="h-6 w-6 md:h-10 md:w-10 border-2 border-white rounded-full opacity-50" />
              </div>
              <div className="space-y-2 md:space-y-4">
                <h2 className="font-display text-xl sm:text-2xl font-black text-white md:text-5xl uppercase tracking-tighter leading-tight">
                  Have a Unique Vision?
                </h2>
                <p className="text-sm sm:text-base font-bold text-white/90 md:text-2xl italic max-w-lg mx-auto">
                  "For any design kindly upload a picture"
                </p>
              </div>
              <div className="rounded-full bg-white px-6 py-3 md:px-12 md:py-5 text-[10px] md:text-sm font-black text-primary shadow-xl transition-all group-hover:bg-opacity-95 group-hover:px-14 uppercase tracking-widest flex items-center gap-2">
                Get Your APC Request Now <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

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
            {featured?.map((fabric) => (
              <Link key={fabric.id} to={`/fabric/${fabric.id}`} className="group rounded-xl border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
                {fabric.image_url && (
                  <div className="mb-4 aspect-[4/3] overflow-hidden rounded-lg">
                    <img src={fabric.image_url} alt={`${fabric.name} - ${fabric.type} Fabric`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                )}
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{fabric.type}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{fabric.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{fabric.description}</p>
                {fabric.colors && (
                  <div className="mt-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Available Colors</p>
                    <ColorSwatchList colors={fabric.colors} limit={8} size="sm" />
                  </div>
                )}
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
          <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Browse Catalog", desc: "Explore our wide range of fabrics from verified mills" },
              { step: "02", title: "Place Order", desc: "Select quantity, color, and delivery preferences" },
              { step: "03", title: "We Process", desc: "We forward your order to the mill and handle logistics" },
              { step: "04", title: "Get Delivered", desc: "Receive quality-checked fabric at your factory" },
            ].map((item, index) => (
              <div key={item.step} className="group relative text-center p-6 rounded-2xl border bg-white shadow-soft transition-all hover:shadow-md md:border-none md:bg-transparent md:shadow-none">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-black text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <h3 className="font-display text-lg font-black tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-12 -right-4 w-1 flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-muted/30" />
                  </div>
                )}
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
