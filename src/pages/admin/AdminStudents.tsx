import React, { useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table';
import api from '../../api/axios';
import { Edit2, Trash2, Lock } from 'lucide-react';
import Swal from 'sweetalert2';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pagination } from '../../components/Pagination';

export default function AdminStudents() {
    const [page, setPage] = useState(1);
    const limit = 10;
    const queryClient = useQueryClient();

    const [editStudent, setEditStudent] = useState<any | null>(null);

    const { data: response, isLoading: loading } = useQuery({
        queryKey: ['adminStudents', page],
        queryFn: async () => {
            const res = await api.get(`/admin/students?page=${page}&limit=${limit}`);
            return res.data;
        }
    });

    const students = response?.data || [];
    const totalPages = response?.totalPages || 0;

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/admin/students/${id}`);
        },
        onSuccess: () => {
             Swal.fire({
                title: 'Deleted!',
                text: 'Student has been deleted successfully.',
                icon: 'success',
                confirmButtonColor: '#0052FF'
            });
            queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
        },
        onError: (err: any) => {
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.message || err.message || 'Failed to delete student',
                icon: 'error',
                confirmButtonColor: '#0052FF'
            });
        }
    });

    const handleDelete = async (id: number) => {
        const confirmResult = await Swal.fire({
            title: 'Delete Student?',
            text: "Are you sure you want to completely delete this student? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete student'
        });

        if (!confirmResult.isConfirmed) return;
        deleteMutation.mutate(id);
    };

    const updateMutation = useMutation({
        mutationFn: async (updatedStudent: any) => {
            await api.put(`/admin/students/${updatedStudent.id}`, updatedStudent);
        },
        onSuccess: () => {
            setEditStudent(null);
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Student updated successfully'
            });
            queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
        },
        onError: (err: any) => {
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.message || err.message || 'Failed to update student',
                icon: 'error',
                confirmButtonColor: '#0052FF'
            });
        }
    });

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const confirmResult = await Swal.fire({
            title: 'Confirm Update',
            text: "Save changes to this student's record?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0052FF',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, save changes'
        });

        if (!confirmResult.isConfirmed) return;
        updateMutation.mutate(editStudent);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading students...</div>;

    return (
        <div className="space-y-6 relative">
            <h1 className="text-2xl font-bold text-gray-900">Registered Students</h1>

            {editStudent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-white">
                        <h2 className="text-xl font-bold mb-4">Edit Student</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Full Name</label>
                                <input required className="w-full border border-gray-300 p-2 rounded" value={editStudent.full_name} onChange={e => setEditStudent({ ...editStudent, full_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Institution</label>
                                <input required className="w-full border border-gray-300 p-2 rounded" value={editStudent.institution} onChange={e => setEditStudent({ ...editStudent, institution: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Course</label>
                                <input required className="w-full border border-gray-300 p-2 rounded" value={editStudent.course} onChange={e => setEditStudent({ ...editStudent, course: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Year</label>
                                <input required type="number" className="w-full border border-gray-300 p-2 rounded" value={editStudent.year_of_study} onChange={e => setEditStudent({ ...editStudent, year_of_study: parseInt(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">National ID</label>
                                <input required className="w-full border border-gray-300 p-2 rounded" value={editStudent.national_id} onChange={e => setEditStudent({ ...editStudent, national_id: e.target.value })} />
                            </div>
                            
                            <hr className="my-2" />
                            <h3 className="font-semibold text-gray-800">Bank Details</h3>

                            <div>
                                <label className="block text-sm font-medium">School Bank Name</label>
                                <input className="w-full border border-gray-300 p-2 rounded" value={editStudent.school_bank_name || ''} onChange={e => setEditStudent({ ...editStudent, school_bank_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">School Account Number</label>
                                <input className="w-full border border-gray-300 p-2 rounded" value={editStudent.school_account_number || ''} onChange={e => setEditStudent({ ...editStudent, school_account_number: e.target.value })} />
                            </div>
                            <div className="flex items-center gap-2 mt-2 bg-red-50 p-2 rounded border border-red-100">
                                <input 
                                    type="checkbox" 
                                    id="lockBank"
                                    checked={editStudent.is_bank_locked || false} 
                                    onChange={e => setEditStudent({ ...editStudent, is_bank_locked: e.target.checked })} 
                                    className="w-4 h-4 text-red-600 rounded"
                                />
                                <label htmlFor="lockBank" className="text-sm font-medium text-red-800 flex items-center gap-1">
                                    <Lock size={14} /> Lock Bank Details (Prevents student from editing)
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setEditStudent(null)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
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
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell>Institution</TableHeaderCell>
                            <TableHeaderCell>Course</TableHeaderCell>
                            <TableHeaderCell>National ID</TableHeaderCell>
                            <TableHeaderCell>Email</TableHeaderCell>
                            <TableHeaderCell>Actions</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.length > 0 ? students.map((s: any) => (
                            <TableRow key={s.id}>
                                <TableCell>{s.id}</TableCell>
                                <TableCell className="font-medium text-gray-900">{s.full_name}</TableCell>
                                <TableCell>{s.institution}</TableCell>
                                <TableCell>{s.course} (Yr {s.year_of_study})</TableCell>
                                <TableCell>{s.national_id}</TableCell>
                                <TableCell>{s.email}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2 items-center">
                                        {s.is_bank_locked && <span title="Bank Details Locked"><Lock size={16} className="text-red-500 mr-2" /></span>}
                                        <button onClick={() => setEditStudent(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Student"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete Student"><Trash2 size={16} /></button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={7} className="text-center py-8">No students found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </TableContainer>
                
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </Card>
        </div>
    );
}
