import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedStudentRoute: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
    }

    if (user.role !== 'STUDENT') {
        // Redirect to their appropriate dashboard or show unauthorized
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedStudentRoute;
