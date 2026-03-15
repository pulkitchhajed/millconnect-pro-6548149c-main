import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import FabricDetail from "./pages/FabricDetail";
import FabricMatcher from "./pages/FabricMatcher";
import OrderPage from "./pages/OrderPage";
import ApcOrderPage from "./pages/ApcOrderPage";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import QuoteRequest from "./pages/QuoteRequest";
import BuyerDashboard from "./pages/BuyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import DesignRequest from "./pages/DesignRequest";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/fabric/:id" element={<FabricDetail />} />
            <Route path="/fabric-matcher" element={<FabricMatcher />} />
            <Route path="/order/:fabricId" element={<OrderPage />} />
            <Route path="/apc-order/:id" element={<ApcOrderPage />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/quote/:fabricId" element={<QuoteRequest />} />
            <Route path="/dashboard" element={<BuyerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/design-requests" element={<DesignRequest />} />
            <Route path="/design-request" element={<DesignRequest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
