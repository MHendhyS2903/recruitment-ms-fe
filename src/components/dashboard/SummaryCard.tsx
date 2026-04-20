import type { SummaryCardProps } from '../../types/dashboard';

function SummaryCard({ label, value, description, className }: SummaryCardProps) {
  return (
    <article className={`summary-card ${className ?? ''}`.trim()}>
      <div className="summary-card-copy">
        <span>{label}</span>
        <small>{description}</small>
      </div>
      <strong>{value}</strong>
    </article>
  );
}

export default SummaryCard;
