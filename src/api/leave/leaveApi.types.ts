import { User } from "../auth/authApi.types";
import { PaginatedResponse } from "../common/commonApi.types";

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  paidLeave: boolean;
  requiresBalance: boolean;
  defaultDays?: number;
  allowsCarryOver?: boolean;
  allowsPayout?: boolean;
}

export type LeaveTypeListResponse = PaginatedResponse<LeaveType>;

export interface CreateLeaveTypeDto {
  name: string;
  description?: string;
  paidLeave: boolean;
  requiresBalance?: boolean;
  defaultDays?: number;
  allowsCarryOver?: boolean;
  allowsPayout?: boolean;
}

export interface UpdateLeaveTypeDto extends Partial<CreateLeaveTypeDto> {}

export interface LeaveBalance {
  id: string;
  userId: string;
  leaveTypeId: string;
  balanceDays: number;
  year: number;
  leaveType: LeaveType;
  user?: User;
}

export type LeaveBalanceListResponse = PaginatedResponse<LeaveBalance>;

export interface LeaveBalanceQueryParams {
  page?: number | string;
  limit?: number | string;
  userId?: string;
  leaveTypeId?: string;
  year?: number | string;
}

export interface CreateLeaveBalanceDto {
  userId: string;
  leaveTypeId: string;
  balanceDays: number;
  year: number;
}

export interface UpdateLeaveBalanceDto {
  balanceDays: number;
}

export interface AdjustLeaveBalanceDto {
  userId: string;
  leaveTypeId: string;
  days: number;
  reason: string;
  year: number;
}

export interface UserLeaveBalancesResponse {
  userId: string;
  userName: string;
  userEmail: string;
  balances: {
    leaveTypeId: string;
    leaveTypeName: string;
    balanceDays: number;
    used: number;
    remaining: number;
    isPaid: boolean;
  }[];
}

export interface CheckLeaveBalanceDto {
  userId: string;
  leaveTypeId: string;
  days: number;
  year: number;
}

export interface CheckLeaveBalanceResponse {
  sufficient: boolean;
  balance: number;
  required: number;
  remaining: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  halfDay?: boolean;
  status: LeaveStatus;
  notes?: string;
  approvedBy?: string;
  user?: User;
  leaveType?: LeaveType;
}

export type LeaveRequestListResponse = PaginatedResponse<LeaveRequest>;

export interface LeaveRequestQueryParams {
  page?: number | string;
  limit?: number | string;
  userId?: string;
  departmentId?: string;
  leaveTypeId?: string;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
}

export interface CreateLeaveRequestDto {
  userId?: string; // Optional, uses authenticated user if not provided
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  halfDay?: boolean;
  notes?: string;
}

export interface UpdateLeaveRequestDto extends Partial<CreateLeaveRequestDto> {}

export interface ProcessLeaveRequestDto {
  status: "APPROVED" | "REJECTED";
  approvedBy?: string; // Optional, uses authenticated user if not provided
  notes?: string;
}
