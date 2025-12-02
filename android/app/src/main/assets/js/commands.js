// /js/commands.js
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

// Basic router helpers (customize paths to your pages)
function goHome() {
  if (isStandalone()) {
    // app/PWA mode
    window.location.href = "/home"; // change if your home file is different
  } else {
    // browser mode fallback
    alert("Home works in the installed app/PWA. Add to Home Screen for full commands.");
  }
}

export function executeCommand(text) {
  const cmd = text.trim().toLowerCase();

  // examples — add more patterns as you need
  if (cmd.includes("go home") || cmd.includes("home")) {
    goHome();
    return;
  }

  if (cmd.includes("open settings") || cmd.includes("settings")) {
    if (isStandalone()) window.location.href = "/settings";
    else alert("Settings opens in the installed app/PWA.");
    return;
  }

  // default
  console.log("No matching command:", cmd);
}
