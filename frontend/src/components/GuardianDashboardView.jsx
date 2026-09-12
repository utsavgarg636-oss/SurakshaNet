import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, UserCheck, AlertOctagon, Activity, 
  Clock, PhoneCall, Bell, Lock, CheckCircle, ExternalLink, RefreshCw, Smartphone
} from 'lucide-react';
import { fetchGuardianAlerts, fetchTrustedContacts, fetchScamRules } from '../services/api';

export default function GuardianDashboardView({ userProfile, onRefreshProfile }) {
  const [alerts, setAlerts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [scamRules, setScamRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [alertsData, contactsData, rulesData] = await Promise.all([
        fetchGuardianAlerts(),
        fetchTrustedContacts(),
        fetchScamRules()
      ]);
      setAlerts(alertsData);
      setContacts(contactsData);
      setScamRules(rulesData);
    } catch (e) {
      console.error('Failed to load guardian dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000); // Auto-refresh telemetry feed every 5s
    return () => clearInterval(interval);
  }, []);

  // Calculate protected funds
  const totalProtectedFunds = alerts.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Dashboard Top Header & Guardian Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-3xl p-6 sm:p-8 border border-sky-500/40 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/60 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-950/60">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400 font-mono">
                TELEMETRY & FAMILY DEFENSE
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Feed Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              Co-Guardian Cyber Dashboard
            </h1>
            <p className="text-sm text-slate-300">
              Monitoring Senior Citizen: <strong className="text-white">{userProfile?.name || 'Ramesh Sharma (Age 68)'}</strong>
            </p>
          </div>
        </div>

        {/* Guardian Contact Info Card */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-700/80 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="text-slate-400 uppercase font-semibold">Active Family Guardian</p>
            <p className="text-sm font-bold text-white">{userProfile?.guardian_name || 'Amit Sharma (Son)'}</p>
            <p className="text-slate-400 font-mono">{userProfile?.guardian_phone || '+91 9812345678'}</p>
          </div>
        </div>
      </div>

      {/* Real-time Security KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Intercepted Threats */}
        <div className="glass-panel-threat rounded-3xl p-6 space-y-2 border border-rose-600/50">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Threats Blocked</span>
            <AlertOctagon className="w-5 h-5" />
          </div>
          <p className="text-4xl font-black text-white font-display">
            {alerts.length}
          </p>
          <p className="text-xs text-rose-300 font-medium">
            100% Extortion & Scams Prevented
          </p>
        </div>

        {/* Funds Protected */}
        <div className="glass-panel-safe rounded-3xl p-6 space-y-2 border border-emerald-500/50">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Funds Protected</span>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-display">
            ₹{totalProtectedFunds.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-emerald-300 font-medium">
            Saved from fraudulent transfer
          </p>
        </div>

        {/* Pre-Approved Contacts */}
        <div className="glass-panel rounded-3xl p-6 space-y-2 border border-slate-700/60">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Trusted Directory</span>
            <UserCheck className="w-5 h-5" />
          </div>
          <p className="text-4xl font-black text-white font-display">
            {contacts.length}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Pre-approved family & bills
          </p>
        </div>

        {/* Active Heuristic Rules */}
        <div className="glass-panel-amber rounded-3xl p-6 space-y-2 border border-amber-500/50">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Scam Signatures</span>
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-4xl font-black text-white font-display">
            {scamRules.length || 6}
          </p>
          <p className="text-xs text-amber-300 font-medium">
            Dual-layer AI rules active
          </p>
        </div>

      </div>

      {/* Main Grid: Intercept Feed & Trusted Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real-time Intercept Feed (2 Columns) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/70 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  Live Fraud Interception Feed
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time audit log of blocked coercive attempts & scam queries
                </p>
              </div>
            </div>
            <button
              onClick={loadDashboardData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Refresh Feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Feed List */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                No threats detected yet. All transactions secure.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-slate-900/90 border border-rose-900/50 hover:border-rose-600/70 rounded-2xl p-5 space-y-3 transition shadow-lg"
                >
                  {/* Top line with threat badge and confidence */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-rose-600/20 text-rose-400 border border-rose-500/40 rounded-xl flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        {alert.decision}
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-rose-400 font-mono bg-rose-950/80 px-2.5 py-0.5 rounded-lg border border-rose-800/50">
                        Risk: {(alert.risk_score * 100).toFixed(0)}%
                      </span>
                      {alert.guardian_alert_sent && (
                        <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded-full flex items-center gap-1">
                          <Bell className="w-3 h-3 text-sky-400" />
                          SMS Dispatched
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Intercepted Speech */}
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80">
                    <p className="text-sm font-semibold text-slate-200">
                      "{alert.raw_speech}"
                    </p>
                  </div>

                  {/* Payee, Amount & Reasons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 uppercase font-semibold">Target Payee: </span>
                      <span className="font-bold text-rose-300">{alert.payee}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase font-semibold">Attempted Amount: </span>
                      <span className="font-bold text-white font-mono">₹{Number(alert.amount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Intelligence explanation */}
                  {(alert.llm_explanation || alert.heuristic_reasons) && (
                    <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 font-mono">
                      <span className="text-sky-400 font-semibold">Diagnosis: </span>
                      {alert.llm_explanation || alert.heuristic_reasons}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>

        {/* Trusted Contacts & Scam Signatures (1 Column) */}
        <div className="space-y-8">
          
          {/* Trusted Contacts Table */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-700/70 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-display">
                  Trusted Payee Directory
                </h3>
              </div>
              <span className="text-xs text-emerald-400 font-semibold">
                {contacts.length} Approved
              </span>
            </div>

            <div className="space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{c.contact_name}</p>
                    <p className="text-xs text-slate-400 font-mono">{c.upi_id}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {c.relationship}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Scam Signature Radar */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-700/70 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-display">
                  Active Threat Signatures
                </h3>
              </div>
              <span className="text-xs text-amber-400 font-semibold font-mono">
                Regex + LLM
              </span>
            </div>

            <div className="space-y-2.5">
              {scamRules.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{r.pattern_name}</span>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/40">
                      {r.severity_level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {r.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
