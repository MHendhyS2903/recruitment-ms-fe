import type {
  RecruiterCandidateFormValues,
  RecruiterDocumentRecord,
} from './recruiter';

export type SalesStage = 'TO DO' | 'INTERVIEWING';

export type SalesView = 'all' | 'todo';

export interface SalesCandidateRecord extends RecruiterCandidateFormValues {
  id: string;
  candidateId?: string;
  salesPipelineId?: string;
  recruiterCandidateId: string;
  interviewRecordId?: string;
  stage: SalesStage;
  createdAt: string;
  interviewSchedule?: string;
  interviewLink?: string;
  documents: RecruiterDocumentRecord[];
  candidatePhotoName?: string;
  candidatePhotoUrl?: string;
}
