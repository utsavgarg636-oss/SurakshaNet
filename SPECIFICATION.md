# SURAKSHANET - SYSTEM SPECIFICATION & ARCHITECTURE DOCUMENT

## 1. PROJECT OVERVIEW
- Project Name: SurakshaNet
- Focus Area: Digital Inclusion & Financial Safety for Senior Citizens
- Core Innovation: A voice-first senior UI paired with a Dual-Layer Risk Engine (Heuristic + LLM Zero-Shot) that intercepts social-engineering fraud, urgency coercion, and reverse-UPI collect scams before transactions are approved.

---

## 2. DETAILED TECH STACK & SYSTEM ARCHITECTURE
- Frontend: Vite + React 19 + Tailwind CSS + Lucide-React Icons.
- Audio Layer: Web Speech API (webkitSpeechRecognition for Vernacular/English Speech-to-Text, SpeechSynthesis for text-to-speech audio guidance).
- Backend: Python 3.10+ FastAPI with asynchronous route handlers and CORS middleware.
- Database: SQLite (via SQLAlchemy ORM) with mock seeds for elderly user contacts, utility billers, and audit logs.
- Intelligence Layer (LLM): Google Gemini Flash (`google-genai` SDK or `google-generativeai`).
- Dual-Layer Risk Engine:
  1. Heuristic Rules: Regex scanner detecting keywords (e.g., "bijli cut", "power disconnected", "apk download", "lottery", "urgent transfer", "enter PIN to receive").
  2. Semantic Urgency Classifier (Gemini LLM): Evaluates emotional coercion, unusual transfer amounts (> ₹2000), and unverified payees, outputting a risk score between 0.0 (Safe) and 1.0 (Critical Threat).
  3. Co-Guardian Interceptor: Dispatches simulated family alert payloads via mock Webhook / DB log when risk exceeds 0.65.

---

## 3. DATABASE SCHEMA REQUIREMENTS (SQLite)
Create `backend/database.py` and `backend/models.py` with the following tables:
1. `users`: id, name, phone, balance, guardian_phone, guardian_name.
2. `trusted_contacts`: id, user_id, contact_name, upi_id, relationship, is_verified (Boolean).
3. `scam_rules`: id, pattern_name, regex_trigger, severity_level, description.
4. `audit_logs`: id, timestamp, raw_speech, extracted_intent, payee, amount, risk_score, decision (ALLOWED / BLOCKED), audio_reason.

Pre-seed data:
- User: "Ramesh Sharma (Age 68)", Balance: ₹24,500. Guardian: "Amit Sharma (Son)".
- Trusted Contacts: "Dr. Verma (Clinic)", "Pooja (Daughter)", "UPPCL Electricity".
- Known Scam Signatures: "electricity disconnect / connection cut", "reward / lottery claim", "pay fee to receive pension", "anydesk / teamviewer download".

---

## 4. BACKEND API SPECIFICATIONS (FastAPI)
Create clean modular files in `backend/`:
- `main.py`: App initialization, CORS, router mounting.
- `risk_engine.py`: 
  - `evaluate_heuristic(text: str) -> (score, reasons)`
  - `evaluate_llm_urgency(text: str, payee: str, amount: float) -> (score, explanation, regional_audio_script)`
- Endpoints:
  - `POST /api/voice/process`: Accepts `{ "transcribed_text": str }`. Runs both risk engines, parses intent (UPI Transfer, Utility Bill, or Unknown), checks if payee is in `trusted_contacts`, calculates composite risk score.
    Returns:
    {
      "intent": "PAYMENT" | "BILL_PAY" | "UNKNOWN",
      "payee": str,
      "amount": float,
      "is_trusted_payee": bool,
      "risk_score": float,
      "status": "SAFE" | "HIGH_RISK_BLOCKED",
      "warning_message_hindi": str,
      "action_payload": dict
    }
  - `POST /api/transactions/execute`: Executes mock transaction if SAFE, updates user balance, writes to `audit_logs`.
  - `GET /api/guardian/alerts`: Returns flagged high-risk attempts for the Co-Guardian dashboard.

---

## 5. FRONTEND UI & INTERACTION DESIGN (Vite + React + Tailwind + Framer Motion)
Create a futuristic, visually stunning, yet highly accessible interface in `frontend/src/`:

- Visual Theme & Aesthetics:
  - Background: Full-screen ambient looped cyber-mesh / neural shield abstract MP4 video background (using an ambient dark video or high-definition glowing particle loop) overlaid with a subtle dark radial gradient (`rgba(15, 23, 42, 0.78)`) to preserve AAA contrast.
  - Cards: Premium Dark Glassmorphism (`backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-3xl shadow-2xl`).
  - Typography: Extra-large readable fonts with neon accents (Emerald `#10b981` for Safe, Crimson `#ef4444` for Fraud Threat, Amber `#f59e0b` for Guidance).

- Interaction & Animations:
  - Animated Microphone: Giant circular floating mic button with glowing dynamic pulse rings that expand and contract when the user speaks.
  - Live Audio Waveform / Listening State: Dynamic visualizer bars or pulsing aura indicating listening status.

- Core Views (Single-Page Seamless Tab Switch):
  1. Tab 1: "Senior Safety Assistant"
     - Giant Center Stage Mic Button (One-Touch Listen).
     - Live Vernacular Transcription with glowing text transitions.
     - Dynamic Action Cards:
       * SAFE STATE: Glowing Emerald Glass Card showing verified payee details, shield badge, and a giant tactile "Push to Approve" button.
       * SCAM / THREAT STATE: High-impact flashing Crimson Glass Card with alert badge ("धोखाधड़ी चेतावनी / SCAM DETECTED"). Displays plain Hindi risk breakdown, auto-triggers loud audio alert, and completely disables payment actions.
  2. Tab 2: "Co-Guardian Cyber Dashboard" (Family Shield)
     - Real-time glassmorphic security telemetry feed showing intercepted threats, confidence scores, and family alert status badges.

---

## 6. EXECUTION MILESTONES
- Milestone 1 (0% - 25%): Backend initialization, virtual environment, dependencies, SQLite schema & seed scripts.
- Milestone 2 (25% - 50%): Implementation of dual-layer risk engine (Regex heuristic + Gemini LLM evaluation) and FastAPI endpoints.
- Milestone 3 (50% - 75%): Vite React frontend setup, Tailwind CSS configuration, Lucide icons, Senior high-contrast layout.
- Milestone 4 (75% - 100%): Web Speech API integration, backend API connection, end-to-end testing of safe flow vs scam-interception flow.