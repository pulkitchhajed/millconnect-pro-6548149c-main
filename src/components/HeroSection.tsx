import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck, Clock, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-textiles.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Hero */}
      <div className="relative min-h-[85vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/30" />

        <div className="container relative z-10 mx-auto px-6 py-20 md:py-32">
          <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
            <p className="mb-6 inline-block rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-[10px] md:text-sm font-black uppercase tracking-widest text-primary-foreground/90">
              Mill-Connect — Your Trusted Sourcing Partner
            </p>
            <h1 className="mb-6 font-display text-4xl font-bold leading-[1.1] text-primary-foreground md:text-6xl md:leading-tight">
              Premium Cloth,{" "}
              <span className="text-orange-500">Delivered</span> to Your Factory
            </h1>
            <p className="mb-10 max-w-lg text-lg text-primary-foreground/80 md:text-xl font-medium leading-relaxed">
              Order quality fabrics directly from top mills. We handle sourcing, quality checks, and delivery — so you can focus on manufacturing.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row justify-center md:justify-start">
              <Button asChild size="lg" className="h-14 px-8 text-base font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform">
                <Link to="/catalog">
                  Browse Catalog <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 border-primary-foreground/30 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/20 text-base font-black uppercase tracking-wider backdrop-blur-sm">
                <Link to="/orders">Track Orders</Link>
              </Button>
              <Button asChild size="lg" className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white text-base font-black uppercase tracking-wider shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-transform">
                <Link to="/design-requests">
                  APC Requests <Wand2 className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features strip */}
      <div className="border-b bg-card">
        <div className="container mx-auto grid gap-0 divide-y px-4 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            { icon: ShieldCheck, title: "Quality Assured", desc: "Every order passes strict quality checks before dispatch" },
            { icon: Truck, title: "Reliable Delivery", desc: "On-time delivery from mill to your doorstep" },
            { icon: Clock, title: "Quick Turnaround", desc: "Fast order processing and transparent tracking" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4 p-6 md:p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
