import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { ArrowLeft, Home, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminAnnouncements() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isSuper = user?.role === 'SUPER_ADMIN';
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/announcements');
            setAnnouncements(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const confirmResult = await Swal.fire({
            title: 'Broadcast Announcement?',
            text: `Are you sure you want to publish this to ${isSuper ? 'all administrators' : 'all students'}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0052FF',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, broadcast'
        });

        if (!confirmResult.isConfirmed) return;

        try {
            await api.post('/announcements', { title, message });
            
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Announcement broadcasted'
            });

            setTitle('');
            setMessage('');
            fetchAnnouncements();
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to create announcement', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="space-y-6">
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
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Megaphone className="text-blue-600" />
                    Broadcast Announcements
                </h1>
            </div>

            <Card>
                <form onSubmit={handleCreate} className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Publish New Announcement</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            required
                            type="text"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Bursary Cycle Open!"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-24"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Type the full announcement message here..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">{isSuper ? 'Broadcast to Admins' : 'Broadcast to Students'}</Button>
                    </div>
                </form>
            </Card>

            <Card noPadding className="overflow-hidden mt-8">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Past Announcements</h2>
                </div>
                <TableContainer>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Title</TableHeaderCell>
                            <TableHeaderCell>Message</TableHeaderCell>
                            <TableHeaderCell>Date</TableHeaderCell>
                            <TableHeaderCell>Admin ID</TableHeaderCell>
                            <TableHeaderCell>Posted By</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {announcements.length > 0 ? announcements.map(a => (
                            <TableRow key={a.id}>
                                <TableCell className="font-semibold text-gray-900">{a.title}</TableCell>
                                <TableCell className="text-gray-600 max-w-sm truncate">{a.message}</TableCell>
                                <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                        {a.system_id || 'SYSTEM'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">{a.admin_email}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={4} className="text-center py-8">No announcements posted yet.</TableCell></TableRow>
                        )}
                    </TableBody>
                </TableContainer>
            </Card>
        </div>
    );
}
