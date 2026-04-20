import DataTable, { type DataTableColumn } from '../common/DataTable';
import type { MasterReport, MasterReportId } from '../../types/masterReport';

interface MasterReportTableProps {
  reports: MasterReport[];
  onEdit: (item: MasterReport) => void;
  onDelete: (id: MasterReportId) => void;
}

function MasterReportTable({ reports, onEdit, onDelete }: MasterReportTableProps) {
  const columns: DataTableColumn[] = [
    { key: 'source', label: 'Source' },
    { key: 'ta', label: 'TA' },
    { key: 'experience', label: 'Experience' },
    { key: 'designation', label: 'Designation' },
    { key: 'name', label: 'Name' },
    { key: 'availability', label: 'Availability' },
    { key: 'ctc', label: 'CTC' },
    { key: 'code', label: 'CODE' },
    { key: 'submitDate', label: 'Submit Date' },
    { key: 'monthSubmitDate', label: 'Month Submit Date' },
    { key: 'monthInterviewDate', label: 'Month Interview Date' },
    { key: 'updateTracking', label: 'Update Tracking' },
    { key: 'joinDate', label: 'Join Date' },
    { key: 'monthDoj', label: 'Month DOJ' },
    { key: 'category', label: 'Category' },
    { key: 'actions', label: 'Aksi' },
  ];

  const getTrackingClassName = (value: string): string => {
    const normalized = value.toLowerCase().replace(/\s+/g, '-');
    return `report-chip report-chip-${normalized}`;
  };

  const getCategoryClassName = (value: string): string => {
    const normalized = value.toLowerCase().replace(/\s+/g, '-');
    return `report-chip report-chip-employee report-chip-${normalized}`;
  };

  const getRowClassName = (value: string): string =>
    value.toLowerCase().includes('reject') ? 'report-row-reject' : '';

  return (
    <DataTable
      columns={columns}
      countLabel={`${reports.length} rows`}
      description="Tampilan report kandidat menyerupai spreadsheet dengan kolom detail submission dan progress hiring."
      emptyMessage="Data master report tidak ditemukan. Coba ubah filter yang aktif."
      rows={reports}
      tableClassName="report-table"
      title="Master Report Table"
      renderRow={(item) => (
        <tr key={item.id} className={getRowClassName(item.updateTracking)}>
          <td>{item.source}</td>
          <td>{item.ta}</td>
          <td>{item.experience}</td>
          <td>{item.designation}</td>
          <td>
            <div className="candidate-cell">
              <strong>{item.name}</strong>
              <span>{item.code}</span>
            </div>
          </td>
          <td>{item.availability}</td>
          <td>{item.ctc}</td>
          <td>
            <span className="owner-pill">{item.code}</span>
          </td>
          <td>{item.submitDate}</td>
          <td>{item.monthSubmitDate}</td>
          <td>{item.monthInterviewDate}</td>
          <td>
            <span className={getTrackingClassName(item.updateTracking)}>
              {item.updateTracking}
            </span>
          </td>
          <td>{item.joinDate}</td>
          <td>{item.monthDoj}</td>
          <td>
            <span className={getCategoryClassName(item.category)}>{item.category}</span>
          </td>
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

export default MasterReportTable;
