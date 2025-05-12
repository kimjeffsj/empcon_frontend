import { EmployeeRole } from "@/api/employee/employeeApi.types";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import UnauthorizedPage from "@/pages/auth/UnauthorizedPage";
import NotFoundPage from "@/pages/common/NotFoundPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import DepartmentsPage from "@/pages/departments/DepartmentsPage";
import EmployeeCreatePage from "@/pages/employees/EmployeeCreatePage";
import EmployeeDetailPage from "@/pages/employees/EmployeeDetailPage";
import EmployeeEditPage from "@/pages/employees/EmployeeEditPage";
import EmployeesListPage from "@/pages/employees/EmployeesListPage";
import LeaveBalancesPage from "@/pages/leaves/LeaveBalancesPage";
import LeaveCreatePage from "@/pages/leaves/LeaveCreatePage";
import LeavesPage from "@/pages/leaves/LeavesPage";
import MyPayrollPage from "@/pages/payroll/MyPayrollPage";
import PayPeriodDetailPage from "@/pages/payroll/PayPeriodDetailPage";
import PayrollPage from "@/pages/payroll/PayrollPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import ReportsPage from "@/pages/reports/ReportsPage";
import ScheduleCreatePage from "@/pages/schedules/ScheduleCreatePage";
import ScheduleDetailPage from "@/pages/schedules/ScheduleDetailPage";
import SchedulesPage from "@/pages/schedules/SchedulesPage";
import TimeClocksPage from "@/pages/timeclocks/TimeClocksPage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Authenticated routes (any role) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/employees/:id" element={<EmployeeDetailPage />} />

          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/schedules/:id" element={<ScheduleDetailPage />} />

          <Route path="/timeclocks" element={<TimeClocksPage />} />

          <Route path="/my-payroll" element={<MyPayrollPage />} />

          <Route path="/leaves" element={<LeavesPage />} />
          <Route path="/leaves/new" element={<LeaveCreatePage />} />
          <Route path="/leaves/balances" element={<LeaveBalancesPage />} />

          <Route path="/profile" element={<ProfilePage />} />

          {/* Root redirect inside authenticated routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Manager-only routes */}
        <Route element={<ProtectedRoute requiredRole={EmployeeRole.MANAGER} />}>
          {/* Employees */}
          <Route path="/employees" element={<EmployeesListPage />} />
          <Route path="/employees/new" element={<EmployeeCreatePage />} />
          <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />

          {/* Departments */}
          <Route path="/departments" element={<DepartmentsPage />} />

          {/* Schedules */}
          <Route path="/schedules/new" element={<ScheduleCreatePage />} />

          {/* Payroll */}
          <Route path="/payroll" element={<PayrollPage />} />
          <Route
            path="/payroll/periods/:id"
            element={<PayPeriodDetailPage />}
          />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
