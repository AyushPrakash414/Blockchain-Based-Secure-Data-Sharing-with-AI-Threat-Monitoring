"""
Tests for the anomaly_ensemble module.

Run with:  python -m pytest test_anomaly_ensemble.py -v
       or: python test_anomaly_ensemble.py
"""

import time
import numpy as np
import sys

from anomaly_ensemble import (
    detect_anomalies,
    run_ensemble_on_feature_dict,
    EnsembleResult,
    FEATURE_NAMES,
)

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _make_normal_data(n: int = 50, seed: int = 0) -> np.ndarray:
    """Generate synthetic 'normal' user behaviour."""
    rng = np.random.RandomState(seed)
    return np.column_stack([
        rng.uniform(1, 5, n),      # actions_per_minute
        rng.randint(5, 30, n),     # total_actions
        rng.randint(1, 10, n),     # file_views
        rng.randint(0, 5, n),      # uploads
        rng.randint(0, 2, n),      # failed_attempts
        rng.randint(1, 8, n),      # unique_files_accessed
    ]).astype(np.float64)


def _make_data_with_outliers(n_normal: int = 50, n_outlier: int = 3, seed: int = 0):
    """Normal data + obvious outliers appended at the end."""
    normal = _make_normal_data(n_normal, seed)
    rng = np.random.RandomState(seed + 99)
    outliers = np.column_stack([
        rng.uniform(80, 200, n_outlier),   # extreme actions_per_minute
        rng.randint(500, 2000, n_outlier), # extreme total_actions
        rng.randint(100, 500, n_outlier),  # extreme file_views
        rng.randint(50, 200, n_outlier),   # extreme uploads
        rng.randint(20, 80, n_outlier),    # many failed_attempts
        rng.randint(50, 200, n_outlier),   # extreme unique_files
    ]).astype(np.float64)
    return np.vstack([normal, outliers])


# ──────────────────────────────────────────────────────────────────────────────
# Tests
# ──────────────────────────────────────────────────────────────────────────────

def test_basic_output_shape():
    """Result arrays should match the number of input samples."""
    X = _make_normal_data(30)
    r = detect_anomalies(X)

    assert isinstance(r, EnsembleResult)
    assert r.anomaly_flags.shape == (30,)
    assert r.ensemble_scores.shape == (30,)
    assert r.confidence_level.shape == (30,)
    assert len(r.feature_contributions) == 30
    for model_preds in r.individual_model_predictions.values():
        assert model_preds.shape == (30,)
    print("  ✓  test_basic_output_shape")


def test_score_range():
    """Ensemble scores must be in [0, 100]."""
    X = _make_data_with_outliers()
    r = detect_anomalies(X)
    assert r.ensemble_scores.min() >= 0.0
    assert r.ensemble_scores.max() <= 100.0
    print("  ✓  test_score_range")


def test_outliers_detected():
    """Injected extreme outliers should be flagged with high scores."""
    X = _make_data_with_outliers(n_normal=60, n_outlier=3)
    r = detect_anomalies(X, risk_threshold=40.0)

    # The last 3 rows are the injected outliers
    outlier_scores = r.ensemble_scores[-3:]
    normal_avg = r.ensemble_scores[:-3].mean()

    # Outlier scores should be notably higher than the normal average
    assert outlier_scores.min() > normal_avg, (
        f"Outlier min score ({outlier_scores.min():.1f}) should exceed "
        f"normal average ({normal_avg:.1f})"
    )
    print("  ✓  test_outliers_detected")


def test_confidence_values():
    """Confidence must be between 0 and 3."""
    X = _make_data_with_outliers()
    r = detect_anomalies(X)
    assert r.confidence_level.min() >= 0
    assert r.confidence_level.max() <= 3
    print("  ✓  test_confidence_values")


def test_feature_contributions_sum():
    """Per-sample feature contributions should sum to ~1."""
    X = _make_data_with_outliers()
    r = detect_anomalies(X)
    for contrib in r.feature_contributions:
        total = sum(contrib.values())
        assert abs(total - 1.0) < 0.01, f"Feature contributions sum = {total}"
    print("  ✓  test_feature_contributions_sum")


def test_feature_contribution_keys():
    """Every contribution dict should have the correct feature names."""
    X = _make_normal_data(10)
    r = detect_anomalies(X)
    for contrib in r.feature_contributions:
        assert set(contrib.keys()) == set(FEATURE_NAMES)
    print("  ✓  test_feature_contribution_keys")


def test_individual_model_predictions():
    """Individual model predictions must be binary (0 or 1)."""
    X = _make_data_with_outliers()
    r = detect_anomalies(X)
    for name, preds in r.individual_model_predictions.items():
        unique = set(preds.tolist())
        assert unique <= {0, 1}, f"{name} has unexpected values: {unique}"
    print("  ✓  test_individual_model_predictions")


