/* ============================================================
   DEMO / OFFLINE / ONLINE ENVIRONMENT MODE SYSTEM
   ============================================================ */

const ENV_MODE_KEY = "synergy_env_mode";
const ENV_BACKUP_KEY = "synergy_state_backup";

/* Rich demo snapshot shown to judges in Demo Mode */
const DEMO_SNAPSHOT = {
  team: { name: "Team Alpha", score: 340, rank: 2, slogan: "Building the future, one parcel at a time.", hasDeployedStaging: true, hasDeployedProd: false },
  members: [
    { name: "Ashutosh Kumar", role: "Lead Developer" },
    { name: "Aria Chen", role: "Backend Engineer" },
    { name: "Max Kowalski", role: "UI/UX Designer" },
    { name: "Priya Sharma", role: "Product Manager" }
  ],
  tasks: [
    { id: "dt-1", title: "Setup Base Project Scaffold", description: "Initialized directory structures and global CSS.", priority: "High", assignee: "Max Kowalski", category: "Design", status: "completed" },
    { id: "dt-2", title: "Design Parcle Sync Architecture", description: "Model for local storage packaging and synchronization.", priority: "High", assignee: "Aria Chen", category: "Backend", status: "completed" },
    { id: "dt-3", title: "Implement Kanban Board Interactivity", description: "Drag-and-drop DOM listeners and state transitions.", priority: "Medium", assignee: "Ashutosh Kumar", category: "Frontend", status: "completed" },
    { id: "dt-4", title: "Configure Enter Pro Pipeline", description: "Automation scripts for bundlers and deploy steps.", priority: "High", assignee: "Ashutosh Kumar", category: "Frontend", status: "progress" },
    { id: "dt-5", title: "Write Documentation", description: "Implementation logs, walkthrough video, slide deck.", priority: "Low", assignee: "Max Kowalski", category: "Docs", status: "progress" },
    { id: "dt-6", title: "Real-time Chat Integration", description: "WebSocket-style team collaboration channel.", priority: "Medium", assignee: "Aria Chen", category: "Backend", status: "todo" },
    { id: "dt-7", title: "Gamification Badge System", description: "Achievement unlock animations and point rewards.", priority: "Low", assignee: "Priya Sharma", category: "Frontend", status: "todo" },
    { id: "dt-8", title: "Final Demo Polish & Pitch", description: "UI refinements and pitch deck final review.", priority: "High", assignee: "Priya Sharma", category: "Design", status: "todo" }
  ],
  parcels: [
    { id: "prc-demo1", size: "4.2 KB", type: "Full State", time: "10 mins ago", status: "Success" },
    { id: "prc-demo2", size: "1.8 KB", type: "Task Delta", time: "1 hour ago", status: "Success" },
    { id: "prc-demo3", size: "2.4 KB", type: "Config Update", time: "3 hours ago", status: "Success" }
  ],
  badges: { "fast-fixer": true, "sync-master": true, "staging-pioneer": true, "production-ready": false, "polished-pitch": false },
  hasUnsyncedChanges: false,
  chatMessages: [
    { sender: "Aria Chen", text: "Just pushed the sync architecture — everything is looking great!", time: "14:10", type: "received" },
    { sender: "Max Kowalski", text: "Wireframes are uploaded to staging. Check the deploy tab!", time: "14:15", type: "received" },
    { sender: "You", text: "Awesome! Let's get the Kanban polished before the demo.", time: "14:20", type: "sent" },
    { sender: "Priya Sharma", text: "Pitch deck is at 80%. Will share the Google Slides link shortly.", time: "14:45", type: "received" }
  ],
  submission: { projectTitle: "Synergy OS", tagline: "Ship faster. Collaborate smarter. Win together.", githubUrl: "https://github.com/team-alpha/synergy", videoUrl: "https://youtu.be/demo-video", deckUrl: "https://slides.google.com/demo-deck", status: "draft", mentorRatingUX: 9, mentorRatingCode: 8, mentorComments: "" }
};

function getEnvMode() {
  return localStorage.getItem(ENV_MODE_KEY) || "online";
}
function setEnvMode(mode) {
  localStorage.setItem(ENV_MODE_KEY, mode);
}

