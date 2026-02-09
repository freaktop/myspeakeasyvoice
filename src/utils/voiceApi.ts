const BASE = import.meta.env.VITE_BACKEND_URL;

export async function parseVoiceCommand(command: string) {
  const res = await fetch(`${BASE}/api/voice/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`parseVoiceCommand failed: ${res.status} ${text}`);
  }

  return res.json();
}
