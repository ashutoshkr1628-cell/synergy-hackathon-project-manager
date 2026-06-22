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

