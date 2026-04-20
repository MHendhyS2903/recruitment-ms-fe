import InfoPanel from '../components/dashboard/InfoPanel';
import PageHeader from '../components/dashboard/PageHeader';

function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Settings Module"
        title="Dashboard Settings"
        description="Halaman modular untuk pengaturan tampilan, integrasi, atau preferensi workflow."
      />

      <div className="content-grid">
        <InfoPanel
          title="Konfigurasi Selanjutnya"
          description="Contoh area yang bisa Anda aktifkan setelah project ini berkembang."
        >
          <div className="list-stack">
            <article className="list-card">
              <div>
                <strong>Theme dan Branding</strong>
                <p>Atur warna, logo, dan label sesuai unit kerja.</p>
              </div>
            </article>
            <article className="list-card">
              <div>
                <strong>User Roles</strong>
                <p>Bedakan hak akses admin HR, user interviewer, dan viewer.</p>
              </div>
            </article>
            <article className="list-card">
              <div>
                <strong>Storage</strong>
                <p>Hubungkan data ke API backend atau simpan ke localStorage.</p>
              </div>
            </article>
          </div>
        </InfoPanel>

        <InfoPanel
          title="Status"
          description="Saat ini modul settings masih berupa placeholder terstruktur."
        >
          <div className="empty-block">
            <strong>Ready for extension</strong>
            <p>Komponen page sudah dipisah sehingga mudah dikembangkan per menu.</p>
          </div>
        </InfoPanel>
      </div>
    </>
  );
}

export default SettingsPage;
