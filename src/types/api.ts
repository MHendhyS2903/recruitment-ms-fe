import type { Interview } from './interview';
import type { PaginatedResult } from './pagination';

export type UnknownRecord = Record<string, unknown>;

export interface FetchInterviewsParams {
  page: number;
  limit: number;
}

export interface ApiInterviewRaw extends UnknownRecord {
  id?: string | number;
  _id?: string | number;
  interviewId?: string | number;
  interview_id?: string | number;
  candidateName?: string;
  candidate_name?: string;
  namaKandidat?: string;
  name?: string;
  role?: string;
  job_position_title?: string;
  position?: string;
  designation?: string;
  candidateStatus?: string;
  candidate_status?: string;
  status_code?: string;
  status?: string;
  schedule?: string;
  scheduled_at?: string;
  scheduleInterview?: string;
  schedule_interview?: string;
  interviewDate?: string;
  interview_date?: string;
  owner?: string;
  pic_user_name?: string;
  user?: string;
  pic?: string;
  meetingLink?: string;
  meeting_link?: string;
  linkInterview?: string;
  link_interview?: string;
  host?: string;
  host_user_name?: string;
  hostInterview?: string;
  host_interview?: string;
  interviewStatus?: string;
  interview_status?: string;
  status_name?: string;
  notes?: string;
  note?: string;
}

export interface ApiInterviewCollection extends UnknownRecord {
  data?: unknown;
  items?: ApiInterviewRaw[];
  rows?: ApiInterviewRaw[];
  interviews?: ApiInterviewRaw[];
  results?: ApiInterviewRaw[];
  list?: ApiInterviewRaw[];
  meta?: UnknownRecord;
  pagination?: UnknownRecord;
}

export type ApiInterviewResponse =
  | ApiInterviewRaw[]
  | ApiInterviewCollection
  | UnknownRecord;

export type NormalizedInterviewResponse = PaginatedResult<Interview>;
