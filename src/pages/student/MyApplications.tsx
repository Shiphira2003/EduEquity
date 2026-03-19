import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyApplications } from '../../api/student.api';
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';

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
                title="Application Details"
            >
                {selectedApp ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Application ID</h4>
                                <p className="mt-1 text-sm text-gray-900">#{selectedApp.id}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                <Badge variant={getStatusVariant(selectedApp.status)}>{selectedApp.status}</Badge>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Financial Year</h4>
                                <p className="mt-1 text-sm text-gray-900">{selectedApp.financial_year || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Date Submitted</h4>
                                <p className="mt-1 text-sm text-gray-900">{new Date(selectedApp.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Placeholder for more details if they existed on the object */}
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">Additional documents and verification details would appear here.</p>
                        </div>

                        <div className="mt-5 sm:mt-6">
                            <Button
                                fullWidth
                                onClick={handleCloseModal}
                                variant="secondary"
                            >
                                Close
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
