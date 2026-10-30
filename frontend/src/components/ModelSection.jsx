import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'

const MODEL_META = {
  stacking: {
    name: 'Stacking Ensemble',
    subname: 'Random Forest × XGBoost',
    desc: 'Base model RF dan XGB digabung via stacking dengan Logistic Regression sebagai meta-model, tanpa penanganan ketidakseimbangan kelas.',
  },
  stacking_smote: {
    name: 'Stacking + SMOTE',
    subname: 'Oversampling sintetis',
    desc: 'Data latih diseimbangkan dengan SMOTE (oversampling kelas minoritas secara sintetis) sebelum dilatih dengan Stacking Ensemble.',
  },
  stacking_smotetomek: {
    name: 'Stacking + SMOTE-Tomek',
    subname: 'Hybrid resampling',
    desc: 'SMOTE dikombinasikan dengan Tomek Links untuk pembersihan batas keputusan, menghasilkan distribusi latih yang lebih bersih.',
  },
}

const METRIC_LABELS = {
  accuracy:  'Akurasi',
  precision: 'Presisi',
  recall:    'Recall',
  f1_score:  'F1 Score',
}

const MODEL_ORDER = ['stacking', 'stacking_smote', 'stacking_smotetomek']

export default function ModelSection() {
  const [data, setData]     = useState(null)
  const [error, setError]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`${API_URL}/api/model-info`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setData(d); setLoading(false) } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  return (
    <section id="model" className="section">
      <div className="container">
        <span className="section__label">Evaluasi</span>
        <h2 className="section__heading">Perbandingan Ketiga Model</h2>
        <p className="section__desc">
          Tiga varian Stacking Ensemble dilatih dan dievaluasi pada konfigurasi berbeda.
          Model dengan akurasi tertinggi digunakan untuk prediksi.
        </p>

        {loading && (
          <div className="state-panel" role="status" aria-live="polite">
            <div className="spinner" style={{ width: 32, height: 32 }} aria-hidden="true" />
            <p className="state-panel__title">Memuat data model</p>
          </div>
        )}

        {error && (
          <div className="state-panel" role="alert">
            <div className="state-panel__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 5v4M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="state-panel__title">Data tidak dapat dimuat</p>
            <p className="state-panel__desc">Pastikan backend Flask sedang berjalan di port 5002.</p>
          </div>
        )}

        {data && (
          <>
            <div className="model-grid">
              {MODEL_ORDER.map((key) => {
                const metrics = data.results?.[key]
                const meta    = MODEL_META[key]
                const isBest  = data.best_method === key
                if (!metrics) return null
                return (
                  <ModelCard
                    key={key}
                    meta={meta}
                    metrics={metrics}
                    isBest={isBest}
                  />
                )
              })}
            </div>

            {data.honest_holdout && (
              <HonestHoldout holdout={data.honest_holdout} />
            )}
          </>
        )}
      </div>
    </section>
  )
}

function ModelCard({ meta, metrics, isBest }) {
  return (
    <article className={`model-card${isBest ? ' model-card--best' : ''}`}>
      {isBest && <span className="model-card__best-flag">Model Terpilih</span>}

      <p className="model-card__name">{meta.name}</p>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>
        {meta.subname}
      </p>
      <p className="model-card__desc">{meta.desc}</p>

      <div className="metric-row">
        {Object.entries(METRIC_LABELS).map(([key, label]) => {
          const val = metrics[key] ?? 0
          return (
            <div className="metric-item" key={key}>
              <div className="metric-item__header">
                <span className="metric-item__name">{label}</span>
                <span className="metric-item__value">{(val * 100).toFixed(1)}%</span>
              </div>
              <div className="metric-item__bar" role="progressbar" aria-valuenow={Math.round(val * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
                <div
                  className={`metric-item__fill${!isBest ? ' metric-item__fill--muted' : ''}`}
                  style={{ width: `${(val * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {metrics.confusion_matrix && (
        <ConfusionMatrix cm={metrics.confusion_matrix} />
      )}
    </article>
  )
}

function ConfusionMatrix({ cm }) {
  const [[tn, fp], [fn, tp]] = cm
  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 6 }}>
        Confusion Matrix
      </p>
      <div className="cm-grid" role="table" aria-label="Confusion matrix">
        <div className="cm-cell cm-cell--tn" role="cell">
          {tn}
          <span className="cm-cell__sub">TN</span>
        </div>
        <div className="cm-cell cm-cell--fp" role="cell">
          {fp}
          <span className="cm-cell__sub">FP</span>
        </div>
        <div className="cm-cell cm-cell--fn" role="cell">
          {fn}
          <span className="cm-cell__sub">FN</span>
        </div>
        <div className="cm-cell cm-cell--tp" role="cell">
          {tp}
          <span className="cm-cell__sub">TP</span>
        </div>
      </div>
    </div>
  )
}

function HonestHoldout({ holdout }) {
  return (
    <div style={{
      marginTop: 40,
      padding: '24px 28px',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-off)',
    }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Evaluasi Jujur (Honest Holdout)
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginBottom: 16, maxWidth: 660 }}>
        Model terpilih ({holdout.model}) dievaluasi kembali pada {holdout.n_samples} pasien asli dari SPLIT-1
        yang tidak pernah digunakan selama proses pelatihan. Angka ini merepresentasikan
        performa dunia nyata yang lebih jujur.
      </p>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {['accuracy', 'precision', 'recall', 'f1_score'].map((k) => (
          <div key={k}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--ink)', lineHeight: 1 }}>
              {((holdout[k] ?? 0) * 100).toFixed(1)}%
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: 4 }}>
              {METRIC_LABELS[k]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
