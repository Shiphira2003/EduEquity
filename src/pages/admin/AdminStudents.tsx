import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table';
import api from '../../api/axios';
import { Edit2, Trash2 } from 'lucide-react';

export default function AdminStudents() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editStudent, setEditStudent] = useState<any | null>(null);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/admin/students');
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to completely delete this student?")) return;
        try {
            await api.delete(`/admin/students/${id}`);
            fetchStudents();
        } catch (err) {
            alert("Failed to delete student");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/admin/students/${editStudent.id}`, editStudent);
            setEditStudent(null);
            fetchStudents();
        } catch (err) {
            alert("Failed to update student");
        }
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
                        {students.length > 0 ? students.map(s => (
                            <TableRow key={s.id}>
                                <TableCell>{s.id}</TableCell>
                                <TableCell className="font-medium text-gray-900">{s.full_name}</TableCell>
                                <TableCell>{s.institution}</TableCell>
                                <TableCell>{s.course} (Yr {s.year_of_study})</TableCell>
                                <TableCell>{s.national_id}</TableCell>
                                <TableCell>{s.email}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2 items-center">
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
            </Card>
        </div>
    );
}
