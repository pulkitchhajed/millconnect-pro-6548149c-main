import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center bg-muted/30">
        <div className="text-center px-4">
          <p className="text-6xl font-bold text-primary/20 font-display">404</p>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Page Not Found</h1>
          <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild className="mt-8">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Return to Home</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
