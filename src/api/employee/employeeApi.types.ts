import { User } from "../auth/authApi.types";
import {
  PaginatedResponse,
  SearchQueryParams,
} from "../common/commonApi.types";

export type EmployeeListResponse = PaginatedResponse<Employee>;

export enum EmployeeRole {
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export enum PayPeriodType {
  SEMI_MONTHLY = "SEMI_MONTHLY",
  BI_WEEKLY = "BI_WEEKLY",
  MONTHLY = "MONTHLY",
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
  payRate?: number;
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
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  hireDate: string;
  terminationDate?: string;
  role?: EmployeeRole;
  departmentId?: string;
  positionId?: string;
  payRate?: number;
  payPeriodType?: PayPeriodType;
  overtimeEnabled?: boolean;
  profile?: {
    address?: string;
    socialInsuranceNumber?: string;
    comments?: string;
    emergencyContact?: string;
  };
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}
