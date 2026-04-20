import type { ChangeEvent } from 'react';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginationControlsState {
  currentPage: number;
  endItem: number;
  pageSize: number;
  pageSizeOptions: number[];
  startItem: number;
  totalItems: number;
  totalPages: number;
  goToNextPage: () => void;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  handlePageSizeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

export interface PaginationController<T> extends PaginationControlsState {
  paginatedItems: T[];
}
