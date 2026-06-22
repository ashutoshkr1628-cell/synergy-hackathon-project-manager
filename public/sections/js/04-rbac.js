function renderUI() {
  // Recalculate score/rank first so all panels read fresh data
  calculateStandings();

  document.getElementById("sidebar-team-name").textContent = appState.team.name;
  document.getElementById("sidebar-team-score").textContent = `Points: ${appState.team.score}`;
  document.getElementById("sidebar-team-avatar").textContent = appState.team.name.substring(0, 2).toUpperCase();
  const pendingCount = appState.tasks.filter(t => t.status !== "completed").length;
  const pendingBadge = document.getElementById("sidebar-pending-tasks");
  pendingBadge.textContent = pendingCount;
  pendingBadge.style.display = pendingCount > 0 ? "inline-flex" : "none";
  const warningDot = document.getElementById("sync-warning-dot");
  if (warningDot) warningDot.style.display = appState.hasUnsyncedChanges ? "inline-block" : "none";
  applyRBACRole();
  renderDashboard();
  renderTeamRoster();
  renderTasks();
  renderParcleSync();
  renderDeploySubmission();
  renderLeaderboard();        // recalculates appState.team.score
  updateScoreLevel(appState.team.score);
  updateBadgeProgress();
  renderChatMessages();
  renderNotifications();
}

function renderNotifications() {
  const list = document.getElementById("notif-list");
  if (!list) return;
  list.innerHTML = "";
  const recent = [...appState.notifications].reverse().slice(0, 10);
  if (recent.length === 0) {
    list.innerHTML = '<div class="notif-item"><div class="notif-content"><div class="notif-title">No notifications</div></div></div>';
    return;
  }
  recent.forEach(n => {
    let iconClass = "purple";
    let icon = "info";
    if (n.type === "success") { iconClass = "green"; icon = "check_circle"; }
    if (n.type === "warning") { iconClass = "orange"; icon = "warning"; }
    if (n.type === "deploy") { iconClass = "cyan"; icon = "rocket"; }
    const item = document.createElement("div");
    item.className = "notif-item";
    item.innerHTML = `<div class="notif-icon ${iconClass}"><span class="material-symbols-outlined">${icon}</span></div><div class="notif-content"><div class="notif-title">${n.title}</div><div class="notif-desc">${n.desc}</div><div class="notif-time">${n.time}</div></div>`;
    list.appendChild(item);
  });
}

function applyRBACRole() {
  const role = appState.activeRole;
  const profiles = {
    developer: { name: "Ashutosh Kumar", role: "Lead Developer", avatar: "AK" },
    mentor: { name: "Dr. Elena Vance", role: "Hackathon Mentor", avatar: "EV" },
    admin: { name: "System Admin", role: "Coordinator Console", avatar: "SA" }
  };
  const currentProf = profiles[role] || profiles.developer;
  document.getElementById("user-display-name").textContent = currentProf.name;
  document.getElementById("user-display-role").textContent = currentProf.role;
  document.getElementById("user-display-avatar").textContent = currentProf.avatar;
  const adminTabBtn = document.querySelector('.menu-item.admin-only');
  if (adminTabBtn) adminTabBtn.style.display = role === "admin" ? "flex" : "none";
  const devButtons = document.querySelectorAll(".dev-only");
  devButtons.forEach(btn => {
    if (role === "developer") {
      btn.removeAttribute("disabled");
      btn.style.display = "";
    } else {
      btn.setAttribute("disabled", "true");
      if (btn.id === "btn-create-task" || btn.id === "btn-submit-project") btn.style.display = "none";
    }
  });
  const cards = document.querySelectorAll(".task-card");
  cards.forEach(card => {
    if (role === "developer") card.setAttribute("draggable", "true");
    else card.removeAttribute("draggable");
  });
  const mentorBox = document.getElementById("mentor-eval-panel");
  if (mentorBox) mentorBox.style.display = role === "mentor" ? "flex" : "none";

  // Show env mode selector only in admin mode
  const envSelector = document.querySelector(".env-mode-selector");
  if (envSelector) envSelector.style.display = role === "admin" ? "flex" : "none";

  // RBAC mode badge in header
  let modeBanner = document.getElementById("rbac-mode-banner");
  if (!modeBanner) {
    modeBanner = document.createElement("div");
    modeBanner.id = "rbac-mode-banner";
    modeBanner.style.cssText = `
      display:flex; align-items:center; gap:6px;
      font-size:10px; font-weight:800; letter-spacing:1.2px;
      padding:4px 10px; border-radius:20px; text-transform:uppercase;
    `;
    const headerRight = document.querySelector(".header-right");
    if (headerRight) headerRight.insertBefore(modeBanner, headerRight.firstChild);
  }

  const roleConfig = {
    developer: { label: "Dev Mode", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.25)", color: "var(--secondary-color)", icon: "code" },
    mentor: { label: "Mentor Mode", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", color: "var(--primary-color)", icon: "school" },
    admin: { label: "Admin Mode", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)", color: "var(--warning-color)", icon: "admin_panel_settings" }
  };
  const rc = roleConfig[role] || roleConfig.developer;
  modeBanner.style.background = rc.bg;
  modeBanner.style.border = `1px solid ${rc.border}`;
  modeBanner.style.color = rc.color;
  modeBanner.innerHTML = `<span class="material-symbols-outlined" style="font-size:13px">${rc.icon}</span>${rc.label}`;
}

