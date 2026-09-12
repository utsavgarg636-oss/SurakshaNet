import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, User, RefreshCw, Volume2, Radio, BellRing } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, userProfile, onResetDemo, isSpeaking }) {
  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3.5 glass-panel border-b border-slate-700/60 shadow-xl backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Status */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-sky-500/20 to-blue-600/30 border border-emerald-500/40 shadow-lg shadow-emerald-950/50">
            <Shield className="w-6 h-6 text-emerald-400 animate-pulse-slow" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-display">
                SURAKSHA<span className="text-emerald-400">NET</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                AI DEFENSE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Dual-Layer Senior Financial Safety Shield
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-2xl border border-slate-700/70 shadow-inner">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center gap-2.5 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'assistant'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/40 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className={`w-4 h-4 ${activeTab === 'assistant' ? 'text-white animate-pulse' : ''}`} />
            <span>Senior Voice Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('guardian')}
            className={`flex items-center gap-2.5 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'guardian'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-950/60 border border-sky-400/40 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Co-Guardian Dashboard</span>
          </button>
        </div>

        {/* User Status / Balance & Reset */}
        <div className="flex items-center gap-3">
          {isSpeaking && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs animate-pulse">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Speaking Hindi...</span>
            </div>
          )}

          {userProfile && (
            <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/80 shadow-md">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs">
                RS
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-300 font-semibold leading-tight">
                  {userProfile.name.split('(')[0]}
                </p>
                <p className="text-sm font-bold text-emerald-400 font-mono">
                  ₹{Number(userProfile.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onResetDemo}
            title="Reset Demo Simulation"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4 hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

      </div>
    </header>
  );
}
