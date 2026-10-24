import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { farmerAPI } from "@/lib/api";
import { Plus, Edit, Trash, Search, Package } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const MyCrops = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        category: 'other',
        quantity: '',
        unit: 'kg',
        pricePerUnit: '',
        description: '',
        harvestDate: '',
        location: '',
        image: ''
    });

    const categories = [
        'cereals', 'pulses', 'vegetables', 'fruits', 'spices', 'oils', 'dairy', 'other'
    ];

    useEffect(() => {
        fetchCrops();
    }, [search, categoryFilter, statusFilter]);

    const fetchCrops = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (search) filters.search = search;
            if (categoryFilter !== 'all') filters.category = categoryFilter;
            if (statusFilter !== 'all') filters.status = statusFilter;

            const response = await farmerAPI.getCrops(filters);
            if (response.success) {
                setCrops(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch crops', error);
            toast({
                title: "Error",
                description: "Failed to load crops",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (value) => {
        setFormData(prev => ({ ...prev, category: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedCrop) {
                await farmerAPI.updateCrop(selectedCrop._id, formData);
                toast({ title: "Success", description: "Crop updated successfully" });
            } else {
                await farmerAPI.addCrop(formData);
                toast({ title: "Success", description: "Crop added successfully" });
            }
            setIsAddOpen(false);
            setIsEditOpen(false);
            resetForm();
            fetchCrops();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Operation failed",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this crop?")) return;
        try {
            await farmerAPI.deleteCrop(id);
            toast({ title: "Success", description: "Crop deleted successfully" });
            fetchCrops();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete crop",
                variant: "destructive"
            });
        }
    };

    const openEditModal = (crop) => {
        setSelectedCrop(crop);
        setFormData({
            name: crop.name,
            category: crop.category,
            quantity: crop.quantity,
            unit: crop.unit || 'kg',
            pricePerUnit: crop.pricePerUnit,
            description: crop.description || '',
            harvestDate: new Date(crop.harvestDate).toISOString().split('T')[0],
            location: crop.location || '',
            image: crop.image || ''
        });
        setIsEditOpen(true);
    };

    const resetForm = () => {
        setSelectedCrop(null);
        setFormData({
            name: '',
            category: 'other',
            quantity: '',
            unit: 'kg',
            pricePerUnit: '',
            description: '',
            harvestDate: '',
            location: '',
            image: ''
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'sold': return 'bg-blue-500';
            case 'out_of_stock': return 'bg-red-500';
            case 'pending_approval': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Crops</h1>
                        <p className="text-gray-600 mt-1">Manage all your listed crops here</p>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Add New Crop</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Crop</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Crop Name</Label>
                                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="quantity"
                                                name="quantity"
                                                type="number"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                required
                                                className="flex-1"
                                            />
                                            <Select
                                                value={formData.unit}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                                            >
                                                <SelectTrigger className="w-[100px]">
                                                    <SelectValue placeholder="Unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="kg">Kg</SelectItem>
                                                    <SelectItem value="quintal">Quintal</SelectItem>
                                                    <SelectItem value="ton">Ton</SelectItem>
                                                    <SelectItem value="liter">Liter</SelectItem>
                                                    <SelectItem value="bag">Bag</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pricePerUnit">Price/kg (₹)</Label>
                                        <Input id="pricePerUnit" name="pricePerUnit" type="number" value={formData.pricePerUnit} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="harvestDate">Harvest Date</Label>
                                        <Input id="harvestDate" name="harvestDate" type="date" value={formData.harvestDate} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input id="location" name="location" value={formData.location} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image">Crop Image</Label>
                                    <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} />
                                    {formData.image && (
                                        <div className="mt-2 relative h-32 w-full bg-gray-100 rounded-md overflow-hidden">
                                            <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input id="description" name="description" value={formData.description} onChange={handleInputChange} />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save Crop</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                            <SelectItem value="pending_approval">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="text-center py-20">Loading crops...</div>
                ) : crops.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
                        <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No crops added yet</h3>
                        <p className="text-gray-500">Start by adding your first crop listing.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-gray-500">Total Crops: {crops.length}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {crops.map((crop) => (
                                <Card key={crop._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                    <div className="relative h-48 bg-gray-100">
                                        <img
                                            src={crop.image || "https://placehold.co/600x400?text=No+Image"}
                                            alt={crop.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <Badge className={`absolute top-2 right-2 ${getStatusColor(crop.status)}`}>
                                            {crop.status ? crop.status.replace(/_/g, ' ') : 'Active'}
                                        </Badge>
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-900">{crop.name}</h3>
                                                <p className="text-sm text-gray-500 capitalize">{crop.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">₹{crop.pricePerUnit}/{crop.unit ? crop.unit.charAt(0).toUpperCase() + crop.unit.slice(1) : 'Kg'}</p>
                                                <p className="text-xs text-gray-500">Qty: {crop.remainingQuantity} {crop.unit ? crop.unit.charAt(0).toUpperCase() + crop.unit.slice(1) : 'Kg'}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-4 border-t flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openEditModal(crop)}>
                                                <Edit className="h-4 w-4 mr-1" /> Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(crop._id)}>
                                                <Trash className="h-4 w-4 mr-1" /> Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Crop</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                            {/* Same form fields as Add Logic, pre-filled */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Crop Name</Label>
                                    <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-quantity">Quantity</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="edit-quantity"
                                            name="quantity"
                                            type="number"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            required
                                            className="flex-1"
                                        />
                                        <Select
                                            value={formData.unit}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                                        >
                                            <SelectTrigger className="w-[100px]">
                                                <SelectValue placeholder="Unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kg">Kg</SelectItem>
                                                <SelectItem value="quintal">Quintal</SelectItem>
                                                <SelectItem value="ton">Ton</SelectItem>
                                                <SelectItem value="liter">Liter</SelectItem>
                                                <SelectItem value="bag">Bag</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-pricePerUnit">Price/kg (₹)</Label>
                                    <Input id="edit-pricePerUnit" name="pricePerUnit" type="number" value={formData.pricePerUnit} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-harvestDate">Harvest Date</Label>
                                    <Input id="edit-harvestDate" name="harvestDate" type="date" value={formData.harvestDate} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-location">Location</Label>
                                    <Input id="edit-location" name="location" value={formData.location} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-image">Crop Image</Label>
                                <Input id="edit-image" type="file" accept="image/*" onChange={handleImageUpload} />
                                {formData.image && (
                                    <div className="mt-2 relative h-32 w-full bg-gray-100 rounded-md overflow-hidden">
                                        <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Input id="edit-description" name="description" value={formData.description} onChange={handleInputChange} />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Update Crop</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default MyCrops;
