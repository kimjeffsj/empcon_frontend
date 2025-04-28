import { Department } from "../department/department.types";
import { EmployeeRole } from "../employee/employeeApi.types";
import { Position } from "../position/positionApi.types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
  refreshToken?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
  department?: Department | null;
  position?: Position | null;
}
