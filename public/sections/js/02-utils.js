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

