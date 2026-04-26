import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import api from '../api/axios';
import { Users, FileText, Banknote, ClipboardList, Shield, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
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
        <div className="space-y-10 animate-fade-in">
            {/* Admin Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 pb-10">
                <div>
                    <h1 className="text-4xl font-black text-black tracking-tight mb-2">
                        Welcome back, <span className="text-primary">{user?.fullName ? user.fullName.split(' ')[0] : (user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Administrator')}</span>
                    </h1>
                    <p className="text-zinc-500 font-medium">BursarHub system-wide management and analytics overview.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors border border-gray-100 hover:border-primary/20 bg-white rounded-xl shadow-sm"
                    >
                        <Home size={18} />
                        Go Back Home
                    </button>
                    <div className={`flex items-center gap-2 px-4 py-2 ${user?.role === 'SUPER_ADMIN' ? 'bg-primary' : 'bg-zinc-900'} text-white rounded-xl shadow-lg`}>
                        <Shield size={18} className={user?.role === 'SUPER_ADMIN' ? 'text-white' : 'text-primary'} />
                        <span className="text-xs font-bold uppercase tracking-widest">{user?.role === 'SUPER_ADMIN' ? 'Super Admin Panel' : 'Admin Control Panel'}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">System Analytics Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/10"><Users size={22} /></div>
                            <div className="ml-4">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Students</p>
                                <p className="text-2xl font-bold text-black">{stats.total_students}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-primary text-white shadow-lg shadow-primary/20"><FileText size={22} /></div>
                            <div className="ml-4">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Applications</p>
                                <p className="text-2xl font-bold text-black">{stats.total_applications}</p>
                                <p className="text-[10px] font-bold text-primary mt-0.5">{stats.pending_applications} pending approval</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-black">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-zinc-100 text-black border border-zinc-200"><Banknote size={22} /></div>
                            <div className="ml-4">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Disbursed</p>
                                <p className="text-2xl font-bold text-black">KES {stats.total_disbursed.toLocaleString()}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-zinc-900 text-white"><ClipboardList size={22} /></div>
                            <div className="ml-4">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Audit Logs</p>
                                <p className="text-2xl font-bold text-black">{stats.total_audit_logs}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
