/**
 * SYNERGY - Hackathon Project Manager Core Application Logic v1.1.0
 * Implements advanced features: Real-time Collaboration Chat, SVG Analytics,
 * Gamification Badges, Staging/Production Deployments, and RBAC views.
 */

// --- Default State ---
const DEFAULT_STATE = {
  theme: "dark",
  activeRole: "developer",
  team: {
    name: "Team Alpha",
    slogan: "Building the future, one parcel at a time.",
    score: 120,
    rank: 4,
    hasDeployedStaging: false,
    hasDeployedProd: false
  },
  members: [
    { name: "Ashutosh Kumar", role: "Lead Developer" },
    { name: "Aria Chen", role: "Backend Engineer" },
    { name: "Max Kowalski", role: "UI/UX Designer" }
  ],
  tasks: [
    { id: "task-1", title: "Setup Base Project Scaffold", description: "Initialize directory structures, configure index.html viewport meta, and prepare global CSS reset scripts.", priority: "High", assignee: "Max Kowalski", category: "Design", status: "completed" },
    { id: "task-2", title: "Design Parcle Sync Architecture", description: "Establish model specifications for local storage packaging, synchronization payloads, and connection endpoints.", priority: "High", assignee: "Aria Chen", category: "Backend", status: "completed" },
    { id: "task-3", title: "Implement Kanban Board Interactivity", description: "Hook up drag-and-drop DOM listeners, card state transitions, and save updates to cache on drop actions.", priority: "Medium", assignee: "Ashutosh Kumar", category: "Frontend", status: "progress" },
    { id: "task-4", title: "Configure Enter Pro Pipeline Script", description: "Draft automation scripts simulating code bundlers, dependency installs, file compiler steps, and deployment alerts.", priority: "High", assignee: "Ashutosh Kumar", category: "Frontend", status: "todo" },
    { id: "task-5", title: "Write Documentation & Walkthrough", description: "Create implementation logs, record video explanations, and organize slide deck resources.", priority: "Low", assignee: "Max Kowalski", category: "Docs", status: "todo" }
  ],
  parcels: [
    { id: "prc-e7f8", size: "4.2 KB", type: "Full State", time: "10 mins ago", status: "Success" },
    { id: "prc-9a1b", size: "1.8 KB", type: "Task Delta", time: "1 hour ago", status: "Success" }
  ],
  deployments: [],
  submission: {
    projectTitle: "",
    tagline: "",
    githubUrl: "",
    videoUrl: "",
    deckUrl: "",
    status: "draft",
    mentorRatingUX: 8,
    mentorRatingCode: 8,
    mentorComments: ""
  },
  notifications: [
    { id: "not-1", title: "Welcome to Synergy", desc: "Start tracking your project progress, sync data by parcel and deploy demos using Enter Pro.", time: "Just now", type: "info" }
  ],
  competitors: [
    { name: "DevDynamo", score: 320, tasksDone: 10, tasksTotal: 12, syncs: 14, deployed: true, status: "submitted", members: ["Sarah (Dev)", "Liam (Design)", "Kofi (PM)"], project: "Dino-Chatbot App", tagline: "Revolutionizing user feedback with AI dinosaurs.", mentorNotes: "Innovative pitch deck. Tech stack is stable." },
    { name: "Quantum Coderz", score: 280, tasksDone: 8, tasksTotal: 11, syncs: 8, deployed: true, status: "submitted", members: ["Yuki (Dev)", "Elena (Algo)", "Omar (Dev)"], project: "Quantum Safe Ledger", tagline: "Securing block transfers with post-quantum key cryptography.", mentorNotes: "Ambitious goal, offline sync model works well." },
    { name: "Byte Busters", score: 245, tasksDone: 7, tasksTotal: 10, syncs: 10, deployed: true, status: "review", members: ["Alex (Frontend)", "Tariq (Backend)"], project: "MealByte", tagline: "Reducing food waste using peer-to-peer parcel matching.", mentorNotes: "Good MVP. Presentation deck requires cleanup." },
    { name: "Binary Bosses", score: 110, tasksDone: 3, tasksTotal: 9, syncs: 4, deployed: false, status: "draft", members: ["Chloe (Fullstack)", "Ben (Docs)"], project: "GitBoss Admin Panel", tagline: "Custom web portal interfaces for server command nodes.", mentorNotes: "Basic CRUD, needs integration of real sync models." },
    { name: "Pixel Pioneers", score: 95, tasksDone: 2, tasksTotal: 10, syncs: 3, deployed: false, status: "draft", members: ["Raj (Designer)", "Mila (Illustrator)"], project: "ArtSpace VR", tagline: "Visual gallery grids embedded directly inside sandboxes.", mentorNotes: "Outstanding styling aesthetics. Functional features are limited." }
  ],
  chatMessages: [
    { sender: "Aria Chen", text: "Hey team, welcome to our Synergy collaboration channel!", time: "16:10", type: "received" },
    { sender: "Max Kowalski", text: "I just uploaded the wireframe models to staging. Check the deploy tab!", time: "16:15", type: "received" }
  ],
  badges: {
    "fast-fixer": false,
    "sync-master": false,
    "staging-pioneer": false,
    "production-ready": false,
    "polished-pitch": false
  },
  githubRepo: { connected: false, url: "", commits: [] },
  hasUnsyncedChanges: false,
  adminDeadline: "2026-06-21T18:00",
  adminAutosync: 60,
  adminAllowLate: true,
  shouldSyncFail: false,
  shouldBuildFail: false,
  environmentMode: "online"   // "offline" | "demo" | "online"
};

let appState = {};
let taskMoveTime = null;

function getUUID(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
}

function showToast(message, type = "info") {
  const hub = document.getElementById("toast-hub");
  if (!hub) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  let icon = "info";
  if (type === "success") icon = "emoji_events";
  if (type === "warning") icon = "warning";
  toast.innerHTML = `<div class="toast-icon"><span class="material-symbols-outlined">${icon}</span></div><div class="toast-msg">${message}</div>`;
  hub.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 4000);
}

