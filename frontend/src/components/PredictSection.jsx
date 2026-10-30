import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'

const FIELDS = [
  { name: 'Pregnancies', label: 'Jumlah Kehamilan', placeholder: 'cth. 2', hint: 'Bilangan bulat' },
  { name: 'Glucose', label: 'Glukosa (mg/dL)', placeholder: 'cth. 120', hint: '0 - 300' },
  { name: 'BloodPressure', label: 'Tekanan Darah (mmHg)', placeholder: 'cth. 70', hint: 'Diastolic' },
  { name: 'SkinThickness', label: 'Ketebalan Kulit Triceps (mm)', placeholder: 'cth. 20', hint: '0 - 100' },
  { name: 'Insulin', label: 'Insulin (mu U/mL)', placeholder: 'cth. 79', hint: '0 - 850' },
  { name: 'BMI', label: 'BMI (kg/m²)', placeholder: 'cth. 25.5', hint: 'Berat / Tinggi²' },
  { name: 'DiabetesPedigreeFunction', label: 'Diabetes Pedigree Function', placeholder: 'cth. 0.47', hint: 'Riwayat keluarga (0-2.5)' },
  { name: 'Age', label: 'Usia (tahun)', placeholder: 'cth. 33', hint: 'Tahun' },
]

const emptyForm = Object.fromEntries(FIELDS.map((f) => [f.name, '']))

export default function PredictSection() {
  const [form, setForm] = useState(emptyForm)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [waking, setWaking] = useState(false)

  const handleChange = (name, val) =>
    setForm((prev) => ({ ...prev, [name]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    setWaking(false)

    // Show "waking up" banner after 4s if still loading (Render cold start)
    const wakingTimer = setTimeout(() => setWaking(true), 4000)

    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      clearTimeout(wakingTimer)
      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan saat memproses data.')
        return
      }
      setResult(data)
    } catch {
      clearTimeout(wakingTimer)
      setError('Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.')
    } finally {
      setLoading(false)
      setWaking(false)
    }
  }

  const handleReset = () => {
    setForm(emptyForm)
    setResult(null)
    setError(null)
    setWaking(false)
  }

  return (
    <section id="prediksi" className="section section--alt">
      <div className="container">
        <span className="section__label">Analisis Risiko</span>
        <h2 className="section__heading">Prediksi Risiko Diabetes</h2>
        <p className="section__desc">
          Masukkan data klinis pasien. Model yang digunakan adalah{' '}
          Stacking Ensemble terbaik berdasarkan evaluasi pada dataset Pima Indians.
        </p>

        <div className="predict__layout">
          {/* Form */}
          <div className="card" style={{ padding: '28px' }}>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form__grid">
                {FIELDS.map((field) => (
                  <div className="form__field" key={field.name}>
                    <label className="form__label" htmlFor={`field-${field.name}`}>
                      {field.label}
                    </label>
                    <input
                      id={`field-${field.name}`}
                      className="form__input"
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      aria-describedby={`hint-${field.name}`}
                    />
                    <span id={`hint-${field.name}`} className="form__hint">
                      {field.hint}
                    </span>
                  </div>
                ))}
              </div>

              {error && (
                <div
                  role="alert"
                  style={{
                    marginTop: 16,
                    padding: '10px 14px',
                    background: '#fff5f5',
                    border: '1px solid #fca5a5',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    color: '#b91c1c',
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="spinner" />
                      Menganalisis...
                    </span>
                  ) : 'Analisis Data'}
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Result panel */}
          <div>
            {waking && !result && (
              <div className="waking-banner" role="status" aria-live="polite">
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Server sedang aktif kembali (perlu ~50 detik). Mohon tunggu sebentar.
              </div>
            )}

            {!result && !loading && !error && (
              <div className="card">
                <div className="state-panel">
                  <div className="state-panel__icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 4v4M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="state-panel__title">Isi form untuk memulai</p>
                  <p className="state-panel__desc">
                    Lengkapi 8 parameter klinis di sebelah kiri, lalu klik Analisis Data.
                  </p>
                </div>
              </div>
            )}

            {loading && !result && (
              <div className="card">
                <div className="state-panel" role="status" aria-live="polite">
                  <div className="spinner" style={{ width: 32, height: 32 }} aria-hidden="true" />
                  <p className="state-panel__title">Memproses data</p>
                  <p className="state-panel__desc">Model sedang menganalisis parameter klinis yang Anda masukkan.</p>
                </div>
              </div>
            )}

            {result && (
              <ResultPanel result={result} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function ResultPanel({ result }) {
  const isPositive = result.prediction === 1
  const pDiab = result.probability_diabetes
  const pNone = result.probability_no_diabetes

  const methodLabel = {
    stacking: 'Stacking Ensemble (tanpa resampling)',
    stacking_smote: 'Stacking + SMOTE',
    stacking_smotetomek: 'Stacking + SMOTE-Tomek',
  }[result.model_used] ?? result.model_used

  return (
    <div className={`result${isPositive ? ' result--positive' : ' result--negative'}`} role="region" aria-label="Hasil prediksi">
      <p className="result__label-tag">Hasil Analisis</p>

      <p className="result__verdict">
        {result.label}
      </p>

      <p className="result__prob">
        Tingkat kepercayaan model: <strong>{(Math.max(pDiab, pNone) * 100).toFixed(1)}%</strong>
      </p>

      <div className="prob-bars" aria-label="Distribusi probabilitas">
        <ProbBar label="Diabetes" value={pDiab} type="positive" />
        <ProbBar label="Tidak Diabetes" value={pNone} type="negative" />
      </div>

      <p className="result__model-tag">
        Model: {methodLabel}
      </p>

      <p className="result__disclaimer">
        Hasil ini adalah estimasi berbasis machine learning dan <strong>bukan pengganti
          diagnosis medis profesional</strong>. Konsultasikan dengan dokter untuk
        interpretasi klinis.
      </p>
    </div>
  )
}

function ProbBar({ label, value, type }) {
  return (
    <div className="prob-bar__row">
      <span className="prob-bar__label">{label}</span>
      <div className="prob-bar__track" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`Probabilitas ${label}`}>
        <div
          className={`prob-bar__fill prob-bar__fill--${type}`}
          style={{ width: `${(value * 100).toFixed(1)}%` }}
        />
      </div>
      <span className="prob-bar__pct">{(value * 100).toFixed(1)}%</span>
    </div>
  )
}

