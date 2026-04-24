import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getDisbursements, 
    createDisbursement, 
    updateDisbursement, 
    deleteDisbursement, 
    type Disbursement 
} from '../../api/admin.api';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table';
import { Edit2, Trash2, Banknote, Search, Calendar, Hash, AlertCircle, TrendingDown } from 'lucide-react';
import { getApplications } from '../../api/admin.api';
import { getCashFlowSummary } from '../../api/reports.api';
import Swal from 'sweetalert2';

export default function AdminDisbursements() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Disbursement>>({ 
        id: 0, 
        allocation_id: 0, 
        amount: 0, 
        status: 'PENDING',
        reference_number: '',
        fund_source: 'NATIONAL'
    });
    const [approvedApps, setApprovedApps] = useState<any[]>([]);
    const [balances, setBalances] = useState<any[]>([]);
    const [loadingContext, setLoadingContext] = useState(false);

    const { data: disbursements = [], isLoading } = useQuery({
        queryKey: ['adminDisbursements'],
        queryFn: getDisbursements
    });

    const currentYear = new Date().getFullYear();

    // Fetch context data for the modal
    const fetchModalContext = async () => {
        setLoadingContext(true);
        try {
            const [appsRes, balanceRes] = await Promise.all([
                getApplications('APPROVED', 1, 100),
                getCashFlowSummary(currentYear)
            ]);
            setApprovedApps(appsRes.data);
            setBalances(balanceRes.balances);
        } catch (err) {
            console.error("Failed to fetch modal context", err);
        } finally {
            setLoadingContext(false);
        }
    };

    const createMutation = useMutation({
        mutationFn: (data: any) => createDisbursement(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminDisbursements'] });
            setShowModal(false);
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Disbursement recorded successfully'
            });
        },
        onError: (err: any) => {
            Swal.fire('Error', err.response?.data?.message || err.message || 'Failed to record disbursement', 'error');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateDisbursement(data.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminDisbursements'] });
            setShowModal(false);
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Disbursement updated', timer: 3000, showConfirmButton: false });
        },
        onError: (err: any) => {
            Swal.fire('Error', err.response?.data?.message || err.message || 'Failed to update record', 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteDisbursement(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminDisbursements'] });
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Record deleted', timer: 3000, showConfirmButton: false });
        },
        onError: (err: any) => {
            Swal.fire('Error', err.response?.data?.message || 'Failed to delete record', 'error');
        }
    });

    const openAdd = () => {
        setEditMode(false);
        setFormData({ id: 0, allocation_id: 0, amount: 0, status: 'PENDING', reference_number: '', fund_source: 'NATIONAL' });
        fetchModalContext();
        setShowModal(true);
    };

    const openEdit = (d: Disbursement) => {
        setEditMode(true);
        setFormData({ ...d });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        const confirmResult = await Swal.fire({
            title: 'Delete Record?',
            text: "Permanently delete this disbursement record?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it'
        });
        if (confirmResult.isConfirmed) deleteMutation.mutate(id);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editMode) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Banknote className="text-green-600" />
                        Scholarship Disbursements
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Official records of bursary payments to institutions.</p>
                </div>
                <Button onClick={openAdd} variant="primary" className="flex items-center gap-2">
                    <Banknote size={16} />
                    New Disbursement
                </Button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-900">{editMode ? 'Edit Record' : 'Create Disbursement'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!editMode && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase mb-1.5">
                                            <Search size={12} /> Select Approved Application
                                        </label>
                                        <select 
                                            required 
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.allocation_id || ''}
                                            onChange={e => {
                                                const app = approvedApps.find(a => a.id === parseInt(e.target.value));
                                                if (app) {
                                                    setFormData({ 
                                                        ...formData, 
                                                        allocation_id: app.id, 
                                                        amount: parseFloat(app.amount_allocated) 
                                                    });
                                                }
                                            }}
                                        >
                                            <option value="">-- Choose student application --</option>
                                            {approvedApps.map(app => (
                                                <option key={app.id} value={app.id}>
                                                    {app.full_name} (#{app.id}) - KES {parseFloat(app.amount_allocated).toLocaleString()}
                                                </option>
                                            ))}
                                            {loadingContext && <option disabled>Loading applications...</option>}
                                            {!loadingContext && approvedApps.length === 0 && <option disabled>No approved applications found</option>}
                                        </select>
                                    </div>

                                    {formData.allocation_id ? (
                                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg"><AlertCircle size={16} className="text-primary" /></div>
                                            <div>
                                                <p className="text-xs font-bold text-black">Target Amount: KES {formData.amount?.toLocaleString()}</p>
                                                <p className="text-[10px] text-zinc-500">Auto-calculated based on the approved bursary allocation.</p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase mb-1.5">
                                        Amount (KES)
                                    </label>
                                    <input required type="number" step="0.01" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase mb-1.5">
                                        Status
                                    </label>
                                    <select className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                                        <option value="PENDING">PENDING</option>
                                        <option value="PROCESSED">PROCESSED</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase mb-1.5">
                                    <Hash size={12} /> Reference Number
                                </label>
                                <input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. TRX-9031204" value={formData.reference_number || ''} onChange={e => setFormData({ ...formData, reference_number: e.target.value })} />
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase mb-1.5">
                                        Fund Source
                                    </label>
                                    <select className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.fund_source} onChange={e => setFormData({ ...formData, fund_source: e.target.value })}>
                                        <option value="NATIONAL">NATIONAL</option>
                                        <option value="COUNTY">COUNTY</option>
                                        <option value="CDF">CDF</option>
                                        <option value="MCA">MCA</option>
                                    </select>
                                </div>

                                {formData.fund_source && balances.length > 0 && (
                                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase">
                                                <TrendingDown size={12} /> {formData.fund_source} Budget Pulse
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-400">{currentYear} Cycle</span>
                                        </div>
                                        {(() => {
                                            const sourceBalance = balances.find(b => b.fundSource === formData.fund_source);
                                            if (!sourceBalance) return <p className="text-xs text-zinc-500">No budget data available.</p>;
                                            const isOverCap = (formData.amount || 0) > sourceBalance.availableBalance;
                                            return (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-medium text-zinc-600">Available:</span>
                                                        <span className={`text-sm font-black ${isOverCap ? 'text-red-600' : 'text-zinc-900'}`}>
                                                            KES {sourceBalance.availableBalance.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {isOverCap && (
                                                        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                                                            <AlertCircle size={10} /> Warning: Amount exceeds available balance!
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {editMode ? 'Save Changes' : 'Record Disbursement'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <Card noPadding className="overflow-hidden border-0 shadow-xl shadow-gray-100">
                <TableContainer>
                    <TableHead>
                        <TableRow className="bg-gray-50/50">
                            <TableHeaderCell className="text-gray-400 font-bold">Details</TableHeaderCell>
                            <TableHeaderCell className="text-gray-400 font-bold">Recipient</TableHeaderCell>
                            <TableHeaderCell className="text-gray-400 font-bold">Transaction info</TableHeaderCell>
                            <TableHeaderCell className="text-gray-400 font-bold">Amount</TableHeaderCell>
                            <TableHeaderCell className="text-gray-400 font-bold">Status</TableHeaderCell>
                            <TableHeaderCell className="text-gray-400 font-bold text-right">Actions</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-20 text-gray-400">Loading records...</TableCell></TableRow>
                        ) : disbursements.length > 0 ? disbursements.map(d => (
                            <TableRow key={d.id} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">#DISB-{d.id}</span>
                                        <span className="text-[10px] text-gray-400 font-medium">APP REF: #{d.allocation_id}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-800">{d.student_name}</span>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-bold mt-1">
                                            <Badge variant="neutral" className="px-1.5 py-0">{d.fund_source}</Badge>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                            <Hash size={12} className="text-gray-400" />
                                            <span className="font-mono">{d.reference_number || '---'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase font-bold">
                                            <Calendar size={10} />
                                            {d.disbursed_at ? new Date(d.disbursed_at).toLocaleDateString() : 'Pending'}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-base font-bold text-gray-900">KES {parseFloat(d.amount as string).toLocaleString()}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={d.status === 'PROCESSED' ? 'success' : 'warning'}>
                                        {d.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => openEdit(d)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Record"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(d.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Record"><Trash2 size={16} /></button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20 text-gray-400">
                                    <Banknote size={48} className="mx-auto mb-4 opacity-10" />
                                    No disbursement records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </TableContainer>
            </Card>
        </div>
    );
}
