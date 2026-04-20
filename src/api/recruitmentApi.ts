import axiosClient, { apiBaseUrl } from './axiosClient';
import type { UnknownRecord } from '../types/api';
import type {
  RecruiterCandidateFormValues,
  RecruiterCandidateRecord,
  RecruiterDocumentCategory,
  RecruiterDocumentRecord,
} from '../types/recruiter';
import type { PaginatedResult } from '../types/pagination';
import type { SalesCandidateRecord, SalesView } from '../types/sales';
import type { RecruiterView } from '../types/recruiter';
import { normalizeRecruiterStage } from '../utils/recruiterStorage';
import { normalizeSalesStage } from '../utils/salesStorage';

const LIST_FETCH_LIMIT = 1000;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_ASSET_ORIGIN = (() => {
  if (!apiBaseUrl) {
    return '';
  }

  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return '';
  }
})();

export interface CandidateUploads {
  photo: File | null;
  cv: File | null;
  portfolio: File | null;
  coverLetter: File | null;
  attachments: File[];
}

interface CandidateMutationPayload {
  candidate: RecruiterCandidateFormValues;
  existingDocuments?: RecruiterDocumentRecord[];
  uploads: CandidateUploads;
}

interface ProcessSalesCandidatePayload {
  candidateId: string;
  meetingLink: string;
  notes: string;
  ownerUserId?: string | number;
  scheduledAt: string;
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

const getRecord = (value: unknown): UnknownRecord | null => (isRecord(value) ? value : null);

const getNestedRecord = (value: unknown, keys: string[]): UnknownRecord | null => {
  const root = getRecord(value);

  if (!root) {
    return null;
  }

  for (const key of keys) {
    const nestedValue = root[key];

    if (isRecord(nestedValue)) {
      return nestedValue;
    }
  }

  return null;
};

const pickFirstValue = (source: UnknownRecord, keys: string[]): unknown => {
  for (const key of keys) {
    const value = source[key];

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
};

const pickString = (source: UnknownRecord, keys: string[], fallback = ''): string => {
  const value = pickFirstValue(source, keys);

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
};

const pickNumber = (source: UnknownRecord, keys: string[]): number | null => {
  const value = pickFirstValue(source, keys);

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return null;
};

const ensureIdString = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return fallback;
};

const resolveAssetUrl = (value: string) => {
  if (!value) {
    return '';
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  if (value.startsWith('/') && DEFAULT_ASSET_ORIGIN) {
    return `${DEFAULT_ASSET_ORIGIN}${value}`;
  }

  return value;
};

const normalizeDocumentCategory = (value: unknown): RecruiterDocumentCategory => {
  const normalizedValue =
    typeof value === 'string' ? value.trim().toUpperCase().replace(/\s+/g, '_') : '';

  switch (normalizedValue) {
    case 'CV':
      return 'CV';
    case 'PORTOFOLIO':
    case 'PORTFOLIO':
      return 'PORTOFOLIO';
    case 'SURAT_LAMARAN':
    case 'COVER_LETTER':
      return 'SURAT_LAMARAN';
    case 'LAMPIRAN':
    case 'ATTACHMENT':
    case 'ATTACHMENTS':
      return 'LAMPIRAN';
    default:
      return 'LAMPIRAN';
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const normalizeDateInputValue = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const parsedDate = new Date(trimmedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString().slice(0, 10);
};

const normalizeDateTimeLocalValue = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const parsedDate = new Date(trimmedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  const timezoneOffset = parsedDate.getTimezoneOffset() * 60000;
  return new Date(parsedDate.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const mapDocumentFromApi = (value: unknown, index: number): RecruiterDocumentRecord | null => {
  const documentRecord = getRecord(value);

  if (!documentRecord) {
    return null;
  }

  const sizeBytes = pickNumber(documentRecord, ['sizeBytes', 'size_bytes', 'size']);
  const originalName = pickString(documentRecord, [
    'originalName',
    'original_name',
    'name',
    'fileName',
    'file_name',
  ]);

  return {
    id: ensureIdString(
      pickFirstValue(documentRecord, ['id', 'documentId', 'document_id']),
      `document-${index}`
    ),
    category: normalizeDocumentCategory(
      pickFirstValue(documentRecord, ['category', 'categoryCode', 'category_code'])
    ),
    name: originalName || `Dokumen ${index + 1}`,
    sizeLabel: sizeBytes ? formatFileSize(sizeBytes) : '',
    mimeType: pickString(documentRecord, ['mimeType', 'mime_type'], 'application/octet-stream'),
  };
};

const mapDocumentsFromApi = (value: unknown): RecruiterDocumentRecord[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((document, index) => mapDocumentFromApi(document, index))
    .filter((document): document is RecruiterDocumentRecord => Boolean(document));
};

const buildCandidatePayload = (candidate: RecruiterCandidateFormValues) => {
  const expectedSalaryAmount = Number(
    candidate.expectedSalary.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')
  );

  return {
    fullName: candidate.fullName.trim(),
    appliedRole: candidate.appliedRole.trim(),
    email: candidate.email.trim(),
    phone: candidate.phone.trim(),
    source: candidate.source.trim(),
    location: candidate.location.trim(),
    expectedSalary:
      candidate.expectedSalary.trim() && Number.isFinite(expectedSalaryAmount)
        ? expectedSalaryAmount
        : candidate.expectedSalary.trim(),
    dateOfJoin: normalizeDateInputValue(candidate.dateOfJoin) || null,
    summary: candidate.summary.trim(),
  };
};

const getResponseRoot = (payload: unknown): unknown => {
  const payloadRecord = getRecord(payload);
  return payloadRecord?.data ?? payload;
};

const getCollectionItems = (payload: unknown): UnknownRecord[] => {
  const root = getResponseRoot(payload);

  if (Array.isArray(root)) {
    return root.filter(isRecord);
  }

  const rootRecord = getRecord(root);

  if (!rootRecord) {
    return [];
  }

  const candidates = [
    rootRecord.items,
    rootRecord.rows,
    rootRecord.results,
    rootRecord.list,
    Array.isArray(rootRecord.data) ? rootRecord.data : undefined,
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) {
      return value.filter(isRecord);
    }
  }

  return [];
};

const getPaginationMeta = (payload: unknown) => {
  const root = getResponseRoot(payload);
  const rootRecord = getRecord(root);
  const metaSource =
    getNestedRecord(rootRecord, ['meta', 'pagination']) ?? rootRecord ?? ({} as UnknownRecord);
  const total =
    pickNumber(metaSource, ['total', 'totalItems', 'count', 'recordsTotal']) ??
    getCollectionItems(payload).length;
  const limit = pickNumber(metaSource, ['limit', 'perPage', 'pageSize']) ?? DEFAULT_LIMIT;
  const page = pickNumber(metaSource, ['page', 'currentPage']) ?? DEFAULT_PAGE;
  const totalPages =
    pickNumber(metaSource, ['totalPages', 'lastPage']) ??
    Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
  };
};

const getMutationEntity = (payload: unknown): UnknownRecord | null => {
  const root = getResponseRoot(payload);
  const rootRecord = getRecord(root);

  if (!rootRecord) {
    return null;
  }

  if (isRecord(rootRecord.candidate)) {
    return rootRecord.candidate as UnknownRecord;
  }

  if (isRecord(rootRecord.recruiterPipeline)) {
    return rootRecord.recruiterPipeline as UnknownRecord;
  }

  if (isRecord(rootRecord.salesPipeline)) {
    return rootRecord.salesPipeline as UnknownRecord;
  }

  return rootRecord;
};

const extractCandidateIdFromMutation = (payload: unknown): string | null => {
  const entity = getMutationEntity(payload);

  if (!entity) {
    return null;
  }

  const candidate = getNestedRecord(entity, ['candidate']);
  const idValue =
    pickFirstValue(candidate ?? entity, ['id', 'candidateId', 'candidate_id']) ??
    pickFirstValue(entity, ['candidateId', 'candidate_id']);

  if (typeof idValue === 'string' || typeof idValue === 'number') {
    return String(idValue);
  }

  return null;
};

const mapRecruiterCandidateFromApi = (
  item: UnknownRecord,
  index: number
): RecruiterCandidateRecord => {
  const candidateRecord = getNestedRecord(item, ['candidate', 'candidateProfile']) ?? item;
  const candidateId = ensureIdString(
    pickFirstValue(candidateRecord, ['id', 'candidateId', 'candidate_id']),
    `recruiter-candidate-${index}`
  );
  const stage = normalizeRecruiterStage(
    pickString(item, ['stage', 'stageCode', 'stage_code'], 'TO DO').replace(/_/g, ' ')
  );
  const documents = mapDocumentsFromApi(item.documents ?? candidateRecord.documents);
  const expectedSalary = pickFirstValue(candidateRecord, [
    'expectedSalary',
    'expected_salary',
    'expectedSalaryAmount',
    'expected_salary_amount',
  ]);

  return {
    id: candidateId,
    candidateId,
    recruiterPipelineId: pickString(item, ['recruiterPipelineId', 'recruiter_pipeline_id']),
    stage,
    createdAt:
      pickString(item, ['createdAt', 'created_at']) ||
      pickString(candidateRecord, ['createdAt', 'created_at']) ||
      new Date().toISOString(),
    documents,
    salesCandidateId: pickString(item, ['salesPipelineId', 'sales_pipeline_id']),
    candidatePhotoName: pickString(candidateRecord, [
      'photoOriginalName',
      'photo_original_name',
      'candidatePhotoName',
      'candidate_photo_name',
    ]),
    candidatePhotoUrl: resolveAssetUrl(
      pickString(candidateRecord, [
        'photoUrl',
        'photo_url',
        'photoStoragePath',
        'photo_storage_path',
        'candidatePhotoUrl',
        'candidate_photo_url',
      ])
    ),
    fullName: pickString(candidateRecord, ['fullName', 'full_name', 'name']),
    appliedRole: pickString(candidateRecord, ['appliedRole', 'applied_role', 'role', 'designation']),
    email: pickString(candidateRecord, ['email']),
    phone: pickString(candidateRecord, ['phone', 'phoneNumber', 'phone_number']),
    source: pickString(candidateRecord, ['source', 'sourceChannel', 'source_channel']),
    location: pickString(candidateRecord, ['location', 'currentLocation', 'current_location']),
    expectedSalary:
      typeof expectedSalary === 'number'
        ? expectedSalary.toLocaleString('id-ID')
        : typeof expectedSalary === 'string'
          ? expectedSalary
          : '',
    dateOfJoin: normalizeDateInputValue(
      pickString(candidateRecord, ['dateOfJoin', 'date_of_join'])
    ),
    summary: pickString(candidateRecord, ['summary', 'profileSummary', 'profile_summary', 'notes']),
  };
};

const mapSalesCandidateFromApi = (item: UnknownRecord, index: number): SalesCandidateRecord => {
  const candidateRecord = getNestedRecord(item, ['candidate', 'candidateProfile']) ?? item;
  const candidateId = ensureIdString(
    pickFirstValue(candidateRecord, ['id', 'candidateId', 'candidate_id']),
    `sales-candidate-${index}`
  );
  const stage = normalizeSalesStage(
    pickString(item, ['stage', 'stageCode', 'stage_code'], 'TO DO').replace(/_/g, ' ')
  );
  const documents = mapDocumentsFromApi(item.documents ?? candidateRecord.documents);
  const expectedSalary = pickFirstValue(candidateRecord, [
    'expectedSalary',
    'expected_salary',
    'expectedSalaryAmount',
    'expected_salary_amount',
  ]);

  return {
    id: candidateId,
    candidateId,
    salesPipelineId: pickString(item, ['salesPipelineId', 'sales_pipeline_id', 'id']),
    recruiterCandidateId:
      pickString(item, ['recruiterCandidateId', 'recruiter_candidate_id']) || candidateId,
    interviewRecordId: pickString(item, ['interviewRecordId', 'interview_record_id']),
    stage,
    createdAt:
      pickString(item, ['createdAt', 'created_at']) ||
      pickString(candidateRecord, ['createdAt', 'created_at']) ||
      new Date().toISOString(),
    interviewSchedule: normalizeDateTimeLocalValue(
      pickString(item, [
        'interviewSchedule',
        'interview_schedule',
        'interviewScheduleAt',
        'interview_schedule_at',
        'scheduledAt',
        'scheduled_at',
      ])
    ),
    interviewLink: pickString(item, ['interviewLink', 'interview_link', 'meetingLink', 'meeting_link']),
    documents,
    candidatePhotoName: pickString(candidateRecord, [
      'photoOriginalName',
      'photo_original_name',
      'candidatePhotoName',
      'candidate_photo_name',
    ]),
    candidatePhotoUrl: resolveAssetUrl(
      pickString(candidateRecord, [
        'photoUrl',
        'photo_url',
        'photoStoragePath',
        'photo_storage_path',
        'candidatePhotoUrl',
        'candidate_photo_url',
      ])
    ),
    fullName: pickString(candidateRecord, ['fullName', 'full_name', 'name']),
    appliedRole: pickString(candidateRecord, ['appliedRole', 'applied_role', 'role', 'designation']),
    email: pickString(candidateRecord, ['email']),
    phone: pickString(candidateRecord, ['phone', 'phoneNumber', 'phone_number']),
    source: pickString(candidateRecord, ['source', 'sourceChannel', 'source_channel']),
    location: pickString(candidateRecord, ['location', 'currentLocation', 'current_location']),
    expectedSalary:
      typeof expectedSalary === 'number'
        ? expectedSalary.toLocaleString('id-ID')
        : typeof expectedSalary === 'string'
          ? expectedSalary
          : '',
    dateOfJoin: normalizeDateInputValue(
      pickString(candidateRecord, ['dateOfJoin', 'date_of_join'])
    ),
    summary: pickString(candidateRecord, ['summary', 'profileSummary', 'profile_summary', 'notes']),
  };
};

const uploadPhoto = async (candidateId: string, photo: File | null) => {
  if (!photo) {
    return;
  }

  const formData = new FormData();
  formData.append('file', photo);

  await axiosClient.post(`/candidates/${candidateId}/photo`, formData);
};

const deleteDocument = async (candidateId: string, documentId: string) => {
  await axiosClient.delete(`/candidates/${candidateId}/documents/${documentId}`);
};

const uploadDocument = async (
  candidateId: string,
  category: RecruiterDocumentCategory,
  file: File
) => {
  const formData = new FormData();
  formData.append('category', category);
  formData.append('file', file);

  await axiosClient.post(`/candidates/${candidateId}/documents`, formData);
};

const replaceDocumentCategory = async (
  candidateId: string,
  existingDocuments: RecruiterDocumentRecord[],
  category: RecruiterDocumentCategory,
  files: File[]
) => {
  if (files.length === 0) {
    return;
  }

  const documentsToRemove = existingDocuments.filter((document) => document.category === category);
  await Promise.all(documentsToRemove.map((document) => deleteDocument(candidateId, document.id)));

  for (const file of files) {
    await uploadDocument(candidateId, category, file);
  }
};

const syncCandidateUploads = async ({
  candidateId,
  existingDocuments = [],
  uploads,
}: {
  candidateId: string;
  existingDocuments?: RecruiterDocumentRecord[];
  uploads: CandidateUploads;
}) => {
  await uploadPhoto(candidateId, uploads.photo);
  await replaceDocumentCategory(
    candidateId,
    existingDocuments,
    'CV',
    uploads.cv ? [uploads.cv] : []
  );
  await replaceDocumentCategory(
    candidateId,
    existingDocuments,
    'PORTOFOLIO',
    uploads.portfolio ? [uploads.portfolio] : []
  );
  await replaceDocumentCategory(
    candidateId,
    existingDocuments,
    'SURAT_LAMARAN',
    uploads.coverLetter ? [uploads.coverLetter] : []
  );
  await replaceDocumentCategory(candidateId, existingDocuments, 'LAMPIRAN', uploads.attachments);
};

const ensureCandidateId = (payload: unknown, fallbackMessage: string) => {
  const candidateId = extractCandidateIdFromMutation(payload);

  if (!candidateId) {
    throw new Error(fallbackMessage);
  }

  return candidateId;
};

export const fetchRecruiterCandidates = async (
  view: RecruiterView
): Promise<PaginatedResult<RecruiterCandidateRecord>> => {
  const response = await axiosClient.get('/recruiter/candidates', {
    params: { view, page: 1, limit: LIST_FETCH_LIMIT },
  });

  return {
    items: getCollectionItems(response.data).map(mapRecruiterCandidateFromApi),
    pagination: getPaginationMeta(response.data),
  };
};

export const createRecruiterCandidate = async ({
  candidate,
  uploads,
}: CandidateMutationPayload): Promise<string> => {
  const response = await axiosClient.post('/candidates', buildCandidatePayload(candidate));
  const candidateId = ensureCandidateId(
    response.data,
    'Response create candidate tidak mengandung candidate id.'
  );
  await syncCandidateUploads({ candidateId, uploads });
  return candidateId;
};

export const updateRecruiterCandidate = async ({
  candidateId,
  candidate,
  existingDocuments,
  uploads,
}: CandidateMutationPayload & { candidateId: string }): Promise<void> => {
  await axiosClient.patch(`/candidates/${candidateId}`, buildCandidatePayload(candidate));
  await syncCandidateUploads({ candidateId, existingDocuments, uploads });
};

export const deleteRecruiterCandidate = async (candidateId: string): Promise<void> => {
  await axiosClient.delete(`/recruiter/candidates/${candidateId}`);
};

export const processRecruiterCandidate = async (candidateId: string): Promise<void> => {
  await axiosClient.post(`/recruiter/candidates/${candidateId}/process`, {
    remarks: 'Diproses dari halaman recruiter.',
  });
};

export const fetchSalesCandidates = async (
  view: SalesView
): Promise<PaginatedResult<SalesCandidateRecord>> => {
  const response = await axiosClient.get('/sales/candidates', {
    params: { view, page: 1, limit: LIST_FETCH_LIMIT },
  });

  return {
    items: getCollectionItems(response.data).map(mapSalesCandidateFromApi),
    pagination: getPaginationMeta(response.data),
  };
};

export const updateSalesCandidate = async ({
  candidateId,
  candidate,
  existingDocuments,
  uploads,
}: CandidateMutationPayload & { candidateId: string }): Promise<void> => {
  await axiosClient.patch(`/candidates/${candidateId}`, buildCandidatePayload(candidate));
  await syncCandidateUploads({ candidateId, existingDocuments, uploads });
};

export const deleteSalesCandidate = async (candidateId: string): Promise<void> => {
  await axiosClient.delete(`/sales/candidates/${candidateId}`);
};

export const processSalesCandidate = async ({
  candidateId,
  meetingLink,
  notes,
  ownerUserId,
  scheduledAt,
}: ProcessSalesCandidatePayload): Promise<void> => {
  await axiosClient.post(`/sales/candidates/${candidateId}/process`, {
    scheduledAt,
    meetingLink,
    notes,
    ownerUserId,
    hostUserId: ownerUserId,
  });
};
