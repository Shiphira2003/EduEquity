import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { CheckCircle2, Clock, XCircle, FileText, Banknote, AlertCircle, ChevronDown, Target, Users, Zap, Award, BarChart4, Calendar } from 'lucide-react';

interface ApplicationData {
    id: number;
    cycle_year: number;
    amount_requested: string;
    amount_allocated: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    taada_flag: string;
    created_at: string;
    rejection_reason?: string;
    disbursement_status?: 'PENDING' | 'APPROVED' | 'PROCESSED' | null;
}

interface RankingData {
    applicationId: number;
    rank: number | null;
    totalApplicants: number;
    needScore: number;
    taadaFlag: string;
    percentile: number | null;
    recommendedAllocation: number;
}

const TrackStatus: React.FC = () => {
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
    const [rankingData, setRankingData] = useState<RankingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBreakdown, setShowBreakdown] = useState(false);

    useEffect(() => {
        const fetchMyApplications = async () => {
            try {
                const res = await api.get('/applications/my-applications');
                setApplications(res.data);
                if (res.data.length > 0) {
                    setSelectedApp(res.data[0]); // Select most recent by default
                }
            } catch (err) {
                console.error("Failed to fetch applications", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyApplications();
    }, []);

    useEffect(() => {
        if (!selectedApp) return;

        const fetchRankingData = async () => {
            try {
                const res = await api.get(`/ranking/student/${selectedApp.id}`);
                if (res.data.success) {
                    setRankingData(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch ranking", err);
            }
        };

        fetchRankingData();
        const interval = setInterval(fetchRankingData, 30000); // 30s auto-refresh

        return () => clearInterval(interval);
    }, [selectedApp]);

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(Number(amount));
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="max-w-4xl mx-auto w-full py-12 flex items-center justify-center">
                <div className="text-center bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-200 w-full">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Applications Found</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        You haven't submitted any bursary applications yet. Start an application to track its progress here.
                    </p>
                    <Link to="/student/apply" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:opacity-90 transition">
                        Apply Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Track Your Status</h1>
                        <p className="mt-2 text-gray-600">Follow the progress of your bursary application.</p>
                    </div>

                    {/* Application Selector */}
                    {applications.length > 1 && (
                        <div className="relative inline-block w-full sm:w-64">
                            <select
                                className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-white shadow-sm font-medium"
                                value={selectedApp?.id || ''}
                                onChange={(e) => {
                                    const app = applications.find(a => a.id === Number(e.target.value));
                                    if (app) setSelectedApp(app);
                                }}
                            >
                                {applications.map(app => (
                                    <option key={app.id} value={app.id}>
                                        {app.cycle_year} Cycle - {formatCurrency(app.amount_requested)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {selectedApp && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Summary Header */}
                        <div className="bg-gray-50 px-6 py-6 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Application ID: #{selectedApp.id}</p>
                                <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedApp.cycle_year} Application Cycle</h2>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-sm text-gray-500">Requested Amount</p>
                                <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedApp.amount_requested)}</p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="px-6 py-10 sm:px-10">
                            <div className="relative">
                                {/* Vertical line */}
                                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200" aria-hidden="true" />

                                <ul className="space-y-12 relative">
                                    {/* STEP 1: SUBMITTED */}
                                    <li className="relative flex items-start group">
                                        <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 shrink-0 shadow-sm shadow-blue-200">
                                            <FileText className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="ml-6 flex-1 pt-1">
                                            <h3 className="text-lg font-bold text-gray-900">Application Submitted</h3>
                                            <p className="mt-1 text-sm text-gray-600">Your application was successfully received on {formatDate(selectedApp.created_at)}.</p>
                                        </div>
                                    </li>

                                    {/* STEP 2: REVIEW */}
                                    <li className="relative flex items-start group">
                                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full shrink-0 shadow-sm ${
                                            selectedApp.status === 'PENDING' ? 'bg-blue-100 border-2 border-blue-600' : 'bg-blue-600 shadow-blue-200'
                                        }`}>
                                            {selectedApp.status === 'PENDING' ? (
                                                <Clock className="h-6 w-6 text-blue-600 animate-pulse" />
                                            ) : (
                                                <CheckCircle2 className="h-6 w-6 text-white" />
                                            )}
                                        </div>
                                        <div className="ml-6 flex-1 pt-1">
                                            <h3 className="text-lg font-bold text-gray-900">Under Review</h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {selectedApp.status === 'PENDING' 
                                                    ? 'The vetting committee is currently reviewing your documents and financial need assessment.'
                                                    : 'Review process completed.'}
                                            </p>
                                        </div>
                                    </li>

                                    {/* STEP 3: DECISION */}
                                    <li className="relative flex items-start group">
                                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full shrink-0 shadow-sm ${
                                            (selectedApp.status === 'APPROVED' || selectedApp.status === 'COMPLETED') ? 'bg-green-600 shadow-green-200' : 
                                            selectedApp.status === 'REJECTED' ? 'bg-red-600 shadow-red-200' : 'bg-gray-100 border-2 border-gray-300'
                                        }`}>
                                            {(selectedApp.status === 'APPROVED' || selectedApp.status === 'COMPLETED') ? <CheckCircle2 className="h-6 w-6 text-white" /> :
                                             selectedApp.status === 'REJECTED' ? <XCircle className="h-6 w-6 text-white" /> :
                                             <AlertCircle className="h-6 w-6 text-gray-400" />}
                                        </div>
                                        <div className="ml-6 flex-1 pt-1">
                                            <h3 className={`text-lg font-bold ${
                                                (selectedApp.status === 'APPROVED' || selectedApp.status === 'COMPLETED') ? 'text-green-700' : 
                                                selectedApp.status === 'REJECTED' ? 'text-red-700' : 'text-gray-500'
                                            }`}>
                                                {(selectedApp.status === 'APPROVED' || selectedApp.status === 'COMPLETED') ? 'Application Approved' : 
                                                 selectedApp.status === 'REJECTED' ? 'Application Rejected' : 'Final Decision'}
                                            </h3>
                                            
                                            {(selectedApp.status === 'APPROVED' || selectedApp.status === 'COMPLETED') && (
                                                <div className="mt-3 bg-green-50 p-4 rounded-lg border border-green-100 inline-block">
                                                    <p className="text-sm font-medium text-green-900">Allocated Amount: <span className="text-lg font-bold ml-1">{formatCurrency(selectedApp.amount_allocated)}</span></p>
                                                </div>
                                            )}
                                            
                                            {selectedApp.status === 'REJECTED' && (
                                                <div className="mt-3 bg-red-50 p-4 rounded-lg border border-red-100">
                                                    <p className="text-sm font-medium text-red-900">Reason: {selectedApp.rejection_reason || 'Does not meet the threshold criteria for this cycle.'}</p>
                                                </div>
                                            )}

                                            {selectedApp.status === 'PENDING' && (
                                                <p className="mt-1 text-sm text-gray-500">Awaiting committee decision.</p>
                                            )}
                                        </div>
                                    </li>

                                    {/* STEP 4: DISBURSEMENT */}
                                    {(selectedApp.status === 'APPROVED' || selectedApp.status === 'COMPLETED') && (
                                        <li className="relative flex items-start group">
                                            <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full shrink-0 shadow-sm ${
                                                (selectedApp.disbursement_status === 'PROCESSED' || selectedApp.status === 'COMPLETED') ? 'bg-blue-600 shadow-blue-200' :
                                                'bg-blue-50 border-2 border-blue-400'
                                            }`}>
                                                {(selectedApp.disbursement_status === 'PROCESSED' || selectedApp.status === 'COMPLETED') ? (
                                                    <CheckCircle2 className="h-6 w-6 text-white" />
                                                ) : (
                                                    <Banknote className={`h-6 w-6 ${selectedApp.disbursement_status ? 'text-blue-500' : 'text-gray-400'}`} />
                                                )}
                                            </div>
                                            <div className="ml-6 flex-1 pt-1">
                                                <h3 className={`text-lg font-bold ${(selectedApp.disbursement_status === 'PROCESSED' || selectedApp.status === 'COMPLETED') ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    Disbursement
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {selectedApp.status === 'COMPLETED' || selectedApp.disbursement_status === 'PROCESSED'
                                                        ? `Funds have been processed and dispatched to your institution's bank account.`
                                                        : selectedApp.disbursement_status === 'APPROVED'
                                                        ? 'Disbursement has been approved and is queued for processing.'
                                                        : 'Awaiting disbursement scheduling.'}
                                                </p>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

            {/* Ranking and Transparency Card */}
            {rankingData && (selectedApp?.status === 'PENDING' || selectedApp?.status === 'APPROVED') && (
                <div className="mt-8 mb-8 bg-blue-900 text-white rounded-2xl shadow-xl overflow-hidden border border-blue-800 animate-slide-up">
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        {/* Live Rank Circle */}
                        <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-blue-800/50 pb-6 md:pb-0">
                            <div className="relative mb-3">
                                <div className="w-24 h-24 rounded-full border-4 border-blue-400/30 flex items-center justify-center">
                                    <span className="text-4xl font-black">#{rankingData.rank || '??'}</span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-blue-400 text-blue-900 p-1.5 rounded-lg shadow-lg">
                                    <Target size={16} strokeWidth={3} />
                                </div>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Live Rank</p>
                            <p className="text-sm font-medium mt-1">out of {rankingData.totalApplicants} applicants</p>
                        </div>

                        {/* Need Score & Percentile */}
                        <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-blue-800/50 pb-6 md:pb-0">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="text-blue-400 w-5 h-5" />
                                <span className="text-sm font-bold uppercase tracking-wider text-blue-100">Need Score: {rankingData.needScore}/100</span>
                            </div>
                            
                            <div className="w-full bg-blue-950/50 rounded-full h-3 mb-4 overflow-hidden border border-blue-800/50">
                                <div 
                                    className="bg-blue-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(96,165,250,0.5)]" 
                                    style={{ width: `${rankingData.needScore}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-blue-300 font-medium">Standard Priority</span>
                                <span className="px-2 py-0.5 bg-blue-400/20 text-blue-300 rounded-md font-bold uppercase tracking-tighter">
                                    {rankingData.percentile ? `Top ${rankingData.percentile}%` : 'Calculating...'}
                                </span>
                            </div>
                        </div>

                        {/* Explanation/Transparency Button */}
                        <div className="flex flex-col items-center md:items-start justify-center">
                            <h4 className="text-sm font-bold mb-2">Algorithm Transparency</h4>
                            <p className="text-xs text-blue-200 mb-4 leading-relaxed">
                                Your rank is live! It changes as new applications are assessed and vetted by the committee.
                            </p>
                            <button 
                                onClick={() => setShowBreakdown(!showBreakdown)}
                                className="flex items-center gap-2 bg-blue-800 hover:bg-white hover:text-blue-900 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-blue-700"
                            >
                                <Zap size={14} />
                                {showBreakdown ? 'Hide Breakdown' : 'Show Scoring Breakdown'}
                                <ChevronDown className={`transition-transform duration-300 ${showBreakdown ? 'rotate-180' : ''}`} size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Expandable Breakdown */}
                    {showBreakdown && (
                        <div className="bg-blue-950/50 border-t border-blue-800 p-6 md:p-8 animate-fade-in">
                            <div className="mb-6 flex items-center gap-3">
                                <BarChart4 className="text-blue-400" />
                                <h3 className="text-lg font-bold">How Your Priority is Calculated</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs text-blue-300 font-bold uppercase tracking-wide">Socio-Economic Factors (90%)</span>
                                        <span className="text-xs font-mono">Calculated from your profile</span>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Family Income (Weighted 40%)', icon: <Banknote size={14}/>, value: 'High Priority' },
                                            { label: 'Dependents (Weighted 20%)', icon: <Users size={14}/>, value: 'Assessed' },
                                            { label: 'Special Status (Special Bonus)', icon: <Target size={14}/>, value: rankingData.taadaFlag === 'FIRST_TIME' ? 'Bonus Applied' : 'Standard' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between bg-blue-900/30 p-3 rounded-lg border border-blue-800/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-blue-800/50 rounded-md text-blue-300">
                                                        {item.icon}
                                                    </div>
                                                    <span className="text-sm font-medium">{item.label}</span>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase text-blue-400">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-800/50 flex flex-col justify-center">
                                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-400" />
                                        Fairness Algorithm (TAADA)
                                    </h4>
                                    <p className="text-xs text-blue-200 leading-relaxed mb-4">
                                        The <strong>Tiered Allocation & Anti-Duplication Algorithm</strong> ensures that:
                                    </p>
                                    <ul className="text-xs space-y-2 text-blue-200/80">
                                        <li className="flex gap-2">
                                            <span className="text-blue-400 font-bold">✓</span>
                                            First-time applicants receive significant priority (Equity).
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-blue-400 font-bold">✓</span>
                                            Waitlisted students move up the rank automatically over time.
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-blue-400 font-bold">✓</span>
                                            Funding is distributed starting from rank #1 until the budget is depleted.
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-blue-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                                <p>Next Update in 30 Seconds</p>
                                <Link to="/public-ledger" className="hover:text-white transition-colors">View Anonymous Ranking Ledger &rarr;</Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
            </div>
        </div>
    );
};

export default TrackStatus;
