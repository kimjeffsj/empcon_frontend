import { User } from "../auth/authApi.types";
import { PaginatedResponse, SuccessResponse } from "../common/commonApi.types";

export type DepartmentListResponse = PaginatedResponse<Department>;

export interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {}

export interface DepartmentUserResponse extends SuccessResponse<User[]> {
  total: number;
}
