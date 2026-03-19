import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import api from '../api/axios';
import { Users, FileText, Banknote, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/analytics');
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
    if (!stats) return <div className="p-8 text-center text-red-500">Failed to load analytics</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">System Analytics Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600"><Users size={24} /></div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total_students}</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-indigo-100 text-indigo-600"><FileText size={24} /></div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Applications</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total_applications}</p>
                            <p className="text-xs text-indigo-500">{stats.pending_applications} pending</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600"><Banknote size={24} /></div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Disbursed</p>
                            <p className="text-2xl font-bold text-gray-900">KES {stats.total_disbursed.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-orange-100 text-orange-600"><ClipboardList size={24} /></div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Audit Logs</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total_audit_logs}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
