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
import FarmerNotifications from "./pages/farmer/FarmerNotifications";
import FarmerSettings from "./pages/farmer/FarmerSettings";
import MyCrops from "./pages/farmer/MyCrops";
import Orders from "./pages/farmer/Orders";

// Buyer Pages
// Buyer Pages
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import BuyerSubscription from "./pages/buyer/BuyerSubscription";
import BuyerOrders from "./pages/buyer/BuyerOrders";
import BrowseCrops from "./pages/buyer/BrowseCrops";
import BuyerNotifications from "./pages/buyer/BuyerNotifications";
import BuyerSettings from "./pages/buyer/BuyerSettings";
import BuyerWallet from "./pages/buyer/BuyerWallet";
import Invoice from "./pages/buyer/Invoice";
import SubscriptionInvoice from "./pages/buyer/SubscriptionInvoice";


import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFarmers from "./pages/admin/AdminFarmers";
import AdminBuyers from "./pages/admin/AdminBuyers";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminSchemes from "./pages/admin/AdminSchemes";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminCrops from "./pages/admin/AdminCrops";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

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
            <Route path="/farmer" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerDashboard /></ProtectedRoute>} />
            <Route path="/farmer/crops" element={<ProtectedRoute allowedRoles={['farmer']}><MyCrops /></ProtectedRoute>} />
            <Route path="/farmer/orders" element={<ProtectedRoute allowedRoles={['farmer']}><Orders /></ProtectedRoute>} />
            <Route path="/farmer/wallet" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerWallet /></ProtectedRoute>} />
            <Route path="/farmer/schemes" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerSchemes /></ProtectedRoute>} />
            <Route path="/farmer/notifications" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerNotifications /></ProtectedRoute>} />
            <Route path="/farmer/settings" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerSettings /></ProtectedRoute>} />

            {/* Buyer Routes */}
            <Route path="/buyer" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerDashboard /></ProtectedRoute>} />
            <Route path="/buyer/browse" element={<ProtectedRoute allowedRoles={['buyer']}><BrowseCrops /></ProtectedRoute>} />
            <Route path="/buyer/orders" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerOrders /></ProtectedRoute>} />
            <Route path="/buyer/wallet" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerWallet /></ProtectedRoute>} />
            <Route path="/buyer/notifications" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerNotifications /></ProtectedRoute>} />
            <Route path="/buyer/settings" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerSettings /></ProtectedRoute>} />
            <Route path="/buyer/subscription" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerSubscription /></ProtectedRoute>} />
            <Route path="/buyer/orders/:orderId/invoice" element={<ProtectedRoute allowedRoles={['buyer']}><Invoice /></ProtectedRoute>} />
            <Route path="/buyer/subscription/invoice/:transactionId" element={<ProtectedRoute allowedRoles={['buyer']}><SubscriptionInvoice /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/farmers" element={<ProtectedRoute allowedRoles={['admin']}><AdminFarmers /></ProtectedRoute>} />
            <Route path="/admin/buyers" element={<ProtectedRoute allowedRoles={['admin']}><AdminBuyers /></ProtectedRoute>} />
            <Route path="/admin/crops" element={<ProtectedRoute allowedRoles={['admin']}><AdminCrops /></ProtectedRoute>} />
            <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin']}><AdminTransactions /></ProtectedRoute>} />
            <Route path="/admin/schemes" element={<ProtectedRoute allowedRoles={['admin']}><AdminSchemes /></ProtectedRoute>} />
            <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnnouncements /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
