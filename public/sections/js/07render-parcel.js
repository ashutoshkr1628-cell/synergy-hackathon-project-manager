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

