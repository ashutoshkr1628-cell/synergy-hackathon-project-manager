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
