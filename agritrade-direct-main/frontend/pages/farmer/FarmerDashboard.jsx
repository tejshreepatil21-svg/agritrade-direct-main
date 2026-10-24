import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  ShoppingCart,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2,
  AlertCircle,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { farmerAPI } from '@/lib/api';

const statusColors = {
  pending: 'bg-warning/10 text-warning',
  accepted: 'bg-primary/10 text-primary',
  completed: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted/10 text-muted-foreground',
};

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [schemes, setSchemes] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, ordersRes, msgsRes, schemesRes] = await Promise.all([
          farmerAPI.getStats(),
          farmerAPI.getOrders(),
          farmerAPI.getMessages(),
          farmerAPI.getSchemes()
        ]);

        setStats(statsRes?.data || null);
        setOrders(Array.isArray(ordersRes?.data) ? ordersRes.data : []);
        setMessages(msgsRes?.data || []);
        setSchemes(schemesRes?.data || []);
      } catch (err) {
        console.error('Dashboard Error:', err);

        const msg = err?.response?.data?.message || err.message || 'Failed to load dashboard';

        // More robust check
        if (
          err?.response?.status === 401 ||
          err?.response?.status === 403 ||
          msg.toLowerCase().includes('unauthorized') ||
          msg.toLowerCase().includes('access required')
        ) {
          logout();
          navigate('/login');
          return;
        }

        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchDashboard();
  }, [user, logout, navigate]);

  // Update order status
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await farmerAPI.updateOrderStatus(orderId, newStatus);

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update order');
    }
  };

  if (loading) {
    // ... (existing loader)
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-3">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-6">

        {/* ... (Error Banner) */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {user?.name?.split(' ')[0] || 'Farmer'} 👋
            </h1>
            <p className="text-muted-foreground mt-1">Here’s your real farm activity</p>
          </div>
          <Link to="/farmer/crops">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Crop
            </Button>
          </Link>
        </div>

        {/* Admin Announcements Section */}
        {messages.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-purple-600" /> Admin Announcements
            </h2>
            <div className="grid gap-3">
              {messages.map(msg => (
                <div key={msg._id} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white ${msg.type === 'alert' ? 'border-l-red-500 bg-red-50/50' :
                  msg.type === 'news' ? 'border-l-blue-500 bg-blue-50/50' : 'border-l-purple-500'
                  }`}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">{msg.title}</h3>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mt-1 text-sm">{msg.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Active Crops" value={stats.activeCrops} icon={<Package />} />
            <StatCard title="Pending Orders" value={stats.pendingOrders} icon={<ShoppingCart />} />
            <StatCard title="Wallet Balance" value={`₹${stats.walletBalance?.toLocaleString() || 0}`} icon={<Wallet />} />
            <StatCard title="Total Earnings" value={`₹${stats.totalEarnings?.toLocaleString() || 0}`} icon={<TrendingUp />} />
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No statistics available</p>
        )}

        {/* Orders */}
        <div className="dashboard-card">
          <div className="p-4 border-b flex justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/farmer/orders">
              <Button size="sm" variant="ghost">View All ({orders.length})</Button>
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No orders found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-3 text-left text-sm">Order</th>
                    <th className="p-3 text-left text-sm">Buyer</th>
                    <th className="p-3 text-left text-sm">Crop</th>
                    <th className="p-3 text-left text-sm">Qty</th>
                    <th className="p-3 text-left text-sm">Amount</th>
                    <th className="p-3 text-left text-sm">Status</th>
                    <th className="p-3 text-left text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="border-t">
                      <td className="p-3">{order._id.slice(0, 8)}</td>
                      <td className="p-3">{order.buyerId?.name || 'N/A'}</td>
                      <td className="p-3">{order.cropId?.name || 'N/A'}</td>
                      <td className="p-3">{order.quantity} kg</td>
                      <td className="p-3">₹{order.totalAmount?.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {order.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleOrderStatusChange(order._id, 'accepted')}>Accept</Button>
                            <Button size="sm" variant="outline" onClick={() => handleOrderStatusChange(order._id, 'rejected')}>Reject</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

/* Small stat card component */
function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card p-5">
      <div className="flex justify-between mb-3">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">{icon}</div>
        <ArrowUpRight className="text-success" />
      </div>
      <p className="text-2xl font-bold">{value || 0}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}
