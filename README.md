# Prediksi Risiko Diabetes

Web app untuk klasifikasi risiko diabetes menggunakan **Stacking Ensemble
(Random Forest x XGBoost)** dengan **SMOTE** / **SMOTE-Tomek**, diadaptasi
dari riset di `mni_riset_jaus.py`.

- Backend: Flask + scikit-learn + XGBoost
- Frontend: React (Vite) + Tailwind CSS

## Struktur Project

```
jaus-skripsi/
├── mni_riset_jaus.py       # notebook riset asli
├── backend/
│   ├── app.py              # Flask API
│   ├── train_model.py      # training pipeline
│   ├── requirements.txt
│   ├── data/diabetes.csv   # dataset
│   └── model/               # model & metrik hasil training
└── frontend/                # React + Vite + Tailwind
```

## Persyaratan

- Python 3.9+
- Node.js 18+
- macOS: `brew install libomp` (dibutuhkan XGBoost)

## Menjalankan Backend (Flask)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Latih model (hanya perlu dijalankan sekali, atau ulangi jika dataset berubah):

```bash
python train_model.py
```

Jalankan server API:

```bash
python app.py
```

Backend berjalan di `http://localhost:5002`.

> Catatan (macOS): port 5000 sering dipakai AirPlay Receiver bawaan macOS,
> makanya app ini pakai port 5002. Kalau bentrok, matikan AirPlay Receiver
> di System Settings > General > AirDrop & Handoff, atau ganti port di
> `backend/app.py` (baris terakhir) dan `frontend/src/App.jsx` (`API_URL`).

## Menjalankan Frontend (React)

Di terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Cara Pakai

1. Pastikan backend (`:5002`) dan frontend (`:5173`) sama-sama berjalan.
2. Isi form dengan nilai: **Glucose, Blood Pressure, Skin Thickness, Insulin, BMI**.
3. Klik **Analisis** untuk melihat hasil prediksi beserta probabilitasnya.

## Melatih Ulang Model

Ganti file `backend/data/diabetes.csv` dengan dataset yang diinginkan (kolom
wajib: `Glucose, BloodPressure, SkinThickness, Insulin, BMI, Outcome`), lalu:

```bash
cd backend
source venv/bin/activate
python train_model.py
```

Script akan melatih 3 varian (tanpa resampling, SMOTE, SMOTE-Tomek), memilih
model dengan akurasi tertinggi, dan menyimpan hasilnya ke `backend/model/`.
