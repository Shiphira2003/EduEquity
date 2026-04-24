import api from "../api/axios";

// ─────────────────────────────────────────────
// Strict Interfaces
// ─────────────────────────────────────────────

export interface AdminStudent {
    id: number;
    user_id: number;
    full_name: string;
    national_id: string;
    institution: string;
    education_level: string;
    course: string | null;
    year_of_study: number;
    school_bank_name: string | null;
    school_account_number: string | null;
    is_bank_locked: boolean;
    created_at: string;
    email: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}

export interface Application {
    id: number;
    student_id: number;
    full_name: string;
    national_id: string;
    institution: string;
    course: string | null;
    year_of_study: number;
    cycle_year: number;
    amount_requested: string;
    amount_allocated: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    taada_flag: "FIRST_TIME" | "ALREADY_FUNDED" | "REJECTED_BEFORE";
    need_score: string | number;
    document_url: Record<string, string> | string[] | null;
    created_at: string;
}

export interface ApplicationRanking {
    applicationId: number;
    studentId: number;
    studentName: string;
    needScore: number;
    taadaFlag: string;
    rank: number;
    recommendedAllocation: number;
}

export interface ScoreBreakdown {
    baseScore: number;
    taadaBonusScore: number;
    finalScore: number;
    factors: {
        familyIncomeFactor: number;
        dependentsFactor: number;
        orphanedBonus: number;
        disabledBonus: number;
        academicFactor: number;
    };
}

export interface AdminAnalytics {
    total_students: number;
    total_applications: number;
    pending_applications: number;
    total_disbursed: number;
    total_audit_logs: number;
}

// ─────────────────────────────────────────────
// Applications
// ─────────────────────────────────────────────

export const getApplications = async (
    status?: string,
    page = 1,
    limit = 10,
    sortField = 'created_at',
    sortOrder = 'desc',
    bursaryType?: string
): Promise<{ data: Application[]; totalPages: number; total: number }> => {
    const res = await api.get("/applications", {
        params: { 
            status: status || undefined, 
            page, 
            limit, 
            sortField, 
            sortOrder, 
            bursaryType: bursaryType || undefined 
        },
    });
    return res.data;
};

export const updateApplicationStatus = async (
    id: string,
    status: string,
    amount_allocated?: number,
    rejection_reason?: string
) => {
    const res = await api.patch(`/applications/${id}/status`, {
        status,
        amount_allocated,
        rejection_reason,
    });
    return res.data;
};

export const getAuditLogs = async (applicationId: string) => {
    const res = await api.get(`/applications/${applicationId}/audit-logs`);
    return res.data;
};

export const autoEvaluateApplications = async (cycle_year: number) => {
    const res = await api.post("/applications/auto-evaluate", { cycle_year });
    return res.data;
};

export const getRankedApplications = async (cycle_year: number, bursary_type?: string): Promise<ApplicationRanking[]> => {
    const url = bursary_type 
        ? `/ranking/cycle/${cycle_year}/${bursary_type}`
        : `/ranking/cycle/${cycle_year}`;
    const res = await api.get(url);
    return res.data.data.rankings; // Based on successResponse structure in ranking.ts
};

export const getScoreBreakdown = async (applicationId: number): Promise<ScoreBreakdown> => {
    const res = await api.get(`/applications/${applicationId}/score-breakdown`);
    return res.data;
};

// ─────────────────────────────────────────────
// Students
// ─────────────────────────────────────────────

export const getAdminStudents = async (
    page = 1,
    limit = 10
): Promise<PaginatedResponse<AdminStudent>> => {
    const res = await api.get(`/admin/students`, { params: { page, limit } });
    return res.data;
};

export const updateAdminStudent = async (
    id: number,
    data: Partial<Omit<AdminStudent, "id" | "user_id" | "created_at" | "email">>
) => {
    const res = await api.put(`/admin/students/${id}`, data);
    return res.data;
};

export const deleteAdminStudent = async (id: number) => {
    const res = await api.delete(`/admin/students/${id}`);
    return res.data;
};

// ─────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────

export const getAdminAnalytics = async (): Promise<AdminAnalytics> => {
    const res = await api.get("/admin/analytics");
    return res.data;
};

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────

export interface Disbursement {
    id: number;
    allocation_id: number;
    student_name: string;
    student_id: number;
    amount: string | number;
    status: "PENDING" | "PROCESSED";
    reference_number: string | null;
    fund_source: string;
    disbursed_at: string | null;
    created_at: string;
}

export const registerAdmin = async (adminData: {
    email: string;
    password: string;
    full_name: string;
}) => {
    const res = await api.post("/users/admin", adminData);
    return res.data;
};

// ─────────────────────────────────────────────
// Disbursements
// ─────────────────────────────────────────────

export const getDisbursements = async (): Promise<Disbursement[]> => {
    const res = await api.get("/admin/disbursements");
    return res.data;
};

export const createDisbursement = async (data: {
    allocation_id: number;
    amount: number;
    status: string;
    fund_source?: string;
}) => {
    const res = await api.post("/admin/disbursements", data);
    return res.data;
};

export const updateDisbursement = async (
    id: number,
    data: Partial<Pick<Disbursement, "amount" | "status" | "reference_number" | "fund_source">>
) => {
    const res = await api.put(`/admin/disbursements/${id}`, data);
    return res.data;
};

export const deleteDisbursement = async (id: number) => {
    const res = await api.delete(`/admin/disbursements/${id}`);
    return res.data;
};

// ─────────────────────────────────────────────
// Note: Financial and Reporting functions have been 
// moved to specialized reports.api.ts
// ─────────────────────────────────────────────
