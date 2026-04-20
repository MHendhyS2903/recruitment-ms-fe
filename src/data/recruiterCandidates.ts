import type { RecruiterCandidateRecord } from '../types/recruiter';

const createDummyPhoto = (name: string, backgroundColor: string) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
      <rect width="320" height="320" rx="40" fill="${backgroundColor}" />
      <text
        x="50%"
        y="52%"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#ffffff"
        font-family="Inter, Arial, sans-serif"
        font-size="112"
        font-weight="700"
      >
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const initialRecruiterCandidates: RecruiterCandidateRecord[] = [
  {
    id: 'candidate-seeded-1',
    fullName: 'Alya Rahmania Putri',
    appliedRole: 'Frontend Engineer',
    email: 'alya.rahmania@mail.com',
    phone: '081234567801',
    source: 'LinkedIn',
    location: 'Jakarta',
    expectedSalary: 'Rp15.500.000',
    dateOfJoin: '2026-05-12',
    stage: 'READY TO INTERVIEW',
    candidatePhotoName: 'alya-rahmania-putri-avatar.svg',
    candidatePhotoUrl: createDummyPhoto('Alya Rahmania Putri', '#0f766e'),
    summary:
      'Sudah lolos screening recruiter dan tinggal dijadwalkan user interview untuk kebutuhan squad digital onboarding.',
    createdAt: '2026-04-17T01:20:00.000Z',
    documents: [
      {
        id: 'doc-seeded-1',
        category: 'CV',
        name: 'Alya-Rahmania-Putri-CV.pdf',
        sizeLabel: '418.2 KB',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-seeded-2',
        category: 'PORTOFOLIO',
        name: 'Alya-Rahmania-Frontend-Portfolio.pdf',
        sizeLabel: '1.4 MB',
        mimeType: 'application/pdf',
      },
    ],
  },
  {
    id: 'candidate-seeded-2',
    fullName: 'Nanda Prasetyo',
    appliedRole: 'Backend Engineer',
    email: 'nanda.prasetyo@mail.com',
    phone: '081234567802',
    source: 'Kalibrr',
    location: 'Bandung',
    expectedSalary: 'Rp17.000.000',
    dateOfJoin: '2026-05-19',
    stage: 'INTERVIEWING',
    candidatePhotoName: 'nanda-prasetyo-avatar.svg',
    candidatePhotoUrl: createDummyPhoto('Nanda Prasetyo', '#1d4ed8'),
    summary:
      'Sedang berjalan di tahap interview teknikal backend, feedback awal user cukup positif untuk API design dan query optimization.',
    createdAt: '2026-04-17T02:05:00.000Z',
    documents: [
      {
        id: 'doc-seeded-3',
        category: 'CV',
        name: 'Nanda-Prasetyo-CV.pdf',
        sizeLabel: '522.6 KB',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-seeded-4',
        category: 'SURAT_LAMARAN',
        name: 'Nanda-Prasetyo-Application-Letter.pdf',
        sizeLabel: '201.3 KB',
        mimeType: 'application/pdf',
      },
    ],
  },
  {
    id: 'candidate-seeded-3',
    fullName: 'Raka Aditya Saputra',
    appliedRole: 'QA Automation Engineer',
    email: 'raka.saputra@mail.com',
    phone: '081234567803',
    source: 'Referral',
    location: 'Yogyakarta',
    expectedSalary: 'Rp13.500.000',
    dateOfJoin: '2026-05-26',
    stage: 'TO DO',
    candidatePhotoName: 'raka-aditya-saputra-avatar.svg',
    candidatePhotoUrl: createDummyPhoto('Raka Aditya Saputra', '#7c3aed'),
    summary:
      'CV baru masuk pagi ini dari referral internal dan masih menunggu review awal recruiter untuk shortlist tahap berikutnya.',
    createdAt: '2026-04-17T03:10:00.000Z',
    documents: [
      {
        id: 'doc-seeded-5',
        category: 'CV',
        name: 'Raka-Aditya-Saputra-CV.pdf',
        sizeLabel: '401.7 KB',
        mimeType: 'application/pdf',
      },
    ],
  },
  {
    id: 'candidate-seeded-4',
    fullName: 'Cindy Maharani',
    appliedRole: 'UI/UX Designer',
    email: 'cindy.maharani@mail.com',
    phone: '081234567804',
    source: 'Glints',
    location: 'Surabaya',
    expectedSalary: 'Rp14.500.000',
    dateOfJoin: '2026-05-15',
    stage: 'INTERVIEWING',
    candidatePhotoName: 'cindy-maharani-avatar.svg',
    candidatePhotoUrl: createDummyPhoto('Cindy Maharani', '#db2777'),
    summary:
      'Sudah masuk sesi design interview kedua, portofolio kuat untuk dashboard internal dan produk finansial.',
    createdAt: '2026-04-17T04:00:00.000Z',
    documents: [
      {
        id: 'doc-seeded-6',
        category: 'CV',
        name: 'Cindy-Maharani-CV.pdf',
        sizeLabel: '447.6 KB',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-seeded-7',
        category: 'PORTOFOLIO',
        name: 'Cindy-Maharani-UX-Case-Study.pdf',
        sizeLabel: '2.6 MB',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-seeded-8',
        category: 'LAMPIRAN',
        name: 'Cindy-Maharani-Design-Task.zip',
        sizeLabel: '5.4 MB',
        mimeType: 'application/zip',
      },
    ],
  },
  {
    id: 'candidate-seeded-5',
    fullName: 'Farhan Prakoso',
    appliedRole: 'Data Engineer',
    email: 'farhan.prakoso@mail.com',
    phone: '081234567805',
    source: 'LinkedIn',
    location: 'Bekasi',
    expectedSalary: 'Rp18.000.000',
    dateOfJoin: '2026-05-22',
    stage: 'READY TO INTERVIEW',
    candidatePhotoName: 'farhan-prakoso-avatar.svg',
    candidatePhotoUrl: createDummyPhoto('Farhan Prakoso', '#ea580c'),
    summary:
      'Screening recruiter selesai dan kandidat tersedia untuk interview user minggu ini dengan pengalaman kuat di Airflow dan BigQuery.',
    createdAt: '2026-04-17T04:40:00.000Z',
    documents: [
      {
        id: 'doc-seeded-9',
        category: 'CV',
        name: 'Farhan-Prakoso-CV.pdf',
        sizeLabel: '486.1 KB',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-seeded-10',
        category: 'LAMPIRAN',
        name: 'Farhan-Prakoso-SQL-Test.xlsx',
        sizeLabel: '101.8 KB',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ],
  },
  {
    id: 'candidate-seeded-6',
    fullName: 'Shabrina Putri Lestari',
    appliedRole: 'Product Manager',
    email: 'shabrina.lestari@mail.com',
    phone: '081234567806',
    source: 'Kalibrr',
    location: 'Tangerang',
    expectedSalary: 'Rp19.000.000',
    dateOfJoin: '2026-06-01',
    stage: 'INTERVIEWING',
    candidatePhotoName: 'shabrina-putri-lestari-avatar.svg',
    candidatePhotoUrl: createDummyPhoto('Shabrina Putri Lestari', '#2563eb'),
    summary:
      'Saat ini sedang masuk tahap interview hiring manager untuk kebutuhan product stream retail lending.',
    createdAt: '2026-04-17T05:25:00.000Z',
    documents: [
      {
        id: 'doc-seeded-11',
        category: 'CV',
        name: 'Shabrina-Lestari-CV.pdf',
        sizeLabel: '498.9 KB',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-seeded-12',
        category: 'SURAT_LAMARAN',
        name: 'Shabrina-Lestari-Intro-Letter.pdf',
        sizeLabel: '214.7 KB',
        mimeType: 'application/pdf',
      },
    ],
  },
  {
    id: 'candidate-seeded-7',
    fullName: 'Dito Akbar Nugroho',
    appliedRole: 'Business Analyst',
    email: 'dito.nugroho@mail.com',
    phone: '081234567807',
    source: 'Jobstreet',
    location: 'Depok',
    expectedSalary: 'Rp12.000.000',
    dateOfJoin: '2026-05-18',
    stage: 'TO DO',
    candidatePhotoName: 'dito-akbar-nugroho-avatar.svg',
    candidatePhotoUrl: createDummyPhoto('Dito Akbar Nugroho', '#059669'),
    summary:
      'Baru submit semalam dan belum masuk proses review recruiter, cocok masuk daftar kerja hari ini.',
    createdAt: '2026-04-17T06:10:00.000Z',
    documents: [
      {
        id: 'doc-seeded-13',
        category: 'CV',
        name: 'Dito-Akbar-Nugroho-CV.pdf',
        sizeLabel: '392.4 KB',
        mimeType: 'application/pdf',
      },
    ],
  },
  {
    id: 'candidate-seeded-8',
    fullName: 'Meisya Larasati',
    appliedRole: 'Mobile Developer',
    email: 'meisya.larasati@mail.com',
    phone: '081234567808',
    source: 'Referral',
    location: 'Bogor',
    expectedSalary: 'Rp15.000.000',
    dateOfJoin: '2026-05-25',
    stage: 'READY TO INTERVIEW',
    candidatePhotoName: 'meisya-larasati-avatar.svg',
    candidatePhotoUrl: createDummyPhoto('Meisya Larasati', '#d97706'),
    summary:
      'Sudah lolos review awal dan recruiter sedang menunggu slot interview dari user mobile team.',
    createdAt: '2026-04-17T07:05:00.000Z',
    documents: [
      {
        id: 'doc-seeded-14',
        category: 'CV',
        name: 'Meisya-Larasati-CV.pdf',
        sizeLabel: '432.1 KB',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-seeded-15',
        category: 'PORTOFOLIO',
        name: 'Meisya-Larasati-Mobile-Portfolio.pdf',
        sizeLabel: '1.8 MB',
        mimeType: 'application/pdf',
      },
    ],
  },
  {
    id: 'candidate-seeded-9',
    fullName: 'Kevin Yoga Pratama',
    appliedRole: 'DevOps Engineer',
    email: 'kevin.pratama@mail.com',
    phone: '081234567809',
    source: 'LinkedIn',
    location: 'Semarang',
    expectedSalary: 'Rp18.500.000',
    dateOfJoin: '2026-06-08',
    stage: 'TO DO',
    candidatePhotoName: 'kevin-yoga-pratama-avatar.svg',
    candidatePhotoUrl: createDummyPhoto('Kevin Yoga Pratama', '#0891b2'),
    summary:
      'Kandidat baru masuk untuk kebutuhan platform engineering dan masih menunggu screening awal recruiter.',
    createdAt: '2026-04-17T07:40:00.000Z',
    documents: [
      {
        id: 'doc-seeded-16',
        category: 'CV',
        name: 'Kevin-Yoga-Pratama-CV.pdf',
        sizeLabel: '463.8 KB',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-seeded-17',
        category: 'LAMPIRAN',
        name: 'Kevin-Yoga-Pratama-Certifications.pdf',
        sizeLabel: '780.2 KB',
        mimeType: 'application/pdf',
      },
    ],
  },
  {
    id: 'candidate-seeded-10',
    fullName: 'Nabila Salsabila',
    appliedRole: 'Project Manager',
    email: 'nabila.salsabila@mail.com',
    phone: '081234567810',
    source: 'Glints',
    location: 'Jakarta',
    expectedSalary: 'Rp16.800.000',
    dateOfJoin: '2026-05-20',
    stage: 'INTERVIEWING',
    candidatePhotoName: 'nabila-salsabila-avatar.svg',
    candidatePhotoUrl: createDummyPhoto('Nabila Salsabila', '#9333ea'),
    summary:
      'Sedang menunggu final feedback setelah sesi stakeholder interview untuk kebutuhan PM internal apps.',
    createdAt: '2026-04-17T08:20:00.000Z',
    documents: [
      {
        id: 'doc-seeded-18',
        category: 'CV',
        name: 'Nabila-Salsabila-CV.pdf',
        sizeLabel: '489.4 KB',
        mimeType: 'application/pdf',
      },
      {
        id: 'doc-seeded-19',
        category: 'PORTOFOLIO',
        name: 'Nabila-Salsabila-Project-Highlights.pdf',
        sizeLabel: '1.1 MB',
        mimeType: 'application/pdf',
      },
    ],
  },
];
