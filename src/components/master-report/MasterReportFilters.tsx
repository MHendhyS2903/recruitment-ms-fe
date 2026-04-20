import type { ChangeEvent } from 'react';
import type { MasterReportFilters as MasterReportFiltersType } from '../../types/masterReport';

interface MasterReportFiltersProps {
  filters: MasterReportFiltersType;
  sourceOptions: string[];
  designationOptions: string[];
  categoryOptions: string[];
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onReset: () => void;
}

function MasterReportFilters({
  filters,
  sourceOptions,
  designationOptions,
  categoryOptions,
  onChange,
  onReset,
}: MasterReportFiltersProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Filter Master Report</h2>
          <p>Cari kandidat dan saring berdasarkan source, posisi, dan status.</p>
        </div>
        <button className="ghost-button" type="button" onClick={onReset}>
          Reset Filter
        </button>
      </div>

      <div className="filter-grid">
        <label>
          Cari Kandidat
          <input
            name="search"
            type="text"
            placeholder="Nama kandidat, designation, TA, CODE"
            value={filters.search}
            onChange={onChange}
          />
        </label>

        <label>
          Source
          <select name="source" value={filters.source} onChange={onChange}>
            {sourceOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'Semua' : option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Designation
          <select
            name="designation"
            value={filters.designation}
            onChange={onChange}
          >
            {designationOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'Semua' : option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select name="category" value={filters.category} onChange={onChange}>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'Semua' : option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

export default MasterReportFilters;
