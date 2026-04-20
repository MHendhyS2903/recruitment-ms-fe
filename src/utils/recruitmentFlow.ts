import type { RecruiterCandidateRecord } from '../types/recruiter';
import type { SalesCandidateRecord } from '../types/sales';
import { createSalesCandidateFromRecruiter } from './salesStorage';

interface RecruitmentFlowResult {
  recruiterCandidates: RecruiterCandidateRecord[];
  salesCandidates: SalesCandidateRecord[];
}

export const handoffRecruiterCandidateToSales = (
  recruiterCandidateId: string,
  recruiterCandidates: RecruiterCandidateRecord[],
  salesCandidates: SalesCandidateRecord[]
): RecruitmentFlowResult => {
  const targetRecruiterCandidate = recruiterCandidates.find(
    (candidate) => candidate.id === recruiterCandidateId
  );

  if (!targetRecruiterCandidate || targetRecruiterCandidate.stage !== 'TO DO') {
    return { recruiterCandidates, salesCandidates };
  }

  const existingSalesCandidate = salesCandidates.find(
    (candidate) =>
      candidate.recruiterCandidateId === recruiterCandidateId ||
      candidate.id === targetRecruiterCandidate.salesCandidateId
  );
  const nextSalesCandidate = createSalesCandidateFromRecruiter(
    { ...targetRecruiterCandidate, stage: 'READY TO INTERVIEW' },
    {
      id: existingSalesCandidate?.id,
      createdAt: existingSalesCandidate?.createdAt,
      stage: 'TO DO',
      interviewSchedule: existingSalesCandidate?.interviewSchedule,
      interviewLink: existingSalesCandidate?.interviewLink,
    }
  );

  return {
    recruiterCandidates: recruiterCandidates.map((candidate) =>
      candidate.id === recruiterCandidateId
        ? {
            ...candidate,
            stage: 'READY TO INTERVIEW',
            salesCandidateId: nextSalesCandidate.id,
          }
        : candidate
    ),
    salesCandidates: existingSalesCandidate
      ? salesCandidates.map((candidate) =>
          candidate.id === existingSalesCandidate.id ? nextSalesCandidate : candidate
        )
      : [nextSalesCandidate, ...salesCandidates],
  };
};

export const syncRecruiterCandidateFromSales = (
  salesCandidate: SalesCandidateRecord,
  recruiterCandidates: RecruiterCandidateRecord[]
): RecruiterCandidateRecord[] =>
  recruiterCandidates.map((candidate) =>
    candidate.id === salesCandidate.recruiterCandidateId
      ? {
          ...candidate,
          fullName: salesCandidate.fullName,
          appliedRole: salesCandidate.appliedRole,
          email: salesCandidate.email,
          phone: salesCandidate.phone,
          source: salesCandidate.source,
          location: salesCandidate.location,
          expectedSalary: salesCandidate.expectedSalary,
          dateOfJoin: salesCandidate.dateOfJoin,
          summary: salesCandidate.summary,
          documents: salesCandidate.documents,
          candidatePhotoName: salesCandidate.candidatePhotoName ?? '',
          candidatePhotoUrl: salesCandidate.candidatePhotoUrl ?? '',
          salesCandidateId: salesCandidate.id,
        }
      : candidate
  );

export const syncSalesCandidateFromRecruiter = (
  recruiterCandidate: RecruiterCandidateRecord,
  salesCandidates: SalesCandidateRecord[]
): SalesCandidateRecord[] =>
  salesCandidates.map((candidate) =>
    candidate.recruiterCandidateId === recruiterCandidate.id ||
    candidate.id === recruiterCandidate.salesCandidateId
      ? {
          ...candidate,
          fullName: recruiterCandidate.fullName,
          appliedRole: recruiterCandidate.appliedRole,
          email: recruiterCandidate.email,
          phone: recruiterCandidate.phone,
          source: recruiterCandidate.source,
          location: recruiterCandidate.location,
          expectedSalary: recruiterCandidate.expectedSalary,
          dateOfJoin: recruiterCandidate.dateOfJoin,
          summary: recruiterCandidate.summary,
          documents: recruiterCandidate.documents,
          candidatePhotoName: recruiterCandidate.candidatePhotoName ?? '',
          candidatePhotoUrl: recruiterCandidate.candidatePhotoUrl ?? '',
        }
      : candidate
  );

export const processSalesCandidateAndSyncRecruiter = (
  salesCandidateId: string,
  interviewSchedule: string,
  interviewLink: string,
  salesCandidates: SalesCandidateRecord[],
  recruiterCandidates: RecruiterCandidateRecord[]
): RecruitmentFlowResult => {
  const targetSalesCandidate = salesCandidates.find((candidate) => candidate.id === salesCandidateId);

  if (!targetSalesCandidate || targetSalesCandidate.stage !== 'TO DO') {
    return { recruiterCandidates, salesCandidates };
  }

  const nextSalesCandidate: SalesCandidateRecord = {
    ...targetSalesCandidate,
    stage: 'INTERVIEWING',
    interviewSchedule,
    interviewLink,
  };

  return {
    salesCandidates: salesCandidates.map((candidate) =>
      candidate.id === salesCandidateId ? nextSalesCandidate : candidate
    ),
    recruiterCandidates: recruiterCandidates.map((candidate) =>
      candidate.id === targetSalesCandidate.recruiterCandidateId
        ? {
            ...candidate,
            stage: 'INTERVIEWING',
            salesCandidateId: nextSalesCandidate.id,
          }
        : candidate
    ),
  };
};

export const removeSalesCandidateAndResetRecruiter = (
  salesCandidateId: string,
  salesCandidates: SalesCandidateRecord[],
  recruiterCandidates: RecruiterCandidateRecord[]
): RecruitmentFlowResult => {
  const targetSalesCandidate = salesCandidates.find((candidate) => candidate.id === salesCandidateId);

  if (!targetSalesCandidate) {
    return { recruiterCandidates, salesCandidates };
  }

  return {
    salesCandidates: salesCandidates.filter((candidate) => candidate.id !== salesCandidateId),
    recruiterCandidates: recruiterCandidates.map((candidate) =>
      candidate.id === targetSalesCandidate.recruiterCandidateId
        ? {
            ...candidate,
            stage: 'TO DO',
            salesCandidateId: '',
          }
        : candidate
    ),
  };
};
