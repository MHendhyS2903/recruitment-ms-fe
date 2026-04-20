import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchRecruiterCandidates, fetchSalesCandidates } from '../api/recruitmentApi';
import LoadingProgress from '../components/common/LoadingProgress';
import PieChart, { type PieChartSegment } from '../components/common/PieChart';
import InfoPanel from '../components/dashboard/InfoPanel';
import PageHeader from '../components/dashboard/PageHeader';
import SummaryCard from '../components/dashboard/SummaryCard';
import type { DashboardPageProps } from '../types/dashboard';
import { withDevMinimumLoadingDuration } from '../utils/devLoadingDelay';
import { readRecruiterCandidates } from '../utils/recruiterStorage';
import { readSalesCandidates } from '../utils/salesStorage';

function DashboardPage({ dashboard }: DashboardPageProps) {
  const { filteredInterviews, summary, loading: interviewsLoading } = dashboard;
  const [recruiterCandidates, setRecruiterCandidates] = useState(() =>
    readRecruiterCandidates()
  );
  const [salesCandidates, setSalesCandidates] = useState(() => readSalesCandidates());
  const [candidatesLoading, setCandidatesLoading] = useState(true);

  const loadCandidateStats = useCallback(async () => {
    return withDevMinimumLoadingDuration(
      Promise.all([
        fetchRecruiterCandidates('all'),
        fetchSalesCandidates('all'),
      ]).then(([recruiterResponse, salesResponse]) => ({
        recruiterItems: recruiterResponse.items,
        salesItems: salesResponse.items,
      }))
    );
  }, []);

  useEffect(() => {
    let isActive = true;

    setCandidatesLoading(true);

    void loadCandidateStats()
      .then(({ recruiterItems, salesItems }) => {
        if (!isActive) {
          return;
        }

        setRecruiterCandidates(recruiterItems);
        setSalesCandidates(salesItems);
      })
      .catch(() => {
        // Gunakan cache localStorage sebagai fallback sementara bila API belum siap.
      })
      .finally(() => {
        if (isActive) {
          setCandidatesLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [loadCandidateStats]);

  const upcomingCandidates = useMemo(() => filteredInterviews.slice(0, 5), [filteredInterviews]);

  const recruiterStats = useMemo(() => {
    const todoCount = recruiterCandidates.filter((candidate) => candidate.stage === 'TO DO').length;

    return {
      todoCount,
      processedCount: recruiterCandidates.length - todoCount,
    };
  }, [recruiterCandidates]);

  const salesStats = useMemo(
    () => ({
      todoCount: salesCandidates.filter((candidate) => candidate.stage === 'TO DO').length,
      interviewingCount: salesCandidates.filter((candidate) => candidate.stage === 'INTERVIEWING')
        .length,
    }),
    [salesCandidates]
  );

  const candidateStatusStats = useMemo(
    () =>
      filteredInterviews.reduce(
        (accumulator, item) => {
          if (item.candidateStatus === 'INTERVIEW') {
            accumulator.interview += 1;
          } else if (item.candidateStatus === 'BACKOUT') {
            accumulator.backout += 1;
          } else if (item.candidateStatus === 'RESCHEDULE') {
            accumulator.reschedule += 1;
          }

          return accumulator;
        },
        { interview: 0, backout: 0, reschedule: 0 }
      ),
    [filteredInterviews]
  );

  const interviewStatusSegments: PieChartSegment[] = useMemo(
    () => [
      {
        label: 'On Process',
        value: summary.process,
        color: '#0f766e',
      },
      {
        label: 'Failed',
        value: summary.failed,
        color: '#dc2626',
      },
    ],
    [summary.failed, summary.process]
  );

  const candidateStatusSegments: PieChartSegment[] = useMemo(
    () => [
      {
        label: 'Interview',
        value: candidateStatusStats.interview,
        color: '#2563eb',
      },
      {
        label: 'Backout',
        value: candidateStatusStats.backout,
        color: '#f59e0b',
      },
      {
        label: 'Reschedule',
        value: candidateStatusStats.reschedule,
        color: '#8b5cf6',
      },
    ],
    [candidateStatusStats]
  );

  const recruiterTodoSegments: PieChartSegment[] = useMemo(
    () => [
      {
        label: 'Belum Diproses (TO DO)',
        value: recruiterStats.todoCount,
        color: '#f59e0b',
      },
      {
        label: 'Sudah Diproses',
        value: recruiterStats.processedCount,
        color: '#0f766e',
      },
    ],
    [recruiterStats]
  );

  const salesFlowSegments: PieChartSegment[] = useMemo(
    () => [
      {
        label: 'Sales To Do',
        value: salesStats.todoCount,
        color: '#0ea5e9',
      },
      {
        label: 'Sales Interviewing',
        value: salesStats.interviewingCount,
        color: '#14b8a6',
      },
    ],
    [salesStats]
  );

  const dashboardLoading = interviewsLoading || candidatesLoading;
  const dashboardLoadingLabel =
    interviewsLoading && candidatesLoading
      ? 'Memuat data interview dan ringkasan kandidat...'
      : interviewsLoading
        ? 'Memuat data interview...'
        : 'Memuat ringkasan kandidat recruiter & sales...';

  return (
    <>
      {dashboardLoading ? <LoadingProgress label={dashboardLoadingLabel} /> : null}

      <PageHeader
        eyebrow="Dashboard Rekrutmen"
        title="Tracking Dashboard"
        description="Pantau statistik proses rekrutmen, status interview, dan kandidat yang masih perlu diproses dalam satu tampilan."
      />

      <section className="summary-grid">
        <SummaryCard
          className="summary-card-horizontal"
          label="Total Data"
          value={summary.total}
          description="Baris yang tampil setelah filter"
        />
        <SummaryCard
          className="summary-card-horizontal"
          label="On Process"
          value={summary.process}
          description="Interview masih berjalan"
        />
        <SummaryCard
          className="summary-card-horizontal"
          label="Failed"
          value={summary.failed}
          description="Perlu evaluasi ulang kandidat"
        />
        <SummaryCard
          className="summary-card-horizontal"
          label="Reschedule"
          value={summary.reschedule}
          description="Butuh penjadwalan ulang"
        />
      </section>

      <div className="content-grid">
        <div className="content-grid-full-span">
          <InfoPanel
            title="Prioritas Hari Ini"
            description="Kandidat terdekat berdasarkan hasil filter yang aktif."
          >
            <div className="list-stack priority-today-list">
              {upcomingCandidates.map((item) => (
                <article className="list-card" key={item.id}>
                  <div>
                    <strong>{item.candidateName}</strong>
                    <p>{item.role}</p>
                  </div>
                  <span className="owner-pill">{item.owner}</span>
                </article>
              ))}
            </div>
          </InfoPanel>
        </div>
      </div>

      <div className="content-grid">
        <InfoPanel
          title="Statistik Status Interview"
          description="Distribusi kandidat berdasarkan hasil proses interview yang sedang berjalan."
        >
          <PieChart emptyLabel="Belum ada data status interview" segments={interviewStatusSegments} />
        </InfoPanel>

        <InfoPanel
          title="Statistik Status Kandidat"
          description="Komposisi kandidat aktif berdasarkan tahapan candidate status saat ini."
        >
          <PieChart emptyLabel="Belum ada data status kandidat" segments={candidateStatusSegments} />
        </InfoPanel>
      </div>

      <div className="content-grid">
        <InfoPanel
          title="Statistik Kandidat Recruiter"
          description="Pantau jumlah kandidat yang masih berada di antrean TO DO dan yang sudah masuk proses."
        >
          <PieChart emptyLabel="Belum ada data recruiter" segments={recruiterTodoSegments} />
        </InfoPanel>

        <InfoPanel
          title="Statistik Kandidat Sales"
          description="Pantau jumlah kandidat hasil handoff recruiter yang masih TO DO atau sudah masuk tahap interviewing."
        >
          <PieChart emptyLabel="Belum ada data sales" segments={salesFlowSegments} />
        </InfoPanel>
      </div>
    </>
  );
}

export default DashboardPage;
