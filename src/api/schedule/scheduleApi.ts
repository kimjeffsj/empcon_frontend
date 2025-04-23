import apiClient from "../client";
import {
  BatchScheduleDto,
  CreateScheduleDto,
  Schedule,
  ScheduleListResponse,
  ScheduleQueryParams,
  UpdateScheduleDto,
  UserScheduleQueryParams,
} from "./scheduleApi.types";

export const scheduleApi = {
  getSchedules: async (params?: ScheduleQueryParams) => {
    const response = await apiClient.get<ScheduleListResponse>("/schedules", {
      params,
    });
    return response.data;
  },

  getSchedule: async (id: string) => {
    const response = await apiClient.get<{ message: string; data: Schedule }>(
      `/schedules/${id}`
    );
    return response.data.data;
  },

  getUserSchedules: async (
    userId: string,
    params?: UserScheduleQueryParams
  ) => {
    const response = await apiClient.get<ScheduleListResponse>(
      `/schedules/user/${userId}`,
      { params }
    );
    return response.data;
  },

  createSchedule: async (schedule: CreateScheduleDto) => {
    const response = await apiClient.post<{ message: string; data: Schedule }>(
      "/schedules",
      schedule
    );
    return response.data.data;
  },

  createBatchSchedules: async (batchSchedule: BatchScheduleDto) => {
    const response = await apiClient.post<{
      message: string;
      data: { count: number };
    }>("/schedules/batch", batchSchedule);
    return response.data.data;
  },

  updateSchedule: async (id: string, schedule: UpdateScheduleDto) => {
    const response = await apiClient.put<{ message: string; data: Schedule }>(
      `/schedules/${id}`,
      schedule
    );
    return response.data.data;
  },

  deleteSchedule: async (id: string) => {
    const response = await apiClient.delete(`/schedules/${id}`);
    return response.data;
  },
};
