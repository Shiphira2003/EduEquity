import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table';
import api from '../../api/axios';

export default function AdminAnnouncements() {
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
        try {
            await api.post('/announcements', { title, message });
            setTitle('');
            setMessage('');
            fetchAnnouncements();
        } catch (err) {
            console.error('Failed to create announcement', err);
            alert('Failed to create announcement');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Broadcast Announcements</h1>

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
                        <Button type="submit">Broadcast to Students</Button>
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
                            <TableHeaderCell>Posted By</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {announcements.length > 0 ? announcements.map(a => (
                            <TableRow key={a.id}>
                                <TableCell className="font-semibold text-gray-900">{a.title}</TableCell>
                                <TableCell className="text-gray-600 max-w-sm truncate">{a.message}</TableCell>
                                <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{a.admin_email}</TableCell>
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
