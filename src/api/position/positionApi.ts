import apiClient from "../client";
import { SearchQueryParams } from "../common/commonApi.types";
import {
  CreatePositionDto,
  Position,
  PositionListResponse,
  PositionUserResponse,
  UpdatePositionDto,
} from "./positionApi.types";

export const positionApi = {
  getPositions: async (params?: SearchQueryParams) => {
    const response = await apiClient.get<PositionListResponse>("/positions", {
      params,
    });
    return response.data;
  },

  getPosition: async (id: string) => {
    const response = await apiClient.get<{ message: string; data: Position }>(
      `/positions/${id}`
    );
    return response.data.data;
  },

  createPosition: async (position: CreatePositionDto) => {
    const response = await apiClient.post<{ message: string; data: Position }>(
      "/positions",
      position
    );
    return response.data.data;
  },

  updatePosition: async (id: string, position: UpdatePositionDto) => {
    const response = await apiClient.put<{ message: string; data: Position }>(
      `/positions/${id}`,
      position
    );
    return response.data.data;
  },

  deletePosition: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(
      `/positions/${id}`
    );
    return response.data;
  },

  getPositionUsers: async (id: string, params?: SearchQueryParams) => {
    const response = await apiClient.get<PositionUserResponse>(
      `/positions/${id}/users`,
      { params }
    );
    return response.data;
  },
};