function loadData() {
  const cached = localStorage.getItem("synergy_state_upgraded");
  if (cached) {
    try {
      appState = JSON.parse(cached);
    } catch (e) {
      console.error("Cache parsing error. Initializing default state.", e);
      appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  } else {
    appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    setTimeout(() => { openModal("sandbox-intro-modal"); }, 1000);
  }
  saveData();
}

function saveData() {
  localStorage.setItem("synergy_state_upgraded", JSON.stringify(appState));
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("active");
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("active");
}

function awardBadge(badgeKey) {
  if (appState.badges[badgeKey] === false) {
    appState.badges[badgeKey] = true;
    const badgeNames = {
      "fast-fixer": "Fastest Fixer",
      "sync-master": "Sync Master",
      "staging-pioneer": "Staging Pioneer",
      "production-ready": "Production Ready",
      "polished-pitch": "Polished Pitch"
    };
    const title = badgeNames[badgeKey] || "New Achievement";
    appState.notifications.push({ id: getUUID("not"), title: "Badge Unlocked!", desc: `Earned the "${title}" badge.`, time: "Just now", type: "success" });
    saveData();
    renderUI();
    // Flash the unlocked badge card
    setTimeout(() => {
      const badgeCards = document.querySelectorAll(".badge-item");
      badgeCards.forEach(card => {
        if (card.classList.contains(badgeKey) && card.classList.contains("active")) {
          card.classList.add("just-unlocked");
          setTimeout(() => card.classList.remove("just-unlocked"), 700);
        }
      });
    }, 50);
    showToast(`Achievement Unlocked: ${title}!`, "success");
  }
}

function calculateStandings() {
  const completedTasks = appState.tasks.filter(t => t.status === "completed").length;
  const syncCount = appState.parcels.length;
  const isDeployedStaging = appState.team.hasDeployedStaging;
  const isDeployedProd = appState.team.hasDeployedProd;
  const isSubmitted = appState.submission.status === "submitted" || appState.submission.status === "review";
  let score = 0;
  score += completedTasks * 10;
  score += syncCount * 5;
  if (isDeployedStaging) score += 20;
  if (isDeployedProd) score += 50;
  if (isSubmitted) score += 100;
  const uxScore = parseInt(appState.submission.mentorRatingUX) || 0;
  const codeScore = parseInt(appState.submission.mentorRatingCode) || 0;
  score += (uxScore + codeScore) * 10;
  appState.team.score = score;
  const alphaMembers = appState.members.map(m => `${m.name} (${m.role})`);
  const fullTable = [{
    name: appState.team.name,
    score: appState.team.score,
    tasksDone: completedTasks,
    tasksTotal: appState.tasks.length,
    syncs: syncCount,
    deployed: isDeployedProd,
    status: appState.submission.status,
    members: alphaMembers,
    project: appState.submission.projectTitle || "Not Specified Yet",
    tagline: appState.submission.tagline || "No project tagline submitted yet.",
    mentorNotes: appState.submission.mentorComments || "Pending mentor review."
  }];
  appState.competitors.forEach(c => { fullTable.push(c); });
  fullTable.sort((a, b) => b.score - a.score);
  const idx = fullTable.findIndex(t => t.name === appState.team.name);
  appState.team.rank = idx + 1;
  saveData();
  return fullTable;
}

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

function renderDashboard() {
  document.getElementById("dash-rank").textContent = `#${appState.team.rank}`;
  const completedTasks = appState.tasks.filter(t => t.status === "completed").length;
  const totalTasks = appState.tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  document.getElementById("dash-progress-text").textContent = `${progressPercent}%`;
  document.getElementById("dash-progress-bar").style.width = `${progressPercent}%`;
  document.getElementById("dash-sync-count").textContent = `${appState.parcels.length} Syncs`;
  const syncStatusLbl = document.getElementById("dash-sync-status");
  if (appState.hasUnsyncedChanges) {
    syncStatusLbl.textContent = "Status: Pending Changes";
    syncStatusLbl.className = "metric-trend text-orange";
  } else {
    syncStatusLbl.textContent = "Status: Synced Up-to-date";
    syncStatusLbl.className = "metric-trend text-success";
  }
  const deployMetricLabel = document.getElementById("deploy-metric-label");
  if (deployMetricLabel) {
    const envMode = getEnvMode();
    deployMetricLabel.textContent = envMode === "online" ? "Online Environment" : envMode === "demo" ? "Demo Environment" : "Environment Status";
  }
  const deployStatusLbl = document.getElementById("dash-deploy-status");
  const deployUrlLbl = document.getElementById("dash-deploy-url");
  if (appState.team.hasDeployedProd) {
    deployStatusLbl.textContent = "PRODUCTION";
    deployStatusLbl.className = "metric-value text-success";
    deployUrlLbl.textContent = `${appState.team.name.toLowerCase().replace(/\s+/g, "-")}.enter.pro`;
    deployUrlLbl.className = "metric-trend text-cyan";
  } else if (appState.team.hasDeployedStaging) {
    deployStatusLbl.textContent = "STAGING";
    deployStatusLbl.className = "metric-value text-orange";
    deployUrlLbl.textContent = `${appState.team.name.toLowerCase().replace(/\s+/g, "-")}-staging.enter.pro`;
    deployUrlLbl.className = "metric-trend text-grey";
  } else {
    const envMode = getEnvMode();
    const envLabel  = { online: "ONLINE",  demo: "DEMO",  offline: "OFFLINE" }[envMode] || "OFFLINE";
    const envClass  = { online: "text-success", demo: "text-orange", offline: "text-grey" }[envMode] || "text-grey";
    const envSubtxt = { online: "Deploy to activate online build", demo: "Demo data active — deploy for URL", offline: "No active build" }[envMode] || "No active build";
    deployStatusLbl.textContent = envLabel;
    deployStatusLbl.className   = `metric-value ${envClass}`;
    deployUrlLbl.textContent    = envSubtxt;
    deployUrlLbl.className      = "metric-trend text-grey";
  }

  const shelf = document.getElementById("badge-shelf-grid");
  shelf.innerHTML = "";
  const badgesList = [
    { key: "fast-fixer", name: "Fastest Fixer", desc: "Drag task to Done in under 5s", icon: "bolt", class: "fast-fixer" },
    { key: "sync-master", name: "Sync Master", desc: "Synced 3 Parcle packages", icon: "package_2", class: "sync-master" },
    { key: "staging-pioneer", name: "Staging Pioneer", desc: "First deploy to Staging", icon: "labs", class: "staging-pioneer" },
    { key: "production-ready", name: "Production Ready", desc: "First deploy to Production", icon: "release_alert", class: "production-ready" },
    { key: "polished-pitch", name: "Polished Pitch", desc: "Complete official project form", icon: "verified", class: "polished-pitch" }
  ];
  badgesList.forEach(b => {
    const activeClass = appState.badges[b.key] ? "active" : "";
    const div = document.createElement("div");
    div.className = `badge-item ${b.class} ${activeClass}`;
    div.innerHTML = `<div class="badge-icon-box"><span class="material-symbols-outlined">${b.icon}</span></div><div class="badge-name">${b.name}</div><div class="badge-desc">${b.desc}</div>`;
    shelf.appendChild(div);
  });

  const gitForm = document.getElementById("github-connect-form");
  const gitActive = document.getElementById("github-active-panel");
  const gitRepoLbl = document.getElementById("github-repo-lbl");
  const gitBranchLbl = document.getElementById("github-branch-lbl");
  const gitIcon = document.getElementById("github-icon");
  if (appState.githubRepo.connected) {
    gitForm.style.display = "none";
    gitActive.style.display = "block";
    gitRepoLbl.textContent = appState.githubRepo.url.replace("https://", "");
    gitBranchLbl.textContent = "Branch: main (Synced)";
    gitIcon.className = "material-symbols-outlined text-success";
    gitIcon.textContent = "cloud_done";
    const commitDiv = document.getElementById("git-commits-container");
    commitDiv.innerHTML = "";
    if (appState.githubRepo.commits.length === 0) {
      commitDiv.innerHTML = '<div class="text-grey" style="padding: 10px;">No commits found.</div>';
    } else {
      appState.githubRepo.commits.forEach(c => {
        const item = document.createElement("div");
        item.className = "git-commit-item";
        item.innerHTML = `<span class="git-commit-hash">${c.hash}</span><span class="text-secondary" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:140px;">${c.msg}</span><span class="text-grey">${c.author}</span>`;
        commitDiv.appendChild(item);
      });
    }
  } else {
    gitForm.style.display = "block";
    gitActive.style.display = "none";
    gitRepoLbl.textContent = "Repository Offline";
    gitBranchLbl.textContent = "Branch: -";
    gitIcon.className = "material-symbols-outlined text-grey";
    gitIcon.textContent = "device_hub";
  }

  // Team profile display
  const teamNameLbl = document.getElementById("team-display-name-lbl");
  const teamSloganLbl = document.getElementById("team-display-slogan-lbl");
  if (teamNameLbl) teamNameLbl.textContent = appState.team.name;
  if (teamSloganLbl) teamSloganLbl.textContent = appState.team.slogan;

  const chkTasks = document.getElementById("chk-tasks-done");
  const completedTaskCount = appState.tasks.filter(t => t.status === "completed").length;
  const totalTaskCount = appState.tasks.length;
  chkTasks.checked = totalTaskCount > 0 && completedTaskCount === totalTaskCount;
  document.getElementById("chk-lbl-tasks").textContent = `Complete all Core Tasks (${completedTaskCount}/${totalTaskCount})`;
  document.getElementById("chk-lbl-tasks").className = chkTasks.checked ? "checklist-text strike" : "checklist-text";
  document.getElementById("chk-parcel-sync").checked = appState.parcels.length > 0 && !appState.hasUnsyncedChanges;
  document.getElementById("chk-demo-deploy").checked = appState.team.hasDeployedProd;
  document.getElementById("chk-final-submit").checked = appState.submission.status === "submitted" || appState.submission.status === "review";

  const timeline = document.getElementById("dashboard-activity-timeline");
  timeline.innerHTML = "";
  const logs = [...appState.notifications].reverse().slice(0, 5);
  logs.forEach(log => {
    let icon = "info";
    let color = "purple";
    if (log.type === "success") { icon = "check_circle"; color = "green"; }
    if (log.type === "warning") { icon = "sync_problem"; color = "orange"; }
    if (log.type === "deploy") { icon = "rocket"; color = "cyan"; }
    const item = document.createElement("div");
    item.className = "timeline-item";
    item.innerHTML = `<div class="timeline-icon-wrapper ${color}"><span class="material-symbols-outlined">${icon}</span></div><div class="timeline-info"><div class="timeline-text">${log.title} - ${log.desc}</div><div class="timeline-time">${log.time}</div></div>`;
    timeline.appendChild(item);
  });

  // Checklist urgency: if deadline is within 6h, highlight unfinished items
  const deadline = new Date(appState.adminDeadline);
  const hoursLeft = (deadline - new Date()) / 3600000;
  const checklistEl = document.querySelector(".checklist-list");
  if (checklistEl) {
    if (hoursLeft < 6 && hoursLeft > 0) {
      checklistEl.classList.add("urgent-state");
    } else {
      checklistEl.classList.remove("urgent-state");
    }
  }
}

// NEW: Render team roster in the dashboard
function renderTeamRoster() {
  const list = document.getElementById("members-display-list");
  if (!list) return;
  list.innerHTML = "";
  appState.members.forEach(m => {
    const pill = document.createElement("div");
    pill.className = "member-pill";
    const initials = m.name.split(" ").map(n => n[0]).join("").toUpperCase();
    pill.innerHTML = `
      <div class="member-left">
        <div class="member-avatar-small">${initials}</div>
        <span class="member-name-text">${m.name}</span>
        <span class="member-role-badge">${m.role}</span>
      </div>
      <button class="delete-member-btn" data-name="${m.name}" title="Remove member">
        <span class="material-symbols-outlined" style="font-size:15px;">close</span>
      </button>
    `;
    list.appendChild(pill);
  });
  list.querySelectorAll(".delete-member-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      const idx = appState.members.findIndex(m => m.name === name);
      if (idx !== -1) {
        appState.members.splice(idx, 1);
        appState.notifications.push({ id: getUUID("not"), title: "Roster Updated", desc: `${name} removed from the team.`, time: "Just now", type: "info" });
        saveData();
        renderUI();
        showToast(`${name} removed from roster.`, "info");
      }
    });
  });
}

