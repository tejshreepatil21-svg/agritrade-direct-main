import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, BarChart3, Users, Sprout, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setError(null);
            const response = await adminAPI.getAnalytics();
            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError('Failed to load analytics data');
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError('An error occurred while loading analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-96 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="flex h-96 items-center justify-center">
                    <Card className="border-destructive">
                        <CardContent className="pt-6 text-center">
                            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                            <p className="text-lg font-semibold text-destructive mb-2">Error Loading Analytics</p>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <button 
                                onClick={() => fetchData()}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            >
                                Retry
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    if (!data) {
        return (
            <DashboardLayout>
                <div className="flex h-96 items-center justify-center">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-muted-foreground">No analytics data available</p>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    // Transform dailyStats for charts
    const chartData = data.dailyStats.map(item => ({
        ...item,
        date: format(new Date(item._id), 'dd MMM')
    }));

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-6">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                        Platform Analytics
                    </h1>
                    <p className="text-muted-foreground mt-1">Insights into platform performance and user activity</p>
                </div>

                {/* Orders & Revenue Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Order Trends (30 Days)</CardTitle>
                            <CardDescription>Daily order volume</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Revenue Trends</CardTitle>
                            <CardDescription>Daily transaction value</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip
                                        formatter={(value) => [`₹${value}`, 'Revenue']}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Performers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Top Selling Crops</CardTitle>
                                <CardDescription>By quantity sold</CardDescription>
                            </div>
                            <Sprout className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.topCrops.map((crop, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-xs">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{crop.name}</p>
                                                <p className="text-xs text-muted-foreground">{crop.totalSold} units sold</p>
                                            </div>
                                        </div>
                                        <div className="font-semibold text-sm">₹{crop.revenue.toLocaleString()}</div>
                                    </div>
                                ))}
                                {data.topCrops.length === 0 && <div className="text-center text-sm text-gray-500 py-4">No data available</div>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Top Farmers</CardTitle>
                                <CardDescription>By total revenue generated</CardDescription>
                            </div>
                            <Users className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.topFarmers.map((farmer, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{farmer.name}</p>
                                                <p className="text-xs text-muted-foreground">{farmer.ordersCount} orders</p>
                                            </div>
                                        </div>
                                        <div className="font-semibold text-sm">₹{farmer.totalRevenue.toLocaleString()}</div>
                                    </div>
                                ))}
                                {data.topFarmers.length === 0 && <div className="text-center text-sm text-gray-500 py-4">No data available</div>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Distribution & Buyer Activity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Order Status</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.orderStatus}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="_id"
                                    >
                                        {data.orderStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Placeholder for more analytics */}
                    <Card className="md:col-span-2 flex items-center justify-center bg-gray-50 border-dashed">
                        <div className="text-center text-muted-foreground">
                            <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p>More detailed analytics coming soon...</p>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
