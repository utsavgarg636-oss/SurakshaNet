/**
 * Speech Recognition and Audio Guidance Service (Web Speech API)
 */

export class SpeechHandler {
  constructor(onResultCallback, onStateChangeCallback) {
    this.onResult = onResultCallback;
    this.onStateChange = onStateChangeCallback;
    this.recognition = null;
    this.isListening = false;
    this.synthesis = window.speechSynthesis;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'hi-IN'; // Default Vernacular Hindi (recognizes Hinglish/English too)

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStateChange) this.onStateChange(true);
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (this.onResult) this.onResult(transcript, event.results[event.results.length - 1].isFinal);
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.isListening = false;
        if (this.onStateChange) this.onStateChange(false);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStateChange) this.onStateChange(false);
      };
    }
  }

  setLanguage(lang = 'hi-IN') {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  startListening() {
    if (!this.recognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or try the Preset Quick-Buttons.');
      return;
    }
    if (this.isListening) {
      this.recognition.stop();
      return;
    }
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Speech start error:', e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  speak(text, lang = 'hi-IN') {
    if (!this.synthesis) return;
    this.synthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95; // Slightly slower, clear cadence for seniors
    utterance.pitch = 1.0;

    // Try finding an appropriate voice
    const voices = this.synthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(lang.substring(0, 2))) || voices[0];
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}
