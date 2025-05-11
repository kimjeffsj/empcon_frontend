import { EmployeeRole } from "@/api/employee/employeeApi.types";
import { useAppSelector } from "@/store";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  requiredRole?: EmployeeRole;
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isLoading = useAppSelector((state) => state.ui.loading.global);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    } else if (
      !isLoading &&
      isAuthenticated &&
      requiredRole &&
      user?.role !== requiredRole
    ) {
      // Allow ADMINs to access MANAGER routes as well
      if (user?.role !== EmployeeRole.ADMIN) {
        navigate("/unauthorized", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, requiredRole, user?.role]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Authorizing...</p>
        </div>
      </div>
    );
  }

  // Render Outlet if authenticated and authorized (or no specific role required)
  return isAuthenticated ? <Outlet /> : null;
}
