import { initialSalesCandidates } from '../data/salesCandidates';
import type { RecruiterCandidateRecord } from '../types/recruiter';
import type { SalesCandidateRecord, SalesStage } from '../types/sales';
import { isProductionBuild } from './isProductionBuild';

export const SALES_STORAGE_KEY = 'sales-candidate-records';
export const SALES_SEEDED_CANDIDATE_PREFIX = 'sales-seeded-';

const createSalesId = () =>
  `sales-candidate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const normalizeSalesStage = (stage: string): SalesStage => {
  const normalizedStage = stage.trim().toUpperCase().replace(/\s+/g, ' ');

  switch (normalizedStage) {
    case 'TODO':
    case 'TO DO':
      return 'TO DO';
    case 'INTERVIEW':
    case 'INTERVIEWING':
    case 'IN PROGRESS':
    case 'ON GOING':
    case 'ONGOING':
      return 'INTERVIEWING';
    default:
      return 'TO DO';
  }
};

export const normalizeSalesCandidate = (
  candidate: SalesCandidateRecord
): SalesCandidateRecord => ({
  ...candidate,
  recruiterCandidateId: candidate.recruiterCandidateId ?? '',
  interviewRecordId: candidate.interviewRecordId ?? '',
  stage: normalizeSalesStage(candidate.stage),
  dateOfJoin: candidate.dateOfJoin ?? '',
  interviewSchedule: candidate.interviewSchedule ?? '',
  interviewLink: candidate.interviewLink ?? '',
  candidatePhotoName: candidate.candidatePhotoName ?? '',
  candidatePhotoUrl: candidate.candidatePhotoUrl ?? '',
});

const isSeededSalesCandidate = (candidate: SalesCandidateRecord) =>
  candidate.id.startsWith(SALES_SEEDED_CANDIDATE_PREFIX);

const seededFallback = (): SalesCandidateRecord[] =>
  isProductionBuild()
    ? []
    : initialSalesCandidates.map(normalizeSalesCandidate);

export const readSalesCandidates = (): SalesCandidateRecord[] => {
  if (typeof window === 'undefined') {
    return seededFallback();
  }

  const rawValue = window.localStorage.getItem(SALES_STORAGE_KEY);

  if (!rawValue) {
    return seededFallback();
  }

  try {
    const parsedValue = JSON.parse(rawValue) as SalesCandidateRecord[];

    if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
      return seededFallback();
    }

    const normalizedCandidates = parsedValue.map(normalizeSalesCandidate);
    const customCandidates = normalizedCandidates.filter(
      (candidate) => !isSeededSalesCandidate(candidate)
    );
    const hasOnlySeededData =
      customCandidates.length === 0 && normalizedCandidates.every(isSeededSalesCandidate);

    if (hasOnlySeededData) {
      return seededFallback();
    }

    if (isProductionBuild()) {
      return customCandidates.map(normalizeSalesCandidate);
    }

    return [...customCandidates, ...initialSalesCandidates].map(normalizeSalesCandidate);
  } catch {
    return seededFallback();
  }
};

export const writeSalesCandidates = (candidates: SalesCandidateRecord[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(candidates));
};

export const createSalesCandidateFromRecruiter = (
  recruiterCandidate: RecruiterCandidateRecord,
  overrides?: Partial<SalesCandidateRecord>
): SalesCandidateRecord => ({
  id: overrides?.id ?? createSalesId(),
  recruiterCandidateId: recruiterCandidate.id,
  interviewRecordId: overrides?.interviewRecordId ?? '',
  stage:
    overrides?.stage ??
    (recruiterCandidate.stage === 'INTERVIEWING' ? 'INTERVIEWING' : 'TO DO'),
  createdAt: overrides?.createdAt ?? new Date().toISOString(),
  interviewSchedule: overrides?.interviewSchedule ?? '',
  interviewLink: overrides?.interviewLink ?? '',
  documents: recruiterCandidate.documents,
  candidatePhotoName: recruiterCandidate.candidatePhotoName ?? '',
  candidatePhotoUrl: recruiterCandidate.candidatePhotoUrl ?? '',
  fullName: recruiterCandidate.fullName,
  appliedRole: recruiterCandidate.appliedRole,
  email: recruiterCandidate.email,
  phone: recruiterCandidate.phone,
  source: recruiterCandidate.source,
  location: recruiterCandidate.location,
  expectedSalary: recruiterCandidate.expectedSalary,
  dateOfJoin: recruiterCandidate.dateOfJoin,
  summary: recruiterCandidate.summary,
});
