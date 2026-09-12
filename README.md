# SurakshaNet 🛡️
> An AI-Powered Voice Copilot & Real-Time Fraud Firewall for Senior Citizens Navigating Digital Payments.

Built for the **Lenovo LEAP AI Hackathon 2026** (Theme: Digital Inclusion & Public Access).

---

## 🌟 Key Innovations
- **Voice-First Accessible UI:** High-contrast Dark Glassmorphism, vernacular speech recognition (Hindi & English), zero confusing multi-step menus.
- **Dual-Layer Risk Firewall:**
  - **Heuristic Rule Engine:** Intercepts known Indian utility scams, reverse-UPI collect deception, and fake urgency keywords.
  - **LLM Semantic Urgency Scorer:** Gemini Flash evaluators analyze coercion and psychological pressure in real-time.
- **Co-Guardian Safety Sync:** Intercepts fraudulent attempts before money leaves the account and dispatches security telemetry to family members.

---

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Browser Web Speech API.
- **Backend:** FastAPI (Python 3.10+), Pydantic, SQLAlchemy ORM.
- **Database:** SQLite (Embedded).
- **AI / LLM:** Google Gemini Flash.

---

## 🚀 Quick Start (Local Run)

1. Backend Setup
```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

2. Frontend Setup
```Bash
cd frontend
npm install
npm run dev
Open http://localhost:5173 in your browser.
