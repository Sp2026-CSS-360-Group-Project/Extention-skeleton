// pomodoro.js - FocusKit Pomodoro timer state and popup UI.

// Keep the timer duration and storage key centralized for state helpers and UI handlers.
const POMODORO_DURATION_SECONDS = 25 * 60;
const POMODORO_STORAGE_KEY = "pomodoroState";

// Mutable popup session state; pure helpers below make this easy to test separately.
let pomodoroState = createInitialPomodoroState();
let pomodoroIntervalId = null;

// Build a fresh paused Pomodoro state using an injectable timestamp for tests.
function createInitialPomodoroState(now = Date.now()) {
  return {
    remainingSeconds: POMODORO_DURATION_SECONDS,
    isRunning: false,
    lastUpdatedAt: now
  };
}

// Format the timer display and clamp negative values to zero.
function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

// Advance a running timer according to elapsed wall-clock time.
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

// Mark the timer running after first accounting for any elapsed saved time.
function startPomodoro(state, now = Date.now()) {
  const currentState = tickPomodoro(state, now);

  return {
    ...currentState,
    isRunning: currentState.remainingSeconds > 0,
    lastUpdatedAt: now
  };
}

// Pause the timer without discarding elapsed time.
function pausePomodoro(state, now = Date.now()) {
  const currentState = tickPomodoro(state, now);

  return {
    ...currentState,
    isRunning: false,
    lastUpdatedAt: now
  };
}

// Return a clean 25-minute timer.
function resetPomodoro(now = Date.now()) {
  return createInitialPomodoroState(now);
}

// Normalize stored state so stale or malformed values cannot break the popup.
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

// Swap the Tools list for the Pomodoro panel and hydrate saved timer state.
function openPomodoroPanel() {
  const toolsList = document.getElementById("toolsList");
  const panel = getPomodoroPanel();

  toolsList.hidden = true;
  panel.hidden = false;
  loadPomodoroState(renderPomodoro);
}

// Hide the Pomodoro panel and stop any active popup interval.
function closePomodoroPanel() {
  stopPomodoroInterval();
  document.getElementById("pomodoroPanel").hidden = true;
  document.getElementById("toolsList").hidden = false;
}

// Lazily create the panel because the Pomodoro tool is optional until launched.
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

  // Bind controls once when the panel is first created.
  document.getElementById("tab-tools").appendChild(panel);
  panel.querySelector("#pomodoroStart").addEventListener("click", handlePomodoroStart);
  panel.querySelector("#pomodoroPause").addEventListener("click", handlePomodoroPause);
  panel.querySelector("#pomodoroReset").addEventListener("click", handlePomodoroReset);
  panel.querySelector("#pomodoroClose").addEventListener("click", closePomodoroPanel);

  return panel;
}

// Start persists immediately, then the interval keeps storage and UI synchronized.
function handlePomodoroStart() {
  pomodoroState = startPomodoro(pomodoroState);
  savePomodoroState(pomodoroState);
  renderPomodoro(pomodoroState);
  startPomodoroInterval();
}

// Pause persists the current elapsed state before stopping the interval.
function handlePomodoroPause() {
  pomodoroState = pausePomodoro(pomodoroState);
  savePomodoroState(pomodoroState);
  renderPomodoro(pomodoroState);
  stopPomodoroInterval();
}

// Reset returns both storage and UI to the default paused state.
function handlePomodoroReset() {
  pomodoroState = resetPomodoro();
  savePomodoroState(pomodoroState);
  renderPomodoro(pomodoroState);
  stopPomodoroInterval();
}

// Refresh the timer every second while it is running.
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

// Clear the active interval when the panel closes, pauses, resets, or completes.
function stopPomodoroInterval() {
  if (pomodoroIntervalId) {
    clearInterval(pomodoroIntervalId);
    pomodoroIntervalId = null;
  }
}

// Load saved state and resume ticking if the timer was running while the popup closed.
function loadPomodoroState(callback) {
  chrome.storage.local.get([POMODORO_STORAGE_KEY], data => {
    pomodoroState = restorePomodoroState(data[POMODORO_STORAGE_KEY]);
    callback(pomodoroState);

    if (pomodoroState.isRunning) {
      startPomodoroInterval();
    }
  });
}

// Persist timer state in extension-local storage.
function savePomodoroState(state) {
  chrome.storage.local.set({ [POMODORO_STORAGE_KEY]: state });
}

// Render the current timer value and running/paused label.
function renderPomodoro(state) {
  getPomodoroPanel();
  document.getElementById("pomodoroTime").textContent = formatTime(state.remainingSeconds);
  document.getElementById("pomodoroStatus").textContent = state.isRunning ? "Running" : "Paused";
}

// Expose the launcher for tools.js in the browser runtime.
if (typeof window !== "undefined") {
  window.FocusKitPomodoro = {
    open: openPomodoroPanel
  };
}

// Export pure timer helpers for Jest.
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
