import { User } from "../auth/authApi.types";
import { PaginatedResponse } from "../common/commonApi.types";
import { Schedule } from "../schedule/scheduleApi.types";

export type TimeClockListResponse = PaginatedResponse<TimeClock>;

export interface TimeClockQueryParams {
  page?: number | string;
  limit?: number | string;
  userId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  completed?: string; // Changed from boolean | string to string
}

export interface TimeClock {
  id: string;
  userId: string;
  clockInTime: string;
  clockOutTime?: string;
  totalMinutes?: number;
  scheduleId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  schedule?: Schedule;
}

export interface ClockInDto {
  userId: string; // Made userId required
  scheduleId?: string;
  notes?: string;
}

export interface ClockOutDto {
  notes?: string;
}

export interface UpdateTimeClockDto {
  clockInTime?: string;
  clockOutTime?: string;
  notes?: string;
  scheduleId?: string;
}
