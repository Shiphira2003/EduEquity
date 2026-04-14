import api from "./axios";

export const login = async (email: string, password: string) => {
    const res = await api.post(`/auth/login`, { email, password });
    return res.data;
};

export const register = async (userData: any) => {
    // Backend uses /auth/signup for student self-registration
    const res = await api.post(`/auth/signup`, userData);
    return res.data;
};

export const forgotPassword = async (email: string) => {
    const res = await api.post(`/auth/forgot-password`, { email });
    return res.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
    const res = await api.post(`/auth/reset-password`, { token, newPassword });
    return res.data;
};

export const verifyOTP = async (email: string, otp: string) => {
    const res = await api.post(`/auth/verify-email`, { email, otp });
    return res.data;
};

export const resendOTP = async (email: string) => {
    const res = await api.post(`/auth/resend-otp`, { email });
    return res.data;
};
