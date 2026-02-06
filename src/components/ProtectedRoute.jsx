import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageLoader from './PageLoader';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { currentUser, userRole, loading } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Redirect based on role
        if (userRole === 'admin') {
            return <Navigate to="/admin" replace />;
        } else if (userRole === 'cashier') {
            return <Navigate to="/pos" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
