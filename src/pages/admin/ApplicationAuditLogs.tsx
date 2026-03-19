import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuditLogs } from "../../api/applications.api";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "../../components/Table";

type AuditLog = {
    id: number;
    user_id: number;
    admin_email: string;
    action: string;
    old_value: Record<string, any> | null;
    new_value: Record<string, any> | null;
    created_at: string;
};

const ChangeValueDisplay = ({ value }: { value: Record<string, any> | null }) => {
    if (!value) return <span className="text-gray-400 italic text-sm">-</span>;

    return (
        <div className="space-y-1.5 p-2 bg-gray-50/50 rounded-lg border border-gray-100/50">
            {Object.entries(value).map(([key, val]) => (
                <div key={key} className="text-sm flex flex-col sm:flex-row sm:items-baseline gap-1">
                    <span className="font-semibold text-xs uppercase tracking-wide text-gray-500 w-32 shrink-0">
                        {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-gray-900 font-medium break-all">
                        {typeof val === "number" && (key.includes("amount") || key.includes("price"))
                            ? val.toLocaleString(undefined, { minimumFractionDigits: 2 })
                            : String(val)}
                    </span>
                </div>
            ))}
        </div>
    );
};



const ApplicationAuditLogs = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                if (!id) return;

                const response = await getAuditLogs(Number(id));
                setLogs(response.audit_logs || []);
            } catch (error) {
                console.error("Failed to load audit logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading audit trail...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-2"
                    >
                        <svg className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-text tracking-tight">Audit Trail</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Viewing history for Application <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">#{id}</span>
                    </p>
                </div>
            </div>

            {/* Content Card */}
            <Card noPadding>
                {logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No history found</h3>
                        <p className="mt-1 text-gray-500 max-w-sm mx-auto">
                            There are no audit records recorded for this application yet.
                        </p>
                    </div>
                ) : (
                    <TableContainer>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Action</TableHeaderCell>
                                <TableHeaderCell>Administrator</TableHeaderCell>
                                <TableHeaderCell className="w-1/4">Old Value</TableHeaderCell>
                                <TableHeaderCell className="w-1/4">New Value</TableHeaderCell>
                                <TableHeaderCell>Timestamp</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <Badge variant={
                                            log.action === 'APPROVED' ? 'success' :
                                                log.action === 'REJECTED' ? 'error' :
                                                    log.action === 'PENDING' ? 'warning' : 'neutral'
                                        }>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mr-3">
                                                {log.admin_email[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{log.admin_email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <ChangeValueDisplay value={log.old_value} />
                                    </TableCell>
                                    <TableCell>
                                        <ChangeValueDisplay value={log.new_value} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">
                                                {new Date(log.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(log.created_at).toLocaleTimeString(undefined, {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableContainer>
                )}
            </Card>
        </div>
    );
};

export default ApplicationAuditLogs;
