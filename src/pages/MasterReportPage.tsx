import PaginationControls from '../components/common/PaginationControls';
import PageHeader from '../components/dashboard/PageHeader';
import SummaryCard from '../components/dashboard/SummaryCard';
import MasterReportFilters from '../components/master-report/MasterReportFilters';
import MasterReportModal from '../components/master-report/MasterReportModal';
import MasterReportTable from '../components/master-report/MasterReportTable';
import { usePagination } from '../hooks/usePagination';
import type { MasterReportPageProps } from '../types/dashboard';

function MasterReportPage({ masterReport }: MasterReportPageProps) {
  const {
    categoryOptions,
    categoryFormOptions,
    codeOptions,
    designationOptions,
    editingId,
    filters,
    formData,
    filteredReports,
    isModalOpen,
    sourceFormOptions,
    sourceOptions,
    summary,
    trackingOptions,
    handleFilterChange,
    handleInputChange,
    handleSubmit,
    closeModal,
    handleDelete,
    openAddModal,
    openEditModal,
    resetFilters,
  } = masterReport;

  const pagination = usePagination(filteredReports);

  return (
    <>
      <PageHeader
        eyebrow="Master Report"
        title="Master Report Candidates"
        description="Halaman report kandidat dengan tampilan spreadsheet untuk memantau source, designation, progress user, dan employee status."
        action={
          <button className="primary-button" type="button" onClick={openAddModal}>
            + Tambah Data
          </button>
        }
      />

      <section className="summary-grid">
        <SummaryCard
          label="Total Rows"
          value={summary.total}
          description="Data report setelah filter aktif"
        />
        <SummaryCard
          label="Active"
          value={summary.active}
          description="Kategori kandidat yang masih aktif"
        />
        <SummaryCard
          label="Reject Interview"
          value={summary.interview}
          description="Kandidat dengan update tracking reject interview"
        />
        <SummaryCard
          label="On Hold"
          value={summary.hold}
          description="Kandidat yang sedang ditahan atau belum final"
        />
        <SummaryCard
          label="Closed"
          value={summary.closed}
          description="Kandidat yang sudah selesai diproses"
        />
      </section>

      <MasterReportFilters
        filters={filters}
        sourceOptions={sourceOptions}
        designationOptions={designationOptions}
        categoryOptions={categoryOptions}
        onChange={handleFilterChange}
        onReset={resetFilters}
      />

      <MasterReportTable
        reports={pagination.paginatedItems}
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

      <MasterReportModal
        editingId={editingId}
        formData={formData}
        isOpen={isModalOpen}
        sourceOptions={sourceFormOptions}
        codeOptions={codeOptions}
        trackingOptions={trackingOptions}
        categoryOptions={categoryFormOptions}
        onChange={handleInputChange}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export default MasterReportPage;