function renderTasks() {
  const searchFilter = document.getElementById("task-filter-search").value.toLowerCase();
  const priorityFilter = document.getElementById("task-filter-priority").value;
  const assigneeFilter = document.getElementById("task-filter-assignee").value;
  const assigneeSelect = document.getElementById("task-filter-assignee");
  const currentFilterVal = assigneeSelect.value;
  assigneeSelect.innerHTML = '<option value="all">All Assignees</option>';
  appState.members.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.name;
    opt.textContent = m.name;
    if (m.name === currentFilterVal) opt.selected = true;
    assigneeSelect.appendChild(opt);
  });
  const cols = {
    todo: document.querySelector('#col-todo .kanban-cards-container'),
    progress: document.querySelector('#col-progress .kanban-cards-container'),
    review: document.querySelector('#col-review .kanban-cards-container'),
    completed: document.querySelector('#col-completed .kanban-cards-container')
  };
  Object.keys(cols).forEach(k => { cols[k].innerHTML = ""; });
  const counts = { todo: 0, progress: 0, review: 0, completed: 0 };
  appState.tasks.forEach(t => {
    const matchSearch = t.title.toLowerCase().includes(searchFilter) || t.description.toLowerCase().includes(searchFilter);
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchAssignee = assigneeFilter === "all" || t.assignee === assigneeFilter;
    if (matchSearch && matchPriority && matchAssignee) {
      counts[t.status]++;
      const card = document.createElement("div");
      card.className = "task-card glass-panel";
      card.setAttribute("data-id", t.id);
      if (appState.activeRole === "developer") card.setAttribute("draggable", "true");
      const initials = t.assignee ? t.assignee.split(" ").map(n => n[0]).join("").toUpperCase() : "??";
      card.innerHTML = `
        <div class="task-card-header">
          <span class="cat-badge ${t.category.toLowerCase()}">${t.category}</span>
          <span class="pri-badge ${t.priority.toLowerCase()}">${t.priority}</span>
        </div>
        <div class="task-card-body">
          <h4>${t.title}</h4>
          <p>${t.description}</p>
        </div>
        <div class="task-card-footer">
          <div class="task-assignee-group">
            <div class="task-avatar-mini">${initials}</div>
            <span class="task-assignee-name">${t.assignee}</span>
          </div>
          <div class="task-card-actions">
            <button class="edit-task-btn" data-id="${t.id}" title="Edit Task">
              <span class="material-symbols-outlined" style="font-size:16px;">edit</span>
            </button>
          </div>
        </div>
      `;
      card.addEventListener("dragstart", (e) => {
        if (appState.activeRole !== "developer") { e.preventDefault(); return; }
        e.dataTransfer.setData("text/plain", t.id);
        card.style.opacity = "0.5";
        taskMoveTime = Date.now();
      });
      card.addEventListener("dragend", () => { card.style.opacity = "1"; });

      // Urgency highlight for high-priority non-completed tasks
      if (t.status !== "completed") {
        if (t.priority === "High") card.classList.add("priority-urgent");
        else if (t.priority === "Medium") card.classList.add("priority-medium-pending");
      }

      cols[t.status].appendChild(card);
    }
  });
  Object.keys(counts).forEach(k => { document.getElementById(`count-${k}`).textContent = counts[k]; });
}

function renderParcleSync() {
  const unsyncedCount = appState.tasks.length;
  const pendingCountText = appState.hasUnsyncedChanges ? `${unsyncedCount} modifications pending` : "0 Pending Changes";
  document.getElementById("local-changes-count").textContent = pendingCountText;
  const bytes = appState.hasUnsyncedChanges ? unsyncedCount * 128 : 0;
  const sizeText = bytes > 0 ? `${(bytes / 1024).toFixed(2)} KB` : "0.0 KB";
  document.getElementById("local-parcel-size").textContent = sizeText;

  // Update live-sync indicator
  const indicator = document.getElementById("live-sync-indicator");
  const syncLbl = indicator ? indicator.querySelector(".sync-label") : null;
  if (indicator) {
    if (appState.hasUnsyncedChanges) {
      indicator.classList.add("offline");
      if (syncLbl) syncLbl.textContent = "SYNC";
    } else {
      indicator.classList.remove("offline");
      if (syncLbl) syncLbl.textContent = "LIVE";
    }
  }
  const displayStatus = document.getElementById("sync-display-status");
  const displaySubtext = document.getElementById("sync-display-subtext");
  const syncIcon = document.getElementById("sync-main-icon");
  const outerRing = document.getElementById("sync-outer-ring");
  if (outerRing.classList.contains("syncing")) {
    displayStatus.textContent = "Synchronizing State...";
    displaySubtext.textContent = "Establishing TLS route...";
  } else if (appState.hasUnsyncedChanges) {
    displayStatus.textContent = "Out of Sync";
    displaySubtext.textContent = "Bundled changes require transmission.";
    syncIcon.textContent = "cloud_sync";
    syncIcon.style.color = "var(--warning-color)";
  } else {
    displayStatus.textContent = "Portal Synced";
    const lastSync = appState.parcels[0] ? appState.parcels[0].time : "Never";
    displaySubtext.textContent = `Last transaction: ${lastSync}`;
    syncIcon.textContent = "cloud_done";
    syncIcon.style.color = "var(--success-color)";
  }
  const tbody = document.getElementById("parcel-history-body");
  tbody.innerHTML = "";
  if (appState.parcels.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-grey" style="text-align:center;">No synced parcels logged.</td></tr>';
  } else {
    appState.parcels.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td class="td-hash">${p.id}</td><td>${p.size}</td><td><span class="badge bg-purple-dim text-purple">${p.type}</span></td><td>${p.time}</td><td class="td-status text-success">${p.status}</td>`;
      tbody.appendChild(tr);
    });
  }
}

function renderDeploySubmission() {
  const isStaging = document.getElementById("btn-env-staging").classList.contains("active");
  const deployStatus = isStaging ? appState.team.hasDeployedStaging : appState.team.hasDeployedProd;
  const hintText = document.getElementById("deploy-desc-hint");
  if (isStaging) {
    hintText.textContent = "Deploying to staging environment (pre-verification sandbox).";
  } else {
    hintText.textContent = "Deploying to production environment. Required before submission.";
  }
  document.getElementById("sub-project-name").value = appState.submission.projectTitle;
  document.getElementById("sub-tagline").value = appState.submission.tagline;
  document.getElementById("sub-github-url").value = appState.submission.githubUrl;
  document.getElementById("sub-video-url").value = appState.submission.videoUrl;
  document.getElementById("sub-deck-url").value = appState.submission.deckUrl;
  const subBtn = document.getElementById("btn-submit-project");
  subBtn.disabled = !appState.team.hasDeployedProd;
  const timelineNodes = {
    deploy: document.getElementById("node-deploy"),
    submit: document.getElementById("node-submit"),
    review: document.getElementById("node-review"),
    line1: document.getElementById("line-1"),
    line2: document.getElementById("line-2")
  };
  if (appState.team.hasDeployedProd) {
    timelineNodes.deploy.className = "timeline-node success";
    timelineNodes.line1.className = "timeline-line success";
    timelineNodes.submit.className = "timeline-node active";
  } else {
    timelineNodes.deploy.className = "timeline-node active";
    timelineNodes.line1.className = "timeline-line";
    timelineNodes.submit.className = "timeline-node";
  }
  if (appState.submission.status === "submitted" || appState.submission.status === "review") {
    timelineNodes.submit.className = "timeline-node success";
    timelineNodes.line2.className = "timeline-line success";
    timelineNodes.review.className = "timeline-node active";
    subBtn.innerHTML = '<span class="material-symbols-outlined">done_all</span> Submission Locked';
    subBtn.disabled = true;
    subBtn.className = "btn btn-outline btn-large";
  } else {
    timelineNodes.review.className = "timeline-node";
    timelineNodes.line2.className = "timeline-line";
    subBtn.innerHTML = '<span class="material-symbols-outlined">send</span> Submit Deliverables';
    subBtn.className = "btn btn-success btn-large";
  }
  const offlineMsg = document.getElementById("preview-offline-msg");
  const liveUI = document.getElementById("preview-live-ui");
  const addressText = document.getElementById("device-address");
  const subdomain = isStaging ? "team-alpha-staging" : "team-alpha";
  const targetUrl = `https://${subdomain}.enter.pro/demo`;
  addressText.textContent = targetUrl;
  document.getElementById("sub-demo-url").value = targetUrl;
  if (deployStatus) {
    offlineMsg.style.display = "none";
    liveUI.style.display = "flex";
    const completedTasks = appState.tasks.filter(t => t.status === "completed");
    const incompleteTasks = appState.tasks.filter(t => t.status !== "completed");
    liveUI.innerHTML = `
      <div class="sandbox-header">
        <div class="sandbox-logo">${appState.submission.projectTitle || appState.team.name + " Mockup"}</div>
        <span class="badge ${isStaging ? 'bg-purple-dim text-purple' : 'bg-green-dim text-success'}" style="font-size:8px;">${isStaging ? 'Staging Environment' : 'Production Build'}</span>
      </div>
      <p class="hint-text" style="font-style:italic;">"${appState.submission.tagline || appState.team.slogan}"</p>
      <div class="sandbox-grid">
        <div class="sandbox-card"><h5>Total Modules</h5><h2>${appState.tasks.length}</h2></div>
        <div class="sandbox-card"><h5>Modules Completed</h5><h2 class="text-success">${completedTasks.length}</h2></div>
      </div>
      <div class="sandbox-card" style="flex:1; overflow-y:auto; max-height: 120px;">
        <h5 style="margin-bottom: 5px;">Deployed Container Logs</h5>
        <div style="font-family:var(--font-mono); font-size:10px; display:flex; flex-direction:column; gap:4px;">
          <div class="text-success">[sys] Port listener active.</div>
          <div class="text-cyan">[sync] Data sync: ${appState.parcels.length} parcels verified.</div>
          ${completedTasks.map(t => `<div class="text-grey">[done] Compiled: ${t.title}</div>`).join("")}
          ${incompleteTasks.length > 0 ? `<div class="text-orange">[pending] Incomplete: ${incompleteTasks[0].title}...</div>` : '<div class="text-success">[complete] All core milestone modules deployed successfully!</div>'}
        </div>
      </div>
    `;
  } else {
    offlineMsg.style.display = "flex";
    liveUI.style.display = "none";
  }
  if (appState.activeRole === "mentor") {
    document.getElementById("eval-score-ux").value = appState.submission.mentorRatingUX;
    document.getElementById("eval-score-code").value = appState.submission.mentorRatingCode;
    document.getElementById("eval-comments").value = appState.submission.mentorComments;
  }
}

function renderLeaderboard() {
  const fullTable = calculateStandings();
  const goldTeam = fullTable[0];
  const silverTeam = fullTable[1];
  const bronzeTeam = fullTable[2];
  if (goldTeam) {
    document.getElementById("podium-1-name").textContent = goldTeam.name;
    document.getElementById("podium-1-score").textContent = `${goldTeam.score} Points`;
    document.querySelector('.podium-card.gold .sync-count').textContent = `${goldTeam.syncs} Syncs`;
    const badge = document.querySelector('.podium-card.gold .podium-sub-status .badge');
    badge.textContent = goldTeam.status === "submitted" || goldTeam.status === "review" ? "Submitted" : "Drafting";
    badge.className = goldTeam.status === "submitted" || goldTeam.status === "review" ? "badge bg-green-dim text-success" : "badge bg-purple-dim text-purple";
  }
  if (silverTeam) {
    document.getElementById("podium-2-name").textContent = silverTeam.name;
    document.getElementById("podium-2-score").textContent = `${silverTeam.score} Points`;
    document.querySelector('.podium-card.silver .sync-count').textContent = `${silverTeam.syncs} Syncs`;
    const badge = document.querySelector('.podium-card.silver .podium-sub-status .badge');
    badge.textContent = silverTeam.status === "submitted" || silverTeam.status === "review" ? "Submitted" : "Drafting";
    badge.className = silverTeam.status === "submitted" || silverTeam.status === "review" ? "badge bg-green-dim text-success" : "badge bg-purple-dim text-purple";
  }
  if (bronzeTeam) {
    document.getElementById("podium-3-name").textContent = bronzeTeam.name;
    document.getElementById("podium-3-score").textContent = `${bronzeTeam.score} Points`;
    document.querySelector('.podium-card.bronze .sync-count').textContent = `${bronzeTeam.syncs} Syncs`;
    const badge = document.querySelector('.podium-card.bronze .podium-sub-status .badge');
    badge.textContent = bronzeTeam.status === "submitted" || bronzeTeam.status === "review" ? "Submitted" : "Drafting";
    badge.className = bronzeTeam.status === "submitted" || bronzeTeam.status === "review" ? "badge bg-green-dim text-success" : "badge bg-purple-dim text-purple";
  }
  const searchFilter = document.getElementById("leaderboard-search").value.toLowerCase();
  const tbody = document.getElementById("leaderboard-body");
  tbody.innerHTML = "";
  fullTable.forEach((team, index) => {
    if (team.name.toLowerCase().includes(searchFilter)) {
      const rank = index + 1;
      const isOurTeam = team.name === appState.team.name;
      const tr = document.createElement("tr");
      if (isOurTeam) tr.style.background = "rgba(139, 92, 246, 0.05)";
      let badgeClass = "badge bg-purple-dim text-purple";
      let statusText = "Draft";
      if (team.status === "submitted") { badgeClass = "badge bg-green-dim text-success"; statusText = "Submitted"; }
      if (team.status === "review") { badgeClass = "badge bg-cyan-dim text-cyan"; statusText = "In Review"; }
      tr.innerHTML = `
        <td style="font-weight:700;">#${rank}</td>
        <td style="font-weight:600;">${team.name} ${isOurTeam ? '<span class="text-cyan" style="font-size:10px; font-weight:normal;">(You)</span>' : ""}</td>
        <td style="font-family:var(--font-mono); font-weight:700;" class="text-cyan">${team.score}</td>
        <td>${team.tasksDone}/${team.tasksTotal}</td>
        <td>${team.syncs}</td>
        <td>${team.deployed ? '<span class="text-success">Active</span>' : '<span class="text-grey">Offline</span>'}</td>
        <td><span class="${badgeClass}">${statusText}</span></td>
        <td style="max-width: 140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-style:italic; font-size:11px;" class="text-grey" title="${team.mentorNotes || '-'}">${team.mentorNotes || "-"}</td>
        <td><button class="btn btn-outline btn-small view-team-details-btn" data-team="${team.name}">Details</button></td>
      `;
      tbody.appendChild(tr);
    }
  });
}

function renderChatMessages() {
  const container = document.getElementById("chat-messages-container");
  container.innerHTML = "";
  appState.chatMessages.forEach(msg => {
    const isMe = msg.sender === "You";
    const row = document.createElement("div");
    row.className = `chat-msg-row ${isMe ? 'me' : ''}`;
    row.innerHTML = `
      <div class="chat-msg-meta">
        ${isMe ? `<span>${msg.time}</span><strong>${msg.sender}</strong>` : `<strong>${msg.sender}</strong><span>${msg.time}</span>`}
      </div>
      <div class="chat-msg-bubble">${msg.text}</div>
    `;
    container.appendChild(row);
  });
  container.scrollTop = container.scrollHeight;
}

function triggerChatReply(userMessage) {
  const typingIndicator = document.getElementById("chat-typing-indicator");
  const typingText = document.getElementById("chat-typing-text");
  typingIndicator.style.display = "flex";
  const teamBots = [
    { name: "Aria Chen", role: "Backend Engineer" },
    { name: "Max Kowalski", role: "UI/UX Designer" }
  ];
  const selectedBot = teamBots[Math.floor(Math.random() * teamBots.length)];
  typingText.textContent = `${selectedBot.name} is typing...`;
  let replyText = "Awesome! Let's keep compiling modules.";
  const q = userMessage.toLowerCase();
  if (q.includes("sync") || q.includes("parcel")) {
    replyText = `I see we have ${appState.parcels.length} parcels synced on the gateway. Let me know when you run the next Parcle Data Sync!`;
  } else if (q.includes("task") || q.includes("todo") || q.includes("kanban") || q.includes("done")) {
    const pending = appState.tasks.filter(t => t.status !== "completed").length;
    replyText = pending > 0 ? `Still got ${pending} tasks on our sprint backlog. I can jump on the next Frontend module.` : "All tasks are marked completed! Superb velocity, let's deploy!";
  } else if (q.includes("deploy") || q.includes("staging") || q.includes("production")) {
    if (appState.team.hasDeployedProd) {
      replyText = "The production build is active on Enter Pro edge routers! Ready to submit our final pitch?";
    } else {
      replyText = "We should double check the staging sandbox route first before locking in the production build.";
    }
  } else if (q.includes("hello") || q.includes("hey") || q.includes("hi")) {
    replyText = `Hey there! Ready to crush this hackathon project. What's our next milestone?`;
  } else if (q.includes("badge") || q.includes("achievement") || q.includes("points")) {
    replyText = `Our standing is looking solid! We are ranked #${appState.team.rank} on the leaderboard. Let's aim for #1.`;
  }
  setTimeout(() => {
    typingIndicator.style.display = "none";
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0].substring(0, 5);
    appState.chatMessages.push({ sender: selectedBot.name, text: replyText, time: timeStr, type: "received" });
    const chatDrawer = document.getElementById("chat-drawer");
    if (!chatDrawer.classList.contains("active")) {
      document.getElementById("chat-notif-dot").style.display = "inline-block";
      showToast(`New message from ${selectedBot.name}`, "info");
    }
    saveData();
    renderChatMessages();
  }, 1500 + Math.random() * 1000);
}

