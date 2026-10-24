import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Phone,
    Building,
    Briefcase,
    CreditCard,
    Mail,
    Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminBuyers() {
    const [buyers, setBuyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBuyer, setSelectedBuyer] = useState(null);

    useEffect(() => {
        fetchBuyers();
    }, []);

    const fetchBuyers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getUsers('buyer');
            if (response.success) {
                setBuyers(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch buyers", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBuyers = buyers.filter(buyer =>
        buyer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                            <Users className="h-8 w-8 text-blue-600" />
                            Manage Buyers
                        </h1>
                        <p className="text-muted-foreground mt-1">View and manage all registered buyers</p>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name, email or business..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" /> Filters
                    </Button>
                </div>

                {/* Buyers List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    </div>
                ) : filteredBuyers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-500">
                        No buyers found matching your criteria.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBuyers.map((buyer) => (
                            <div key={buyer._id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border border-blue-100">
                                            <AvatarImage src={buyer.profileImage} />
                                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xl">
                                                {buyer.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{buyer.name}</h3>
                                            <p className="text-sm text-gray-500">{buyer.businessName || 'Individual Buyer'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="h-4 w-4" />
                                        {buyer.email}
                                    </div>
                                    {buyer.isSubscribed ? (
                                        <div className="flex items-center gap-2 text-sm text-yellow-600 font-medium">
                                            <CreditCard className="h-4 w-4" />
                                            Premium Member ({buyer.subscriptionPlan})
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <CreditCard className="h-4 w-4" />
                                            Free Plan
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <Badge variant={buyer.isVerified ? "default" : "secondary"} className={buyer.isVerified ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}>
                                        {buyer.isVerified ? (
                                            <><CheckCircle className="h-3 w-3 mr-1" /> Verified</>
                                        ) : (
                                            <><AlertTriangle className="h-3 w-3 mr-1" /> Pending</>
                                        )}
                                    </Badge>

                                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setSelectedBuyer(buyer)}>View Details</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Buyer Details Dialog */}
                <Dialog open={!!selectedBuyer} onOpenChange={(open) => !open && setSelectedBuyer(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Buyer Details</DialogTitle>
                        </DialogHeader>
                        {selectedBuyer && (
                            <ScrollArea className="max-h-[80vh]">
                                <div className="space-y-6 p-1">
                                    {/* Profile Header */}
                                    <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-xl">
                                        <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                                            <AvatarImage src={selectedBuyer.profileImage} />
                                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-3xl">
                                                {selectedBuyer.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="text-2xl font-bold">{selectedBuyer.name}</h2>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="bg-white">
                                                    {selectedBuyer.businessName || 'Individual Buyer'}
                                                </Badge>
                                                {selectedBuyer.isSubscribed && (
                                                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none">
                                                        Premium Member
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Contact Info */}
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2 text-primary">
                                                <Users className="h-4 w-4" /> Contact Information
                                            </h3>
                                            <div className="bg-white p-4 rounded-lg border space-y-3 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">Email:</span>
                                                    <span className="font-medium ml-auto select-all">{selectedBuyer.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">Phone:</span>
                                                    <span className="font-medium ml-auto select-all">{selectedBuyer.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Business Info */}
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2 text-primary">
                                                <Building className="h-4 w-4" /> Business Profile
                                            </h3>
                                            <div className="bg-white p-4 rounded-lg border space-y-3 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">Business Name:</span>
                                                    <span className="font-medium ml-auto">{selectedBuyer.businessName || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-gray-600 ml-7">GST Number:</span>
                                                    <span className="font-medium ml-auto">{selectedBuyer.gstNumber || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Subscription Details */}
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2 text-primary">
                                                <CreditCard className="h-4 w-4" /> Subscription
                                            </h3>
                                            <div className="bg-white p-4 rounded-lg border space-y-3 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-gray-600">Plan:</span>
                                                    <span className="font-medium ml-auto capitalize">{selectedBuyer.subscriptionPlan || 'Free'}</span>
                                                </div>
                                                {selectedBuyer.isSubscribed && (
                                                    <>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-gray-600">Start Date:</span>
                                                            <span className="font-medium ml-auto">{selectedBuyer.subscriptionStart ? format(new Date(selectedBuyer.subscriptionStart), 'PP') : 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-gray-600">Expires On:</span>
                                                            <span className="font-medium ml-auto">{selectedBuyer.subscriptionEnd ? format(new Date(selectedBuyer.subscriptionEnd), 'PP') : 'N/A'}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* System Status */}
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2 text-primary">
                                                <CheckCircle className="h-4 w-4" /> System Status
                                            </h3>
                                            <div className="bg-white p-4 rounded-lg border space-y-3 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-gray-600">Joined On:</span>
                                                    <span className="font-medium ml-auto">{selectedBuyer.createdAt ? format(new Date(selectedBuyer.createdAt), 'PPP') : 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-gray-600">Verification:</span>
                                                    <Badge variant={selectedBuyer.isVerified ? "default" : "secondary"} className="ml-auto">
                                                        {selectedBuyer.isVerified ? "Verified" : "Pending"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                                        <Button variant="outline" onClick={() => setSelectedBuyer(null)}>Close</Button>
                                    </div>
                                </div>
                            </ScrollArea>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
