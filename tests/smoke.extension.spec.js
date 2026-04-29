const fs = require("fs");
const os = require("os");
const path = require("path");
const { test, expect, chromium } = require("@playwright/test");

const extensionPath = path.resolve(__dirname, "..");

test("FocusKit popup renders core features without console errors", async () => {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "focuskit-smoke-"));
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

  const errors = [];

  try {
    let serviceWorker = context.serviceWorkers()[0];

    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent("serviceworker");
    }

    const extensionId = serviceWorker.url().split("/")[2];
    const page = await context.newPage();

    page.on("pageerror", error => {
      errors.push(error.message);
    });

    page.on("console", message => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });

    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(page).toHaveURL(new RegExp(`^chrome-extension://${extensionId}/popup\\.html$`));
    await expect(page.locator("body")).toHaveClass(/theme-dark/);

    await expect(page.getByText("Pomodoro", { exact: true })).toBeVisible();
    await expect(page.getByText("Iris", { exact: true })).toBeVisible();
    await expect(page.getByText("Eisenhower", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Focus" }).click();
    await expect(page.locator("#tab-focus.active .focus-card")).toHaveCount(3);
    await expect(page.locator("#tab-focus.active .focus-card").first()).toBeVisible();

    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.locator("#tab-settings.active")).toBeVisible();
    await expect(page.getByText("Notifications", { exact: true })).toBeVisible();
    await expect(page.getByText("Sound effects", { exact: true })).toBeVisible();
    await expect(page.getByText("Dark mode", { exact: true })).toBeVisible();
    await expect(page.getByText("Auto-start timer", { exact: true })).toHaveCount(0);

    const notifications = page.locator("#settingNotifications");
    const sound = page.locator("#settingSound");
    const dark = page.locator("#settingDark");

    await expect(dark).toBeChecked();

    await page.locator(".setting-row", { hasText: "Notifications" }).locator(".slider").click();
    await page.locator(".setting-row", { hasText: "Sound effects" }).locator(".slider").click();
    await page.locator(".setting-row", { hasText: "Dark mode" }).locator(".slider").click();
    await expect(page.locator("body")).toHaveClass(/theme-light/);

    await page.waitForFunction(() => new Promise(resolve => {
      chrome.storage.local.get(["notifications", "sound", "dark"], data => {
        resolve(data.notifications === false && data.sound === true && data.dark === false);
      });
    }));

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Settings" }).click();

    await expect(notifications).not.toBeChecked();
    await expect(sound).toBeChecked();
    await expect(dark).not.toBeChecked();
    await expect(page.locator("body")).toHaveClass(/theme-light/);

    await page.evaluate(() => new Promise(resolve => {
      chrome.storage.local.set({ dark: true }, resolve);
    }));
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Settings" }).click();
    await expect(dark).toBeChecked();
    await expect(page.locator("body")).toHaveClass(/theme-dark/);

    await page.evaluate(() => new Promise(resolve => {
      chrome.storage.local.set({ dark: false }, resolve);
    }));
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Settings" }).click();
    await expect(dark).not.toBeChecked();
    await expect(page.locator("body")).toHaveClass(/theme-light/);

    expect(errors).toEqual([]);
  } finally {
    await context.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