setInterval(() => {
  const chatDrawer = document.getElementById("chat-drawer");
  if (appState.chatMessages) {
    const teamBots = [
      { name: "Aria Chen", text: "Just reviewed the compiler scripts, looks stable." },
      { name: "Max Kowalski", text: "Don't forget to sync our delta using Parcle before deadlines!" }
    ];
    const item = teamBots[Math.floor(Math.random() * teamBots.length)];
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0].substring(0, 5);
    appState.chatMessages.push({ sender: item.name, text: item.text, time: timeStr, type: "received" });
    if (!chatDrawer.classList.contains("active")) {
      const dot = document.getElementById("chat-notif-dot");
      if (dot) dot.style.display = "inline-block";
      showToast(`New collaboration message in chat`, "info");
    }
    saveData();
    renderChatMessages();
  }
}, 50000);

function initTheme() {
  const body = document.body;
  const icon = document.getElementById("theme-toggle-icon");
  if (appState.theme === "light") {
    body.classList.add("light-theme");
    body.classList.remove("dark-theme");
    icon.textContent = "dark_mode";
  } else {
    body.classList.add("dark-theme");
    body.classList.remove("light-theme");
    icon.textContent = "light_mode";
  }
}

function setupEventListeners() {
  // ── GLOBAL: catch clicks on disabled buttons and show helpful messages ──
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || !btn.disabled) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (btn.id === "btn-submit-project") {
      showToast("Deploy to Production first to unlock the Submit button.", "warning");
    } else if (btn.classList.contains("dev-only")) {
      showToast("Switch to Developer role (top-right selector) to use this feature.", "warning");
    } else if (btn.classList.contains("admin-only")) {
      showToast("Switch to Admin role to use this feature.", "warning");
    } else {
      showToast("This action is not available in the current mode.", "info");
    }
  }, true); // capture phase
  // 1. Theme toggle
  document.getElementById("theme-toggle-btn").addEventListener("click", () => {
    appState.theme = appState.theme === "dark" ? "light" : "dark";
    initTheme();
    saveData();
    showToast(`Switched to ${appState.theme} mode.`, "info");
  });

  // 2. Role switcher
  document.getElementById("header-role-select").addEventListener("change", (e) => {
    appState.activeRole = e.target.value;
    appState.notifications.push({ id: getUUID("not"), title: "Role Switch Action", desc: `Interface view configured to ${appState.activeRole.toUpperCase()}`, time: "Just now", type: "info" });
    saveData();
    renderUI();
    if (appState.activeRole === "admin") {
      document.querySelector('[data-tab="admin-console"]').click();
    } else {
      document.querySelector('[data-tab="dashboard"]').click();
    }
    showToast(`Switched view to ${appState.activeRole.toUpperCase()}`, "success");
  });

  // 3. Chat drawer
  const chatToggle = document.getElementById("chat-toggle-btn");
  const chatDrawer = document.getElementById("chat-drawer");
  const chatClose = document.getElementById("chat-drawer-close");
  const chatNotifDot = document.getElementById("chat-notif-dot");
  chatToggle.addEventListener("click", () => {
    chatDrawer.classList.toggle("active");
    if (chatDrawer.classList.contains("active")) {
      chatNotifDot.style.display = "none";
      renderChatMessages();
    }
  });
  chatClose.addEventListener("click", () => { chatDrawer.classList.remove("active"); });
  document.getElementById("chat-send-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const val = input.value.trim();
    if (!val) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0].substring(0, 5);
    appState.chatMessages.push({ sender: "You", text: val, time: timeStr, type: "sent" });
    input.value = "";
    saveData();
    renderChatMessages();
    triggerChatReply(val);
  });

  // 4. Analytics tabs
  document.querySelectorAll(".analytics-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".analytics-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-chart");
      document.querySelectorAll(".analytics-svg").forEach(svg => { svg.style.display = "none"; });
      document.getElementById(`chart-${target}`).style.display = "block";
    });
  });

  // Chart tooltip
  const tooltip = document.getElementById("chart-tooltip");
  document.querySelectorAll(".chart-dot, rect").forEach(el => {
    el.addEventListener("mouseenter", (e) => {
      const txt = el.getAttribute("data-tip");
      if (txt) { tooltip.textContent = txt; tooltip.style.opacity = "1"; }
    });
    el.addEventListener("mouseleave", () => { tooltip.textContent = "Hover over chart elements to inspect details"; });
  });

  // 5. GitHub connect
  document.getElementById("btn-github-connect").addEventListener("click", () => {
    const input = document.getElementById("github-repo-input");
    const repoUrl = input.value.trim();
    if (!repoUrl) { showToast("Please enter a valid repository address.", "warning"); return; }
    appState.githubRepo.connected = true;
    appState.githubRepo.url = repoUrl;
    appState.githubRepo.commits = [
      { hash: "f83a1b0", msg: "feat: scaffold parcle data compiler sync interfaces", author: "Ashutosh", date: "10 mins ago" },
      { hash: "e2c091d", msg: "refactor: design layout grids, custom scrollbar properties", author: "Max", date: "2 hours ago" },
      { hash: "89aef7c", msg: "fix: client socket handshakes with gateway.parcel.io", author: "Aria", date: "5 hours ago" }
    ];
    appState.notifications.push({ id: getUUID("not"), title: "VCS Connected", desc: `Connected to GitHub repository: ${repoUrl}`, time: "Just now", type: "success" });
    saveData();
    renderUI();
    showToast("GitHub repository synced successfully!", "success");
  });

  // 6. Deploy env selector
  document.querySelectorAll(".env-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".env-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderDeploySubmission();
    });
  });

  // 7. Modals
  document.querySelectorAll(".modal-close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const m = btn.closest(".modal-overlay");
      if (m) m.classList.remove("active");
    });
  });
  document.getElementById("btn-intro-dismiss").addEventListener("click", () => { closeModal("sandbox-intro-modal"); });

  // 8. Sidebar navigation
  document.querySelectorAll(".menu-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      document.querySelectorAll(".menu-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      const panel = document.getElementById(`tab-${targetTab}`);
      if (panel) panel.classList.add("active");
      const titles = {
        dashboard: { main: "Team Dashboard", sub: "Overview & Analytics" },
        tasks: { main: "Task Manager", sub: "Kanban Sprint Board" },
        "parcel-sync": { main: "Parcle Sync Control", sub: "Offline State Bundler" },
        "deploy-submission": { main: "Enter Pro Deploy", sub: "Compiler Sandbox & Submissions" },
        leaderboard: { main: "Global Leaderboard", sub: "Standings & Live Ranks" },
        "admin-console": { main: "System Admin Panel", sub: "Global Variables & Fault Diagnostics" }
      };
      if (titles[targetTab]) {
        document.getElementById("current-page-title").textContent = titles[targetTab].main;
        document.getElementById("current-page-sub").textContent = titles[targetTab].sub;
      }
      // Refresh admin data on tab switch
      if (targetTab === "admin-console") {
        renderPendingTeams();
        renderAuditLog();
      }
    });
  });

  // 9. Edit team / add member
  document.getElementById("edit-team-btn").addEventListener("click", () => {
    document.getElementById("team-name-input").value = appState.team.name;
    document.getElementById("team-slogan-input").value = appState.team.slogan;
    openModal("team-modal");
  });
  document.getElementById("team-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const oldName = appState.team.name;
    appState.team.name = document.getElementById("team-name-input").value.trim();
    appState.team.slogan = document.getElementById("team-slogan-input").value.trim();
    appState.notifications.push({ id: getUUID("not"), title: "Workspace Changed", desc: `Workspace renamed from ${oldName} to ${appState.team.name}`, time: "Just now", type: "info" });
    saveData();
    closeModal("team-modal");
    renderUI();
    showToast("Workspace profile updated!", "success");
  });

  document.getElementById("add-member-btn").addEventListener("click", () => {
    document.getElementById("member-name-input").value = "";
    document.getElementById("member-role-input").value = "";
    openModal("member-modal");
  });
  document.getElementById("member-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("member-name-input").value.trim();
    const role = document.getElementById("member-role-input").value.trim();
    appState.members.push({ name, role });
    appState.notifications.push({ id: getUUID("not"), title: "Roster Updated", desc: `Added ${name} as ${role} to the team roster.`, time: "Just now", type: "info" });
    saveData();
    closeModal("member-modal");
    renderUI();
    showToast(`${name} added to roster.`, "success");
  });

  // 10. Kanban drag & drop
  const containers = document.querySelectorAll(".kanban-cards-container");
  containers.forEach(container => {
    container.addEventListener("dragover", (e) => { e.preventDefault(); container.classList.add("dragover"); });
    container.addEventListener("dragleave", () => { container.classList.remove("dragover"); });
    container.addEventListener("drop", (e) => {
      e.preventDefault();
      container.classList.remove("dragover");
      if (appState.activeRole !== "developer") { showToast("Drag-and-drop actions restricted in this role view.", "warning"); return; }
      const id = e.dataTransfer.getData("text/plain");
      const targetStatus = container.getAttribute("data-status");
      const task = appState.tasks.find(t => t.id === id);
      if (task && task.status !== targetStatus) {
        task.status = targetStatus;
        appState.hasUnsyncedChanges = true;
        appState.notifications.push({ id: getUUID("not"), title: "Task Moved", desc: `"${task.title}" shifted to status ${targetStatus.toUpperCase()}`, time: "Just now", type: "info" });
        if (targetStatus === "completed" && taskMoveTime) {
          const delta = (Date.now() - taskMoveTime) / 1000;
          if (delta < 5.0) { awardBadge("fast-fixer"); }
        }
        saveData();
        renderUI();
        showToast(`Moved task to ${targetStatus.toUpperCase()}`, "info");
      }
    });
  });

  // Create task
  document.getElementById("btn-create-task").addEventListener("click", () => {
    document.getElementById("task-modal-title").textContent = "Create New Task";
    document.getElementById("task-id").value = "";
    document.getElementById("task-title").value = "";
    document.getElementById("task-desc").value = "";
    document.getElementById("task-priority").value = "Medium";
    document.getElementById("task-category").value = "Frontend";
    document.getElementById("task-status").value = "todo";
    const assigneeSelect = document.getElementById("task-assignee");
    assigneeSelect.innerHTML = "";
    appState.members.forEach(m => {
      const opt = document.createElement("option"); opt.value = m.name; opt.textContent = m.name;
      assigneeSelect.appendChild(opt);
    });
    document.getElementById("btn-task-delete").style.display = "none";
    openModal("task-modal");
  });

  document.querySelector(".kanban-board").addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-task-btn");
    if (editBtn) {
      const taskId = editBtn.getAttribute("data-id");
      const task = appState.tasks.find(t => t.id === taskId);
      if (task) {
        document.getElementById("task-modal-title").textContent = "Edit Task";
        document.getElementById("task-id").value = task.id;
        document.getElementById("task-title").value = task.title;
        document.getElementById("task-desc").value = task.description;
        document.getElementById("task-priority").value = task.priority;
        document.getElementById("task-category").value = task.category;
        document.getElementById("task-status").value = task.status;
        const assigneeSelect = document.getElementById("task-assignee");
        assigneeSelect.innerHTML = "";
        appState.members.forEach(m => {
          const opt = document.createElement("option"); opt.value = m.name; opt.textContent = m.name;
          if (m.name === task.assignee) opt.selected = true;
          assigneeSelect.appendChild(opt);
        });
        const deleteBtn = document.getElementById("btn-task-delete");
        deleteBtn.style.display = appState.activeRole === "developer" ? "inline-block" : "none";
        openModal("task-modal");
      }
    }
  });

  document.getElementById("task-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("task-id").value;
    const title = document.getElementById("task-title").value.trim();
    const description = document.getElementById("task-desc").value.trim();
    const priority = document.getElementById("task-priority").value;
    const assignee = document.getElementById("task-assignee").value;
    const category = document.getElementById("task-category").value;
    const status = document.getElementById("task-status").value;
    if (id) {
      const task = appState.tasks.find(t => t.id === id);
      if (task) {
        task.title = title; task.description = description; task.priority = priority;
        task.assignee = assignee; task.category = category; task.status = status;
        appState.notifications.push({ id: getUUID("not"), title: "Task Edited", desc: `"${title}" has been modified.`, time: "Just now", type: "info" });
      }
    } else {
      const newTask = { id: getUUID("task"), title, description, priority, assignee, category, status };
      appState.tasks.push(newTask);
      appState.notifications.push({ id: getUUID("not"), title: "Task Created", desc: `"${title}" was added.`, time: "Just now", type: "info" });
    }
    appState.hasUnsyncedChanges = true;
    saveData();
    closeModal("task-modal");
    renderUI();
    showToast("Task board updated!", "success");
  });

  document.getElementById("btn-task-delete").addEventListener("click", () => {
    const id = document.getElementById("task-id").value;
    if (id) {
      const idx = appState.tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        const deleted = appState.tasks.splice(idx, 1)[0];
        appState.notifications.push({ id: getUUID("not"), title: "Task Deleted", desc: `"${deleted.title}" removed.`, time: "Just now", type: "warning" });
        appState.hasUnsyncedChanges = true;
        saveData();
        closeModal("task-modal");
        renderUI();
        showToast("Task removed.", "info");
      }
    }
  });

  document.getElementById("task-filter-search").addEventListener("input", renderTasks);
  document.getElementById("task-filter-priority").addEventListener("change", renderTasks);
  document.getElementById("task-filter-assignee").addEventListener("change", renderTasks);

  // 11. Parcle sync
  const syncBtn = document.getElementById("btn-sync-parcel");
  syncBtn.addEventListener("click", () => {
    const outerRing = document.getElementById("sync-outer-ring");
    const terminalLogs = document.getElementById("sync-terminal-logs");
    if (outerRing.classList.contains("syncing")) return;
    if (appState.shouldSyncFail) {
      outerRing.classList.add("syncing");
      renderParcleSync();
      setTimeout(() => {
        outerRing.classList.remove("syncing");
        const div = document.createElement("div");
        div.className = "log-line error";
        div.textContent = "[CRITICAL] Connection refused by gateway.parcel.io DNS endpoint. TLS Tunnel timed out.";
        terminalLogs.appendChild(div);
        terminalLogs.scrollTop = terminalLogs.scrollHeight;
        showToast("Parcle Sync Failed! Diagnostic error injected.", "warning");
      }, 1000);
      return;
    }
    outerRing.classList.add("syncing");
    renderParcleSync();
    const lines = [
      { text: "[SYSTEM] Scan local index initiated...", type: "system" },
      { text: `[SYSTEM] Preparing package: detected ${appState.tasks.length} active database records.`, type: "system" },
      { text: `[SYSTEM] Generating sync parcel: synergy-parcel-${Math.random().toString(36).substring(7)}.json`, type: "info" },
      { text: "[SYSTEM] Querying gateway.parcel.io DNS entries...", type: "info" },
      { text: "[SYSTEM] Handshake check: TLS 1.3 protocol handshake success.", type: "success" },
      { text: "[SYSTEM] Syncing: Uploading metadata packet payload [||||||||||] 100%", type: "success" },
      { text: "[SYSTEM] Response Code: 201 Created. State synchronized successfully.", type: "success" }
    ];
    let timer = 100;
    lines.forEach((line, idx) => {
      setTimeout(() => {
        const div = document.createElement("div");
        div.className = `log-line ${line.type}`;
        div.textContent = line.text;
        terminalLogs.appendChild(div);
        terminalLogs.scrollTop = terminalLogs.scrollHeight;
        if (idx === lines.length - 1) {
          outerRing.classList.remove("syncing");
          appState.hasUnsyncedChanges = false;
          const parcelId = `prc-${Math.random().toString(36).substring(2, 6)}`;
          const bytes = appState.tasks.length * 128;
          const kbSize = `${(bytes / 1024).toFixed(2)} KB`;
          appState.parcels.unshift({ id: parcelId, size: kbSize, type: "Full State", time: "Just now", status: "Success" });
          appState.notifications.push({ id: getUUID("not"), title: "Parcle Sync Done", desc: `Synced parcel ${parcelId} payload: ${kbSize}`, time: "Just now", type: "success" });
          if (appState.parcels.length >= 3) { awardBadge("sync-master"); }
          const cursorDiv = document.createElement("div");
          cursorDiv.className = "log-line command";
          cursorDiv.innerHTML = '<span class="prompt">></span> <span class="cursor"></span>';
          terminalLogs.appendChild(cursorDiv);
          saveData();
          renderUI();
          showToast("Data Synced with Parcel Gateways!", "success");
        }
      }, timer);
      timer += 300 + Math.random() * 150;
    });
  });

  document.getElementById("btn-export-parcel").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState.tasks, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `synergy-parcel-${appState.team.name.replace(/\s+/g, "-")}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast("Downloaded parcel configuration file.", "success");
  });

  document.getElementById("btn-import-parcel-trigger").addEventListener("click", () => {
    document.getElementById("parcel-file-input").click();
  });

  document.getElementById("parcel-file-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const importedTasks = JSON.parse(evt.target.result);
        if (Array.isArray(importedTasks) && importedTasks.length > 0 && importedTasks[0].title) {
          appState.tasks = importedTasks;
          appState.hasUnsyncedChanges = true;
          appState.notifications.push({ id: getUUID("not"), title: "Parcel Imported", desc: `Imported ${importedTasks.length} task entries from parcel file.`, time: "Just now", type: "success" });
          saveData();
          renderUI();
          showToast("Imported parcel metadata successfully!", "success");
        } else {
          showToast("Invalid parcel file schema.", "warning");
        }
      } catch (err) {
        showToast("Error reading file configuration.", "warning");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("clear-terminal-btn").addEventListener("click", () => {
    const terminalLogs = document.getElementById("sync-terminal-logs");
    terminalLogs.innerHTML = '<div class="log-line command"><span class="prompt">></span> <span class="cursor"></span></div>';
  });

  // 12. Deployer
  const deployBtn = document.getElementById("btn-deploy-demo");
  deployBtn.addEventListener("click", () => {
    if (deployBtn.disabled) return;
    const isStaging = document.getElementById("btn-env-staging").classList.contains("active");
    const buildCmd = document.getElementById("deploy-build-cmd").value.trim() || "npm run build";
    const outDir = document.getElementById("deploy-output-dir").value.trim() || "dist/";
    const branch = document.getElementById("deploy-branch").value;
    const termLogs = document.getElementById("deploy-terminal-logs");
    const cursor = termLogs.querySelector(".command");
    if (cursor) cursor.remove();
    deployBtn.disabled = true;
    deployBtn.innerHTML = '<span class="material-symbols-outlined rotate-sync">sync</span> Deploying App...';
    if (appState.shouldBuildFail) {
      setTimeout(() => {
        const div = document.createElement("div");
        div.className = "log-line error";
        div.textContent = "[ENTERPRO ERROR] Compile error: SyntaxError: Unexpected token '<' in index.js:14.";
        termLogs.appendChild(div);
        termLogs.scrollTop = termLogs.scrollHeight;
        deployBtn.disabled = false;
        deployBtn.innerHTML = '<span class="material-symbols-outlined">cloud_upload</span> Deploy Demo to Enter.pro';
        showToast("Enter Pro Build Failed! Error code 500.", "warning");
      }, 1000);
      return;
    }
    const steps = [
      { text: `[ENTERPRO] Instantiating container builder route on branch: ${branch}.`, type: "system" },
      { text: `[ENTERPRO] Preparing target: ${isStaging ? 'STAGING PREVIEW' : 'PRODUCTION BUILD'}.`, type: "info" },
      { text: `[ENTERPRO] Executing compiler instruction: "${buildCmd}"`, type: "info" },
      { text: "[ENTERPRO] Running: npm install --frozen-lockfile", type: "info" },
      { text: "[ENTERPRO] Bundling assets & minifying output scripts...", type: "info" },
      { text: `[ENTERPRO] Successfully wrote compiled artifacts to /${outDir}`, type: "success" },
      { text: `[ENTERPRO] Verifying routing protocols at team-alpha${isStaging ? '-staging' : ''}.enter.pro...`, type: "info" },
      { text: `[ENTERPRO] Deploy SUCCESSFUL! Live staging edge mapped successfully.`, type: "success" }
    ];
    let delay = 100;
    steps.forEach((step, idx) => {
      setTimeout(() => {
        const div = document.createElement("div");
        div.className = `log-line ${step.type}`;
        div.textContent = step.text;
        termLogs.appendChild(div);
        termLogs.scrollTop = termLogs.scrollHeight;
        if (idx === steps.length - 1) {
          if (isStaging) {
            appState.team.hasDeployedStaging = true;
            awardBadge("staging-pioneer");
          } else {
            appState.team.hasDeployedProd = true;
            awardBadge("production-ready");
          }
          appState.notifications.push({ id: getUUID("not"), title: isStaging ? "Staging Deployed" : "Production Deployed", desc: `Decompiled bundle deployed to Enter Pro ${isStaging ? 'staging' : 'production'}.`, time: "Just now", type: "deploy" });
          const cursorDiv = document.createElement("div");
          cursorDiv.className = "log-line command";
          cursorDiv.innerHTML = '<span class="prompt">></span> <span class="cursor"></span>';
          termLogs.appendChild(cursorDiv);
          deployBtn.disabled = false;
          deployBtn.innerHTML = '<span class="material-symbols-outlined">cloud_upload</span> Deploy Demo to Enter.pro';
          saveData();
          renderUI();
          showToast(`App Deployed to Enter Pro ${isStaging ? 'Staging' : 'Production'}!`, "success");
        }
      }, delay);
      delay += 200 + Math.random() * 150;
    });
  });

  document.getElementById("clear-deploy-terminal-btn").addEventListener("click", () => {
    const termLogs = document.getElementById("deploy-terminal-logs");
    termLogs.innerHTML = '<div class="log-line command"><span class="prompt">></span> <span class="cursor"></span></div>';
  });

  document.getElementById("refresh-preview-btn").addEventListener("click", () => {
    const isStaging = document.getElementById("btn-env-staging").classList.contains("active");
    const status = isStaging ? appState.team.hasDeployedStaging : appState.team.hasDeployedProd;
    if (status) {
      const liveUI = document.getElementById("preview-live-ui");
      liveUI.style.opacity = "0.5";
      showToast("Syncing sandbox view...", "info");
      setTimeout(() => { liveUI.style.opacity = "1"; renderDeploySubmission(); }, 500);
    }
  });

  // 13. Submission form
  document.getElementById("submission-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!appState.team.hasDeployedProd) {
      showToast("You must compile your production build to Enter Pro before final submission!", "warning");
      return;
    }
    appState.submission.projectTitle = document.getElementById("sub-project-name").value.trim();
    appState.submission.tagline = document.getElementById("sub-tagline").value.trim();
    appState.submission.githubUrl = document.getElementById("sub-github-url").value.trim();
    appState.submission.videoUrl = document.getElementById("sub-video-url").value.trim();
    appState.submission.deckUrl = document.getElementById("sub-deck-url").value.trim();
    appState.submission.status = "submitted";
    appState.notifications.push({ id: getUUID("not"), title: "Deliverables Locked", desc: `Official submission recorded: "${appState.submission.projectTitle}"`, time: "Just now", type: "success" });
    awardBadge("polished-pitch");
    saveData();
    renderUI();
    showToast("Project deliverables submitted successfully!", "success");
  });

  // 14. Mentor evaluation
  document.getElementById("btn-eval-approve").addEventListener("click", () => {
    if (appState.activeRole !== "mentor") return;
    appState.submission.mentorRatingUX = document.getElementById("eval-score-ux").value;
    appState.submission.mentorRatingCode = document.getElementById("eval-score-code").value;
    appState.submission.mentorComments = document.getElementById("eval-comments").value.trim();
    appState.submission.status = "review";
    appState.notifications.push({ id: getUUID("not"), title: "Evaluation Added", desc: `Dr. Vance rated project: UX: ${appState.submission.mentorRatingUX}/10, Code: ${appState.submission.mentorRatingCode}/10`, time: "Just now", type: "success" });
    saveData();
    renderUI();
    showToast("Review scorecard submitted! Leaderboard points adjusted.", "success");
  });

  document.getElementById("btn-eval-request-changes").addEventListener("click", () => {
    if (appState.activeRole !== "mentor") return;
    appState.submission.mentorComments = document.getElementById("eval-comments").value.trim();
    appState.submission.status = "draft";
    appState.notifications.push({ id: getUUID("not"), title: "Changes Requested", desc: `Mentor Elena Vance requested adjustments: "${appState.submission.mentorComments}"`, time: "Just now", type: "warning" });
    saveData();
    renderUI();
    showToast("Requested modifications sent to developer timeline.", "info");
  });

  // 15. Admin settings
  document.getElementById("btn-save-admin-settings").addEventListener("click", () => {
    if (appState.activeRole !== "admin") return;
    appState.adminDeadline = document.getElementById("admin-deadline-input").value;
    appState.adminAutosync = document.getElementById("admin-autosync-input").value;
    appState.adminAllowLate = document.getElementById("admin-allow-late").checked;
    appState.notifications.push({ id: getUUID("not"), title: "Admin Settings Applied", desc: `Deadline adjusted to ${appState.adminDeadline.replace('T', ' ')}`, time: "Just now", type: "success" });
    saveData();
    renderUI();
    showToast("Global hackathon configurations updated!", "success");
  });

  document.getElementById("btn-sim-sync-fail").addEventListener("click", () => {
    appState.shouldSyncFail = !appState.shouldSyncFail;
    const active = appState.shouldSyncFail;
    document.getElementById("btn-sim-sync-fail").style.borderColor = active ? "var(--warning-color)" : "rgba(255,255,255,0.08)";
    showToast(active ? "Diagnostic Parcle sync timeout error injected." : "Parcle sync gateways restored.", active ? "warning" : "success");
  });

  document.getElementById("btn-sim-build-fail").addEventListener("click", () => {
    appState.shouldBuildFail = !appState.shouldBuildFail;
    const active = appState.shouldBuildFail;
    document.getElementById("btn-sim-build-fail").style.borderColor = active ? "var(--danger-color)" : "rgba(255,255,255,0.08)";
    showToast(active ? "Diagnostic Enter Pro compiler syntax error injected." : "Enter Pro compiler sandbox restored.", active ? "warning" : "success");
  });

  document.getElementById("btn-reset-db-state").addEventListener("click", () => {
    if (confirm("Are you sure you want to wipe all local cache states? This resets sandbox configurations to default.")) {
      localStorage.removeItem("synergy_state_upgraded");
      showToast("Local database cleared. Re-scaffolding...", "warning");
      setTimeout(() => { window.location.reload(); }, 800);
    }
  });

  // 16. Leaderboard details
  document.getElementById("leaderboard-body").addEventListener("click", (e) => {
    const btn = e.target.closest(".view-team-details-btn");
    if (btn) {
      const teamName = btn.getAttribute("data-team");
      const list = calculateStandings();
      const team = list.find(t => t.name === teamName);
      const rank = list.findIndex(t => t.name === teamName) + 1;
      if (team) {
        document.getElementById("lead-modal-team-name").textContent = team.name;
        document.getElementById("lead-modal-rank").textContent = `#${rank}`;
        document.getElementById("lead-modal-score").textContent = team.score;
        document.getElementById("lead-modal-syncs").textContent = team.syncs;
        document.getElementById("lead-modal-tasks").textContent = `${team.tasksDone}/${team.tasksTotal}`;
        document.getElementById("lead-modal-project").textContent = team.project || "Not Submitted";
        document.getElementById("lead-modal-tagline").textContent = team.tagline || "-";
        const repoBtn = document.getElementById("lead-modal-repo");
        const demoBtn = document.getElementById("lead-modal-demo");
        if (team.status === "submitted" || team.status === "review") {
          repoBtn.style.display = "inline-flex";
          demoBtn.style.display = "inline-flex";
          repoBtn.href = team.githubUrl || "#";
          demoBtn.href = `https://${team.name.toLowerCase().replace(/\s+/g, "-")}.enter.pro/demo`;
        } else {
          repoBtn.style.display = "none";
          demoBtn.style.display = "none";
        }
        const membersDiv = document.getElementById("lead-modal-members");
        membersDiv.innerHTML = "";
        team.members.forEach(m => {
          const pill = document.createElement("div");
          pill.className = "member-pill";
          pill.style.padding = "4px 10px";
          pill.style.fontSize = "11px";
          pill.textContent = m;
          membersDiv.appendChild(pill);
        });
        openModal("leaderboard-detail-modal");
      }
    }
  });

  document.getElementById("leaderboard-search").addEventListener("input", renderLeaderboard);

  // Global search (with null guard)
  const globalSearch = document.getElementById("global-search");
  if (globalSearch) {
    globalSearch.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      if (!q) return;
      if (q.includes("task") || q.includes("todo") || q.includes("progress")) {
        document.querySelector('[data-tab="tasks"]').click();
        document.getElementById("task-filter-search").value = q;
        renderTasks();
      } else if (q.includes("sync") || q.includes("parcel")) {
        document.querySelector('[data-tab="parcel-sync"]').click();
      } else if (q.includes("deploy") || q.includes("submit") || q.includes("enter")) {
        document.querySelector('[data-tab="deploy-submission"]').click();
      } else if (q.includes("leader") || q.includes("rank") || q.includes("score")) {
        document.querySelector('[data-tab="leaderboard"]').click();
        document.getElementById("leaderboard-search").value = q;
        renderLeaderboard();
      }
    });
  }

  // Notifications bell
  const bell = document.getElementById("notif-bell-btn");
  const dd = document.getElementById("notif-dropdown");
  bell.addEventListener("click", (e) => { e.stopPropagation(); dd.classList.toggle("active"); });
  document.addEventListener("click", () => { dd.classList.remove("active"); });
  dd.addEventListener("click", (e) => { e.stopPropagation(); });

  document.getElementById("clear-notifs-btn").addEventListener("click", () => {
    appState.notifications = [];
    saveData();
    renderUI();
    showToast("Notifications cleared.", "info");
  });

  // Refresh activity
  const refreshBtn = document.getElementById("refresh-activity-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      renderDashboard();
      showToast("Activity feed refreshed.", "info");
    });
  }
}

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

