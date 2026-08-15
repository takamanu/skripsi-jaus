import { useState } from 'react'
import ModelComparison from './components/ModelComparison'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'

const FIELDS = [
  { name: 'Pregnancies', label: 'Jumlah Kehamilan', placeholder: 'cth. 2' },
  { name: 'Glucose', label: 'Glukosa (mg/dL)', placeholder: 'cth. 120' },
  { name: 'BloodPressure', label: 'Tekanan Darah (mmHg)', placeholder: 'cth. 70' },
  { name: 'SkinThickness', label: 'Ketebalan Kulit Triceps (mm)', placeholder: 'cth. 20' },
  { name: 'Insulin', label: 'Insulin (mu U/mL)', placeholder: 'cth. 79' },
  { name: 'BMI', label: 'BMI (kg/m²)', placeholder: 'cth. 25.5' },
  { name: 'DiabetesPedigreeFunction', label: 'Diabetes Pedigree Function', placeholder: 'cth. 0.47' },
  { name: 'Age', label: 'Usia (tahun)', placeholder: 'cth. 33' },
]

const emptyForm = FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})

function App() {
  const [tab, setTab] = useState('analisis')
  const [form, setForm] = useState(emptyForm)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan saat memproses data.')
        return
      }
      setResult(data)
    } catch {
      setError('Tidak dapat terhubung ke server. Pastikan backend Flask berjalan.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm(emptyForm)
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Prediksi Risiko Diabetes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stacking Ensemble (Random Forest &amp; XGBoost) dengan SMOTE / SMOTE-Tomek
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab('analisis')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'analisis'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            Analisis
          </button>
          <button
            type="button"
            onClick={() => setTab('perbandingan')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'perbandingan'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            Perbandingan Model
          </button>
        </div>

        {tab === 'analisis' && (
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {FIELDS.map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      {field.label}
                    </label>
                    <input
                      id={field.name}
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    />
                  </div>
                ))}

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-lg px-4 py-2 transition-colors"
                  >
                    {loading ? 'Memproses...' : 'Analisis'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-lg px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {result && (
              <div
                className={`mt-5 rounded-2xl border p-6 text-center ${
                  result.prediction === 1
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <p className="text-sm text-slate-500">Hasil Analisis</p>
                <p
                  className={`text-xl font-semibold mt-1 ${
                    result.prediction === 1 ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {result.label}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Probabilitas diabetes: {(result.probability_diabetes * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Model: {result.model_used}
                </p>
              </div>
            )}

            <p className="text-xs text-slate-400 text-center mt-6">
              Hasil ini merupakan estimasi berbasis machine learning dan bukan
              pengganti diagnosis medis profesional.
            </p>
          </div>
        )}

        {tab === 'perbandingan' && <ModelComparison />}
      </div>
    </div>
  )
}

export default App
