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

