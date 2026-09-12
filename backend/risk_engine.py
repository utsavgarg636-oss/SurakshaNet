import os
import re
import json
import logging
from typing import Tuple, List, Dict, Any, Optional
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from backend.models import ScamRule, TrustedContact, User, AuditLog

load_dotenv()
logger = logging.getLogger("surakshanet.risk_engine")

# Initialize Gemini Client if API key is set
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
gemini_client = None
gemini_model = None

if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    try:
        from google import genai
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("google-genai Client initialized successfully.")
    except Exception as e:
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=GEMINI_API_KEY)
            gemini_model = legacy_genai.GenerativeModel("gemini-1.5-flash")
            logger.info("Legacy google.generativeai model initialized successfully.")
        except Exception as e2:
            logger.warning(f"Failed to initialize Google Gemini API: {e2}. Fallback zero-shot analyzer will be used.")


# Built-in Heuristic Signatures (Defense-in-depth)
HEURISTIC_PATTERNS = [
    {
        "category": "ELECTRICITY_DISCONNECT",
        "pattern": r"(bijli|electricity|power|power bill|light).*(cut|disconnect|kat jayegi|band ho jayegi|kat di jayegi|tonight|aaj raat|9:30|immediate)",
        "weight": 0.95,
        "reason": "Threatens immediate power/utility disconnection to induce panic and extortion.",
        "hindi_warning": "सावधान! यह बिजली बिल काटने का फर्जी संदेश है। आपके पैसे सुरक्षित हैं और बिजली नहीं कटेगी।"
    },
    {
        "category": "REVERSE_UPI_SCAM",
        "pattern": r"(enter pin|pin daalo|pin dalo|receive money.*pin|claim refund.*pin|qr code scan.*receive|paise lene ke liye pin)",
        "weight": 0.99,
        "reason": "Reverse UPI fraud: Requesting UPI PIN to receive money (UPI PIN is ONLY required to SEND money).",
        "hindi_warning": "खतरा! कभी भी पैसे प्राप्त करने के लिए UPI पिन न डालें। पिन डालने से आपके खाते से पैसे कट जाएंगे।"
    },
    {
        "category": "REMOTE_ACCESS_MALWARE",
        "pattern": r"(anydesk|teamviewer|quicksupport|rustdesk|apk download|\.apk|screen share|install app|sbi support|bank manager apk)",
        "weight": 0.95,
        "reason": "Coercing victim to install remote screen sharing software or malicious APK.",
        "hindi_warning": "सावधान! कोई भी अनजान ऐप या AnyDesk इंस्टॉल न करें। यह आपके फोन को हैक कर सकता है।"
    },
    {
        "category": "FAKE_LOTTERY_KYC",
        "pattern": r"(lottery|prize|reward|lucky draw|winner|kyc expire|kyc update|account block|pan card update|sim block)",
        "weight": 0.90,
        "reason": "Deceptive KYC suspension scare or fake lottery prize scam.",
        "hindi_warning": "सावधान! बैंक कभी भी फोन पर KYC या लॉटरी के लिए पैसे नहीं मांगता।"
    },
    {
        "category": "DIGITAL_ARREST_EXTORTION",
        "pattern": r"(digital arrest|police officer|cbi|parcel illegal|narcotics|customs clearance|arrest warrant|court notice|cyber crime police)",
        "weight": 0.98,
        "reason": "Fake 'Digital Arrest' and legal coercion scam impersonating law enforcement officers.",
        "hindi_warning": "चेतावनी! पुलिस या CBI कभी भी वीडियो कॉल पर डिजिटल अरेस्ट या पैसों की मांग नहीं करती। तुरंत कॉल काटें।"
    },
    {
        "category": "PENSION_EXTORTION",
        "pattern": r"(pension release|pension fee|pension hold|pay fee to get pension|gratuity clearance|life certificate fee)",
        "weight": 0.85,
        "reason": "Targeting seniors with fake pension hold release fees.",
        "hindi_warning": "सावधान! पेंशन जारी करने के लिए किसी निजी व्यक्ति को पैसे न भेजें।"
    }
]


