import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { farmerAPI } from "@/lib/api";
import { format } from "date-fns";
import { useState, useEffect } from 'react';
import {
    Bell,
    CheckCircle,
    Clock,
    Info,
    Package,
    Loader2,
    Trash2
} from 'lucide-react';

export default function FarmerNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await farmerAPI.getNotifications();
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

    const markAsRead = async (id) => {
        try {
            const response = await farmerAPI.markNotificationRead(id);
            if (response.success) {
                setNotifications(notifications.map(n =>
                    n._id === id ? { ...n, isRead: true } : n
                ));
            }
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <Package className="w-5 h-5 text-blue-500" />;
            case 'payment': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'scheme': return <Info className="w-5 h-5 text-purple-500" />;
            case 'admin': return <Bell className="w-5 h-5 text-red-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-4 sm:space-y-6 pb-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Notifications</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1.5 sm:mt-2">Stay updated with your activities</p>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="divide-y divide-border">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''}`}
                                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                                >
                                    <div className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                    {format(new Date(notification.createdAt), 'PP p')}
                                                </span>
                                            </div>
                                            <p className={`text-sm mt-1 ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {notification.message}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="flex-shrink-0 self-center">
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
