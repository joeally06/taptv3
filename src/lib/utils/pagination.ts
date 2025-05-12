export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export function validatePaginationParams(params: PaginationParams): Required<PaginationParams> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize || DEFAULT_PAGE_SIZE));
  const sortOrder = params.sortOrder || 'asc';
  const sortBy = params.sortBy || 'created_at';

  return { page, pageSize, sortBy, sortOrder };
}