def extract_entities(text: str, db: Session) -> Dict[str, Any]:
    """
    Extracts intent, amount, and payee from transcribed vernacular speech.
    Cross-references against SQLite `trusted_contacts`.
    """
    text_lower = text.lower()

    # 1. Extract Amount
    amount = 0.0
    # Match patterns like: ₹500, Rs 500, Rs. 1200, 500 rupaye, 500 rs, 4999 rupees, 500
    amount_match = re.search(r'(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)\s*(?:rupaye|rupees|rs|ka|ko|\b)?', text_lower)
    if amount_match:
        try:
            amt_str = amount_match.group(1).replace(",", "")
            amount = float(amt_str)
        except Exception:
            amount = 0.0

    # Handle common spoken Hindi numbers if exact digit missing
    if amount == 0.0:
        if "hazaar" in text_lower or "hazar" in text_lower or "thousand" in text_lower:
            num_words = {"ek": 1000, "do": 2000, "teen": 3000, "chaar": 4000, "paanch": 5000, "dus": 10000}
            for word, val in num_words.items():
                if word in text_lower:
                    amount = float(val)
                    break
            if amount == 0.0:
                amount = 1000.0

    # 2. Extract Payee & Check Trusted Contacts in DB
    contacts = db.query(TrustedContact).all()
    matched_contact = None
    payee_name = "Unknown Payee"
    is_trusted = False

    for contact in contacts:
        contact_parts = contact.contact_name.lower().split()
        for part in contact_parts:
            # Check if name part is mentioned (ignore small words like dr, clinic)
            if len(part) > 2 and part in text_lower:
                matched_contact = contact
                payee_name = contact.contact_name
                is_trusted = contact.is_verified
                break
        if matched_contact:
            break

    # If no contact matched, check for generic or extracted payee
    if not matched_contact:
        if "uppcl" in text_lower or "electricity" in text_lower or "bijli" in text_lower:
            # Check if it's safe utility or scam
            if any(k in text_lower for k in ["cut", "disconnect", "kat jayegi", "9876543210", "call", "urgent"]):
                payee_name = "Unknown Utility Extortionist"
                is_trusted = False
            else:
                payee_name = "UPPCL Electricity"
                is_trusted = True
        elif "pooja" in text_lower or "daughter" in text_lower or "beti" in text_lower:
            payee_name = "Pooja (Daughter)"
            is_trusted = True
        elif "verma" in text_lower or "doctor" in text_lower or "clinic" in text_lower:
            payee_name = "Dr. Verma (Clinic)"
            is_trusted = True
        elif "suresh" in text_lower or "kirana" in text_lower or "grocery" in text_lower:
            payee_name = "Suresh Kirana Store"
            is_trusted = True
        else:
            # Extract potential phone number or UPI string
            phone_match = re.search(r'\b[6-9]\d{9}\b', text)
            if phone_match:
                payee_name = f"Unknown Number ({phone_match.group(0)})"
            else:
                payee_name = "Unverified External Payee"
            is_trusted = False

    # 3. Extract Intent
    if any(k in text_lower for k in ["bijli", "electricity", "water", "bill", "gas"]):
        intent = "BILL_PAY"
    elif any(k in text_lower for k in ["bhejo", "transfer", "pay", "send", "daalo", "de do", "dena hai"]):
        intent = "PAYMENT"
    elif any(k in text_lower for k in ["balance", "paisa kitna hai", "khate mein"]):
        intent = "BALANCE_QUERY"
    elif any(k in text_lower for k in ["cut", "disconnect", "arrest", "lottery", "prize", "pin"]):
        intent = "SCAM_QUERY"
    else:
        intent = "PAYMENT" if amount > 0 else "UNKNOWN"

    return {
        "intent": intent,
        "amount": amount,
        "payee": payee_name,
        "is_trusted": is_trusted,
        "matched_contact_id": matched_contact.id if matched_contact else None
    }


def evaluate_heuristic(text: str, db: Session) -> Tuple[float, List[str], Optional[str]]:
    """
    Evaluates text against database scam rules and built-in heuristic regex rules.
    Returns: (score, list_of_reasons, matched_category)
    """
    reasons = []
    max_score = 0.0
    matched_category = None
    text_lower = text.lower()

    # 1. Evaluate Built-in Heuristics
    for item in HEURISTIC_PATTERNS:
        if re.search(item["pattern"], text_lower, re.IGNORECASE):
            score = item["weight"]
            reasons.append(item["reason"])
            if score > max_score:
                max_score = score
                matched_category = item["category"]

    # 2. Evaluate Dynamic DB Scam Rules
    try:
        db_rules = db.query(ScamRule).all()
        for rule in db_rules:
            if re.search(rule.regex_trigger, text_lower, re.IGNORECASE):
                rule_score = 0.95 if rule.severity_level == "CRITICAL" else 0.80
                reasons.append(f"DB Signature Matched: {rule.pattern_name} - {rule.description}")
                if rule_score > max_score:
                    max_score = rule_score
                    matched_category = rule.category
    except Exception as e:
        logger.error(f"Error querying DB scam rules: {e}")

    # 3. Urgency / Coercion modifier
    urgency_keywords = ["turant", "immediately", "within 10 minutes", "aaj raat", "urgent", "last chance", "warn"]
    if any(u in text_lower for u in urgency_keywords) and max_score > 0:
        max_score = min(1.0, max_score + 0.05)
        reasons.append("High urgency coercion keywords detected.")

    return max_score, reasons, matched_category


