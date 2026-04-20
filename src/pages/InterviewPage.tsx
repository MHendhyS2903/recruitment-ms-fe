import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import PaginationControls from '../components/common/PaginationControls';
import FilterPanel from '../components/dashboard/FilterPanel';
import InterviewModal from '../components/dashboard/InterviewModal';
import InterviewOcrModal from '../components/dashboard/InterviewOcrModal';
import InterviewTable from '../components/dashboard/InterviewTable';
import PageHeader from '../components/dashboard/PageHeader';
import type { InterviewPageProps } from '../types/dashboard';
import type { InterviewImportInput } from '../types/interview';
import { exportInterviewsToExcel } from '../utils/exportInterviewsToExcel';
import { importInterviewCsv } from '../utils/importInterviewCsv';

function ExcelIcon() {
  return (
    <svg
      aria-hidden="true"
      className="button-icon"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M14.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5L14.5 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 10.5h6M9 14h6M9 17.5h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3.75 10.25 1.75 12l2 1.75M1.75 12h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InterviewPage({ dashboard }: InterviewPageProps) {
  const {
    editingId,
    error,
    filters,
    formData,
    filteredInterviews,
    isModalOpen,
    loading,
    ownerOptions,
    pagination,
    closeModal,
    handleDelete,
    handleFilterChange,
    handleInputChange,
    handleSubmit,
    importInterviews,
    openAddModal,
    openEditModal,
    resetFilters,
  } = dashboard;
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = useCallback(() => {
    exportInterviewsToExcel(filteredInterviews);
  }, [filteredInterviews]);

  const handleOpenOcrModal = useCallback(() => {
    setIsOcrModalOpen(true);
  }, []);

  const handleCloseOcrModal = useCallback(() => {
    setIsOcrModalOpen(false);
  }, []);

  const handleImportFromOcr = useCallback(
    (items: InterviewImportInput[]) => {
      importInterviews(items);
    },
    [importInterviews]
  );

  const handleOpenCsvPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportCsvFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      try {
        const importedItems = await importInterviewCsv(file);

        if (!importedItems.length) {
          window.alert('Tidak ada data valid yang ditemukan di file CSV.');
          return;
        }

        importInterviews(importedItems);
        window.alert(`${importedItems.length} data interview berhasil diimport.`);
      } catch (error) {
        window.alert(
          error instanceof Error ? error.message : 'Import CSV gagal diproses.'
        );
      } finally {
        event.target.value = '';
      }
    },
    [importInterviews]
  );

  return (
    <>
      <PageHeader
        eyebrow="Interview Module"
        title="Interview Schedule"
        description="Kelola data interview dengan filter, dan CRUD."
        action={
          <div className="hero-actions">
            <input
              ref={fileInputRef}
              accept=".csv"
              className="hidden-file-input"
              type="file"
              onChange={handleImportCsvFile}
            />
            <button
              className="ghost-button icon-button"
              type="button"
              onClick={handleExport}
            >
              <ExcelIcon />
              Export Excel
            </button>
            <button className="ghost-button" type="button" onClick={handleOpenCsvPicker}>
              Import CSV
            </button>
            <button className="ghost-button" type="button" onClick={handleOpenOcrModal}>
              Tambah via OCR
            </button>
            <button className="primary-button" type="button" onClick={openAddModal}>
              + Tambah Kandidat
            </button>
          </div>
        }
      />

      <FilterPanel
        filters={filters}
        ownerOptions={ownerOptions}
        onChange={handleFilterChange}
        onReset={resetFilters}
      />

      {loading && <p className="api-feedback">Memuat data interview dari API...</p>}
      {error && <p className="api-feedback api-feedback-error">{error}</p>}

      <InterviewTable
        interviews={filteredInterviews}
        onDelete={handleDelete}
        onEdit={openEditModal}
      />

      <PaginationControls
        currentPage={pagination.currentPage}
        endItem={pagination.endItem}
        pageSize={pagination.pageSize}
        pageSizeOptions={pagination.pageSizeOptions}
        startItem={pagination.startItem}
        totalItems={pagination.totalItems}
        totalPages={pagination.totalPages}
        onNextPage={pagination.goToNextPage}
        onPageChange={pagination.goToPage}
        onPageSizeChange={pagination.handlePageSizeChange}
        onPreviousPage={pagination.goToPreviousPage}
      />

      <InterviewModal
        editingId={editingId}
        formData={formData}
        isOpen={isModalOpen}
        onChange={handleInputChange}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <InterviewOcrModal
        isOpen={isOcrModalOpen}
        onClose={handleCloseOcrModal}
        onImport={handleImportFromOcr}
      />
    </>
  );
}

export default InterviewPage;
