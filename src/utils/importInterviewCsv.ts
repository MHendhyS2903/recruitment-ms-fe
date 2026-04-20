import * as XLSX from 'xlsx';
import type { InterviewImportInput } from '../types/interview';

type CsvRow = Record<string, unknown>;

const KNOWN_ROLE_TOKENS = [
  'QA',
  'FE',
  'BE',
  'WEB',
  'ETL',
  'IOS',
  'ANDRO',
  'ANDROID',
];

const normalizeSchedule = (value: unknown): string => {
  if (!value) {
    return '';
  }

  if (typeof value === 'number') {
    const parsedDate = XLSX.SSF.parse_date_code(value);

    if (!parsedDate) {
      return '';
    }

    const year = String(parsedDate.y);
    const month = String(parsedDate.m).padStart(2, '0');
    const day = String(parsedDate.d).padStart(2, '0');
    const hours = String(parsedDate.H ?? 0).padStart(2, '0');
    const minutes = String(parsedDate.M ?? 0).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const trimmed = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed.replace(' ', 'T');
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}$/.test(trimmed)) {
    const [datePart, timePart] = trimmed.split(/\s+/);
    const [day, month, year] = datePart.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(
      2,
      '0'
    )}T${timePart.padStart(5, '0')}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00`;
  }

  return trimmed;
};

const inferRoleFromOwner = (ownerValue: string): string => {
  const normalized = String(ownerValue || '')
    .trim()
    .toUpperCase();

  if (!normalized) {
    return 'INTERVIEW';
  }

  const tokens = normalized.split(/\s+/);
  const firstToken = tokens[0];
  const lastToken = tokens[tokens.length - 1];

  if (KNOWN_ROLE_TOKENS.includes(firstToken)) {
    return firstToken;
  }

  if (KNOWN_ROLE_TOKENS.includes(lastToken)) {
    return lastToken;
  }

  return firstToken;
};

const mapRowToInterview = (row: CsvRow): InterviewImportInput => {
  const owner = String(row.User ?? '').trim();

  return {
    candidateName: String(row['Nama Kandidat'] ?? '').trim(),
    role: inferRoleFromOwner(owner),
    candidateStatus:
      (String(row.Status ?? 'INTERVIEW').trim() as InterviewImportInput['candidateStatus']) ||
      'INTERVIEW',
    schedule: normalizeSchedule(row['Schedule Interview']),
    owner,
    meetingLink: String(row['Link Interview'] ?? '').trim(),
    host: String(row['Host Interview'] ?? '').trim(),
    interviewStatus:
      (String(
        row['Interview Status'] ?? 'PROCESS'
      ).trim() as InterviewImportInput['interviewStatus']) || 'PROCESS',
    notes: String(row.Notes ?? '').trim(),
  };
};

export const importInterviewCsv = async (file: File): Promise<InterviewImportInput[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('File CSV tidak memiliki sheet yang bisa dibaca.');
  }

  const sheet = workbook.Sheets[firstSheetName];

  if (!sheet) {
    throw new Error('Sheet CSV tidak ditemukan.');
  }

  const rows = XLSX.utils.sheet_to_json<CsvRow>(sheet, { defval: '' });

  return rows
    .map(mapRowToInterview)
    .filter(
      (item) =>
        item.candidateName &&
        item.schedule &&
        item.owner &&
        item.candidateStatus
    );
};
