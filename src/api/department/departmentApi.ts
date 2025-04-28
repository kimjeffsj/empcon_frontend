import apiClient from "../client";
import { SearchQueryParams } from "../common/commonApi.types";
import {
  CreateDepartmentDto,
  Department,
  DepartmentListResponse,
  DepartmentUserResponse,
  UpdateDepartmentDto,
} from "./department.types";

export const departmentApi = {
  getDepartments: async (params?: SearchQueryParams) => {
    const response = await apiClient.get<DepartmentListResponse>(
      "/departments",
      {
        params,
      }
    );
    return response.data;
  },

  getDepartment: async (id: string) => {
    const response = await apiClient.get<{ message: string; data: Department }>(
      `/departments/${id}`
    );
    return response.data.data;
  },

  createDepartment: async (department: CreateDepartmentDto) => {
    const response = await apiClient.post<{
      message: string;
      data: Department;
    }>("/departments", department);
    return response.data.data;
  },

  updateDepartment: async (id: string, department: UpdateDepartmentDto) => {
    const response = await apiClient.put<{ message: string; data: Department }>(
      `/departments/${id}`,
      department
    );
    return response.data.data;
  },

  deleteDepartment: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(
      `/departments/${id}`
    );
    return response.data;
  },

  getDepartmentUsers: async (id: string, params?: SearchQueryParams) => {
    const response = await apiClient.get<DepartmentUserResponse>(
      `/departments/${id}/users`,
      { params }
    );
    return response.data;
  },
};
