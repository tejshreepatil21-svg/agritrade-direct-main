import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { farmerAPI } from "@/lib/api";
import { format } from "date-fns";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Eye, Check, X, Filter } from "lucide-react";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterDate, setFilterDate] = useState('all'); // all, today, this_week, this_month
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await farmerAPI.getOrders();
            if (response.success) {
                setOrders(response.data);
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

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await farmerAPI.updateOrderStatus(orderId, newStatus);
            toast({ title: "Success", description: `Order ${newStatus} successfully` });
            fetchOrders();
            // Close modal if open
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder(null);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update order status",
                variant: "destructive"
            });
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
            default: return <Badge className="bg-gray-500">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
                        <p className="text-gray-600 mt-1">View and manage incoming crop orders</p>
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
                        <p className="text-gray-500">No orders found.</p>
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
                                            <p className="font-medium text-gray-900">Quantity: {order.quantity} units</p>
                                            <p className="font-bold text-green-600 text-lg">Total: ₹{order.totalAmount}</p>
                                            <div className="flex gap-2 justify-end">
                                                <Badge variant="outline" className={order.paymentStatus === 'paid' ? 'text-green-600 border-green-600' : 'text-yellow-600 border-yellow-600'}>
                                                    Payment: {order.paymentStatus?.toUpperCase() || 'PENDING'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                        <Eye className="h-4 w-4 mr-1" /> View
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Order Details</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p className="font-semibold text-gray-500">Dryer/Buyer Details</p>
                                                                <p className="font-medium">{order.buyerId?.name}</p>
                                                                <p>{order.buyerId?.email}</p>
                                                                <p>{order.buyerId?.phone}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-500">Order Info</p>
                                                                <p>Crop: {order.cropId?.name}</p>
                                                                <p>Qty: {order.quantity}</p>
                                                                <p>Total: ₹{order.totalAmount}</p>
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t flex justify-end">
                                                            {order.paymentStatus === 'paid' && (
                                                                <Button variant="outline" size="sm" onClick={() => navigate(`/farmer/orders/${order._id}/invoice`)}>
                                                                    View Invoice
                                                                </Button>
                                                            )}
                                                        </div>

                                                        {order.status === 'pending' && (
                                                            <div className="flex gap-4 pt-4 border-t justify-center">
                                                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(order._id, 'accepted')}>
                                                                    <Check className="h-4 w-4 mr-2" /> Accept Order
                                                                </Button>
                                                                <Button variant="destructive" onClick={() => handleUpdateStatus(order._id, 'rejected')}>
                                                                    <X className="h-4 w-4 mr-2" /> Reject Order
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {order.status === 'accepted' && (
                                                            <div className="flex gap-4 pt-4 border-t justify-center">
                                                                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleUpdateStatus(order._id, 'completed')}>
                                                                    Mark as Completed
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            {order.status === 'pending' && (
                                                <>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(order._id, 'accepted')}>
                                                        Accept
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(order._id, 'rejected')}>
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {order.paymentStatus === 'paid' && (
                                                <Button size="sm" variant="secondary" onClick={() => navigate(`/farmer/orders/${order._id}/invoice`)}>
                                                    Invoice
                                                </Button>
                                            )}
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

export default Orders;
