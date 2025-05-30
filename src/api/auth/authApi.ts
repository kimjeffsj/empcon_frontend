import apiClient from "../client";
import { AuthResponse, LoginCredentials, User } from "./authApi.types";

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  refreshToken: async () => {
    const response = await apiClient.post<{ message: string }>("/auth/refresh");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<{ message: string; data: User }>(
      "/users/me"
    );
    return response.data.data;
  },
};
