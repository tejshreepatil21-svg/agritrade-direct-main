import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, ArrowLeft, Sprout } from 'lucide-react';
import { format } from 'date-fns';

const Invoice = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const data = await orderAPI.getInvoice(orderId);
                setInvoice(data);
            } catch (err) {
                console.error("Failed to fetch invoice data", err);
                setError("Could not load invoice details.");
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [orderId]);

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

    if (error || !invoice) {
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
            <div className="container mx-auto px-8 py-10 bg-white shadow-lg max-w-4xl print:shadow-none print:w-full print:max-w-none">
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
                        <h2 className="text-3xl font-bold text-gray-400 mb-2">INVOICE</h2>
                        <p className="text-gray-600"><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                        <p className="text-gray-600"><strong>Date:</strong> {format(new Date(invoice.date || invoice.createdAt), 'PPP')}</p>
                        {/* Status is not in Invoice model explicit status field, but implicit 'paid' if invoice exists usually. 
                            However, order likely fully paid if invoice generated? 
                            Let's assume PAID for now based on requirement "When payment is completed... Generate invoice".
                        */}
                        <p className="text-green-600 font-semibold mt-2 bg-green-50 px-3 py-1 inline-block rounded">
                            PAID
                        </p>
                    </div>
                </div>

                {/* Bill To & From */}
                <div className="flex justify-between mb-10 gap-8">
                    <div className="w-1/2">
                        <h3 className="text-gray-500 font-semibold text-sm uppercase mb-2">Billed To (Buyer)</h3>
                        <p className="font-bold text-gray-900">{invoice.billingDetails?.name || "N/A"}</p>
                        <p className="text-gray-600 text-sm">{invoice.billingDetails?.email}</p>
                        <p className="text-gray-600 text-sm">{invoice.billingDetails?.address || "Address not provided"}</p>
                        <p className="text-gray-600 text-sm">{invoice.billingDetails?.phone || ""}</p>
                    </div>
                    <div className="w-1/2 text-right">
                        <h3 className="text-gray-500 font-semibold text-sm uppercase mb-2">Supplier (Farmer)</h3>
                        <p className="font-bold text-gray-900">{invoice.supplierDetails?.name || "N/A"}</p>
                        <p className="text-gray-600 text-sm">{invoice.supplierDetails?.email}</p>
                        <p className="text-gray-600 text-sm">{invoice.supplierDetails?.address || "Address not provided"}</p>
                        <p className="text-gray-600 text-sm">{invoice.supplierDetails?.phone || ""}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="mb-10">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 text-left text-sm uppercase tracking-wider">
                                <th className="p-4 border font-semibold">Item Description</th>
                                <th className="p-4 border font-semibold text-right">Quantity</th>
                                <th className="p-4 border font-semibold text-right">Unit Price</th>
                                <th className="p-4 border font-semibold text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {invoice.items && invoice.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="p-4 border">
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.description}</p>
                                    </td>
                                    <td className="p-4 border text-right">{item.quantity} units</td>
                                    <td className="p-4 border text-right">₹{item.unitPrice.toFixed(2)}</td>
                                    <td className="p-4 border text-right font-medium">₹{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="flex justify-end mb-12">
                    <div className="w-64">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">₹{invoice.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Platform Fee:</span>
                            <span className="font-medium">₹0.00</span>
                        </div>
                        <div className="flex justify-between py-3 border-b-2 border-gray-900">
                            <span className="font-bold text-xl text-gray-900">Total:</span>
                            <span className="font-bold text-xl text-green-700">₹{invoice.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-8 border-t text-center text-gray-500 text-sm">
                    <p className="mb-2">Thank you for choosing AgriTrade!</p>
                    <p>For any queries, please contact support@agritrade.com</p>
                    <p className="mt-4 text-xs text-gray-400">Computer generated invoice. No signature required.</p>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 20px; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
};

export default Invoice;
