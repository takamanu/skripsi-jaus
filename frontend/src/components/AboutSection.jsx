export default function AboutSection() {
  return (
    <section id="about" className="section section--alt">
      <div className="container">
        <span className="section__label">Tentang Skripsi</span>
        <h2 className="section__heading">Ringkasan Riset &amp; Profil Akademik</h2>
        <p className="section__desc">
          Dokumentasi ringkas penelitian tugas akhir teknik informatika mengenai klasifikasi
          risiko penyakit diabetes berbasis ensemble machine learning.
        </p>

        <div className="about-grid">
          {/* Card 1: Ringkasan Riset */}
          <div className="card about-card">
            <div className="about-card__header">
              <span className="about-tag">Ringkasan Penelitian</span>
              <h3 className="about-card__title">
                Analisis Performa Stacking Ensemble RF &amp; XGBoost dengan SMOTE dan SMOTE-Tomek
              </h3>
            </div>

            {/* Quick Metrics Bar */}
            <div className="about-metrics">
              <div className="about-metric">
                <span className="about-metric__value">87.42%</span>
                <span className="about-metric__label">Akurasi Terbaik (SMOTE-Tomek)</span>
              </div>
              <div className="about-metric">
                <span className="about-metric__value">77.85%</span>
                <span className="about-metric__label">Honest Holdout (Pasien Asli)</span>
              </div>
              <div className="about-metric">
                <span className="about-metric__value">768</span>
                <span className="about-metric__label">Dataset Pasien (NIDDK)</span>
              </div>
            </div>

            <div className="about-summary">
              <div className="about-summary__item">
                <span className="about-summary__bullet" aria-hidden="true" />
                <p>
                  <strong>Latar Belakang &amp; Masalah:</strong> Deteksi dini diabetes seringkali
                  terkendala ketidakseimbangan kelas (*imbalanced data*), di mana jumlah pasien non-diabetes
                  jauh lebih mendominasi dibandingkan pasien positif diabetes.
                </p>
              </div>

              <div className="about-summary__item">
                <span className="about-summary__bullet" aria-hidden="true" />
                <p>
                  <strong>Metodologi Ensembling:</strong> Memanfaatkan arsitektur <em>Stacking Ensemble</em> yang
                  mengintegrasikan Random Forest (bagging) dan XGBoost (gradient boosting) sebagai <em>base models</em>,
                  serta Logistic Regression sebagai <em>meta-model</em> pengambil keputusan.
                </p>
              </div>

              <div className="about-summary__item">
                <span className="about-summary__bullet" aria-hidden="true" />
                <p>
                  <strong>Eksperimen Resampling:</strong> Membandingkan performa model dasar tanpa penanganan data,
                  oversampling sintetis SMOTE, dan teknik hybrid SMOTE-Tomek Links untuk membersihkan data tumpang-tindih.
                </p>
              </div>

              <div className="about-summary__item">
                <span className="about-summary__bullet" aria-hidden="true" />
                <p>
                  <strong>Kesimpulan Temuan:</strong> Model Stacking dengan SMOTE-Tomek mencatatkan akurasi tertinggi
                  sebesar <strong>87.42%</strong> dan recall <strong>89.61%</strong>, membuktikan efektivitas
                  penghapusan Tomek Links dalam mempertajam batas klasifikasi klinis.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Profil Peneliti & Pembimbing */}
          <div className="card about-card">
            <div className="about-card__header">
              <span className="about-tag">Profil Peneliti</span>
              <h3 className="about-card__title">
                Identitas Peneliti &amp; Pembimbing
              </h3>
            </div>

            <div className="profile-list">
              <div className="profile-row">
                <div className="profile-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="profile-content">
                  <span className="profile-label">Nama Peneliti</span>
                  <strong className="profile-value">Jausyaq Tsaqifudin</strong>
                </div>
              </div>

              <div className="profile-row">
                <div className="profile-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div className="profile-content">
                  <span className="profile-label">Nomor Induk Mahasiswa (NIM)</span>
                  <strong className="profile-value">461142</strong>
                </div>
              </div>

              <div className="profile-row">
                <div className="profile-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="profile-content">
                  <span className="profile-label">Email Kontak</span>
                  <strong className="profile-value">jausyaq@student.unnes.ac.id</strong>
                </div>
              </div>

              <div className="profile-row">
                <div className="profile-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div className="profile-content">
                  <span className="profile-label">Dosen Pembimbing</span>
                  <strong className="profile-value">Dosen Pembimbing Skripsi, S.Kom., M.Kom.</strong>
                </div>
              </div>

              <div className="profile-row">
                <div className="profile-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className="profile-content">
                  <span className="profile-label">Program Studi &amp; Institusi</span>
                  <strong className="profile-value">S1 Teknik Informatika</strong>
                </div>
              </div>
            </div>

            <div className="profile-footnote">
              <span className="profile-badge">Tugas Akhir / Skripsi</span>
              <span>Penelitian Mandiri Bidang Data Science &amp; Health Informatics</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
