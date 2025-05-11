import { EmployeeRole } from "@/api/employee/employeeApi.types";
import { PayPeriodType } from "@/api/payroll/payrollApi.types";
import { z } from "zod";

// Validation schema
export const createEmployeeSchema = z.object({
  // Basic Information
  email: z.string().email("유효한 이메일 주소를 입력하세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  firstName: z.string().min(1, "이름을 입력하세요"),
  lastName: z.string().min(1, "성을 입력하세요"),
  dateOfBirth: z.string().optional(),

  // Work Information
  hireDate: z.string().min(1, "입사일을 선택하세요"),
  role: z.nativeEnum(EmployeeRole),
  departmentId: z.string().optional(),
  positionId: z.string().optional(),

  // Payroll Information
  payRate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(parseFloat(val)), {
      message: "유효한 숫자를 입력하세요",
    }),
  payPeriodType: z.nativeEnum(PayPeriodType).optional(),
  overtimeEnabled: z.boolean().optional(),

  // Profile Information
  address: z.string().optional(),
  socialInsuranceNumber: z.string().optional(),
  comments: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
