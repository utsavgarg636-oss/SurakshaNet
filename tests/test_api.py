import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.seed import seed_database

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    seed_database()

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_user_profile(client):
    response = client.get("/api/user/profile")
    assert response.status_code == 200
    data = response.json()
    assert "Ramesh Sharma" in data["name"]
    assert data["balance"] == 24500.0
    assert "Amit Sharma" in data["guardian_name"]

def test_trusted_contacts(client):
    response = client.get("/api/contacts")
    assert response.status_code == 200
    contacts = response.json()
    contact_names = [c["contact_name"] for c in contacts]
    assert "Dr. Verma (Clinic)" in contact_names
    assert "Pooja (Daughter)" in contact_names
    assert "UPPCL Electricity" in contact_names

def test_voice_process_safe_transfer(client):
    payload = {"transcribed_text": "Pooja ko 500 rupaye bhejo"}
    response = client.post("/api/voice/process", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SAFE"
    assert data["payee"] == "Pooja (Daughter)"
    assert data["amount"] == 500.0
    assert data["is_trusted_payee"] is True
    assert data["risk_score"] < 0.35
    assert data["action_payload"]["can_execute"] is True

def test_voice_process_electricity_scam(client):
    payload = {
        "transcribed_text": "Dear customer your bijli will be cut tonight at 9:30 PM call 9876543210 and pay 4999 immediately"
    }
    response = client.post("/api/voice/process", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HIGH_RISK_BLOCKED"
    assert data["risk_score"] >= 0.65
    assert data["guardian_alert_sent"] is True
    assert data["action_payload"]["can_execute"] is False
    assert len(data["warning_message_hindi"]) > 0

def test_voice_process_reverse_upi_scam(client):
    payload = {
        "transcribed_text": "Lottery prize lene ke liye turant apna UPI PIN dalo"
    }
    response = client.post("/api/voice/process", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HIGH_RISK_BLOCKED"
    assert data["risk_score"] >= 0.85
    assert data["guardian_alert_sent"] is True

def test_execute_safe_transaction(client):
    # Initial balance check
    profile_before = client.get("/api/user/profile").json()
    bal_before = profile_before["balance"]

    tx_payload = {
        "payee": "Dr. Verma (Clinic)",
        "amount": 750.0,
        "raw_speech": "Dr. Verma ko fees ke 750 rupaye bhejo",
        "risk_score": 0.05,
        "intent": "PAYMENT"
    }
    response = client.post("/api/transactions/execute", json=tx_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["new_balance"] == round(bal_before - 750.0, 2)

    # Check that alert logs do not flag safe tx
    profile_after = client.get("/api/user/profile").json()
    assert profile_after["balance"] == round(bal_before - 750.0, 2)

def test_guardian_alerts_retrieval(client):
    response = client.get("/api/guardian/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) >= 2
    for a in alerts:
        assert a["decision"] == "BLOCKED" or a["risk_score"] >= 0.65
