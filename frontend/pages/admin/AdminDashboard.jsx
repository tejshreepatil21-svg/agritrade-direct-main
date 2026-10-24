import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

const statusColors = {
  verified: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  blocked: 'bg-destructive/10 text-destructive',
  active: 'bg-success/10 text-success',
  closed: 'bg-muted text-muted-foreground',
};

const statusIcons = {
  verified: CheckCircle,
  pending: AlertTriangle,
  blocked: XCircle,
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalFarmers: 0,
    totalBuyers: 0,
    activeListings: 0,
    totalOrders: 0,
    totalRevenue: 0,
    orderRevenue: 0,
    subscriptionRevenue: 0,
    walletBalance: 0,
    pendingApprovals: 0,
    activeSubscriptions: 0,
    todayTransactions: 0,
    todayTransactionValue: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, schemesRes, walletRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getRecentUsers(),
        adminAPI.getSchemes(),
        adminAPI.getWallet()
      ]);

      if (statsRes.success) setStatsData(statsRes.data);
      if (usersRes.success) setRecentUsers(usersRes.data);
      if (schemesRes.success) setSchemes(schemesRes.data);
      if (walletRes.success) setWallet(walletRes.data);

    } catch (error) {
      console.error("Failed to fetch admin dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    {
      label: 'Total Revenue',
      value: `₹${(statsData.totalRevenue || 0).toLocaleString()}`,
      change: 'Orders + Subscriptions',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Total Orders',
      value: statsData.totalOrders || 0,
      change: `₹${(statsData.orderRevenue || 0).toLocaleString()} volume`,
      trend: 'up',
      icon: Package,
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      label: 'Total Farmers',
      value: statsData.totalFarmers || 0,
      change: 'Registered',
      trend: 'neutral',
      icon: Users,
      color: 'bg-green-500/10 text-green-500',
    },
    {
      label: 'Total Buyers',
      value: statsData.totalBuyers || 0,
      change: 'Registered',
      trend: 'neutral',
      icon: Users,
      color: 'bg-purple-500/10 text-purple-500',
    },
    
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 pb-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5 sm:mt-2">
            Platform overview and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="stat-card p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`p-2.5 sm:p-3 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  {stat.trend === 'up' && (
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                  )}
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-xs text-success font-medium">{stat.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Wallet Overview */}
        {wallet && (
          <div className="dashboard-card p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Admin Wallet</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                <p className="text-2xl font-bold text-primary">₹{wallet.totalBalance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">Available for payout</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm text-muted-foreground mb-1">Subscription Income</p>
                <p className="text-2xl font-bold text-purple-600">₹{wallet.totalSubscriptionIncome.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">From premium plans</p>
              </div>
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-muted-foreground mb-1">Commission Income</p>
                <p className="text-2xl font-bold text-green-600">₹{wallet.totalCommissionIncome.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">From crop sales</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Users */}
          <div className="dashboard-card">
            <div className="p-4 sm:p-6 border-b border-border">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Recent Registrations</h2>
                <Link to="/admin/farmers">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">View All</Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-border">
              {recentUsers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">No recent users</div>
              ) : recentUsers.map((user) => {
                const status = user.isVerified ? 'verified' : 'pending';
                const StatusIcon = statusIcons[status];
                const dateStr = user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : 'N/A';

                return (
                  <div key={user._id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-primary text-sm sm:text-base">{user.name?.charAt(0) || 'U'}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm sm:text-base truncate">{user.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground capitalize">{user.role} • {user.address || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap ${statusColors[status]}`}>
                        {StatusIcon && <StatusIcon className="w-3 h-3" />}
                        <span className="hidden xs:inline">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Government Schemes */}
          <div className="dashboard-card">
            <div className="p-4 sm:p-6 border-b border-border">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Government Schemes</h2>
                <Link to="/admin/schemes">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Manage</Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-border">
              {schemes.filter(s => s.isActive && new Date(s.lastDate) >= new Date()).length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">No active schemes</div>
              ) : schemes
                .filter(s => s.isActive && new Date(s.lastDate) >= new Date())
                .slice(0, 5) // Limit to top 5
                .map((scheme) => (
                  <div key={scheme._id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm sm:text-base">{scheme.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Deadline: {new Date(scheme.lastDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors.active}`}>
                      Active
                    </span>
                  </div>
                ))}
            </div>
            <div className="p-4 border-t border-border">
              <Link to="/admin/schemes">
                <Button variant="outline" className="w-full text-xs sm:text-sm">
                  Create New Scheme
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Link to="/admin/farmers" className="dashboard-card p-4 sm:p-6 hover:shadow-hover transition-all duration-200">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
            <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">Manage Farmers</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">View and verify farmers</p>
          </Link>
          <Link to="/admin/buyers" className="dashboard-card p-4 sm:p-6 hover:shadow-hover transition-all duration-200">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-secondary mb-3 sm:mb-4" />
            <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">Manage Buyers</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">View and verify buyers</p>
          </Link>
          <Link to="/admin/transactions" className="dashboard-card p-4 sm:p-6 hover:shadow-hover transition-all duration-200">
            <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-success mb-3 sm:mb-4" />
            <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">Transactions</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Monitor all payments</p>
          </Link>
          <Link to="/admin/crops" className="dashboard-card p-4 sm:p-6 hover:shadow-hover transition-all duration-200">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 text-accent mb-3 sm:mb-4" />
            <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">Crop Listings</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Review all listings</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
