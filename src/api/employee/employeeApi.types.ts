import { User } from "../auth/authApi.types";
import {
  PaginatedResponse,
  SearchQueryParams,
} from "../common/commonApi.types";
import { PayPeriodType } from "../payroll/payrollApi.types";

export type EmployeeListResponse = PaginatedResponse<Employee>;

export enum EmployeeRole {
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export interface EmployeeQueryParams extends SearchQueryParams {
  departmentId?: string;
  role?: EmployeeRole;
  isActive?: string; // Changed from boolean to string
}

export interface Employee extends User {
  dateOfBirth?: string;
  hireDate: string;
  terminationDate?: string;
  payRate: number;
  payPeriodType?: PayPeriodType;
  overtimeEnabled: boolean;
  profile?: {
    address?: string;
    socialInsuranceNumber?: string;
    comments?: string;
    emergencyContact?: string;
  };
}

export interface CreateEmployeeDto {
  // Required fields
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  hireDate: string;

  // Optional fields
  dateOfBirth?: string;
  terminationDate?: string;
  role?: EmployeeRole;
  departmentId?: string;
  positionId?: string;
  payRate?: number;
  payPeriodType?: PayPeriodType;
  overtimeEnabled?: boolean;

  // Profile object (optional)
  profile?: {
    address?: string;
    socialInsuranceNumber?: string;
    comments?: string;
    emergencyContact?: string;
  };
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}
