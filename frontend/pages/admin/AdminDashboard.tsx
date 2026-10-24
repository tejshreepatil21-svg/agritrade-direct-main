import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Users,
  Package,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const stats = [
  {
    label: 'Total Farmers',
    value: '2,543',
    change: '+124 this month',
    trend: 'up',
    icon: Users,
    color: 'bg-primary/10 text-primary',
  },
  {
    label: 'Total Buyers',
    value: '1,876',
    change: '+89 this month',
    trend: 'up',
    icon: Users,
    color: 'bg-secondary/20 text-secondary-foreground',
  },
  {
    label: 'Active Listings',
    value: '4,521',
    change: '+312 this week',
    trend: 'up',
    icon: Package,
    color: 'bg-success/10 text-success',
  },
  {
    label: 'Platform Revenue',
    value: '₹12.5L',
    change: '+23% vs last month',
    trend: 'up',
    icon: TrendingUp,
    color: 'bg-accent/10 text-accent',
  },
];

const transactionStats = [
  { label: 'Total Transactions', value: '₹2.5 Cr', trend: '+18%' },
  { label: 'Platform Commission', value: '₹12.5L', trend: '+23%' },
  { label: 'Pending Payouts', value: '₹45,000', trend: '-12%' },
];

const recentUsers = [
  { id: 'F001', name: 'Ramesh Patel', type: 'Farmer', location: 'Gujarat', status: 'verified', date: '2 hours ago' },
  { id: 'B001', name: 'Priya Sharma', type: 'Buyer', location: 'Delhi', status: 'pending', date: '3 hours ago' },
  { id: 'F002', name: 'Suresh Kumar', type: 'Farmer', location: 'Punjab', status: 'verified', date: '5 hours ago' },
  { id: 'B002', name: 'Amit Singh', type: 'Buyer', location: 'Mumbai', status: 'blocked', date: '1 day ago' },
];

const recentSchemes = [
  { id: 'SCH001', name: 'PM Kisan Samman Nidhi', applications: 234, status: 'active' },
  { id: 'SCH002', name: 'Crop Insurance Scheme', applications: 156, status: 'active' },
  { id: 'SCH003', name: 'Fertilizer Subsidy', applications: 89, status: 'closed' },
];

const statusColors: Record<string, string> = {
  verified: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  blocked: 'bg-destructive/10 text-destructive',
  active: 'bg-success/10 text-success',
  closed: 'bg-muted text-muted-foreground',
};

const statusIcons: Record<string, React.ElementType> = {
  verified: CheckCircle,
  pending: AlertTriangle,
  blocked: XCircle,
};

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform overview and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-5 h-5 text-success" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xs text-success mt-1">{stat.change}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transaction Overview */}
        <div className="dashboard-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Transaction Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {transactionStats.map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-muted/50 rounded-xl">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-xs mt-1 ${stat.trend.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                  {stat.trend}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="dashboard-card">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent Registrations</h2>
                <Link to="/admin/farmers">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-border">
              {recentUsers.map((user) => {
                const StatusIcon = statusIcons[user.status];
                return (
                  <div key={user.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.type} • {user.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[user.status]}`}>
                        {StatusIcon && <StatusIcon className="w-3 h-3" />}
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">{user.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Government Schemes */}
          <div className="dashboard-card">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Government Schemes</h2>
                <Link to="/admin/schemes">
                  <Button variant="ghost" size="sm">Manage</Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-border">
              {recentSchemes.map((scheme) => (
                <div key={scheme.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{scheme.name}</p>
                    <p className="text-sm text-muted-foreground">{scheme.applications} applications</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[scheme.status]}`}>
                    {scheme.status.charAt(0).toUpperCase() + scheme.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border">
              <Button variant="outline" className="w-full">
                Create New Scheme
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4">
          <Link to="/admin/farmers" className="dashboard-card p-6 hover:shadow-hover transition-shadow">
            <Users className="w-10 h-10 text-primary mb-4" />
            <h3 className="font-semibold text-foreground">Manage Farmers</h3>
            <p className="text-sm text-muted-foreground">View and verify farmers</p>
          </Link>
          <Link to="/admin/buyers" className="dashboard-card p-6 hover:shadow-hover transition-shadow">
            <Users className="w-10 h-10 text-secondary mb-4" />
            <h3 className="font-semibold text-foreground">Manage Buyers</h3>
            <p className="text-sm text-muted-foreground">View and verify buyers</p>
          </Link>
          <Link to="/admin/transactions" className="dashboard-card p-6 hover:shadow-hover transition-shadow">
            <Wallet className="w-10 h-10 text-success mb-4" />
            <h3 className="font-semibold text-foreground">Transactions</h3>
            <p className="text-sm text-muted-foreground">Monitor all payments</p>
          </Link>
          <Link to="/admin/crops" className="dashboard-card p-6 hover:shadow-hover transition-shadow">
            <Package className="w-10 h-10 text-accent mb-4" />
            <h3 className="font-semibold text-foreground">Crop Listings</h3>
            <p className="text-sm text-muted-foreground">Review all listings</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
