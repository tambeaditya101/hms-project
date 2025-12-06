import { useSelector } from "react-redux";
import Unauthorized from "../pages/Unauthorized";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  if (!token) return <Navigate to="/login" />;
  if (user?.mustResetPassword && location.pathname !== "/reset-password") {
    return <Navigate to="/reset-password" replace />;
  }

  // If no roles defined → public authenticated route
  if (!allowedRoles || allowedRoles.length === 0) return children;

  // Check if user has ANY allowed role
  const hasAccess = user?.roles?.some((role) => allowedRoles.includes(role));

  return hasAccess ? children : <Unauthorized />;
}
