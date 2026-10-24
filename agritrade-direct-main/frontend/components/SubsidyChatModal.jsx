import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { subsidyChatAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Send, Loader2, MessageCircle, User, Shield } from 'lucide-react';
import { format } from 'date-fns';

export function SubsidyChatModal({ open, onOpenChange }) {
    const [chat, setChat] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const { toast } = useToast();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (open) {
            fetchChat();
        }
    }, [open]);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat?.messages]);

    const fetchChat = async () => {
        try {
            setLoading(true);
            const response = await subsidyChatAPI.getFarmerChat();
            if (response.success) {
                setChat(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch chat:', error);
            toast({
                title: 'Error',
                description: 'Failed to load chat',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            toast({
                title: 'Empty Message',
                description: 'Please enter a message',
                variant: 'destructive'
            });
            return;
        }

        try {
            setSending(true);
            const response = await subsidyChatAPI.sendFarmerMessage(message.trim());

            if (response.success) {
                setChat(response.data);
                setMessage('');
                toast({
                    title: 'Message Sent',
                    description: 'Your message has been sent to the admin'
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        Chat with Admin
                    </DialogTitle>
                    <DialogDescription>
                        Ask questions about subsidies and government schemes
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Messages Area */}
                        <ScrollArea
                            ref={scrollRef}
                            className="flex-1 px-6 py-4"
                        >
                            {chat?.messages && chat.messages.length > 0 ? (
                                <div className="space-y-4">
                                    {chat.messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${msg.sender === 'farmer' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'farmer' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {/* Avatar */}
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'farmer'
                                                        ? 'bg-primary text-white'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {msg.sender === 'farmer' ? (
                                                        <User className="w-4 h-4" />
                                                    ) : (
                                                        <Shield className="w-4 h-4" />
                                                    )}
                                                </div>

                                                {/* Message Bubble */}
                                                <div className={`rounded-2xl px-4 py-2 ${msg.sender === 'farmer'
                                                        ? 'bg-primary text-white rounded-tr-sm'
                                                        : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                                                    }`}>
                                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                                    <p className={`text-xs mt-1 ${msg.sender === 'farmer'
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
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                    <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
                                    <p className="text-sm">No messages yet</p>
                                    <p className="text-xs mt-1">Start a conversation with the admin</p>
                                </div>
                            )}
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="border-t px-6 py-4 bg-gray-50">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    placeholder="Type your message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={sending}
                                    className="flex-1 bg-white"
                                />
                                <Button
                                    type="submit"
                                    disabled={sending || !message.trim()}
                                    size="icon"
                                    className="flex-shrink-0"
                                >
                                    {sending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </Button>
                            </form>
                            <p className="text-xs text-gray-500 mt-2">
                                Admin will respond to your subsidy queries
                            </p>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
