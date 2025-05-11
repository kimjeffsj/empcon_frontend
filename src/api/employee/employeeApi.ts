import apiClient from "../client";
import {
  CreateEmployeeDto,
  Employee,
  EmployeeListResponse,
  EmployeeQueryParams,
  UpdateEmployeeDto,
} from "./employeeApi.types";

export const employeeApi = {
  getEmployees: async (params?: EmployeeQueryParams) => {
    const response = await apiClient.get<EmployeeListResponse>("/users", {
      params,
    });
    return response.data;
  },

  getEmployee: async (id: string) => {
    const response = await apiClient.get<{ message: string; data: Employee }>(
      `/users/${id}`
    );
    return response.data.data;
  },
  createEmployee: async (employee: CreateEmployeeDto) => {
    console.log("[employeeApi.ts] Attempting to create employee:", employee);
    const response = await apiClient.post<{ message: string; data: Employee }>(
      "/users",
      employee
    );
    return response.data.data;
  },

  updateEmployee: async (id: string, employee: UpdateEmployeeDto) => {
    const response = await apiClient.put<{ message: string; data: Employee }>(
      `/users/${id}`,
      employee
    );
    return response.data.data;
  },

  updateEmployeeProfile: async (id: string, profile: Employee["profile"]) => {
    const response = await apiClient.put<{
      message: string;
      data: Employee["profile"];
    }>(`/users/${id}/profile`, profile);
    return response.data.data;
  },

  deleteEmployee: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  getNewEmployees: async () => {
    const response = await apiClient.get<{ message: string; data: Employee[] }>(
      "/users/new"
    );
    return response.data.data;
  },

  getResignedEmployees: async () => {
    const response = await apiClient.get<{ message: string; data: Employee[] }>(
      "/users/resigned"
    );
    return response.data.data;
  },
};
