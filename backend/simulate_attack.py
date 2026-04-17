import requests
import time
from datetime import datetime, timezone

BASE_URL = "http://localhost:8000/log"

def utc_now_iso():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def run_test_1():
    print("🚨 Running Test Case 1: Rapid actions (Bot Behavior)...")
    wallet = "0xBotRapidTest"
    # Send 20 rapid views
    for i in range(25):
        payload = {
            "ts": utc_now_iso(),
            "wallet": wallet,
            "action": "FILE_VIEW_CLICKED",
            "result": "info",
            "meta": {}
        }
        try:
            requests.post(BASE_URL, json=payload)
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(0.01) # rapid
    print("✅ Intentionally spammed 25 file views in under 1 second.")

def run_test_2():
    print("\n🚨 Running Test Case 2: Multiple Failures...")
    wallet = "0xHackerFailTest"
    for i in range(12):
        payload = {
            "ts": utc_now_iso(),
            "wallet": wallet,
            "action": "ACCESS_DENIED",
            "result": "error", # result="error" hits the failed_attempts feature
            "meta": {}
        }
        try:
            requests.post(BASE_URL, json=payload)
        except Exception as e:
            pass
        time.sleep(0.05)
    print("✅ Intentionally triggered 12 critical errors/failures.")

if __name__ == "__main__":
    print("Starting AI Simulation Attacks...\n")
    run_test_1()
    time.sleep(2) # brief pause
    run_test_2()
    print("\n✅ Simulation complete. The backend AI processing background task has captured these logs.")
    print("If you check Supabase, the Alerts table should intercept these almost immediately.\n")
    
    time.sleep(2) # Give background tasks a second to finish writing to Supabase
    
    # Query the alerts to grab the proofs
    print("🔍 Fetching Recent Alerts from Backend...")
    try:
        r = requests.get("http://localhost:8000/alerts")
        alerts = r.json()
        print(f"Found {len(alerts)} recent alerts. Showing top 3:")
        for al in alerts[:3]:
            print(f"  Wallet: {al.get('wallet_address')}")
            print(f"  Score:  {al.get('risk_score')} ({al.get('severity')})")
            print(f"  Reason: {al.get('message')}\n")
    except Exception as e:
        print("Could not fetch alerts", e)
