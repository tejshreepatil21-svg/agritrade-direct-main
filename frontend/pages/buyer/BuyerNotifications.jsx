import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { buyerAPI } from "@/lib/api";
import { format } from "date-fns";
import { useState, useEffect } from 'react';
import {
    Bell,
    CheckCircle,
    Package,
    Loader2,
    Trash2,
    CreditCard,
    Zap,
    Info
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function BuyerNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await buyerAPI.getNotifications();
            if (response.success) {
                setNotifications(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            toast({
                title: "Error",
                description: "Failed to load notifications",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            const response = await buyerAPI.markNotificationRead(id);
            if (response.success) {
                setNotifications(prev => prev.map(n =>
                    n._id === id ? { ...n, isRead: true } : n
                ));
            }
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const markAllRead = async () => {
        try {
            const response = await buyerAPI.markAllNotificationsRead();
            if (response.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                toast({ title: "Success", description: "All notifications marked as read" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to mark all as read", variant: "destructive" });
        }
    };

    const deleteNotification = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            const response = await buyerAPI.deleteNotification(id);
            if (response.success) {
                setNotifications(prev => prev.filter(n => n._id !== id));
                toast({ title: "Deleted", description: "Notification removed" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete notification", variant: "destructive" });
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <Package className="w-5 h-5 text-blue-500" />;
            case 'payment': return <CreditCard className="w-5 h-5 text-green-500" />;
            case 'subscription': return <Zap className="w-5 h-5 text-amber-500" />;
            case 'admin': return <Info className="w-5 h-5 text-red-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'order': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'payment': return 'bg-green-50 text-green-700 border-green-100';
            case 'subscription': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'admin': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-4xl mx-auto pb-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-muted-foreground mt-1">Updates on your orders, subscriptions, and more.</p>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <Button variant="outline" onClick={markAllRead} className="gap-2">
                            <CheckCircle className="w-4 h-4" /> Mark all as read
                        </Button>
                    )}
                </div>

                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="divide-y divide-border">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                <Bell className="w-12 h-12 mb-4 opacity-20" />
                                <h3 className="text-lg font-medium">No details available</h3>
                                <p className="text-sm mt-1">We'll notify you when something important happens.</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`group p-4 sm:p-5 hover:bg-muted/50 transition-all cursor-pointer relative ${!notification.isRead ? 'bg-primary/5' : 'bg-background'}`}
                                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                                >
                                    <div className="flex gap-4 items-start">
                                        <div className={`p-2 rounded-full flex-shrink-0 ${getTypeColor(notification.type)}`}>
                                            {getIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0 pr-8">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                                <h3 className={`text-base ${!notification.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                                                    {format(new Date(notification.createdAt), 'MMM d, p')}
                                                </span>
                                            </div>

                                            <p className={`text-sm mt-1 leading-relaxed ${!notification.isRead ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                                                {notification.message}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.isRead && (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" title="Mark as read" onClick={(e) => markAsRead(notification._id, e)}>
                                                    <div className="w-2 h-2 rounded-full bg-current" />
                                                </Button>
                                            )}
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={(e) => deleteNotification(notification._id, e)}
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {/* Mobile Unread Indicator */}
                                        {!notification.isRead && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 sm:hidden">
                                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
