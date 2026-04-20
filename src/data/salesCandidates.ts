import { initialRecruiterCandidates } from './recruiterCandidates';
import type { SalesCandidateRecord, SalesStage } from '../types/sales';

const getSeededSalesStage = (stage: string): SalesStage =>
  stage === 'INTERVIEWING' ? 'INTERVIEWING' : 'TO DO';

export const initialSalesCandidates: SalesCandidateRecord[] = initialRecruiterCandidates
  .filter((candidate) => candidate.stage !== 'TO DO')
  .map((candidate, index) => ({
    id: `sales-seeded-${index + 1}`,
    recruiterCandidateId: candidate.id,
    stage: getSeededSalesStage(candidate.stage),
    createdAt: candidate.createdAt,
    documents: candidate.documents,
    candidatePhotoName: candidate.candidatePhotoName ?? '',
    candidatePhotoUrl: candidate.candidatePhotoUrl ?? '',
    fullName: candidate.fullName,
    appliedRole: candidate.appliedRole,
    email: candidate.email,
    phone: candidate.phone,
    source: candidate.source,
    location: candidate.location,
    expectedSalary: candidate.expectedSalary,
    dateOfJoin: candidate.dateOfJoin,
    summary: candidate.summary,
  }));
