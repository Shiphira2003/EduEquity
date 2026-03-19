import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getMyApplications } from '../../api/student.api';
import { useAuth } from '../../context/AuthContext';
import {
    FileText,
    CheckCircle2,
    AlertCircle,
    Clock,
    Calendar,
    ArrowRight,
    UserCircle,
    Bell
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
                const data = await getMyApplications();
                setApplications(data);
            } catch (err) {
                console.error("Failed to fetch applications", err);
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

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, <span className="font-semibold text-gray-900">{user?.email}</span></p>
                </div>
                <div>
                    <Link to="/student/apply">
                        <Button variant="primary" className="shadow-lg shadow-primary/20">
                            + New Application
                        </Button>
                    </Link>
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
                                <p className="text-sm text-gray-500 mb-4">
                                    {latestApp ? 'Latest status update' : 'Start a new application today'}
                                </p>

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

                        {/* Announcements Card */}
                        <Card className="p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-orange-50">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-orange-100/50 text-orange-600 rounded-xl">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">New</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Announcements</h3>
                                <p className="text-sm text-gray-500 mb-4">Submissions close on Feb 28th.</p>

                                <button className="text-sm font-medium text-orange-600 hover:text-orange-700">
                                    View All Notices
                                </button>
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
