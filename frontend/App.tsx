import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Farmer Pages
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import FarmerWallet from "./pages/farmer/FarmerWallet";
import FarmerSchemes from "./pages/farmer/FarmerSchemes";

// Buyer Pages
import BuyerDashboard from "./pages/buyer/BuyerDashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Farmer Routes */}
            <Route path="/farmer" element={<FarmerDashboard />} />
            <Route path="/farmer/crops" element={<FarmerDashboard />} />
            <Route path="/farmer/orders" element={<FarmerDashboard />} />
            <Route path="/farmer/wallet" element={<FarmerWallet />} />
            <Route path="/farmer/schemes" element={<FarmerSchemes />} />
            <Route path="/farmer/notifications" element={<FarmerDashboard />} />
            <Route path="/farmer/settings" element={<FarmerDashboard />} />

            {/* Buyer Routes */}
            <Route path="/buyer" element={<BuyerDashboard />} />
            <Route path="/buyer/browse" element={<BuyerDashboard />} />
            <Route path="/buyer/orders" element={<BuyerDashboard />} />
            <Route path="/buyer/wallet" element={<BuyerDashboard />} />
            <Route path="/buyer/notifications" element={<BuyerDashboard />} />
            <Route path="/buyer/settings" element={<BuyerDashboard />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/farmers" element={<AdminDashboard />} />
            <Route path="/admin/buyers" element={<AdminDashboard />} />
            <Route path="/admin/crops" element={<AdminDashboard />} />
            <Route path="/admin/transactions" element={<AdminDashboard />} />
            <Route path="/admin/schemes" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminDashboard />} />
            <Route path="/admin/reports" element={<AdminDashboard />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
