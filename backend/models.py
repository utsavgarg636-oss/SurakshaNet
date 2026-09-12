import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship as orm_relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    balance = Column(Float, default=0.0, nullable=False)
    guardian_name = Column(String(100), nullable=False)
    guardian_phone = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    trusted_contacts = orm_relationship("TrustedContact", back_populates="user", cascade="all, delete-orphan")


class TrustedContact(Base):
    __tablename__ = "trusted_contacts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contact_name = Column(String(100), nullable=False)
    upi_id = Column(String(100), nullable=False)
    relationship = Column(String(50), nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    user = orm_relationship("User", back_populates="trusted_contacts")


class ScamRule(Base):
    __tablename__ = "scam_rules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    pattern_name = Column(String(100), nullable=False)
    regex_trigger = Column(Text, nullable=False)
    severity_level = Column(String(20), default="HIGH", nullable=False) # CRITICAL, HIGH, MEDIUM
    description = Column(Text, nullable=True)
    category = Column(String(50), default="SOCIAL_ENGINEERING", nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    raw_speech = Column(Text, nullable=False)
    extracted_intent = Column(String(50), nullable=False) # PAYMENT, BILL_PAY, UNKNOWN, SCAM_QUERY
    payee = Column(String(100), nullable=True)
    amount = Column(Float, default=0.0, nullable=False)
    risk_score = Column(Float, default=0.0, nullable=False) # 0.0 to 1.0
    decision = Column(String(20), nullable=False) # ALLOWED, BLOCKED
    audio_reason = Column(Text, nullable=True) # Text returned for TTS warning/reassurance
    heuristic_reasons = Column(Text, nullable=True) # JSON or bullet summary of triggered heuristics
    llm_explanation = Column(Text, nullable=True) # Explanation from semantic classifier
    guardian_alert_sent = Column(Boolean, default=False, nullable=False)
