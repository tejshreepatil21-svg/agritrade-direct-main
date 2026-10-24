import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import {
    Sprout,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Trash,
    Eye,
    MoreVertical,
    Loader2,
    Calendar,
    MapPin,
    AlertTriangle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

export default function AdminCrops() {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const { toast } = useToast();
    const { confirm, ConfirmDialog } = useConfirmDialog();

    // Modal State
    const [viewCrop, setViewCrop] = useState(null);

    useEffect(() => {
        fetchCrops();
    }, [filterStatus]);

    const fetchCrops = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getCrops({ status: filterStatus, search: searchTerm });
            if (response.success) {
                setCrops(response.data);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to fetch crops",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCrops();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleStatusUpdate = async (id, status) => {
        try {
            const response = await adminAPI.updateCropStatus(id, status);
            if (response.success) {
                toast({
                    title: "Success",
                    description: `Crop marked as ${status}`,
                });
                fetchCrops();
                setViewCrop(null);
            }
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: "Delete Crop Listing",
            description: "Are you sure you want to delete this crop listing? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {
            const response = await adminAPI.deleteCrop(id);
            if (response.success) {
                toast({ title: "Success", description: "Crop deleted successfully" });
                fetchCrops();
                setViewCrop(null);
            }
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'pending_approval': return 'bg-yellow-100 text-yellow-700';
            case 'out_of_stock': return 'bg-gray-100 text-gray-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'sold': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
                            <Sprout className="h-8 w-8 text-green-600" />
                            Crop Moderation
                        </h1>
                        <p className="text-muted-foreground mt-1">Review, approve, or reject farmer listings</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by crop name..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                        {['all', 'pending_approval', 'active', 'rejected', 'out_of_stock'].map((status) => (
                            <Button
                                key={status}
                                variant={filterStatus === status ? "default" : "outline"}
                                onClick={() => setFilterStatus(status)}
                                className="whitespace-nowrap capitalize"
                            >
                                {status.replace('_', ' ')}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Crops Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                    </div>
                ) : crops.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 border border-dashed rounded-xl">
                        No crops found matching your criteria.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {crops.map((crop) => (
                            <div key={crop._id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all group">
                                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                    {crop.image ? (
                                        <img src={crop.image} alt={crop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <Sprout className="h-12 w-12" />
                                        </div>
                                    )}
                                    <Badge className={`absolute top-3 right-3 ${getStatusColor(crop.status)}`}>
                                        {crop.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{crop.name}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{crop.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-700">₹{crop.pricePerUnit}/{crop.unit}</p>
                                            <p className="text-xs text-gray-500">{crop.quantity} {crop.unit} avail</p>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t flex flex-col gap-1 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                {crop.farmerId?.name?.charAt(0)}
                                            </div>
                                            <span className="truncate">{crop.farmerId?.name || 'Unknown Farmer'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span className="truncate">{crop.location || crop.farmerId?.address || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>Listed: {format(new Date(crop.createdAt), 'PP')}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setViewCrop(crop)}>
                                            <Eye className="h-4 w-4 mr-2" /> View
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="px-2">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(crop._id, 'active')}>
                                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Approve
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(crop._id, 'rejected')}>
                                                    <XCircle className="h-4 w-4 mr-2 text-red-600" /> Reject
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(crop._id)}>
                                                    <Trash className="h-4 w-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Detail Modal */}
                <Dialog open={!!viewCrop} onOpenChange={(open) => !open && setViewCrop(null)}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Crop Details</DialogTitle>
                            <DialogDescription>Review listing details before taking action.</DialogDescription>
                        </DialogHeader>

                        {viewCrop && (
                            <div className="space-y-6">
                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                    {viewCrop.image ? (
                                        <img src={viewCrop.image} alt={viewCrop.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <Sprout className="h-16 w-16" />
                                            <span className="ml-2">No Image Provided</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-500 text-sm">Crop Information</h3>
                                        <p className="font-medium text-lg">{viewCrop.name}</p>
                                        <p className="text-sm text-gray-600 capitalize">Category: {viewCrop.category}</p>
                                        <p className="text-sm text-gray-600">Harvest Date: {format(new Date(viewCrop.harvestDate), 'PP')}</p>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="font-semibold text-gray-500 text-sm">Pricing & Stock</h3>
                                        <p className="font-bold text-xl text-green-700">₹{viewCrop.pricePerUnit}/{viewCrop.unit}</p>
                                        <p className="text-sm text-gray-600">Total Qty: {viewCrop.quantity} {viewCrop.unit}</p>
                                        <p className="text-sm text-gray-600">Remaining: {viewCrop.remainingQuantity} {viewCrop.unit}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                    <h3 className="font-semibold text-gray-900">Farmer Details</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            {viewCrop.farmerId?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{viewCrop.farmerId?.name}</p>
                                            <p className="text-sm text-gray-500">{viewCrop.farmerId?.email}</p>
                                            <p className="text-sm text-gray-500">{viewCrop.farmerId?.phone || 'No Phone'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-1">
                                        <MapPin className="h-4 w-4" />
                                        {viewCrop.location || viewCrop.farmerId?.address || 'Location not specified'}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Description</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {viewCrop.description || "No description provided."}
                                    </p>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setViewCrop(null)}>Close</Button>
                            {viewCrop?.status !== 'active' && (
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(viewCrop._id, 'active')}>
                                    <CheckCircle className="h-4 w-4 mr-2" /> Approve Listing
                                </Button>
                            )}
                            {viewCrop?.status !== 'rejected' && (
                                <Button variant="destructive" onClick={() => handleStatusUpdate(viewCrop._id, 'rejected')}>
                                    <XCircle className="h-4 w-4 mr-2" /> Reject
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <ConfirmDialog />
            </div>
        </DashboardLayout>
    );
}
