import { User } from "../auth/authApi.types";
import {
  PaginatedResponse,
  SearchQueryParams,
} from "../common/commonApi.types";

export type ScheduleListResponse = PaginatedResponse<Schedule>;

export interface ScheduleQueryParams extends SearchQueryParams {
  userId: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  scheduleType?: ScheduleType;
}

export interface UserScheduleQueryParams
  extends Omit<ScheduleQueryParams, "userId" | "departmentId"> {}

export type ScheduleType = "REGULAR" | "OVERTIME" | "HOLIDAY";

export interface Schedule {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  scheduleType: ScheduleType;
  isStatutoryHoliday: boolean;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  timeClocks?: TimeClock[];
  adjustmentRequests?: AdjustmentRequest[];
}

export interface TimeClock {
  id: string;
  clockInTime: string;
  clockOutTime?: string;
  totalMinutes?: number;
}

// AdjustmentRequest interface definition
export interface AdjustmentRequest {
  id: string;
  requestType: string;
  reason: string;
  status: string;
  requestedStartTime?: string;
  requestedEndTime?: string;
  requestedBreakTime?: number;
}

export interface CreateScheduleDto {
  userId: string;
  startTime: string;
  endTime: string;
  breakTime?: number;
  scheduleType?: "REGULAR" | "OVERTIME" | "HOLIDAY";
  isStatutoryHoliday?: boolean;
  notes?: string;
}

export interface UpdateScheduleDto extends Partial<CreateScheduleDto> {}

export interface BatchScheduleDto {
  schedules: CreateScheduleDto[];
}
