// popup.js — handles tab navigation and renders tools/focus modes

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  renderTools();
  renderFocusModes();
  loadSettings();
});

// Tab navigation
function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });
}

// Render tools dynamically from TOOLS registry
function renderTools() {
  const container = document.getElementById("toolsList");
  container.innerHTML = "";

  TOOLS.forEach(tool => {
    const card = document.createElement("div");
    card.className = "tool-card";
    card.innerHTML = `
      <div class="tool-info">
        <span class="tool-icon">${tool.icon}</span>
        <span class="tool-name">${tool.name}</span>
      </div>
      <button class="tool-launch" data-id="${tool.id}">Launch</button>
    `;
    card.querySelector(".tool-launch").addEventListener("click", (e) => {
      tool.launch(e.currentTarget);
    });
    container.appendChild(card);
  });
}

// Render focus modes
function renderFocusModes() {
  const container = document.getElementById("focusModes");
  container.innerHTML = "";
  let selected = null;

  FOCUS_MODES.forEach(mode => {
    const card = document.createElement("div");
    card.className = "focus-card";
    card.innerHTML = `
      <div class="focus-header">
        <span class="focus-icon">${mode.icon}</span>
        <span class="focus-name">${mode.name}</span>
      </div>
      <p class="focus-desc">${mode.desc}</p>
    `;
    card.addEventListener("click", () => {
      if (selected) selected.classList.remove("selected");
      card.classList.add("selected");
      selected = card;
      document.getElementById("statusDot").classList.add("active");
      chrome.storage.local.set({ focusMode: mode.id });
    });
    container.appendChild(card);
  });
}

// Load saved settings
function loadSettings() {
  chrome.storage.local.get(["notifications", "sound", "dark", "autostart"], (data) => {
    if (data.notifications !== undefined)
      document.getElementById("settingNotifications").checked = data.notifications;
    if (data.sound !== undefined)
      document.getElementById("settingSound").checked = data.sound;
    if (data.autostart !== undefined)
      document.getElementById("settingAutostart").checked = data.autostart;
  });

  // Save on change
  document.querySelectorAll(".settings-list input[type=checkbox]").forEach(input => {
    input.addEventListener("change", () => {
      chrome.storage.local.set({ [input.id.replace("setting", "").toLowerCase()]: input.checked });
    });
  });
}