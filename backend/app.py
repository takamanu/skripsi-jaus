import json

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model = joblib.load("model/best_model.joblib")

with open("model/feature_order.json") as f:
    FEATURES = json.load(f)

with open("model/metrics.json") as f:
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
    app.run(debug=True, port=5002)
