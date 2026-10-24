import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import {
    FileText,
    Plus,
    Edit,
    Trash,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    Search,
    MoreVertical,
    MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

export default function AdminSchemes() {
    const navigate = useNavigate();
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const { confirm, ConfirmDialog } = useConfirmDialog();

    // Dialog States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentScheme, setCurrentScheme] = useState(null);

    // Applications View State
    const [viewApplications, setViewApplications] = useState(null); // schemeId
    const [applications, setApplications] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eligibility: '',
        subsidyAmount: '',
        lastDate: ''
    });

    useEffect(() => {
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getSchemes();
            if (response.success) {
                setSchemes(response.data);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to fetch schemes",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const response = await adminAPI.createScheme(formData);
            if (response.success) {
                toast({ title: "Success", description: "Scheme created successfully" });
                fetchSchemes();
                setIsAddOpen(false);
                setFormData({ title: '', description: '', eligibility: '', subsidyAmount: '', lastDate: '' });
            }
        } catch (error) {
            console.error("Scheme creation error:", error);
            if (error.message.includes('Authentication') || error.message.includes('jwt')) {
                toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
                // Optionally redirect? navigate('/login');
            } else {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            }
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await adminAPI.updateScheme(currentScheme._id, formData);
            if (response.success) {
                toast({ title: "Success", description: "Scheme updated successfully" });
                fetchSchemes();
                setIsEditOpen(false);
            }
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: "Delete Scheme",
            description: "Are you sure you want to delete this scheme? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {
            const response = await adminAPI.deleteScheme(id);
            if (response.success) {
                toast({ title: "Success", description: "Scheme deleted" });
                fetchSchemes();
            }
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const openEdit = (scheme) => {
        setCurrentScheme(scheme);
        setFormData({
            title: scheme.title || scheme.name,
            description: scheme.description,
            eligibility: scheme.eligibility,
            subsidyAmount: scheme.subsidyAmount,
            lastDate: scheme.lastDate ? new Date(scheme.lastDate).toISOString().split('T')[0] : ''
        });
        setIsEditOpen(true);
    };

    // Applications Logic
    const fetchApplications = async (schemeId) => {
        try {
            setLoadingApps(true);
            const response = await adminAPI.getSchemeApplications(schemeId);
            if (response.success) {
                setApplications(response.data);
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to fetch applications", variant: "destructive" });
        } finally {
            setLoadingApps(false);
        }
    };

    const openApplications = (scheme) => {
        setCurrentScheme(scheme);
        setViewApplications(scheme._id);
        fetchApplications(scheme._id);
    };

    const handleApproveReject = async (appId, newStatus) => {
        try {
            const response = await adminAPI.updateApplicationStatus(appId, newStatus);
            if (response.success) {
                toast({ title: "Success", description: `Application ${newStatus}` });
                // Refresh list
                fetchApplications(viewApplications);
                // Also refresh main list to update counts if needed (though counts don't depend on status usually, or total applicants means applied)
                // If total applicants means *all*, we don't need refresh.
            }
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const filteredSchemes = schemes.filter(s =>
        (s.title || s.name)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                            <FileText className="h-8 w-8 text-purple-600" />
                            Subsidy Schemes
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage government schemes and farmer applications</p>
                    </div>
                    {/* Only show 'Add Scheme' if not viewing applications */}
                    {!viewApplications && (
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="gap-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                                onClick={() => navigate('/admin/subsidy-chats')}
                            >
                                <MessageCircle className="h-4 w-4" /> Farmer Queries
                            </Button>
                            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 border-0" onClick={() => setIsAddOpen(true)}>
                                <Plus className="h-4 w-4" /> Add New Scheme
                            </Button>
                        </div>
                    )}
                    {viewApplications && (
                        <Button variant="outline" onClick={() => setViewApplications(null)}>
                            Back to Schemes
                        </Button>
                    )}
                </div>

                {!viewApplications ? (
                    // Schemes List View
                    <>
                        {/* Search */}
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search schemes..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                            </div>
                        ) : filteredSchemes.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 border border-dashed rounded-xl">
                                No schemes found. Create one to get started.
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {filteredSchemes.map((scheme) => (
                                    <div key={scheme._id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <h3 className="text-xl font-bold text-gray-900">{scheme.title || scheme.name}</h3>
                                                    <Badge variant={scheme.isActive ? 'default' : 'secondary'} className={scheme.isActive ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                                                        {scheme.isActive ? 'Active' : 'Closed'}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-600">{scheme.description}</p>

                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-2">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-semibold text-gray-900">₹{scheme.subsidyAmount.toLocaleString()}</span> Subsidy
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" /> Deadline: {format(new Date(scheme.lastDate), 'PP')}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" /> {scheme.totalApplicants || 0} Applicants
                                                    </div>
                                                </div>

                                                <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm inline-block w-full md:w-auto">
                                                    <span className="font-semibold">Eligibility:</span> {scheme.eligibility}
                                                </div>
                                            </div>

                                            <div className="flex md:flex-col gap-2 min-w-[150px]">
                                                <Button variant="outline" className="flex-1 justify-start gap-2" onClick={() => openApplications(scheme)}>
                                                    <Users className="h-4 w-4" /> View Applicants
                                                </Button>
                                                <Button variant="outline" className="flex-1 justify-start gap-2" onClick={() => openEdit(scheme)}>
                                                    <Edit className="h-4 w-4" /> Edit Scheme
                                                </Button>
                                                <Button variant="destructive" className="flex-1 justify-start gap-2 bg-red-50 text-red-600 hover:bg-red-100 border-red-100" onClick={() => handleDelete(scheme._id)}>
                                                    <Trash className="h-4 w-4" /> Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    // Applications View
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-6 border-b bg-gray-50">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Applications for: <span className="text-purple-600">{currentScheme?.title || currentScheme?.name}</span>
                            </h2>
                        </div>

                        {loadingApps ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                No applications received yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                                        <tr>
                                            <th className="px-6 py-4">Farmer Name</th>
                                            <th className="px-6 py-4">Contact</th>
                                            <th className="px-6 py-4">Applied Date</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {applications.map((app) => (
                                            <tr key={app._id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback>{app.farmerId?.name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="font-medium text-gray-900">{app.farmerId?.name || 'Unknown'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    <div>{app.farmerId?.email}</div>
                                                    <div className="text-xs">{app.farmerId?.phone || 'No phone'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {format(new Date(app.appliedAt), 'PP')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={
                                                        app.status === 'approved' ? 'default' :
                                                            app.status === 'rejected' ? 'destructive' : 'secondary'
                                                    } className={
                                                        app.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                                            app.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                                                'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                    }>
                                                        {app.status.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {app.status === 'applied' && (
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => handleApproveReject(app._id, 'approved')}>
                                                                Approve
                                                            </Button>
                                                            <Button size="sm" variant="destructive" className="h-8" onClick={() => handleApproveReject(app._id, 'rejected')}>
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Create/Edit Dialog */}
                <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
                    if (!open) {
                        setIsAddOpen(false);
                        setIsEditOpen(false);
                        setFormData({ title: '', description: '', eligibility: '', subsidyAmount: '', lastDate: '' });
                    }
                }}>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{isEditOpen ? 'Edit Scheme' : 'Add New Scheme'}</DialogTitle>
                            <DialogDescription>
                                {isEditOpen ? 'Update scheme details.' : 'Create a new government subsidy scheme.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Scheme Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Organic Farming Subsidy"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Subsidy Amount (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.subsidyAmount}
                                    onChange={(e) => setFormData({ ...formData, subsidyAmount: e.target.value })}
                                    placeholder="e.g. 5000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Application Deadline</Label>
                                <Input
                                    type="date"
                                    value={formData.lastDate}
                                    onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Eligibility Criteria</Label>
                                <Textarea
                                    value={formData.eligibility}
                                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                                    placeholder="Who can apply?"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Details about the scheme..."
                                    className="h-24"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancel</Button>
                            <Button onClick={isEditOpen ? handleUpdate : handleCreate} className="bg-purple-600 hover:bg-purple-700">
                                {isEditOpen ? 'Update Scheme' : 'Create Scheme'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <ConfirmDialog />
            </div>
        </DashboardLayout>
    );
}
