export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string; // Optional message field
}

export interface SuccessResponse<T> {
  message: string;
  data: T;
}

export interface PaginationQueryParams {
  page?: number | string;
  limit?: number | string;
}

export interface SearchQueryParams extends PaginationQueryParams {
  search?: string;
}
