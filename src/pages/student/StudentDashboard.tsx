import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getMyApplications } from '../../api/student.api';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
    FileText,
    CheckCircle2,
    AlertCircle,
    Clock,
    Calendar,
    ArrowRight,
    UserCircle,
    Bell,
    Lock,
    Plus,
    Target
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [publicFundSources, setPublicFundSources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [latestRank, setLatestRank] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);
            // Clear state so message doesn't persist on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appData, fundData] = await Promise.all([
                    getMyApplications(),
                    api.get('/fund-sources/public')
                ]);
                setApplications(appData);
                setPublicFundSources(fundData.data?.data || []);

                // Fetch rank for the latest app if it's pending
                if (appData.length > 0 && appData[0].status === 'PENDING') {
                    try {
                        const rankRes = await api.get(`/ranking/student/${appData[0].id}`);
                        if (rankRes.data.success) {
                            setLatestRank(rankRes.data.data.rank);
                        }
                    } catch (e) {
                        console.error("Rank fetch failed", e);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setError("Failed to load application data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper to get latest application
    const latestApp = applications.length > 0 ? applications[0] : null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle2 className="w-5 h-5" />;
            case 'REJECTED': return <AlertCircle className="w-5 h-5" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    const now = new Date();
    const openBursaries = publicFundSources.filter(b => {
        if (!b.is_open) return false;
        if (b.start_date && now < new Date(b.start_date)) return false;
        if (b.end_date && now > new Date(b.end_date)) return false;
        return true;
    });

    const hasOpenBursaries = openBursaries.length > 0;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Personalized Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 pb-10 mb-2">
                <div className="animate-fade-in">
                    <h1 className="text-4xl font-black text-black tracking-tight mb-2">
                        Welcome back, <span className="text-primary">{user?.fullName ? user.fullName.split(' ')[0] : 'Student'}!</span>
                    </h1>
                    <p className="text-zinc-500 font-medium tracking-tight">Here's what's happening with your bursary applications.</p>
                </div>
                <div className="flex items-center gap-3">
                    {hasOpenBursaries ? (
                        <button 
                            onClick={() => navigate('/student/apply')}
                            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:opacity-95 transition-all flex items-center gap-3 transform hover:-translate-y-0.5 active:scale-95"
                        >
                            <Plus size={20} strokeWidth={3} />
                            Apply for Funds
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-400 rounded-xl font-bold text-xs uppercase tracking-widest cursor-not-allowed">
                            <Lock size={14} />
                            Applications Closed
                        </div>
                    )}
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-2 animate-slide-up">
                    <CheckCircle2 className="w-5 h-5" />
                    {successMessage}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Active Application Card */}
                        <Card className="p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-blue-50">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-100/50 text-blue-600 rounded-xl">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    {latestApp ? (
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(latestApp.status)}`}>
                                            {getStatusIcon(latestApp.status)}
                                            {latestApp.status}
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                            No Active Apps
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {latestApp ? `${latestApp.financial_year || 'Current'} Application` : 'No Active Application'}
                                </h3>
                                
                                {latestApp?.status === 'PENDING' && latestRank !== null && (
                                    <div className="flex items-center gap-2 mb-3 bg-blue-50 w-fit px-3 py-1 rounded-lg border border-blue-100">
                                        <Target size={14} className="text-blue-600" />
                                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Live Rank: #{latestRank}</span>
                                    </div>
                                )}

                                <p className="text-sm text-gray-500 mb-2">
                                    {latestApp ? 'Latest status update' : 'Start a new application today'}
                                </p>

                                {latestApp?.status === 'REJECTED' && latestApp.rejection_reason && (
                                    <div className="text-xs text-red-700 bg-red-50 border-l-2 border-red-500 p-2 mb-4 rounded-r shadow-sm">
                                        <strong className="font-semibold block mb-0.5">Reason for Rejection:</strong>
                                        {latestApp.rejection_reason}
                                    </div>
                                )}

                                <Link to="/student/applications" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 group-hover:gap-2 transition-all">
                                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </Card>

                        {/* Profile Completion Card */}
                        <Card className="p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-purple-50">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-100/50 text-purple-600 rounded-xl">
                                        <UserCircle className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-400">80%</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Profile Complete</h3>
                                <p className="text-sm text-gray-500 mb-4">Add bank details to verify account.</p>

                                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                    <div className="bg-purple-600 h-2 rounded-full transition-all duration-1000" style={{ width: '80%' }}></div>
                                </div>

                                <Link to="/student/profile" className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700">
                                    Complete Profile &rarr;
                                </Link>
                            </div>
                        </Card>

                        {/* Timelines Card */}
                        <Card className="p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-orange-50">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-orange-100/50 text-orange-600 rounded-xl">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">Updates</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Bursary Timelines</h3>
                                <div className="text-sm text-gray-500 mb-4 h-16 overflow-y-auto pr-1">
                                    {publicFundSources.length === 0 ? (
                                        <p>No timelines available.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {hasOpenBursaries ? openBursaries.map((b: any) => (
                                                <li key={b.id} className="flex flex-col text-xs border-l-2 border-green-500 pl-2 bg-green-50/50 p-1 rounded-r">
                                                    <span className="font-semibold text-green-700">{b.name} ({b.cycle_year}): Open</span>
                                                    <span className="text-gray-500">Closes: {b.end_date ? new Date(b.end_date).toLocaleDateString() : 'Ongoing'}</span>
                                                </li>
                                            )) : (
                                                <li className="flex flex-col text-xs border-l-2 border-red-500 pl-2 bg-red-50/50 p-1 rounded-r">
                                                    <span className="font-semibold text-red-700">All Bursaries Closed</span>
                                                    <span className="text-gray-500">Please wait for the next cycle.</span>
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </div>

                                <Link to="/student/apply" className="text-sm font-medium text-orange-600 hover:text-orange-700 mt-2 inline-block">
                                    {hasOpenBursaries ? "Apply Now \u2192" : "View Details \u2192"}
                                </Link>
                            </div>
                        </Card>
                    </div>

                    {/* Recent Activity Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                            <Button variant="ghost" size="sm" className="text-gray-500">View All</Button>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {applications.length > 0 ? (
                                applications.slice(0, 3).map((app, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">Application Submitted</p>
                                            <p className="text-xs text-gray-500">Bursary Application {app.financial_year}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(app.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <p>No recent activity to show.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentDashboard;
