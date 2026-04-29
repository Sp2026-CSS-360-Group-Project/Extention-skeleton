// background.js - service worker for extension lifecycle and extension messages.

// Record installation so the popup can distinguish a freshly installed extension if needed.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ installed: true });
});

// Keep the message surface deliberately small: validate each request before responding.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.action !== "string") {
    sendResponse({ success: false, error: "Invalid message" });
    return false;
  }

  if (message.action === "ping") {
    sendResponse({ success: true, app: "FocusKit" });
    return false;
  }

  sendResponse({ success: false, error: `Unknown action: ${message.action}` });
  return false;
});
