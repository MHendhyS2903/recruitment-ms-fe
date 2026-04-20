import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
} from 'react';
import DataTable, { type DataTableColumn } from '../components/common/DataTable';
import LoadingProgress from '../components/common/LoadingProgress';
import PaginationControls from '../components/common/PaginationControls';
import {
  createRecruiterCandidate,
  deleteRecruiterCandidate,
  fetchRecruiterCandidates,
  fetchSalesCandidates,
  updateRecruiterCandidate,
  processRecruiterCandidate,
} from '../api/recruitmentApi';
import PageHeader from '../components/dashboard/PageHeader';
import { usePagination } from '../hooks/usePagination';
import type {
  RecruiterCandidateFormValues,
  RecruiterCandidateRecord,
  RecruiterDocumentCategory,
  RecruiterDocumentRecord,
  RecruiterStage,
  RecruiterView,
} from '../types/recruiter';
import { readRecruiterCandidates, writeRecruiterCandidates } from '../utils/recruiterStorage';
import { writeSalesCandidates } from '../utils/salesStorage';

const stageOptions: RecruiterStage[] = ['TO DO', 'READY TO INTERVIEW', 'INTERVIEWING'];

const emptyFormValues: RecruiterCandidateFormValues = {
  fullName: '',
  appliedRole: '',
  email: '',
  phone: '',
  source: '',
  location: '',
  expectedSalary: '',
  dateOfJoin: '',
  summary: '',
};

type StageFilter = RecruiterStage | 'ALL';

interface UploadState {
  photo: File | null;
  cv: File | null;
  portfolio: File | null;
  coverLetter: File | null;
  attachments: File[];
}

const emptyUploads: UploadState = {
  photo: null,
  cv: null,
  portfolio: null,
  coverLetter: null,
  attachments: [],
};

const documentLabels: Record<RecruiterDocumentCategory, string> = {
  CV: 'CV',
  PORTOFOLIO: 'Portofolio',
  SURAT_LAMARAN: 'Surat Lamaran',
  LAMPIRAN: 'Lampiran',
};

const getDocumentCategoryLabels = (documents: RecruiterDocumentRecord[]) =>
  Array.from(new Set(documents.map((document) => documentLabels[document.category])));

const formatCreatedAt = (value: string) => new Date(value).toLocaleString('id-ID');
const formatDateOfJoin = (value: string) =>
  value ? new Date(value).toLocaleDateString('id-ID') : '-';

const DEFAULT_CANDIDATE_PHOTO_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
    <rect width="320" height="320" rx="40" fill="#e2e8f0" />
    <circle cx="160" cy="122" r="56" fill="#94a3b8" />
    <path
      d="M80 274c10-46 42-74 80-74s70 28 80 74"
      fill="#94a3b8"
      stroke="#94a3b8"
      stroke-width="12"
      stroke-linecap="round"
    />
  </svg>
`)}`;

const isTodoCandidate = (candidate: RecruiterCandidateRecord) => candidate.stage === 'TO DO';

const getStageClassName = (stage: RecruiterStage) =>
  `recruiter-stage-${stage.toLowerCase().replace(/\s+/g, '-')}`;

