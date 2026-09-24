import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Wraps a route and enforces:
 *  1. Authentication (redirects to /login if not logged in)
 *  2. Role-based access (redirects to / if role doesn't match)
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard based on actual role
    const roleRoutes = {
      CUSTOMER: '/customer',
      PROVIDER: '/provider',
      ADMIN: '/admin',
      OPERATIONS_MANAGER: '/ops',
    };
    return <Navigate to={roleRoutes[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
