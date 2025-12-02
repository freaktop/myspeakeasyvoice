// /js/speech.js
import { executeCommand } from "./commands.js";

const transcriptEl = document.getElementById('transcript');
const micBtn = document.getElementById('mic');

console.log('[speech.js] loaded', { userAgent: navigator.userAgent });
if (transcriptEl) transcriptEl.textContent = 'Ready: click the mic to start';
if (!micBtn) console.warn('[speech.js] no #mic element found');

function setMicListening(on) {
  if (!micBtn) return;
  micBtn.disabled = on;
  micBtn.innerText = on ? 'Listening...' : '🎤 Speak';
}

async function ensureMicrophonePermission() {
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const status = await navigator.permissions.query({ name: 'microphone' });
      if (status.state === 'granted') return true;
      if (status.state === 'denied') return false;
    }
  } catch (e) { }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop());
    return true;
  } catch (err) {
    return false;
  }
}

function updateTranscript(text) {
  if (transcriptEl) transcriptEl.innerText = text;
}

function startWebRecognition() {
  const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!RecognitionCtor) return false;

  const recognition = new RecognitionCtor();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.start();
  setMicListening(true);

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    updateTranscript(transcript);
    console.log('Speech recognized:', transcript);
    try { executeCommand(transcript); } catch (e) { console.warn(e); }
  };

  recognition.onerror = (err) => {
    console.error('Speech recognition error:', err);
    updateTranscript(`Speech recognition failed: ${err.error || err.message}`);
  };

  recognition.onend = () => {
    console.log('Speech recognition ended.');
    setMicListening(false);
  };

  return true;
}

function startNativeRecognition() {
  try {
    if (window.AndroidSpeech && typeof window.AndroidSpeech.startRecognition === 'function') {
      window.onNativeTranscript = (text) => {
        updateTranscript(text);
        try { executeCommand(text); } catch (e) { console.warn(e); }
        setMicListening(false);
      };
      window.onNativeError = (err) => {
        console.warn('Native speech error:', err);
        updateTranscript('Native speech error: ' + err);
        setMicListening(false);
      };
      setMicListening(true);
      window.AndroidSpeech.startRecognition();
      return true;
    }
  } catch (e) {
    console.warn('startNativeRecognition failed', e);
  }
  return false;
}

async function startRecognition() {
  // Prefer Web Speech API when available
  console.log('[speech.js] attempting startRecognition');
  if (startWebRecognition()) {
    console.log('[speech.js] using Web Speech API');
    return;
  }

  // Fallback: try native Android bridge
  console.log('[speech.js] Web Speech API not available, trying native bridge');
  const usedNative = startNativeRecognition();
  if (usedNative) {
    console.log('[speech.js] using native AndroidSpeech bridge');
    return;
  }

  const msg = 'Speech recognition is not available in this WebView or browser. Try opening the app in Chrome or use a device with a modern WebView.';
  console.warn(msg);
  if (micBtn) micBtn.style.display = 'none';
  if (transcriptEl) {
    transcriptEl.textContent = msg;
    transcriptEl.style.opacity = '1';
    transcriptEl.style.color = '#ffcc00';
  } else {
    alert(msg);
  }
}

if (micBtn) {
  micBtn.addEventListener('click', async () => {
    const ok = await ensureMicrophonePermission();
    if (!ok) {
      alert('Microphone permission is required. Go to App Settings → Permissions → Microphone → Allow.');
      return;
    }
    startRecognition();
  });
}
