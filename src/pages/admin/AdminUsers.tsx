import React, { useEffect, useState } from "react";
import { registerAdmin } from "../../api/admin.api";
import api from "../../api/axios";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "../../components/Table";
import { ArrowLeft, Home, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";

type User = {
    id: number;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
};

export default function AdminUsers() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (user: User) => {
        const action = user.isActive ? 'deactivate' : 'activate';
        const confirmResult = await Swal.fire({
            title: `Confirm ${action}`,
            text: `Are you sure you want to ${action} ${user.email}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: user.isActive ? '#d33' : '#0052FF',
            confirmButtonText: `Yes, ${action}`
        });

        if (!confirmResult.isConfirmed) return;

        try {
            await api.patch(`/admin/users/${user.id}/status`, { is_active: !user.isActive });
            Swal.fire('Success', `User has been ${action}d.`, 'success');
            fetchUsers();
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.error || 'Failed to update user status', 'error');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

    const isSuper = currentUser?.role?.toUpperCase() === 'SUPER_ADMIN';

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
                    <UserCog className="text-blue-600" />
                    System Users Management
                </h1>
            </div>

            {isSuper && (
                <div className="mt-4">
                    <Card>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Register New Admin Account</h2>
                        <AdminRegisterForm onRegister={fetchUsers} />
                    </Card>
                </div>
            )}

            <Card noPadding className="overflow-hidden mt-8">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">All System Accounts</h2>
                </div>
                <TableContainer>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>ID</TableHeaderCell>
                            <TableHeaderCell>Email Address</TableHeaderCell>
                            <TableHeaderCell>Role</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Created At</TableHeaderCell>
                            {isSuper && <TableHeaderCell>Actions</TableHeaderCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.id}</TableCell>
                                    <TableCell className="font-medium text-gray-900">{u.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            u.role?.toUpperCase() === 'SUPER_ADMIN' ? 'info' : 
                                            u.role?.toUpperCase() === 'ADMIN' ? 'neutral' : 
                                            'success'
                                        }>
                                            {u.role ? u.role.toUpperCase().replace('_', ' ') : 'STUDENT'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.isActive ? 'success' : 'error'}>
                                            {u.isActive ? 'Active' : 'Deactivated'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                                    {isSuper && (
                                        <TableCell>
                                            {u.id !== currentUser?.id && (
                                                <Button 
                                                    size="sm" 
                                                    variant={u.isActive ? "danger" : "primary"}
                                                    onClick={() => toggleUserStatus(u)}
                                                >
                                                    {u.isActive ? 'Discontinue' : 'Reactivate'}
                                                </Button>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={isSuper ? 6 : 5} className="text-center py-8 text-gray-500">No matching accounts found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </TableContainer>
            </Card>
        </div>
    );
}

function AdminRegisterForm({ onRegister }: { onRegister: () => void }) {
    const [full_name, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const confirmResult = await Swal.fire({
            title: 'Confirm Admin Creation',
            text: `Are you sure you want to register ${email} as an Administrator?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0052FF',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, create admin'
        });

        if (!confirmResult.isConfirmed) return;

        try {
            await registerAdmin({ full_name, email, password });
            
            Swal.fire({
                title: 'Success!',
                text: 'Admin registered successfully',
                icon: 'success',
                confirmButtonColor: '#0052FF'
            });

            setFullName(""); setEmail(""); setPassword("");
            onRegister();
        } catch (err: any) {
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.message || err.message || 'Failed to register admin',
                icon: 'error',
                confirmButtonColor: '#0052FF'
            });
        }
    };

    return (
        <form onSubmit={submit} className="flex gap-4 max-w-3xl">
            <input value={full_name} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="border p-2 w-full rounded-md" required />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="border p-2 w-full rounded-md" required />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="border p-2 w-full rounded-md" required />
            <Button type="submit" className="whitespace-nowrap">Register Admin</Button>
        </form>
    );
}
