// api/student.api.ts
import api from "../api/axios"; // <- your configured axios instance

export const getApplications = async (status?: string) => {
    const res = await api.get("/applications", {
        params: { status },
    });
    console.log("API /applications response:", res.data);
    return res.data;
};

export const updateApplicationStatus = async (id: string, status: string, amount_allocated?: number) => {
    const res = await api.patch(`/applications/${id}/status`, { status, amount_allocated });
    return res.data;
};

export const getAuditLogs = async (applicationId: string) => {
    const res = await api.get(`/applications/${applicationId}/audit-logs`);
    return res.data;
};

export const registerAdmin = async (adminData: { email: string; password: string; full_name: string }) => {
    const res = await api.post("/users/admin", adminData);
    return res.data;
};
