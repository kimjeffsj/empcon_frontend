import { User } from "../auth/authApi.types";
import { PaginatedResponse, SuccessResponse } from "../common/commonApi.types";

export type PositionListResponse = PaginatedResponse<Position>;

export interface Position {
  id: string;
  title: string;
  description?: string;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionDto {
  title: string;
  description?: string;
}

export interface UpdatePositionDto extends Partial<CreatePositionDto> {}

export interface PositionUserResponse extends SuccessResponse<User[]> {
  total: number;
}
