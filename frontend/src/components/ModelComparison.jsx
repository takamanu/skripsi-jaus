import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'

// Reference dataviz palette — one sequential hue (blue) for magnitude,
// status "good" for the winning model, muted gray for context bars.
const BLUE = '#2a78d6'
const BLUE_LIGHT = '#86b6ef'
const BLUE_SOFT = '#cde2fb'
const GOOD = '#0ca30c'
const MUTED = '#c3c2b7'
const GRID = '#e1e0d9'

const MODEL_ORDER = ['stacking', 'stacking_smote', 'stacking_smotetomek']

const MODEL_META = {
  stacking: {
    name: 'Stacking Ensemble Random Forest × XGBoost',
    description:
      'Model dasar: prediksi Random Forest dan XGBoost digabung lewat stacking dengan Logistic Regression sebagai meta-model, tanpa penanganan data tidak seimbang.',
  },
  stacking_smote: {
    name: 'SMOTE × Stacking',
    description:
      'Data latih diseimbangkan lebih dulu dengan SMOTE (oversampling sintetis kelas minoritas), baru dilatih dengan Stacking Ensemble Random Forest × XGBoost.',
  },
  stacking_smotetomek: {
    name: 'SMOTE-Tomek × Stacking Ensemble Random Forest & XGBoost',
    description:
      'Data latih diseimbangkan dengan SMOTE-Tomek (oversampling SMOTE dikombinasikan pembersihan Tomek Links), baru dilatih dengan Stacking Ensemble Random Forest × XGBoost.',
  },
}

const METRIC_META = [
  { key: 'accuracy', label: 'Akurasi' },
  { key: 'precision', label: 'Presisi' },
  { key: 'recall', label: 'Recall' },
  { key: 'f1_score', label: 'F1 Score' },
]

function formatPct(value) {
  return `${(value * 100).toFixed(1)}%`
}

