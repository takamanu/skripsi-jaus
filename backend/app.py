import json
import os
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent

model_file = BASE_DIR / "model" / "best_model.joblib"
features_file = BASE_DIR / "model" / "feature_order.json"
metrics_file = BASE_DIR / "model" / "metrics.json"

# Auto-train jika model atau metrik belum ada (misal fresh git clone di Render/lokal)
if not (model_file.exists() and features_file.exists() and metrics_file.exists()):
    print("[INFO] Model atau file metrik belum ditemukan. Memulai proses training otomatis...")
    from train_model import main as run_train
    run_train()

app = Flask(__name__)
CORS(app)

model = joblib.load(model_file)

with open(features_file) as f:
    FEATURES = json.load(f)

with open(metrics_file) as f:
    METRICS = json.load(f)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/model-info")
def model_info():
    return jsonify(
        {
            "best_method": METRICS["best_method"],
            "features": FEATURES,
            "results": METRICS["results"],
            # Performa model terpilih pada data uji berisi pasien asli — angka di
            # "results" mereplikasi notebook dan melebih-lebihkan performa nyata.
            "honest_holdout": METRICS.get("honest_holdout"),
            "evaluation_note": METRICS.get("evaluation_note"),
        }
    )


@app.post("/api/predict")
def predict():
    payload = request.get_json(silent=True) or {}

    values = {}
    for feature in FEATURES:
        if feature not in payload:
            return jsonify({"error": f"Field '{feature}' wajib diisi."}), 400
        try:
            values[feature] = float(payload[feature])
        except (TypeError, ValueError):
            return jsonify({"error": f"Field '{feature}' harus berupa angka."}), 400
        if values[feature] < 0:
            return jsonify({"error": f"Field '{feature}' tidak boleh negatif."}), 400

    X = pd.DataFrame([[values[f] for f in FEATURES]], columns=FEATURES)

    prediction = int(model.predict(X)[0])
    probabilities = model.predict_proba(X)[0]

    return jsonify(
        {
            "prediction": prediction,
            "label": "Diabetes" if prediction == 1 else "Tidak Diabetes",
            "probability_diabetes": round(float(probabilities[1]), 4),
            "probability_no_diabetes": round(float(probabilities[0]), 4),
            "model_used": METRICS["best_method"],
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    host = os.environ.get("HOST", "0.0.0.0")
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host=host, port=port, debug=debug)
