import { initialRecruiterCandidates } from '../data/recruiterCandidates';
import type { RecruiterCandidateRecord, RecruiterStage } from '../types/recruiter';
import { isProductionBuild } from './isProductionBuild';

export const RECRUITER_STORAGE_KEY = 'recruiter-candidate-records';
export const RECRUITER_SEEDED_CANDIDATE_PREFIX = 'candidate-seeded-';

export const normalizeRecruiterStage = (stage: string): RecruiterStage => {
  const normalizedStage = stage.trim().toUpperCase().replace(/\s+/g, ' ');

  switch (normalizedStage) {
    case 'BARU':
    case 'TODO':
    case 'TO DO':
      return 'TO DO';
    case 'SCREENING':
    case 'READY':
    case 'READY INTERVIEW':
    case 'READY TO INTERVIEW':
      return 'READY TO INTERVIEW';
    case 'INTERVIEW':
    case 'OFFER':
    case 'INTERVIEWING':
    case 'IN PROGRESS':
    case 'ON GOING':
    case 'ONGOING':
      return 'INTERVIEWING';
    default:
      return 'TO DO';
  }
};

export const normalizeRecruiterCandidate = (
  candidate: RecruiterCandidateRecord
): RecruiterCandidateRecord => ({
  ...candidate,
  stage: normalizeRecruiterStage(candidate.stage),
  dateOfJoin: candidate.dateOfJoin ?? '',
  salesCandidateId: candidate.salesCandidateId ?? '',
  candidatePhotoName: candidate.candidatePhotoName ?? '',
  candidatePhotoUrl: candidate.candidatePhotoUrl ?? '',
});

const isSeededRecruiterCandidate = (candidate: RecruiterCandidateRecord) =>
  candidate.id.startsWith(RECRUITER_SEEDED_CANDIDATE_PREFIX);

const seededFallback = (): RecruiterCandidateRecord[] =>
  isProductionBuild()
    ? []
    : initialRecruiterCandidates.map(normalizeRecruiterCandidate);

export const readRecruiterCandidates = (): RecruiterCandidateRecord[] => {
  if (typeof window === 'undefined') {
    return seededFallback();
  }

  const rawValue = window.localStorage.getItem(RECRUITER_STORAGE_KEY);

  if (!rawValue) {
    return seededFallback();
  }

  try {
    const parsedValue = JSON.parse(rawValue) as RecruiterCandidateRecord[];

    if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
      return seededFallback();
    }

    const normalizedCandidates = parsedValue.map(normalizeRecruiterCandidate);
    const customCandidates = normalizedCandidates.filter(
      (candidate) => !isSeededRecruiterCandidate(candidate)
    );
    const hasOnlySeededData =
      customCandidates.length === 0 && normalizedCandidates.every(isSeededRecruiterCandidate);

    if (hasOnlySeededData) {
      return seededFallback();
    }

    if (isProductionBuild()) {
      return customCandidates.map(normalizeRecruiterCandidate);
    }

    return [...customCandidates, ...initialRecruiterCandidates].map(
      normalizeRecruiterCandidate
    );
  } catch {
    return seededFallback();
  }
};

export const writeRecruiterCandidates = (candidates: RecruiterCandidateRecord[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(RECRUITER_STORAGE_KEY, JSON.stringify(candidates));
};
