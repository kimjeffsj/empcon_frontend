import apiClient from "../client";
import {
  CreatePayPeriodDto,
  PaginatedPayPeriodResponse,
  PayAdjustmentDto,
  PayPeriodQueryParams,
  PayPeriodWithCalculations,
  UpdatePayPeriodDto,
  ExportPayrollDto,
} from "./payrollApi.types";

export const payrollApi = {
  /**
   * 모든 급여 기간 목록 조회 (페이지네이션)
   */
  getPayPeriods: async (params?: PayPeriodQueryParams) => {
    const response = await apiClient.get<PaginatedPayPeriodResponse>(
      "/payroll/periods",
      { params }
    );
    return response.data;
  },

  /**
   * 특정 급여 기간 상세 조회
   */
  getPayPeriod: async (id: string) => {
    const response = await apiClient.get<{
      message: string;
      data: PayPeriodWithCalculations;
    }>(`/payroll/periods/${id}`);
    return response.data.data;
  },

  /**
   * 새 급여 기간 생성
   */
  createPayPeriod: async (data: CreatePayPeriodDto) => {
    const response = await apiClient.post<{
      message: string;
      data: PayPeriodWithCalculations;
    }>("/payroll/periods", data);
    return response.data.data;
  },

  /**
   * 특정 급여 기간 수정
   */
  updatePayPeriod: async (id: string, data: UpdatePayPeriodDto) => {
    const response = await apiClient.put<{
      message: string;
      data: PayPeriodWithCalculations;
    }>(`/payroll/periods/${id}`, data);
    return response.data.data;
  },

  /**
   * 특정 급여 기간 삭제 (Admin 역할 필요)
   */
  deletePayPeriod: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(
      `/payroll/periods/${id}`
    );
    return response.data;
  },

  /**
   * 특정 급여 기간에 대한 급여 계산 실행
   */
  calculatePayroll: async (id: string) => {
    const response = await apiClient.post<{
      message: string;
      data: { employeeCount: number };
    }>(`/payroll/calculate/${id}`);
    return response.data;
  },

  /**
   * 특정 급여 계산에 조정 항목 추가
   */
  addAdjustment: async (data: PayAdjustmentDto) => {
    const response = await apiClient.post<{
      message: string;
      data: PayPeriodWithCalculations;
    }>("/payroll/adjustments", data);
    return response.data.data;
  },

  /**
   * 특정 급여 기간을 'PAID' 상태로 변경
   */
  markAsPaid: async (id: string) => {
    const response = await apiClient.post<{
      message: string;
      data: PayPeriodWithCalculations;
    }>(`/payroll/periods/${id}/paid`);
    return response.data.data;
  },

  /**
   * 특정 급여 기간의 데이터 내보내기
   * 참고: 실제 파일 다운로드는 이 함수를 호출한 후 별도 로직이 필요할 수 있습니다.
   * TODO: 파일 다운로드 구현
   */
  exportPayroll: async (id: string, format?: ExportPayrollDto["format"]) => {
    const response = await apiClient.get<{ message: string; data: any[] }>(
      `/payroll/export/${id}`,
      { params: { format } } // format을 쿼리 파라미터로 전달한다고 가정
    );
    return response.data.data; // 실제 export 데이터 반환
  },
};
