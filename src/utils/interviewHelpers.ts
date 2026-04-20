import type { CandidateStatus, InterviewStatus } from '../types/interview';

type ScheduleInput = string | number | Date | null | undefined;

const normalizeDateInput = (value: ScheduleInput): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
      const date = new Date(trimmed);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(trimmed)) {
      const date = new Date(trimmed.replace(' ', 'T'));
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

export const formatSchedule = (value: ScheduleInput): string => {
  const normalizedDate = normalizeDateInput(value);

  if (!normalizedDate) {
    return 'Tanggal tidak valid';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(normalizedDate);
};

export const getStatusClassName = (
  type: 'candidateStatus' | 'interviewStatus',
  value: CandidateStatus | InterviewStatus
): string => {
  if (type === 'candidateStatus') {
    return `badge badge-${value.toLowerCase()}`;
  }

  return value === 'FAILED' ? 'badge badge-failed' : 'badge badge-process';
};
