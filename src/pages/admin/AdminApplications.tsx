import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplications, updateApplicationStatus } from "../../api/admin.api";
import api from "../../api/axios";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "../../components/Table";
import { Edit2, Trash2 } from "lucide-react";

type Application = {
    id: number;
    full_name: string;
    national_id: string;
    institution: string;
    course: string;
    year_of_study: number;
    cycle_year: number;
    amount_requested: number;
    amount_allocated: number;
    status: string;
    document_url: string[];
    created_at: string;
};

export default function AdminApplications() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState<Application[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [editApp, setEditApp] = useState<Application | null>(null);

    const parseDocumentUrl = (input: any): string[] => {
        if (!input) return [];
        if (Array.isArray(input)) return input;
        if (typeof input === "string") {
            try { return JSON.parse(input); } catch (err) { return [input]; }
        }
        return [];
    };

    const fetchApplications = async () => {
        try {
            const res = await getApplications(statusFilter);
            if (!res || !res.data) {
                setApplications([]);
                return;
            }
            const apps: Application[] = res.data.map((app: any) => ({
                ...app,
                document_url: parseDocumentUrl(app.document_url),
            }));
            setApplications(apps);
        } catch (err) {
            console.error("Error fetching applications:", err);
            setApplications([]);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    const handleStatusChange = async (appId: number, status: string) => {
        try {
            let amount_allocated = 0;
            if (status === "APPROVED") {
                const input = prompt("Enter allocated amount") || "0";
                amount_allocated = parseFloat(input);
                if (amount_allocated <= 0) return alert("Amount must be greater than 0");
            }
            await updateApplicationStatus(appId.toString(), status, amount_allocated);
            fetchApplications();
        } catch (err) {
            console.error("Error updating application status:", err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this application permanently?")) return;
        try {
            await api.delete(`/admin/applications/${id}`);
            fetchApplications();
        } catch (err) {
            alert("Failed to delete application");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/admin/applications/${editApp!.id}`, {
                amount_requested: editApp!.amount_requested,
                cycle_year: editApp!.cycle_year
            });
            setEditApp(null);
            fetchApplications();
        } catch (err) {
            alert("Failed to update application");
        }
    };

    return (
        <div className="space-y-6 relative">
            <h1 className="text-2xl font-bold text-gray-900">Funding Applications</h1>

            {editApp && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-white">
                        <h2 className="text-xl font-bold mb-4">Edit Application #{editApp.id}</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Cycle Year</label>
                                <input required type="number" className="w-full border border-gray-300 p-2 rounded" value={editApp.cycle_year} onChange={e => setEditApp({ ...editApp, cycle_year: parseInt(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Amount Requested</label>
                                <input required type="number" className="w-full border border-gray-300 p-2 rounded" value={editApp.amount_requested} onChange={e => setEditApp({ ...editApp, amount_requested: parseFloat(e.target.value) })} />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setEditApp(null)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <Card noPadding className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Filter Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-md text-sm p-1"
                        >
                            <option value="">All Applications</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                <TableContainer>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell>Course & Inst.</TableHeaderCell>
                            <TableHeaderCell>Amount</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Approval</TableHeaderCell>
                            <TableHeaderCell>Actions</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applications.length > 0 ? (
                            applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium text-gray-900">{app.full_name}</TableCell>
                                    <TableCell>
                                        <div>{app.course}</div>
                                        <div className="text-xs text-gray-500">{app.institution}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">REQ: {app.amount_requested}</div>
                                        {app.amount_allocated > 0 && <div className="text-xs text-green-600">ALL: {app.amount_allocated}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'error' : 'warning'}>
                                            {app.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 flex-wrap">
                                            {app.status === "PENDING" && (
                                                <>
                                                    <Button size="sm" onClick={() => handleStatusChange(app.id, "APPROVED")}>Approve</Button>
                                                    <Button size="sm" variant="danger" onClick={() => handleStatusChange(app.id, "REJECTED")}>Reject</Button>
                                                </>
                                            )}
                                            {app.status === "APPROVED" && (
                                                <Button size="sm" variant="outline" onClick={() => navigate(`/admin/applications/${app.id}/audit-logs`)}>Logs</Button>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 items-center">
                                            <button onClick={() => setEditApp(app)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit App"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(app.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete App"><Trash2 size={16} /></button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No applications found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </TableContainer>
            </Card>

        </div>
    );
}
