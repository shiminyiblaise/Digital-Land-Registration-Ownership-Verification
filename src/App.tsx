import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MarketplacePage from "./pages/MarketplacePage";
import LandDetailPage from "./pages/LandDetailPage";
import LoginPage from "./pages/LoginPage";
import VerifyLandPage from "./pages/VerifyLandPage";
import RegisterLandPage from "./pages/RegisterLandPage";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import CheckoutPage from "./pages/CheckoutPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/land/:code" element={<LandDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify" element={<VerifyLandPage />} />
              <Route path="/register-land" element={<RegisterLandPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/seller" element={<SellerDashboard />} />
              <Route path="/buyer" element={<BuyerDashboard />} />
              <Route path="/officer" element={<OfficerDashboard />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
