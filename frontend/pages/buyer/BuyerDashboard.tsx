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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

const stats = [
  {
    label: 'Active Orders',
    value: '5',
    change: '+2 this week',
    trend: 'up',
    icon: ShoppingCart,
    color: 'bg-primary/10 text-primary',
  },
  {
    label: 'Wallet Balance',
    value: '₹32,500',
    change: '+₹5,000 added',
    trend: 'up',
    icon: Wallet,
    color: 'bg-success/10 text-success',
  },
  {
    label: 'Total Spent',
    value: '₹78,000',
    change: 'This month',
    trend: 'neutral',
    icon: TrendingUp,
    color: 'bg-secondary/20 text-secondary-foreground',
  },
];

const featuredCrops = [
  {
    id: '1',
    name: 'Organic Wheat',
    farmer: 'Rajesh Kumar',
    location: 'Rampur, UP',
    price: '₹50/kg',
    quantity: '500 kg',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop',
  },
  {
    id: '2',
    name: 'Basmati Rice',
    farmer: 'Suresh Patel',
    location: 'Karnal, Haryana',
    price: '₹80/kg',
    quantity: '300 kg',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
  },
  {
    id: '3',
    name: 'Fresh Tomatoes',
    farmer: 'Anita Devi',
    location: 'Nashik, MH',
    price: '₹40/kg',
    quantity: '100 kg',
    image: 'https://images.unsplash.com/photo-1546470427-227c7369a9b8?w=300&h=200&fit=crop',
  },
  {
    id: '4',
    name: 'Red Onions',
    farmer: 'Mohan Singh',
    location: 'Lasalgaon, MH',
    price: '₹30/kg',
    quantity: '200 kg',
    image: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=300&h=200&fit=crop',
  },
];

const recentOrders = [
  { id: 'ORD101', farmer: 'Rajesh Kumar', crop: 'Wheat', qty: '50 kg', amount: '₹2,500', status: 'in-transit' },
  { id: 'ORD102', farmer: 'Suresh Patel', crop: 'Rice', qty: '30 kg', amount: '₹2,400', status: 'delivered' },
  { id: 'ORD103', farmer: 'Anita Devi', crop: 'Tomatoes', qty: '10 kg', amount: '₹400', status: 'pending' },
];

const statusColors: Record<string, string> = {
  'pending': 'bg-warning/10 text-warning',
  'in-transit': 'bg-primary/10 text-primary',
  'delivered': 'bg-success/10 text-success',
  'cancelled': 'bg-destructive/10 text-destructive',
};

export default function BuyerDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Hello, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Find fresh produce directly from farmers.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="dashboard-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search crops, farmers, locations..."
                className="pl-10"
              />
            </div>
            <Button variant="default">Search</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-success" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xs text-success mt-1">{stat.change}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Crops */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Featured Crops</h2>
            <Link to="/buyer/browse">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredCrops.map((crop) => (
              <div key={crop.id} className="dashboard-card overflow-hidden group">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={crop.image}
                    alt={crop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{crop.name}</h3>
                  <p className="text-sm text-muted-foreground">{crop.farmer}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {crop.location}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-primary">{crop.price}</span>
                    <span className="text-sm text-muted-foreground">{crop.quantity} available</span>
                  </div>
                  <Button variant="default" className="w-full mt-3" size="sm">
                    Order Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
              <Link to="/buyer/orders">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Farmer</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Crop</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-4 font-medium text-foreground">{order.id}</td>
                    <td className="p-4 text-foreground">{order.farmer}</td>
                    <td className="p-4 text-foreground">{order.crop}</td>
                    <td className="p-4 text-muted-foreground">{order.qty}</td>
                    <td className="p-4 font-medium text-foreground">{order.amount}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>
                        {order.status.replace('-', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/buyer/wallet" className="dashboard-card p-6 hover:shadow-hover transition-shadow">
            <Wallet className="w-10 h-10 text-primary mb-4" />
            <h3 className="font-semibold text-foreground">Wallet</h3>
            <p className="text-sm text-muted-foreground">Add money and pay farmers</p>
          </Link>
          <Link to="/buyer/browse" className="dashboard-card p-6 hover:shadow-hover transition-shadow">
            <Package className="w-10 h-10 text-secondary mb-4" />
            <h3 className="font-semibold text-foreground">Browse Crops</h3>
            <p className="text-sm text-muted-foreground">Find fresh produce</p>
          </Link>
          <Link to="/buyer/orders" className="dashboard-card p-6 hover:shadow-hover transition-shadow">
            <ShoppingCart className="w-10 h-10 text-accent mb-4" />
            <h3 className="font-semibold text-foreground">My Orders</h3>
            <p className="text-sm text-muted-foreground">Track your orders</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
