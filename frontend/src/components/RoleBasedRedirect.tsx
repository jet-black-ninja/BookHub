import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const RoleBasedRedirect = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === 'ADMIN') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
};