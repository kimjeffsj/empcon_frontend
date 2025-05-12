import { EmployeeRole } from "@/api/employee/employeeApi.types";
import { PayPeriodType } from "@/api/payroll/payrollApi.types";
import { z } from "zod";

// Validation schema
export const createEmployeeSchema = z.object({
  // Basic Information
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  firstName: z.string().min(1, "Please enter your first name"),
  lastName: z.string().min(1, "Please enter your last name"),
  dateOfBirth: z.string().optional(),

  // Work Information
  hireDate: z.string().min(1, "Please select a hire date"),
  role: z.nativeEnum(EmployeeRole),
  departmentId: z.string().optional(),
  positionId: z.string().optional(),

  // Payroll Information
  payRate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined || val.trim() === "") return true; // Optional and can be empty
        // Allows numbers like .50, 12, 12.5, 12.50. Ensures positive and valid number.
        if (!/^\d*\.?\d{0,2}$/.test(val)) return false;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      {
        message:
          "Pay rate must be a valid positive number with up to two decimal places (e.g., 17.50 or 20).",
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

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
