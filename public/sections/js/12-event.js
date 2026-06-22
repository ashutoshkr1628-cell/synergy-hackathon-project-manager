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

