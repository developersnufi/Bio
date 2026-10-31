(() => {
  const toggle = document.querySelector("[data-theme-toggle]");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");
  const storageKey = "itzsnufi-theme";

  function readPreference() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function writePreference(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
    }
  }

  function currentTheme() {
    return document.documentElement.dataset.theme || (systemPreference.matches ? "dark" : "light");
  }

  function updateThemeControls() {
    const dark = currentTheme() === "dark";
    toggle.textContent = dark ? "Light mode" : "Dark mode";
    toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    if (themeColor) themeColor.content = dark ? "#151a16" : "#f7f8f4";
  }

  const savedPreference = readPreference();
  if (savedPreference === "dark" || savedPreference === "light") {
    document.documentElement.dataset.theme = savedPreference;
  }
  updateThemeControls();

  toggle.addEventListener("click", () => {
    const nextTheme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    writePreference(nextTheme);
    updateThemeControls();
  });

  systemPreference.addEventListener("change", () => {
    if (!readPreference()) updateThemeControls();
  });
})();
