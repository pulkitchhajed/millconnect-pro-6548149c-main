import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck, Clock } from "lucide-react";
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

        <div className="container relative z-10 mx-auto px-4 py-24">
          <div className="max-w-2xl">
            <p className="mb-4 inline-block rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-primary-foreground/90">
              Mill-Connect — Your Trusted Sourcing Partner
            </p>
            <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">
              Premium Cloth,{" "}
              <span className="text-secondary">Delivered</span> to Your Factory
            </h1>
            <p className="mb-8 max-w-lg text-lg text-primary-foreground/80">
              Order quality fabrics directly from top mills. We handle sourcing, quality checks, and delivery — so you can focus on manufacturing.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="text-base">
                <Link to="/catalog">
                  Browse Catalog <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 text-base">
                <Link to="/orders">Track Orders</Link>
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
