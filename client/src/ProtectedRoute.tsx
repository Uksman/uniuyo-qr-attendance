import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import type { Role } from "./api";

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === "student" ? "/scan" : "/session"} replace />;
  }

  return <Outlet />;
}
