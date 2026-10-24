import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import {
    Megaphone,
    Plus,
    Trash,
    Bell,
    AlertTriangle,
    Info,
    FileText,
    Loader2
} from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminAnnouncements() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'announcement',
        targetRole: 'farmer'
    });

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getMessages();
            if (response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to fetch messages", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.title || !formData.description) {
            toast({ title: "Error", description: "Title and description are required", variant: "destructive" });
            return;
        }

        try {
            const response = await adminAPI.createMessage(formData);
            if (response.success) {
                toast({ title: "Success", description: "Announcement posted successfully" });
                fetchMessages();
                setIsAddOpen(false);
                setFormData({ title: '', description: '', type: 'announcement', targetRole: 'farmer' });
            }
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this announcement?")) return;
        try {
            const response = await adminAPI.deleteMessage(id);
            if (response.success) {
                toast({ title: "Success", description: "Announcement deleted" });
                setMessages(prev => prev.filter(m => m._id !== id));
            }
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'alert': return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'news': return <FileText className="h-5 w-5 text-blue-500" />;
            default: return <Megaphone className="h-5 w-5 text-purple-500" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'alert': return 'bg-red-50 text-red-700 border-red-100';
            case 'news': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-purple-50 text-purple-700 border-purple-100';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                            <Megaphone className="h-8 w-8 text-purple-600" />
                            Announcements & Alerts
                        </h1>
                        <p className="text-muted-foreground mt-1">Broadcast messages to Farmers and Buyers</p>
                    </div>
                    <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 border-0">
                        <Plus className="h-4 w-4" /> New Announcement
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 border border-dashed rounded-xl">
                        No announcements posted yet.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {messages.map((msg) => (
                            <div key={msg._id} className={`p-4 rounded-xl border flex gap-4 ${getTypeColor(msg.type)} bg-white shadow-sm`}>
                                <div className={`p-3 rounded-full bg-white shadow-sm h-fit border`}>
                                    {getTypeIcon(msg.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-gray-900">{msg.title}</h3>
                                        <Badge variant="outline" className="bg-white">
                                            {msg.targetRole.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">{msg.description}</p>
                                    <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                                        <span>Posted: {format(new Date(msg.createdAt), 'PPP p')}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-auto"
                                            onClick={() => handleDelete(msg._id)}
                                        >
                                            <Trash className="h-4 w-4 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Post New Announcement</DialogTitle>
                            <DialogDescription>
                                Usually visible immediately on user dashboards.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    placeholder="e.g. Server Maintenance"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val) => setFormData({ ...formData, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="announcement">General Announcement</SelectItem>
                                            <SelectItem value="alert">Urgent Alert</SelectItem>
                                            <SelectItem value="news">News / Policy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Target Audience</Label>
                                    <Select
                                        value={formData.targetRole}
                                        onValueChange={(val) => setFormData({ ...formData, targetRole: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="farmer">Farmers Only</SelectItem>
                                            <SelectItem value="buyer">Buyers Only</SelectItem>
                                            <SelectItem value="all">Everyone</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Content</Label>
                                <Textarea
                                    placeholder="Write your message here..."
                                    className="h-32"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">Post Announcement</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
