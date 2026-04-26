import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { Send, Users, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Swal from 'sweetalert2';

type Message = {
    id: number;
    message: string;
    createdAt: string;
    userId: number;
    email: string;
    systemId: string | null;
    fullName: string | null;
};

export default function AdminCommunity() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/community');
            setMessages(res.data);
        } catch (err) {
            console.error('Error fetching community messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Auto-scroll on initial load or new message
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling
    useEffect(() => {
        fetchMessages();
        const intervalId = setInterval(fetchMessages, 10000); // poll every 10 seconds
        return () => clearInterval(intervalId);
    }, []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const optimisticMessage = newMessage;
        setNewMessage('');

        try {
            await api.post('/community', { message: optimisticMessage });
            fetchMessages(); // re-fetch to get accurate server timestamps and IDs
        } catch (err: any) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'error',
                title: 'Message failed to send'
            });
            setNewMessage(optimisticMessage); // restore if failed
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Connecting to Admin Community...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate('/admin')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-all bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md"
                    >
                        <Home size={14} />
                        Go Home
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Users size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Community</h1>
                        <p className="text-sm text-gray-500">Collaborate with fellow administrators</p>
                    </div>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden bg-white/50 backdrop-blur pb-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                            <Users size={40} className="text-gray-300" />
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.userId === user?.id;

                            return (
                                <div key={msg.id} className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-xs font-semibold text-gray-700">
                                            {isMe ? 'You' : (msg.systemId || msg.fullName || msg.email.split('@')[0])}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div 
                                        className={`px-4 py-2.5 rounded-2xl max-w-[85%] sm:max-w-[70%] text-sm
                                            ${isMe 
                                                ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm' 
                                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                                            }`}
                                        style={{ wordBreak: 'break-word' }}
                                    >
                                        {msg.message}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message to the community..."
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none max-h-32 text-sm shadow-sm"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />
                        <button 
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="h-[46px] px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <p className="text-[10px] text-gray-400 mt-2 text-center">Press Enter to send, Shift + Enter for new line.</p>
                </div>
            </Card>
        </div>
    );
}
