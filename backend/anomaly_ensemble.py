"""
Advanced Anomaly Detection Ensemble for User-Behavior Threat Monitoring.

Combines three unsupervised models – IsolationForest, LocalOutlierFactor, and
OneClassSVM – via weighted voting to produce robust risk scores and per-feature
explanations.  Designed for the Blockchain-Based Secure Data Sharing platform.

Performance notes
-----------------
* All heavy linear-algebra is delegated to NumPy / scikit-learn C extensions.
* StandardScaler is applied once and re-used for scoring – no redundant work.
* Feature-importance approximation uses a single-pass permutation on the
  IsolationForest score function (O(n·d)), avoiding expensive SHAP calls.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

import numpy as np
from numpy.typing import NDArray
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler
from sklearn.svm import OneClassSVM

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

FEATURE_NAMES: list[str] = [
    "actions_per_minute",
    "total_actions",
    "file_views",
    "uploads",
    "failed_attempts",
    "unique_files_accessed",
]

# Weighted-voting shares  (must sum to 1.0)
WEIGHT_IF: float = 0.60   # IsolationForest
WEIGHT_LOF: float = 0.20  # LocalOutlierFactor
WEIGHT_SVM: float = 0.20  # OneClassSVM

# ---------------------------------------------------------------------------
# Result container
# ---------------------------------------------------------------------------

@dataclass
class EnsembleResult:
    """Structured output returned by ``detect_anomalies``."""

    anomaly_flags: NDArray[np.bool_]
    """Boolean array – True where ensemble classifies the sample as anomalous."""

    ensemble_scores: NDArray[np.float64]
    """Risk scores in the range [0, 100]."""

    individual_model_predictions: Dict[str, NDArray[np.int8]]
    """Per-model binary predictions (1 = anomaly, 0 = normal)."""

    confidence_level: NDArray[np.int8]
    """Number of models (0-3) that flagged the sample as anomalous."""

    feature_contributions: List[Dict[str, float]]
    """Per-sample dict mapping feature name → relative contribution (0–1)."""

    metadata: Dict[str, object] = field(default_factory=dict)
    """Extra info: sample count, imputed mask, etc."""


# ---------------------------------------------------------------------------
# Core ensemble
# ---------------------------------------------------------------------------

def detect_anomalies(
    X: NDArray[np.float64],
    *,
    contamination: str | float = "auto",
    lof_neighbors: int = 20,
    svm_nu: float = 0.1,
    svm_kernel: str = "rbf",
    risk_threshold: float = 50.0,
    random_state: int = 42,
) -> EnsembleResult:
    """Run the three-model anomaly-detection ensemble.

    Parameters
    ----------
    X : ndarray of shape (n_samples, 6)
        Feature matrix.  Columns must follow ``FEATURE_NAMES`` order.
    contamination : str or float
        Forwarded to ``IsolationForest``.
    lof_neighbors : int
        ``n_neighbors`` for LOF.  Clamped to ``n_samples - 1`` automatically.
    svm_nu : float
        ``nu`` for OneClassSVM.
    svm_kernel : str
        Kernel for OneClassSVM.
    risk_threshold : float
        Ensemble score (0-100) above which a sample is flagged anomalous.
    random_state : int
        Seed for reproducibility.

    Returns
    -------
    EnsembleResult
    """

    X = np.asarray(X, dtype=np.float64)
    metadata: dict = {}

    # ── Edge case: NaN / Inf handling ────────────────────────────────────
    nan_mask = np.isnan(X) | np.isinf(X)
    if nan_mask.any():
        # Column-wise median imputation (robust to outliers).
        col_medians = np.nanmedian(X, axis=0)
        # If an entire column is NaN, fall back to 0.
        col_medians = np.where(np.isnan(col_medians), 0.0, col_medians)
        inds = np.where(nan_mask)
        X[inds] = np.take(col_medians, inds[1])
        metadata["nan_imputed_count"] = int(nan_mask.sum())

    n_samples, n_features = X.shape

    # ── Edge case: fewer than 2 samples ──────────────────────────────────
    if n_samples < 2:
        return _single_sample_fallback(X, n_samples, metadata)

    # ── Edge case: all rows identical ────────────────────────────────────
    if np.ptp(X, axis=0).sum() == 0.0:
        # Every sample is the same → nothing is anomalous.
        return EnsembleResult(
            anomaly_flags=np.zeros(n_samples, dtype=bool),
            ensemble_scores=np.zeros(n_samples, dtype=np.float64),
            individual_model_predictions={
                "IsolationForest": np.zeros(n_samples, dtype=np.int8),
                "LocalOutlierFactor": np.zeros(n_samples, dtype=np.int8),
                "OneClassSVM": np.zeros(n_samples, dtype=np.int8),
            },
            confidence_level=np.zeros(n_samples, dtype=np.int8),
            feature_contributions=[
                {f: 0.0 for f in FEATURE_NAMES[:n_features]}
                for _ in range(n_samples)
            ],
            metadata={**metadata, "note": "all_rows_identical"},
        )

    # ── Preprocessing ────────────────────────────────────────────────────
    # Add minute jitter to prevent zero-variance columns after scaling.
    rng = np.random.RandomState(random_state)
    jitter = rng.normal(0, 1e-8, X.shape)
    X_proc = X + jitter

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_proc)

    # ── Model 1 – IsolationForest ────────────────────────────────────────
    iso = IsolationForest(
        contamination=contamination,
        random_state=random_state,
        n_jobs=-1,
    )
    iso.fit(X_scaled)
    iso_pred = iso.predict(X_scaled)                 # 1=normal, -1=anomaly
    iso_scores = -iso.score_samples(X_scaled)        # higher → more anomalous

    # ── Model 2 – LocalOutlierFactor ─────────────────────────────────────
    effective_neighbors = min(lof_neighbors, n_samples - 1)
    lof = LocalOutlierFactor(
        n_neighbors=max(1, effective_neighbors),
        novelty=False,
        n_jobs=-1,
    )
    lof_pred = lof.fit_predict(X_scaled)             # 1=normal, -1=anomaly
    lof_scores = -lof.negative_outlier_factor_        # higher → more anomalous

    # ── Model 3 – OneClassSVM ────────────────────────────────────────────
    svm = OneClassSVM(kernel=svm_kernel, nu=svm_nu)
    svm.fit(X_scaled)
    svm_pred = svm.predict(X_scaled)                 # 1=normal, -1=anomaly
    svm_scores = -svm.decision_function(X_scaled)    # higher → more anomalous

    # ── Binary predictions (1 = anomaly, 0 = normal) ─────────────────────
    iso_binary = (iso_pred == -1).astype(np.int8)
    lof_binary = (lof_pred == -1).astype(np.int8)
    svm_binary = (svm_pred == -1).astype(np.int8)

    # ── Weighted ensemble score (0-100) ──────────────────────────────────
    iso_norm = _minmax(iso_scores)
    lof_norm = _minmax(lof_scores)
    svm_norm = _minmax(svm_scores)

    ensemble_raw = (
        WEIGHT_IF * iso_norm
        + WEIGHT_LOF * lof_norm
        + WEIGHT_SVM * svm_norm
    )
    ensemble_scores = np.clip(ensemble_raw * 100.0, 0.0, 100.0)

    # ── Confidence (how many models agree on anomaly) ────────────────────
    confidence = (iso_binary + lof_binary + svm_binary).astype(np.int8)

    # ── Anomaly flag ─────────────────────────────────────────────────────
    anomaly_flags = ensemble_scores >= risk_threshold

    # ── Feature contributions (permutation-based, fast) ──────────────────
    feature_contributions = _feature_contributions(
        iso, X_scaled, iso_scores, n_features, rng,
    )

    return EnsembleResult(
        anomaly_flags=anomaly_flags,
        ensemble_scores=np.round(ensemble_scores, 2),
        individual_model_predictions={
            "IsolationForest": iso_binary,
            "LocalOutlierFactor": lof_binary,
            "OneClassSVM": svm_binary,
        },
        confidence_level=confidence,
        feature_contributions=feature_contributions,
        metadata=metadata,
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _minmax(arr: NDArray) -> NDArray:
    """Min-max normalise to [0, 1]; returns zeros if range is zero."""
    lo, hi = arr.min(), arr.max()
    if hi - lo == 0:
        return np.zeros_like(arr)
    return (arr - lo) / (hi - lo)


def _single_sample_fallback(
    X: NDArray,
    n_samples: int,
    metadata: dict,
) -> EnsembleResult:
    """Return a neutral result when there are fewer than 2 samples."""
    n_features = X.shape[1] if X.ndim == 2 else len(FEATURE_NAMES)
    if n_samples == 0:
        empty = np.array([], dtype=np.float64)
        return EnsembleResult(
            anomaly_flags=np.array([], dtype=bool),
            ensemble_scores=empty,
            individual_model_predictions={
                "IsolationForest": np.array([], dtype=np.int8),
                "LocalOutlierFactor": np.array([], dtype=np.int8),
                "OneClassSVM": np.array([], dtype=np.int8),
            },
            confidence_level=np.array([], dtype=np.int8),
            feature_contributions=[],
            metadata={**metadata, "note": "no_samples"},
        )
    # Exactly 1 sample: can't train, mark as unknown (score 0, not anomalous).
    return EnsembleResult(
        anomaly_flags=np.array([False]),
        ensemble_scores=np.array([0.0]),
        individual_model_predictions={
            "IsolationForest": np.array([0], dtype=np.int8),
            "LocalOutlierFactor": np.array([0], dtype=np.int8),
            "OneClassSVM": np.array([0], dtype=np.int8),
        },
        confidence_level=np.array([0], dtype=np.int8),
        feature_contributions=[
            {f: 0.0 for f in FEATURE_NAMES[:n_features]}
        ],
        metadata={**metadata, "note": "single_sample_insufficient"},
    )


def _feature_contributions(
    model: IsolationForest,
    X_scaled: NDArray,
    baseline_scores: NDArray,
    n_features: int,
    rng: np.random.RandomState,
) -> List[Dict[str, float]]:
    """Estimate per-feature importance via single-pass permutation on IF scores.

    For each feature *j* we shuffle column *j*, recompute IF anomaly scores,
    and measure how much each sample's score changed.  Larger changes ⇒ the
    feature matters more for that sample.  The result is normalised per-sample
    to sum to 1.

    Complexity: O(n_features × n_samples × n_estimators) – one
    ``score_samples`` call per feature, same as inference.
    """
    n_samples = X_scaled.shape[0]
    importances = np.zeros((n_samples, n_features), dtype=np.float64)

    for j in range(n_features):
        X_perm = X_scaled.copy()
        rng.shuffle(X_perm[:, j])  # in-place shuffle of column j
        perm_scores = -model.score_samples(X_perm)
        importances[:, j] = np.abs(perm_scores - baseline_scores)

    # Normalise each row to sum to 1 (avoid /0).
    row_sums = importances.sum(axis=1, keepdims=True)
    row_sums[row_sums == 0] = 1.0
    importances /= row_sums

    feat_names = FEATURE_NAMES[:n_features]
    return [
        {feat_names[j]: round(float(importances[i, j]), 4) for j in range(n_features)}
        for i in range(n_samples)
    ]


# ---------------------------------------------------------------------------
# Convenience wrapper for the existing pipeline
# ---------------------------------------------------------------------------

def run_ensemble_on_feature_dict(
    features_dict: Dict[str, Dict[str, float]],
    **kwargs,
) -> Optional[Dict[str, dict]]:
    """Bridge between ``extract_features()`` output and the ensemble.

    Parameters
    ----------
    features_dict : dict[wallet, feature_dict]
        As returned by ``extract_features`` in app.py.

    Returns
    -------
    dict[wallet, result_dict] or None
        Per-wallet anomaly result, or None when insufficient data.
    """
    wallets = list(features_dict.keys())
    if not wallets:
        return None

    matrix = np.array(
        [
            [
                features_dict[w].get("actions_per_minute", 0.0),
                features_dict[w].get("total_actions", 0.0),
                features_dict[w].get("file_views", 0.0),
                features_dict[w].get("uploads", 0.0),
                features_dict[w].get("failed_attempts", 0.0),
                features_dict[w].get("unique_files_accessed", 0.0),
            ]
            for w in wallets
        ],
        dtype=np.float64,
    )

    result = detect_anomalies(matrix, **kwargs)

    per_wallet: dict[str, dict] = {}
    for idx, wallet in enumerate(wallets):
        per_wallet[wallet] = {
            "is_anomaly": bool(result.anomaly_flags[idx]),
            "risk_score": float(result.ensemble_scores[idx]),
            "model_votes": {
                model: int(preds[idx])
                for model, preds in result.individual_model_predictions.items()
            },
            "models_agreed": int(result.confidence_level[idx]),
            "feature_contributions": result.feature_contributions[idx],
        }

    return per_wallet