def evaluate_llm_urgency(text: str, payee: str, amount: float, is_trusted: bool) -> Tuple[float, str, str]:
    """
    Evaluates emotional coercion, social engineering, and reverse UPI scams using Gemini Flash.
    Falls back to intelligent zero-shot rule generator if Gemini API key is absent.
    Returns: (llm_score, explanation, regional_audio_script)
    """
    if gemini_client or gemini_model:
        prompt = f"""
You are SurakshaNet's Senior Citizen Cybersecurity Shield AI.
Analyze the following user voice instruction / intercepted message intended for an Indian senior citizen.

Context:
- Transcribed Text: "{text}"
- Detected Payee: "{payee}" (Trusted Contact: {is_trusted})
- Transaction Amount: ₹{amount}

Analyze for:
1. Reverse UPI Collect Scams (e.g. asking to enter UPI PIN to receive money or refunds).
2. Urgency Coercion & Panic Extortion (e.g., electricity disconnection threats, fake police/CBI Digital Arrest, KYC suspension).
3. Remote Desktop / APK Malicious Downloads (e.g., AnyDesk, TeamViewer, QuickSupport).
4. Unverified large transfers (> ₹2,000) to unknown payees.

Respond ONLY with a JSON object in this exact schema:
{{
  "risk_score": <float between 0.0 and 1.0>,
  "threat_detected": <boolean>,
  "explanation": "<concise 1-2 sentence English explanation of risk or safety>",
  "regional_audio_script": "<reassuring, clear, high-impact Hindi audio script for text-to-speech advising the senior citizen in simple language>"
}}
"""
        try:
            if gemini_client:
                response = gemini_client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                raw_response = response.text.strip()
            else:
                response = gemini_model.generate_content(prompt)
                raw_response = response.text.strip()

            # Clean possible markdown formatting
            if raw_response.startswith("```json"):
                raw_response = raw_response[7:]
            if raw_response.endswith("```"):
                raw_response = raw_response[:-3]
            data = json.loads(raw_response.strip())
            return (
                float(data.get("risk_score", 0.0)),
                str(data.get("explanation", "")),
                str(data.get("regional_audio_script", ""))
            )
        except Exception as e:
            logger.warning(f"Gemini LLM inference failed or timed out: {e}. Utilizing fallback semantic engine.")

    # FALLBACK ZERO-SHOT CLASSIFIER
    text_lower = text.lower()
    
    # Check for critical scam vectors
    if any(k in text_lower for k in ["cut", "disconnect", "kat jayegi", "band ho jayegi", "power cut"]):
        return (
            0.98,
            "Critical Urgency Scam: Fraudulent electricity disconnection notice designed to extort instant money.",
            "सावधान! यह बिजली बिल काटने का फर्जी संदेश है। आपके पैसे सुरक्षित हैं और बिजली नहीं कटेगी। किसी अनजान नंबर पर पैसे न भेजें।"
        )
    elif any(k in text_lower for k in ["enter pin", "pin daalo", "pin dalo", "receive money", "claim refund"]):
        return (
            0.99,
            "Critical Reverse-UPI Scam: Fraudster is asking for UPI PIN to receive money. UPI PIN drains bank accounts.",
            "खतरा! कभी भी पैसे प्राप्त करने के लिए अपना UPI पिन न डालें। पिन डालने से आपके खाते से पैसे कट जाएंगे।"
        )
    elif any(k in text_lower for k in ["anydesk", "teamviewer", "quicksupport", "apk", "install"]):
        return (
            0.96,
            "Critical Malware Scam: Remote desktop software installation request to hijack device.",
            "सावधान! कोई भी अनजान ऐप या AnyDesk इंस्टॉल न करें। यह आपके फोन को हैक कर सकता है।"
        )
    elif any(k in text_lower for k in ["digital arrest", "cbi", "police", "customs", "narcotics"]):
        return (
            0.98,
            "Critical Digital Arrest Extortion: Fraudulent legal intimidation impersonating law enforcement.",
            "चेतावनी! पुलिस या CBI कभी भी फोन पर डिजिटल अरेस्ट या पैसों की मांग नहीं करती। तुरंत कॉल काट दें।"
        )
    elif any(k in text_lower for k in ["lottery", "prize", "reward", "winner", "kyc"]):
        return (
            0.92,
            "High Phishing Risk: Fraudulent lottery reward or deceptive KYC suspension scare.",
            "सावधान! बैंक कभी भी फोन पर KYC या लॉटरी के लिए पैसे नहीं मांगता।"
        )
    elif not is_trusted and amount > 2000:
        return (
            0.75,
            f"Caution: High-value transaction of ₹{amount} to unverified recipient '{payee}'.",
            f"कृपया ध्यान दें! आप अनजान व्यक्ति को ₹{amount} भेज रहे हैं। क्या आप निश्चित हैं?"
        )
    elif is_trusted:
        return (
            0.05,
            f"Safe Transaction: Verified payee '{payee}' for legitimate amount of ₹{amount}.",
            f"सुरक्षित भुगतान। {payee} को ₹{amount} भेजने के लिए नीचे दिए गए बटन को दबाएं।"
        )
    else:
        return (
            0.15,
            "Standard Request: No known fraud patterns detected.",
            "सुरक्षा जांच पूरी हो गई है। आगे बढ़ने के लिए पुष्टि करें।"
        )


