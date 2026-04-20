import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { parseInterviewScheduleOcr } from '../../utils/parseInterviewScheduleOcr';
import { prepareImageForOcr } from '../../utils/prepareImageForOcr';
import type { InterviewImportInput } from '../../types/interview';

interface InterviewOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: InterviewImportInput[]) => void;
}

function InterviewOcrModal({ isOpen, onClose, onImport }: InterviewOcrModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl('');
      setOcrText('');
      setManualDate('');
      setIsProcessing(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  const parsedResult = useMemo(
    () => parseInterviewScheduleOcr(ocrText, manualDate),
    [manualDate, ocrText]
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file ?? null);
    setErrorMessage('');
  };

  const handleScanImage = async () => {
    if (!selectedFile) {
      setErrorMessage('Pilih foto catatan interview terlebih dahulu.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const Tesseract = await import('tesseract.js');
      const preparedImage = await prepareImageForOcr(selectedFile);
      const ocrOptions = {
        tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
        preserve_interword_spaces: '1',
      } as unknown as Parameters<typeof Tesseract.recognize>[2];
      const result = await Tesseract.recognize(preparedImage, 'eng', ocrOptions);
      setOcrText(result.data.text || '');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'OCR gagal dijalankan. Coba ulangi dengan foto yang lebih jelas.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (!parsedResult.entries.length) {
      setErrorMessage('Belum ada hasil parsing yang bisa diimport.');
      return;
    }

    onImport(parsedResult.entries);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card ocr-modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tambah interview via OCR"
      >
        <div className="panel-header modal-header">
          <div>
            <h2>Tambah Data via OCR</h2>
            <p>
              Upload foto catatan interview, lalu sistem akan membaca teks dan
              membuat draft data interview untuk Anda review.
            </p>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Tutup
          </button>
        </div>

        <div className="ocr-layout">
          <section className="ocr-section">
            <label className="ocr-upload">
              Upload Foto
              <input
                accept="image/*"
                capture="environment"
                type="file"
                onChange={handleFileChange}
              />
            </label>

            <div className="ocr-helper">
              OCR FE-only untuk tulisan tangan masih terbatas. Hasil terbaik biasanya
              didapat bila foto terang, lurus, dan kontras cukup tinggi.
              <strong>Tips format yang didukung saat ini:</strong>
              <span>`QA CITRA - Ari Purnomo = 10.00`</span>
              <span>`- Dhivas Dharma = 10.30` akan memakai user sebelumnya.</span>
            </div>

            <div className="ocr-helper">
              Format yang didukung saat ini:
              <strong>Isi tanggal manual bila OCR gagal membaca tanggal</strong>
              <span>Contoh: `2026-03-16`</span>
              <input
                type="date"
                value={manualDate}
                onChange={(event) => setManualDate(event.target.value)}
              />
            </div>

            {previewUrl ? (
              <img alt="Preview OCR" className="ocr-preview-image" src={previewUrl} />
            ) : (
              <div className="ocr-preview-placeholder">
                Preview foto akan tampil di sini.
              </div>
            )}

            <div className="hero-actions">
              <button
                className="primary-button"
                type="button"
                onClick={handleScanImage}
                disabled={isProcessing}
              >
                {isProcessing ? 'Membaca Foto...' : 'Scan dengan OCR'}
              </button>
            </div>
          </section>

          <section className="ocr-section">
            <label>
              Hasil OCR
              <textarea
                rows={12}
                value={ocrText}
                onChange={(event) => setOcrText(event.target.value)}
                placeholder="Teks hasil OCR akan muncul di sini. Anda juga bisa edit manual sebelum di-parse."
              />
            </label>

            <div className="ocr-detected-date">
              <span>Tanggal terdeteksi</span>
              <strong>{parsedResult.detectedDate}</strong>
            </div>

            <div className="ocr-preview-table">
              <div className="ocr-preview-table-header">
                <strong>Preview hasil parsing</strong>
                <span>{parsedResult.entries.length} kandidat</span>
              </div>

              {parsedResult.entries.length > 0 ? (
                parsedResult.entries.map((entry) => (
                  <article className="ocr-preview-row" key={entry.id}>
                    <div>
                      <strong>{entry.candidateName}</strong>
                      <p>
                        {entry.sourceLabel} | {entry.time}
                      </p>
                    </div>
                    <span className="owner-pill">{entry.owner}</span>
                  </article>
                ))
              ) : (
                <div className="ocr-preview-empty">
                  Belum ada data yang berhasil diparse.
                </div>
              )}
            </div>

            {errorMessage && <p className="ocr-error">{errorMessage}</p>}

            <p className="ocr-note">
              Jika hasil OCR masih berantakan, edit teks secara manual pada kotak
              `Hasil OCR` lalu preview parsing akan diperbarui otomatis.
            </p>

            <div className="form-actions">
              <button className="ghost-button" type="button" onClick={onClose}>
                Batal
              </button>
              <button className="primary-button" type="button" onClick={handleImport}>
                Import ke Tabel
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default InterviewOcrModal;
