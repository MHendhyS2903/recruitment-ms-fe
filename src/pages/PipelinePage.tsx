import InfoPanel from '../components/dashboard/InfoPanel';
import PageHeader from '../components/dashboard/PageHeader';
import type { PipelinePageProps } from '../types/dashboard';

function PipelinePage({ dashboard }: PipelinePageProps) {
  const { summary } = dashboard;

  return (
    <>
      <PageHeader
        eyebrow="Pipeline Module"
        title="Candidate Pipeline"
        description="Halaman modular untuk memantau distribusi kandidat berdasarkan status proses."
      />

      <section className="summary-grid summary-grid-compact">
        <article className="summary-card">
          <span>Interview</span>
          <strong>{summary.total - summary.reschedule}</strong>
          <small>Kandidat aktif pada tahap interview</small>
        </article>
        <article className="summary-card">
          <span>Reschedule</span>
          <strong>{summary.reschedule}</strong>
          <small>Kandidat menunggu jadwal baru</small>
        </article>
      </section>

      <InfoPanel
        title="Pipeline Notes"
        description="Anda bisa mengembangkan halaman ini menjadi Kanban, funnel, atau approval workflow."
      >
        <div className="list-stack">
          <article className="list-card">
            <div>
              <strong>Screening</strong>
              <p>Kandidat yang baru masuk dan belum dijadwalkan interview.</p>
            </div>
          </article>
          <article className="list-card">
            <div>
              <strong>Interview</strong>
              <p>Kandidat yang sedang dijadwalkan atau sedang dievaluasi user.</p>
            </div>
          </article>
          <article className="list-card">
            <div>
              <strong>Decision</strong>
              <p>Kandidat dengan hasil final seperti pass, failed, atau hold.</p>
            </div>
          </article>
        </div>
      </InfoPanel>
    </>
  );
}

export default PipelinePage;
