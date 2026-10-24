import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { walletAPI, userAPI, buyerAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

import {
    Wallet,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    CheckCircle2,
    AlertCircle,
    History,
    Send
} from 'lucide-react';

const TRANSACTION_TYPES = {
    CREDIT: 'credit',
    DEBIT: 'debit'
};

export default function BuyerWallet() {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [activeTab, setActiveTab] = useState('add-money');

    // Add Money State
    const [addAmount, setAddAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessingAdd, setIsProcessingAdd] = useState(false);

    // Pay Farmer State
    const [listings, setListings] = useState([]);
    const [selectedListing, setSelectedListing] = useState('');
    const [payAmount, setPayAmount] = useState('');
    const [isProcessingPay, setIsProcessingPay] = useState(false);
    const [farmerSearch, setFarmerSearch] = useState('');

    useEffect(() => {
        fetchWalletData();
        fetchListings();
    }, []);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const [walletRes, txRes] = await Promise.all([
                walletAPI.getWallet(),
                walletAPI.getTransactions()
            ]);

            // Handle potential different response structures (data wrapper or direct)
            setWallet(walletRes.data || walletRes);
            setTransactions(txRes.data || txRes || []);

        } catch (err) {
            console.error("Wallet fetch error:", err);
            setError("Failed to load wallet information.");
        } finally {
            setLoading(false);
        }
    };

    const fetchListings = async () => {
        try {
            // Fetch buyer's order history to identify valid farmers to pay
            const res = await buyerAPI.getOrders();
            // API returns { success: true, data: [...] } or just direct array? 
            // Checking orderAPI.getOrders in api.js -> calls /orders. 
            // Backend /orders (routes/orders.js) usually returns { success: true, data: [...] }

            const orders = res.data || res || [];

            if (Array.isArray(orders)) {
                // Filter for completed/delivered orders that haven't been paid yet
                const validOrders = orders.filter(order =>
                    ['completed', 'delivered'].includes(order.status) &&
                    order.paymentStatus === 'pending' // Only show unpaid orders
                );

                // Map to usable format
                // Note: Ensure farmerId and cropId are populated objects
                const payableOptions = validOrders.map(order => ({
                    _id: order._id, // using order ID as unique key for selection
                    farmerId: order.farmerId?._id || order.farmerId,
                    farmerName: order.farmerId?.name || 'Unknown Farmer',
                    cropName: order.cropId?.name || 'Unknown Crop',
                    quantity: order.quantity,
                    unit: order.cropId?.unit || 'Kg', // fallback unit
                    pricePerUnit: order.cropId?.pricePerUnit,
                    totalAmount: order.totalAmount, // Trusting the order record
                    // Format for display
                    displayName: `${order.farmerId?.name || 'Unknown'} â€“ ${order.cropId?.name || 'Item'} â€“ ${order.quantity} ${order.cropId?.unit ? (order.cropId.unit.charAt(0).toUpperCase() + order.cropId.unit.slice(1)) : 'Kg'}`
                }));

                setListings(payableOptions);
            }
        } catch (err) {
            console.warn("Failed to fetch past orders for payment list", err);
        }
    };

    const handleAddMoney = async (e) => {
        e.preventDefault();
        if (!addAmount || isNaN(addAmount) || Number(addAmount) <= 0) {
            setError("Please enter a valid amount.");
            return;
        }
        if (!paymentMethod) {
            setError("Please select a payment method.");
            return;
        }

        setIsProcessingAdd(true);
        setError(null);
        setSuccessMsg(null);

        try {
            // Simulation of payment gateway
            await new Promise(resolve => setTimeout(resolve, 1500));

            const res = await walletAPI.addMoney({ amount: Number(addAmount), paymentMethod });

            setWallet(prev => ({ ...prev, balance: (prev?.balance || 0) + Number(addAmount) }));
            setSuccessMsg(`Successfully added â‚¹${addAmount} to your wallet!`);
            setAddAmount('');
            setPaymentMethod('');
            fetchWalletData(); // Refresh to get transaction
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add money. Please try again.");
        } finally {
            setIsProcessingAdd(false);
        }
    };

    const handlePayFarmer = async (e) => {
        e.preventDefault();
        if (!selectedListing) {
            setError("Please select a farmer/crop to pay.");
            return;
        }
        const listing = listings.find(l => l._id === selectedListing);
        if (!listing) {
            setError("Invalid selection.");
            return;
        }

        const amountToPay = listing.totalAmount;

        if (!amountToPay || isNaN(amountToPay) || Number(amountToPay) <= 0) {
            setError("Invalid total amount for this order.");
            return;
        }
        if (Number(amountToPay) > (wallet?.balance || 0)) {
            setError("Insufficient wallet balance.");
            return;
        }

        setIsProcessingPay(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const res = await walletAPI.payFarmer({
                farmerId: listing.farmerId,
                cropId: listing._id,
                orderId: listing._id,
                amount: Number(amountToPay)
            });

            if (res.success) {
                setSuccessMsg(`Successfully paid ₹${amountToPay} to ${listing.farmerName || 'Farmer'}.`);
                setSelectedListing('');
                // setPayAmount(''); // No longer used
                fetchWalletData();
                fetchListings(); // Refresh listings to remove paid farmer/crop
            } else {
                throw new Error(res.message || "Payment failed");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to pay farmer. Please try again.");
        } finally {
            setIsProcessingPay(false);
        }
    };

    const filteredListings = listings.filter(item =>
        (item.displayName || '').toLowerCase().includes(farmerSearch.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6 pb-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
                        <p className="text-gray-500 mt-1">Manage your funds and payments securely</p>
                    </div>

                    {/* Main Balance Card - Always Visible */}
                    <Card className="bg-primary/5 border-primary/20 md:min-w-[300px]">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Available Balance</p>
                                <div className="text-3xl font-bold text-primary">
                                    ₹{(wallet?.balance || 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-full shadow-sm">
                                <Wallet className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Feedback Messages */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {successMsg && (
                    <Alert className="bg-green-50 text-green-900 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription>{successMsg}</AlertDescription>
                    </Alert>
                )}

                {/* Main Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Add Money Section */}
                    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Add Money
                            </CardTitle>
                            <CardDescription>Top up your wallet using secure payment methods</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddMoney} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount (₹)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="Enter amount"
                                            className="pl-8 text-lg"
                                            value={addAmount}
                                            onChange={(e) => setAddAmount(e.target.value)}
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Payment Method</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['PhonePe', 'GPay', 'Paytm'].map((method) => (
                                            <div
                                                key={method}
                                                onClick={() => setPaymentMethod(method)}
                                                className={`cursor-pointer rounded-lg border p-3 text-center text-sm font-medium transition-all ${paymentMethod === method
                                                    ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {method}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base"
                                    disabled={isProcessingAdd}
                                >
                                    {isProcessingAdd ? 'Processing...' : 'Add Money to Wallet'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Pay Farmer Section */}
                    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="w-5 h-5 text-primary" />
                                Pay Farmer
                            </CardTitle>
                            <CardDescription>Directly transfer funds to a farmer's wallet</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePayFarmer} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Farmer</Label>
                                    <Select value={selectedListing} onValueChange={setSelectedListing}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Search farmer..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="p-2 sticky top-0 bg-white z-10 border-b">
                                                <Input
                                                    placeholder="Type farmer or crop name..."
                                                    value={farmerSearch}
                                                    onChange={(e) => setFarmerSearch(e.target.value)}
                                                    className="h-9"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto mt-1">
                                                {filteredListings.length > 0 ? (
                                                    filteredListings.map((item) => (
                                                        <SelectItem key={item._id} value={item._id}>
                                                            <div className="flex flex-col text-left">
                                                                <span className="font-medium">{item.displayName}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-sm text-gray-500">No eligible farmers found</div>
                                                )}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Calculation Breakdown */}
                                {selectedListing && (
                                    <div className="bg-gray-50 p-3 rounded-md space-y-1 text-sm border">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Price:</span>
                                            <span className="font-medium">
                                                ₹{(listings.find(l => l._id === selectedListing)?.pricePerUnit || 0)} / {listings.find(l => l._id === selectedListing)?.unit}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Quantity:</span>
                                            <span className="font-medium">
                                                {listings.find(l => l._id === selectedListing)?.quantity} {listings.find(l => l._id === selectedListing)?.unit}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-1 border-t mt-1">
                                            <span className="text-gray-900 font-semibold">Total Amount:</span>
                                            <span className="text-primary font-bold">
                                                ₹{listings.find(l => l._id === selectedListing)?.totalAmount}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="payAmount">Amount (Auto-calculated)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                        <Input
                                            id="payAmount"
                                            type="number"
                                            placeholder="Auto-calculated"
                                            className="pl-8 text-lg bg-gray-100 cursor-not-allowed"
                                            value={selectedListing ? listings.find(l => l._id === selectedListing)?.totalAmount : ''}
                                            readOnly
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 text-right">
                                        Balance: ₹{(wallet?.balance || 0).toLocaleString()}
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base bg-emerald-600 hover:bg-emerald-700"
                                    disabled={isProcessingPay || !selectedListing || (Number(listings.find(l => l._id === selectedListing)?.totalAmount || 0) > (wallet?.balance || 0))}
                                >
                                    {isProcessingPay ? 'Processing...' : 'Pay Farmer'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions History */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5 text-gray-500" />
                            Transaction History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <History className="w-8 h-8 text-gray-400" />
                                </div>
                                <p>No transactions yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {transactions.map((tx) => (
                                    <div
                                        key={tx._id}
                                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
                      `}>
                                                {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {tx.reference || (tx.type === 'credit' ? 'Money Added' : 'Payment Sent')}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(tx.createdAt).toLocaleDateString()} â€¢ {new Date(tx.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                            </span>
                                            <p className={`text-xs capitalize mt-0.5 ${tx.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                                                }`}>
                                                {tx.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </DashboardLayout>
    );
}