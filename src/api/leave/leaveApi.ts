import apiClient from "../client";
import {
  LeaveType,
  LeaveTypeListResponse,
  CreateLeaveTypeDto,
  UpdateLeaveTypeDto,
  LeaveBalance,
  LeaveBalanceListResponse,
  LeaveBalanceQueryParams,
  CreateLeaveBalanceDto,
  UpdateLeaveBalanceDto,
  AdjustLeaveBalanceDto,
  UserLeaveBalancesResponse,
  CheckLeaveBalanceDto,
  CheckLeaveBalanceResponse,
  LeaveRequest,
  LeaveRequestListResponse,
  LeaveRequestQueryParams,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ProcessLeaveRequestDto,
} from "./leaveApi.types";
import { SearchQueryParams } from "../common/commonApi.types";

export const leaveApi = {
  // 휴가 유형 API
  getLeaveTypes: async (params?: SearchQueryParams) => {
    const response = await apiClient.get<LeaveTypeListResponse>(
      "/leaves/types",
      {
        params,
      }
    );
    return response.data;
  },

  getLeaveType: async (id: string) => {
    const response = await apiClient.get<{ message: string; data: LeaveType }>(
      `/leaves/types/${id}`
    );
    return response.data.data;
  },

  createLeaveType: async (leaveType: CreateLeaveTypeDto) => {
    const response = await apiClient.post<{ message: string; data: LeaveType }>(
      "/leaves/types",
      leaveType
    );
    return response.data.data;
  },

  updateLeaveType: async (id: string, leaveType: UpdateLeaveTypeDto) => {
    const response = await apiClient.put<{ message: string; data: LeaveType }>(
      `/leaves/types/${id}`,
      leaveType
    );
    return response.data.data;
  },

  deleteLeaveType: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(
      `/leaves/types/${id}`
    );
    return response.data;
  },

  // 휴가 잔액 API
  getLeaveBalances: async (params?: LeaveBalanceQueryParams) => {
    const response = await apiClient.get<LeaveBalanceListResponse>(
      "/leaves/balances",
      {
        params,
      }
    );
    return response.data;
  },

  getLeaveBalance: async (id: string) => {
    const response = await apiClient.get<{
      message: string;
      data: LeaveBalance;
    }>(`/leaves/balances/${id}`);
    return response.data.data;
  },

  getUserLeaveBalances: async (userId: string, year?: number) => {
    const response = await apiClient.get<{
      message: string;
      data: UserLeaveBalancesResponse;
    }>(`/leaves/balances/user/${userId}`, { params: { year } });
    return response.data.data;
  },

  checkLeaveBalance: async (checkDto: CheckLeaveBalanceDto) => {
    const response = await apiClient.post<{
      message: string;
      data: CheckLeaveBalanceResponse;
    }>("/leaves/balances/check", checkDto);
    return response.data.data;
  },

  createLeaveBalance: async (leaveBalance: CreateLeaveBalanceDto) => {
    const response = await apiClient.post<{
      message: string;
      data: LeaveBalance;
    }>("/leaves/balances", leaveBalance);
    return response.data.data;
  },

  updateLeaveBalance: async (
    id: string,
    leaveBalance: UpdateLeaveBalanceDto
  ) => {
    const response = await apiClient.put<{
      message: string;
      data: LeaveBalance;
    }>(`/leaves/balances/${id}`, leaveBalance);
    return response.data.data;
  },

  adjustLeaveBalance: async (adjustDto: AdjustLeaveBalanceDto) => {
    const response = await apiClient.post<{
      message: string;
      data: LeaveBalance;
    }>("/leaves/balances/adjust", adjustDto);
    return response.data.data;
  },

  deleteLeaveBalance: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(
      `/leaves/balances/${id}`
    );
    return response.data;
  },

  // 휴가 요청 API
  getLeaveRequests: async (params?: LeaveRequestQueryParams) => {
    const response = await apiClient.get<LeaveRequestListResponse>(
      "/leaves/requests",
      {
        params,
      }
    );
    return response.data;
  },

  getLeaveRequest: async (id: string) => {
    const response = await apiClient.get<{
      message: string;
      data: LeaveRequest;
    }>(`/leaves/requests/${id}`);
    return response.data.data;
  },

  createLeaveRequest: async (leaveRequest: CreateLeaveRequestDto) => {
    const response = await apiClient.post<{
      message: string;
      data: LeaveRequest;
    }>("/leaves/requests", leaveRequest);
    return response.data.data;
  },

  updateLeaveRequest: async (
    id: string,
    leaveRequest: UpdateLeaveRequestDto
  ) => {
    const response = await apiClient.put<{
      message: string;
      data: LeaveRequest;
    }>(`/leaves/requests/${id}`, leaveRequest);
    return response.data.data;
  },

  processLeaveRequest: async (
    id: string,
    processDto: ProcessLeaveRequestDto
  ) => {
    const response = await apiClient.post<{
      message: string;
      data: LeaveRequest;
    }>(`/leaves/requests/${id}/process`, processDto);
    return response.data.data;
  },

  cancelLeaveRequest: async (id: string) => {
    const response = await apiClient.post<{
      message: string;
      data: LeaveRequest;
    }>(`/leaves/requests/${id}/cancel`);
    return response.data.data;
  },

  deleteLeaveRequest: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(
      `/leaves/requests/${id}`
    );
    return response.data;
  },
};
