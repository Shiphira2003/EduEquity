import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRankedApplications, type ApplicationRanking, updateApplicationStatus } from "../../api/admin.api";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "../../components/Table";
import { Award, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminRanking() {
    const queryClient = useQueryClient();
    const [cycleYear, setCycleYear] = useState(new Date().getFullYear());
    const [bursaryType, setBursaryType] = useState<string>("");

    const { data: rankings = [], isLoading, refetch } = useQuery({
        queryKey: ['adminRanking', cycleYear, bursaryType],
        queryFn: () => getRankedApplications(cycleYear, bursaryType)
    });

    const approveMutation = useMutation({
        mutationFn: ({ appId, amount }: { appId: number, amount: number }) => 
            updateApplicationStatus(appId.toString(), "APPROVED", amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminRanking'] });
            queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
        }
    });

    const handleQuickApprove = async (rank: ApplicationRanking) => {
        const confirmResult = await Swal.fire({
            title: 'Quick Approve?',
            html: `
                <div class="text-left text-sm">
                    <p>Approve application for <strong>${rank.studentName}</strong>?</p>
                    <p class="mt-2">Recommended Allocation: <strong class="text-green-600">KES ${rank.recommendedAllocation}</strong></p>
                    <p class="text-gray-400 text-xs mt-1">(Based on Rank #${rank.rank} and Need Score ${rank.needScore})</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Approve',
            confirmButtonColor: '#0052FF'
        });

        if (confirmResult.isConfirmed) {
            approveMutation.mutate({ appId: rank.applicationId, amount: rank.recommendedAllocation });
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Approved!',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    const handleBulkApprove = async () => {
        const top5 = rankings.slice(0, 5);
        if (top5.length === 0) return;

        const confirmResult = await Swal.fire({
            title: 'Bulk Approve Top 5?',
            text: `This will approve the top 5 most deserving students based on their TAADA scores and recommended allocations.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Proceed with Bulk Approval',
            confirmButtonColor: '#0052FF'
        });

        if (confirmResult.isConfirmed) {
            Swal.fire({ title: 'Processing...', didOpen: () => Swal.showLoading() });
            
            try {
                for (const rank of top5) {
                    await updateApplicationStatus(rank.applicationId.toString(), "APPROVED", rank.recommendedAllocation);
                }
                Swal.fire('Success', 'Top 5 applications approved successfully', 'success');
                refetch();
            } catch (err) {
                Swal.fire('Error', 'Some applications failed to approve', 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Award className="text-blue-600" />
                        Equity Ranking Dashboard
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Applications prioritized by TAADA need scores and priority tiers.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 px-2 border-r border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase">Year</span>
                        <input 
                            type="number" 
                            value={cycleYear} 
                            onChange={(e) => setCycleYear(parseInt(e.target.value))}
                            className="w-20 border-0 focus:ring-0 text-sm font-semibold p-0"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Fund</span>
                        <select 
                            value={bursaryType} 
                            onChange={(e) => setBursaryType(e.target.value)}
                            className="border-0 focus:ring-0 text-sm font-semibold p-0 bg-transparent"
                        >
                            <option value="">All Types</option>
                            <option value="NATIONAL">National</option>
                            <option value="COUNTY">County</option>
                            <option value="CDF">CDF</option>
                            <option value="MCA">MCA</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg shadow-blue-200">
                    <div className="flex items-center justify-between">
                        <TrendingUp size={24} className="text-blue-200" />
                        <Badge variant="info" className="bg-white/20 text-white border-0">Algorithm Active</Badge>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold">{rankings.length}</div>
                        <div className="text-blue-100 text-sm">Ranked Candidates Pending</div>
                    </div>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500">Top Priority</div>
                            <div className="text-xl font-bold">{rankings.filter(r => r.taadaFlag === 'FIRST_TIME').length} First-Timers</div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <Button 
                        variant="outline" 
                        fullWidth 
                        onClick={handleBulkApprove} 
                        className="h-full border-dashed border-2 hover:border-blue-600 hover:text-blue-600 group"
                        disabled={rankings.length === 0}
                    >
                        <div className="flex flex-col items-center py-2">
                            <CheckCircle2 className="mb-1 text-gray-400 group-hover:text-blue-600" />
                            <span className="font-bold">Bulk Approve Top 5</span>
                            <span className="text-[10px] text-gray-400">Apply recommended allocations automatically</span>
                        </div>
                    </Button>
                </Card>
            </div>

            <Card noPadding className="overflow-hidden">
                <TableContainer>
                    <TableHead>
                        <TableRow className="bg-gray-50">
                            <TableHeaderCell className="w-16">Rank</TableHeaderCell>
                            <TableHeaderCell>Student Name</TableHeaderCell>
                            <TableHeaderCell>Equity Metrics</TableHeaderCell>
                            <TableHeaderCell>Recommended Allocation</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell className="text-right">Action</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-10">Loading rankings...</TableCell></TableRow>
                        ) : rankings.length > 0 ? (
                            rankings.map((rank) => (
                                <TableRow key={rank.applicationId} className={rank.rank <= 5 ? "bg-blue-50/30" : ""}>
                                    <TableCell>
                                        <div className={`
                                            flex items-center justify-center w-8 h-8 rounded-lg font-bold
                                            ${rank.rank <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}
                                        `}>
                                            #{rank.rank}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-gray-900">{rank.studentName}</div>
                                        <div className="text-xs text-gray-400">ID: APP-{rank.applicationId}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-gray-400">Need Score</span>
                                                <span className={`font-bold ${rank.needScore >= 80 ? 'text-green-600' : 'text-orange-600'}`}>{rank.needScore}</span>
                                            </div>
                                            <div className="flex flex-col ml-4">
                                                <span className="text-[10px] uppercase font-bold text-gray-400">Tier</span>
                                                <Badge variant={rank.taadaFlag === 'FIRST_TIME' ? 'success' : 'info'}>
                                                    {rank.taadaFlag.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-blue-700">KES {rank.recommendedAllocation}</span>
                                            <span className="text-[10px] text-gray-400">TAADA Suggested Budget</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="warning">PENDING</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => handleQuickApprove(rank)}>
                                            Approve
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20 text-gray-400">
                                    <TrendingUp size={48} className="mx-auto mb-2 opacity-10" />
                                    No pending applications found for ranking.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </TableContainer>
            </Card>
        </div>
    );
}