function activateDemoMode() {
  // Back up real state
  localStorage.setItem(ENV_BACKUP_KEY, JSON.stringify(appState));
  // Merge demo snapshot into appState (keep admin settings)
  const demo = Object.assign({}, appState, DEMO_SNAPSHOT, {
    activeRole: appState.activeRole,
    theme: appState.theme,
    adminDeadline: appState.adminDeadline,
    adminAutosync: appState.adminAutosync,
    adminAllowLate: appState.adminAllowLate,
    environmentMode: "demo",
    competitors: appState.competitors,
    notifications: [
      { id: getUUID("not"), title: "DEMO MODE Active", desc: "Rich demo dataset loaded. Safe sandbox for judges — no production data is affected.", time: "Just now", type: "success" }
    ]
  });
  appState = demo;
  setEnvMode("demo");
  saveData();
  renderUI();
  updateEnvModeUI("demo");
  showToast("DEMO MODE active — rich dataset loaded for judges.", "success");
}

function deactivateDemoMode() {
  const backup = localStorage.getItem(ENV_BACKUP_KEY);
  if (backup) {
    try {
      appState = JSON.parse(backup);
    } catch { /* fall back to default */ }
    localStorage.removeItem(ENV_BACKUP_KEY);
  }
  appState.environmentMode = "online";
  setEnvMode("online");
  saveData();
  renderUI();
  updateEnvModeUI("online");
  showToast("Returned to Online mode. Your real data is restored.", "info");
}

function activateOnlineMode() {
  // Exit demo if needed
  const backup = localStorage.getItem(ENV_BACKUP_KEY);
  if (backup) {
    try { appState = JSON.parse(backup); localStorage.removeItem(ENV_BACKUP_KEY); } catch {}
  }
  appState.environmentMode = "online";
  setEnvMode("online");
  saveData();
  renderUI();
  updateEnvModeUI("online");
  showToast("ONLINE MODE active. Real-time collaboration enabled.", "success");
}

function updateEnvModeUI(mode) {
  const badge = document.getElementById("env-mode-badge");
  const demoBanner = document.getElementById("demo-mode-banner");
  const syncIndicator = document.getElementById("live-sync-indicator");
  const syncLabel = syncIndicator ? syncIndicator.querySelector(".sync-label") : null;

  const cfg = {
    offline: { label: "OFFLINE",   bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.25)", color: "#9ca3af",              icon: "lock",        syncLabel: "SYNC",   syncBg: "rgba(239,68,68,0.08)",    syncBorder: "rgba(239,68,68,0.2)",    syncColor: "var(--danger-color)" },
    demo:    { label: "DEMO MODE", bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.3)",  color: "var(--warning-color)", icon: "play_circle", syncLabel: "DEMO",   syncBg: "rgba(249,115,22,0.08)",   syncBorder: "rgba(249,115,22,0.2)",   syncColor: "var(--warning-color)" },
    online:  { label: "ONLINE",    bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)", color: "var(--success-color)", icon: "wifi",        syncLabel: "ONLINE", syncBg: "rgba(16,185,129,0.08)",   syncBorder: "rgba(16,185,129,0.2)",   syncColor: "var(--success-color)" }
  };
  const c = cfg[mode] || cfg.offline;

  if (badge) {
    badge.style.background = c.bg;
    badge.style.border = `1px solid ${c.border}`;
    badge.style.color = c.color;
    badge.innerHTML = `<span class="material-symbols-outlined" style="font-size:12px;">${c.icon}</span>${c.label}`;
  }

  // Demo mode banner
  if (demoBanner) {
    demoBanner.style.display = mode === "demo" ? "flex" : "none";
  }

  // Sync indicator
  if (syncIndicator && syncLabel) {
    syncIndicator.style.background = c.syncBg;
    syncIndicator.style.borderColor = c.syncBorder;
    syncLabel.style.color = c.syncColor;
    syncLabel.textContent = c.syncLabel;
    const dot = syncIndicator.querySelector(".sync-pulse-dot");
    if (dot) dot.style.background = c.syncColor;
  }

  // Update env select
  const envSelect = document.getElementById("env-mode-select");
  if (envSelect) envSelect.value = mode;

  // Demo watermark on content body
  const contentBody = document.querySelector(".content-body");
  if (contentBody) {
    contentBody.classList.toggle("demo-mode", mode === "demo");
  }
}

