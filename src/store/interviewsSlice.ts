import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import axiosClient, { apiBaseUrl } from '../api/axiosClient';
import { emptyInterviewForm } from '../data/mockInterviews';
import type {
  ApiInterviewCollection,
  ApiInterviewRaw,
  ApiInterviewResponse,
  FetchInterviewsParams,
  NormalizedInterviewResponse,
  UnknownRecord,
} from '../types/api';
import type {
  CandidateStatus,
  Interview,
  InterviewFilters,
  InterviewFormData,
  InterviewId,
  InterviewImportInput,
  InterviewStatus,
} from '../types/interview';
import type { PaginationMeta } from '../types/pagination';
import { defaultFilters } from '../utils/dashboardConfig';

interface InterviewsState {
  items: Interview[];
  filters: InterviewFilters;
  isModalOpen: boolean;
  editingId: InterviewId | null;
  formData: InterviewFormData;
  loading: boolean;
  error: string;
  pagination: PaginationMeta;
}

interface SaveInterviewPayload {
  editingId: InterviewId | null;
  formData: InterviewFormData;
}

interface SetFilterPayload {
  name: keyof InterviewFilters;
  value: InterviewFilters[keyof InterviewFilters];
}

interface SetFormFieldPayload {
  name: keyof InterviewFormData;
  value: InterviewFormData[keyof InterviewFormData];
}

interface ApiErrorPayload {
  message?: string;
}

const buildFormFromInterview = (item: Interview): InterviewFormData => ({
  candidateName: item.candidateName,
  role: item.role,
  candidateStatus: item.candidateStatus,
  schedule: item.schedule,
  owner: item.owner,
  meetingLink: item.meetingLink,
  host: item.host,
  interviewStatus: item.interviewStatus,
  notes: item.notes,
});

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

const getRecord = (value: unknown): UnknownRecord | null =>
  isRecord(value) ? value : null;

const pickFirstNumber = (...values: unknown[]): number | null => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
};

const pickFirstValue = (
  source: ApiInterviewRaw,
  keys: Array<keyof ApiInterviewRaw>
): unknown => {
  for (const key of keys) {
    const value = source[key];

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
};

const pickString = (
  source: ApiInterviewRaw,
  keys: Array<keyof ApiInterviewRaw>,
  fallback = ''
): string => {
  const value = pickFirstValue(source, keys);

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
};

const normalizeCandidateStatus = (item: ApiInterviewRaw): CandidateStatus => {
  const rawStatus = pickString(item, [
    'candidateStatus',
    'candidate_status',
    'status_code',
    'status',
  ])
    .trim()
    .toLowerCase();

  if (rawStatus === 'rescheduled' || rawStatus === 'reschedule') {
    return 'RESCHEDULE';
  }

  if (rawStatus === 'backout' || rawStatus === 'back_out') {
    return 'BACKOUT';
  }

  return 'INTERVIEW';
};

const normalizeInterviewStatus = (item: ApiInterviewRaw): InterviewStatus => {
  const rawStatus = pickString(item, [
    'interviewStatus',
    'interview_status',
    'status_name',
    'status_code',
    'status',
  ])
    .trim()
    .toLowerCase();

  if (rawStatus === 'failed' || rawStatus === 'fail') {
    return 'FAILED';
  }

  return 'PROCESS';
};

const mapInterviewFromApi = (item: ApiInterviewRaw, index: number): Interview => ({
  id: (() => {
    const candidateId = pickFirstValue(item, ['id', '_id', 'interviewId', 'interview_id']);

    if (typeof candidateId === 'string' || typeof candidateId === 'number') {
      return candidateId;
    }

    return `api-${index}-${pickString(item, ['candidateName', 'candidate_name', 'name'], 'candidate')}`;
  })(),
  candidateName: pickString(item, ['candidateName', 'candidate_name', 'namaKandidat', 'name']),
  role: pickString(item, ['role', 'job_position_title', 'position', 'designation']),
  candidateStatus: normalizeCandidateStatus(item),
  schedule: pickString(item, [
    'schedule',
    'scheduled_at',
    'scheduleInterview',
    'schedule_interview',
    'interviewDate',
    'interview_date',
  ]),
  owner: pickString(item, ['owner', 'pic_user_name', 'user', 'pic']),
  meetingLink: pickString(item, [
    'meetingLink',
    'meeting_link',
    'linkInterview',
    'link_interview',
  ]),
  host: pickString(item, ['host', 'host_user_name', 'hostInterview', 'host_interview']),
  interviewStatus: normalizeInterviewStatus(item),
  notes: pickString(item, ['notes', 'note']),
});

const getCollectionItems = (root: unknown): ApiInterviewRaw[] => {
  if (Array.isArray(root)) {
    return root.filter(isRecord) as ApiInterviewRaw[];
  }

  const rootRecord = getRecord(root);

  if (!rootRecord) {
    return [];
  }

  const collection = rootRecord as ApiInterviewCollection;
  const candidates = [
    collection.items,
    collection.rows,
    collection.interviews,
    Array.isArray(collection.data) ? collection.data : undefined,
    collection.results,
    collection.list,
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) {
      return value.filter(isRecord) as ApiInterviewRaw[];
    }
  }

  return [];
};

