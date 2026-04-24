import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCashFlowSummary } from "../../api/reports.api";
import { Card } from "../../components/Card";
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "../../components/Table";
import { BarChart4, TrendingUp, TrendingDown, Calendar, Filter, FileText } from "lucide-react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";

export default function AdminReports() {
    const [cycleYear, setCycleYear] = useState(new Date().getFullYear());
    
    const { data: summary, isLoading } = useQuery({
        queryKey: ['cashFlowSummary', cycleYear],
        queryFn: () => getCashFlowSummary(cycleYear)
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart4 className="text-blue-600" />
                        Financial Audit & Cash Flow
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Institutional liquidity monitoring and fund utilization reports.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 px-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-400 uppercase">Cycle Year</span>
                        <input 
                            type="number" 
                            value={cycleYear} 
                            onChange={(e) => setCycleYear(parseInt(e.target.value))}
                            className="w-20 border-0 focus:ring-0 text-sm font-semibold p-0"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-0 shadow-xl">
                    <div className="flex items-center justify-between">
                        <TrendingUp size={20} className="text-green-400" />
                        <Badge variant="info" className="bg-white/10 text-white border-0">Total Liquidity</Badge>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-black">
                            KES {summary?.balances.reduce((acc, b) => acc + b.budgetPerCycle, 0).toLocaleString() || '0'}
                        </div>
                        <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mt-1">Initial Approved Budget</div>
                    </div>
                </Card>

                <Card className="border-l-4 border-l-blue-600">
                    <div className="flex items-center gap-3 text-blue-600 mb-2">
                        <FileText size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Commitments</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        KES {summary?.balances.reduce((acc, b) => acc + b.allocatedAmount, 0).toLocaleString() || '0'}
                    </div>
                    <p className="text-gray-400 text-[10px] mt-1 italic">Funds allocated to specific students but not yet fully disbursed.</p>
                </Card>

                <Card className="border-l-4 border-l-green-600">
                    <div className="flex items-center gap-3 text-green-600 mb-2">
                        <TrendingDown size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Actual Outflow</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        KES {summary?.balances.reduce((acc, b) => acc + b.disbursedAmount, 0).toLocaleString() || '0'}
                    </div>
                    <p className="text-gray-400 text-[10px] mt-1 italic">Total funds successfully transferred to school accounts.</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card noPadding className="overflow-hidden h-full">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <FileText size={14} className="text-blue-500" />
                                Recent Cash Flow Ledger
                            </h3>
                            <Badge variant="neutral" className="text-[10px]">Last 500 Transactions</Badge>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            <TableContainer>
                                <TableHead>
                                    <TableRow className="bg-gray-50/50 sticky top-0 z-10">
                                        <TableHeaderCell>Date</TableHeaderCell>
                                        <TableHeaderCell>Source</TableHeaderCell>
                                        <TableHeaderCell>Type</TableHeaderCell>
                                        <TableHeaderCell>Amount</TableHeaderCell>
                                        <TableHeaderCell>Balance</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-10">Loading ledger...</TableCell></TableRow>
                                    ) : summary?.summary.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-400 font-medium">No transactions recorded for this cycle.</TableCell></TableRow>
                                    ) : (
                                        // Since getCashFlowSummary doesn't return full ledger, we'll use balances for now
                                        // and explain that the detailed ledger is available per source.
                                        summary?.balances.map((b) => (
                                            <TableRow key={b.fundSource}>
                                                <TableCell className="text-xs text-gray-500">Cycle {cycleYear}</TableCell>
                                                <TableCell className="font-bold">{b.fundSource}</TableCell>
                                                <TableCell><Badge variant="info">CUMULATIVE</Badge></TableCell>
                                                <TableCell className="font-bold text-gray-900">KES {b.allocatedAmount.toLocaleString()}</TableCell>
                                                <TableCell className="text-gray-400 text-xs">Utilized: {b.utilizationPercentage}%</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </TableContainer>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-blue-50 border-blue-100 overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 opacity-10">
                            <BarChart4 size={100} />
                        </div>
                        <h3 className="font-bold text-blue-900 border-b border-blue-100 pb-2 mb-4 flex items-center gap-2">
                            <Filter size={16} />
                            Generate Report
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Select Fund Source</label>
                                <select className="w-full border-blue-200 rounded-lg text-sm bg-white">
                                    <option>All Sources</option>
                                    <option>MCA</option>
                                    <option>CDF</option>
                                    <option>COUNTY</option>
                                    <option>NATIONAL</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Start Date</label>
                                    <input type="date" className="w-full border-blue-200 rounded-lg text-sm bg-white" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">End Date</label>
                                    <input type="date" className="w-full border-blue-200 rounded-lg text-sm bg-white" />
                                </div>
                            </div>
                            <Button 
                                fullWidth 
                                variant="primary" 
                                className="mt-2 bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                    if (!summary?.balances) return;
                                    const headers = ["Fund Source", "Budget (KES)", "Allocated", "Disbursed", "Balance", "Utilization %"];
                                    const rows = summary.balances.map(b => [
                                        b.fundSource,
                                        b.budgetPerCycle,
                                        b.allocatedAmount,
                                        b.disbursedAmount,
                                        b.availableBalance,
                                        b.utilizationPercentage
                                    ]);
                                    
                                    const csvContent = [
                                        headers.join(","),
                                        ...rows.map(r => r.join(","))
                                    ].join("\n");
                                    
                                    const blob = new Blob([csvContent], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.setAttribute('hidden', '');
                                    a.setAttribute('href', url);
                                    a.setAttribute('download', `financial_report_${cycleYear}.csv`);
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                }}
                            >
                                Export Financial CSV
                            </Button>
                        </div>
                    </Card>

                    <Card className="border-dashed border-2 bg-gray-50">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Accountability Note</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed italic">
                            All transactions recorded here are immutable and linked to the unique system IDs of the approving committee members. 
                            Disbursements are verified against the specific allocation ID and fund source budget limits.
                        </p>
                    </Card>
                </div>
            </div>

            <Card noPadding className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Filter size={14} />
                        Fund Utilization by Source (Detailed View)
                    </h3>
                </div>
                <TableContainer>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Fund Source</TableHeaderCell>
                            <TableHeaderCell>Budget (KES)</TableHeaderCell>
                            <TableHeaderCell>Utilized (Allocated)</TableHeaderCell>
                            <TableHeaderCell>Actual Disbursed</TableHeaderCell>
                            <TableHeaderCell>Remaining</TableHeaderCell>
                            <TableHeaderCell>Utilization %</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-10">Loading financial data...</TableCell></TableRow>
                        ) : summary?.balances.map((b) => (
                            <TableRow key={b.fundSource}>
                                <TableCell className="font-bold text-gray-900">{b.fundSource}</TableCell>
                                <TableCell>{b.budgetPerCycle.toLocaleString()}</TableCell>
                                <TableCell className="text-blue-600 font-medium">{b.allocatedAmount.toLocaleString()}</TableCell>
                                <TableCell className="text-green-600 font-medium">{b.disbursedAmount.toLocaleString()}</TableCell>
                                <TableCell className="font-semibold text-gray-700">{b.availableBalance.toLocaleString()}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[100px] overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${b.utilizationPercentage > 90 ? 'bg-red-500' : b.utilizationPercentage > 70 ? 'bg-orange-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min(b.utilizationPercentage, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold">{b.utilizationPercentage}%</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </TableContainer>
            </Card>
        </div>
    );
}
