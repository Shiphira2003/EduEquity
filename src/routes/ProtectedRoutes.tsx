import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
    children: ReactNode;
    roles?: string[];
};

export default function ProtectedRoute({
                                           children,
                                           roles,
                                       }: ProtectedRouteProps) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/auth/login" />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/unauthorized" />;
    }

    return <>{children}</>;
}
