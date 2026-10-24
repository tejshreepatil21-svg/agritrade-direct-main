import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { buyerAPI, orderAPI } from "@/lib/api";
import { Search, Package, MapPin, ShoppingCart, Loader2, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const BrowseCrops = () => {
    const { user } = useAuth();
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [orderQuantity, setOrderQuantity] = useState('');
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const { toast } = useToast();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCrops();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, categoryFilter]);

    const categories = [
        'cereals', 'pulses', 'vegetables', 'fruits', 'spices', 'oils', 'dairy', 'other'
    ];

    const fetchCrops = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (search) filters.search = search;
            if (categoryFilter !== 'all') filters.category = categoryFilter;

            const response = await buyerAPI.browseCrops(filters);
            if (response.success) {
                setCrops(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch crops', error);
            // Don't show toast for every keystroke error in debounce
        } finally {
            setLoading(false);
        }
    };

    const handleBuyClick = (crop) => {
        setSelectedCrop(crop);
        setIsOrderOpen(true);
        setOrderQuantity('');
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!orderQuantity || parseFloat(orderQuantity) <= 0) {
            toast({ title: "Invalid Quantity", description: "Please enter a valid quantity", variant: "destructive" });
            return;
        }

        if (parseFloat(orderQuantity) > selectedCrop.remainingQuantity) {
            toast({ title: "Invalid Quantity", description: "Quantity exceeds available stock", variant: "destructive" });
            return;
        }

        try {
            setPlacingOrder(true);
            await orderAPI.createOrder({
                cropId: selectedCrop._id,
                farmerId: selectedCrop.farmerId,
                quantity: parseFloat(orderQuantity),
                totalAmount: parseFloat(orderQuantity) * selectedCrop.pricePerUnit
            });

            toast({ title: "Order Placed", description: "Your order has been placed successfully!" });
            setIsOrderOpen(false);
            fetchCrops(); // Refresh stock
        } catch (error) {
            toast({
                title: "Order Failed",
                description: error.message || "Failed to place order",
                variant: "destructive"
            });
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Browse Crops</h1>
                        <p className="text-gray-600 mt-1">Direct from farmers to you</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by crop name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Crop Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : crops.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
                        <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No crops found</h3>
                        <p className="text-gray-500">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {crops.map((crop) => (
                            <Card key={crop._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                <div className="relative h-48 bg-gray-100 group">
                                    <img
                                        src={crop.image || "https://placehold.co/600x400?text=No+Image"}
                                        alt={crop.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <Badge className="absolute top-2 right-2 bg-green-500">
                                        ₹{crop.pricePerUnit}/{crop.unit ? crop.unit.charAt(0).toUpperCase() + crop.unit.slice(1) : 'Kg'}
                                    </Badge>
                                </div>
                                <CardContent className="p-4">
                                    <div className="mb-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{crop.name}</h3>
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">
                                                {crop.category}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{crop.description}</p>
                                    </div>

                                    <div className="space-y-2 text-sm mt-3 pt-3 border-t">
                                        <div className="flex items-center text-gray-600">
                                            <Package className="w-4 h-4 mr-2" />
                                            <span>Available: <b>{crop.remainingQuantity} {crop.unit ? crop.unit.charAt(0).toUpperCase() + crop.unit.slice(1) : 'Kg'}</b></span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>Harvest: {new Date(crop.harvestDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span className="truncate">{crop.location}</span>
                                        </div>
                                        {crop.farmerDetails && (
                                            <div className="text-xs bg-slate-50 p-2 rounded mt-2 border border-slate-100">
                                                <p className="font-medium text-slate-700">Farmer: {crop.farmerDetails.name}</p>
                                            </div>
                                        )}
                                    </div>

                                    <Button className="w-full mt-4" onClick={() => handleBuyClick(crop)}>
                                        <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Buy Dialog */}
                <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Place Order</DialogTitle>
                        </DialogHeader>
                        {selectedCrop && (
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/30 rounded-lg flex gap-4">
                                    <div className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                        <img src={selectedCrop.image || "https://placehold.co/100"} alt="" className="h-full w-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold">{selectedCrop.name}</p>
                                        <p className="text-sm text-muted-foreground">Price: ₹{selectedCrop.pricePerUnit}/{selectedCrop.unit ? selectedCrop.unit.charAt(0).toUpperCase() + selectedCrop.unit.slice(1) : 'Kg'}</p>
                                        <p className="text-sm text-muted-foreground">Available: {selectedCrop.remainingQuantity} {selectedCrop.unit ? selectedCrop.unit.charAt(0).toUpperCase() + selectedCrop.unit.slice(1) : 'Kg'}</p>
                                        {!selectedCrop.isSubscribed && (
                                            <p className="text-xs text-orange-500 mt-1">Upgrade to Premium to see farmer details.</p>
                                        )}
                                    </div>
                                </div>

                                <form onSubmit={handlePlaceOrder} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="order-qty">Order Quantity ({selectedCrop.unit ? selectedCrop.unit.charAt(0).toUpperCase() + selectedCrop.unit.slice(1) : 'Kg'})</Label>
                                        <Input
                                            id="order-qty"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            max={selectedCrop.remainingQuantity}
                                            value={orderQuantity}
                                            onChange={(e) => setOrderQuantity(e.target.value)}
                                            required
                                        />
                                        {orderQuantity && !isNaN(orderQuantity) && (
                                            <p className="text-sm font-medium text-right text-green-600">
                                                Total: ₹{(parseFloat(orderQuantity) * parseFloat(selectedCrop.pricePerUnit)).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsOrderOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={placingOrder}>
                                            {placingOrder ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Confirm Order
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default BrowseCrops;
