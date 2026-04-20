import type { ChangeEvent } from 'react';

interface PaginationControlsProps {
  currentPage: number;
  endItem: number;
  pageSize: number;
  pageSizeOptions: number[];
  startItem: number;
  totalItems: number;
  totalPages: number;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onPreviousPage: () => void;
}

function PaginationControls({
  currentPage,
  endItem,
  pageSize,
  pageSizeOptions,
  startItem,
  totalItems,
  totalPages,
  onNextPage,
  onPageChange,
  onPageSizeChange,
  onPreviousPage,
}: PaginationControlsProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination-bar">
      <div className="pagination-summary">
        <span>
          Menampilkan {startItem}-{endItem} dari {totalItems} data
        </span>
      </div>

      <div className="pagination-actions">
        <label className="pagination-size">
          <select value={pageSize} onChange={onPageSizeChange}>
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button
          className="pagination-button"
          type="button"
          onClick={onPreviousPage}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        <div className="pagination-pages">
          {pages.map((page) => (
            <button
              key={page}
              className={`pagination-button ${
                page === currentPage ? 'pagination-button-active' : ''
              }`}
              type="button"
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          className="pagination-button"
          type="button"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PaginationControls;
