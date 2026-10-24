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
    XCircle,
    AlertTriangle,
    MapPin,
    Calendar,
    Loader2,
    Phone,
    Sprout,
    Home,
    Mail
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

export default function AdminFarmers() {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFarmer, setSelectedFarmer] = useState(null);

    useEffect(() => {
        fetchFarmers();
    }, []);

    const fetchFarmers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getUsers('farmer');
            if (response.success) {
                setFarmers(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch farmers", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFarmers = farmers.filter(farmer =>
        farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
                            <Users className="h-8 w-8 text-green-600" />
                            Manage Farmers
                        </h1>
                        <p className="text-muted-foreground mt-1">View and manage all registered farmers</p>
                    </div>

                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search farmers by name or email..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" /> Filters
                    </Button>
                </div>

                {/* Farmers List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                    </div>
                ) : filteredFarmers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-500">
                        No farmers found matching your criteria.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFarmers.map((farmer) => (
                            <div key={farmer._id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border border-green-100">
                                            <AvatarImage src={farmer.profileImage} />
                                            <AvatarFallback className="bg-green-100 text-green-700 font-bold text-xl">
                                                {farmer.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
                                            <p className="text-sm text-gray-500">{farmer.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="h-4 w-4" />
                                        {farmer.address || farmer.village || 'Location not set'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        Joined {farmer.createdAt ? format(new Date(farmer.createdAt), 'PP') : 'N/A'}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <Badge variant={farmer.isVerified ? "default" : "secondary"} className={farmer.isVerified ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-yellow-100 text-yellow-700"}>
                                        {farmer.isVerified ? (
                                            <><CheckCircle className="h-3 w-3 mr-1" /> Verified</>
                                        ) : (
                                            <><AlertTriangle className="h-3 w-3 mr-1" /> Pending</>
                                        )}
                                    </Badge>

                                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setSelectedFarmer(farmer)}>View Details</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Farmer Details Dialog */}
                <Dialog open={!!selectedFarmer} onOpenChange={(open) => !open && setSelectedFarmer(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Farmer Details</DialogTitle>
                        </DialogHeader>
                        {selectedFarmer && (
                            <ScrollArea className="max-h-[80vh]">
                                <div className="space-y-6 p-1">
                                    {/* Profile Header */}
                                    <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-xl">
                                        <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                                            <AvatarImage src={selectedFarmer.profileImage} />
                                            <AvatarFallback className="bg-green-100 text-green-700 font-bold text-3xl">
                                                {selectedFarmer.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="text-2xl font-bold">{selectedFarmer.name}</h2>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="bg-white">
                                                    {selectedFarmer.role?.toUpperCase()}
                                                </Badge>
                                                <Badge variant={selectedFarmer.isVerified ? "default" : "warning"} className={selectedFarmer.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                                                    {selectedFarmer.isVerified ? "Verified User" : "Verification Pending"}
                                                </Badge>
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
                                                    <span className="font-medium ml-auto select-all">{selectedFarmer.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">Phone:</span>
                                                    <span className="font-medium ml-auto select-all">{selectedFarmer.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2 text-primary">
                                                <MapPin className="h-4 w-4" /> Location Details
                                            </h3>
                                            <div className="bg-white p-4 rounded-lg border space-y-3 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <Home className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">Village:</span>
                                                    <span className="font-medium ml-auto">{selectedFarmer.village || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                                    <span className="text-gray-600">Address:</span>
                                                    <span className="font-medium ml-auto text-right max-w-[60%]">{selectedFarmer.address || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Farming Details */}
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2 text-primary">
                                                <Sprout className="h-4 w-4" /> Farming Profile
                                            </h3>
                                            <div className="bg-white p-4 rounded-lg border space-y-3 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">Farm Size:</span>
                                                    <span className="font-medium ml-auto">{selectedFarmer.farmSize ? `${selectedFarmer.farmSize} Acres` : 'N/A'}</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Sprout className="h-4 w-4 text-gray-400 mt-0.5" />
                                                    <span className="text-gray-600">Primary Crops:</span>
                                                    <div className="ml-auto text-right">
                                                        {selectedFarmer.crops && selectedFarmer.crops.length > 0 ? (
                                                            <div className="flex flex-wrap justify-end gap-1">
                                                                {selectedFarmer.crops.map((c, i) => (
                                                                    <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                                                                ))}
                                                            </div>
                                                        ) : 'None Listed'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Banking/System */}
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2 text-primary">
                                                <CheckCircle className="h-4 w-4" /> System Status
                                            </h3>
                                            <div className="bg-white p-4 rounded-lg border space-y-3 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-gray-600">Joined On:</span>
                                                    <span className="font-medium ml-auto">{selectedFarmer.createdAt ? format(new Date(selectedFarmer.createdAt), 'PPP') : 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-gray-600">Last Login:</span>
                                                    <span className="font-medium ml-auto">{selectedFarmer.lastLogin ? format(new Date(selectedFarmer.lastLogin), 'PPP') : 'Never'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                                        <Button variant="outline" onClick={() => setSelectedFarmer(null)}>Close</Button>
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
