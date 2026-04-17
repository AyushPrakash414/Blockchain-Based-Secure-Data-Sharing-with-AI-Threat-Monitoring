import os
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any
import math

import httpx
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.ensemble import IsolationForest
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Blockchain Drive AI Security", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5050", "http://localhost:5173", "*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class LogEvent(BaseModel):
    ts: str | None = None
    wallet: str | None = None
    action: str
    result: str | None = "info"
    resource: str | None = None
    meta: dict[str, Any] = Field(default_factory=dict)

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def trigger_webhook_alert(wallet: str, score: float, reason: str):
    if not DISCORD_WEBHOOK_URL:
        return
        
    embed = {
        "title": "🚨 Critical Security Threat Detected",
        "color": 16711680,
        "fields": [
            {"name": "Wallet Address", "value": f"`{wallet}`"},
            {"name": "Threat Score", "value": f"**{score}/100**"},
            {"name": "Trigger Reason", "value": reason}
        ]
    }
    try:
        httpx.post(DISCORD_WEBHOOK_URL, json={"embeds": [embed]}, timeout=5.0)
    except Exception as e:
        print(f"Webhook failed: {e}")

def extract_features(logs: list[dict]) -> dict[str, dict]:
    # Group by wallet
    wallets = defaultdict(list)
    for log in logs:
        wallet = log.get("wallet_address")
        if wallet:
            wallets[wallet].append(log)

    features = {}
    for wallet, user_logs in wallets.items():
        if not user_logs:
            continue
            
        uploads = 0
        failed_attempts = 0
        file_views = 0
        unique_files = set()
        
        # Calculate time span for actions_per_minute
        timestamps = []

        for lg in user_logs:
            action = lg.get("action", "")
            result = lg.get("result", "")
            meta = lg.get("metadata", {})
            
            if action in ["FILE_STORED_ONCHAIN_SUCCESS", "FILE_UPLOADED_TO_IPFS"]:
                uploads += 1
            if result == "error" or action == "FILE_UPLOAD_FAILED":
                failed_attempts += 1
            if action == "FILE_VIEW_CLICKED":
                file_views += 1
                
            # track unique files if applicable
            url = meta.get("fileUrl") or meta.get("cid") or meta.get("gatewayUrl")
            if url:
                unique_files.add(url)
                
            ts_str = lg.get("timestamp")
            if ts_str:
                try:
                    # simplistic parse
                    ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                    timestamps.append(ts.timestamp())
                except:
                    pass

        total_actions = len(user_logs)
        
        actions_per_minute = 0
        if len(timestamps) > 1:
            span_seconds = max(timestamps) - min(timestamps)
            if span_seconds > 0:
                actions_per_minute = (total_actions / span_seconds) * 60.0
            else:
                actions_per_minute = total_actions
        else:
            actions_per_minute = total_actions

        features[wallet] = {
            "actions_per_minute": float(actions_per_minute),
            "total_actions": total_actions,
            "file_views": file_views,
            "uploads": uploads,
            "failed_attempts": failed_attempts,
            "unique_files_accessed": len(unique_files)
        }
        
    return features

def run_ai_pipeline():
    print("Running AI Pipeline...")
    # 1. Fetch recent logs from Supabase (e.g. last 1000 to keep it relevant)
    response = supabase.table("access_logs").select("*").order("timestamp", desc=True).limit(1000).execute()
    logs = response.data
    
    if not logs:
        return
        
    # 2. Convert to features
    features_dict = extract_features(logs)
    wallets = list(features_dict.keys())
    
    if len(wallets) < 2:
        return # Not enough data for isolation forest
        
    # Build matrix
    matrix = []
    for w in wallets:
        f = features_dict[w]
        matrix.append([
            f["actions_per_minute"],
            f["total_actions"],
            f["file_views"],
            f["uploads"],
            f["failed_attempts"],
            f["unique_files_accessed"],
        ])
        
    X = np.array(matrix, dtype=float)
    
    # 3. Handle identical rows bug in IsolationForest
    # Adding tiny noise so standard deviation isn't 0
    noise = np.random.normal(0, 0.0001, X.shape)
    X_noisy = X + noise

    # 4. Run Isolation Forest
    try:
        model = IsolationForest(contamination="auto", random_state=42)
        model.fit(X_noisy)
        # Higher score_samples means MORE normal. Negative means outlier.
        raw_scores = -model.score_samples(X_noisy)
    except Exception as e:
        print(f"ML Error: {e}")
        return

    # Normalize score 0 to 1
    min_s = float(raw_scores.min())
    max_s = float(raw_scores.max())
    denominator = (max_s - min_s) or 1.0

    # We only care about anomalies
    predictions = model.predict(X_noisy)

    for idx, wallet in enumerate(wallets):
        # IsolationForest returns -1 for outliers
        if predictions[idx] != -1:
            # Let's also check hard thresholds as fallback
            f = features_dict[wallet]
            if f["failed_attempts"] > 5 or f["actions_per_minute"] > 30:
                is_anomaly = True
                score = 0.8
                reason = "Hard threshold exceeded (Spam or Failures)"
            else:
                continue
        else:
            is_anomaly = True
            norm_score = (float(raw_scores[idx]) - min_s) / denominator
            # Scale it to 0-1 heavily weighted to higher end for outliers
            score = 0.5 + (max(0, norm_score) * 0.5)
            reason = "Isolation Forest AI Anomaly"

        # Overwrite if hard threshold triggers and ML flagged it too
        if is_anomaly:
            risk_score_100 = round(score * 100, 2)
            
            # Check if we already alerted recently (in last 1 hour) for this wallet
            recent = supabase.table("alerts").select("id").eq("wallet_address", wallet).gte("risk_score", 50.0).order("created_at", desc=True).limit(1).execute()
            
            if not recent.data:
                severity = "critical" if risk_score_100 > 80 else "high"
                
                new_alert = {
                    "wallet_address": wallet,
                    "risk_score": risk_score_100,
                    "severity": severity,
                    "message": reason,
                    "recommended_action": "Review activity or Revoke Access",
                }
                
                # Insert to Supabase directly
                supabase.table("alerts").insert(new_alert).execute()
                
                # Send Webhook
                trigger_webhook_alert(wallet, risk_score_100, reason)


@app.post("/log")
def log_event(event: LogEvent, background_tasks: BackgroundTasks):
    payload = {
        "wallet_address": event.wallet,
        "action": event.action,
        "result": event.result,
        "timestamp": event.ts or utc_now_iso(),
        "metadata": event.meta
    }
    
    # 1. Dual write capability (if frontend didn't write to SB itself)
    # The frontend is already inserting directly, so this isn't strictly necessary.
    # But it acts as a reliable fallback.
    try:
        supabase.table("access_logs").insert(payload).execute()
    except Exception as e:
        print(f"Failed to log to SB: {e}")
        
    # 2. Trigger AI Pipeline in background
    background_tasks.add_task(run_ai_pipeline)
    
    return {"status": "ok"}

@app.get("/logs")
def get_logs(wallet: str | None = None, limit: int = 100):
    query = supabase.table("access_logs").select("*").order("timestamp", desc=True).limit(limit)
    if wallet:
        query = query.ilike("wallet_address", wallet)
    resp = query.execute()
    return resp.data

@app.get("/alerts")
def get_alerts():
    resp = supabase.table("alerts").select("*").order("created_at", desc=True).limit(50).execute()
    return resp.data

@app.post("/analyze")
def analyze_logs():
    run_ai_pipeline()
    resp = supabase.table("alerts").select("*").order("created_at", desc=True).limit(10).execute()
    return resp.data

