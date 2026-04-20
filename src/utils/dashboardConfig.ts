import type {
  CandidateStatus,
  InterviewFilters,
  InterviewStatus,
} from '../types/interview';

export interface MenuItem {
  path: string;
  label: string;
  meta: string;
  children?: MenuItem[];
}

/** Menu paths disembunyikan dari sidebar sementara (route tetap ada jika diakses langsung). */
export const sidebarHiddenPaths = new Set<string>(['/pipeline', '/master-report']);

export const menuItems: MenuItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    meta: 'Overview',
  },
  {
    path: '/interviews',
    label: 'Interview Schedule',
    meta: 'Main Table',
  },
  {
    path: '/recruiter/all',
    label: 'Recruiter',
    meta: 'Candidate Form',
    children: [
      {
        path: '/recruiter/all',
        label: 'Semua Data',
        meta: 'All candidates',
      },
      {
        path: '/recruiter/todo',
        label: 'To do',
        meta: 'Belum dikerjakan',
      },
    ],
  },
  {
    path: '/sales/all',
    label: 'Sales',
    meta: 'Candidate Handoff',
    children: [
      {
        path: '/sales/all',
        label: 'Semua Data',
        meta: 'All handoff',
      },
      {
        path: '/sales/todo',
        label: 'To do',
        meta: 'Belum diproses',
      },
    ],
  },
  {
    path: '/pipeline',
    label: 'Candidate Pipeline',
    meta: 'Tracking',
  },
  {
    path: '/master-report',
    label: 'Master Report',
    meta: 'Spreadsheet',
  },
  {
    path: '/settings',
    label: 'Settings',
    meta: 'Preferences',
  },
];

export const defaultFilters: InterviewFilters = {
  search: '',
  candidateStatus: 'ALL',
  owner: 'ALL',
  interviewStatus: 'ALL',
};

export const candidateStatusOptions: CandidateStatus[] = [
  'INTERVIEW',
  'BACKOUT',
  'RESCHEDULE',
];

export const interviewStatusOptions: InterviewStatus[] = ['PROCESS', 'FAILED'];
