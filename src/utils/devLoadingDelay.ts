import { isProductionBuild } from './isProductionBuild';

const DEV_LOADING_MS = 1000;
const PROD_SAVE_PROGRESS_MIN_MS = 450;

/** Biarkan React commit lalu browser paint sebelum kerja async berat (agar UI loading keburu tampil). */
export async function yieldToPaint(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

/**
 * Di bundle non-production, jalankan `work` paralel dengan jeda minimal 1 detik
 * agar state loading sempat terlihat. Di production, hanya menjalankan `work`.
 */
export async function withDevMinimumLoadingDuration<T>(work: Promise<T>): Promise<T> {
  if (isProductionBuild()) {
    return work;
  }

  const [result] = await Promise.all([
    work,
    new Promise<void>((resolve) => {
      setTimeout(resolve, DEV_LOADING_MS);
    }),
  ]);

  return result;
}

/**
 * Simpan kandidat: minimal ~450ms di production dan ~1s di non-production (paralel dengan `work`),
 * supaya indikator simpan sempat terlihat walau API sangat cepat.
 */
export async function withSaveProgressMinimum<T>(work: Promise<T>): Promise<T> {
  const ms = isProductionBuild() ? PROD_SAVE_PROGRESS_MIN_MS : DEV_LOADING_MS;
  const [result] = await Promise.all([
    work,
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    }),
  ]);

  return result;
}
