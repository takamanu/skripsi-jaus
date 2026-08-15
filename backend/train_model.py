"""
Training script — REPLIKASI PERSIS mini_riset_jaus_agustus.py / Mni_Riset_Jaus.ipynb.

Pipeline (urutan sama persis dengan notebook):
  1. Load dataset Pima Indians Diabetes (8 fitur asli + Outcome)
  2. Ganti nilai 0 (tidak fisiologis) jadi NaN pada Glucose, BloodPressure,
     SkinThickness, Insulin, BMI
  3. Imputasi missing value dengan IterativeImputer (MICE) pada kolom-kolom itu
  4. Buang outlier dengan Local Outlier Factor (LOF), di-fit pada SELURUH
     kolom (8 fitur + Outcome) seperti notebook
  5. Latih 3 varian Stacking Ensemble (Random Forest x XGBoost) mengikuti alur
     split notebook (lihat PERINGATAN di bawah):
       [1] tanpa resampling        -> dievaluasi pada SPLIT-1 (149 pasien asli)
       [2] SMOTE                   -> dievaluasi pada SPLIT-2
       [3] SMOTE-Tomek             -> dievaluasi pada SPLIT-3
  6. Simpan model dengan akurasi tertinggi + metrik ketiganya untuk backend Flask.

==============================================================================
PERINGATAN METODOLOGI — DIBUAT SECARA SENGAJA UNTUK MENCOCOKKAN NOTEBOOK
==============================================================================
Notebook memanggil train_test_split() TIGA KALI. Varian [2] dan [3] masing-
masing melakukan resampling pada data latih SPLIT-1, lalu memanggil
train_test_split() lagi SETELAH resampling itu.

Catatan penting soal urutan eksekusi: file .py hasil ekspor Colab
melinearkan sel, seolah-olah SMOTE-Tomek dijalankan di atas data yang sudah
di-SMOTE. Output tercetak di notebook membuktikan sebaliknya — sel "Before
OverSampling" pada bagian SMOTE-Tomek mencetak 0:385, 1:209 (= 594 baris,
yaitu data latih SPLIT-1), bukan 616 baris milik SPLIT-2. Jadi varian [2] dan
[3] sama-sama berangkat dari data latih SPLIT-1. Replikasi ini mengikuti
urutan eksekusi asli itu, dan menghasilkan bentuk data yang identik dengan
notebook: SMOTE-Tomek 752 baris (376/376), split 601/151.

Konsekuensi yang tetap ada:

  * Karena split dilakukan SETELAH resampling, test set varian [2] dan [3]
    IKUT BERISI DATA SINTETIS buatan SMOTE — bukan pasien asli. Titik sintetis
    adalah hasil interpolasi dari titik-titik yang ada di data latih, sehingga
    relatif mudah ditebak model.
  * Ketiga varian diuji pada test set yang BERBEDA-BEDA, sehingga angka
    akurasinya TIDAK bisa dibandingkan langsung satu sama lain.

Akibatnya angka akurasi varian [3] (~86%) BUKAN estimasi performa dunia nyata.
Model yang sama, diuji pada 149 pasien ASLI yang belum pernah dilihat, hanya
mencapai sekitar 74-75%. Nilai jujur itu tetap dihitung di sini dan disimpan
sebagai "honest_holdout" di metrics.json sebagai catatan.

Untuk evaluasi yang metodologis benar, resampling harus dilakukan HANYA pada
data latih dan ketiga model diuji pada satu test set berisi data asli.
==============================================================================
"""

import json
import time

import joblib
import numpy as np
import pandas as pd
from imblearn.combine import SMOTETomek
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from sklearn.experimental import enable_iterative_imputer  # noqa: F401
from sklearn.impute import IterativeImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.neighbors import LocalOutlierFactor
import xgboost as xgb

FEATURES = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]
TARGET = "Outcome"
RANDOM_STATE = 42


