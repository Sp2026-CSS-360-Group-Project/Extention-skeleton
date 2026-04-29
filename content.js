// content.js - content script injected into web pages.

// Respond to popup or background requests that need access to the active page DOM.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "doSomething") {
    const result = doSomething();
    sendResponse({ message: result });
  }
});

/**
 * Count links on the current page and return a short user-facing summary.
 * Exported for Jest when this file is loaded outside the extension runtime.
 */
function doSomething() {
  const count = document.querySelectorAll("a").length;
  return `Found ${count} link(s) on this page.`;
}

// Allow Jest to import this module without changing browser behavior.
if (typeof module !== "undefined") {
  module.exports = { doSomething };
}
