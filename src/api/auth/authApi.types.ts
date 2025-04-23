export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
  refreshToken?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  department?: Department | null;
  position?: Position | null;
}

export interface Department {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  title: string;
}
