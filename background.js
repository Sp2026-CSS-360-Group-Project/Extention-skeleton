// background.js — service worker for the extension

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchData") {
    // Example: fetch some data and send it back
    fetch("https://api.example.com/data")
      .then((res) => res.json())
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));

    return true; // Keep message channel open for async response
  }
});