const normalizeInterviewResponse = (
  payload: ApiInterviewResponse,
  requestedPage: number,
  requestedLimit: number
): NormalizedInterviewResponse => {
  const payloadRecord = getRecord(payload);
  const root = payloadRecord?.data ?? payload;
  const rootRecord = getRecord(root);
  const dataSource = getCollectionItems(root);

  const metaSource =
    getRecord(rootRecord?.meta) ?? getRecord(rootRecord?.pagination) ?? rootRecord ?? {};

  const total =
    pickFirstNumber(
      metaSource.total,
      metaSource.totalItems,
      metaSource.count,
      metaSource.recordsTotal
    ) ?? dataSource.length;

  const page =
    pickFirstNumber(metaSource.page, metaSource.currentPage) ?? requestedPage;
  const limit =
    pickFirstNumber(metaSource.limit, metaSource.perPage, metaSource.pageSize) ??
    requestedLimit;
  const totalPages =
    pickFirstNumber(metaSource.totalPages, metaSource.lastPage) ??
    Math.max(1, Math.ceil(total / limit));

  return {
    items: dataSource.map(mapInterviewFromApi),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const fetchInterviews = createAsyncThunk<
  NormalizedInterviewResponse,
  FetchInterviewsParams,
  { rejectValue: string }
>('interviews/fetchInterviews', async ({ page, limit }, { rejectWithValue }) => {
  if (!apiBaseUrl) {
    return rejectWithValue(
      'REACT_APP_BASE_URL belum diset. Buat file .env dan isi URL backend API Anda.'
    );
  }

  try {
    const response = await axiosClient.get<ApiInterviewResponse>('/interviews', {
      params: { page, limit },
    });

    return normalizeInterviewResponse(response.data, page, limit);
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorPayload>;

    return rejectWithValue(
      axiosError.response?.data?.message ??
        axiosError.message ??
        'Gagal mengambil data interview dari API.'
    );
  }
});

const initialState: InterviewsState = {
  items: [],
  filters: defaultFilters,
  isModalOpen: false,
  editingId: null,
  formData: emptyInterviewForm,
  loading: false,
  error: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
};

const interviewsSlice = createSlice({
  name: 'interviews',
  initialState,
  reducers: {
    openAddModal(state) {
      state.editingId = null;
      state.formData = emptyInterviewForm;
      state.isModalOpen = true;
    },
    openEditModal(state, action: PayloadAction<Interview>) {
      state.editingId = action.payload.id;
      state.formData = buildFormFromInterview(action.payload);
      state.isModalOpen = true;
    },
    closeModal(state) {
      state.isModalOpen = false;
      state.editingId = null;
      state.formData = emptyInterviewForm;
    },
    setFilter(state, action: PayloadAction<SetFilterPayload>) {
      const { name, value } = action.payload;

      switch (name) {
        case 'search':
          state.filters.search = value as InterviewFilters['search'];
          break;
        case 'candidateStatus':
          state.filters.candidateStatus = value as InterviewFilters['candidateStatus'];
          break;
        case 'owner':
          state.filters.owner = value as InterviewFilters['owner'];
          break;
        case 'interviewStatus':
          state.filters.interviewStatus = value as InterviewFilters['interviewStatus'];
          break;
        default:
          break;
      }
    },
    resetFilters(state) {
      state.filters = defaultFilters;
    },
    setFormField(state, action: PayloadAction<SetFormFieldPayload>) {
      const { name, value } = action.payload;

      switch (name) {
        case 'candidateName':
          state.formData.candidateName = value as InterviewFormData['candidateName'];
          break;
        case 'role':
          state.formData.role = value as InterviewFormData['role'];
          break;
        case 'candidateStatus':
          state.formData.candidateStatus = value as InterviewFormData['candidateStatus'];
          break;
        case 'schedule':
          state.formData.schedule = value as InterviewFormData['schedule'];
          break;
        case 'owner':
          state.formData.owner = value as InterviewFormData['owner'];
          break;
        case 'meetingLink':
          state.formData.meetingLink = value as InterviewFormData['meetingLink'];
          break;
        case 'host':
          state.formData.host = value as InterviewFormData['host'];
          break;
        case 'interviewStatus':
          state.formData.interviewStatus = value as InterviewFormData['interviewStatus'];
          break;
        case 'notes':
          state.formData.notes = value as InterviewFormData['notes'];
          break;
        default:
          break;
      }
    },
    saveInterviewLocally(state, action: PayloadAction<SaveInterviewPayload>) {
      const { editingId, formData } = action.payload;

      if (editingId !== null) {
        state.items = state.items.map((item) =>
          item.id === editingId ? { ...item, ...formData } : item
        );
        return;
      }

      state.items.unshift({
        id: Date.now(),
        ...formData,
      });
      state.pagination.total += 1;
    },
    deleteInterviewLocally(state, action: PayloadAction<InterviewId>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
    importInterviewsLocally(state, action: PayloadAction<InterviewImportInput[]>) {
      const mappedItems: Interview[] = action.payload.map((item, index) => ({
        id: `${Date.now()}-${index}-${Math.random()}`,
        candidateName: item.candidateName,
        role: item.role,
        candidateStatus: item.candidateStatus ?? 'INTERVIEW',
        schedule: item.schedule ?? '',
        owner: item.owner ?? 'IMPORT',
        meetingLink: item.meetingLink ?? '',
        host: item.host ?? '',
        interviewStatus: item.interviewStatus ?? 'PROCESS',
        notes: item.notes ?? '',
      }));

      state.items = [...mappedItems, ...state.items];
      state.pagination.total += mappedItems.length;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.pagination.limit = action.payload;
      state.pagination.page = 1;
    },
    clearError(state) {
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterviews.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Gagal mengambil data interview dari API.';
      });
  },
});

export const {
  clearError,
  closeModal,
  deleteInterviewLocally,
  importInterviewsLocally,
  openAddModal,
  openEditModal,
  resetFilters,
  saveInterviewLocally,
  setFilter,
  setFormField,
  setLimit,
  setPage,
} = interviewsSlice.actions;

export default interviewsSlice.reducer;
