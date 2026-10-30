# Sistem Prediksi Risiko Diabetes — Stacking Ensemble

Aplikasi web akademik interaktif untuk klasifikasi risiko penyakit diabetes melitus berbasis **Stacking Ensemble (Random Forest × XGBoost)** dengan teknik resampling **SMOTE** dan **SMOTE-Tomek** pada dataset **Pima Indians Diabetes**.

Dilengkapi visualisasi 3D jejaring arsitektur ensemble (Three.js), perbandingan performa 3 varian model, evaluasi jujur (*Honest Holdout*), dan penjelasan pipeline riset metodologis lengkap untuk keperluan sidang skripsi.

---

## Arsitektur Teknologi

- **Frontend**: React 18 (Vite), Three.js (`@react-three/fiber`), Vanilla CSS design system (DM Serif Display + Inter)
- **Backend**: Flask 3.0, Scikit-learn 1.5, XGBoost 2.1, Imbalanced-learn 0.12, Gunicorn
- **Deployment**: Vercel (Frontend, 100% gratis selamanya) + Render (Backend Web Service, 100% gratis free tier)

---

## Struktur Repositori

```
skripsi-jaus/
├── backend/
│   ├── app.py              # API Flask (auto-train jika model belum ada)
│   ├── train_model.py      # Pipeline pelatihan & replikasi riset
│   ├── requirements.txt    # Dependensi Python (+ gunicorn)
│   ├── data/diabetes.csv   # Dataset Pima Indians Diabetes
│   └── model/              # Model (.joblib) & file metrik JSON
├── frontend/
│   ├── index.html
│   ├── vercel.json         # Konfigurasi SPA routing Vercel
│   ├── .env.example        # Contoh environment variable VITE_API_URL
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavBar.jsx              # Sticky header & menu responsif
│   │   │   ├── HeroSection.jsx         # Hero dengan lazy-loaded 3D
│   │   │   ├── NetworkCanvas.jsx       # Three.js 3D stacking ensemble graph
│   │   │   ├── PredictSection.jsx      # Form 8 parameter klinis + panel hasil
│   │   │   ├── ModelSection.jsx        # Kartu komparasi 3 model + Honest Holdout
│   │   │   ├── MethodologySection.jsx  # Pipeline 4 tahap + tabel fitur
│   │   │   └── Footer.jsx              # Footer metadata skripsi
│   │   ├── App.jsx
│   │   └── index.css                   # Custom design system tokens
├── render.yaml             # Blueprint konfigurasi deploy Render
└── README.md
```

---

## Menjalankan Secara Lokal

### 1. Menjalankan Backend (Flask)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

*(Opsional) Melatih model manual:*
```bash
python train_model.py
```
> **Catatan**: Jika file `best_model.joblib` belum ada, `python app.py` akan melatihnya secara otomatis pada start pertama.

Jalankan server Flask:
```bash
python app.py
```
Backend akan aktif di `http://localhost:5002`.

### 2. Menjalankan Frontend (React + Vite)

Buka terminal baru:
```bash
cd frontend
npm install
npm run dev
```
Akses sistem di browser: `http://localhost:5173`.

---

## Panduan Hosting Gratis (Vercel + Render)

Sistem ini dirancang agar dapat di-hosting **100% gratis** tanpa kartu kredit.

### Langkah 1: Deploy Backend ke Render (Gratis)

1. Buat akun di [Render.com](https://render.com) (login dengan akun GitHub).
2. Push repository ini ke akun GitHub Anda.
3. Di dashboard Render, klik **New +** > **Web Service**.
4. Hubungkan dengan repository GitHub Anda.
5. Konfigurasikan:
   - **Name**: `diabetes-prediction-api` (atau nama lain pilihan Anda)
   - **Region**: Singapore (terdekat dengan Indonesia)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python train_model.py`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: `Free`
6. Klik **Deploy Web Service**.
7. Setelah deployment selesai, salin URL publik backend Anda (contoh: `https://diabetes-prediction-api.onrender.com`).

> **Catatan Free Tier Render**: Layanan gratis Render akan tidur (*spin-down*) jika tidak ada request selama 15 menit. Saat pertama kali diakses kembali, backend membutuhkan waktu ~50 detik untuk aktif. Sistem frontend sudah memiliki indikator banner otomatis untuk memberi tahu pengguna jika server sedang proses bangun.

---

### Langkah 2: Deploy Frontend ke Vercel (Gratis)

1. Buat akun di [Vercel.com](https://vercel.com) (login dengan akun GitHub).
2. Klik **Add New...** > **Project**, lalu impor repository GitHub Anda.
3. Pada halaman konfigurasi project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Klik **Edit** dan pilih folder `frontend`.
4. Buka bagian **Environment Variables**:
   - **Name**: `VITE_API_URL`
   - **Value**: Masukkan URL backend Render Anda dari Langkah 1 (contoh: `https://diabetes-prediction-api.onrender.com` — *tanpa trailing slash `/`*).
5. Klik **Deploy**.
6. Selesai! Web skripsi Anda sekarang live dan dapat diakses publik dari URL Vercel (misal: `https://skripsi-jaus.vercel.app`).
