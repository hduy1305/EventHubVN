import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading user session...</div>; // Or a loading spinner
  }

  if (!isAuthenticated) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => user?.roles?.some(userRole => userRole.authority === role))) {
    // Redirect to an unauthorized page or home if authenticated but not authorized
    return <Navigate to="/" replace />; // TODO: Create a proper unauthorized page
  }

  return <Outlet />; // Render child routes if authenticated and authorized
};

export default ProtectedRoute;
