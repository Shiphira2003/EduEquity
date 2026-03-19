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

export default api;
