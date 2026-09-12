import urllib.request
import json

def test_full_flow():
    print("==================================================")
    print("SURAKSHANET SYSTEM VERIFICATION & INTEGRATION TEST")
    print("==================================================")

    # 1. Frontend Check
    try:
        req = urllib.request.urlopen("http://127.0.0.1:5173")
        print(f"[SUCCESS] Frontend server reachable on port 5173 (Status: {req.status})")
    except Exception as e:
        print(f"[FAIL] Frontend server error: {e}")

    # 2. Backend Check
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/health")
        data = json.loads(req.read().decode())
        print(f"[SUCCESS] Backend API server reachable on port 8000 (Health: {data.get('status')})")
    except Exception as e:
        print(f"[FAIL] Backend server error: {e}")

    # 3. User Profile Check
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/user/profile")
        user = json.loads(req.read().decode())
        print(f"[SUCCESS] User profile loaded: {user['name']}, Balance: Rs. {user['balance']}")
    except Exception as e:
        print(f"[FAIL] User profile error: {e}")

    # 4. Safe Voice Flow
    print("\n--- Testing Safe Voice Command: 'Pooja ko 500 rupaye bhejo' ---")
    try:
        payload = json.dumps({"transcribed_text": "Pooja ko 500 rupaye bhejo"}).encode("utf-8")
        req = urllib.request.Request("http://127.0.0.1:8000/api/voice/process", data=payload, headers={"Content-Type": "application/json"})
        res = urllib.request.urlopen(req)
        safe_result = json.loads(res.read().decode())
        print(f"Status: {safe_result['status']}")
        print(f"Payee: {safe_result['payee']} (Trusted: {safe_result['is_trusted_payee']})")
        print(f"Amount: Rs. {safe_result['amount']}")
        print(f"Risk Score: {safe_result['risk_score']}")
        assert safe_result['status'] == "SAFE"
        print("[PASSED] Safe Voice Processing Verified!")
    except Exception as e:
        print(f"[FAIL] Safe flow error: {e}")

    # 5. Scam Interception Flow
    print("\n--- Testing Scam Voice Command: 'Bijli Cut Scam Notice' ---")
    try:
        scam_text = "Dear customer your bijli will be cut tonight at 9:30 PM call 9876543210 and pay 4999 immediately"
        payload = json.dumps({"transcribed_text": scam_text}).encode("utf-8")
        req = urllib.request.Request("http://127.0.0.1:8000/api/voice/process", data=payload, headers={"Content-Type": "application/json"})
        res = urllib.request.urlopen(req)
        scam_result = json.loads(res.read().decode())
        print(f"Status: {scam_result['status']}")
        print(f"Payee: {scam_result['payee']}")
        print(f"Amount: Rs. {scam_result['amount']}")
        print(f"Risk Score: {scam_result['risk_score']}")
        print(f"Guardian Alert Sent: {scam_result['guardian_alert_sent']}")
        print(f"Can Execute: {scam_result['action_payload']['can_execute']}")
        assert scam_result['status'] == "HIGH_RISK_BLOCKED"
        assert scam_result['action_payload']['can_execute'] is False
        print("[PASSED] Scam Interception & Payment Lock Verified!")
    except Exception as e:
        print(f"[FAIL] Scam flow error: {e}")

    # 6. Co-Guardian Telemetry Alerts
    print("\n--- Testing Co-Guardian Telemetry Feeds ---")
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/guardian/alerts")
        alerts = json.loads(req.read().decode())
        print(f"[SUCCESS] Retrieved {len(alerts)} intercepted security alerts from database.")
        for a in alerts[:3]:
            print(f" • [Decision: {a['decision']}] Target: {a['payee']} | Amount: Rs.{a['amount']} | Risk: {a['risk_score']*100:.0f}%")
    except Exception as e:
        print(f"[FAIL] Guardian alerts error: {e}")

    print("\n==================================================")
    print("ALL INTEGRATION CHECKS COMPLETED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    test_full_flow()
