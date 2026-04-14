import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import api from '../api/axios';
import { Search, Filter, ShieldCheck } from 'lucide-react';

interface LedgerEntry {
    id: number;
    amount: string;
    fund_source: string;
    disbursed_at: string;
    status: string;
    institution: string;
    cycle_year: number;
}

const PublicLedger: React.FC = () => {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLedger = async () => {
            try {
                const res = await api.get('/public/ledger');
                if (res.data.success) {
                    setEntries(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch public ledger", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLedger();
    }, []);

    const filteredEntries = entries.filter(entry => 
        entry.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.fund_source.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(Number(amount));
    };

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            <Navbar />
            
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                {/* Header Section */}
                <div className="text-center mb-12 animate-fade-in">
                    <div className="mx-auto h-16 w-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-primary/10">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-black mb-4 tracking-tight">Public Transparency Ledger</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Track every disbursed bursary in real-time. We believe in full transparency, zero hidden payments, and complete accountability.
                    </p>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by institution or fund..."
                            className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg leading-5 bg-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                        <Filter className="h-4 w-4" />
                        Showing {filteredEntries.length} records
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Institution
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Fund Source
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Cycle
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                <p>Loading ledger records...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredEntries.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 py-16">
                                            <p className="text-lg font-medium text-gray-900">No records found</p>
                                            <p className="text-sm mt-1">Try adjusting your search filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEntries.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(entry.disbursed_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {entry.institution}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="px-3 py-1 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                                                    {entry.fund_source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {entry.cycle_year}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black text-right">
                                                {formatCurrency(entry.amount)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PublicLedger;