interface RecruiterCandidateModalProps {
  formValues: RecruiterCandidateFormValues;
  uploads: UploadState;
  isOpen: boolean;
  isEditing: boolean;
  existingDocuments: RecruiterDocumentRecord[];
  existingPhotoName: string;
  cvInputRef: RefObject<HTMLInputElement | null>;
  photoInputRef: RefObject<HTMLInputElement | null>;
  portfolioInputRef: RefObject<HTMLInputElement | null>;
  coverLetterInputRef: RefObject<HTMLInputElement | null>;
  attachmentInputRef: RefObject<HTMLInputElement | null>;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSingleFileChange: (
    key: 'cv' | 'portfolio' | 'coverLetter'
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function RecruiterCandidateModal({
  formValues,
  uploads,
  isOpen,
  isEditing,
  existingDocuments,
  existingPhotoName,
  cvInputRef,
  photoInputRef,
  portfolioInputRef,
  coverLetterInputRef,
  attachmentInputRef,
  onChange,
  onSingleFileChange,
  onPhotoChange,
  onAttachmentChange,
  onClose,
  onReset,
  onSubmit,
}: RecruiterCandidateModalProps) {
  if (!isOpen) {
    return null;
  }

  const previewDocuments = [
    ...(uploads.cv
      ? [{ label: 'CV', value: uploads.cv.name }]
      : existingDocuments
          .filter((document) => document.category === 'CV')
          .map((document) => ({ label: 'CV', value: document.name }))),
    ...(uploads.portfolio
      ? [{ label: 'Portofolio', value: uploads.portfolio.name }]
      : existingDocuments
          .filter((document) => document.category === 'PORTOFOLIO')
          .map((document) => ({ label: 'Portofolio', value: document.name }))),
    ...(uploads.coverLetter
      ? [{ label: 'Surat Lamaran', value: uploads.coverLetter.name }]
      : existingDocuments
          .filter((document) => document.category === 'SURAT_LAMARAN')
          .map((document) => ({ label: 'Surat Lamaran', value: document.name }))),
    ...(uploads.attachments.length
      ? uploads.attachments.map((file) => ({ label: 'Lampiran', value: file.name }))
      : existingDocuments
          .filter((document) => document.category === 'LAMPIRAN')
          .map((document) => ({ label: 'Lampiran', value: document.name }))),
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card recruiter-modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Edit kandidat recruiter' : 'Tambah kandidat recruiter'}
      >
        <div className="panel-header modal-header">
          <div>
            <h2>{isEditing ? 'Edit Kandidat' : 'Form Input Kandidat'}</h2>
            <p>
              {isEditing
                ? 'Perbarui profil kandidat dan dokumen pendukung recruiter.'
                : 'Isi profil kandidat dan unggah CV atau dokumen pendukung recruiter.'}
            </p>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Tutup
          </button>
        </div>

        <form className="form-grid" onSubmit={onSubmit}>
          <label className="full-width recruiter-upload-card">
            Upload Foto Kandidat
            <input
              ref={photoInputRef}
              accept=".jpg,.jpeg,.png,.webp"
              type="file"
              onChange={onPhotoChange}
            />
            <small>
              {uploads.photo
                ? uploads.photo.name
                : existingPhotoName || 'Opsional, hanya tampil di popup detail'}
            </small>
          </label>

          <label>
            Nama Kandidat
            <input
              required
              name="fullName"
              placeholder="Contoh: Andi Saputra"
              value={formValues.fullName}
              onChange={onChange}
            />
          </label>

          <label>
            Posisi Dilamar
            <input
              required
              name="appliedRole"
              placeholder="Contoh: Frontend Engineer"
              value={formValues.appliedRole}
              onChange={onChange}
            />
          </label>

          <label>
            Email
            <input
              required
              name="email"
              placeholder="andi@mail.com"
              type="email"
              value={formValues.email}
              onChange={onChange}
            />
          </label>

          <label>
            Nomor HP
            <input
              name="phone"
              placeholder="08xxxxxxxxxx"
              value={formValues.phone}
              onChange={onChange}
            />
          </label>

          <label>
            Sumber Kandidat
            <input
              name="source"
              placeholder="LinkedIn, Jobstreet, Referral, dll"
              value={formValues.source}
              onChange={onChange}
            />
          </label>

          <label>
            Lokasi Domisili
            <input
              name="location"
              placeholder="Jakarta, Bandung, Surabaya, dll"
              value={formValues.location}
              onChange={onChange}
            />
          </label>

          <label>
            Ekspektasi Gaji
            <input
              name="expectedSalary"
              placeholder="Contoh: Rp12.000.000"
              value={formValues.expectedSalary}
              onChange={onChange}
            />
          </label>

          <label>
            Date of Join
            <input
              name="dateOfJoin"
              type="date"
              value={formValues.dateOfJoin}
              onChange={onChange}
            />
          </label>

          <label className="full-width">
            Ringkasan Profil
            <textarea
              rows={4}
              name="summary"
              placeholder="Isi poin penting kandidat, pengalaman, skill utama, atau catatan recruiter."
              value={formValues.summary}
              onChange={onChange}
            />
          </label>

          <div className="full-width recruiter-upload-grid">
            <label className="recruiter-upload-card">
              Upload CV
              <input
                ref={cvInputRef}
                accept=".pdf,.doc,.docx"
                type="file"
                onChange={onSingleFileChange('cv')}
              />
              <small>
                {uploads.cv
                  ? uploads.cv.name
                  : isEditing
                    ? 'Biarkan kosong jika tidak ingin mengganti CV'
                    : 'Wajib diisi'}
              </small>
            </label>

            <label className="recruiter-upload-card">
              Upload Portofolio
              <input
                ref={portfolioInputRef}
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                type="file"
                onChange={onSingleFileChange('portfolio')}
              />
              <small>{uploads.portfolio ? uploads.portfolio.name : 'Opsional'}</small>
            </label>

            <label className="recruiter-upload-card">
              Upload Surat Lamaran
              <input
                ref={coverLetterInputRef}
                accept=".pdf,.doc,.docx"
                type="file"
                onChange={onSingleFileChange('coverLetter')}
              />
              <small>{uploads.coverLetter ? uploads.coverLetter.name : 'Opsional'}</small>
            </label>

            <label className="recruiter-upload-card">
              Dokumen Tambahan
              <input
                ref={attachmentInputRef}
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                type="file"
                onChange={onAttachmentChange}
              />
              <small>
                {uploads.attachments.length
                  ? `${uploads.attachments.length} file dipilih`
                  : 'Sertifikat, assessment, atau lampiran lain'}
              </small>
            </label>
          </div>

          <div className="full-width recruiter-selected-files">
            <strong>Preview dokumen yang akan disimpan</strong>
            <div className="recruiter-document-list">
              {previewDocuments.length > 0 ? (
                previewDocuments.map((document) => (
                  <span
                    className="recruiter-document-chip"
                    key={`${document.label}-${document.value}`}
                  >
                    {document.label}: {document.value}
                  </span>
                ))
              ) : (
                <p className="muted-text">Belum ada dokumen yang dipilih pada form ini.</p>
              )}
            </div>
          </div>

          <div className="form-actions full-width">
            <button className="ghost-button" type="button" onClick={onReset}>
              Reset Form
            </button>
            <button className="ghost-button" type="button" onClick={onClose}>
              Batal
            </button>
            <button className="primary-button" type="submit">
              {isEditing ? 'Simpan Perubahan' : 'Simpan Kandidat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface RecruiterPageProps {
  view: RecruiterView;
}

interface RecruiterCandidateDetailModalProps {
  candidate: RecruiterCandidateRecord | null;
  canEdit: boolean;
  onClose: () => void;
  onEdit: () => void;
}

function RecruiterCandidateDetailModal({
  candidate,
  canEdit,
  onClose,
  onEdit,
}: RecruiterCandidateDetailModalProps) {
  if (!candidate) {
    return null;
  }

  const photoUrl = candidate.candidatePhotoUrl || DEFAULT_CANDIDATE_PHOTO_URL;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card recruiter-detail-modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Detail kandidat recruiter"
      >
        <div className="panel-header modal-header">
          <div>
            <h2>Detail Kandidat</h2>
            <p>Ringkasan lengkap data kandidat recruiter.</p>
          </div>
          <div className="recruiter-detail-header-actions">
            <div className="recruiter-detail-edit-wrapper">
              <button
                className={`table-button edit-button ${
                  !canEdit ? 'recruiter-edit-button-disabled' : ''
                }`}
                type="button"
                onClick={canEdit ? onEdit : undefined}
                aria-disabled={!canEdit}
              >
                Edit
              </button>
              {!canEdit ? (
                <div className="recruiter-edit-tooltip" role="tooltip">
                  Data yang sudah diproses tidak bisa diubah lagi.
                </div>
              ) : null}
            </div>
            <button className="ghost-button" type="button" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>

        <section className="recruiter-detail-hero">
          <div className="recruiter-photo-preview-card recruiter-detail-photo-card">
            <img
              className="recruiter-photo-preview-image"
              src={photoUrl}
              alt={candidate.fullName}
            />
          </div>

          <div className="recruiter-detail-summary">
            <div>
              <p className="eyebrow recruiter-detail-eyebrow">Candidate Profile</p>
              <h3>{candidate.fullName}</h3>
              <p className="recruiter-detail-role">{candidate.appliedRole}</p>
            </div>

            <div className="recruiter-detail-badges">
              <span className={`recruiter-stage ${getStageClassName(candidate.stage)}`}>
                {candidate.stage}
              </span>
              <span className="recruiter-document-chip">{candidate.source || 'Sumber -'}</span>
              <span className="recruiter-document-chip">
                DOJ: {formatDateOfJoin(candidate.dateOfJoin)}
              </span>
            </div>

            <div className="recruiter-detail-top-grid">
              <div className="recruiter-detail-item">
                <span>Email</span>
                <strong>{candidate.email}</strong>
              </div>
              <div className="recruiter-detail-item">
                <span>No. HP</span>
                <strong>{candidate.phone || '-'}</strong>
              </div>
              <div className="recruiter-detail-item">
                <span>Domisili</span>
                <strong>{candidate.location || '-'}</strong>
              </div>
              <div className="recruiter-detail-item">
                <span>Ekspektasi Gaji</span>
                <strong>{candidate.expectedSalary || '-'}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="recruiter-detail-section">
          <h3>Informasi Tambahan</h3>
          <div className="recruiter-detail-grid">
            <div className="recruiter-detail-item">
              <span>Sumber Kandidat</span>
              <strong>{candidate.source || '-'}</strong>
            </div>
            <div className="recruiter-detail-item">
              <span>Date of Join</span>
              <strong>{formatDateOfJoin(candidate.dateOfJoin)}</strong>
            </div>
            <div className="recruiter-detail-item">
              <span>Tahap Saat Ini</span>
              <strong>{candidate.stage}</strong>
            </div>
            <div className="recruiter-detail-item">
              <span>Diinput Pada</span>
              <strong>{formatCreatedAt(candidate.createdAt)}</strong>
            </div>
          </div>
        </section>

        <section className="recruiter-detail-section">
          <h3>Dokumen</h3>
          <div className="recruiter-document-list">
            {candidate.documents.map((document) => (
              <span className="recruiter-document-chip" key={document.id}>
                {documentLabels[document.category]}: {document.name}
              </span>
            ))}
          </div>
        </section>

        <section className="recruiter-detail-section">
          <h3>Catatan</h3>
          <div className="empty-block recruiter-detail-note">
            <p>{candidate.summary || 'Belum ada catatan recruiter.'}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

interface RecruiterCandidateProcessModalProps {
  candidate: RecruiterCandidateRecord | null;
  onClose: () => void;
  onConfirm: () => void;
}

function RecruiterCandidateProcessModal({
  candidate,
  onClose,
  onConfirm,
}: RecruiterCandidateProcessModalProps) {
  if (!candidate) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card recruiter-process-modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Konfirmasi proses kandidat recruiter"
      >
        <div className="modal-header recruiter-process-modal-header">
          <h2>Proses Kandidat?</h2>
          <p>
            Setelah diproses, data <strong>{candidate.fullName}</strong> tidak bisa diubah
            lagi.
          </p>
        </div>

        <div className="recruiter-process-summary">
          <span>Perubahan tahap</span>
          <strong>TO DO {'->'} READY TO INTERVIEW</strong>
        </div>

        <div className="form-actions recruiter-confirm-actions">
          <button className="ghost-button" type="button" onClick={onClose}>
            Batal
          </button>
          <button className="primary-button" type="button" onClick={onConfirm}>
            Ya, Proses Data
          </button>
        </div>
      </div>
    </div>
  );
}

interface RecruiterCandidateRemoveModalProps {
  candidate: RecruiterCandidateRecord | null;
  onClose: () => void;
  onConfirm: () => void;
}

function RecruiterCandidateRemoveModal({
  candidate,
  onClose,
  onConfirm,
}: RecruiterCandidateRemoveModalProps) {
  if (!candidate) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card recruiter-process-modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Konfirmasi hapus kandidat recruiter"
      >
        <div className="modal-header recruiter-process-modal-header">
          <h2>Hapus Data?</h2>
          <p>
            Apakah Anda yakin ingin menghapus data <strong>{candidate.fullName}</strong>?
          </p>
        </div>

        <div className="form-actions recruiter-confirm-actions">
          <button className="ghost-button" type="button" onClick={onClose}>
            Tidak
          </button>
          <button className="delete-button table-button" type="button" onClick={onConfirm}>
            Ya
          </button>
        </div>
      </div>
    </div>
  );
}

function RecruiterPage({ view }: RecruiterPageProps) {
  const [candidates, setCandidates] = useState<RecruiterCandidateRecord[]>(() =>
    readRecruiterCandidates()
  );
  const [formValues, setFormValues] =
    useState<RecruiterCandidateFormValues>(emptyFormValues);
  const [uploads, setUploads] = useState<UploadState>(emptyUploads);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [detailCandidateId, setDetailCandidateId] = useState<string | null>(null);
  const [processCandidateId, setProcessCandidateId] = useState<string | null>(null);
  const [removeCandidateId, setRemoveCandidateId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('ALL');
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const cvInputRef = useRef<HTMLInputElement | null>(null);
  const portfolioInputRef = useRef<HTMLInputElement | null>(null);
  const coverLetterInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    writeRecruiterCandidates(candidates);
  }, [candidates]);

  const syncSalesMirror = useCallback(async () => {
    const salesResponse = await fetchSalesCandidates('all');
    writeSalesCandidates(salesResponse.items);
  }, []);

  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetchRecruiterCandidates('all');
      setCandidates(response.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Gagal memuat data recruiter dari backend.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  const resetUploadInputs = () => {
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }

    if (cvInputRef.current) {
      cvInputRef.current.value = '';
    }

    if (portfolioInputRef.current) {
      portfolioInputRef.current.value = '';
    }

    if (coverLetterInputRef.current) {
      coverLetterInputRef.current.value = '';
    }

    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setFormValues(emptyFormValues);
    setUploads(emptyUploads);
    setEditingCandidateId(null);
    resetUploadInputs();
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeDetailModal = () => {
    setDetailCandidateId(null);
  };

  const closeProcessModal = () => {
    setProcessCandidateId(null);
  };

  const closeRemoveModal = () => {
    setRemoveCandidateId(null);
  };

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSingleFileChange =
    (key: 'cv' | 'portfolio' | 'coverLetter') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;

      setUploads((current) => ({
        ...current,
        [key]: file,
      }));
    };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setUploads((current) => ({
      ...current,
      photo: file,
    }));
  };

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);

