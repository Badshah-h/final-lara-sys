import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useNewAuth } from "@/contexts/NewAuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export function NewProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useNewAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && user?.roles && !user.roles.includes(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed, render the protected content
  return <>{children}</>;
}
