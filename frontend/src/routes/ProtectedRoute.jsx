import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import Unauthorized from '../pages/Unauthorized';

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const location = useLocation();

  // Not logged in
  if (!token) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Force password reset
  if (user?.mustResetPassword && location.pathname !== '/reset-password') {
    return <Navigate to='/reset-password' replace />;
  }

  // Normalize roles
  const roles = Array.isArray(allowedRoles)
    ? allowedRoles
    : allowedRoles
      ? [allowedRoles]
      : [];

  // Allow all authenticated users when route uses ANY
  if (roles.length === 0 || roles.includes('ANY')) return children;

  // RBAC check
  const hasAccess = user?.roles?.some((role) => roles.includes(role));

  return hasAccess ? children : <Unauthorized />;
}
