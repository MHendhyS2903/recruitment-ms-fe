import type { ReactNode } from 'react';
import type {
  Interview,
  InterviewFilterChangeEvent,
  InterviewFilters,
  InterviewFormChangeEvent,
  InterviewFormData,
  InterviewId,
  InterviewImportInput,
  InterviewSubmitEvent,
  InterviewSummary,
} from './interview';
import type {
  MasterReport,
  MasterReportCategory,
  MasterReportCode,
  MasterReportFilterChangeEvent,
  MasterReportFilters,
  MasterReportFormChangeEvent,
  MasterReportFormData,
  MasterReportId,
  MasterReportSource,
  MasterReportSubmitEvent,
  MasterReportSummary,
  MasterReportTracking,
} from './masterReport';
import type { PaginationControlsState } from './pagination';

export interface UseInterviewDashboardResult {
  error: string;
  filters: InterviewFilters;
  formData: InterviewFormData;
  filteredInterviews: Interview[];
  interviews: Interview[];
  isModalOpen: boolean;
  editingId: InterviewId | null;
  loading: boolean;
  ownerOptions: string[];
  pagination: PaginationControlsState;
  summary: InterviewSummary;
  closeModal: () => void;
  handleDelete: (id: InterviewId) => void;
  handleFilterChange: (event: InterviewFilterChangeEvent) => void;
  handleInputChange: (event: InterviewFormChangeEvent) => void;
  handleNextPage: () => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handlePreviousPage: () => void;
  handleSubmit: (event: InterviewSubmitEvent) => void;
  importInterviews: (items: InterviewImportInput[]) => void;
  openAddModal: () => void;
  openEditModal: (item: Interview) => void;
  resetFilters: () => void;
}

export interface UseMasterReportResult {
  categoryOptions: Array<MasterReportCategory | 'ALL'>;
  categoryFormOptions: MasterReportCategory[];
  codeOptions: MasterReportCode[];
  designationOptions: string[];
  filters: MasterReportFilters;
  formData: MasterReportFormData;
  filteredReports: MasterReport[];
  isModalOpen: boolean;
  editingId: MasterReportId | null;
  sourceFormOptions: MasterReportSource[];
  sourceOptions: Array<MasterReportSource | 'ALL'>;
  summary: MasterReportSummary;
  taOptions: string[];
  trackingOptions: MasterReportTracking[];
  closeModal: () => void;
  handleDelete: (id: MasterReportId) => void;
  handleFilterChange: (event: MasterReportFilterChangeEvent) => void;
  handleInputChange: (event: MasterReportFormChangeEvent) => void;
  handleSubmit: (event: MasterReportSubmitEvent) => void;
  openAddModal: () => void;
  openEditModal: (item: MasterReport) => void;
  resetFilters: () => void;
}

export interface DashboardPageProps {
  dashboard: UseInterviewDashboardResult;
}

export interface InterviewPageProps {
  dashboard: UseInterviewDashboardResult;
}

export interface PipelinePageProps {
  dashboard: UseInterviewDashboardResult;
}

export interface MasterReportPageProps {
  masterReport: UseMasterReportResult;
}

export interface DashboardLayoutProps {
  activeRecords: number;
  children: ReactNode;
}

export interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export interface InfoPanelProps {
  title: string;
  description: string;
  children: ReactNode;
}

export interface SummaryCardProps {
  label: string;
  value: string | number;
  description: string;
  className?: string;
}
