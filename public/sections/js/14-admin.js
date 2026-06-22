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
