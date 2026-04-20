export type RecruiterStage = 'TO DO' | 'READY TO INTERVIEW' | 'INTERVIEWING';

export type RecruiterView = 'all' | 'todo';

export type RecruiterDocumentCategory =
  | 'CV'
  | 'PORTOFOLIO'
  | 'SURAT_LAMARAN'
  | 'LAMPIRAN';

export interface RecruiterDocumentRecord {
  id: string;
  category: RecruiterDocumentCategory;
  name: string;
  sizeLabel: string;
  mimeType: string;
}

export interface RecruiterCandidateFormValues {
  fullName: string;
  appliedRole: string;
  email: string;
  phone: string;
  source: string;
  location: string;
  expectedSalary: string;
  dateOfJoin: string;
  summary: string;
}

export interface RecruiterCandidateRecord extends RecruiterCandidateFormValues {
  id: string;
  candidateId?: string;
  recruiterPipelineId?: string;
  stage: RecruiterStage;
  createdAt: string;
  documents: RecruiterDocumentRecord[];
  salesCandidateId?: string;
  candidatePhotoName?: string;
  candidatePhotoUrl?: string;
}
