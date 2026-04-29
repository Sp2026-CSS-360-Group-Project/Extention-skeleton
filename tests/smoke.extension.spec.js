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

    await expect(page.getByText("Pomodoro", { exact: true })).toBeVisible();
    await expect(page.getByText("Iris", { exact: true })).toBeVisible();
    await expect(page.getByText("Eisenhower", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Focus" }).click();
    await expect(page.locator("#tab-focus.active .focus-card")).toHaveCount(3);
    await expect(page.locator("#tab-focus.active .focus-card").first()).toBeVisible();

    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.locator("#tab-settings.active")).toBeVisible();
    await expect(page.getByText("Notifications", { exact: true })).toBeVisible();

    expect(errors).toEqual([]);
  } finally {
    await context.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});