// content.js — injected into web pages

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "doSomething") {
    const result = doSomething();
    sendResponse({ message: result });
  }
});

/**
 * Example utility function — put your real logic here.
 * Exported for unit testing via module.exports (stripped in browser builds).
 */
function doSomething() {
  const count = document.querySelectorAll("a").length;
  return `Found ${count} link(s) on this page.`;
}

// Allow Jest to import this module
if (typeof module !== "undefined") {
  module.exports = { doSomething };
}