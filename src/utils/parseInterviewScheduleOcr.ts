import type { ParsedOcrInterviewEntry, ParsedOcrResult } from '../types/interview';

interface DateParts {
  day: number;
  month: number;
  year: number;
}

interface ParsedLineEntry {
  currentUserLabel: string;
  entry: ParsedOcrInterviewEntry;
}

const MONTH_MAP: Record<string, number> = {
  januari: 1,
  februari: 2,
  maret: 3,
  april: 4,
  mei: 5,
  juni: 6,
  juli: 7,
  agustus: 8,
  september: 9,
  oktober: 10,
  november: 11,
  desember: 12,
};

const ROLE_TOKENS = ['QA', 'FE', 'BE', 'WEB', 'ETL', 'IOS', 'ANDRO', 'ANDROID'];
const MONTH_NAMES = Object.keys(MONTH_MAP);

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const sanitizeLine = (line: string): string =>
  line
    .replace(/[•*]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[|]/g, 'I')
    .trim();

const parseDateParts = (text: string): DateParts | null => {
  const normalized = text.toLowerCase().replace(/,/g, ' ');
  const match = normalized.match(
    /(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+(\d{2,4})/
  );

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = MONTH_MAP[match[2]];
  const rawYear = Number(match[3]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;

  return { day, month, year };
};

const parseDateFromText = (text: string): DateParts | null => parseDateParts(text);

const parseManualDate = (manualDate: string): DateParts | null => {
  if (!manualDate) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(manualDate)) {
    const [year, month, day] = manualDate.split('-').map(Number);
    return { day, month, year };
  }

  return parseDateParts(manualDate);
};

const formatDateTimeLocal = (dateParts: DateParts | null, timeValue: string): string => {
  if (!dateParts || !timeValue) {
    return '';
  }

  const [hours, minutes] = timeValue.split(':');
  const year = String(dateParts.year);
  const month = String(dateParts.month).padStart(2, '0');
  const day = String(dateParts.day).padStart(2, '0');

  return `${year}-${month}-${day}T${hours.padStart(2, '0')}:${minutes.padStart(
    2,
    '0'
  )}`;
};

const extractTime = (line: string): string | null => {
  const match = line.match(/(\d{1,2})[.:](\d{2})\s*$/);

  if (!match) {
    return null;
  }

  return `${match[1].padStart(2, '0')}:${match[2]}`;
};

const deriveRoleAndOwner = (userLabel: string): { role: string; owner: string } => {
  const tokens = userLabel
    .toUpperCase()
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean);

  const firstToken = tokens[0];
  const lastToken = tokens[tokens.length - 1];

  if (ROLE_TOKENS.includes(firstToken)) {
    return {
      role: firstToken,
      owner: tokens.slice(1).join(' ') || firstToken,
    };
  }

  if (ROLE_TOKENS.includes(lastToken)) {
    return {
      role: lastToken,
      owner: tokens.slice(0, -1).join(' ') || lastToken,
    };
  }

  return {
    role: firstToken || 'INTERVIEW',
    owner: tokens.slice(1).join(' ') || userLabel.toUpperCase(),
  };
};

const parseLineToEntry = (
  line: string,
  currentUserLabel: string,
  dateParts: DateParts | null
): ParsedLineEntry | null => {
  const time = extractTime(line);

  if (!time || !line.includes('=')) {
    return null;
  }

  const leftPart = line.split('=').shift()?.trim() || '';
  let activeUserLabel = currentUserLabel;
  let candidateName = '';

  if (leftPart.startsWith('-')) {
    candidateName = leftPart.replace(/^-+/, '').trim();
  } else if (leftPart.includes('-')) {
    const [userLabel, ...nameParts] = leftPart.split('-');
    activeUserLabel = userLabel.trim();
    candidateName = nameParts.join('-').trim();
  } else {
    return null;
  }

  if (!activeUserLabel || !candidateName) {
    return null;
  }

  const { role, owner } = deriveRoleAndOwner(activeUserLabel);

  return {
    currentUserLabel: activeUserLabel,
    entry: {
      id: `ocr-${activeUserLabel}-${candidateName}-${time}`,
      candidateName: toTitleCase(candidateName),
      role,
      candidateStatus: 'INTERVIEW',
      schedule: formatDateTimeLocal(dateParts, time),
      owner,
      meetingLink: '',
      host: '',
      interviewStatus: 'PROCESS',
      notes: `Imported via OCR from ${activeUserLabel}`,
      sourceLabel: activeUserLabel,
      time,
    },
  };
};

const formatDetectedDate = (dateParts: DateParts | null): string => {
  if (!dateParts) {
    return 'Tanggal tidak terdeteksi';
  }

  return `${String(dateParts.day).padStart(2, '0')}-${String(
    dateParts.month
  ).padStart(2, '0')}-${dateParts.year}`;
};

export const parseInterviewScheduleOcr = (
  text: string,
  manualDate = ''
): ParsedOcrResult => {
  const cleanedText = text.replace(/\r/g, '\n');
  const dateParts = parseManualDate(manualDate) || parseDateFromText(cleanedText);
  const lines = cleanedText.split('\n').map(sanitizeLine).filter(Boolean);

  let currentUserLabel = '';
  const entries: ParsedOcrInterviewEntry[] = [];

  lines.forEach((line) => {
    const parsed = parseLineToEntry(line, currentUserLabel, dateParts);

    if (!parsed) {
      return;
    }

    currentUserLabel = parsed.currentUserLabel;
    entries.push(parsed.entry);
  });

  return {
    detectedDate: formatDetectedDate(dateParts),
    entries,
    supportedMonths: MONTH_NAMES,
  };
};
