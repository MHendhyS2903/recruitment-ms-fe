import type {
  MasterReportCategory,
  MasterReportCode,
  MasterReportFormChangeEvent,
  MasterReportFormData,
  MasterReportId,
  MasterReportSource,
  MasterReportSubmitEvent,
  MasterReportTracking,
} from '../../types/masterReport';

interface MasterReportModalProps {
  editingId: MasterReportId | null;
  formData: MasterReportFormData;
  isOpen: boolean;
  sourceOptions: MasterReportSource[];
  codeOptions: MasterReportCode[];
  trackingOptions: MasterReportTracking[];
  categoryOptions: MasterReportCategory[];
  onChange: (event: MasterReportFormChangeEvent) => void;
  onClose: () => void;
  onSubmit: (event: MasterReportSubmitEvent) => void;
}

function MasterReportModal({
  editingId,
  formData,
  isOpen,
  sourceOptions,
  codeOptions,
  trackingOptions,
  categoryOptions,
  onChange,
  onClose,
  onSubmit,
}: MasterReportModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={editingId ? 'Edit master report' : 'Tambah master report'}
      >
        <div className="panel-header modal-header">
          <div>
            <h2>{editingId ? 'Edit Master Report' : 'Tambah Master Report'}</h2>
            <p>Isi form berikut untuk menyimpan data master report kandidat.</p>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Tutup
          </button>
        </div>

        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Source
            <select name="source" value={formData.source} onChange={onChange}>
              {sourceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            TA
            <input
              name="ta"
              type="text"
              value={formData.ta}
              onChange={onChange}
              placeholder="Contoh: AGUS"
            />
          </label>

          <label>
            Experience
            <input
              name="experience"
              type="text"
              value={formData.experience}
              onChange={onChange}
              placeholder="Contoh: 4 years 6 months"
            />
          </label>

          <label>
            Designation
            <input
              name="designation"
              type="text"
              value={formData.designation}
              onChange={onChange}
              placeholder="Contoh: Android Developer"
            />
          </label>

          <label>
            Name
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={onChange}
              placeholder="Contoh: Gingita Syagila"
            />
          </label>

          <label>
            Availability
            <input
              name="availability"
              type="text"
              value={formData.availability}
              onChange={onChange}
              placeholder="Contoh: ASAP"
            />
          </label>

          <label>
            CTC
            <input
              name="ctc"
              type="text"
              value={formData.ctc}
              onChange={onChange}
              placeholder="Contoh: 15,680,000"
            />
          </label>

          <label>
            CODE
            <select name="code" value={formData.code} onChange={onChange}>
              <option value="">Pilih code</option>
              {codeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Submit Date
            <input
              name="submitDate"
              type="text"
              value={formData.submitDate}
              onChange={onChange}
              placeholder="Contoh: 06-Nov-25"
            />
          </label>

          <label>
            Month Submit Date
            <input
              name="monthSubmitDate"
              type="text"
              value={formData.monthSubmitDate}
              onChange={onChange}
              placeholder="Contoh: 2025 - 11"
            />
          </label>

          <label>
            Month Interview Date
            <input
              name="monthInterviewDate"
              type="text"
              value={formData.monthInterviewDate}
              onChange={onChange}
              placeholder="Contoh: 2025 - 11"
            />
          </label>

          <label>
            Update Tracking
            <select
              name="updateTracking"
              value={formData.updateTracking}
              onChange={onChange}
            >
              {trackingOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Join Date
            <input
              name="joinDate"
              type="text"
              value={formData.joinDate}
              onChange={onChange}
              placeholder="Contoh: 24-Nov-25"
            />
          </label>

          <label>
            Month DOJ
            <input
              name="monthDoj"
              type="text"
              value={formData.monthDoj}
              onChange={onChange}
              placeholder="Contoh: 2025 - 11"
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={formData.category}
              onChange={onChange}
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="form-actions full-width">
            <button className="ghost-button" type="button" onClick={onClose}>
              Batal
            </button>
            <button className="primary-button" type="submit">
              {editingId ? 'Simpan Perubahan' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MasterReportModal;
