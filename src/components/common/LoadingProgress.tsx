interface LoadingProgressProps {
  /** Teks status yang dibacakan pembaca layar */
  label: string;
  className?: string;
}

function LoadingProgress({ label, className }: LoadingProgressProps) {
  return (
    <div
      className={`loading-progress ${className ?? ''}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="loading-progress-label">{label}</span>
      <div className="loading-progress-track" aria-hidden="true">
        <div className="loading-progress-bar" />
      </div>
    </div>
  );
}

export default LoadingProgress;
