import api from "./axios";

export const getAuditLogs = async (applicationId: number) => {
    const res = await api.get(
        `/applications/${applicationId}/audit-logs`
    );

    return res.data;
};

export const createApplication = async (data: FormData) => {
    const res = await api.post("/applications", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};
