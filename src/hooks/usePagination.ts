import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { PaginationController } from '../types/pagination';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const usePagination = <T,>(
  items: T[],
  initialPageSize = 10
): PaginationController<T> => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [currentPage, items, pageSize]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((current) => Math.max(1, current - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((current) => Math.min(totalPages, current + 1));
  }, [totalPages]);

  const handlePageSizeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setPageSize(Number(event.target.value));
      setCurrentPage(1);
    },
    []
  );

  return useMemo(
    () => ({
      currentPage,
      endItem,
      pageSize,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      paginatedItems,
      startItem,
      totalItems,
      totalPages,
      goToNextPage,
      goToPage,
      goToPreviousPage,
      handlePageSizeChange,
    }),
    [
      currentPage,
      endItem,
      goToNextPage,
      goToPage,
      goToPreviousPage,
      handlePageSizeChange,
      pageSize,
      paginatedItems,
      startItem,
      totalItems,
      totalPages,
    ]
  );
};
