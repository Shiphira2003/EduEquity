import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { Card } from '../../components/Card';
import { Plus, Power, Banknote, PieChart, TrendingUp, Info, Edit3, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';

interface FundSource {
    id: number;
    name: string;
    description: string;
    budget_per_cycle: string;
    allocated_amount: string;
    disbursed_amount: string;
    cycle_year: number;
    is_open: boolean;
    start_date?: string;
    end_date?: string;
}

const STANDARD_TEMPLATES = [
    { name: 'NATIONAL', description: 'National Government Bursary Fund', budget: 1000000 },
    { name: 'CDF', description: 'Constituency Development Fund', budget: 500000 },
    { name: 'MCA', description: 'Member of County Assembly Bursary', budget: 300000 },
    { name: 'COUNTY', description: 'County Government Education Fund', budget: 700000 },
];

const AdminFundSources = () => {
    const [fundSources, setFundSources] = useState<FundSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [cycleYear, setCycleYear] = useState(new Date().getFullYear());

    const fetchFundSources = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/fund-sources/config/${cycleYear}`);
            setFundSources(res.data?.data || res.data || []);
        } catch (err: any) {
            console.error('Failed to fetch fund sources:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFundSources();
    }, [cycleYear]);

    // Summary Statistics Logic
    const totalYearBudget = fundSources.reduce((sum, s) => sum + parseFloat(s.budget_per_cycle), 0);
    const totalYearAllocated = fundSources.reduce((sum, s) => sum + parseFloat(s.allocated_amount), 0);
    const totalYearRemaining = totalYearBudget - totalYearAllocated;
    const overallUtilization = totalYearBudget > 0 ? (totalYearAllocated / totalYearBudget) * 100 : 0;

    const getUtilizationColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getUtilizationTextColor = (percentage: number) => {
        if (percentage >= 90) return 'text-red-700';
        if (percentage >= 70) return 'text-yellow-700';
        return 'text-green-700';
    };

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            maximumFractionDigits: 0
        }).format(Number(amount));
    };

    const handleToggleOpen = async (source: FundSource) => {
        const nextState = !source.is_open;
        let start_date = source.start_date ? new Date(source.start_date).toISOString().split('T')[0] : '';
        let end_date = source.end_date ? new Date(source.end_date).toISOString().split('T')[0] : '';

        if (nextState) {
            const dateResult = await Swal.fire({
                title: 'Open Cycle & Set Timeline',
                html:
                    '<label class="block text-sm text-left mb-1 mt-2 text-gray-700">Start Date (Optional)</label>' +
                    `<input id="swal-start-date" class="swal2-input !mt-0 !w-full" type="date" value="${start_date}">` +
                    '<label class="block text-sm text-left mb-1 mt-4 text-gray-700">End Date (Optional)</label>' +
                    `<input id="swal-end-date" class="swal2-input !mt-0 !w-full" type="date" value="${end_date}">`,
                focusConfirm: false,
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#2563EB',
                confirmButtonText: 'Open Cycle',
                preConfirm: () => {
                    return {
                        start_date: (document.getElementById('swal-start-date') as HTMLInputElement).value || null,
                        end_date: (document.getElementById('swal-end-date') as HTMLInputElement).value || null
                    };
                }
            });

            if (!dateResult.isConfirmed) return;
            
            start_date = dateResult.value.start_date;
            end_date = dateResult.value.end_date;
        } else {
            const confirmResult = await Swal.fire({
                title: 'Close Applications?',
                text: `Stop accepting new applications for ${source.name} ${source.cycle_year}.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6B7280',
                confirmButtonText: 'Yes, Close Cycle',
            });
            if (!confirmResult.isConfirmed) return;
        }

        try {
            await api.put(`/fund-sources/config/${source.id}`, {
                is_open: nextState,
                start_date: nextState ? start_date : null,
                end_date: nextState ? end_date : null
            });
            Swal.fire({
                title: 'Success!',
                text: `Cycle successfully ${nextState ? 'opened' : 'closed'}!`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            fetchFundSources();
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to update cycle state', 'error');
        }
    };

    const handleEditBudget = async (source: FundSource) => {
        const { value: newBudget } = await Swal.fire({
            title: `Update Budget for ${source.name}`,
            input: 'number',
            inputLabel: 'Budget Amount (KES)',
            inputValue: source.budget_per_cycle,
            showCancelButton: true,
            confirmButtonColor: '#2563EB',
            inputValidator: (value) => {
                if (!value || isNaN(parseFloat(value))) {
                    return 'You must enter a valid number';
                }
                return null;
            }
        });

        if (newBudget) {
            try {
                await api.put(`/fund-sources/config/${source.id}`, {
                    budget_per_cycle: parseFloat(newBudget)
                });
                Swal.fire('Updated!', 'The budget has been adjusted.', 'success');
                fetchFundSources();
            } catch (err: any) {
                Swal.fire('Error', err.response?.data?.message || 'Failed to update budget.', 'error');
            }
        }
    };

    const handleDeleteSource = async (source: FundSource) => {
        const confirmResult = await Swal.fire({
            title: 'Delete Fund Source?',
            text: `This will remove ${source.name} (${source.cycle_year}). This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it'
        });

        if (confirmResult.isConfirmed) {
            try {
                await api.delete(`/fund-sources/config/${source.id}`);
                Swal.fire('Deleted!', 'The fund source has been removed.', 'success');
                fetchFundSources();
            } catch (err: any) {
                Swal.fire('Error', err.response?.data?.message || 'Failed to delete fund source.', 'error');
            }
        }
    };

    const handleEditDates = async (source: FundSource) => {
        let start_date = source.start_date ? new Date(source.start_date).toISOString().split('T')[0] : '';
        let end_date = source.end_date ? new Date(source.end_date).toISOString().split('T')[0] : '';

        const dateResult = await Swal.fire({
            title: 'Edit Timeline',
            html:
                '<label class="block text-sm text-left mb-1 mt-2 text-gray-700">Start Date (Optional)</label>' +
                `<input id="swal-start-date" class="swal2-input !mt-0 !w-full" type="date" value="${start_date}">` +
                '<label class="block text-sm text-left mb-1 mt-4 text-gray-700">End Date (Optional)</label>' +
                `<input id="swal-end-date" class="swal2-input !mt-0 !w-full" type="date" value="${end_date}">`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#2563EB',
            confirmButtonText: 'Save Timeline',
            preConfirm: () => {
                return {
                    start_date: (document.getElementById('swal-start-date') as HTMLInputElement).value || null,
                    end_date: (document.getElementById('swal-end-date') as HTMLInputElement).value || null
                };
            }
        });

        if (dateResult.isConfirmed) {
            try {
                await api.put(`/fund-sources/config/${source.id}`, {
                    start_date: dateResult.value.start_date,
                    end_date: dateResult.value.end_date
                });
                Swal.fire({
                    title: 'Saved!',
                    text: `Timeline has been updated.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
                fetchFundSources();
            } catch (err: any) {
                Swal.fire('Error', err.response?.data?.message || 'Failed to update timeline', 'error');
            }
        }
    };

    const handleSetupTemplate = async (template: typeof STANDARD_TEMPLATES[0]) => {
        const { value: formValues } = await Swal.fire({
            title: `Setup ${template.name} Cycle`,
            html:
                `<input id="swal-input1" class="swal2-input" value="${template.name}" placeholder="Name">` +
                `<input id="swal-input2" class="swal2-input" value="${template.description}" placeholder="Description">` +
                `<input id="swal-input3" class="swal2-input" value="${cycleYear}" type="number" placeholder="Cycle Year">` +
                `<input id="swal-input4" class="swal2-input" value="${template.budget}" type="number" placeholder="Budget Per Cycle">`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Activate Template',
            confirmButtonColor: '#2563EB',
            preConfirm: () => {
                return {
                    name: (document.getElementById('swal-input1') as HTMLInputElement).value.toUpperCase(),
                    description: (document.getElementById('swal-input2') as HTMLInputElement).value,
                    cycle_year: parseInt((document.getElementById('swal-input3') as HTMLInputElement).value),
                    budget_per_cycle: parseFloat((document.getElementById('swal-input4') as HTMLInputElement).value)
                };
            }
        });

        if (formValues) {
            try {
                await api.post('/fund-sources', formValues);
                Swal.fire({
                    title: 'Activated!',
                    text: `${formValues.name} cycle for ${formValues.cycle_year} is now ready to be filled and opened.`,
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false
                });
                if (formValues.cycle_year === cycleYear) {
                    fetchFundSources();
                } else {
                    setCycleYear(formValues.cycle_year);
                }
            } catch (err: any) {
                Swal.fire('Error', err.response?.data?.message || 'Failed to activate template.', 'error');
            }
        }
    };

    const missingTemplates = STANDARD_TEMPLATES.filter(
        t => !fundSources.some(s => s.name === t.name)
    );

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-black tracking-tight mb-2">Fund Management Dashboard</h1>
                    <p className="text-zinc-500 font-medium tracking-tight">
                        Monitor budget utilization and application windows for {cycleYear}.
                    </p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={cycleYear}
                        onChange={(e) => setCycleYear(parseInt(e.target.value))}
                        className="bg-white border-zinc-200 rounded-xl text-sm font-bold shadow-sm focus:border-primary focus:ring-primary pl-4 pr-10"
                    >
                        <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                        <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                        <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                    </select>
                    <Button onClick={handleCreateSource} leftIcon={<Plus className="w-5 h-5" strokeWidth={3} />} className="bg-zinc-900 text-white hover:bg-black border-none px-6 py-6 rounded-xl font-bold shadow-xl shadow-zinc-200">
                        New Source
                    </Button>
                </div>
            </div>

            {/* Portfolio Summary Bar */}
            {!loading && fundSources.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
                    <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-zinc-100 rounded-xl text-zinc-900"><Banknote size={24} /></div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Budget</p>
                            <p className="text-lg font-black text-black">{formatCurrency(totalYearBudget)}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary text-blue-600"><TrendingUp size={24} /></div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Allocated</p>
                            <p className="text-lg font-black text-black">{formatCurrency(totalYearAllocated)}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-zinc-50 rounded-xl text-zinc-400"><PieChart size={24} /></div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Remaining</p>
                            <p className="text-lg font-black text-black">{formatCurrency(totalYearRemaining)}</p>
                        </div>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl shadow-zinc-200 flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Utilization</p>
                            <div className="flex items-end gap-2">
                                <p className="text-2xl font-black text-white leading-none">{overallUtilization.toFixed(1)}%</p>
                                <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden mb-1">
                                    <div className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${overallUtilization}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-zinc-500 font-medium">Crunching financial data...</p>
                </div>
            ) : fundSources.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-zinc-100 shadow-sm animate-fade-in">
                    <div className="p-6 bg-zinc-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <Info className="text-zinc-400 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-black mb-2">No Fund Sources Found</h2>
                    <p className="text-zinc-500 mb-8 max-w-sm mx-auto font-medium">Create your first fund source for {cycleYear} to begin the bursary allocation cycle.</p>
                    <Button onClick={async () => {
                        const confirmResult = await Swal.fire({
                            title: 'Initialize Fund Cycle?',
                            text: `This will create standard budget records (National, CDF, MCA, and County) for the ${cycleYear} cycle.`,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: '#2563EB',
                            confirmButtonText: 'Yes, Initialize'
                        });

                        if (confirmResult.isConfirmed) {
                            try {
                                await api.post('/fund-sources/initialize', { cycle_year: cycleYear });
                                Swal.fire('Initialized!', `The ${cycleYear} funding cycle is ready.`, 'success');
                                fetchFundSources();
                            } catch (err: any) {
                                Swal.fire('Error', err.response?.data?.message || 'Failed to initialize cycle.', 'error');
                            }
                        }
                    }} className="px-8 py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20">
                        Initialize {cycleYear} Cycle
                    </Button>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Active Cycles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {fundSources.map((source) => {
                            const budget = parseFloat(source.budget_per_cycle);
                            const allocated = parseFloat(source.allocated_amount);
                            const disbursed = parseFloat(source.disbursed_amount);
                            const progress = budget > 0 ? (allocated / budget) * 100 : 0;
                            const remaining = budget - allocated;

                            return (
                                <Card key={source.id} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-zinc-100 hover:border-primary/20 bg-white rounded-3xl p-0">
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h3 className="text-2xl font-black text-black tracking-tight leading-none mb-2">{source.name}</h3>
                                                <div className="flex gap-2">
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-500 uppercase tracking-widest">{source.cycle_year}</span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${source.is_open ? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-50 text-zinc-400 border-zinc-200'}`}>
                                                        {source.is_open ? 'Live & Accepting' : 'Paused / Closed'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleToggleOpen(source)}
                                                    className={`p-4 rounded-2xl shadow-lg transition-all text-white transform hover:-translate-y-1 active:scale-95 ${source.is_open ? 'bg-zinc-900 shadow-zinc-200' : 'bg-primary shadow-primary/20'}`}
                                                >
                                                    <Power className="h-5 w-5" strokeWidth={3} />
                                                </button>
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleEditBudget(source)}
                                                        className="p-2 bg-white border border-zinc-100 rounded-xl shadow-sm text-zinc-500 hover:text-primary hover:border-primary/20 transition-all"
                                                        title="Edit Budget"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSource(source)}
                                                        className="p-2 bg-white border border-zinc-100 rounded-xl shadow-sm text-zinc-500 hover:text-red-500 hover:border-red-200 transition-all"
                                                        title="Delete Source"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dashboard Metrics */}
                                        <div className="grid grid-cols-2 gap-8 mb-10">
                                            <div className="border-l-4 border-zinc-900 pl-4">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Budget</p>
                                                <p className="text-xl font-black text-black leading-tight">{formatCurrency(budget)}</p>
                                            </div>
                                            <div className="border-l-4 border-primary pl-4">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Remaining</p>
                                                <p className="text-xl font-black text-black leading-tight">{formatCurrency(remaining)}</p>
                                            </div>
                                        </div>

                                        {/* Utilization Progress */}
                                        <div className="mb-10">
                                            <div className="flex justify-between items-end mb-3">
                                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Allocation Priority</span>
                                                <span className={`text-sm font-black ${getUtilizationTextColor(progress)}`}>{progress.toFixed(1)}% Used</span>
                                            </div>
                                            <div className="w-full bg-zinc-100 rounded-full h-4 overflow-hidden p-1 border border-zinc-100 shadow-inner">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 shadow-lg ${getUtilizationColor(progress)}`} 
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Detailed Stats */}
                                        <div className="grid grid-cols-2 gap-4 bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                                            <div>
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Total Payouts</p>
                                                <p className="text-sm font-bold text-black">{formatCurrency(disbursed)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Committed Funds</p>
                                                <p className="text-sm font-bold text-black">{formatCurrency(allocated)}</p>
                                            </div>
                                        </div>

                                        {/* Timeline Actions */}
                                        <div className="mt-8 pt-8 border-t border-zinc-50 flex items-center justify-between">
                                            <div className="cursor-pointer group/date" onClick={() => handleEditDates(source)}>
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 group-hover/date:text-primary transition-colors">Window Schedule</p>
                                                <p className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                                                    {source.start_date ? new Date(source.start_date).toLocaleDateString() : '—'} 
                                                    <span className="text-zinc-300">to</span> 
                                                    {source.end_date ? new Date(source.end_date).toLocaleDateString() : '—'}
                                                </p>
                                            </div>
                                            <div className="flex items-center text-zinc-300">
                                                <TrendingUp size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Template / Suggested Sources */}
                    {missingTemplates.length > 0 && (
                        <div className="mt-16 pt-16 border-t border-zinc-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-zinc-100 rounded-2xl text-zinc-400"><PieChart size={24} strokeWidth={2.5} /></div>
                                <div>
                                    <h2 className="text-xl font-black text-black">Suggested Fund Cycles</h2>
                                    <p className="text-sm font-medium text-zinc-400">Ready-to-activate templates for common budget sources.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {missingTemplates.map((template) => (
                                    <div key={template.name} className="group bg-white border-2 border-dashed border-zinc-100 rounded-3xl p-6 hover:border-primary/40 hover:bg-zinc-50/50 transition-all duration-300">
                                        <div className="p-4 bg-zinc-50 rounded-2xl w-fit mb-6 group-hover:scale-110 group-hover:bg-primary/5 transition-all duration-500">
                                            <Banknote className="text-zinc-300 group-hover:text-primary" size={24} strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-lg font-black text-black mb-1 leading-none">{template.name}</h3>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{template.description}</p>
                                        <div className="mb-6">
                                            <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-0.5">EST. BUDGET</p>
                                            <p className="text-sm font-black text-zinc-500">{formatCurrency(template.budget)}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleSetupTemplate(template)}
                                            className="w-full py-4 bg-zinc-900 group-hover:bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-zinc-200 group-hover:shadow-primary/20 transition-all transform group-hover:-translate-y-1"
                                        >
                                            Setup Cycle
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            )}
        </div>
    );
};

export default AdminFundSources;
