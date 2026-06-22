function initClock() {
  const clock = document.getElementById("live-clock");
  setInterval(() => {
    const now = new Date();
    clock.textContent = now.toTimeString().split(" ")[0];
  }, 1000);
}

/* ---- Deadline Countdown ---- */
function initDeadlineCountdown() {
  function update() {
    const deadline = new Date(appState.adminDeadline);
    const now = new Date();
    const diff = deadline - now;
    const el = document.getElementById("countdown-display");
    const widget = document.getElementById("deadline-widget");
    const sub = document.getElementById("countdown-subtext");
    if (!el) return;

    if (diff <= 0) {
      el.textContent = "EXPIRED";
      el.style.color = "var(--danger-color)";
      sub.textContent = "Deadline has passed";
      widget.className = "deadline-countdown urgent";
      return;
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

    if (diff < 2 * 3600000) {
      el.style.color = "var(--danger-color)";
      widget.className = "deadline-countdown urgent";
      sub.textContent = "URGENT — Submit now!";
      showUrgencyBanner("Deadline in less than 2 hours! Submit your project NOW.");
    } else if (diff < 6 * 3600000) {
      el.style.color = "var(--warning-color)";
      widget.className = "deadline-countdown warning";
      sub.textContent = `${h}h ${m}m remaining`;
    } else {
      el.style.color = "var(--success-color)";
      widget.className = "deadline-countdown";
      sub.textContent = `${h}h ${m}m remaining`;
    }
  }
  update();
  setInterval(update, 1000);
}

/* ---- Urgency Banner ---- */
let urgencyBannerDismissed = false;
function showUrgencyBanner(message) {
  if (urgencyBannerDismissed) return;
  const banner = document.getElementById("urgency-banner");
  const text = document.getElementById("urgency-text");
  if (banner && text) {
    text.textContent = message;
    banner.style.display = "flex";
  }
}

/* ---- Score Level Tracker ---- */
function updateScoreLevel(score) {
  const levels = [
    { min: 0, max: 50, level: 1, name: "Beginner" },
    { min: 50, max: 150, level: 2, name: "Builder" },
    { min: 150, max: 300, level: 3, name: "Hacker" },
    { min: 300, max: 500, level: 4, name: "Innovator" },
    { min: 500, max: 1000, level: 5, name: "Champion" }
  ];
  const current = levels.find(l => score >= l.min && score < l.max) || levels[levels.length - 1];
  const pct = Math.min(100, ((score - current.min) / (current.max - current.min)) * 100);
  const fill = document.getElementById("score-level-fill");
  const lbl = document.getElementById("score-level-label");
  if (fill) fill.style.width = `${pct}%`;
  if (lbl) lbl.textContent = `Lv.${current.level} ${current.name}`;
}

/* ---- Badge Progress ---- */
function updateBadgeProgress() {
  const earned = Object.values(appState.badges).filter(Boolean).length;
  const total = Object.keys(appState.badges).length;
  const pill = document.getElementById("badge-progress-pill");
  if (pill) pill.textContent = `${earned}/${total} Earned`;
}

