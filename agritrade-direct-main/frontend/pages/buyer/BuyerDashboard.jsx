import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  ShoppingCart,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Search,
  Package,
  MapPin,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { buyerAPI, orderAPI } from '@/lib/api';

const statusColors = {
  'pending': 'bg-warning/10 text-warning',
  'in-transit': 'bg-primary/10 text-primary',
  'accepted': 'bg-blue-500/10 text-blue-500',
  'delivered': 'bg-success/10 text-success',
  'completed': 'bg-success/10 text-success',
  'cancelled': 'bg-destructive/10 text-destructive',
  'rejected': 'bg-destructive/10 text-destructive',
};

export default function BuyerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [featuredCrops, setFeaturedCrops] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, cropsRes, ordersRes] = await Promise.all([
          buyerAPI.getStats(),
          buyerAPI.getFeaturedCrops(),
          orderAPI.getOrders()
        ]);

        if (statsRes.success) {
          setStats(statsRes.data);
        }

        if (cropsRes.success) {
          setFeaturedCrops(cropsRes.data);
        }

        // Orders API returns array directly
        if (Array.isArray(ordersRes)) {
          setRecentOrders(ordersRes);
        } else if (ordersRes.data) {
          // Handle case if wrapped in data object
          setRecentOrders(ordersRes.data);
        }

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        const msg = err?.response?.data?.message || err.message || "Failed to load dashboard data";

        if (
          err?.response?.status === 401 ||
          err?.response?.status === 403 ||
          msg.toLowerCase().includes('unauthorized') ||
          msg.toLowerCase().includes('subscription required') // though 403 usually covers this
        ) {
          // If it's a subscription error, we might want to stay on page but just show error or redirect to subscription page?
          // BUT if we get 403 on critical resources like 'stats' or 'orders' which shouldn't happen if we allowed them, then it's a token issue.
          // Wait, 'featured-crops' WAS returning 403 bc of subscription check. We just fixed that in backend.
          // So if we still get 403, it's likely a real auth issue or subscription needed for something else.
          // The previous error was "Subscription required" on "featured-crops".

          if (msg.includes('Subscription')) {
            // Just specific error for this part?
            // But if it blocks the whole dashboard load which is in Promise.all, then the whole dashboard fails.
            // We should probably catch individual promises if we want partial load.
            // For now, let's just logout only on clear Auth failures.
            // If it is regular 403 (Subscription), we probably shouldn't logout, but redirect to subscription page or show alert.
          }

          if (err?.response?.status === 401 || (err?.response?.status === 403 && !msg.includes('Subscription'))) {
            logout();
            navigate('/login');
            return;
          }
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, navigate, logout]);

  // Transform stats for display
  const statsDisplay = [
    {
      label: 'Active Orders',
      value: stats?.activeOrders || 0,
      change: 'View status', // Placeholder or calc
      trend: 'neutral',
      icon: ShoppingCart,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Wallet Balance',
      value: `₹${(stats?.walletBalance || 0).toLocaleString()}`,
      change: 'Available',
      trend: 'up',
      icon: Wallet,
      color: 'bg-success/10 text-success',
    },
    {
      label: 'Total Spent',
      value: `₹${(stats?.totalSpent || 0).toLocaleString()}`,
      change: 'Lifetime',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-secondary/20 text-secondary-foreground',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 pb-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">
              Hello, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5 sm:mt-2">
              Find fresh produce directly from farmers.
            </p>
          </div>

          {!user?.isSubscribed && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-primary">Upgrade to Premium</h3>
                <p className="text-sm text-muted-foreground">Unlock exclusive features and unlimited orders.</p>
              </div>
              <Link to="/buyer/subscription">
                <Button size="sm">Upgrade</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="dashboard-card p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                placeholder="Search crops, farmers, locations..."
                className="pl-9 sm:pl-10 text-sm sm:text-base"
              />
            </div>
            <Link to="/buyer/browse">
              <Button variant="default" className="w-full sm:w-auto">Search</Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {statsDisplay.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="stat-card p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`p-2.5 sm:p-3 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-xs text-primary font-medium">{stat.change}</p>
                </div>
              </div>
            );
          })}
        </div>



        {/* Recent Orders */}
        <div className="dashboard-card overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Recent Orders</h2>
              <Link to="/buyer/orders">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">View All</Button>
              </Link>
            </div>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No recent orders found.</div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden divide-y divide-border">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">#{order._id.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground mt-1">{order.farmerId?.name || 'Unknown Farmer'}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[order.status] || 'bg-gray-100'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Crop</p>
                        <p className="font-medium text-foreground">{order.cropId?.name || 'Unknown Crop'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Quantity</p>
                        <p className="font-medium text-foreground">{order.quantity} {order.cropId?.unit ? order.cropId.unit.charAt(0).toUpperCase() + order.cropId.unit.slice(1) : 'Kg'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground text-xs">Amount</p>
                        <p className="font-semibold text-foreground">₹{order.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-xs sm:text-sm">Order ID</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-xs sm:text-sm">Farmer</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-xs sm:text-sm">Crop</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-xs sm:text-sm">Quantity</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-xs sm:text-sm">Amount</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-xs sm:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-3 sm:p-4 font-medium text-foreground text-xs sm:text-sm">#{order._id.slice(-6)}</td>
                        <td className="p-3 sm:p-4 text-foreground text-xs sm:text-sm">{order.farmerId?.name || 'Unknown'}</td>
                        <td className="p-3 sm:p-4 text-foreground text-xs sm:text-sm">{order.cropId?.name || 'Unknown'}</td>
                        <td className="p-3 sm:p-4 text-muted-foreground text-xs sm:text-sm">{order.quantity} {order.cropId?.unit ? order.cropId.unit.charAt(0).toUpperCase() + order.cropId.unit.slice(1) : 'Kg'}</td>
                        <td className="p-3 sm:p-4 font-medium text-foreground text-xs sm:text-sm">₹{order.totalAmount}</td>
                        <td className="p-3 sm:p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-100'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link to="/buyer/wallet" className="dashboard-card p-4 sm:p-6 hover:shadow-hover transition-all duration-200">
            <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
            <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">Wallet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Add money and pay farmers</p>
          </Link>

        </div>
      </div>
    </DashboardLayout>
  );
}
