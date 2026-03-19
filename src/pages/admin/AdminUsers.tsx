import React, { useEffect, useState } from "react";
import { registerAdmin } from "../../api/admin.api";
import api from "../../api/axios";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "../../components/Table";

type User = {
    id: number;
    email: string;
    role: string;
    created_at: string;
};

export default function AdminUsers() {
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

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">System Users</h1>

            <div className="mt-4">
                <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Register New Admin</h2>
                    <AdminRegisterForm onRegister={fetchUsers} />
                </Card>
            </div>

            <Card noPadding className="overflow-hidden mt-8">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">All Accounts</h2>
                </div>
                <TableContainer>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>ID</TableHeaderCell>
                            <TableHeaderCell>Email Address</TableHeaderCell>
                            <TableHeaderCell>Role</TableHeaderCell>
                            <TableHeaderCell>Created At</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.id}</TableCell>
                                    <TableCell className="font-medium text-gray-900">{u.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={u.role === 'ADMIN' ? 'success' : 'neutral'}>
                                            {u.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">No users found.</TableCell></TableRow>
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
        try {
            await registerAdmin({ full_name, email, password });
            alert("Admin registered successfully");
            setFullName(""); setEmail(""); setPassword("");
            onRegister();
        } catch (err) {
            alert("Failed to register admin");
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
