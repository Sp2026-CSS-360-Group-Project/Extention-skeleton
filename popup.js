// popup.js - handles tab navigation, registry rendering, and persisted settings.

const SETTING_KEYS = ["notifications", "sound", "dark"];

const state = {
  selectedFocusCard: null
};

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  renderTools();
  renderFocusModes();
  loadSavedState();
  setupSettingsPersistence();
});

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
    launchButton.textContent = "Launch";
    launchButton.addEventListener("click", () => tool.launch(launchButton));

    textWrap.append(name, desc);
    toolInfo.append(icon, textWrap);
    card.append(toolInfo, launchButton);
    container.appendChild(card);
  });
}

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

function loadSavedState() {
  chrome.storage.local.get([...SETTING_KEYS, "focusMode"], data => {
    const isDarkMode = data.dark !== undefined ? data.dark : true;

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

function applyTheme(isDarkMode) {
  document.body.classList.toggle("theme-dark", isDarkMode);
  document.body.classList.toggle("theme-light", !isDarkMode);
}

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

function settingKeyFromInput(input) {
  return input.id.replace("setting", "").toLowerCase();
}

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

if (typeof module !== "undefined") {
  module.exports = { settingKeyFromInput, capitalize, applyTheme };
}
