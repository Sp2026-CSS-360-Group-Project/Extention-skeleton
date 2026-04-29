// pomodoro.js - FocusKit Pomodoro timer state and popup UI.

const POMODORO_DURATION_SECONDS = 25 * 60;
const POMODORO_STORAGE_KEY = "pomodoroState";

let pomodoroState = createInitialPomodoroState();
let pomodoroIntervalId = null;

function createInitialPomodoroState(now = Date.now()) {
  return {
    remainingSeconds: POMODORO_DURATION_SECONDS,
    isRunning: false,
    lastUpdatedAt: now
  };
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function tickPomodoro(state, now = Date.now()) {
  if (!state.isRunning) {
    return { ...state };
  }

  const elapsedSeconds = Math.max(0, Math.floor((now - state.lastUpdatedAt) / 1000));
  const remainingSeconds = Math.max(0, state.remainingSeconds - elapsedSeconds);

  return {
    remainingSeconds,
    isRunning: remainingSeconds > 0,
    lastUpdatedAt: now
  };
}

function startPomodoro(state, now = Date.now()) {
  const currentState = tickPomodoro(state, now);

  return {
    ...currentState,
    isRunning: currentState.remainingSeconds > 0,
    lastUpdatedAt: now
  };
}

function pausePomodoro(state, now = Date.now()) {
  const currentState = tickPomodoro(state, now);

  return {
    ...currentState,
    isRunning: false,
    lastUpdatedAt: now
  };
}

function resetPomodoro(now = Date.now()) {
  return createInitialPomodoroState(now);
}

function restorePomodoroState(savedState, now = Date.now()) {
  if (!savedState || typeof savedState.remainingSeconds !== "number") {
    return createInitialPomodoroState(now);
  }

  return tickPomodoro({
    remainingSeconds: Math.min(POMODORO_DURATION_SECONDS, Math.max(0, savedState.remainingSeconds)),
    isRunning: Boolean(savedState.isRunning),
    lastUpdatedAt: typeof savedState.lastUpdatedAt === "number" ? savedState.lastUpdatedAt : now
  }, now);
}

function openPomodoroPanel() {
  const toolsList = document.getElementById("toolsList");
  const panel = getPomodoroPanel();

  toolsList.hidden = true;
  panel.hidden = false;
  loadPomodoroState(renderPomodoro);
}

function closePomodoroPanel() {
  stopPomodoroInterval();
  document.getElementById("pomodoroPanel").hidden = true;
  document.getElementById("toolsList").hidden = false;
}

function getPomodoroPanel() {
  let panel = document.getElementById("pomodoroPanel");

  if (panel) {
    return panel;
  }

  panel = document.createElement("div");
  panel.id = "pomodoroPanel";
  panel.className = "pomodoro-panel";
  panel.hidden = true;
  panel.innerHTML = `
    <div class="pomodoro-header">
      <div>
        <p class="section-label">POMODORO</p>
        <h2 class="pomodoro-title">Focus Sprint</h2>
      </div>
      <span class="pomodoro-status" id="pomodoroStatus">Paused</span>
    </div>
    <div class="pomodoro-time" id="pomodoroTime">25:00</div>
    <div class="pomodoro-actions">
      <button class="pomodoro-button" type="button" id="pomodoroStart">Start</button>
      <button class="pomodoro-button" type="button" id="pomodoroPause">Pause</button>
      <button class="pomodoro-button" type="button" id="pomodoroReset">Reset</button>
      <button class="pomodoro-button secondary" type="button" id="pomodoroClose">Close</button>
    </div>
  `;

  document.getElementById("tab-tools").appendChild(panel);
  panel.querySelector("#pomodoroStart").addEventListener("click", handlePomodoroStart);
  panel.querySelector("#pomodoroPause").addEventListener("click", handlePomodoroPause);
  panel.querySelector("#pomodoroReset").addEventListener("click", handlePomodoroReset);
  panel.querySelector("#pomodoroClose").addEventListener("click", closePomodoroPanel);

  return panel;
}

function handlePomodoroStart() {
  pomodoroState = startPomodoro(pomodoroState);
  savePomodoroState(pomodoroState);
  renderPomodoro(pomodoroState);
  startPomodoroInterval();
}

function handlePomodoroPause() {
  pomodoroState = pausePomodoro(pomodoroState);
  savePomodoroState(pomodoroState);
  renderPomodoro(pomodoroState);
  stopPomodoroInterval();
}

function handlePomodoroReset() {
  pomodoroState = resetPomodoro();
  savePomodoroState(pomodoroState);
  renderPomodoro(pomodoroState);
  stopPomodoroInterval();
}

function startPomodoroInterval() {
  stopPomodoroInterval();
  pomodoroIntervalId = setInterval(() => {
    pomodoroState = tickPomodoro(pomodoroState);
    savePomodoroState(pomodoroState);
    renderPomodoro(pomodoroState);

    if (!pomodoroState.isRunning) {
      stopPomodoroInterval();
    }
  }, 1000);
}

function stopPomodoroInterval() {
  if (pomodoroIntervalId) {
    clearInterval(pomodoroIntervalId);
    pomodoroIntervalId = null;
  }
}

function loadPomodoroState(callback) {
  chrome.storage.local.get([POMODORO_STORAGE_KEY], data => {
    pomodoroState = restorePomodoroState(data[POMODORO_STORAGE_KEY]);
    callback(pomodoroState);

    if (pomodoroState.isRunning) {
      startPomodoroInterval();
    }
  });
}

function savePomodoroState(state) {
  chrome.storage.local.set({ [POMODORO_STORAGE_KEY]: state });
}

function renderPomodoro(state) {
  getPomodoroPanel();
  document.getElementById("pomodoroTime").textContent = formatTime(state.remainingSeconds);
  document.getElementById("pomodoroStatus").textContent = state.isRunning ? "Running" : "Paused";
}

if (typeof window !== "undefined") {
  window.FocusKitPomodoro = {
    open: openPomodoroPanel
  };
}

if (typeof module !== "undefined") {
  module.exports = {
    POMODORO_DURATION_SECONDS,
    createInitialPomodoroState,
    formatTime,
    pausePomodoro,
    resetPomodoro,
    restorePomodoroState,
    startPomodoro,
    tickPomodoro
  };
}
