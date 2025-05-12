import { EmployeeRole } from "@/api/employee/employeeApi.types";
import { PayPeriodType } from "@/api/payroll/payrollApi.types";
import { z } from "zod";

export const updateEmployeeSchema = z.object({
  // Basic Information
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "Please enter your first name"),
  lastName: z.string().min(1, "Please enter your last name"),
  dateOfBirth: z.string().optional(),

  // Work Information
  hireDate: z.string().min(1, "Please select a hire date"),
  terminationDate: z.string().optional(),
  role: z.nativeEnum(EmployeeRole),
  departmentId: z.string().optional(),
  positionId: z.string().optional(),

  // Payroll Information
  payRate: z
    .string()
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val.trim() === "" ||
        (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      {
        message: "Please enter a valid positive number for pay rate.",
      }
    ),
  payPeriodType: z.nativeEnum(PayPeriodType).optional(),
  overtimeEnabled: z.boolean().optional(),

  // Profile Information
  address: z.string().optional(),
  socialInsuranceNumber: z.string().optional(),
  comments: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
