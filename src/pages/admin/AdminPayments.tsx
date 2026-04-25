import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { TableContainer, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table';
import { CreditCard, Hash, Calendar, DollarSign } from 'lucide-react';

export default function AdminPayments() {
    const { data: payments = [], isLoading } = useQuery({
        queryKey: ['adminPayments'],
        queryFn: async () => {
            const res = await api.get('/payments');
            return res.data;
        }
    });

    const getStatusVariant = (status: string) => {
        if (status === 'PROCESSED' || status === 'COMPLETED') return 'success';
        if (status === 'FAILED') return 'error';
        return 'warning';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="text-indigo-600" />
                    Stripe Payment Log
                </h1>
                <p className="text-gray-500 text-sm mt-1">Immutable ledger of automated Stripe transactions and completed bursaries.</p>
            </div>

            <Card noPadding className="overflow-hidden border-0 shadow-xl shadow-gray-100">
                <TableContainer>
                    <TableHead>
                        <TableRow className="bg-gray-50/50">
                            <TableHeaderCell className="text-gray-400 font-bold">Transaction ID</TableHeaderCell>
                            <TableHeaderCell className="text-gray-400 font-bold">Application Ref</TableHeaderCell>
                            <TableHeaderCell className="text-gray-400 font-bold">User Ref</TableHeaderCell>
                            <TableHeaderCell className="text-gray-400 font-bold">Amount Sent (KES)</TableHeaderCell>
                            <TableHeaderCell className="text-gray-400 font-bold">Status</TableHeaderCell>
                            <TableHeaderCell className="text-gray-400 font-bold">Gateway</TableHeaderCell>
                            <TableHeaderCell className="text-gray-400 font-bold">Timestamp</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-20 text-gray-400">Loading payment ledger...</TableCell></TableRow>
                        ) : payments.length > 0 ? payments.map((p: any) => (
                            <TableRow key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-2 font-mono text-xs text-gray-600">
                                        <Hash size={12} className="text-gray-400" />
                                        {p.transactionId || '---'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-bold text-gray-900">APP-#{p.applicationId}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-gray-600">USR-#{p.userId}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-base font-bold text-gray-900 flex items-center gap-1">
                                        <DollarSign size={14} className="text-green-600"/>
                                        {parseFloat(p.amount).toLocaleString()}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(p.paymentStatus)}>
                                        {p.paymentStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded-md">{p.paymentMethod || 'Stripe'}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <Calendar size={12} />
                                        {new Date(p.createdAt).toLocaleString()}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-20 text-gray-400">
                                    <CreditCard size={48} className="mx-auto mb-4 opacity-10" />
                                    No completed payments found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </TableContainer>
            </Card>
        </div>
    );
}
