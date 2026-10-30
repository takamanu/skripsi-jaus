const PIPELINE_STEPS = [
  {
    number: '01',
    title: 'Preprocessing & Imputasi',
    desc: 'Nilai 0 tidak fisiologis pada Glucose, BloodPressure, SkinThickness, Insulin, BMI diganti NaN, lalu diimputasi dengan MICE (IterativeImputer).',
  },
  {
    number: '02',
    title: 'Deteksi Outlier (LOF)',
    desc: 'Local Outlier Factor dengan n_neighbors=10 diterapkan pada seluruh kolom. Data yang terkategori outlier dibuang dari dataset (768 → 743 baris).',
  },
  {
    number: '03',
    title: 'Resampling Kelas',
    desc: 'Tiga skenario: tanpa resampling, SMOTE (oversampling sintetis), dan SMOTE-Tomek (hybrid) diterapkan pada data latih untuk menangani ketidakseimbangan kelas.',
  },
  {
    number: '04',
    title: 'Stacking Ensemble',
    desc: 'Random Forest dan XGBoost sebagai base learner, Logistic Regression sebagai meta-model (cv=5). Model terbaik dipilih berdasarkan akurasi pada test set.',
  },
]

const DATASET_STATS = [
  { value: '768',  label: 'Total data pasien' },
  { value: '743',  label: 'Setelah buang outlier' },
  { value: '8',    label: 'Fitur input klinis' },
  { value: '2',    label: 'Kelas output (0/1)' },
]

const FEATURES = [
  { name: 'Pregnancies',              range: '0 - 17',    unit: 'kali' },
  { name: 'Glucose',                  range: '44 - 199',  unit: 'mg/dL' },
  { name: 'BloodPressure',            range: '24 - 122',  unit: 'mmHg' },
  { name: 'SkinThickness',            range: '7 - 99',    unit: 'mm' },
  { name: 'Insulin',                  range: '14 - 846',  unit: 'mu U/mL' },
  { name: 'BMI',                      range: '18 - 67',   unit: 'kg/m²' },
  { name: 'DiabetesPedigreeFunction', range: '0.08 - 2.42', unit: '' },
  { name: 'Age',                      range: '21 - 81',   unit: 'tahun' },
]

export default function MethodologySection() {
  return (
    <section id="metodologi" className="section section--alt">
      <div className="container">
        <span className="section__label">Metodologi</span>
        <h2 className="section__heading">Pipeline Penelitian</h2>
        <p className="section__desc">
          Alur pemrosesan data dan pelatihan model mengikuti konfigurasi yang diadaptasi
          dari notebook riset asli (Google Colab) dengan perbaikan metodologis pada
          evaluasi model.
        </p>

        {/* Pipeline steps */}
        <div className="method-pipeline">
          {PIPELINE_STEPS.map((step) => (
            <div className="method-step" key={step.number}>
              <p className="method-step__number">{step.number}</p>
              <p className="method-step__title">{step.title}</p>
              <p className="method-step__desc">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Dataset stats */}
        <div style={{ marginTop: 64 }}>
          <h3 style={{ marginBottom: 20, fontSize: '1.1rem' }}>Dataset: Pima Indians Diabetes</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginBottom: 24, maxWidth: 580 }}>
            Dataset publik dari National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK).
            Seluruh pasien adalah perempuan keturunan Pima Indian, berusia minimal 21 tahun.
          </p>

          <div className="dataset-stats">
            {DATASET_STATS.map((stat) => (
              <div className="dataset-stat" key={stat.label}>
                <p className="dataset-stat__value">{stat.value}</p>
                <p className="dataset-stat__label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature table */}
        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 16, color: 'var(--ink)' }}>Fitur Input</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-strong)' }}>
                  <th style={thStyle}>Nama Fitur</th>
                  <th style={thStyle}>Rentang Nilai</th>
                  <th style={thStyle}>Satuan</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => (
                  <tr
                    key={f.name}
                    style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-off)', borderBottom: '1px solid var(--border)' }}
                  >
                    <td style={tdStyle}>
                      <code style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--navy)' }}>{f.name}</code>
                    </td>
                    <td style={tdStyle}>{f.range}</td>
                    <td style={{ ...tdStyle, color: 'var(--ink-faint)' }}>{f.unit || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Evaluation note */}
        <div style={{
          marginTop: 40,
          padding: '20px 24px',
          border: '1px solid var(--navy-muted)',
          borderLeft: '3px solid var(--navy)',
          borderRadius: `0 var(--radius-sm) var(--radius-sm) 0`,
          background: 'var(--navy-faint)',
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
            Catatan Metodologis
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', lineHeight: 1.7 }}>
            Notebook asli memanggil train_test_split tiga kali secara terpisah, dan varian SMOTE/SMOTE-Tomek
            melakukan split setelah resampling, sehingga test set mengandung data sintetis. Angka akurasi yang
            ditampilkan mereplikasi notebook asli; angka Honest Holdout pada seksi Perbandingan Model
            merupakan estimasi performa yang lebih representatif pada pasien nyata.
          </p>
        </div>
      </div>
    </section>
  )
}

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.8rem',
  color: 'var(--ink-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const tdStyle = {
  padding: '10px 14px',
  color: 'var(--ink)',
}