# ── Edge-case tests ──────────────────────────────────────────────────────────

def test_empty_input():
    """Zero-sample input should return empty arrays."""
    X = np.empty((0, 6), dtype=np.float64)
    r = detect_anomalies(X)
    assert len(r.anomaly_flags) == 0
    assert len(r.ensemble_scores) == 0
    assert r.metadata.get("note") == "no_samples"
    print("  ✓  test_empty_input")


def test_single_sample():
    """A single sample can't train models → neutral fallback."""
    X = np.array([[5.0, 20.0, 3.0, 2.0, 0.0, 4.0]])
    r = detect_anomalies(X)
    assert len(r.anomaly_flags) == 1
    assert r.anomaly_flags[0] == False
    assert r.ensemble_scores[0] == 0.0
    assert r.metadata.get("note") == "single_sample_insufficient"
    print("  ✓  test_single_sample")


def test_identical_rows():
    """All-identical input should not crash and should flag nothing."""
    row = [3.0, 10.0, 2.0, 1.0, 0.0, 3.0]
    X = np.array([row] * 20, dtype=np.float64)
    r = detect_anomalies(X)
    assert not r.anomaly_flags.any(), "Identical rows should not be anomalous"
    assert r.metadata.get("note") == "all_rows_identical"
    print("  ✓  test_identical_rows")


def test_nan_handling():
    """NaN values should be imputed, not crash the pipeline."""
    X = _make_normal_data(20)
    X[0, 0] = np.nan
    X[5, 3] = np.nan
    X[10, 5] = np.inf
    r = detect_anomalies(X)
    assert r.anomaly_flags.shape == (20,)
    assert r.metadata.get("nan_imputed_count") == 3
    # Scores must still be valid numbers
    assert not np.isnan(r.ensemble_scores).any()
    print("  ✓  test_nan_handling")


# ── Bridge function test ─────────────────────────────────────────────────────

def test_run_ensemble_on_feature_dict():
    """The wallet-keyed bridge should return per-wallet results."""
    features = {
        "0xaaa": {
            "actions_per_minute": 3.0, "total_actions": 15,
            "file_views": 5, "uploads": 2,
            "failed_attempts": 0, "unique_files_accessed": 4,
        },
        "0xbbb": {
            "actions_per_minute": 120.0, "total_actions": 800,
            "file_views": 200, "uploads": 100,
            "failed_attempts": 50, "unique_files_accessed": 150,
        },
        "0xccc": {
            "actions_per_minute": 2.5, "total_actions": 10,
            "file_views": 3, "uploads": 1,
            "failed_attempts": 0, "unique_files_accessed": 3,
        },
    }
    results = run_ensemble_on_feature_dict(features)
    assert results is not None
    assert set(results.keys()) == {"0xaaa", "0xbbb", "0xccc"}

    # The obvious outlier 0xbbb should have a higher score
    assert results["0xbbb"]["risk_score"] > results["0xaaa"]["risk_score"]
    assert "model_votes" in results["0xbbb"]
    assert "feature_contributions" in results["0xbbb"]
    print("  ✓  test_run_ensemble_on_feature_dict")


# ── Performance test ─────────────────────────────────────────────────────────

def test_inference_speed():
    """Ensemble on 200 samples should complete well under 5 seconds."""
    X = _make_data_with_outliers(n_normal=197, n_outlier=3)
    t0 = time.perf_counter()
    _ = detect_anomalies(X)
    elapsed = time.perf_counter() - t0
    assert elapsed < 5.0, f"Too slow: {elapsed:.2f}s"
    print(f"  ✓  test_inference_speed  ({elapsed:.3f}s for 200 samples)")


# ──────────────────────────────────────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    tests = [
        test_basic_output_shape,
        test_score_range,
        test_outliers_detected,
        test_confidence_values,
        test_feature_contributions_sum,
        test_feature_contribution_keys,
        test_individual_model_predictions,
        test_empty_input,
        test_single_sample,
        test_identical_rows,
        test_nan_handling,
        test_run_ensemble_on_feature_dict,
        test_inference_speed,
    ]

    print(f"\nRunning {len(tests)} tests…\n")
    passed = 0
    failed = 0
    for test_fn in tests:
        try:
            test_fn()
            passed += 1
        except Exception as e:
            print(f"  ✗  {test_fn.__name__}: {e}")
            failed += 1

    print(f"\n{'='*50}")
    print(f"Results: {passed} passed, {failed} failed out of {len(tests)}")
    print(f"{'='*50}\n")
    sys.exit(1 if failed else 0)
