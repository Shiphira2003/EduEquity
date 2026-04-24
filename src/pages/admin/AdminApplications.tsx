import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplications, updateApplicationStatus, autoEvaluateApplications } from "../../api/admin.api";
import api from "../../api/axios";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "../../components/Table";
import { Edit2, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pagination } from "../../components/Pagination";

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
    taada_flag: string;
    need_score: number | string;
    document_url: any;
    created_at: string;
};

export default function AdminApplications() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [bursaryType, setBursaryType] = useState<string>("");
    const [sortField, setSortField] = useState<string>("created_at");
    const [sortOrder, setSortOrder] = useState<string>("desc");
    const [page, setPage] = useState(1);
    const limit = 10;
    const [editApp, setEditApp] = useState<Application | null>(null);

    const parseDocumentUrl = (input: any): any => {
        if (!input) return null;
        if (typeof input === "string") {
            try { return JSON.parse(input); } catch (err) { return input; }
        }
        return input;
    };

    const { data: response } = useQuery({
        queryKey: ['adminApplications', statusFilter, bursaryType, sortField, sortOrder, page],
        queryFn: async () => {
             const res = await getApplications(statusFilter, page, limit, sortField, sortOrder, bursaryType);
             if (!res || !res.data) return { data: [], totalPages: 0 };
             return {
                 data: res.data.map((app: any) => ({
                    ...app,
                    document_url: parseDocumentUrl(app.document_url),
                 })),
                 totalPages: res.totalPages || 0
             };
        }
    });

    const applications = response?.data || [];
    const totalPages = response?.totalPages || 0;

    const handleStatusChange = async (appId: number, status: string) => {
        try {
            let amount_allocated = 0;
            let rejection_reason = undefined;
            if (status === "APPROVED") {
                const { value: input } = await Swal.fire({
                    title: 'Allocate Funds',
                    text: 'Enter the amount to allocate (KES):',
                    input: 'number',
                    inputAttributes: { min: '1', step: '1' },
                    showCancelButton: true,
                    confirmButtonText: 'Approve & Allocate',
                    confirmButtonColor: '#0052FF',
                    cancelButtonColor: '#d33'
                });

                if (!input) return; // cancelled
                amount_allocated = parseFloat(input);
                if (amount_allocated <= 0) {
                    await Swal.fire('Invalid Amount', 'Amount must be greater than 0', 'error');
                    return;
                }
            } else if (status === "REJECTED") {
                const { value: reason } = await Swal.fire({
                    title: 'Reject Application?',
                    text: 'Please provide a reason for rejecting this application:',
                    input: 'textarea',
                    inputPlaceholder: 'Type rejection reason here...',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, reject it',
                    inputValidator: (value) => {
                        if (!value) {
                            return 'You need to write something!';
                        }
                    }
                });
                if (!reason) return;
                rejection_reason = reason;
            }

            await updateApplicationStatus(appId.toString(), status, amount_allocated, rejection_reason);
            
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: `Application ${status.toLowerCase()} successfully`
            });
            queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || err.message || 'Error updating application status', 'error');
        }
    };

    const handleViewScoreBreakdown = async (appId: number) => {
        try {
            Swal.fire({
                title: 'Loading Breakdown...',
                didOpen: () => Swal.showLoading()
            });

            const res = await api.get(`/applications/${appId}/score-breakdown`);
            const data = res.data;

            Swal.fire({
                title: `Equity Score: ${data.finalScore}/100`,
                html: `
                    <div class="text-left space-y-3 p-2">
                        <div class="flex justify-between border-b pb-1">
                            <span class="text-gray-600">Base Need Assessment:</span>
                            <span class="font-bold">${data.baseScore} pts</span>
                        </div>
                        <div class="flex justify-between border-b pb-1 text-blue-600">
                            <span class="font-medium italic">TAADA Policy Bonus:</span>
                            <span class="font-bold">+${data.taadaBonusScore} pts</span>
                        </div>
                        <div class="mt-4">
                            <h4 class="text-xs font-bold uppercase text-gray-400 mb-2">Detailed Factors</h4>
                            <div class="grid grid-cols-1 gap-2 text-sm">
                                <div class="flex justify-between italic">
                                    <span>Family Income (40%):</span>
                                    <span>${data.factors.familyIncomeFactor}%</span>
                                </div>
                                <div class="flex justify-between italic">
                                    <span>Dependents (20%):</span>
                                    <span>${data.factors.dependentsFactor}%</span>
                                </div>
                                <div class="flex justify-between italic">
                                    <span>Special Bonuses (Orphan/Disabled):</span>
                                    <span>+${data.factors.orphanedBonus + data.factors.disabledBonus} pts</span>
                                </div>
                                <div class="flex justify-between italic">
                                    <span>Academic performance:</span>
                                    <span>${data.factors.academicFactor}%</span>
                                </div>
                            </div>
                        </div>
                        <p class="text-[10px] text-gray-400 mt-4 leading-tight italic">
                            * Scores are calculated automatically by the TAADA engine based on submitted verifiable data.
                        </p>
                    </div>
                `,
                confirmButtonText: 'Close',
                confirmButtonColor: '#0052FF'
            });
        } catch (err: any) {
            Swal.fire('Error', 'Failed to load score breakdown', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        const confirmResult = await Swal.fire({
            title: 'Delete Application?',
            text: "Delete this application permanently?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it'
        });

        if (!confirmResult.isConfirmed) return;

        try {
            await api.delete(`/admin/applications/${id}`);
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Application deleted successfully'
            });
            queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to delete application', 'error');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const confirmResult = await Swal.fire({
            title: 'Save Changes?',
            text: "Save modifications to this application?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0052FF',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, save changes'
        });

        if (!confirmResult.isConfirmed) return;

        try {
            await api.put(`/admin/applications/${editApp!.id}`, {
                amount_requested: editApp!.amount_requested,
                cycle_year: editApp!.cycle_year
            });
            setEditApp(null);
            
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Application updated successfully'
            });
            queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to update application', 'error');
        }
    };

    const handleAutoEvaluate = async () => {
        const confirmResult = await Swal.fire({
            title: 'Run Auto-Evaluation?',
            text: "This will process all PENDING applications, automatically approving highly deserving ones and rejecting those who do not meet the minimum need score.",
            icon: 'warning',
            input: 'number',
            inputLabel: 'Enter the Cycle Year to evaluate (e.g. 2026)',
            inputValue: new Date().getFullYear().toString(),
            showCancelButton: true,
            confirmButtonText: 'Run Auto-Evaluation',
        });

        if (!confirmResult.isConfirmed || !confirmResult.value) return;

        Swal.fire({
            title: 'Evaluating...',
            text: 'Please wait while the system assesses the applications.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const res = await autoEvaluateApplications(parseInt(confirmResult.value, 10));
            const data = res.data;
            
            Swal.fire({
                title: 'Auto-Evaluation Complete',
                html: `
                    <div class="text-left mt-4 text-sm">
                        <p>Total Evaluated: <strong>${data.totalEvaluated}</strong></p>
                        <p class="text-green-600 mt-1">Approved: <strong>${data.approved}</strong></p>
                        <p class="text-red-600 mt-1">Rejected: <strong>${data.rejected}</strong></p>
                        <p class="text-yellow-600 mt-1">Left as Pending (Borderline): <strong>${data.stillPending}</strong></p>
                    </div>
                `,
                icon: 'success'
            });
            queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to run auto-evaluation', 'error');
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
                            
                            {editApp.document_url && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="font-semibold text-sm mb-2 text-gray-800">Attached Documents</h4>
                                    {Array.isArray(editApp.document_url) ? (
                                        <ul className="text-sm list-disc pl-4 space-y-1">
                                            {editApp.document_url.map((doc, idx) => (
                                                <li key={idx}><a href={`/${doc.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Legacy Doc {idx + 1}</a></li>
                                            ))}
                                        </ul>
                                    ) : typeof editApp.document_url === 'object' ? (
                                        <ul className="text-sm space-y-2">
                                            {Object.entries(editApp.document_url).map(([key, path]) => (
                                                <li key={key} className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                                                    <a href={`/${(path as string).replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">View File</a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>
                            )}
                        </form>
                    </Card>
                </div>
            )}

            <Card noPadding className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="border-0 bg-white shadow-sm rounded-md text-sm p-1 px-2 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type</label>
                            <select
                                value={bursaryType}
                                onChange={(e) => { setBursaryType(e.target.value); setPage(1); }}
                                className="border-0 bg-white shadow-sm rounded-md text-sm p-1 px-2 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="MCA">MCA</option>
                                <option value="CDF">CDF</option>
                                <option value="COUNTY">County</option>
                                <option value="NATIONAL">National</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort</label>
                            <select
                                value={sortField}
                                onChange={(e) => { setSortField(e.target.value); setPage(1); }}
                                className="border-0 bg-white shadow-sm rounded-md text-sm p-1 px-2 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="created_at">Date Applied</option>
                                <option value="need_score">Need Score</option>
                                <option value="amount_requested">Amount</option>
                                <option value="taada_flag">Priority Tier</option>
                            </select>
                            <select
                                value={sortOrder}
                                onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
                                className="border-0 bg-white shadow-sm rounded-md text-sm p-1 px-2 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="desc">Desc</option>
                                <option value="asc">Asc</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <Button 
                            onClick={handleAutoEvaluate} 
                            variant="primary" 
                            size="sm"
                            title="Automatically evaluate PENDING applications based on Need Scores"
                        >
                            Run Auto-Evaluation
                        </Button>
                    </div>
                </div>

                <TableContainer>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell>Course & Inst.</TableHeaderCell>
                            <TableHeaderCell>Amount</TableHeaderCell>
                            <TableHeaderCell>Priority (TAADA)</TableHeaderCell>
                            <TableHeaderCell>Need Score</TableHeaderCell>
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
                                        <div className="flex flex-col gap-1">
                                            <Badge variant={app.taada_flag === 'FIRST_TIME' ? 'info' : 'neutral'}>
                                                {app.taada_flag?.replace('_', ' ') || 'FIRST TIME'}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div 
                                            className={`
                                                inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm border-2 cursor-help transition-all hover:scale-110
                                                ${Number(app.need_score) >= 80 ? 'bg-green-50 border-green-200 text-green-700' : 
                                                  Number(app.need_score) >= 50 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 
                                                  'bg-red-50 border-red-200 text-red-700'}
                                            `}
                                            title="Click to view score breakdown"
                                            onClick={() => handleViewScoreBreakdown(app.id)}
                                        >
                                            {app.need_score || '0'}
                                        </div>
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
                            <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No applications found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </TableContainer>
                
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </Card>

        </div>
    );
}