def load_and_clean_data(csv_path: str) -> pd.DataFrame:
    data = pd.read_csv(csv_path)[FEATURES + [TARGET]].copy()

    # 0 pada kolom klinis ini secara medis tidak masuk akal -> treat sebagai missing
    zero_as_nan_cols = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
    data[zero_as_nan_cols] = data[zero_as_nan_cols].replace(0, np.nan)

    # MICE imputation, hanya pada kolom yang punya missing value (seperti notebook)
    mice = IterativeImputer(random_state=RANDOM_STATE)
    data[zero_as_nan_cols] = mice.fit_transform(data[zero_as_nan_cols])

    # LOF outlier removal — di-fit pada SELURUH kolom (8 fitur + Outcome),
    # persis seperti notebook (bukan subset fitur)
    lof = LocalOutlierFactor(n_neighbors=10)
    is_inlier = lof.fit_predict(data) == 1
    df_clean = data.loc[is_inlier].reset_index(drop=True)

    print(f"[INFO] Data awal: {data.shape[0]} baris, setelah buang outlier: {df_clean.shape[0]} baris")
    return df_clean


def build_stacking_classifier(with_eval_metric: bool = False) -> StackingClassifier:
    """Stacking RF x XGBoost dengan meta-model Logistic Regression.

    Notebook mendefinisikan base_models dua kali dengan sedikit perbedaan:
    varian [1] memakai eval_metric='logloss' eksplisit, varian [2] & [3] tidak.
    Parameter with_eval_metric ada untuk mereplikasi perbedaan itu.
    """
    xgb_kwargs = {"random_state": RANDOM_STATE}
    if with_eval_metric:
        xgb_kwargs["eval_metric"] = "logloss"

    base_models = [
        ("rf", RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE)),
        ("xgb", xgb.XGBClassifier(**xgb_kwargs)),
    ]
    meta_model = LogisticRegression()
    return StackingClassifier(estimators=base_models, final_estimator=meta_model, cv=5)


def evaluate(model, X_test, y_test) -> dict:
    y_pred = model.predict(X_test)
    cm = confusion_matrix(y_test, y_pred).tolist()
    return {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 6),
        "precision": round(float(precision_score(y_test, y_pred)), 6),
        "recall": round(float(recall_score(y_test, y_pred)), 6),
        "f1_score": round(float(f1_score(y_test, y_pred)), 6),
        "confusion_matrix": cm,
    }


