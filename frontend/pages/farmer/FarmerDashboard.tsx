import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  ShoppingCart,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const stats = [
  {
    label: 'Active Crops',
    value: '12',
    change: '+2 this week',
    trend: 'up',
    icon: Package,
    color: 'bg-primary/10 text-primary',
  },
  {
    label: 'Pending Orders',
    value: '8',
    change: '+3 today',
    trend: 'up',
    icon: ShoppingCart,
    color: 'bg-secondary/20 text-secondary-foreground',
  },
  {
    label: 'Wallet Balance',
    value: '₹45,230',
    change: '+₹12,500 this month',
    trend: 'up',
    icon: Wallet,
    color: 'bg-success/10 text-success',
  },
  {
    label: 'Total Earnings',
    value: '₹1,25,000',
    change: '+15% vs last month',
    trend: 'up',
    icon: TrendingUp,
    color: 'bg-accent/10 text-accent',
  },
];

const recentOrders = [
  { id: 'ORD001', buyer: 'Priya Sharma', crop: 'Wheat', qty: '50 kg', amount: '₹2,500', status: 'pending' },
  { id: 'ORD002', buyer: 'Rahul Verma', crop: 'Rice', qty: '100 kg', amount: '₹4,000', status: 'accepted' },
  { id: 'ORD003', buyer: 'Amit Singh', crop: 'Tomatoes', qty: '20 kg', amount: '₹800', status: 'completed' },
  { id: 'ORD004', buyer: 'Neha Gupta', crop: 'Onions', qty: '30 kg', amount: '₹900', status: 'pending' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  accepted: 'bg-primary/10 text-primary',
  completed: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

export default function FarmerDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your farm today.
            </p>
          </div>
          <Link to="/farmer/crops/add">
            <Button variant="default" className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Crop
            </Button>
          </Link>
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

        {/* Recent Orders */}
        <div className="dashboard-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
              <Link to="/farmer/orders">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Buyer</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Crop</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-4 font-medium text-foreground">{order.id}</td>
                    <td className="p-4 text-foreground">{order.buyer}</td>
                    <td className="p-4 text-foreground">{order.crop}</td>
                    <td className="p-4 text-muted-foreground">{order.qty}</td>
                    <td className="p-4 font-medium text-foreground">{order.amount}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      {order.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="success">Accept</Button>
                          <Button size="sm" variant="outline">Reject</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/farmer/wallet" className="dashboard-card p-6 hover:shadow-hover transition-shadow">
            <Wallet className="w-10 h-10 text-primary mb-4" />
            <h3 className="font-semibold text-foreground">Wallet</h3>
            <p className="text-sm text-muted-foreground">View balance and transactions</p>
          </Link>
          <Link to="/farmer/schemes" className="dashboard-card p-6 hover:shadow-hover transition-shadow">
            <TrendingUp className="w-10 h-10 text-secondary mb-4" />
            <h3 className="font-semibold text-foreground">Government Schemes</h3>
            <p className="text-sm text-muted-foreground">Apply for subsidies</p>
          </Link>
          <Link to="/farmer/crops" className="dashboard-card p-6 hover:shadow-hover transition-shadow">
            <Package className="w-10 h-10 text-accent mb-4" />
            <h3 className="font-semibold text-foreground">My Crops</h3>
            <p className="text-sm text-muted-foreground">Manage your listings</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
