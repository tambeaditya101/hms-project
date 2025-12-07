import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Unauthorized from "../pages/Unauthorized";

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const location = useLocation();

  // Not logged in
  if (!token) return <Navigate to="/login" />;

  // Force password reset
  if (user?.mustResetPassword && location.pathname !== "/reset-password") {
    return <Navigate to="/reset-password" replace />;
  }

  // No RBAC defined → allow all authenticated users
  if (!allowedRoles || allowedRoles.length === 0) return children;

  // RBAC check
  const hasAccess = user?.roles?.some((role) => allowedRoles.includes(role));

  return hasAccess ? children : <Unauthorized />;
}
