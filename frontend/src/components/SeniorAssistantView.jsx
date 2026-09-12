import React, { useState } from 'react';
import { 
  Mic, MicOff, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, 
  ArrowRight, Lock, Volume2, Sparkles, User, RefreshCw, Send, PhoneCall, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SeniorAssistantView({
  isListening,
  onToggleListen,
  transcript,
  setTranscript,
  onProcessVoice,
  analysisResult,
  isAnalyzing,
  onExecuteTransaction,
  isExecuting,
  executionResult,
  onSpeakWarning,
  isSpeaking
}) {
  const [manualText, setManualText] = useState('');

  // Quick preset test cases for frictionless testing
  const presets = [
    {
      label: '⚡ Bijli Disconnect Scam',
      type: 'scam',
      text: 'Dear customer your bijli will be cut tonight at 9:30 PM call 9876543210 and pay 4999 immediately'
    },
    {
      label: '🎁 Reverse UPI PIN Scam',
      type: 'scam',
      text: 'Congratulations you won Rs 25000 lottery reward. Enter your UPI PIN to claim money in bank.'
    },
    {
      label: '📲 AnyDesk APK Download Scam',
      type: 'scam',
      text: 'SBI Manager calling: download AnyDesk app and install SBI support apk to avoid account block'
    },
    {
      label: '👮 Fake Digital Arrest Extortion',
      type: 'scam',
      text: 'CBI Police Officer: Illegal parcel seized under your name. Pay 15000 customs penalty immediately or face arrest'
    },
    {
      label: '💚 Send ₹500 to Pooja (Daughter)',
      type: 'safe',
      text: 'Pooja ko 500 rupaye bhejo'
    },
    {
      label: '💡 Pay UPPCL Electricity Bill ₹1200',
      type: 'safe',
      text: 'UPPCL bijli bill ka 1200 rupaye bhar do'
    },
    {
      label: '🏥 Pay Dr. Verma Clinic ₹750',
      type: 'safe',
      text: 'Dr. Verma clinic ko 750 rupaye transfer karo'
    }
  ];

  const handlePresetClick = (text) => {
    setTranscript(text);
    setManualText(text);
    onProcessVoice(text);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    setTranscript(manualText);
    onProcessVoice(manualText);
  };

  const handleApprove = () => {
    if (!analysisResult) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onExecuteTransaction();
  };

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto px-4 py-6 space-y-8">
      
      {/* Hero / Header Tagline */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-semibold tracking-wide shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Senior-First Vernacular Safety Assistant</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
          सुरक्षा<span className="text-emerald-400">नेट</span> Voice Shield
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium">
          Speak naturally in Hindi or English. Our Dual-Layer AI automatically verifies payees and blocks extortion scams.
        </p>
      </div>

      {/* Center Stage Floating Mic Button with Expanding Dynamic Aura */}
      <div className="relative flex flex-col items-center justify-center my-4">
        {/* Animated Expanding Ripple Rings when Listening */}
        {isListening && (
          <>
            <div className="absolute w-56 h-56 rounded-full border-2 border-emerald-400/50 animate-ping pointer-events-none" />
            <div className="absolute w-72 h-72 rounded-full border border-sky-400/40 animate-pulse-slow pointer-events-none" />
            <div className="absolute w-88 h-88 rounded-full border border-teal-500/20 animate-ripple pointer-events-none" />
          </>
        )}

        <button
          onClick={onToggleListen}
          disabled={isAnalyzing}
          className={`relative group z-10 flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full transition-all duration-500 shadow-2xl focus:outline-none ${
            isListening
              ? 'bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 text-white scale-110 shadow-rose-900/80 ring-8 ring-red-500/30'
              : 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 text-white hover:scale-105 hover:shadow-emerald-900/60 ring-4 ring-emerald-400/30'
          }`}
          aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
        >
          {isListening ? (
            <div className="flex flex-col items-center gap-1">
              <MicOff className="w-12 h-12 animate-pulse text-white" />
              <span className="text-xs font-bold uppercase tracking-wider">Listening...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Mic className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider">Tap to Speak</span>
              <span className="text-[10px] text-emerald-100 font-medium">बोलें (Speak)</span>
            </div>
          )}
        </button>

        {/* Live Audio Visualizer Bars */}
        <div className="h-8 flex items-center justify-center gap-1.5 mt-4">
          {isListening ? (
            <>
              {[40, 75, 95, 60, 85, 100, 70, 50, 90, 65, 45].map((h, idx) => (
                <div
                  key={idx}
                  className="w-1.5 bg-gradient-to-t from-emerald-500 to-sky-400 rounded-full animate-wave-bar"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${idx * 0.1}s`
                  }}
                />
              ))}
            </>
          ) : (
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Microphone ready • Hindi (हिंदी) & English
            </p>
          )}
        </div>
      </div>

      {/* Live Vernacular Transcription Card */}
      <div className="w-full max-w-3xl glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-700/70 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Speech Input Stream (आवाज़ पहचान)
            </span>
            {transcript && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                Live Captured
              </span>
            )}
          </div>
          {transcript && (
            <button
              onClick={() => { setTranscript(''); setManualText(''); }}
              className="text-xs text-slate-400 hover:text-rose-400 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dynamic Glowing Speech Box */}
        <div className="min-h-[70px] flex items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
          {transcript ? (
            <p className="text-lg sm:text-2xl font-semibold text-white tracking-wide">
              "{transcript}"
            </p>
          ) : (
            <p className="text-sm sm:text-base text-slate-500 italic">
              Tap the microphone and say something like: "Pooja ko 500 rupaye bhejo" or test a scam notice below.
            </p>
          )}
        </div>

        {/* Manual text / pasted input option */}
        <form onSubmit={handleManualSubmit} className="flex gap-2 pt-1">
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Type or paste instruction (e.g. Bijli bill cut notice or UPI message)..."
            className="flex-1 bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/70"
          />
          <button
            type="submit"
            disabled={isAnalyzing || !manualText.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-1.5 transition shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>Verify</span>
          </button>
        </form>

        {/* Quick Demo Preset Trigger Buttons */}
        <div className="space-y-2 pt-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Quick Simulation Presets (एक-क्लिक परीक्षण):
          </p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(p.text)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                  p.type === 'scam'
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900/50 hover:border-rose-600'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/50 hover:border-emerald-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dual-Layer Analyzing Loader */}
      {isAnalyzing && (
        <div className="w-full max-w-3xl glass-panel rounded-3xl p-8 border border-sky-500/50 flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-sky-400/30 border-t-sky-400 animate-spin" />
            <Sparkles className="w-6 h-6 text-sky-400 absolute" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-white">Dual-Layer AI Scanning in Progress...</h3>
            <p className="text-xs text-sky-300 font-mono">
              Running Layer 1 (Heuristic Regex Scanner) & Layer 2 (Gemini Zero-Shot Classifier)...
            </p>
          </div>
        </div>
      )}

      {/* DYNAMIC ACTION CARDS (SAFE vs THREAT) */}
      {!isAnalyzing && analysisResult && (
        <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 duration-500">
          
          {/* 1. SCAM / THREAT STATE (Crimson Glass Card) */}
          {analysisResult.status === 'HIGH_RISK_BLOCKED' && (
            <div className="glass-panel-threat rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              
              {/* Alert Ribbon Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-600/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-rose-600/30 border border-rose-500/80 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/70 animate-bounce">
                    <ShieldAlert className="w-8 h-8 text-rose-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-rose-300">
                      CRITICAL THREAT INTERCEPTED
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
                      धोखाधड़ी चेतावनी / SCAM DETECTED
                    </h2>
                  </div>
                </div>

                <div className="text-right bg-rose-950/80 px-4 py-2 rounded-2xl border border-rose-700/60">
                  <span className="text-[10px] text-rose-300 uppercase font-mono">Risk Confidence</span>
                  <p className="text-2xl font-black text-rose-400 font-mono">
                    {(analysisResult.risk_score * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* High-Impact Spoken Hindi Warning Banner */}
              <div className="bg-rose-950/70 border border-rose-600/60 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-300 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    Senior Audio Advisory (आवाज़ में चेतावनी)
                  </span>
                  <button
                    onClick={() => onSpeakWarning(analysisResult.warning_message_hindi)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-xl bg-rose-700/60 hover:bg-rose-600 text-white transition border border-rose-500/50"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Replay Audio (दोबारा सुनें)</span>
                  </button>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white leading-relaxed tracking-wide">
                  "{analysisResult.warning_message_hindi}"
                </p>
              </div>

              {/* Risk Details Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-rose-800/40 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Attempted Extraction</span>
                  <p className="text-base font-bold text-rose-300">
                    Payee: {analysisResult.payee}
                  </p>
                  <p className="text-sm font-semibold text-slate-300">
                    Amount: ₹{Number(analysisResult.amount).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="bg-slate-900/80 rounded-2xl p-4 border border-rose-800/40 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Family Defense Action</span>
                  <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Payment Permanently Disabled
                  </p>
                  <p className="text-xs text-sky-300 font-medium">
                    Co-Guardian (Amit Sharma) alert dispatched.
                  </p>
                </div>
              </div>

              {/* Heuristic & LLM Reason Snippets */}
              <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Cyber Intelligence Reason:
                </span>
                <p className="text-slate-300 font-mono leading-relaxed">
                  {analysisResult.llm_explanation || analysisResult.heuristic_reasons?.join(', ')}
                </p>
              </div>

              {/* Locked Button */}
              <div className="pt-2">
                <button
                  disabled
                  className="w-full py-4 rounded-2xl bg-slate-900/90 border border-rose-700/50 text-rose-400 font-bold text-base flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                >
                  <Lock className="w-5 h-5" />
                  <span>TRANSACTION LOCKED BY SURAKSHANET AI</span>
                </button>
              </div>

            </div>
          )}

          {/* 2. SAFE STATE (Glowing Emerald Glass Card) */}
          {analysisResult.status === 'SAFE' && (
            <div className="glass-panel-safe rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/80 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-950/70">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                      SAFETY VERIFICATION PASSED
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
                      सुरक्षित भुगतान / Verified Transfer
                    </h2>
                  </div>
                </div>

                <div className="text-right bg-emerald-950/80 px-4 py-2 rounded-2xl border border-emerald-700/60">
                  <span className="text-[10px] text-emerald-300 uppercase font-mono">Trust Score</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono">
                    {((1 - analysisResult.risk_score) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Transaction Summary Box */}
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Recipient (प्राप्तकर्ता)
                  </span>
                  <p className="text-xl sm:text-2xl font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
                    <span>{analysisResult.payee}</span>
                    {analysisResult.is_trusted_payee && (
                      <span className="px-2.5 py-0.5 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-semibold">
                        ✓ Pre-Approved
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    Purpose: {analysisResult.intent === 'BILL_PAY' ? 'Utility Bill Payment' : 'Family/Medical Transfer'}
                  </p>
                </div>

                <div className="text-center sm:text-right bg-slate-950/80 px-6 py-3 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Amount (रुपये)
                  </span>
                  <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                    ₹{Number(analysisResult.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Senior Hindi Guidance Voice Pill */}
              <div className="bg-emerald-950/60 border border-emerald-600/40 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <p className="text-sm font-semibold text-emerald-100">
                    "{analysisResult.warning_message_hindi}"
                  </p>
                </div>
                <button
                  onClick={() => onSpeakWarning(analysisResult.warning_message_hindi)}
                  className="shrink-0 p-2 rounded-xl bg-emerald-800/40 hover:bg-emerald-700/60 text-emerald-300 border border-emerald-500/30 transition"
                  title="Speak Aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Big Tactile Approve & Pay Button */}
              <div>
                <button
                  onClick={handleApprove}
                  disabled={isExecuting}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xl tracking-wide uppercase shadow-xl shadow-emerald-950/80 border border-emerald-300 flex items-center justify-center gap-3 transform active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  {isExecuting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border-3 border-slate-950 border-t-transparent animate-spin" />
                      <span>Processing Secure Transfer...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-7 h-7 text-slate-950" />
                      <span>पुष्टि करें और भुगतान करें (Push to Approve & Pay)</span>
                      <ArrowRight className="w-6 h-6 text-slate-950" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* Success Banner after execution */}
          {executionResult && (
            <div className="mt-4 bg-emerald-950/90 border-2 border-emerald-400 rounded-3xl p-6 text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white font-display">
                भुगतान सफल! (Payment Successful)
              </h3>
              <p className="text-base text-emerald-200 font-medium">
                {executionResult.message}
              </p>
              <p className="text-sm text-slate-300 font-mono">
                New Account Balance: ₹{Number(executionResult.new_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
