export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  departmentId?: string;
  positionId: string;
}
