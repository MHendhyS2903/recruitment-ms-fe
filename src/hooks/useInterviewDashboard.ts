import { useCallback, useEffect, useMemo } from 'react';
import {
  closeModal as closeModalAction,
  deleteInterviewLocally,
  fetchInterviews,
  importInterviewsLocally,
  openAddModal as openAddModalAction,
  openEditModal as openEditModalAction,
  resetFilters as resetFiltersAction,
  saveInterviewLocally,
  setFilter,
  setFormField,
  setLimit,
  setPage,
} from '../store/interviewsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { UseInterviewDashboardResult } from '../types/dashboard';
import type {
  Interview,
  InterviewFilterChangeEvent,
  InterviewFilters,
  InterviewFormChangeEvent,
  InterviewFormData,
  InterviewId,
  InterviewImportInput,
  InterviewSubmitEvent,
} from '../types/interview';

const getFilterValue = (
  name: keyof InterviewFilters,
  value: string
): InterviewFilters[keyof InterviewFilters] => value;

const getFormValue = (
  name: keyof InterviewFormData,
  value: string
): InterviewFormData[keyof InterviewFormData] => value;

export const useInterviewDashboard = (): UseInterviewDashboardResult => {
  const dispatch = useAppDispatch();
  const {
    editingId,
    error,
    filters,
    formData,
    isModalOpen,
    items: interviews,
    loading,
    pagination,
  } = useAppSelector((state) => state.interviews);

  useEffect(() => {
    void dispatch(fetchInterviews({ page: pagination.page, limit: pagination.limit }));
  }, [dispatch, pagination.limit, pagination.page]);

  const ownerOptions = useMemo(
    () => ['ALL', ...Array.from(new Set(interviews.map((item) => item.owner)))],
    [interviews]
  );

  const filteredInterviews = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return interviews
      .filter((item) => {
        const matchesSearch =
          searchTerm === '' ||
          item.candidateName.toLowerCase().includes(searchTerm) ||
          item.role.toLowerCase().includes(searchTerm) ||
          item.host.toLowerCase().includes(searchTerm) ||
          item.notes.toLowerCase().includes(searchTerm);

        const matchesCandidateStatus =
          filters.candidateStatus === 'ALL' ||
          item.candidateStatus === filters.candidateStatus;

        const matchesOwner =
          filters.owner === 'ALL' || item.owner === filters.owner;

        const matchesInterviewStatus =
          filters.interviewStatus === 'ALL' ||
          item.interviewStatus === filters.interviewStatus;

        return (
          matchesSearch &&
          matchesCandidateStatus &&
          matchesOwner &&
          matchesInterviewStatus
        );
      })
      .sort(
        (a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime()
      );
  }, [filters, interviews]);

  const summary = useMemo(
    () =>
      filteredInterviews.reduce(
        (accumulator, item) => {
          accumulator.total += 1;

          if (item.interviewStatus === 'PROCESS') {
            accumulator.process += 1;
          }

          if (item.interviewStatus === 'FAILED') {
            accumulator.failed += 1;
          }

          if (item.candidateStatus === 'RESCHEDULE') {
            accumulator.reschedule += 1;
          }

          return accumulator;
        },
        {
          total: 0,
          process: 0,
          failed: 0,
          reschedule: 0,
        }
      ),
    [filteredInterviews]
  );

  const handleOpenAddModal = useCallback(() => {
    dispatch(openAddModalAction());
  }, [dispatch]);

  const handleOpenEditModal = useCallback(
    (item: Interview) => {
      dispatch(openEditModalAction(item));
    },
    [dispatch]
  );

  const handleCloseModal = useCallback(() => {
    dispatch(closeModalAction());
  }, [dispatch]);

  const handleFilterChange = useCallback(
    (event: InterviewFilterChangeEvent) => {
      const { name, value } = event.target;
      const key = name as keyof InterviewFilters;

      dispatch(
        setFilter({
          name: key,
          value: getFilterValue(key, value),
        })
      );
    },
    [dispatch]
  );

  const handleInputChange = useCallback(
    (event: InterviewFormChangeEvent) => {
      const { name, value } = event.target;
      const key = name as keyof InterviewFormData;

      dispatch(
        setFormField({
          name: key,
          value: getFormValue(key, value),
        })
      );
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(resetFiltersAction());
  }, [dispatch]);

  const handleSubmit = useCallback(
    (event: InterviewSubmitEvent) => {
      event.preventDefault();

      if (
        !formData.candidateName.trim() ||
        !formData.role.trim() ||
        !formData.schedule ||
        !formData.owner.trim() ||
        !formData.meetingLink.trim() ||
        !formData.host.trim()
      ) {
        window.alert('Mohon lengkapi semua field wajib sebelum menyimpan data.');
        return;
      }

      dispatch(saveInterviewLocally({ editingId, formData }));
      dispatch(closeModalAction());
    },
    [dispatch, editingId, formData]
  );

  const handleDelete = useCallback(
    (id: InterviewId) => {
      const selected = interviews.find((item) => item.id === id);

      if (!selected) {
        return;
      }

      const isConfirmed = window.confirm(
        `Hapus data interview untuk ${selected.candidateName}?`
      );

      if (isConfirmed) {
        dispatch(deleteInterviewLocally(id));
      }
    },
    [dispatch, interviews]
  );

  const importInterviews = useCallback(
    (items: InterviewImportInput[]) => {
      if (!items.length) {
        return;
      }

      dispatch(importInterviewsLocally(items));
    },
    [dispatch]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setPage(page));
    },
    [dispatch]
  );

  const handlePreviousPage = useCallback(() => {
    if (pagination.page > 1) {
      dispatch(setPage(pagination.page - 1));
    }
  }, [dispatch, pagination.page]);

  const handleNextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      dispatch(setPage(pagination.page + 1));
    }
  }, [dispatch, pagination.page, pagination.totalPages]);

  const handlePageSizeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      dispatch(setLimit(Number(event.target.value)));
    },
    [dispatch]
  );

  const paginationState = useMemo(
    () => ({
      currentPage: pagination.page,
      endItem: Math.min(
        (pagination.page - 1) * pagination.limit + filteredInterviews.length,
        pagination.total
      ),
      pageSize: pagination.limit,
      pageSizeOptions: [5, 10, 20, 50],
      startItem:
        pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1,
      totalItems: pagination.total,
      totalPages: pagination.totalPages,
      goToNextPage: handleNextPage,
      goToPage: handlePageChange,
      goToPreviousPage: handlePreviousPage,
      handlePageSizeChange,
    }),
    [
      filteredInterviews.length,
      handleNextPage,
      handlePageChange,
      handlePageSizeChange,
      handlePreviousPage,
      pagination,
    ]
  );

  return useMemo(
    () => ({
      error,
      filters,
      formData,
      filteredInterviews,
      interviews,
      isModalOpen,
      editingId,
      loading,
      ownerOptions,
      pagination: paginationState,
      summary,
      closeModal: handleCloseModal,
      handleDelete,
      handleFilterChange,
      handleInputChange,
      handleNextPage,
      handlePageChange,
      handlePageSizeChange,
      handlePreviousPage,
      handleSubmit,
      importInterviews,
      openAddModal: handleOpenAddModal,
      openEditModal: handleOpenEditModal,
      resetFilters,
    }),
    [
      editingId,
      error,
      filteredInterviews,
      filters,
      formData,
      handleCloseModal,
      handleDelete,
      handleFilterChange,
      handleInputChange,
      handleNextPage,
      handleOpenAddModal,
      handleOpenEditModal,
      handlePageChange,
      handlePageSizeChange,
      handlePreviousPage,
      handleSubmit,
      importInterviews,
      interviews,
      isModalOpen,
      loading,
      ownerOptions,
      paginationState,
      resetFilters,
      summary,
    ]
  );
};
