// focusModes.js - shared focus mode definitions and utilities for popup and background.

(() => {
// Keep the storage key and mode definitions centralized across extension contexts.
const FOCUS_MODES_STORAGE_KEY = "focusMode";

// Focus mode registry with metadata for rendering and tab control logic.
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

// Get a focus mode definition by id.
function getFocusModeById(modeId) {
  return FOCUS_MODES.find(mode => mode.id === modeId);
}

// Check if a focus mode id is valid.
function isValidFocusMode(modeId) {
  return FOCUS_MODES.some(mode => mode.id === modeId);
}

// Determine if a focus mode should apply tab muting/control.
function shouldMuteTabForMode(modeId) {
  return modeId === "deep-work" || modeId === "study";
}

// Share helpers with browser scripts loaded directly by popup.html and importScripts().
const FocusKitFocusModes = {
  FOCUS_MODES_STORAGE_KEY,
  FOCUS_MODES,
  getFocusModeById,
  isValidFocusMode,
  shouldMuteTabForMode
};

if (typeof globalThis !== "undefined") {
  globalThis.FocusKitFocusModes = FocusKitFocusModes;
}

// Export pure focus mode helpers for Jest.
if (typeof module !== "undefined") {
  module.exports = FocusKitFocusModes;
}
})();
