import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    return res.data;
};

export const register = async (userData: any) => {
    const res = await axios.post(`${API_URL}/register`, userData);
    return res.data;
};

export const forgotPassword = async (email: string) => {
    const res = await axios.post(`${API_URL}/forgot-password`, { email });
    return res.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
    const res = await axios.post(`${API_URL}/reset-password`, { token, newPassword });
    return res.data;
};
