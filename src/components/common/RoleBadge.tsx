import { EmployeeRole } from "@/api/employee/employeeApi.types";

interface RoleBadgeProps {
  role: EmployeeRole;
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  const roleConfig = {
    [EmployeeRole.ADMIN]: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      label: "Admin",
    },
    [EmployeeRole.MANAGER]: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: "Manager",
    },
    [EmployeeRole.EMPLOYEE]: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Employee",
    },
  };

  const config = roleConfig[role];

  if (!config) {
    return null; // Or some default badge/error display
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};
