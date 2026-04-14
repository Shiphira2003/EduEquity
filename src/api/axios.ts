import axios from "axios";
import { API_CONFIG } from "../constants";

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    withCredentials: true,
    timeout: API_CONFIG.TIMEOUT,
});

// Attach token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Refresh token interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axios.get(`${API_CONFIG.BASE_URL}/auth/refresh`, { withCredentials: true });
                if (res.data.token) {
                    localStorage.setItem(API_CONFIG.TOKEN_KEY, res.data.token);
                    api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
                    return api(originalRequest);
                }
            } catch (err) {
                // If refresh fails, clear token and logout
                localStorage.removeItem(API_CONFIG.TOKEN_KEY);
                window.location.href = "/auth/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
