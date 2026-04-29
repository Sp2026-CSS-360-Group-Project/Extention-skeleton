// tools.js - FocusKit runtime registry for popup-rendered productivity tools.

function markToolLaunched(button, label) {
  button.classList.add("active-tool");
  button.textContent = label;
  button.setAttribute("aria-pressed", "true");
}

const TOOLS = [
  {
    id: "pomodoro",
    name: "Pomodoro",
    icon: "P",
    desc: "Start a focused work sprint with intentional breaks.",
    launch(button) {
      markToolLaunched(button, "Ready");
      chrome.storage.local.set({ activeTool: "pomodoro" });
    }
  },
  {
    id: "iris",
    name: "Iris",
    icon: "I",
    desc: "Reduce visual clutter for calmer reading sessions.",
    launch(button) {
      markToolLaunched(button, "Ready");
      chrome.storage.local.set({ activeTool: "iris" });
    }
  },
  {
    id: "eisenhower",
    name: "Eisenhower",
    icon: "E",
    desc: "Sort tasks by urgency and importance before starting.",
    launch(button) {
      markToolLaunched(button, "Ready");
      chrome.storage.local.set({ activeTool: "eisenhower" });
    }
  }
];

const FOCUS_MODES = [
  {
    id: "deep-work",
    name: "Deep Work",
    icon: "D",
    desc: "Long, distraction-light sessions for complex work."
  },
  {
    id: "study",
    name: "Study",
    icon: "S",
    desc: "Structured review mode for notes, reading, and practice."
  },
  {
    id: "break",
    name: "Break",
    icon: "B",
    desc: "A softer mode for resetting before the next session."
  }
];

if (typeof window !== "undefined") {
  window.TOOLS = TOOLS;
  window.FOCUS_MODES = FOCUS_MODES;
}

if (typeof module !== "undefined") {
  module.exports = { TOOLS, FOCUS_MODES, markToolLaunched };
}