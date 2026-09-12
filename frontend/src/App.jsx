import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import CyberBackground from './components/CyberBackground';
import SeniorAssistantView from './components/SeniorAssistantView';
import GuardianDashboardView from './components/GuardianDashboardView';
import { SpeechHandler } from './services/speech';
import { 
  fetchUserProfile, 
  processVoiceCommand, 
  executeTransaction, 
  resetDemoData 
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('assistant');
  const [userProfile, setUserProfile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speechHandlerRef = useRef(null);

  // Initialize Speech Handler
  useEffect(() => {
    speechHandlerRef.current = new SpeechHandler(
      (capturedText, isFinal) => {
        setTranscript(capturedText);
        if (isFinal && capturedText.trim().length > 3) {
          handleProcessVoice(capturedText);
        }
      },
      (listeningState) => {
        setIsListening(listeningState);
      }
    );

    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const data = await fetchUserProfile();
      setUserProfile(data);
    } catch (e) {
      console.error('Error fetching user profile:', e);
    }
  };

  const handleToggleListen = () => {
    if (!speechHandlerRef.current) return;
    if (isListening) {
      speechHandlerRef.current.stopListening();
    } else {
      setExecutionResult(null);
      setAnalysisResult(null);
      setTranscript('');
      speechHandlerRef.current.startListening();
    }
  };

  const handleProcessVoice = async (textToProcess) => {
    if (!textToProcess || !textToProcess.trim()) return;

    try {
      setIsAnalyzing(true);
      setExecutionResult(null);
      if (speechHandlerRef.current) {
        speechHandlerRef.current.stopListening();
      }

      const result = await processVoiceCommand(textToProcess);
      setAnalysisResult(result);

      // Auto-trigger Regional Hindi Speech synthesis
      if (result.warning_message_hindi && speechHandlerRef.current) {
        setIsSpeaking(true);
        speechHandlerRef.current.speak(result.warning_message_hindi, 'hi-IN');
        setTimeout(() => setIsSpeaking(false), 5000);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      alert(error.message || 'Failed to process voice command.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecuteTransaction = async () => {
    if (!analysisResult || !analysisResult.action_payload?.can_execute) return;

    try {
      setIsExecuting(true);
      const payload = {
        payee: analysisResult.payee,
        amount: analysisResult.amount,
        raw_speech: transcript || `Payment to ${analysisResult.payee}`,
        risk_score: analysisResult.risk_score,
        intent: analysisResult.intent,
        audio_reason: analysisResult.warning_message_hindi
      };

      const result = await executeTransaction(payload);
      setExecutionResult(result);
      
      // Refresh user balance
      await loadUserProfile();

      // Audio confirmation
      if (speechHandlerRef.current) {
        speechHandlerRef.current.speak(`${analysisResult.payee} को भुगतान सफल रहा।`, 'hi-IN');
      }
    } catch (error) {
      console.error('Transaction execution failed:', error);
      alert(error.message || 'Transaction execution failed.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSpeakWarning = (text) => {
    if (speechHandlerRef.current && text) {
      setIsSpeaking(true);
      speechHandlerRef.current.speak(text, 'hi-IN');
      setTimeout(() => setIsSpeaking(false), 5000);
    }
  };

  const handleResetDemo = async () => {
    try {
      await resetDemoData();
      await loadUserProfile();
      setAnalysisResult(null);
      setTranscript('');
      setExecutionResult(null);
      if (speechHandlerRef.current) {
        speechHandlerRef.current.stopSpeaking();
      }
      alert('Demo simulation has been reset to default state.');
    } catch (e) {
      console.error('Reset failed:', e);
    }
  };

  // Determine threat level for ambient background
  const threatLevel = analysisResult?.status === 'HIGH_RISK_BLOCKED' 
    ? 'THREAT' 
    : analysisResult?.status === 'SAFE' 
    ? 'SAFE' 
    : 'NORMAL';

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Dynamic Cyber Neural Particle Background */}
      <CyberBackground threatLevel={threatLevel} />

      {/* Main Glassmorphic Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        onResetDemo={handleResetDemo}
        isSpeaking={isSpeaking}
      />

      {/* Main View Router */}
      <main className="relative z-10 flex-1 w-full pb-16">
        {activeTab === 'assistant' ? (
          <SeniorAssistantView
            isListening={isListening}
            onToggleListen={handleToggleListen}
            transcript={transcript}
            setTranscript={setTranscript}
            onProcessVoice={handleProcessVoice}
            analysisResult={analysisResult}
            isAnalyzing={isAnalyzing}
            onExecuteTransaction={handleExecuteTransaction}
            isExecuting={isExecuting}
            executionResult={executionResult}
            onSpeakWarning={handleSpeakWarning}
            isSpeaking={isSpeaking}
          />
        ) : (
          <GuardianDashboardView
            userProfile={userProfile}
            onRefreshProfile={loadUserProfile}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full py-4 text-center border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md text-xs text-slate-500 font-mono">
        SurakshaNet AI • Senior Citizen Cyber Protection System • Dual-Layer Defense Active
      </footer>
    </div>
  );
}
