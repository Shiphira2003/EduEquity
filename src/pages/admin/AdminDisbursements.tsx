import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table';
import api from '../../api/axios';
import { Edit2, Trash2 } from 'lucide-react';

export default function AdminDisbursements() {
    const [disbursements, setDisbursements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ id: 0, allocation_id: '', amount: 0, status: 'PENDING' });

    const fetchDisbursements = async () => {
        try {
            const res = await api.get('/admin/disbursements');
            setDisbursements(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisbursements();
    }, []);

    const openAdd = () => {
        setEditMode(false);
        setFormData({ id: 0, allocation_id: '', amount: 0, status: 'PENDING' });
        setShowModal(true);
    };

    const openEdit = (d: any) => {
        setEditMode(true);
        setFormData({ id: d.id, allocation_id: d.allocation_id, amount: d.amount, status: d.status });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Permanently delete this disbursement record?")) return;
        try {
            await api.delete(`/admin/disbursements/${id}`);
            fetchDisbursements();
        } catch (err) {
            alert("Failed to delete disbursement");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editMode) {
                await api.put(`/admin/disbursements/${formData.id}`, formData);
            } else {
                await api.post('/admin/disbursements', formData);
            }
            setShowModal(false);
            fetchDisbursements();
        } catch (err) {
            alert("Failed to save. Ensure Application ID exists.");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading disbursements...</div>;

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Disbursements</h1>
                <Button onClick={openAdd}>+ New Disbursement</Button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-sm bg-white">
                        <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Disbursement' : 'Create Disbursement'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!editMode && (
                                <div>
                                    <label className="block text-sm font-medium">Application ID</label>
                                    <input required type="number" className="w-full border border-gray-300 p-2 rounded" value={formData.allocation_id} onChange={e => setFormData({ ...formData, allocation_id: e.target.value })} />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium">Amount</label>
                                <input required type="number" className="w-full border border-gray-300 p-2 rounded" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Status</label>
                                <select className="w-full border border-gray-300 p-2 rounded" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="PENDING">PENDING</option>
                                    <option value="PROCESSED">PROCESSED</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <Card noPadding className="overflow-hidden">
                <TableContainer>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>ID</TableHeaderCell>
                            <TableHeaderCell>Application ID</TableHeaderCell>
                            <TableHeaderCell>Student Name</TableHeaderCell>
                            <TableHeaderCell>Amount</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Actions</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {disbursements.length > 0 ? disbursements.map(d => (
                            <TableRow key={d.id}>
                                <TableCell>{d.id}</TableCell>
                                <TableCell>{d.allocation_id}</TableCell>
                                <TableCell className="font-medium text-gray-900">{d.student_name}</TableCell>
                                <TableCell>KES {d.amount}</TableCell>
                                <TableCell><Badge variant={d.status === 'PROCESSED' ? 'success' : 'warning'}>{d.status}</Badge></TableCell>
                                <TableCell>
                                    <div className="flex gap-2 items-center">
                                        <button onClick={() => openEdit(d)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(d.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No disbursements found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </TableContainer>
            </Card>
        </div>
    );
}
