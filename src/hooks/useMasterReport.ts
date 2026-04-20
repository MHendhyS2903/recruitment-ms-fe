import { useCallback, useMemo, useState } from 'react';
import {
  emptyMasterReportForm,
  initialMasterReports,
  masterReportCategoryOptions,
  masterReportCodeOptions,
  masterReportSourceOptions,
  masterReportTrackingOptions,
} from '../data/masterReportData';
import { isProductionBuild } from '../utils/isProductionBuild';
import type { UseMasterReportResult } from '../types/dashboard';
import type {
  MasterReport,
  MasterReportFilterChangeEvent,
  MasterReportFilters,
  MasterReportFormChangeEvent,
  MasterReportFormData,
  MasterReportId,
  MasterReportSubmitEvent,
} from '../types/masterReport';

const defaultMasterFilters: MasterReportFilters = {
  search: '',
  source: 'ALL',
  designation: 'ALL',
  category: 'ALL',
};

export const useMasterReport = (): UseMasterReportResult => {
  const [reports, setReports] = useState<MasterReport[]>(() =>
    isProductionBuild() ? [] : initialMasterReports
  );
  const [filters, setFilters] = useState<MasterReportFilters>(defaultMasterFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<MasterReportId | null>(null);
  const [formData, setFormData] = useState<MasterReportFormData>(emptyMasterReportForm);

  const reportOptions = useMemo(() => {
    const sourceSet = new Set<MasterReport['source']>();
    const designationSet = new Set<string>();
    const categorySet = new Set<MasterReport['category']>();
    const taSet = new Set<string>();

    reports.forEach((item) => {
      sourceSet.add(item.source);
      designationSet.add(item.designation);
      categorySet.add(item.category);
      taSet.add(item.ta);
    });

    return {
      sourceOptions: ['ALL', ...Array.from(sourceSet)] as Array<'ALL' | MasterReport['source']>,
      designationOptions: ['ALL', ...Array.from(designationSet)],
      categoryOptions: ['ALL', ...Array.from(categorySet)] as Array<
        'ALL' | MasterReport['category']
      >,
      taOptions: ['ALL', ...Array.from(taSet)],
    };
  }, [reports]);

  const {
    categoryOptions,
    designationOptions,
    sourceOptions,
    taOptions,
  } = reportOptions;

  const filteredReports = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return reports.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.designation.toLowerCase().includes(searchTerm) ||
        item.code.toLowerCase().includes(searchTerm) ||
        item.ta.toLowerCase().includes(searchTerm);

      const matchesSource =
        filters.source === 'ALL' || item.source === filters.source;

      const matchesDesignation =
        filters.designation === 'ALL' || item.designation === filters.designation;

      const matchesCategory =
        filters.category === 'ALL' || item.category === filters.category;

      return (
        matchesSearch && matchesSource && matchesDesignation && matchesCategory
      );
    });
  }, [filters, reports]);

  const summary = useMemo(
    () =>
      filteredReports.reduce(
        (accumulator, item) => {
          accumulator.total += 1;

          if (item.category === 'CLOSED') {
            accumulator.closed += 1;
          }

          if (item.updateTracking === 'REJECT INTERVIEW') {
            accumulator.interview += 1;
          }

          if (item.category === 'ACTIVE') {
            accumulator.active += 1;
          }

          if (item.category === 'ON HOLD') {
            accumulator.hold += 1;
          }

          return accumulator;
        },
        {
          total: 0,
          closed: 0,
          interview: 0,
          active: 0,
          hold: 0,
        }
      ),
    [filteredReports]
  );

  const handleFilterChange = useCallback(
    (event: MasterReportFilterChangeEvent) => {
      const { name, value } = event.target;
      const key = name as keyof MasterReportFilters;

      setFilters((current) => ({
        ...current,
        [key]: value as MasterReportFilters[typeof key],
      }));
    },
    []
  );

  const handleInputChange = useCallback((event: MasterReportFormChangeEvent) => {
    const { name, value } = event.target;
    const key = name as keyof MasterReportFormData;

    setFormData((current) => ({
      ...current,
      [key]: value as MasterReportFormData[typeof key],
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultMasterFilters);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingId(null);
    setFormData(emptyMasterReportForm);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: MasterReport) => {
    setEditingId(item.id);
    setFormData({
      source: item.source,
      ta: item.ta,
      experience: item.experience,
      designation: item.designation,
      name: item.name,
      availability: item.availability,
      ctc: item.ctc,
      code: item.code,
      submitDate: item.submitDate,
      monthSubmitDate: item.monthSubmitDate,
      monthInterviewDate: item.monthInterviewDate,
      updateTracking: item.updateTracking,
      joinDate: item.joinDate,
      monthDoj: item.monthDoj,
      category: item.category,
    });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyMasterReportForm);
  }, []);

  const handleSubmit = useCallback(
    (event: MasterReportSubmitEvent) => {
      event.preventDefault();

      if (
        !formData.ta.trim() ||
        !formData.experience.trim() ||
        !formData.designation.trim() ||
        !formData.name.trim() ||
        !formData.availability.trim() ||
        !formData.ctc.trim() ||
        !formData.code.trim() ||
        !formData.submitDate.trim()
      ) {
        window.alert('Mohon lengkapi field wajib sebelum menyimpan data.');
        return;
      }

      if (editingId !== null) {
        setReports((current) =>
          current.map((item) =>
            item.id === editingId ? { ...item, ...formData } : item
          )
        );
      } else {
        setReports((current) => [
          {
            id: Date.now(),
            ...formData,
          },
          ...current,
        ]);
      }

      closeModal();
    },
    [closeModal, editingId, formData]
  );

  const handleDelete = useCallback(
    (id: MasterReportId) => {
      const selected = reports.find((item) => item.id === id);

      if (!selected) {
        return;
      }

      const isConfirmed = window.confirm(
        `Hapus data master report untuk ${selected.name}?`
      );

      if (isConfirmed) {
        setReports((current) => current.filter((item) => item.id !== id));
      }
    },
    [reports]
  );

  return useMemo(
    () => ({
      categoryOptions,
      codeOptions: masterReportCodeOptions,
      designationOptions,
      filters,
      formData,
      filteredReports,
      isModalOpen,
      editingId,
      sourceFormOptions: masterReportSourceOptions,
      sourceOptions,
      summary,
      taOptions,
      trackingOptions: masterReportTrackingOptions,
      categoryFormOptions: masterReportCategoryOptions,
      closeModal,
      handleDelete,
      handleFilterChange,
      handleInputChange,
      handleSubmit,
      openAddModal,
      openEditModal,
      resetFilters,
    }),
    [
      categoryOptions,
      closeModal,
      designationOptions,
      editingId,
      filteredReports,
      filters,
      formData,
      handleDelete,
      handleFilterChange,
      handleInputChange,
      handleSubmit,
      isModalOpen,
      openAddModal,
      openEditModal,
      resetFilters,
      sourceOptions,
      summary,
      taOptions,
    ]
  );
};
