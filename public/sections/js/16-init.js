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
