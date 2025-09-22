// src/app/(dashboard)/admin/messages/page.tsx
'use client';
import { ContactMessage } from "@prisma/client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function MessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMessages = async () => {
        setIsLoading(true);
        const res = await fetch('/api/admin/messages', { cache: 'no-store' });
        if (res.ok) {
            setMessages(await res.json());
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkAsRead = async (messageId: string) => {
        const promise = fetch(`/api/admin/messages/${messageId}`, { method: 'PATCH' });
        toast.promise(promise, {
            loading: 'Marking as read...',
            success: 'Message marked as read!',
            error: 'Could not update status.'
        });
        promise.then(res => {
            if (res.ok) {
                // Optimistically update the UI
                setSelectedMessage(prev => prev ? { ...prev, isRead: true } : null);
                setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m));
            }
        });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold">Customer Messages</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Message List */}
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader><CardTitle>Inbox ({messages.length})</CardTitle></CardHeader>
                        <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {isLoading ? <p>Loading messages...</p> : messages.map(msg => (
                                <div 
                                    key={msg.id} 
                                    onClick={() => setSelectedMessage(msg)}
                                    className={`p-3 rounded-lg cursor-pointer border-l-4 ${selectedMessage?.id === msg.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50 border-transparent'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{msg.name}</p>
                                        {!msg.isRead && <Badge variant="destructive">New</Badge>}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{msg.subject || 'No Subject'}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Message Details View */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            {selectedMessage ? (
                                <div>
                                    <CardTitle>{selectedMessage.subject || 'No Subject'}</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        From: {selectedMessage.name} &lt;{selectedMessage.email}&gt; on {format(new Date(selectedMessage.createdAt), 'dd MMM, yyyy')}
                                    </p>
                                </div>
                            ) : (
                                <CardTitle>Select a message to read</CardTitle>
                            )}
                        </CardHeader>
                        <CardContent>
                            {selectedMessage ? (
                                <div className="space-y-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                                    {!selectedMessage.isRead && (
                                        <Button onClick={() => handleMarkAsRead(selectedMessage.id)}>Mark as Read</Button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">No message selected.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}