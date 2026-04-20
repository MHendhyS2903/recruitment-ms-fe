import type { ChangeEvent, FormEvent } from 'react';

export type InterviewId = string | number;

export type CandidateStatus = 'INTERVIEW' | 'BACKOUT' | 'RESCHEDULE';
export type InterviewStatus = 'PROCESS' | 'FAILED';

export interface Interview {
  id: InterviewId;
  candidateName: string;
  role: string;
  candidateStatus: CandidateStatus;
  schedule: string;
  owner: string;
  meetingLink: string;
  host: string;
  interviewStatus: InterviewStatus;
  notes: string;
}

export type InterviewFormData = Omit<Interview, 'id'>;

export interface InterviewFilters {
  search: string;
  candidateStatus: CandidateStatus | 'ALL';
  owner: string | 'ALL';
  interviewStatus: InterviewStatus | 'ALL';
}

export interface InterviewSummary {
  total: number;
  process: number;
  failed: number;
  reschedule: number;
}

export type InterviewFilterChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLSelectElement
>;

export type InterviewFormChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

export type InterviewSubmitEvent = FormEvent<HTMLFormElement>;

export interface InterviewImportInput {
  candidateName: string;
  role: string;
  candidateStatus?: CandidateStatus;
  schedule?: string;
  owner?: string;
  meetingLink?: string;
  host?: string;
  interviewStatus?: InterviewStatus;
  notes?: string;
}

export interface ParsedOcrInterviewEntry extends InterviewImportInput {
  id: string;
  candidateStatus: CandidateStatus;
  schedule: string;
  owner: string;
  meetingLink: string;
  host: string;
  interviewStatus: InterviewStatus;
  notes: string;
  sourceLabel: string;
  time: string;
}

export interface ParsedOcrResult {
  detectedDate: string;
  entries: ParsedOcrInterviewEntry[];
  supportedMonths: string[];
}
