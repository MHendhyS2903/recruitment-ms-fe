import type { CSSProperties } from 'react';

export interface PieChartSegment {
  color: string;
  label: string;
  value: number;
}

interface PieChartProps {
  emptyLabel: string;
  segments: PieChartSegment[];
  totalLabel?: string;
}

const formatPercentage = (value: number, total: number) => {
  if (total === 0) {
    return '0%';
  }

  return `${Math.round((value / total) * 100)}%`;
};

function PieChart({
  emptyLabel,
  segments,
  totalLabel = 'Total',
}: PieChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (total === 0) {
    return (
      <div className="dashboard-pie-layout">
        <div
          aria-label={emptyLabel}
          className="dashboard-pie-chart dashboard-pie-chart-empty"
          role="img"
        >
          <span>0 data</span>
        </div>
        <div className="dashboard-pie-legend">
          <article className="dashboard-pie-legend-item">
            <div>
              <strong>{emptyLabel}</strong>
              <p>Belum ada data yang bisa divisualisasikan.</p>
            </div>
            <span>0</span>
          </article>
        </div>
      </div>
    );
  }

  let currentAngle = 0;
  const gradientStops = segments
    .map((segment) => {
      const start = currentAngle;
      currentAngle += (segment.value / total) * 360;
      return `${segment.color} ${start}deg ${currentAngle}deg`;
    })
    .join(', ');

  const chartStyle: CSSProperties = {
    backgroundImage: `conic-gradient(${gradientStops})`,
  };

  return (
    <div className="dashboard-pie-layout">
      <div
        aria-label={emptyLabel}
        className="dashboard-pie-chart"
        role="img"
        style={chartStyle}
      >
        <div className="dashboard-pie-hole">
          <strong>{total}</strong>
          <span>{totalLabel}</span>
        </div>
      </div>

      <div className="dashboard-pie-legend">
        {segments.map((segment) => (
          <article className="dashboard-pie-legend-item" key={segment.label}>
            <div>
              <strong>
                <span
                  className="dashboard-pie-dot"
                  style={{ backgroundColor: segment.color }}
                />
                {segment.label}
              </strong>
              <p>{formatPercentage(segment.value, total)} dari total data</p>
            </div>
            <span>{segment.value}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

export default PieChart;
