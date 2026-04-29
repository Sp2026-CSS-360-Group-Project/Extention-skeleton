// pomodoro.js - FocusKit Pomodoro timer state and popup UI.

// Load shared timer helpers from pomodoroState.js in Chrome and from require() in Jest.
const pomodoroStateHelpers = typeof FocusKitPomodoroState !== "undefined"
  ? FocusKitPomodoroState
  : require("./pomodoroState.js");

const {
  createInitialPomodoroState,
  formatTime,
  pausePomodoro,
  resetPomodoro,
  restorePomodoroState,
  startPomodoro,
  tickPomodoro
} = pomodoroStateHelpers;

// Mutable popup session state; pure helpers below make this easy to test separately.
let pomodoroState = createInitialPomodoroState();
let pomodoroIntervalId = null;

// Swap the Tools list for the Pomodoro panel and hydrate saved timer state.
function openPomodoroPanel() {
  const toolsList = document.getElementById("toolsList");
  const panel = getPomodoroPanel();

  toolsList.hidden = true;
  panel.hidden = false;
  loadPomodoroState();
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

// Start delegates timer ownership to the background service worker.
function handlePomodoroStart() {
  sendBackgroundMessage({ action: "pomodoro:start" }, response => {
    handlePomodoroResponse(response);
  });
}

// Pause asks the background service worker to account for elapsed time.
function handlePomodoroPause() {
  sendBackgroundMessage({ action: "pomodoro:pause" }, response => {
    handlePomodoroResponse(response);
  });
}

// Reset clears the background alarm and returns the UI to the default state.
function handlePomodoroReset() {
  sendBackgroundMessage({ action: "pomodoro:reset" }, response => {
    handlePomodoroResponse(response);
  });
}

// Refresh the visible popup display while the background alarm owns persistence.
function startPomodoroInterval() {
  stopPomodoroInterval();
  pomodoroIntervalId = setInterval(() => {
    pomodoroState = tickPomodoro(pomodoroState);
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

// Load current state from the background so reopened popups reflect elapsed time.
function loadPomodoroState() {
  sendBackgroundMessage({ action: "pomodoro:getState" }, response => {
    handlePomodoroResponse(response);
  });
}

// Apply successful background timer responses to the popup state and display.
function handlePomodoroResponse(response) {
  if (!response || !response.success || !response.state) {
    return;
  }

  pomodoroState = restorePomodoroState(response.state);
  renderPomodoro(pomodoroState);

  if (pomodoroState.isRunning) {
    startPomodoroInterval();
  } else {
    stopPomodoroInterval();
  }
}

// Send background commands through the MV3 message channel.
function sendBackgroundMessage(message, callback) {
  chrome.runtime.sendMessage(message, response => {
    callback(response);
  });
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

  chrome.runtime.onMessage.addListener(message => {
    if (message && message.action === "pomodoro:stateChanged") {
      handlePomodoroResponse({ success: true, state: message.state });
    }
  });
}

// Export pure timer helpers for Jest.
if (typeof module !== "undefined") {
  module.exports = pomodoroStateHelpers;
}
