import { Package, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Mill-Connect</span>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Your trusted partner for quality textile sourcing. Connecting garment manufacturers with premium mills.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>Contact Us: </span>
              <a href="tel:9425062020" className="hover:text-primary transition-colors">9425062020</a>
              <span>/</span>
              <a href="tel:9294662020" className="hover:text-primary transition-colors">9294662020</a>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Mill-Connect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
