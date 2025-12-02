// Minimal public/js/speech.js (single clean copy)
import { executeCommand } from "./commands.js";

const micBtn = document.getElementById('mic');
const transcriptEl = document.getElementById('transcript');

console.log('[public/js/speech.js] loaded', { userAgent: navigator.userAgent });
if (transcriptEl) transcriptEl.textContent = 'Ready: click the mic to start (public)';
if (!micBtn) console.warn('[public/js/speech.js] no #mic element found');

async function ensureMicrophonePermission() {
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const status = await navigator.permissions.query({ name: 'microphone' });
      if (status.state === 'granted') return true;
      if (status.state === 'denied') return false;
    }
  } catch (e) {}

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop());
    return true;
  } catch (err) {
    return false;
  }
}

function startRecognition() {
  const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!RecognitionCtor) {
    console.log('[public/js/speech.js] Web Speech API not found');
    if (transcriptEl) transcriptEl.textContent = 'Speech recognition not supported in this browser.';
    return;
  }

  const recognition = new RecognitionCtor();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (transcriptEl) transcriptEl.innerText = transcript;
    try { executeCommand(transcript); } catch (e) { console.warn(e); }
  };

  recognition.onerror = (err) => {
    console.error('Speech recognition error:', err);
    if (transcriptEl) transcriptEl.textContent = `❌ Error: ${err.error || err.message}`;
  };

  recognition.onend = () => {
    console.log('Speech recognition ended.');
  };
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
} else {
  console.warn('Mic button element (#mic) not found.');
}
