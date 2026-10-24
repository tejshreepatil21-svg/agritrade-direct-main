import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { orderAPI } from "@/lib/api";
import { format } from "date-fns";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Eye, Filter, ShoppingCart, Printer } from "lucide-react";

const BuyerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterDate, setFilterDate] = useState('all');
    const { toast } = useToast();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderAPI.getOrders();
            // orderAPI.getOrders returns the data directly or { success, data } depending on implementation.
            // Based on BuyerDashboard check: 
            // if (Array.isArray(ordersRes)) setRecentOrders(ordersRes);
            // else if (ordersRes.data) setRecentOrders(ordersRes.data);

            if (Array.isArray(response)) {
                setOrders(response);
            } else if (response.data && Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
            toast({
                title: "Error",
                description: "Failed to load orders",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filterDate === 'all') return true;
        const orderDate = new Date(order.createdAt);
        const today = new Date();

        if (filterDate === 'today') {
            return orderDate.toDateString() === today.toDateString();
        }
        if (filterDate === 'this_week') {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
        }
        if (filterDate === 'this_month') {
            return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
        }
        return true;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
            case 'accepted': return <Badge className="bg-blue-500">Accepted</Badge>;
            case 'rejected': return <Badge className="bg-red-500">Rejected</Badge>;
            case 'pending': return <Badge className="bg-yellow-500">Pending</Badge>;
            case 'in-transit': return <Badge className="bg-blue-600">In Transit</Badge>;
            case 'cancelled': return <Badge className="bg-gray-500">Cancelled</Badge>;
            default: return <Badge className="bg-gray-500">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Farmer Crops</h1>
                        <p className="text-gray-600 mt-1">Track your purchased crops and orders</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <Select value={filterDate} onValueChange={setFilterDate}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Date Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="this_week">Last 7 Days</SelectItem>
                                <SelectItem value="this_month">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">Loading orders...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                        <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                        <p className="text-gray-500">Browse crops to make your first purchase.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <Card key={order._id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-lg">{order.cropId?.name || 'Unknown Crop'}</span>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <p className="text-sm text-gray-500">Order ID: #{order._id.slice(-6)}</p>
                                            <p className="text-sm text-gray-500">Placed on: {format(new Date(order.createdAt), 'PPP')}</p>
                                        </div>

                                        <div className="text-left md:text-right space-y-1">
                                            <p className="font-medium text-gray-900">Quantity: {order.quantity} {order.cropId?.unit ? order.cropId.unit.charAt(0).toUpperCase() + order.cropId.unit.slice(1) : 'Kg'}</p>
                                            <p className="font-bold text-green-600 text-lg">Total: ₹{order.totalAmount}</p>
                                            <div className="flex gap-2 justify-end">
                                                <Badge variant="outline" className={order.paymentStatus === 'paid' ? 'text-green-600 border-green-600' : 'text-yellow-600 border-yellow-600'}>
                                                    Payment: {order.paymentStatus?.toUpperCase() || 'PENDING'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                            <Button variant="outline" size="sm" onClick={() => window.open(`/buyer/orders/${order._id}/invoice`, '_blank')}>
                                                <Printer className="h-4 w-4 mr-1" /> Invoice
                                            </Button>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                        <Eye className="h-4 w-4 mr-1" /> View Details
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Order Details</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p className="font-semibold text-gray-500">Farmer Details</p>
                                                                <p className="font-medium">{order.farmerId?.name || 'Unknown Farmer'}</p>
                                                                <p className="text-xs text-muted-foreground">{order.farmerId?.address || 'No address'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-500">Order Info</p>
                                                                <p>Crop: {order.cropId?.name}</p>
                                                                <p>Qty: {order.quantity} {order.cropId?.unit ? order.cropId.unit.charAt(0).toUpperCase() + order.cropId.unit.slice(1) : 'Kg'}</p>
                                                                <p>Total: ₹{order.totalAmount}</p>
                                                            </div>
                                                        </div>
                                                        <div className="pt-4 border-t">
                                                            <p className="font-semibold text-gray-500 mb-2">Order Status Timeline</p>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                {getStatusBadge(order.status)}
                                                                <span className="text-muted-foreground">Updated {format(new Date(order.updatedAt), 'PP')}</span>
                                                            </div>
                                                        </div>
                                                        <div className="pt-4 flex justify-end">
                                                            <Button variant="outline" size="sm" onClick={() => window.open(`/buyer/orders/${order._id}/invoice`, '_blank')}>
                                                                <Printer className="h-4 w-4 mr-1" /> View Invoice
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BuyerOrders;
