import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table';
import api from '../../api/axios';
import { DownloadCloud, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Export Libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow as DocxTableRow, TableCell as DocxTableCell, TextRun, WidthType } from 'docx';

export default function AdminAuditLogs() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/audit-logs')
            .then(res => setLogs(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const formatJSON = (val: any) => {
        if (!val) return '-';
        if (typeof val === 'string') return val;
        return JSON.stringify(val);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("System Audit Logs", 14, 15);
        autoTable(doc, {
            head: [['ID', 'Date', 'Admin ID', 'Admin Email', 'Action', 'App ID', 'Progress Status']],
            body: logs.map(l => [
                l.id,
                new Date(l.created_at).toLocaleString(),
                l.system_id || 'System',
                l.admin_email || 'System',
                l.action,
                l.application_id || '-',
                formatJSON(l.new_value)
            ]),
            startY: 20,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] },
        });
        doc.save("Audit_Logs.pdf");
    };

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(logs.map(l => ({
            ID: l.id,
            Date: new Date(l.created_at).toLocaleString(),
            AdminID: l.system_id || 'System',
            AdminEmail: l.admin_email || 'System',
            Action: l.action,
            AppID: l.application_id || '-',
            ProgressStatus: formatJSON(l.new_value)
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "AuditLogs");
        XLSX.writeFile(wb, "Audit_Logs.xlsx");
    };

    const exportWord = async () => {
        const tableHeader = new DocxTableRow({
            children: ['ID', 'Date', 'Admin ID', 'Admin Email', 'Action', 'App ID', 'Progress Status'].map(h =>
                new DocxTableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
                    shading: { fill: '2980b9' }
                })
            )
        });

        const tableRows = logs.map(l => new DocxTableRow({
            children: [
                l.id.toString(),
                new Date(l.created_at).toLocaleString(),
                l.system_id || 'System',
                l.admin_email || 'System',
                l.action,
                (l.application_id || '-').toString(),
                formatJSON(l.new_value)
            ].map(text => new DocxTableCell({ children: [new Paragraph(text)] }))
        }));

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({ children: [new TextRun({ text: "System Audit Logs", bold: true, size: 28 })] }),
                    new Paragraph({ text: "" }),
                    new Table({
                        rows: [tableHeader, ...tableRows],
                        width: { size: 100, type: WidthType.PERCENTAGE }
                    })
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Audit_Logs.docx";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading audit logs...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <DownloadCloud size={16} /> Export As:
                    </span>
                    <Button size="sm" variant="outline" onClick={exportPDF}>PDF</Button>
                    <Button size="sm" variant="outline" onClick={exportExcel}>Excel</Button>
                    <Button size="sm" variant="outline" onClick={exportWord}>Word</Button>
                </div>
            </div>

            <Card noPadding className="overflow-hidden">
                <TableContainer>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>ID</TableHeaderCell>
                            <TableHeaderCell>Date</TableHeaderCell>
                            <TableHeaderCell>Admin ID</TableHeaderCell>
                            <TableHeaderCell>Admin Email</TableHeaderCell>
                            <TableHeaderCell>Action</TableHeaderCell>
                            <TableHeaderCell>App ID</TableHeaderCell>
                            <TableHeaderCell>Progress Status</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.length > 0 ? logs.map(l => (
                            <TableRow key={l.id}>
                                <TableCell>{l.id}</TableCell>
                                <TableCell>{new Date(l.created_at).toLocaleString()}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                        {l.system_id || 'SYSTEM'}
                                    </span>
                                </TableCell>
                                <TableCell>{l.admin_email || 'System'}</TableCell>
                                <TableCell className="font-medium text-gray-900">{l.action}</TableCell>
                                <TableCell>{l.application_id || '-'}</TableCell>
                                <TableCell className="text-xs text-green-600 max-w-xs truncate" title={formatJSON(l.new_value)}>{formatJSON(l.new_value)}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No audit logs found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </TableContainer>
            </Card>
        </div>
    );
}
