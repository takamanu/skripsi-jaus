"""
Training script — adaptasi dari mni_riset_jaus.py untuk deployment web.

Pipeline (mengikuti notebook asli):
  1. Load dataset Pima Indians Diabetes
  2. Ganti nilai 0 (tidak fisiologis) jadi NaN pada Glucose, BloodPressure,
     SkinThickness, Insulin, BMI
  3. Imputasi missing value dengan IterativeImputer (MICE)
  4. Buang outlier dengan Local Outlier Factor (LOF)
  5. Latih 3 varian Stacking Ensemble (Random Forest x XGBoost):
       - tanpa resampling
       - dengan SMOTE
       - dengan SMOTE-Tomek
     dievaluasi pada test set yang SAMA supaya adil dibandingkan.
  6. Simpan model dengan akurasi tertinggi + metrik ketiganya untuk backend Flask.

Catatan penyesuaian dari notebook asli: web app hanya meminta 5 input dari
pengguna (Insulin, SkinThickness, Glucose, BloodPressure, BMI), sehingga
fitur Pregnancies, DiabetesPedigreeFunction, dan Age tidak diikutsertakan
sebagai fitur model. Notebook asli juga melakukan split train/test dua kali
(baris 124 & 137) yang membuang test set pertama secara tidak sengaja; di
sini split dilakukan sekali agar perbandingan 3 metode konsisten dan adil.
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

FEATURES = ["Insulin", "SkinThickness", "Glucose", "BloodPressure", "BMI"]
TARGET = "Outcome"
RANDOM_STATE = 42


def load_and_clean_data(csv_path: str) -> pd.DataFrame:
    data = pd.read_csv(csv_path)

    # 0 pada kolom klinis ini secara medis tidak masuk akal -> treat sebagai missing
    zero_as_nan_cols = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
    data[zero_as_nan_cols] = data[zero_as_nan_cols].replace(0, np.nan)

    # MICE imputation
    mice = IterativeImputer(random_state=RANDOM_STATE)
    data[zero_as_nan_cols] = mice.fit_transform(data[zero_as_nan_cols])

    # Subset ke 5 fitur yang dipakai form + target
    df = data[FEATURES + [TARGET]].copy()

    # LOF outlier removal
    lof = LocalOutlierFactor(n_neighbors=10)
    is_inlier = lof.fit_predict(df) == 1
    df_clean = df.loc[is_inlier].reset_index(drop=True)

    print(f"[INFO] Data awal: {df.shape[0]} baris, setelah buang outlier: {df_clean.shape[0]} baris")
    return df_clean


def build_stacking_classifier() -> StackingClassifier:
    base_models = [
        ("rf", RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE)),
        (
            "xgb",
            xgb.XGBClassifier(eval_metric="logloss", random_state=RANDOM_STATE),
        ),
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

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )
    print(f"[INFO] Train: {X_train.shape}, Test: {X_test.shape}")

    results = {}
    trained_models = {}

    # 1) Stacking tanpa resampling
    print("\n[INFO] Melatih Stacking (tanpa resampling)...")
    t0 = time.time()
    clf_plain = build_stacking_classifier()
    clf_plain.fit(X_train, y_train)
    results["stacking"] = evaluate(clf_plain, X_test, y_test)
    trained_models["stacking"] = clf_plain
    print(f"      selesai dalam {time.time()-t0:.1f}s -> accuracy={results['stacking']['accuracy']}")

    # 2) Stacking + SMOTE
    print("\n[INFO] Melatih Stacking + SMOTE...")
    t0 = time.time()
    sm = SMOTE(random_state=0)
    X_smote, y_smote = sm.fit_resample(X_train, y_train)
    clf_smote = build_stacking_classifier()
    clf_smote.fit(X_smote, y_smote)
    results["stacking_smote"] = evaluate(clf_smote, X_test, y_test)
    trained_models["stacking_smote"] = clf_smote
    print(f"      selesai dalam {time.time()-t0:.1f}s -> accuracy={results['stacking_smote']['accuracy']}")

    # 3) Stacking + SMOTE-Tomek
    print("\n[INFO] Melatih Stacking + SMOTE-Tomek...")
    t0 = time.time()
    smtomek = SMOTETomek(random_state=0)
    X_st, y_st = smtomek.fit_resample(X_train, y_train)
    clf_st = build_stacking_classifier()
    clf_st.fit(X_st, y_st)
    results["stacking_smotetomek"] = evaluate(clf_st, X_test, y_test)
    trained_models["stacking_smotetomek"] = clf_st
    print(f"      selesai dalam {time.time()-t0:.1f}s -> accuracy={results['stacking_smotetomek']['accuracy']}")

    # Pilih model terbaik berdasarkan accuracy
    best_method = max(results, key=lambda k: results[k]["accuracy"])
    best_model = trained_models[best_method]
    print(f"\n[INFO] Model terbaik: {best_method} (accuracy={results[best_method]['accuracy']})")

    joblib.dump(best_model, "model/best_model.joblib")
    with open("model/metrics.json", "w") as f:
        json.dump(
            {"best_method": best_method, "features": FEATURES, "results": results},
            f,
            indent=2,
        )
    with open("model/feature_order.json", "w") as f:
        json.dump(FEATURES, f)

    print("\n[INFO] Model & metrik tersimpan di backend/model/")


if __name__ == "__main__":
    main()
