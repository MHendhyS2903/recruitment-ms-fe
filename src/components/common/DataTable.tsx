import type { ReactNode } from 'react';

export interface DataTableColumn {
  className?: string;
  key: string;
  label: ReactNode;
}

interface DataTableProps<RowType> {
  columns: DataTableColumn[];
  countLabel?: ReactNode;
  description: string;
  emptyMessage: ReactNode;
  headerActions?: ReactNode;
  panelClassName?: string;
  panelHeaderClassName?: string;
  rows: RowType[];
  tableClassName?: string;
  title: string;
  renderRow: (row: RowType) => ReactNode;
}

function DataTable<RowType>({
  columns,
  countLabel,
  description,
  emptyMessage,
  headerActions,
  panelClassName,
  panelHeaderClassName,
  rows,
  tableClassName,
  title,
  renderRow,
}: DataTableProps<RowType>) {
  return (
    <section className={`panel ${panelClassName ?? ''}`.trim()}>
      <div className={`panel-header ${panelHeaderClassName ?? ''}`.trim()}>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        {headerActions ?? (countLabel ? <span className="table-count">{countLabel}</span> : null)}
      </div>

      <div className="table-wrapper">
        <table className={tableClassName}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th className={column.className} key={column.key}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => renderRow(row))
            ) : (
              <tr>
                <td className="empty-state" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DataTable;
