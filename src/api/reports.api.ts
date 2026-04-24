import api from "./axios";

export interface CashFlowRecord {
    id: number;
    fundSource: string;
    transactionType: "ALLOCATION" | "DISBURSEMENT" | "REVERSAL";
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    referenceId: string;
    notes: string;
    createdAt: string;
}

export interface FundSourceBalance {
    fundSource: string;
    budgetPerCycle: number;
    allocatedAmount: number;
    disbursedAmount: number;
    availableBalance: number;
    utilizationPercentage: number;
}

export interface CashFlowSummary {
    cycleYear: number;
    summary: Array<{
        fundSource: string;
        transactionType: string;
        transactionCount: number;
        totalAmount: string;
    }>;
    balances: FundSourceBalance[];
}

export interface CashFlowReport {
    fundSource: string;
    period: {
        start: string;
        end: string;
    };
    allocations: {
        count: number;
        total: number;
    };
    disbursements: {
        count: number;
        total: number;
    };
    reversals: {
        count: number;
        total: number;
    };
}

/**
 * Get overall cash flow summary for a specific year
 */
export const getCashFlowSummary = async (cycleYear: number): Promise<CashFlowSummary> => {
    const res = await api.get(`/fund-sources/cashflow/summary/${cycleYear}`);
    return res.data.data;
};

/**
 * Get detailed transaction history for a specific fund source and year
 */
export const getCashFlowHistory = async (fundSource: string, cycleYear: number): Promise<{ records: CashFlowRecord[] }> => {
    const res = await api.get(`/fund-sources/cashflow/history/${fundSource}/${cycleYear}`);
    return res.data.data;
};

/**
 * Generate a statistical report for a fund source over a date range
 */
export const generateFinancialReport = async (fundSource: string, startDate: string, endDate: string): Promise<CashFlowReport> => {
    const res = await api.get(`/fund-sources/report/${fundSource}/${startDate}/${endDate}`);
    return res.data.data;
};
