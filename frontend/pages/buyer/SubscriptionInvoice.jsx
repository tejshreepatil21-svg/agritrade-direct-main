import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buyerAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, ArrowLeft, Sprout } from 'lucide-react';
import { format } from 'date-fns';

const SubscriptionInvoice = () => {
    const { transactionId } = useParams();
    const navigate = useNavigate();
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await buyerAPI.getSubscriptionDetails(transactionId);
                // The API returns { success: true, data: { ... } }
                if (response.success) {
                    setInvoiceData(response.data);
                } else {
                    setError("Failed to load invoice details");
                }
            } catch (err) {
                console.error("Failed to fetch subscription invoice data", err);
                setError("Could not load invoice details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [transactionId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (error || !invoiceData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-red-500">{error || "Invoice not found"}</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:p-0">
            {/* Action Bar - Hidden in Print */}
            <div className="container mx-auto px-4 mb-6 flex justify-between items-center print:hidden">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700">
                    <Printer className="mr-2 h-4 w-4" /> Print / Download PDF
                </Button>
            </div>

            {/* Invoice Container */}
            <div className="container mx-auto px-8 py-10 bg-white shadow-lg max-w-3xl print:shadow-none print:w-full print:max-w-none">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-8 mb-8">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <Sprout className="h-8 w-8 text-green-600" />
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AgriTrade</h1>
                        </div>
                        <p className="text-gray-500 text-sm">Digital Agriculture Marketplace</p>
                        <div className="text-gray-500 text-sm mt-2">
                            <p>123 Farming Lane</p>
                            <p>AgriCity, India 400001</p>
                            <p>support@agritrade.com</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-gray-400 mb-2 uppercase">Subscription Invoice</h2>
                        <p className="text-gray-600"><strong>Invoice #:</strong> {invoiceData.transactionId}</p>
                        <p className="text-gray-600"><strong>Date:</strong> {format(new Date(invoiceData.createdAt), 'PPP')}</p>
                    </div>
                </div>

                {/* Bill To */}
                <div className="mb-10">
                    <h3 className="text-gray-500 font-semibold text-sm uppercase mb-3 border-b pb-1 inline-block">Billed To</h3>
                    <div className="text-gray-800">
                        <p className="font-bold text-lg">{invoiceData.buyerId?.name || "N/A"}</p>
                        <p className="text-sm">{invoiceData.buyerId?.email}</p>
                        <p className="text-sm">{invoiceData.buyerId?.phone || "Phone not provided"}</p>
                        <p className="text-xs text-gray-500 mt-1">Buyer ID: {invoiceData.buyerId?._id}</p>
                    </div>
                </div>

                {/* Subscription Details Table */}
                <div className="mb-10">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 text-left text-sm uppercase tracking-wider">
                                <th className="p-4 border font-semibold">Description</th>
                                <th className="p-4 border font-semibold">Details</th>
                                <th className="p-4 border font-semibold text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            <tr>
                                <td className="p-4 border align-top">
                                    <p className="font-bold text-gray-900">{invoiceData.planDetails?.name || "Subscription Plan"}</p>
                                    <p className="text-xs text-gray-500">Premium Membership Access</p>
                                </td>
                                <td className="p-4 border align-top text-sm">
                                    <p><span className="font-medium">Duration:</span> {invoiceData.planDetails?.duration}</p>
                                    <p><span className="font-medium">Start:</span> {format(new Date(invoiceData.startDate), 'PP')}</p>
                                    <p><span className="font-medium">End:</span> {format(new Date(invoiceData.endDate), 'PP')}</p>
                                    <p className="mt-1">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${invoiceData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {invoiceData.status.toUpperCase()}
                                        </span>
                                    </p>
                                </td>
                                <td className="p-4 border text-right font-medium align-top">
                                    ₹{invoiceData.amount.toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Payment & Summary */}
                <div className="flex flex-col md:flex-row justify-between mb-12 gap-8">
                    <div className="w-full md:w-1/2 bg-gray-50 p-6 rounded-lg print:bg-white print:border print:p-4">
                        <h3 className="text-gray-900 font-bold mb-4 text-sm uppercase">Payment Details</h3>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-medium text-gray-900">{invoiceData.paymentMethod || "N/A"}</span>

                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-medium text-gray-900 break-all">{invoiceData.transactionId}</span>

                            <span className="text-gray-600">Paid On:</span>
                            <span className="font-medium text-gray-900">{format(new Date(invoiceData.createdAt), 'PPP p')}</span>
                        </div>
                    </div>

                    <div className="w-full md:w-1/3">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">₹{invoiceData.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Tax params (0%):</span>
                            <span className="font-medium">₹0.00</span>
                        </div>
                        <div className="flex justify-between py-3 border-b-2 border-gray-900 mt-2">
                            <span className="font-bold text-xl text-gray-900">Total:</span>
                            <span className="font-bold text-xl text-green-700">₹{invoiceData.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-8 border-t text-center text-gray-500 text-sm">
                    <p className="mb-2 font-medium text-gray-700">Thank you for subscribing to AgriTrade Premium!</p>
                    <p>For any support, please email us at <a href="mailto:support@agritrade.com" className="text-blue-600 hover:underline">support@agritrade.com</a></p>
                    <p className="mt-8 text-xs text-gray-400">Computer generated invoice. No signature required.</p>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { -webkit-print-color-adjust: exact; padding: 20px; }
                    .container { max-width: 100% !important; box-shadow: none !important; }
                }
            `}</style>
        </div>
    );
};

export default SubscriptionInvoice;