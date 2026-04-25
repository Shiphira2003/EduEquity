import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyApplications } from '../../api/student.api';
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { CheckCircle2, Clock, XCircle, FileText, Banknote, AlertCircle } from 'lucide-react';

const MyApplications: React.FC = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const data = await getMyApplications();
                setApplications(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            case 'PENDING': return 'warning';
            default: return 'neutral';
        }
    };

    const handleViewDetails = (app: any) => {
        setSelectedApp(app);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedApp(null);
    };

    const formatCurrency = (amount: string | number | undefined) => {
        if (!amount) return 'KES 0.00';
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(Number(amount));
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading applications...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
                <Button
                    size="sm"
                    onClick={() => navigate('/student/apply')}
                >
                    Start New Application
                </Button>
            </div>

            <Card noPadding>
                <TableContainer>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Application ID</TableHeaderCell>
                            <TableHeaderCell>Year</TableHeaderCell>
                            <TableHeaderCell>Date Submitted</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Actions</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applications.length > 0 ? applications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell className="font-medium text-gray-900">#{app.id}</TableCell>
                                <TableCell>{app.financial_year || '-'}</TableCell>
                                <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(app.status)}>
                                        {app.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => handleViewDetails(app)}
                                        className="text-blue-600 hover:text-blue-900 font-medium"
                                    >
                                        View Details
                                    </button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell className="text-center text-gray-500" colSpan={5}>
                                    No applications found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </TableContainer>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Application Traceability Summary"
            >
                {selectedApp ? (
                    <div className="space-y-6">
                        {/* Summary Headers */}
                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Application ID</h4>
                                <p className="mt-1 text-sm font-bold text-gray-900">#{selectedApp.id} ({selectedApp.financial_year || 'N/A'})</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested Award</h4>
                                <p className="mt-1 text-sm font-bold text-gray-900">{formatCurrency(selectedApp.amount_requested)}</p>
                            </div>
                        </div>

                        {/* HELB-style Timeline Status */}
                        <div className="relative pl-4 space-y-8 before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                            {/* Step 1: Submission */}
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-blue-500 shrink-0 shadow z-10">
                                    <FileText className="w-3 h-3 text-white" />
                                </div>
                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 md:pl-4">
                                    <div className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm">
                                        <span className="font-bold text-slate-900 text-sm">Application Received</span>
                                        <span className="text-xs text-slate-500">{new Date(selectedApp.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Verification/Review */}
                            <div className="relative flex items-center justify-between md:justify-normal md:even:flex-row-reverse group is-active">
                                <div className={`flex items-center justify-center w-6 h-6 rounded-full border border-white shrink-0 shadow z-10 ${selectedApp.status === 'PENDING' ? 'bg-amber-400' : 'bg-blue-500'}`}>
                                    {selectedApp.status === 'PENDING' ? <Clock className="w-3 h-3 text-white" /> : <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 md:pr-4">
                                    <div className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm text-right">
                                        <span className="font-bold text-slate-900 text-sm">Verification & Vetting</span>
                                        <span className="text-xs text-slate-500">
                                            {selectedApp.status === 'PENDING' ? 'Currently Under Review' : 'Vetting Completed'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Decision/Award */}
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                <div className={`flex items-center justify-center w-6 h-6 rounded-full border border-white shrink-0 shadow z-10 ${
                                    (selectedApp.status === 'APPROVED' || selectedApp.status === 'COMPLETED') ? 'bg-green-500' :
                                    selectedApp.status === 'REJECTED' ? 'bg-red-500' : 'bg-slate-300'
                                }`}>
                                    {(selectedApp.status === 'APPROVED' || selectedApp.status === 'COMPLETED') ? <CheckCircle2 className="w-3 h-3 text-white" /> :
                                     selectedApp.status === 'REJECTED' ? <XCircle className="w-3 h-3 text-white" /> : <AlertCircle className="w-3 h-3 text-white" />}
                                </div>
                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 md:pl-4">
                                    <div className={`flex flex-col p-3 rounded-lg border shadow-sm ${
                                        (selectedApp.status === 'APPROVED' || selectedApp.status === 'COMPLETED') ? 'bg-green-50 border-green-100' :
                                        selectedApp.status === 'REJECTED' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
                                    }`}>
                                        <span className="font-bold text-slate-900 text-sm">Award Status: <Badge variant={getStatusVariant(selectedApp.status)}>{selectedApp.status}</Badge></span>
                                        {(selectedApp.status === 'APPROVED' || selectedApp.status === 'COMPLETED') && (
                                            <span className="text-sm font-bold text-green-700 mt-1">Awarded: {formatCurrency(selectedApp.amount_allocated)}</span>
                                        )}
                                        {selectedApp.status === 'REJECTED' && (
                                            <span className="text-xs text-red-600 mt-1">{selectedApp.rejection_reason || 'Does not meet the criteria threshold for this cycle.'}</span>
                                        )}
                                        {selectedApp.status === 'PENDING' && (
                                            <span className="text-xs text-slate-500 mt-1">Awaiting final decision</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Step 4: Disbursement History */}
                            {(selectedApp.status === 'APPROVED' || selectedApp.status === 'COMPLETED') && (
                                <div className="relative flex items-center justify-between md:justify-normal md:even:flex-row-reverse group">
                                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border border-white shrink-0 shadow z-10 ${
                                        (selectedApp.disbursement_status === 'PROCESSED' || selectedApp.status === 'COMPLETED') ? 'bg-blue-500' : 'bg-slate-300'
                                    }`}>
                                        <Banknote className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 md:pr-4">
                                        <div className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm text-right">
                                            <span className="font-bold text-slate-900 text-sm">Disbursement Status</span>
                                            <span className="text-xs text-slate-500 mt-1">
                                                {(selectedApp.disbursement_status === 'PROCESSED' || selectedApp.status === 'COMPLETED')
                                                    ? 'Funds have been dispatched to your institution.'
                                                    : 'Awaiting batch disbursement.'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <Button fullWidth onClick={handleCloseModal} variant="secondary">
                                Close Summary
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">Loading details...</div>
                )}
            </Modal>
        </div>
    );
};

export default MyApplications;