/** Vertical bar chart for the 4 metrics of a single model — one hue, direct labels, hover tooltip. */
function MetricBarChart({ results }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div className="relative">
      <div className="flex items-end gap-4 h-40 pl-8 border-l border-b border-slate-200 relative">
        {[0, 25, 50, 75, 100].map((tick) => (
          <div
            key={tick}
            className="absolute left-0 right-0 border-t border-dotted"
            style={{ borderColor: GRID, bottom: `${tick}%` }}
          >
            <span className="absolute -left-8 -top-2 text-[10px] text-slate-400 w-7 text-right">
              {tick}%
            </span>
          </div>
        ))}
        {METRIC_META.map((metric) => {
          const value = results[metric.key]
          const heightPct = Math.max(value * 100, 2)
          const isHovered = hovered === metric.key
          return (
            <div
              key={metric.key}
              className="relative flex flex-col items-center justify-end h-full w-14 group cursor-default"
              onMouseEnter={() => setHovered(metric.key)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(metric.key)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
            >
              {isHovered && (
                <div className="absolute -top-9 z-10 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[11px] text-white shadow-sm">
                  <span className="font-semibold">{formatPct(value)}</span>{' '}
                  <span className="text-slate-300">{metric.label}</span>
                </div>
              )}
              <span className="text-[11px] font-medium text-slate-700 mb-1">
                {formatPct(value)}
              </span>
              <div
                className="w-8 rounded-t transition-opacity"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: BLUE,
                  opacity: isHovered ? 0.8 : 1,
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-4 pl-8 mt-1">
        {METRIC_META.map((metric) => (
          <div key={metric.key} className="w-14 text-center text-[11px] text-slate-500">
            {metric.label}
          </div>
        ))}
      </div>
    </div>
  )
}

/** 2x2 confusion matrix as a sequential heatmap (one hue, magnitude = darker). */
function ConfusionMatrixHeatmap({ matrix }) {
  const [hovered, setHovered] = useState(null)
  const [tn, fp] = matrix[0]
  const [fn, tp] = matrix[1]
  const max = Math.max(tn, fp, fn, tp)

  const cells = [
    { key: 'tn', label: 'Benar: Tidak Diabetes', value: tn, row: 0, col: 0 },
    { key: 'fp', label: 'Salah: diprediksi Diabetes', value: fp, row: 0, col: 1 },
    { key: 'fn', label: 'Salah: diprediksi Tidak Diabetes', value: fn, row: 1, col: 0 },
    { key: 'tp', label: 'Benar: Diabetes', value: tp, row: 1, col: 1 },
  ]

  const cellStyle = (value) => {
    const intensity = max > 0 ? value / max : 0
    return {
      backgroundColor: intensity > 0 ? BLUE : BLUE_SOFT,
      opacity: 0.25 + intensity * 0.75,
    }
  }

  return (
    <div className="flex gap-2">
      <div className="flex flex-col justify-center gap-1 pr-1">
        {['Aktual: Sehat', 'Aktual: Diabetes'].map((label) => (
          <div
            key={label}
            className="h-16 flex items-center text-[10px] text-slate-500 w-16 text-right justify-end"
          >
            {label}
          </div>
        ))}
      </div>
      <div>
        <div className="grid grid-cols-2 gap-1 w-40">
          {cells.map((cell) => (
            <div
              key={cell.key}
              className="relative h-16 rounded flex items-center justify-center cursor-default"
              style={cellStyle(cell.value)}
              onMouseEnter={() => setHovered(cell.key)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(cell.key)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: cell.value / (max || 1) > 0.55 ? '#ffffff' : '#0b0b0b' }}
              >
                {cell.value}
              </span>
              {hovered === cell.key && (
                <div className="absolute -top-8 z-10 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[11px] text-white shadow-sm">
                  {cell.label}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1 w-40 mt-1">
          {['Prediksi: Sehat', 'Prediksi: Diabetes'].map((label) => (
            <div key={label} className="text-[10px] text-slate-500 text-center">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Emphasis chart: accuracy across the 3 models, winner highlighted, rest muted. */
function AccuracyOverviewChart({ models, bestKey }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div className="flex items-end gap-8 h-48 pl-10 border-l border-b border-slate-200 relative">
      {[0, 25, 50, 75, 100].map((tick) => (
        <div
          key={tick}
          className="absolute left-0 right-0 border-t border-dotted"
          style={{ borderColor: GRID, bottom: `${tick}%` }}
        >
          <span className="absolute -left-9 -top-2 text-[10px] text-slate-400 w-8 text-right">
            {tick}%
          </span>
        </div>
      ))}
      {models.map((model) => {
        const isBest = model.key === bestKey
        const heightPct = Math.max(model.accuracy * 100, 2)
        const isHovered = hovered === model.key
        return (
          <div
            key={model.key}
            className="relative flex flex-col items-center justify-end h-full w-24 group cursor-default"
            onMouseEnter={() => setHovered(model.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(model.key)}
            onBlur={() => setHovered(null)}
            tabIndex={0}
          >
            {isHovered && (
              <div className="absolute -top-9 z-10 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[11px] text-white shadow-sm">
                <span className="font-semibold">{formatPct(model.accuracy)}</span>{' '}
                <span className="text-slate-300">akurasi</span>
              </div>
            )}
            {isBest && (
              <span className="mb-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: GOOD }}>
                Terbaik — dipakai di form
              </span>
            )}
            <span className="text-xs font-medium text-slate-700 mb-1">
              {formatPct(model.accuracy)}
            </span>
            <div
              className="w-14 rounded-t transition-opacity"
              style={{
                height: `${heightPct}%`,
                backgroundColor: isBest ? GOOD : MUTED,
                opacity: isHovered ? 0.85 : 1,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

function ModelCard({ modelKey, results }) {
  const meta = MODEL_META[modelKey]
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-base font-semibold text-slate-800">{meta.name}</h3>
      <p className="text-sm text-slate-500 mt-1 mb-5">{meta.description}</p>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
            Metrik evaluasi
          </p>
          <MetricBarChart results={results} />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
            Confusion matrix (data uji)
          </p>
          <ConfusionMatrixHeatmap matrix={results.confusion_matrix} />
        </div>
      </div>
    </div>
  )
}

/**
 * Dumbbell chart: for the winning model, one row per metric showing the
 * notebook-style (leaked) value vs. the honest value on real patients only.
 * Same metric, same model — the gap IS the story, so it gets a dedicated form.
 */
function RealityCheckChart({ bestName, leaked, honest }) {
  const [hoveredRow, setHoveredRow] = useState(null)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800">
        Cek Realistis: {bestName}
      </h2>
      <p className="text-sm text-slate-500 mt-1 mb-4">
        Model yang sama, diuji pada dua data uji berbeda. Selisihnya menunjukkan
        seberapa besar data sintetis pada test set notebook melebih-lebihkan performa.
      </p>

      <div className="flex items-center gap-4 mb-5 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BLUE_LIGHT }} />
          Test set notebook (mengandung data sintetis)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BLUE }} />
          {honest.n_samples} pasien asli (tidak pernah dilihat model)
        </span>
      </div>

      <div className="space-y-5">
        {METRIC_META.map((metric) => {
          const leakedVal = leaked[metric.key]
          const honestVal = honest[metric.key]
          const isHovered = hoveredRow === metric.key
          const deltaPts = (leakedVal - honestVal) * 100

          return (
            <div key={metric.key}>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span className="font-medium">{metric.label}</span>
                <span>
                  selisih{' '}
                  <span className="font-semibold" style={{ color: '#d03b3b' }}>
                    −{deltaPts.toFixed(1)} poin
                  </span>
                </span>
              </div>
              <div
                className="relative h-8 cursor-default"
                onMouseEnter={() => setHoveredRow(metric.key)}
                onMouseLeave={() => setHoveredRow(null)}
                onFocus={() => setHoveredRow(metric.key)}
                onBlur={() => setHoveredRow(null)}
                tabIndex={0}
              >
                {/* gridlines */}
                {[0, 25, 50, 75, 100].map((tick) => (
                  <div
                    key={tick}
                    className="absolute top-0 bottom-0 border-l border-dotted"
                    style={{ borderColor: GRID, left: `${tick}%` }}
                  />
                ))}
                {/* connecting line */}
                <div
                  className="absolute top-1/2 h-0.5 -translate-y-1/2"
                  style={{
                    backgroundColor: MUTED,
                    left: `${Math.min(leakedVal, honestVal) * 100}%`,
                    right: `${100 - Math.max(leakedVal, honestVal) * 100}%`,
                  }}
                />
                {/* honest dot (darker) */}
                <div
                  className="absolute top-1/2 w-4 h-4 rounded-full -translate-y-1/2 -translate-x-1/2 ring-2 ring-white shadow-sm"
                  style={{ left: `${honestVal * 100}%`, backgroundColor: BLUE }}
                />
                {/* leaked dot (lighter) */}
                <div
                  className="absolute top-1/2 w-4 h-4 rounded-full -translate-y-1/2 -translate-x-1/2 ring-2 ring-white shadow-sm"
                  style={{ left: `${leakedVal * 100}%`, backgroundColor: BLUE_LIGHT }}
                />
                {isHovered && (
                  <div
                    className="absolute -top-8 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[11px] text-white shadow-sm"
                    style={{ left: `${((leakedVal + honestVal) / 2) * 100}%` }}
                  >
                    <span className="font-semibold">{formatPct(leakedVal)}</span> notebook ·{' '}
                    <span className="font-semibold">{formatPct(honestVal)}</span> asli
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MetricsTable({ modelInfo }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-2 pr-4 font-medium">Model</th>
            {METRIC_META.map((m) => (
              <th key={m.key} className="py-2 pr-4 font-medium text-right">
                {m.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MODEL_ORDER.map((key) => {
            const r = modelInfo.results[key]
            const isBest = key === modelInfo.best_method
            return (
              <tr key={key} className="border-b border-slate-100">
                <td className="py-2 pr-4 text-slate-700">
                  {MODEL_META[key].name}
                  {isBest && (
                    <span className="ml-2 text-[10px] font-semibold" style={{ color: GOOD }}>
                      TERBAIK
                    </span>
                  )}
                </td>
                {METRIC_META.map((m) => (
                  <td key={m.key} className="py-2 pr-4 text-right tabular-nums text-slate-700">
                    {formatPct(r[m.key])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ModelComparison() {
  const [modelInfo, setModelInfo] = useState(null)
  const [error, setError] = useState(null)
  const [showTable, setShowTable] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/model-info`)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat info model')
        return res.json()
      })
      .then(setModelInfo)
      .catch(() => setError('Tidak dapat memuat data perbandingan model. Pastikan backend Flask berjalan.'))
  }, [])

  if (error) {
    return (
      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {error}
      </p>
    )
  }

  if (!modelInfo) {
    return <p className="text-sm text-slate-500">Memuat perbandingan model…</p>
  }

  const overviewModels = MODEL_ORDER.map((key) => ({
    key,
    name: MODEL_META[key].name,
    accuracy: modelInfo.results[key].accuracy,
  }))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800">Perbandingan Akurasi 3 Model</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          Mengikuti metodologi notebook penelitian: tiap varian di-resampling lalu
          dibagi ulang menjadi data latih/uji sendiri. Model dengan akurasi tertinggi
          otomatis dipakai pada fitur analisis/prediksi.
        </p>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">
          <strong>Catatan metodologi:</strong> data uji varian SMOTE dan SMOTE-Tomek ikut
          memuat sampel sintetis, sehingga angka di bawah tidak sebanding satu sama lain.
          Lihat "Cek Realistis" di bawah untuk performa model terpilih pada pasien asli.
        </p>
        <AccuracyOverviewChart models={overviewModels} bestKey={modelInfo.best_method} />
      </div>

      {modelInfo.honest_holdout && (
        <RealityCheckChart
          bestName={MODEL_META[modelInfo.honest_holdout.model].name}
          leaked={modelInfo.results[modelInfo.honest_holdout.model]}
          honest={modelInfo.honest_holdout}
        />
      )}

      {MODEL_ORDER.map((key) => (
        <ModelCard key={key} modelKey={key} results={modelInfo.results[key]} />
      ))}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          {showTable ? 'Sembunyikan tabel data' : 'Lihat sebagai tabel'}
        </button>
        {showTable && (
          <div className="mt-4">
            <MetricsTable modelInfo={modelInfo} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ModelComparison
