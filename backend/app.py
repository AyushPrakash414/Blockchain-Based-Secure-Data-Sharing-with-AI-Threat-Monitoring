from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any

import numpy as np
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.ensemble import IsolationForest

BASE_DIR = Path(__file__).resolve().parent
LOGS_DIR = BASE_DIR / "logs"
EVENTS_PATH = LOGS_DIR / "events.jsonl"
ALERTS_PATH = LOGS_DIR / "alerts.json"
WRITE_LOCK = Lock()

UPLOAD_ACTIONS = {"FILE_STORED_ONCHAIN_SUCCESS"}
FAIL_ACTIONS = {"FILE_UPLOAD_FAILED"}
VIEW_ACTIONS = {"FILE_VIEW_CLICKED"}
DISPLAY_ACTIONS = {"FILES_DISPLAY_REQUESTED"}
GRANT_ACTIONS = {"ACCESS_GRANTED"}


class LogEvent(BaseModel):
    ts: str | None = None
    wallet: str | None = None
    action: str
    result: str | None = "info"
    resource: str | None = None
    meta: dict[str, Any] = Field(default_factory=dict)


app = FastAPI(title="Blockchain Drive Logging API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5050"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def ensure_logs_dir() -> None:
    LOGS_DIR.mkdir(parents=True, exist_ok=True)


def normalize_event(event: LogEvent) -> dict[str, Any]:
    payload = event.model_dump()
    if not payload.get("ts"):
        payload["ts"] = utc_now_iso()
    payload["meta"] = payload.get("meta") or {}
    return payload


def read_json_lines(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []

    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


def read_alerts_file() -> list[dict[str, Any]]:
    if not ALERTS_PATH.exists():
        return []

    try:
        data = json.loads(ALERTS_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []

    return data if isinstance(data, list) else []


def write_alerts_file(alerts: list[dict[str, Any]]) -> None:
    ensure_logs_dir()
    with WRITE_LOCK:
        ALERTS_PATH.write_text(json.dumps(alerts, indent=2), encoding="utf-8")


def extract_wallet_features(events: list[dict[str, Any]]) -> dict[str, dict[str, int]]:
    features: dict[str, dict[str, int]] = defaultdict(
        lambda: {
            "uploads": 0,
            "fails": 0,
            "views": 0,
            "displays": 0,
            "grants": 0,
        }
    )

    for event in events:
        wallet = event.get("wallet")
        if not wallet:
            continue

        action = event.get("action")
        wallet_features = features[wallet]

        if action in UPLOAD_ACTIONS:
            wallet_features["uploads"] += 1
        if action in FAIL_ACTIONS:
            wallet_features["fails"] += 1
        if action in VIEW_ACTIONS:
            wallet_features["views"] += 1
        if action in DISPLAY_ACTIONS:
            wallet_features["displays"] += 1
        if action in GRANT_ACTIONS:
            wallet_features["grants"] += 1

    return dict(features)


def build_threshold_alerts(features: dict[str, dict[str, int]]) -> dict[str, dict[str, Any]]:
    alerts: dict[str, dict[str, Any]] = {}

    for wallet, counts in features.items():
        reasons: list[str] = []

        if counts["fails"] >= 3:
            reasons.append("High upload failures")
        if counts["views"] >= 8:
            reasons.append("High file views")
        if counts["displays"] >= 6:
            reasons.append("High display requests")

        if not reasons:
            continue

        score = min(
            0.99,
            0.4 + (counts["fails"] * 0.15) + (counts["views"] * 0.04) + (counts["displays"] * 0.03),
        )

        alerts[wallet] = {
            "ts": utc_now_iso(),
            "wallet": wallet,
            "score": round(score, 2),
            "reason": ", ".join(reasons),
            "recommended_action": "Review or revoke",
        }

    return alerts


def apply_isolation_forest(
    features: dict[str, dict[str, int]], alerts: dict[str, dict[str, Any]]
) -> dict[str, dict[str, Any]]:
    wallets = list(features.keys())
    if len(wallets) < 3:
        return alerts

    matrix = np.array(
        [
            [
                counts["uploads"],
                counts["fails"],
                counts["views"],
                counts["displays"],
                counts["grants"],
            ]
            for counts in features.values()
        ],
        dtype=float,
    )

    if not np.any(matrix):
        return alerts

    try:
        model = IsolationForest(contamination="auto", random_state=42)
        predictions = model.fit_predict(matrix)
        raw_scores = -model.score_samples(matrix)
    except Exception:
        return alerts

    min_score = float(raw_scores.min())
    max_score = float(raw_scores.max())
    denominator = (max_score - min_score) or 1.0

    for index, wallet in enumerate(wallets):
        if predictions[index] != -1:
            continue

        normalized_score = 0.5 + ((float(raw_scores[index]) - min_score) / denominator) * 0.49
        existing = alerts.get(wallet)

        if existing:
            existing["score"] = round(max(existing["score"], normalized_score), 2)
            if "IsolationForest outlier" not in existing["reason"]:
                existing["reason"] = f"{existing['reason']}, IsolationForest outlier"
            continue

        alerts[wallet] = {
            "ts": utc_now_iso(),
            "wallet": wallet,
            "score": round(normalized_score, 2),
            "reason": "IsolationForest outlier",
            "recommended_action": "Review or revoke",
        }

    return alerts


@app.post("/log")
def log_event(event: LogEvent) -> dict[str, Any]:
    payload = normalize_event(event)
    ensure_logs_dir()

    with WRITE_LOCK:
        with EVENTS_PATH.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload) + "\n")

    return {"status": "ok", "event": payload}


@app.get("/logs")
def get_logs(
    wallet: str | None = None,
    limit: int = Query(default=100, ge=1, le=1000),
) -> list[dict[str, Any]]:
    events = read_json_lines(EVENTS_PATH)

    if wallet:
        wallet_lower = wallet.lower()
        events = [event for event in events if str(event.get("wallet", "")).lower() == wallet_lower]

    return events[-limit:]


@app.get("/alerts")
def get_alerts() -> list[dict[str, Any]]:
    return read_alerts_file()


@app.post("/analyze")
def analyze_logs(
    limit: int = Query(default=500, ge=1, le=5000),
) -> list[dict[str, Any]]:
    events = read_json_lines(EVENTS_PATH)
    if limit:
        events = events[-limit:]

    features = extract_wallet_features(events)
    alerts = build_threshold_alerts(features)
    alerts = apply_isolation_forest(features, alerts)

    ordered_alerts = sorted(alerts.values(), key=lambda alert: alert["score"], reverse=True)
    write_alerts_file(ordered_alerts)
    return ordered_alerts
