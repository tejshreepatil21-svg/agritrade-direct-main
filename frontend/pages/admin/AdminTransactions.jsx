import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import {
    TrendingUp,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    CreditCard,
    Download
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all'
    });

    useEffect(() => {
        fetchTransactions();
    }, [filters]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getTransactions(filters);
            if (response.success) {
                setTransactions(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx =>
        tx.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'failed': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                            <TrendingUp className="h-8 w-8 text-emerald-600" />
                            Transactions
                        </h1>
                        <p className="text-muted-foreground mt-1">Monitor all financial activities on the platform</p>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" /> Export Report
                    </Button>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-end lg:items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by User Name or Transaction ID..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4 w-full lg:w-auto">
                        <Select value={filters.type} onValueChange={(val) => setFilters(prev => ({ ...prev, type: val }))}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="credit">Credit / Income</SelectItem>
                                <SelectItem value="debit">Debit / Purchase</SelectItem>
                                <SelectItem value="refund">Refund</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No transactions found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                                    <tr>
                                        <th className="px-6 py-4">Transaction ID</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredTransactions.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                {tx._id.substring(0, 8).toUpperCase()}...
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{tx.userName}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{tx.userRole}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {tx.type === 'credit' ? (
                                                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                                                    )}
                                                    <span className="capitalize">{tx.description || tx.type}</span>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {tx.date ? format(new Date(tx.date), 'PP p') : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="secondary" className={getStatusColor(tx.status)}>
                                                    {tx.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {tx.productName && (
                                                    <div>Crop: {tx.productName}</div>
                                                )}
                                                {tx.farmerName && (
                                                    <div>Farmer: {tx.farmerName}</div>
                                                )}
                                                <div className="mt-1 flex items-center gap-1">
                                                    <CreditCard className="h-3 w-3" /> Wallet
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
