import * as XLSX from 'xlsx';
import type { Interview } from '../types/interview';
import { formatSchedule } from './interviewHelpers';

const buildRows = (interviews: Interview[]) =>
  interviews.map((item, index) => ({
    No: index + 1,
    'Nama Kandidat': item.candidateName,
    Posisi: item.role,
    Status: item.candidateStatus,
    'Schedule Interview': formatSchedule(item.schedule),
    User: item.owner,
    'Link Interview': item.meetingLink,
    'Host Interview': item.host,
    'Interview Status': item.interviewStatus,
    Notes: item.notes,
  }));

const buildFileName = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `interview-schedule-${year}${month}${day}.xlsx`;
};

export const exportInterviewsToExcel = (interviews: Interview[]): void => {
  if (!interviews.length) {
    window.alert('Tidak ada data interview untuk diexport.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(buildRows(interviews));
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Interview Schedule');
  XLSX.writeFile(workbook, buildFileName());
};
