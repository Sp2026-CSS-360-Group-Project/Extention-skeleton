// popup.js - handles tab navigation, registry rendering, and persisted settings.

// Storage keys that mirror the Settings tab checkbox ids.
const SETTING_KEYS = ["notifications", "sound", "dark"];
const DEFAULT_DARK_MODE = true;

// Track the selected DOM card so only one focus mode appears active at a time.
const state = {
  selectedFocusCard: null
};

// Initialize the popup once Chrome has loaded the extension document.
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  renderTools();
  renderFocusModes();
  loadSavedState();
  setupSettingsPersistence();
});

// Wire the top navigation buttons to their matching tab panels.
function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(currentButton => currentButton.classList.remove("active"));
      panels.forEach(panel => panel.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(`tab-${button.dataset.tab}`).classList.add("active");
    });
  });
}

// Render tool cards from the registry in tools.js so smoke tests and UI share one source.
function renderTools() {
  const container = document.getElementById("toolsList");
  container.replaceChildren();

  window.TOOLS.forEach(tool => {
    const card = document.createElement("div");
    card.className = "tool-card";

    const toolInfo = document.createElement("div");
    toolInfo.className = "tool-info";

    const icon = document.createElement("span");
    icon.className = "tool-icon";
    icon.textContent = tool.icon;

    const textWrap = document.createElement("div");
    textWrap.className = "tool-copy";

    const name = document.createElement("span");
    name.className = "tool-name";
    name.textContent = tool.name;

    const desc = document.createElement("span");
    desc.className = "tool-desc";
    desc.textContent = tool.desc;

    const launchButton = document.createElement("button");
    launchButton.className = "tool-launch";
    launchButton.type = "button";
    launchButton.dataset.id = tool.id;
    launchButton.setAttribute("aria-label", `Launch ${tool.name}`);
    launchButton.textContent = "Launch";
    launchButton.addEventListener("click", () => tool.launch(launchButton));

    textWrap.append(name, desc);
    toolInfo.append(icon, textWrap);
    card.append(toolInfo, launchButton);
    container.appendChild(card);
  });
}

// Render selectable focus modes and attach persistence-aware selection handlers.
function renderFocusModes() {
  const container = document.getElementById("focusModes");
  container.replaceChildren();

  window.FOCUS_MODES.forEach(mode => {
    const card = document.createElement("button");
    card.className = "focus-card";
    card.type = "button";
    card.dataset.modeId = mode.id;

    const header = document.createElement("div");
    header.className = "focus-header";

    const icon = document.createElement("span");
    icon.className = "focus-icon";
    icon.textContent = mode.icon;

    const name = document.createElement("span");
    name.className = "focus-name";
    name.textContent = mode.name;

    const desc = document.createElement("p");
    desc.className = "focus-desc";
    desc.textContent = mode.desc;

    header.append(icon, name);
    card.append(header, desc);
    card.addEventListener("click", () => selectFocusMode(mode.id, card, true));
    container.appendChild(card);
  });
}

// Restore checkbox values, theme, and the selected focus mode from chrome.storage.
function loadSavedState() {
  chrome.storage.local.get([...SETTING_KEYS, "focusMode"], data => {
    const isDarkMode = resolveDarkMode(data.dark);

    applyTheme(isDarkMode);

    SETTING_KEYS.forEach(key => {
      const input = document.getElementById(`setting${capitalize(key)}`);

      if (input && data[key] !== undefined) {
        input.checked = data[key];
      }
    });

    document.getElementById("settingDark").checked = isDarkMode;

    if (data.focusMode) {
      const savedCard = document.querySelector(`[data-mode-id="${data.focusMode}"]`);

      if (savedCard) {
        selectFocusMode(data.focusMode, savedCard, false);
      }
    }
  });
}

// Persist settings as soon as users toggle them, applying theme changes immediately.
function setupSettingsPersistence() {
  document.querySelectorAll(".settings-list input[type=checkbox]").forEach(input => {
    input.addEventListener("change", () => {
      const key = settingKeyFromInput(input);

      if (key === "dark") {
        applyTheme(input.checked);
      }

      chrome.storage.local.set({ [key]: input.checked });
    });
  });
}

// Apply theme classes to both roots used by the popup CSS.
function applyTheme(isDarkMode) {
  document.querySelectorAll("body, .app").forEach(themeRoot => {
    themeRoot.classList.toggle("theme-dark", isDarkMode);
    themeRoot.classList.toggle("theme-light", !isDarkMode);
  });
}

// Default to dark mode until the user explicitly saves another preference.
function resolveDarkMode(savedValue) {
  return savedValue !== undefined ? savedValue : DEFAULT_DARK_MODE;
}

// Update visual selection state and optionally persist the chosen focus mode.
function selectFocusMode(modeId, card, shouldPersist) {
  if (state.selectedFocusCard) {
    state.selectedFocusCard.classList.remove("selected");
  }

  card.classList.add("selected");
  state.selectedFocusCard = card;

  const statusDot = document.getElementById("statusDot");
  statusDot.classList.add("active");
  statusDot.setAttribute("aria-label", `Focus mode active: ${modeId}`);

  if (shouldPersist) {
    chrome.storage.local.set({ focusMode: modeId });
  }
}

// Translate ids like settingNotifications into chrome.storage keys.
function settingKeyFromInput(input) {
  return input.id.replace("setting", "").toLowerCase();
}

// Small formatting helper for deriving checkbox ids from storage keys.
function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

// Export pure helpers for Jest while leaving the popup globals untouched in Chrome.
if (typeof module !== "undefined") {
  module.exports = { settingKeyFromInput, capitalize, applyTheme, resolveDarkMode };
}
