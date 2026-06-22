/**
 * SYNERGY — Team Registration Logic
 * Multi-step form with localStorage persistence.
 * No backend required; data flows to synergy.html admin approval dashboard.
 */

const STORAGE_KEY = "synergy_registrations";
const ROLES = [
  "Lead Developer",
  "Backend Engineer",
  "Frontend Developer",
  "UI/UX Designer",
  "Product Manager",
  "DevOps Engineer",
  "Data Scientist",
  "QA Engineer",
];

let currentStep = 1;
let memberCount = 0;

// ── Utility ──────────────────────────────────────────────────────────────────
function genId(prefix = "TEAM") {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${n}`;
}
function genToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function loadRegistrations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveRegistrations(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ── Step Helpers ──────────────────────────────────────────────────────────────
function setStep(n) {
  // Hide all panels
  document.querySelectorAll(".step-panel").forEach(p => p.classList.remove("active"));
  document.getElementById(`step-${n}`).classList.add("active");

  // Update step indicators
  document.querySelectorAll(".step-item").forEach(item => {
    const s = parseInt(item.dataset.step);
    item.classList.remove("active", "completed");
    if (s < n) item.classList.add("completed");
    if (s === n) item.classList.add("active");
    // Completed circle shows check
    const circle = document.getElementById(`step-circle-${s}`);
    if (s < n) {
      circle.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">check</span>';
    } else {
      circle.textContent = s;
    }
  });

  currentStep = n;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Character Counters ────────────────────────────────────────────────────────
function initCharCounters() {
  [
    ["team-name", "cc-team-name", 40],
    ["project-idea", "cc-project-idea", 500],
    ["team-slogan", "cc-team-slogan", 80],
  ].forEach(([id, ccId, max]) => {
    const el = document.getElementById(id);
    const cc = document.getElementById(ccId);
    el.addEventListener("input", () => {
      cc.textContent = `${el.value.length} / ${max}`;
    });
  });
}

// ── Validation ────────────────────────────────────────────────────────────────
function validateStep1() {
  let ok = true;
  const name = document.getElementById("team-name").value.trim();
  const track = document.getElementById("team-track").value;
  const idea = document.getElementById("project-idea").value.trim();

  const fgName = document.getElementById("fg-team-name");
  const fgTrack = document.getElementById("fg-track");
  const fgIdea = document.getElementById("fg-project-idea");

  fgName.classList.toggle("has-error", name.length < 3);
  fgTrack.classList.toggle("has-error", !track);
  fgIdea.classList.toggle("has-error", idea.length < 20);

  if (name.length < 3 || !track || idea.length < 20) ok = false;
  return ok;
}

function getMemberRows() {
  const rows = document.querySelectorAll(".member-row");
  const members = [];
  let valid = true;
  rows.forEach((row, i) => {
    const nameEl = row.querySelector(".m-name");
    const emailEl = row.querySelector(".m-email");
    const roleEl = row.querySelector(".m-role");
    const n = nameEl.value.trim();
    const e = emailEl.value.trim();
    const r = roleEl.value;
    // Validate
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    nameEl.classList.toggle("error", n.length < 2);
    emailEl.classList.toggle("error", !emailRe.test(e));
    roleEl.classList.toggle("error", !r);
    if (n.length < 2 || !emailRe.test(e) || !r) valid = false;
    members.push({ name: n, email: e, role: r });
  });
  return { members, valid };
}

function validateStep2() {
  const rows = document.querySelectorAll(".member-row");
  if (rows.length === 0) {
    showToastReg("Add at least one team member.", "warn");
    return false;
  }
  const { valid } = getMemberRows();
  if (!valid) {
    showToastReg("Please fill in all member fields correctly.", "warn");
    return false;
  }
  return true;
}

// ── Member Rows ───────────────────────────────────────────────────────────────
function addMemberRow(initialData = {}) {
  const list = document.getElementById("members-list");
  const rows = list.querySelectorAll(".member-row");
  if (rows.length >= 5) {
    showToastReg("Maximum 5 members allowed.", "warn");
    return;
  }

  memberCount++;
  const row = document.createElement("div");
  row.className = "member-row";
  row.dataset.id = memberCount;

  const roleOptions = ROLES.map(r =>
    `<option value="${r}" ${r === initialData.role ? "selected" : ""}>${r}</option>`
  ).join("");

  row.innerHTML = `
    <input type="text" class="form-control m-name" placeholder="Full Name" value="${initialData.name || ""}" maxlength="50" />
    <input type="email" class="form-control m-email" placeholder="Email Address" value="${initialData.email || ""}" maxlength="80" />
    <select class="form-control m-role">
      <option value="">Select Role</option>
      ${roleOptions}
    </select>
    <button class="remove-member-btn" title="Remove member">
      <span class="material-symbols-outlined" style="font-size:14px;">close</span>
    </button>
  `;

  row.querySelector(".remove-member-btn").addEventListener("click", () => {
    row.style.transition = "opacity 0.2s, transform 0.2s";
    row.style.opacity = "0";
    row.style.transform = "translateX(10px)";
    setTimeout(() => row.remove(), 200);
  });

  list.appendChild(row);
  updateAddMemberVisibility();
}

function updateAddMemberVisibility() {
  const count = document.querySelectorAll(".member-row").length;
  const addRow = document.getElementById("add-member-row");
  addRow.style.display = count >= 5 ? "none" : "flex";
}

// ── Review Step ───────────────────────────────────────────────────────────────
function populateReview() {
  document.getElementById("rv-team-name").textContent = document.getElementById("team-name").value.trim();
  document.getElementById("rv-track").textContent = document.getElementById("team-track").value;
  const slogan = document.getElementById("team-slogan").value.trim();
  document.getElementById("rv-slogan").textContent = slogan || "(none)";
  document.getElementById("rv-project").textContent = document.getElementById("project-idea").value.trim();

  const { members } = getMemberRows();
  const tbody = document.getElementById("rv-members-body");
  tbody.innerHTML = "";
  members.forEach((m, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="color:var(--text-3)">${i + 1}</td>
      <td>${m.name}</td>
      <td style="font-size:11px; color:var(--text-2)">${m.email}</td>
      <td><span class="role-badge">${m.role}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Submit ────────────────────────────────────────────────────────────────────
function submitRegistration() {
  const { members } = getMemberRows();
  const teamId = genId("TEAM");
  const inviteToken = genToken();
  const reg = {
    id: teamId,
    inviteToken,
    status: "pending",     // pending | approved | rejected
    rejectionReason: "",
    submittedAt: new Date().toISOString(),
    approvedAt: null,
    team: {
      name: document.getElementById("team-name").value.trim(),
      track: document.getElementById("team-track").value,
      slogan: document.getElementById("team-slogan").value.trim(),
      projectIdea: document.getElementById("project-idea").value.trim(),
    },
    members,
  };

  const all = loadRegistrations();
  all.push(reg);
  saveRegistrations(all);

  // Show success
  const inviteUrl = `${location.origin}/register.html?invite=${inviteToken}`;
  document.getElementById("success-team-id").textContent = teamId;
  document.getElementById("success-invite-url").value = inviteUrl;

  // Hide form steps & step bar
  document.querySelectorAll(".step-panel").forEach(p => p.classList.remove("active"));
  document.getElementById("steps-bar").style.display = "none";
  const ss = document.getElementById("success-screen");
  ss.style.display = "flex";
  ss.style.animation = "step-in 0.4s cubic-bezier(0.16,1,0.3,1)";
}

// ── Invite Banner (for ?invite= URL) ─────────────────────────────────────────
function checkInviteBanner() {
  const params = new URLSearchParams(location.search);
  const token = params.get("invite");
  if (!token) return;

  const all = loadRegistrations();
  const reg = all.find(r => r.inviteToken === token);
  const banner = document.getElementById("invite-banner");
  const bannerText = document.getElementById("invite-banner-text");

  if (reg) {
    banner.classList.add("show");
    const statusText =
      reg.status === "approved" ? "✓ Approved — check your dashboard!" :
      reg.status === "rejected" ? "✗ Rejected by admin." :
      "Awaiting admin approval.";
    bannerText.innerHTML = `You're invited to join <strong>${reg.team.name}</strong> (${reg.team.track}). Status: <strong>${statusText}</strong>`;
  } else {
    banner.classList.add("show");
    bannerText.textContent = "Invite link is invalid or expired.";
  }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToastReg(msg, type = "info") {
  const existing = document.getElementById("reg-toast");
  if (existing) existing.remove();

  const t = document.createElement("div");
  t.id = "reg-toast";
  const colors = { info: "#06b6d4", warn: "#f97316", success: "#10b981", error: "#ef4444" };
  t.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    padding:12px 20px; border-radius:10px;
    background:rgba(16,22,35,0.95); border:1px solid ${colors[type]}44;
    color:#f3f4f6; font-size:13px; font-weight:600;
    box-shadow:0 8px 24px rgba(0,0,0,0.4);
    animation:step-in 0.3s ease;
    display:flex; align-items:center; gap:8px;
    font-family:'Outfit',sans-serif;
  `;
  t.innerHTML = `<span style="color:${colors[type]};font-size:18px" class="material-symbols-outlined">${
    type === "warn" ? "warning" : type === "error" ? "error" : type === "success" ? "check_circle" : "info"
  }</span>${msg}`;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; t.style.transition = "opacity 0.3s"; setTimeout(() => t.remove(), 300); }, 3000);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  checkInviteBanner();
  initCharCounters();

  // Add one default member row
  addMemberRow();

  // Step 1 → 2
  document.getElementById("step1-next").addEventListener("click", () => {
    if (validateStep1()) setStep(2);
  });

  // Step 2 back
  document.getElementById("step2-back").addEventListener("click", () => setStep(1));

  // Step 2 → 3
  document.getElementById("step2-next").addEventListener("click", () => {
    if (validateStep2()) {
      populateReview();
      setStep(3);
    }
  });

  // Step 3 back
  document.getElementById("step3-back").addEventListener("click", () => setStep(2));

  // Submit
  document.getElementById("btn-submit-reg").addEventListener("click", submitRegistration);

  // Add member row
  document.getElementById("add-member-row").addEventListener("click", () => addMemberRow());

  // Copy invite link
  document.getElementById("copy-invite-btn").addEventListener("click", () => {
    const input = document.getElementById("success-invite-url");
    input.select();
    navigator.clipboard.writeText(input.value)
      .then(() => showToastReg("Invite link copied to clipboard!", "success"))
      .catch(() => {
        document.execCommand("copy");
        showToastReg("Invite link copied!", "success");
      });
  });
});
