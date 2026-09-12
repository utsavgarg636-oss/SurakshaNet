import datetime
from backend.database import SessionLocal, engine, Base
from backend.models import User, TrustedContact, ScamRule, AuditLog

def seed_database():
    """Drops existing tables, creates fresh tables, and seeds initial data."""
    print("Creating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding default senior citizen user...")
        user = User(
            name="Ramesh Sharma (Age 68)",
            phone="+91 9876543210",
            balance=24500.00,
            guardian_name="Amit Sharma (Son)",
            guardian_phone="+91 9812345678"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        print("Seeding trusted contacts...")
        contacts = [
            TrustedContact(
                user_id=user.id,
                contact_name="Dr. Verma (Clinic)",
                upi_id="drverma@okhdfcbank",
                relationship="Doctor",
                is_verified=True
            ),
            TrustedContact(
                user_id=user.id,
                contact_name="Pooja (Daughter)",
                upi_id="pooja.sharma@okaxis",
                relationship="Daughter",
                is_verified=True
            ),
            TrustedContact(
                user_id=user.id,
                contact_name="UPPCL Electricity",
                upi_id="uppcl.bills@icici",
                relationship="Utility Biller",
                is_verified=True
            ),
            TrustedContact(
                user_id=user.id,
                contact_name="Suresh Kirana Store",
                upi_id="suresh.kirana@paytm",
                relationship="Local Merchant",
                is_verified=True
            )
        ]
        db.add_all(contacts)

        print("Seeding known scam regex signatures...")
        scam_rules = [
            ScamRule(
                pattern_name="Electricity Disconnection Threat",
                regex_trigger=r"(bijli|electricity|power|power bill).*(cut|disconnect|kat jayegi|band ho jayegi|kat di jayegi|tonight|aaj raat)",
                severity_level="CRITICAL",
                category="URGENCY_EXTORTION",
                description="Threatens immediate power disconnect to coerce immediate payment to personal UPI."
            ),
            ScamRule(
                pattern_name="Fake Lottery & KYC Reward",
                regex_trigger=r"(lottery|prize|reward|lucky draw|winner|kyc expire|kyc update|account block|pan card update)",
                severity_level="CRITICAL",
                category="PHISHING_REWARD",
                description="Lures senior citizen with fake prize or urgent KYC suspension scare."
            ),
            ScamRule(
                pattern_name="Reverse UPI Collect Scam",
                regex_trigger=r"(enter pin to receive|pin daalo paise milenge|receive money enter pin|claim refund.*pin)",
                severity_level="CRITICAL",
                category="REVERSE_UPI",
                description="Fraudster claims to send money but requests UPI PIN or collect approval."
            ),
            ScamRule(
                pattern_name="Remote Access Malware",
                regex_trigger=r"(anydesk|teamviewer|quicksupport|apk download|screen share|install app|sbi support apk)",
                severity_level="CRITICAL",
                category="REMOTE_ACCESS",
                description="Coerces victim into installing remote desktop apps to drain accounts."
            ),
            ScamRule(
                pattern_name="Pension Release Fee Extortion",
                regex_trigger=r"(pension release|pension fee|pension hold|pay fee to get pension|gratuity clearance)",
                severity_level="HIGH",
                category="IMPERSONATION",
                description="Impersonates EPFO or bank officials asking for fees to clear pension."
            ),
            ScamRule(
                pattern_name="Digital Arrest / Police Extortion Threat",
                regex_trigger=r"(digital arrest|police officer|cbi|parcel illegal|narcotics|customs clearance|arrest warrant)",
                severity_level="CRITICAL",
                category="DIGITAL_ARREST",
                description="Extorts victim using fake police/CBI legal threats."
            )
        ]
        db.add_all(scam_rules)

        print("Seeding initial security audit logs...")
        sample_logs = [
            AuditLog(
                timestamp=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5),
                raw_speech="UPPCL bijli bill ka 1200 rupaye bhar do",
                extracted_intent="BILL_PAY",
                payee="UPPCL Electricity",
                amount=1200.0,
                risk_score=0.05,
                decision="ALLOWED",
                audio_reason="Verified utility payment to UPPCL Electricity for ₹1200.",
                heuristic_reasons="No suspicious patterns detected; Payee is verified trusted contact.",
                llm_explanation="Routine utility payment to pre-approved electricity board.",
                guardian_alert_sent=False
            ),
            AuditLog(
                timestamp=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2),
                raw_speech="Dear customer your bijli will be cut tonight at 9:30 PM call 9876543210 and pay 4999 immediately",
                extracted_intent="SCAM_QUERY",
                payee="Unknown Fraudster (9876543210)",
                amount=4999.0,
                risk_score=0.98,
                decision="BLOCKED",
                audio_reason="सावधान! यह बिजली बिल काटने का फर्जी संदेश है। आपके पैसे सुरक्षित हैं और बिजली नहीं कटेगी।",
                heuristic_reasons="Triggered regex: Electricity Disconnection Threat; Unverified payee; High amount.",
                llm_explanation="High coercion urgency scam impersonating utility provider demanding direct payment under threat of disconnection.",
                guardian_alert_sent=True
            )
        ]
        db.add_all(sample_logs)

        db.commit()
        print("Database seeded successfully with all initial records!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
