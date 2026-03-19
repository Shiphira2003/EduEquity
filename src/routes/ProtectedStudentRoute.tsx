import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedStudentRoute: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    if (user.role !== 'STUDENT') {
        // Redirect to their appropriate dashboard or show unauthorized
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedStudentRoute;
