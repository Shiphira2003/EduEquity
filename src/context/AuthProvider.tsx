import { useState } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "./AuthContext";
import { API_CONFIG } from "../constants";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem(API_CONFIG.USER_KEY);
        return stored ? JSON.parse(stored) : null;
    });

    const loginUser = (token: string, user: User) => {
        localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
        localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(user));
        setUser(user);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