    setUploads((current) => ({
      ...current,
      attachments: nextFiles,
    }));
  };

  const handleEdit = (candidate: RecruiterCandidateRecord) => {
    setEditingCandidateId(candidate.id);
    setFormValues({
      fullName: candidate.fullName,
      appliedRole: candidate.appliedRole,
      email: candidate.email,
      phone: candidate.phone,
      source: candidate.source,
      location: candidate.location,
      expectedSalary: candidate.expectedSalary,
      dateOfJoin: candidate.dateOfJoin,
      summary: candidate.summary,
    });
    setUploads(emptyUploads);
    resetUploadInputs();
    setIsModalOpen(true);
  };

  const handleDetail = (candidateId: string) => {
    setDetailCandidateId(candidateId);
  };

  const handleEditFromDetail = (candidate: RecruiterCandidateRecord) => {
    closeDetailModal();
    handleEdit(candidate);
  };

  const handleRemoveClick = (candidateId: string) => {
    setRemoveCandidateId(candidateId);
  };

  const handleRemove = async () => {
    if (!removeCandidateId) {
      return;
    }

    try {
      await deleteRecruiterCandidate(removeCandidateId);
      await Promise.all([loadCandidates(), syncSalesMirror()]);
      closeRemoveModal();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'Gagal menghapus kandidat recruiter.'
      );
    }
  };

  const handleProcessClick = (candidateId: string) => {
    setProcessCandidateId(candidateId);
  };

  const handleProcess = async () => {
    if (!processCandidateId) {
      return;
    }

    try {
      await processRecruiterCandidate(processCandidateId);
      await Promise.all([loadCandidates(), syncSalesMirror()]);
      closeProcessModal();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'Gagal memproses kandidat recruiter.'
      );
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const editingCandidate = editingCandidateId
      ? candidates.find((candidate) => candidate.id === editingCandidateId)
      : null;
    const hasExistingCv =
      editingCandidate?.documents.some((document) => document.category === 'CV') ?? false;

    if (!uploads.cv && !hasExistingCv) {
      window.alert('CV kandidat wajib diunggah sebelum data disimpan.');
      return;
    }

    try {
      if (editingCandidate) {
        await updateRecruiterCandidate({
          candidateId: editingCandidate.candidateId ?? editingCandidate.id,
          candidate: formValues,
          existingDocuments: editingCandidate.documents,
          uploads,
        });
      } else {
        await createRecruiterCandidate({
          candidate: formValues,
          uploads,
        });
      }

      await Promise.all([loadCandidates(), syncSalesMirror()]);
      resetForm();
      closeModal();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'Gagal menyimpan data kandidat recruiter.'
      );
    }
  };

  const scopedCandidates = useMemo(
    () => (view === 'todo' ? candidates.filter(isTodoCandidate) : candidates),
    [candidates, view]
  );

  const filteredCandidates = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return scopedCandidates.filter((candidate) => {
      const matchesStage = stageFilter === 'ALL' || candidate.stage === stageFilter;

      if (!matchesStage) {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      const documentNames = candidate.documents.map((document) => document.name).join(' ');
      const searchableFields = [
        candidate.fullName,
        candidate.appliedRole,
        candidate.email,
        candidate.phone,
        candidate.source,
        candidate.location,
        candidate.summary,
        documentNames,
      ]
        .join(' ')
        .toLowerCase();

      return searchableFields.includes(normalizedSearchTerm);
    });
  }, [scopedCandidates, searchTerm, stageFilter]);

  const pagination = usePagination(filteredCandidates, 5);

  const totalCandidates = scopedCandidates.length;
  const candidatesWithCv = scopedCandidates.filter((candidate) =>
    candidate.documents.some((document) => document.category === 'CV')
  ).length;
  const candidatesWithSupportingDocs = scopedCandidates.filter((candidate) =>
    candidate.documents.some((document) => document.category !== 'CV')
  ).length;
  const readyForReview = scopedCandidates.filter(
    (candidate) => candidate.stage !== 'TO DO'
  ).length;
  const pageTitle =
    view === 'todo' ? 'Recruiter To do Candidates' : 'Recruiter Candidate Database';
  const pageDescription =
    view === 'todo'
      ? 'Sub menu recruiter untuk melihat kandidat yang masih berstatus To do.'
      : 'Sub menu recruiter untuk melihat seluruh data kandidat yang sudah masuk.';
  const panelTitle =
    view === 'todo' ? 'Database Kandidat To do Recruiter' : 'Database Kandidat Recruiter';
  const panelDescription =
    view === 'todo'
      ? 'Menampilkan hanya kandidat dengan tahap To do berdasarkan filter aktif.'
      : 'Cari kandidat berdasarkan nama, posisi, kontak, sumber, atau nama dokumen.';
  const recruiterColumns: DataTableColumn[] = [
    { key: 'fullName', label: 'Nama Kandidat' },
    { key: 'appliedRole', label: 'Role' },
    { key: 'location', label: 'Domisili' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'No. HP' },
    { key: 'expectedSalary', label: 'Ekspektasi Gaji' },
    { key: 'source', label: 'Sumber' },
    { key: 'dateOfJoin', label: 'Date of Join' },
    {
      key: 'stage',
      label: 'Tahap',
      className: view === 'todo' ? 'recruiter-stage-column-compact' : '',
    },
    { key: 'documents', label: 'Dokumen' },
    { key: 'summary', label: 'Catatan' },
    { key: 'createdAt', label: 'Diinput' },
    { key: 'actions', label: 'Aksi' },
  ];

  const renderCandidateActions = (candidate: RecruiterCandidateRecord) => (
    <div className="action-group recruiter-action-group">
      <button
        className="table-button detail-button"
        type="button"
        onClick={() => handleDetail(candidate.id)}
      >
        Detail
      </button>
      {candidate.stage === 'TO DO' ? (
        <button
          className="table-button process-button"
          type="button"
          onClick={() => handleProcessClick(candidate.id)}
        >
          Proses
        </button>
      ) : null}
      {candidate.stage === 'TO DO' ? (
        <button
          className="table-button edit-button"
          type="button"
          onClick={() => handleEdit(candidate)}
        >
          Edit
        </button>
      ) : null}
      {candidate.stage === 'TO DO' ? (
        <button
          className="table-button delete-button"
          type="button"
          onClick={() => handleRemoveClick(candidate.id)}
        >
          Remove
        </button>
      ) : null}
    </div>
  );

  const detailCandidate = detailCandidateId
    ? candidates.find((candidate) => candidate.id === detailCandidateId) ?? null
    : null;
  const processCandidate = processCandidateId
    ? candidates.find((candidate) => candidate.id === processCandidateId) ?? null
    : null;
  const removeCandidate = removeCandidateId
    ? candidates.find((candidate) => candidate.id === removeCandidateId) ?? null
    : null;

  return (
    <>
      <PageHeader
        eyebrow="Recruiter Module"
        title={pageTitle}
        description={pageDescription}
        action={
          <div className="hero-actions">
            <span className="table-count">{totalCandidates} kandidat tersimpan</span>
            <button className="primary-button" type="button" onClick={openModal}>
              + Tambah Kandidat
            </button>
          </div>
        }
      />

      {isLoading ? <LoadingProgress label="Memuat data recruiter dari server..." /> : null}

      {errorMessage ? (
        <div className="empty-block">
          <strong>Sinkronisasi recruiter belum berhasil.</strong>
          <p>{errorMessage}</p>
        </div>
      ) : null}

      <section className="summary-grid summary-grid-compact">
        <article className="summary-card">
          <span>Total Kandidat</span>
          <strong>{totalCandidates}</strong>
          <small>Data kandidat yang sudah tersimpan di menu recruiter</small>
        </article>
        <article className="summary-card">
          <span>CV Lengkap</span>
          <strong>{candidatesWithCv}</strong>
          <small>Kandidat yang sudah memiliki file CV</small>
        </article>
        <article className="summary-card">
          <span>Dokumen Tambahan</span>
          <strong>{candidatesWithSupportingDocs}</strong>
          <small>Profil dengan portofolio, surat lamaran, atau lampiran lain</small>
        </article>
        <article className="summary-card">
          <span>Siap Direview</span>
          <strong>{readyForReview}</strong>
          <small>Kandidat yang sudah masuk tahap screening atau berikutnya</small>
        </article>
      </section>

      <DataTable
        columns={recruiterColumns}
        description={panelDescription}
        emptyMessage={
          isLoading
            ? 'Memuat data recruiter dari backend...'
            : 'Belum ada kandidat yang cocok dengan filter saat ini.'
        }
        headerActions={
          <div className="filter-grid recruiter-filter-grid">
            <label>
              Cari Kandidat
              <input
                placeholder="Nama, posisi, email, atau file CV"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <label>
              Filter Tahap
              <select
                value={stageFilter}
                onChange={(event) => setStageFilter(event.target.value as StageFilter)}
              >
                <option value="ALL">Semua Tahap</option>
                {stageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
        panelHeaderClassName="recruiter-panel-header"
        rows={pagination.paginatedItems}
        tableClassName="recruiter-table"
        title={panelTitle}
        renderRow={(candidate) => (
          <tr key={candidate.id}>
            <td>
              <strong>{candidate.fullName}</strong>
            </td>
            <td>{candidate.appliedRole}</td>
            <td>{candidate.location || 'Lokasi belum diisi'}</td>
            <td>{candidate.email}</td>
            <td>{candidate.phone || '-'}</td>
            <td>{candidate.expectedSalary || 'Gaji belum diisi'}</td>
            <td>{candidate.source || '-'}</td>
            <td>{formatDateOfJoin(candidate.dateOfJoin)}</td>
            <td className={view === 'todo' ? 'recruiter-stage-column-compact' : ''}>
              <span className={`recruiter-stage ${getStageClassName(candidate.stage)}`}>
                {candidate.stage}
              </span>
            </td>
            <td>
              <div className="recruiter-document-list">
                {getDocumentCategoryLabels(candidate.documents).map((label) => (
                  <span className="recruiter-document-chip" key={label}>
                    {label}
                  </span>
                ))}
              </div>
            </td>
            <td>
              <div className="recruiter-note-wrapper">
                <p className="recruiter-note">
                  {candidate.summary || 'Belum ada catatan recruiter.'}
                </p>
                <div className="recruiter-note-tooltip" role="tooltip">
                  {candidate.summary || 'Belum ada catatan recruiter.'}
                </div>
              </div>
            </td>
            <td>{formatCreatedAt(candidate.createdAt)}</td>
            <td>{renderCandidateActions(candidate)}</td>
          </tr>
        )}
      />

      {filteredCandidates.length > 0 ? (
        <PaginationControls
          currentPage={pagination.currentPage}
          endItem={pagination.endItem}
          pageSize={pagination.pageSize}
          pageSizeOptions={pagination.pageSizeOptions}
          startItem={pagination.startItem}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          onNextPage={pagination.goToNextPage}
          onPageChange={pagination.goToPage}
          onPageSizeChange={pagination.handlePageSizeChange}
          onPreviousPage={pagination.goToPreviousPage}
        />
      ) : null}

      <RecruiterCandidateModal
        formValues={formValues}
        uploads={uploads}
        isOpen={isModalOpen}
        isEditing={editingCandidateId !== null}
        existingDocuments={
          editingCandidateId
            ? candidates.find((candidate) => candidate.id === editingCandidateId)?.documents ?? []
            : []
        }
        existingPhotoName={
          editingCandidateId
            ? candidates.find((candidate) => candidate.id === editingCandidateId)
                ?.candidatePhotoName ?? ''
            : ''
        }
        cvInputRef={cvInputRef}
        photoInputRef={photoInputRef}
        portfolioInputRef={portfolioInputRef}
        coverLetterInputRef={coverLetterInputRef}
        attachmentInputRef={attachmentInputRef}
        onChange={handleFieldChange}
        onSingleFileChange={handleSingleFileChange}
        onPhotoChange={handlePhotoChange}
        onAttachmentChange={handleAttachmentChange}
        onClose={closeModal}
        onReset={resetForm}
        onSubmit={handleSubmit}
      />
      <RecruiterCandidateDetailModal
        candidate={detailCandidate}
        canEdit={detailCandidate?.stage === 'TO DO'}
        onClose={closeDetailModal}
        onEdit={() => {
          if (detailCandidate) {
            handleEditFromDetail(detailCandidate);
          }
        }}
      />
      <RecruiterCandidateProcessModal
        candidate={processCandidate}
        onClose={closeProcessModal}
        onConfirm={handleProcess}
      />
      <RecruiterCandidateRemoveModal
        candidate={removeCandidate}
        onClose={closeRemoveModal}
        onConfirm={handleRemove}
      />
    </>
  );
}

export default RecruiterPage;
