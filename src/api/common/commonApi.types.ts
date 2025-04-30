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
  page?: string; // Changed to string
  limit?: string; // Changed to string
}

export interface SearchQueryParams extends PaginationQueryParams {
  search?: string;
}
