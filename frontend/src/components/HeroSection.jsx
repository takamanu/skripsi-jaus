import PancreasBackground from './PancreasBackground'

export default function HeroSection() {
  return (
    <section id="hero" className="hero-stage">
      {/* 3D Pancreas Ambient Background (Centered on the right, rotates smoothly on scroll) */}
      <PancreasBackground />

      <div className="hero">
        <div className="hero__content">
          <span className="hero__research-tag">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="5" cy="5" r="1.5" fill="currentColor" />
            </svg>
            Skripsi &middot; Program Studi Teknik Informatika
          </span>

          <h1 className="hero__title">
            Analisis Performa{' '}
            <em>Stacking Ensemble</em>{' '}
            untuk Klasifikasi Penyakit Diabetes
          </h1>

          <p className="hero__subtitle">
            Studi komparatif Random Forest dan XGBoost dengan teknik
            resampling SMOTE dan SMOTE-Tomek pada dataset Pima Indians Diabetes.
            Prediksi risiko berbasis 8 parameter klinis pasien.
          </p>

          <div className="hero__actions">
            <a href="#prediksi" className="btn btn--primary">
              Coba Prediksi
            </a>
            <a href="#model" className="btn btn--secondary">
              Lihat Perbandingan Model
            </a>
          </div>

          <p className="hero__footnote" style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, marginTop: 4 }}>
            Dataset: Pima Indians Diabetes (768 data pasien, NIDDK) &middot; Model: Stacking Ensemble RF &times; XGBoost
          </p>
        </div>
      </div>
    </section>
  )
}