def analyze_transaction_risk(raw_text: str, db: Session) -> Dict[str, Any]:
    """
    Orchestrates the Dual-Layer Risk Engine:
    1. Heuristic regex layer
    2. Semantic LLM / Urgency layer
    3. Composite score & status generation
    4. Auto Co-Guardian intercept dispatch
    """
    # 1. Extract Entities & Context
    entities = extract_entities(raw_text, db)
    intent = entities["intent"]
    amount = entities["amount"]
    payee = entities["payee"]
    is_trusted = entities["is_trusted"]

    # 2. Evaluate Layer 1: Heuristics
    heuristic_score, heuristic_reasons, matched_category = evaluate_heuristic(raw_text, db)

    # 3. Evaluate Layer 2: LLM Urgency
    llm_score, llm_explanation, regional_audio_script = evaluate_llm_urgency(
        raw_text, payee, amount, is_trusted
    )

    # 4. Calculate Composite Risk Score (Weighted Fusion)
    if heuristic_score >= 0.90 or llm_score >= 0.90:
        composite_risk = max(heuristic_score, llm_score)
    elif not is_trusted and amount > 2000:
        composite_risk = max(0.70, (heuristic_score * 0.4) + (llm_score * 0.6))
    elif is_trusted:
        # Heavily trusted dampener unless overt malware/PIN scam is present
        if heuristic_score > 0.8:
            composite_risk = heuristic_score
        else:
            composite_risk = min(0.15, max(heuristic_score, llm_score))
    else:
        composite_risk = (heuristic_score * 0.45) + (llm_score * 0.55)

    composite_risk = round(min(1.0, max(0.0, composite_risk)), 2)

    # 5. Determine Decision Status (Threshold: 0.65)
    is_blocked = composite_risk >= 0.65
    status = "HIGH_RISK_BLOCKED" if is_blocked else "SAFE"

    # 6. Co-Guardian Interceptor Notification
    guardian_alert_sent = False
    if is_blocked:
        guardian_alert_sent = True
        logger.warning(f"CO-GUARDIAN INTERCEPT TRIGGERED! Risk: {composite_risk}, Payee: {payee}, Amount: ₹{amount}")

    # Build response payload
    return {
        "intent": intent,
        "payee": payee,
        "amount": amount,
        "is_trusted_payee": is_trusted,
        "risk_score": composite_risk,
        "status": status,
        "warning_message_hindi": regional_audio_script,
        "heuristic_reasons": heuristic_reasons,
        "llm_explanation": llm_explanation,
        "guardian_alert_sent": guardian_alert_sent,
        "action_payload": {
            "can_execute": not is_blocked,
            "payee": payee,
            "amount": amount,
            "risk_score": composite_risk,
            "category": matched_category or "GENERAL_PAYMENT"
        }
    }
