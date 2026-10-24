import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { subsidyChatAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import {
    MessageCircle,
    Send,
    Loader2,
    User,
    Shield,
    ArrowLeft,
    RefreshCw,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AdminSubsidyChats() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [message, setMessage] = useState('');
    const { toast } = useToast();
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchChats();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchChats, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Auto-scroll to bottom when viewing a chat
        if (scrollRef.current && selectedChat) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedChat?.messages]);

    const fetchChats = async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) setRefreshing(true);
            else setLoading(true);

            const response = await subsidyChatAPI.getAllChats();

            if (response.success) {
                setChats(response.data);

                // Update selected chat if it's currently open
                if (selectedChat) {
                    const updatedChat = response.data.find(c => c.farmerId._id === selectedChat.farmerId._id);
                    if (updatedChat) {
                        setSelectedChat(updatedChat);
                    }
                }

                if (showRefreshToast) {
                    toast({
                        title: 'Refreshed',
                        description: 'Chat list updated'
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch chats:', error);
            toast({
                title: 'Error',
                description: 'Failed to load farmer chats',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim() || !selectedChat) return;

        try {
            setSending(true);
            const response = await subsidyChatAPI.sendAdminMessage(
                selectedChat.farmerId._id,
                message.trim()
            );

            if (response.success) {
                setSelectedChat(response.data);
                setMessage('');
                // Refresh the chat list to update last message
                fetchChats();
                toast({
                    title: 'Message Sent',
                    description: 'Your reply has been sent to the farmer'
                });
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast({
                title: 'Error',
                description: 'Failed to send message',
                variant: 'destructive'
            });
        } finally {
            setSending(false);
        }
    };

    const getLastMessage = (chat) => {
        if (!chat.messages || chat.messages.length === 0) {
            return 'No messages yet';
        }
        const lastMsg = chat.messages[chat.messages.length - 1];
        return lastMsg.text.length > 50 ? lastMsg.text.substring(0, 50) + '...' : lastMsg.text;
    };

    const getLastMessageTime = (chat) => {
        if (!chat.lastMessageAt) return '';
        return format(new Date(chat.lastMessageAt), 'MMM d, h:mm a');
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
            <div className="space-y-6 pb-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                            <MessageCircle className="w-7 h-7 text-primary" />
                            Farmer Subsidy Queries
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage farmer questions about government schemes
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => fetchChats(true)}
                        disabled={refreshing}
                        className="gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chat List */}
                    <div className="lg:col-span-1">
                        <div className="dashboard-card overflow-hidden">
                            <div className="p-4 border-b bg-muted/30">
                                <h2 className="font-semibold text-foreground flex items-center justify-between">
                                    <span>Farmer Chats ({chats.length})</span>
                                    {selectedChat && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedChat(null)}
                                            className="lg:hidden"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>
                                    )}
                                </h2>
                            </div>

                            <ScrollArea className="h-[600px]">
                                {chats.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-sm">No farmer queries yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {chats.map((chat) => (
                                            <div
                                                key={chat._id}
                                                onClick={() => setSelectedChat(chat)}
                                                className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${selectedChat?._id === chat._id ? 'bg-primary/5 border-l-4 border-primary' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <User className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-foreground text-sm truncate">
                                                                {chat.farmerName}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                ID: {chat.farmerId._id?.substring(0, 8)}...
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {chat.status === 'open' && (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                                            Open
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                                                    {getLastMessage(chat)}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="w-3 h-3" />
                                                    {getLastMessageTime(chat)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>

                    {/* Chat View */}
                    <div className={`lg:col-span-2 ${selectedChat ? 'block' : 'hidden lg:block'}`}>
                        {selectedChat ? (
                            <div className="dashboard-card flex flex-col h-[680px]">
                                {/* Chat Header */}
                                <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedChat(null)}
                                            className="lg:hidden -ml-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{selectedChat.farmerName}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedChat.farmerId.email || 'No email'}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={selectedChat.status === 'open' ? 'default' : 'secondary'}>
                                        {selectedChat.status}
                                    </Badge>
                                </div>

                                {/* Messages */}
                                <ScrollArea ref={scrollRef} className="flex-1 p-4">
                                    {selectedChat.messages && selectedChat.messages.length > 0 ? (
                                        <div className="space-y-4">
                                            {selectedChat.messages.map((msg, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        {/* Avatar */}
                                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'admin'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : 'bg-primary/10 text-primary'
                                                            }`}>
                                                            {msg.sender === 'admin' ? (
                                                                <Shield className="w-4 h-4" />
                                                            ) : (
                                                                <User className="w-4 h-4" />
                                                            )}
                                                        </div>

                                                        {/* Message Bubble */}
                                                        <div className={`rounded-2xl px-4 py-2 ${msg.sender === 'admin'
                                                                ? 'bg-emerald-600 text-white rounded-tr-sm'
                                                                : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                                                            }`}>
                                                            <p className="text-sm leading-relaxed">{msg.text}</p>
                                                            <p className={`text-xs mt-1 ${msg.sender === 'admin'
                                                                    ? 'text-white/70'
                                                                    : 'text-gray-500'
                                                                }`}>
                                                                {format(new Date(msg.time), 'h:mm a')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <p className="text-sm">No messages in this conversation</p>
                                        </div>
                                    )}
                                </ScrollArea>

                                {/* Input Area */}
                                <div className="border-t p-4 bg-gray-50">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <Input
                                            placeholder="Type your reply..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            disabled={sending}
                                            className="flex-1 bg-white"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={sending || !message.trim()}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            {sending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Send
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Reply to farmer's subsidy query
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="dashboard-card h-[680px] flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">Select a chat to view</p>
                                    <p className="text-sm mt-1">Choose a farmer from the list to see their queries</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
