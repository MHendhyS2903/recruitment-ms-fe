import {
  candidateStatusOptions,
  interviewStatusOptions,
} from '../../utils/dashboardConfig';
import type {
  InterviewFormChangeEvent,
  InterviewFormData,
  InterviewId,
  InterviewSubmitEvent,
} from '../../types/interview';

interface InterviewModalProps {
  editingId: InterviewId | null;
  formData: InterviewFormData;
  isOpen: boolean;
  onChange: (event: InterviewFormChangeEvent) => void;
  onClose: () => void;
  onSubmit: (event: InterviewSubmitEvent) => void;
}

function InterviewModal({
  editingId,
  formData,
  isOpen,
  onChange,
  onClose,
  onSubmit,
}: InterviewModalProps) {
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
        aria-label={editingId ? 'Edit interview' : 'Tambah interview'}
      >
        <div className="panel-header modal-header">
          <div>
            <h2>{editingId ? 'Edit Kandidat' : 'Tambah Kandidat'}</h2>
            <p>Isi form berikut untuk menyimpan data interview.</p>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Tutup
          </button>
        </div>

        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Nama Kandidat
            <input
              name="candidateName"
              type="text"
              value={formData.candidateName}
              onChange={onChange}
              placeholder="Contoh: Henry Daniel"
            />
          </label>

          <label>
            Posisi
            <input
              name="role"
              type="text"
              value={formData.role}
              onChange={onChange}
              placeholder="Contoh: QA"
            />
          </label>

          <label>
            Status Kandidat
            <select
              name="candidateStatus"
              value={formData.candidateStatus}
              onChange={onChange}
            >
              {candidateStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            Schedule Interview
            <input
              name="schedule"
              type="datetime-local"
              value={formData.schedule}
              onChange={onChange}
            />
          </label>

          <label>
            PIC / User
            <input
              name="owner"
              type="text"
              value={formData.owner}
              onChange={onChange}
              placeholder="Contoh: ADVA"
            />
          </label>

          <label>
            Host Interview
            <input
              name="host"
              type="text"
              value={formData.host}
              onChange={onChange}
              placeholder="Contoh: Sylvia Sylvia"
            />
          </label>

          <label className="full-width">
            Link Interview
            <input
              name="meetingLink"
              type="url"
              value={formData.meetingLink}
              onChange={onChange}
              placeholder="https://meet.google.com/..."
            />
          </label>

          <label>
            Interview Status
            <select
              name="interviewStatus"
              value={formData.interviewStatus}
              onChange={onChange}
            >
              {interviewStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="full-width">
            Notes
            <textarea
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={onChange}
              placeholder="Tambahkan catatan interview"
            />
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

export default InterviewModal;
