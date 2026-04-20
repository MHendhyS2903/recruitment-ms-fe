import InfoPanel from '../components/dashboard/InfoPanel';
import PageHeader from '../components/dashboard/PageHeader';
import type { DashboardPageProps } from '../types/dashboard';

function ReportsPage({ dashboard }: DashboardPageProps) {
  const { summary } = dashboard;

  return (
    <>
      <PageHeader
        eyebrow="Reports Module"
        title="Recruitment Reports"
        description="Halaman laporan modular untuk rekap performa interview dan progres hiring."
      />

      <div className="content-grid">
        <InfoPanel
          title="Status Recap"
          description="Ringkasan cepat yang bisa dijadikan dasar laporan mingguan."
        >
          <div className="metric-list">
            <div className="metric-row">
              <span>On Process</span>
              <strong>{summary.process}</strong>
            </div>
            <div className="metric-row">
              <span>Failed</span>
              <strong>{summary.failed}</strong>
            </div>
            <div className="metric-row">
              <span>Reschedule</span>
              <strong>{summary.reschedule}</strong>
            </div>
          </div>
        </InfoPanel>

        <InfoPanel
          title="Export Ideas"
          description="Modul ini siap dikembangkan untuk CSV export, chart, atau integrasi API."
        >
          <div className="list-stack">
            <article className="list-card">
              <div>
                <strong>Daily Summary</strong>
                <p>Jumlah interview per hari dan PIC yang menangani.</p>
              </div>
            </article>
            <article className="list-card">
              <div>
                <strong>Failure Ratio</strong>
                <p>Persentase kandidat yang gagal dibanding total interview aktif.</p>
              </div>
            </article>
            <article className="list-card">
              <div>
                <strong>Host Utilization</strong>
                <p>Frekuensi host interview untuk pembagian beban interviewer.</p>
              </div>
            </article>
          </div>
        </InfoPanel>
      </div>
    </>
  );
}

export default ReportsPage;
