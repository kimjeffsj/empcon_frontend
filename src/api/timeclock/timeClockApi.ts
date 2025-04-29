import apiClient from "../client";
import {
  TimeClock,
  TimeClockListResponse,
  TimeClockQueryParams,
  ClockInDto,
  ClockOutDto,
  UpdateTimeClockDto,
} from "./timeClockApi.types";

export const timeClockApi = {
  getTimeClocks: async (params?: TimeClockQueryParams) => {
    const response = await apiClient.get<TimeClockListResponse>("/timeclocks", {
      params,
    });
    return response.data;
  },

  getTimeClock: async (id: string) => {
    const response = await apiClient.get<{ message: string; data: TimeClock }>(
      `/timeclocks/${id}`
    );
    return response.data.data;
  },

  clockIn: async (data: ClockInDto) => {
    const response = await apiClient.post<{ message: string; data: TimeClock }>(
      "/timeclocks/clock-in",
      data
    );
    return response.data.data;
  },

  clockOut: async (id: string, data?: ClockOutDto) => {
    const response = await apiClient.put<{ message: string; data: TimeClock }>(
      `/timeclocks/clock-out/${id}`,
      data
    );
    return response.data.data;
  },

  updateTimeClock: async (id: string, data: UpdateTimeClockDto) => {
    const response = await apiClient.put<{ message: string; data: TimeClock }>(
      `/timeclocks/${id}`,
      data
    );
    return response.data.data;
  },

  deleteTimeClock: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(
      `/timeclocks/${id}`
    );
    return response.data;
  },

  getActiveTimeClock: async (userId: string) => {
    const response = await apiClient.get<{
      message: string;
      data: TimeClock | null;
    }>(`/timeclocks/user/active/${userId}`);
    return response.data.data;
  },

  getUserTimeClocks: async (
    userId: string,
    params?: Omit<TimeClockQueryParams, "userId">
  ) => {
    const response = await apiClient.get<TimeClockListResponse>(
      `/timeclocks/user/${userId}`,
      { params }
    );
    return response.data;
  },
};
