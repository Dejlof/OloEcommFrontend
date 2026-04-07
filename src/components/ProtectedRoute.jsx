// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route that requires authentication.
 * Saves the attempted URL so we can redirect back after login.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen text-green-900">Loading…</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Restricts a route to specific roles.
 * Usage: <RoleRoute roles={['Vendor', 'Admin']}>...</RoleRoute>
 */
export function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