/* ============================================================
   ADMIN APPROVAL SYSTEM — Team Registrations (localStorage)
   ============================================================ */

const REG_KEY = "synergy_registrations";
const AUDIT_KEY = "synergy_audit_log";

function loadRegistrations() {
  try { return JSON.parse(localStorage.getItem(REG_KEY)) || []; } catch { return []; }
}
function saveRegistrations(list) {
  localStorage.setItem(REG_KEY, JSON.stringify(list));
}
function loadAuditLog() {
  try { return JSON.parse(localStorage.getItem(AUDIT_KEY)) || []; } catch { return []; }
}
function saveAuditLog(list) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(list));
}
function addAuditEntry(action, teamId, teamName, detail = "") {
  const log = loadAuditLog();
  log.unshift({
    id: `aud-${Date.now()}`,
    action,
    teamId,
    teamName,
    detail,
    actor: appState.activeRole,
    time: new Date().toLocaleString()
  });
  saveAuditLog(log.slice(0, 100)); // keep last 100
}

/* -- Render Pending Teams Panel -- */
function renderPendingTeams() {
  const all = loadRegistrations();
  const pending = all.filter(r => r.status === "pending");
  const badge = document.getElementById("pending-teams-badge");
  if (badge) badge.textContent = pending.length;

  const list = document.getElementById("pending-teams-list");
  const empty = document.getElementById("pending-empty-state");
  const bulkBtn = document.getElementById("btn-bulk-approve");
  if (!list) return;

  // Remove existing team cards
  list.querySelectorAll(".pending-team-card").forEach(c => c.remove());

  if (pending.length === 0) {
    if (empty) empty.style.display = "block";
    if (bulkBtn) bulkBtn.style.display = "none";
    return;
  }

  if (empty) empty.style.display = "none";
  if (bulkBtn && pending.length > 1) bulkBtn.style.display = "flex";

  pending.forEach(reg => {
    const card = document.createElement("div");
    card.className = "pending-team-card";
    card.dataset.id = reg.id;
    card.style.cssText = `
      border:1px solid rgba(249,115,22,0.18);
      border-radius:10px; padding:16px 18px; margin-bottom:12px;
      background:rgba(249,115,22,0.03);
      display:flex; flex-direction:column; gap:12px;
      animation:card-enter-anim 0.3s ease;
    `;

    const memberList = reg.members.map(m =>
      `<span style="font-size:11px; background:rgba(255,255,255,0.05); padding:2px 8px; border-radius:20px; border:1px solid rgba(255,255,255,0.07);">${m.name} · <span style="color:var(--text-grey)">${m.role}</span></span>`
    ).join(" ");

    const submittedDate = new Date(reg.submittedAt).toLocaleString();

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:12px;">
          <input type="checkbox" class="pending-team-chk" data-id="${reg.id}" style="width:15px;height:15px;" />
          <div>
            <div style="font-size:15px; font-weight:700;">${reg.team.name}</div>
            <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">${reg.id} · ${reg.team.track}</div>
          </div>
        </div>
        <span style="font-size:10px; background:rgba(249,115,22,0.12); color:var(--warning-color); border:1px solid rgba(249,115,22,0.25); padding:3px 10px; border-radius:20px; font-weight:700;">PENDING</span>
      </div>
      <div style="font-size:12px; color:var(--text-secondary); line-height:1.6; padding:10px 12px; background:rgba(255,255,255,0.02); border-radius:8px; border:1px solid var(--panel-border);">
        <strong style="font-size:10px; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-grey);">Project Idea</strong><br/>
        ${reg.team.projectIdea}
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
        <span style="font-size:10px; color:var(--text-grey); text-transform:uppercase; letter-spacing:0.5px; margin-right:2px;">Members:</span>
        ${memberList}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <span style="font-size:11px; color:var(--text-grey);">Submitted: ${submittedDate}</span>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-small reject-team-btn" data-id="${reg.id}" data-name="${reg.team.name}"
            style="background:rgba(239,68,68,0.1); color:var(--danger-color); border:1px solid rgba(239,68,68,0.25);">
            <span class="material-symbols-outlined">block</span> Reject
          </button>
          <button class="btn btn-small approve-team-btn" data-id="${reg.id}" data-name="${reg.team.name}"
            style="background:rgba(16,185,129,0.12); color:var(--success-color); border:1px solid rgba(16,185,129,0.25);">
            <span class="material-symbols-outlined">check_circle</span> Approve
          </button>
        </div>
      </div>
    `;

    // Approve
    card.querySelector(".approve-team-btn").addEventListener("click", () => approveTeam(reg.id));
    // Reject
    card.querySelector(".reject-team-btn").addEventListener("click", () => openRejectModal(reg.id, reg.team.name));

    list.appendChild(card);
  });

  // Wire up bulk approve checkbox
  if (bulkBtn) {
    bulkBtn.onclick = () => {
      const checked = Array.from(document.querySelectorAll(".pending-team-chk:checked")).map(c => c.dataset.id);
      if (checked.length === 0) { showToast("Select at least one team.", "warning"); return; }
      checked.forEach(id => approveTeam(id, true));
      showToast(`${checked.length} team(s) approved.`, "success");
    };
  }
}

/* -- Approve a team -- */
function approveTeam(id, silent = false) {
  const all = loadRegistrations();
  const reg = all.find(r => r.id === id);
  if (!reg) return;

  reg.status = "approved";
  reg.approvedAt = new Date().toISOString();
  saveRegistrations(all);

  // Add to leaderboard competitors in appState
  if (!appState.competitors.find(c => c.name === reg.team.name)) {
    appState.competitors.push({
      name: reg.team.name,
      score: 0,
      tasksDone: 0,
      tasksTotal: 5,
      syncs: 0,
      deployed: false,
      status: "draft",
      members: reg.members.map(m => `${m.name} (${m.role})`),
      project: reg.team.projectIdea.slice(0, 40) + "...",
      tagline: reg.team.slogan || "Hackathon project.",
      mentorNotes: "—"
    });
    saveData();
  }

  addAuditEntry("APPROVED", reg.id, reg.team.name, `Track: ${reg.team.track}`);
  if (!silent) {
    showToast(`Team "${reg.team.name}" approved! Team ID: ${reg.id}`, "success");
    // Offer to switch to Demo Mode after first approval
    if (getEnvMode() === "offline") {
      setTimeout(() => showToast("Tip: Switch to Demo Mode in Admin panel to load judge-ready data!", "info"), 1800);
    }
  }

  renderPendingTeams();
  renderAuditLog();
  renderLeaderboard();
}

/* -- Reject modal -- */
function openRejectModal(id, name) {
  document.getElementById("reject-team-id").value = id;
  const overlay = document.getElementById("reject-modal-overlay");
  overlay.style.display = "flex";
  overlay.querySelector(".modal-card").setAttribute("data-name", name);
  document.getElementById("reject-reason-input").value = "";
}
function closeRejectModal() {
  document.getElementById("reject-modal-overlay").style.display = "none";
}
function confirmReject() {
  const id = document.getElementById("reject-team-id").value;
  const reason = document.getElementById("reject-reason-input").value.trim();
  if (!reason) { showToast("Please enter a rejection reason.", "warning"); return; }

  const all = loadRegistrations();
  const reg = all.find(r => r.id === id);
  if (!reg) return;

  reg.status = "rejected";
  reg.rejectionReason = reason;
  reg.rejectedAt = new Date().toISOString();
  saveRegistrations(all);

  addAuditEntry("REJECTED", reg.id, reg.team.name, `Reason: ${reason}`);
  showToast(`Team "${reg.team.name}" rejected.`, "warning");
  closeRejectModal();
  renderPendingTeams();
  renderAuditLog();
}

/* -- Render Audit Log -- */
function renderAuditLog() {
  const log = loadAuditLog();
  const container = document.getElementById("audit-log-list");
  const empty = document.getElementById("audit-empty");
  if (!container) return;

  container.querySelectorAll(".audit-entry").forEach(e => e.remove());

  if (log.length === 0) {
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";

  log.slice(0, 20).forEach(entry => {
    const el = document.createElement("div");
    el.className = "audit-entry";
    el.style.cssText = `
      display:flex; align-items:center; gap:14px;
      padding:10px 14px; border-bottom:1px solid var(--panel-border);
      font-size:12px;
    `;
    const isApprove = entry.action === "APPROVED";
    const color = isApprove ? "var(--success-color)" : "var(--danger-color)";
    const icon = isApprove ? "check_circle" : "block";
    el.innerHTML = `
      <span class="material-symbols-outlined" style="color:${color};font-size:18px;flex-shrink:0">${icon}</span>
      <div style="flex:1;">
        <span style="font-weight:700; color:${color};">${entry.action}</span>
        <span style="color:var(--text-primary);"> ${entry.teamName}</span>
        <span style="color:var(--text-grey)"> (${entry.teamId})</span>
        ${entry.detail ? `<span style="color:var(--text-secondary)"> — ${entry.detail}</span>` : ""}
      </div>
      <div style="color:var(--text-grey); flex-shrink:0; font-size:11px;">${entry.time}</div>
      <div style="color:var(--text-grey); font-size:10px; text-transform:uppercase; letter-spacing:0.5px; flex-shrink:0;">${entry.actor}</div>
    `;
    container.appendChild(el);
  });
}

/* -- Init Admin Panel Listeners (called from setupEventListeners) -- */
function initAdminPanelListeners() {
  // Reject modal
  const rejectCancel = document.getElementById("reject-cancel-btn");
  if (rejectCancel) rejectCancel.addEventListener("click", closeRejectModal);
  const rejectConfirm = document.getElementById("reject-confirm-btn");
  if (rejectConfirm) rejectConfirm.addEventListener("click", confirmReject);

  // Refresh pending
  const refreshPending = document.getElementById("btn-refresh-pending");
  if (refreshPending) refreshPending.addEventListener("click", () => {
    renderPendingTeams();
    renderAuditLog();
    showToast("Pending teams list refreshed.", "info");
  });

  // Registration page link
  const regLink = document.getElementById("btn-register-link");
  if (regLink) regLink.addEventListener("click", () => window.open("register.html", "_blank"));

  // Clear audit log
  const clearAudit = document.getElementById("btn-clear-audit");
  if (clearAudit) clearAudit.addEventListener("click", () => {
    saveAuditLog([]);
    renderAuditLog();
    showToast("Audit log cleared.", "info");
  });
}

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

/* ============================================================
   INIT — supports both DOMContentLoaded and document.write()
   ============================================================ */
function initApp() {
  loadData();
  initTheme();
  setupEventListeners();
  initClock();
  initDeadlineCountdown();
  initAdminPanelListeners();
  renderUI();
  renderPendingTeams();
  renderAuditLog();

  // Restore env mode
  const savedMode = getEnvMode();
  if (savedMode === "demo") {
    updateEnvModeUI("demo");
  } else if (savedMode === "online") {
    updateEnvModeUI("online");
  } else {
    updateEnvModeUI("online");
  }

  // Urgency banner
  const urgencyClose = document.getElementById("urgency-close");
  if (urgencyClose) urgencyClose.addEventListener("click", () => {
    const banner = document.getElementById("urgency-banner");
    if (banner) banner.style.display = "none";
    urgencyBannerDismissed = true;
  });
  const urgencyCta = document.getElementById("urgency-cta");
  if (urgencyCta) urgencyCta.addEventListener("click", () => {
    const navBtn = document.querySelector('[data-tab="deploy-submission"]');
    if (navBtn) navBtn.click();
    const banner = document.getElementById("urgency-banner");
    if (banner) banner.style.display = "none";
    urgencyBannerDismissed = true;
  });

  // Demo mode banner close
  const demoBannerClose = document.getElementById("demo-banner-close");
  if (demoBannerClose) demoBannerClose.addEventListener("click", () => {
    const banner = document.getElementById("demo-mode-banner");
    if (banner) banner.style.display = "none";
  });

  // Env mode select
  const envSelect = document.getElementById("env-mode-select");
  if (envSelect) {
    envSelect.value = getEnvMode();
    envSelect.addEventListener("change", (e) => {
      const mode = e.target.value;
      if (mode === "demo") activateDemoMode();
      else if (mode === "online") activateOnlineMode();
      else deactivateDemoMode();
    });
  }

  showToast("Synergy OS v1.3 initialized. All systems nominal.", "success");
}

// Support both DOMContentLoaded and document.write() scenarios
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