def main():
    df = load_and_clean_data("data/diabetes.csv")

    X = df[FEATURES]
    y = df[TARGET]

    results = {}
    trained_models = {}

    # ---- SPLIT-1: satu-satunya split yang test set-nya berisi PASIEN ASLI ----
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )
    # Disimpan terpisah karena X_test/y_test akan DITIMPA oleh split berikutnya
    # (persis seperti notebook). Dipakai di akhir untuk evaluasi jujur.
    real_X_test, real_y_test = X_test.copy(), y_test.copy()
    print(f"[INFO] SPLIT-1 train={X_train.shape} test={X_test.shape} (pasien asli)")

    # 1) Stacking tanpa resampling — diuji pada SPLIT-1
    print("\n[INFO] [1] Melatih Stacking (tanpa resampling)...")
    t0 = time.time()
    clf_plain = build_stacking_classifier(with_eval_metric=True)
    clf_plain.fit(X_train, y_train)
    results["stacking"] = evaluate(clf_plain, X_test, y_test)
    trained_models["stacking"] = clf_plain
    print(f"      {time.time()-t0:.1f}s -> accuracy={results['stacking']['accuracy']}")

    # 2) SMOTE pada data latih SPLIT-1, lalu SPLIT-2 (split SETELAH resampling).
    #    Test set SPLIT-2 sudah tercampur data sintetis SMOTE.
    print("\n[INFO] [2] SMOTE pada data latih SPLIT-1, split ulang, melatih Stacking...")
    t0 = time.time()
    X_smote, y_smote = SMOTE(random_state=0).fit_resample(X_train, y_train)
    X_tr2, X_te2, y_tr2, y_te2 = train_test_split(
        X_smote, y_smote, random_state=RANDOM_STATE, test_size=0.20
    )
    print(f"      X_SMOTE={X_smote.shape[0]} baris -> SPLIT-2 train={X_tr2.shape} test={X_te2.shape}")
    clf_smote = build_stacking_classifier()
    clf_smote.fit(X_tr2, y_tr2)
    results["stacking_smote"] = evaluate(clf_smote, X_te2, y_te2)
    trained_models["stacking_smote"] = clf_smote
    print(f"      {time.time()-t0:.1f}s -> accuracy={results['stacking_smote']['accuracy']}")

    # 3) SMOTE-Tomek juga pada data latih SPLIT-1 (BUKAN di atas data ter-SMOTE
    #    — lihat catatan urutan eksekusi di docstring), lalu SPLIT-3.
    print("\n[INFO] [3] SMOTE-Tomek pada data latih SPLIT-1, split ulang, melatih Stacking...")
    t0 = time.time()
    X_st, y_st = SMOTETomek(random_state=0).fit_resample(X_train, y_train)
    X_tr3, X_te3, y_tr3, y_te3 = train_test_split(
        X_st, y_st, random_state=RANDOM_STATE, test_size=0.20
    )
    print(f"      X_SMOTETOMEK={X_st.shape[0]} baris -> SPLIT-3 train={X_tr3.shape} test={X_te3.shape}")
    clf_st = build_stacking_classifier()
    clf_st.fit(X_tr3, y_tr3)
    results["stacking_smotetomek"] = evaluate(clf_st, X_te3, y_te3)
    trained_models["stacking_smotetomek"] = clf_st
    print(f"      {time.time()-t0:.1f}s -> accuracy={results['stacking_smotetomek']['accuracy']}")

    # Pilih model terbaik berdasarkan accuracy (angka notebook, tidak sebanding)
    best_method = max(results, key=lambda k: results[k]["accuracy"])
    best_model = trained_models[best_method]
    print(f"\n[INFO] Model terbaik (angka notebook): {best_method} "
          f"(accuracy={results[best_method]['accuracy']})")

    # ---- Evaluasi jujur: model terpilih diuji pada 149 pasien ASLI ----
    # Ini TIDAK dipakai untuk memilih model; disimpan sebagai catatan performa
    # dunia nyata, karena akurasi di atas dihitung pada test set yang tercemar.
    honest = evaluate(best_model, real_X_test, real_y_test)
    print(f"[INFO] Evaluasi jujur '{best_method}' pada {len(real_y_test)} pasien asli: "
          f"accuracy={honest['accuracy']} (vs {results[best_method]['accuracy']} di test set tercemar)")

    joblib.dump(best_model, "model/best_model.joblib")
    with open("model/metrics.json", "w") as f:
        json.dump(
            {
                "best_method": best_method,
                "features": FEATURES,
                "results": results,
                "evaluation_note": (
                    "Angka pada 'results' mereplikasi notebook: setiap varian diuji "
                    "pada test set yang berbeda, dan test set varian SMOTE/SMOTE-Tomek "
                    "mengandung data sintetis sehingga angkanya tidak sebanding dan "
                    "melebih-lebihkan performa nyata."
                ),
                "honest_holdout": {
                    "model": best_method,
                    "n_samples": int(len(real_y_test)),
                    "description": (
                        "Performa model terpilih pada 149 pasien ASLI dari SPLIT-1 "
                        "yang tidak pernah dipakai melatihnya."
                    ),
                    **honest,
                },
            },
            f,
            indent=2,
        )
    with open("model/feature_order.json", "w") as f:
        json.dump(FEATURES, f)

    print("\n[INFO] Model & metrik tersimpan di backend/model/")


if __name__ == "__main__":
    main()
