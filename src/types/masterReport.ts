import type { ChangeEvent, FormEvent } from 'react';

export type MasterReportId = string | number;
export type MasterReportSource = 'MARKET';
export type MasterReportCode = 'DITO' | 'NISSA' | 'EZRA';
export type MasterReportTracking =
  | 'CLOSED'
  | 'REJECT INTERVIEW'
  | 'REJECT OFFER'
  | 'Gone by user'
  | 'INTERVIEW';
export type MasterReportCategory = 'CLOSED' | 'ACTIVE' | 'ON HOLD';

export interface MasterReport {
  id: MasterReportId;
  source: MasterReportSource;
  ta: string;
  experience: string;
  designation: string;
  name: string;
  availability: string;
  ctc: string;
  code: MasterReportCode | '';
  submitDate: string;
  monthSubmitDate: string;
  monthInterviewDate: string;
  updateTracking: MasterReportTracking;
  joinDate: string;
  monthDoj: string;
  category: MasterReportCategory;
}

export type MasterReportFormData = Omit<MasterReport, 'id'>;

export interface MasterReportFilters {
  search: string;
  source: MasterReportSource | 'ALL';
  designation: string | 'ALL';
  category: MasterReportCategory | 'ALL';
}

export interface MasterReportSummary {
  total: number;
  closed: number;
  interview: number;
  active: number;
  hold: number;
}

export type MasterReportFilterChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLSelectElement
>;

export type MasterReportFormChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

export type MasterReportSubmitEvent = FormEvent<HTMLFormElement>;
