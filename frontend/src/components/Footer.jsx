export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <p className="footer__title">
          Analisis Performa Stacking Ensemble dari Random Forest dan XGBoost
          untuk Klasifikasi Penyakit Diabetes dengan SMOTE dan SMOTE-Tomek
        </p>

        <p className="footer__meta">
          Skripsi &middot; Program Studi Teknik Informatika
        </p>

        <hr className="footer__divider" />

        <div className="footer__bottom">
          <span>Dataset: Pima Indians Diabetes (NIDDK)</span>
          <span>Flask &middot; React &middot; Scikit-learn &middot; XGBoost &middot; Three.js</span>
        </div>
      </div>
    </footer>
  )
}
