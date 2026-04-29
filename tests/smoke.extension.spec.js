const path = require("path");
const { test, expect, chromium } = require("@playwright/test");

const extensionPath = path.resolve(__dirname, "..");

test("FocusKit popup renders core features without console errors", async () => {
  const context = await chromium.launchPersistentContext("", {
    channel: "chromium",
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

  const errors = [];

  let serviceWorker = context.serviceWorkers()[0];

  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent("serviceworker");
  }

  const extensionId = serviceWorker.url().split("/")[2];

  const page = await context.newPage();

  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await expect(page.getByText("Pomodoro")).toBeVisible();
  await expect(page.getByText("Iris")).toBeVisible();
  await expect(page.getByText("Eisenhower")).toBeVisible();

  await page.getByRole("button", { name: /focus/i }).click();
  await expect(page.getByText(/deep work|study|break/i)).toBeVisible();

  await page.getByRole("button", { name: /settings/i }).click();

  expect(errors).toEqual([]);

  await context.close();
});