import os
import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from backend.database import get_db, engine, Base
from backend.models import User, TrustedContact, ScamRule, AuditLog
from backend.risk_engine import analyze_transaction_risk
from backend.seed import seed_database

load_dotenv()

# Initialize FastAPI App
app = FastAPI(
    title="SurakshaNet API",
    description="Dual-Layer AI Financial Safety & Social Engineering Interceptor for Senior Citizens",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Request / Response Schemas ----------------- #

class VoiceProcessRequest(BaseModel):
    transcribed_text: str = Field(..., description="Vernacular or English transcribed speech input")

class ActionPayload(BaseModel):
    can_execute: bool
    payee: str
    amount: float
    risk_score: float
    category: str

class VoiceProcessResponse(BaseModel):
    intent: str
    payee: str
    amount: float
    is_trusted_payee: bool
    risk_score: float
    status: str # "SAFE" | "HIGH_RISK_BLOCKED"
    warning_message_hindi: str
    heuristic_reasons: List[str]
    llm_explanation: str
    guardian_alert_sent: bool
    action_payload: ActionPayload

class TransactionExecuteRequest(BaseModel):
    payee: str
    amount: float
    raw_speech: str
    risk_score: float = 0.0
    audio_reason: Optional[str] = None
    intent: str = "PAYMENT"

class TransactionExecuteResponse(BaseModel):
    success: bool
    message: str
    transaction_id: int
    new_balance: float
    payee: str
    amount: float
    timestamp: str

class GuardianAlertItem(BaseModel):
    id: int
    timestamp: str
    raw_speech: str
    extracted_intent: str
    payee: str
    amount: float
    risk_score: float
    decision: str
    audio_reason: Optional[str]
    heuristic_reasons: Optional[str]
    llm_explanation: Optional[str]
    guardian_alert_sent: bool

# ----------------- Routes ----------------- #

@app.get("/")
def root_status():
    return {
        "status": "online",
        "system": "SurakshaNet Financial Guardian AI",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/user/profile")
def get_user_profile(db: Session = Depends(get_db)):
    """Fetches default senior citizen profile details."""
    user = db.query(User).first()
    if not user:
        # Auto seed if empty
        seed_database()
        user = db.query(User).first()

    return {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "balance": user.balance,
        "guardian_name": user.guardian_name,
        "guardian_phone": user.guardian_phone
    }


@app.get("/api/contacts")
def get_trusted_contacts(db: Session = Depends(get_db)):
    """Returns all pre-approved family & utility contacts."""
    contacts = db.query(TrustedContact).all()
    return [
        {
            "id": c.id,
            "contact_name": c.contact_name,
            "upi_id": c.upi_id,
            "relationship": c.relationship,
            "is_verified": c.is_verified
        }
        for c in contacts
    ]


@app.post("/api/voice/process", response_model=VoiceProcessResponse)
def process_voice_command(request: VoiceProcessRequest, db: Session = Depends(get_db)):
    """
    Core Voice Ingestion & Dual-Layer Risk Engine Evaluation.
    Accepts transcribed text, evaluates heuristic + LLM zero-shot classifier,
    determines SAFE or HIGH_RISK_BLOCKED, and logs threats.
    """
    raw_text = request.transcribed_text.strip()
    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcribed text cannot be empty."
        )

    # Run Dual-Layer Risk Analysis
    result = analyze_transaction_risk(raw_text, db)

    # If HIGH RISK, automatically write to audit logs with BLOCKED decision
    if result["status"] == "HIGH_RISK_BLOCKED":
        audit_entry = AuditLog(
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            raw_speech=raw_text,
            extracted_intent=result["intent"],
            payee=result["payee"],
            amount=result["amount"],
            risk_score=result["risk_score"],
            decision="BLOCKED",
            audio_reason=result["warning_message_hindi"],
            heuristic_reasons=" | ".join(result["heuristic_reasons"]),
            llm_explanation=result["llm_explanation"],
            guardian_alert_sent=True
        )
        db.add(audit_entry)
        db.commit()

    return result


@app.post("/api/transactions/execute", response_model=TransactionExecuteResponse)
def execute_transaction(request: TransactionExecuteRequest, db: Session = Depends(get_db)):
    """
    Executes mock transaction if SAFE, updates user balance, and writes to audit_logs.
    """
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid transaction amount.")

    if user.balance < request.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient funds. Current balance is ₹{user.balance:.2f}."
        )

    # Deduct balance
    user.balance = round(user.balance - request.amount, 2)

    # Create audit log
    audit_entry = AuditLog(
        timestamp=datetime.datetime.now(datetime.timezone.utc),
        raw_speech=request.raw_speech,
        extracted_intent=request.intent,
        payee=request.payee,
        amount=request.amount,
        risk_score=request.risk_score,
        decision="ALLOWED",
        audio_reason=request.audio_reason or f"Successfully paid ₹{request.amount} to {request.payee}.",
        heuristic_reasons="Passed dual-layer verification.",
        llm_explanation="User authorized transaction.",
        guardian_alert_sent=False
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    db.refresh(user)

    return {
        "success": True,
        "message": f"Payment of ₹{request.amount:.2f} to {request.payee} completed successfully.",
        "transaction_id": audit_entry.id,
        "new_balance": user.balance,
        "payee": request.payee,
        "amount": request.amount,
        "timestamp": audit_entry.timestamp.isoformat()
    }


@app.get("/api/guardian/alerts", response_model=List[GuardianAlertItem])
def get_guardian_alerts(db: Session = Depends(get_db)):
    """
    Returns flagged high-risk attempts and blocked transactions for Co-Guardian dashboard.
    """
    alerts = db.query(AuditLog).filter(
        (AuditLog.decision == "BLOCKED") | (AuditLog.risk_score >= 0.65)
    ).order_by(AuditLog.timestamp.desc()).all()

    return [
        {
            "id": a.id,
            "timestamp": a.timestamp.isoformat(),
            "raw_speech": a.raw_speech,
            "extracted_intent": a.extracted_intent,
            "payee": a.payee or "Unknown",
            "amount": a.amount,
            "risk_score": a.risk_score,
            "decision": a.decision,
            "audio_reason": a.audio_reason,
            "heuristic_reasons": a.heuristic_reasons,
            "llm_explanation": a.llm_explanation,
            "guardian_alert_sent": a.guardian_alert_sent
        }
        for a in alerts
    ]


@app.get("/api/audit-logs")
def get_all_audit_logs(db: Session = Depends(get_db)):
    """Returns complete chronological security audit log."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
    return [
        {
            "id": l.id,
            "timestamp": l.timestamp.isoformat(),
            "raw_speech": l.raw_speech,
            "extracted_intent": l.extracted_intent,
            "payee": l.payee or "Unknown",
            "amount": l.amount,
            "risk_score": l.risk_score,
            "decision": l.decision,
            "audio_reason": l.audio_reason,
            "heuristic_reasons": l.heuristic_reasons,
            "llm_explanation": l.llm_explanation,
            "guardian_alert_sent": l.guardian_alert_sent
        }
        for l in logs
    ]


@app.get("/api/scam-rules")
def get_scam_rules(db: Session = Depends(get_db)):
    """Returns active heuristic detection rules for telemetry monitoring."""
    rules = db.query(ScamRule).all()
    return [
        {
            "id": r.id,
            "pattern_name": r.pattern_name,
            "category": r.category,
            "severity_level": r.severity_level,
            "description": r.description
        }
        for r in rules
    ]


@app.post("/api/reset-demo")
def reset_demo_database():
    """Resets database to clean initial state for demonstration."""
    seed_database()
    return {"success": True, "message": "Demo database reset to initial state."}
