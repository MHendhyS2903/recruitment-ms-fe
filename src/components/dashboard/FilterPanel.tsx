import {
  candidateStatusOptions,
  interviewStatusOptions,
} from '../../utils/dashboardConfig';
import type { InterviewFilters } from '../../types/interview';
import type { ChangeEvent } from 'react';

interface FilterPanelProps {
  filters: InterviewFilters;
  ownerOptions: string[];
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onReset: () => void;
}

function FilterPanel({ filters, ownerOptions, onChange, onReset }: FilterPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Filter Data</h2>
          <p>Saring data kandidat berdasarkan status, owner, dan kata kunci.</p>
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
            placeholder="Nama kandidat, role, host, notes"
            value={filters.search}
            onChange={onChange}
          />
        </label>

        <label>
          Status Kandidat
          <select
            name="candidateStatus"
            value={filters.candidateStatus}
            onChange={onChange}
          >
            <option value="ALL">Semua</option>
            {candidateStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label>
          PIC / User
          <select name="owner" value={filters.owner} onChange={onChange}>
            {ownerOptions.map((owner) => (
              <option key={owner} value={owner}>
                {owner === 'ALL' ? 'Semua' : owner}
              </option>
            ))}
          </select>
        </label>

        <label>
          Interview Status
          <select
            name="interviewStatus"
            value={filters.interviewStatus}
            onChange={onChange}
          >
            <option value="ALL">Semua</option>
            {interviewStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

export default FilterPanel;
