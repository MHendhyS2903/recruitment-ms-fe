import DataTable, { type DataTableColumn } from '../common/DataTable';
import type { Interview, InterviewId } from '../../types/interview';
import { formatSchedule, getStatusClassName } from '../../utils/interviewHelpers';

interface InterviewTableProps {
  interviews: Interview[];
  onEdit: (item: Interview) => void;
  onDelete: (id: InterviewId) => void;
}

function InterviewTable({ interviews, onEdit, onDelete }: InterviewTableProps) {
  const columns: DataTableColumn[] = [
    { key: 'candidateName', label: 'Nama Kandidat' },
    { key: 'status', label: 'Status' },
    { key: 'schedule', label: 'Schedule Interview' },
    { key: 'user', label: 'User' },
    { key: 'meetingLink', label: 'Link Interview' },
    { key: 'host', label: 'Host Interview' },
    { key: 'interviewStatus', label: 'Interview Status' },
    { key: 'notes', label: 'Notes' },
    { key: 'actions', label: 'Aksi' },
  ];

  return (
    <DataTable
      columns={columns}
      countLabel={`${interviews.length} rows`}
      description="Tampilan tabel menyerupai spreadsheet dengan aksi tambah, edit, hapus, dan filter."
      emptyMessage="Data tidak ditemukan. Coba ubah filter atau tambahkan kandidat baru."
      rows={interviews}
      title="Jadwal Interview"
      renderRow={(item) => (
        <tr key={item.id}>
          <td>
            <div className="candidate-cell">
              <strong>{item.candidateName}</strong>
              <span>{item.role}</span>
            </div>
          </td>
          <td>
            <span className={getStatusClassName('candidateStatus', item.candidateStatus)}>
              {item.candidateStatus}
            </span>
          </td>
          <td>{formatSchedule(item.schedule)}</td>
          <td>
            <span className="owner-pill">{item.owner}</span>
          </td>
          <td>
            {item.meetingLink ? (
              <a href={item.meetingLink} target="_blank" rel="noreferrer">
                Open Link
              </a>
            ) : (
              <span className="muted-text">Belum diisi</span>
            )}
          </td>
          <td>{item.host || <span className="muted-text">Belum diisi</span>}</td>
          <td>
            <span className={getStatusClassName('interviewStatus', item.interviewStatus)}>
              {item.interviewStatus}
            </span>
          </td>
          <td>{item.notes || <span className="muted-text">-</span>}</td>
          <td>
            <div className="action-group">
              <button
                className="table-button edit-button"
                type="button"
                onClick={() => onEdit(item)}
              >
                Edit
              </button>
              <button
                className="table-button delete-button"
                type="button"
                onClick={() => onDelete(item.id)}
              >
                Hapus
              </button>
            </div>
          </td>
        </tr>
      )}
    />
  );
}

export default InterviewTable;
