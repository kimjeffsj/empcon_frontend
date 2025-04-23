import { User } from "../auth/authApi.types";
import {
  PaginatedResponse,
  SearchQueryParams,
} from "../common/commonApi.types";

export type EmployeeListResponse = PaginatedResponse<Employee>;

export interface EmployeeQueryParams extends SearchQueryParams {
  departmentId?: string;
  role?: "ADMIN" | "MANAGER" | "EMPLOYEE"; // 역할은 구체적인 타입으로 지정하는 것이 좋음
  isActive?: boolean;
}

export interface Employee extends User {
  dateOfBirth?: string;
  hireDate: string;
  terminationDate?: string;
  payRate?: number;
  payPeriodType?: "SEMI_MONTHLY" | "BI_WEEKLY" | "MONTHLY";
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
  role?: "ADMIN" | "MANAGER" | "EMPLOYEE";
  departmentId?: string;
  positionId?: string;
  payRate?: number;
  payPeriodType?: "SEMI_MONTHLY" | "BI_WEEKLY" | "MONTHLY";
  overtimeEnabled?: boolean;
  profile?: {
    address?: string;
    socialInsuranceNumber?: string;
    comments?: string;
    emergencyContact?: string;
  };
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}
