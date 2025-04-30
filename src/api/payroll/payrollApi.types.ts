import {
  PaginatedResponse,
  SearchQueryParams,
} from "../common/commonApi.types";

export enum PayPeriodType {
  SEMI_MONTHLY = "SEMI_MONTHLY",
  BI_WEEKLY = "BI_WEEKLY",
  MONTHLY = "MONTHLY",
}

export enum PayPeriodStatus {
  DRAFT = "DRAFT",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  PAID = "PAID",
}

export interface BasePayPeriodDto {
  startDate: string; // Use string for date consistency
  endDate: string; // Use string for date consistency
  type: PayPeriodType;
  status?: PayPeriodStatus;
}

export interface CreatePayPeriodDto extends BasePayPeriodDto {}

export interface UpdatePayPeriodDto extends Partial<BasePayPeriodDto> {}

export interface PayPeriodQueryParams extends SearchQueryParams {
  status?: PayPeriodStatus;
  startDate?: string;
  endDate?: string;
  type?: PayPeriodType;
}

export interface PayCalculationResult {
  userId: string;
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  grossPay: number;
}

export interface PayAdjustmentDto {
  payCalculationId: string;
  amount: number;
  reason: string;
  createdBy: string;
}

export interface PayPeriodCalculation {
  id: string;
  userId: string;
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  grossPay: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    payRate: number | null;
  };
  adjustments: {
    id: string;
    amount: number;
    reason: string;
    createdBy: string;
  }[];
}

export interface PayPeriodWithCalculations {
  id: string;
  startDate: string; // Use string
  endDate: string; // Use string
  type: PayPeriodType;
  status: PayPeriodStatus;
  calculations: PayPeriodCalculation[];
  createdAt: string; // Use string
  updatedAt: string; // Use string
}

export type PaginatedPayPeriodResponse =
  PaginatedResponse<PayPeriodWithCalculations>;

export interface ExportPayrollDto {
  payPeriodId: string;
  format?: "xlsx" | "csv";
}
