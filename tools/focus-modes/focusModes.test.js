// focusModes.test.js - verifies focus mode definitions and utilities.

describe("focus modes registration", () => {
  test("exports focus modes with required properties", () => {
    const focusModes = require("./focusModes.js");

    expect(focusModes.FOCUS_MODES_STORAGE_KEY).toBe("focusMode");
    expect(Array.isArray(focusModes.FOCUS_MODES)).toBe(true);
    expect(focusModes.FOCUS_MODES.length).toBeGreaterThanOrEqual(3);

    focusModes.FOCUS_MODES.forEach(mode => {
      expect(mode.id).toEqual(expect.any(String));
      expect(mode.name).toEqual(expect.any(String));
      expect(mode.icon).toEqual(expect.any(String));
      expect(mode.desc).toEqual(expect.any(String));
    });
  });

  test("includes deep-work, study, and break focus modes", () => {
    const { FOCUS_MODES } = require("./focusModes.js");

    const modeIds = FOCUS_MODES.map(mode => mode.id);
    expect(modeIds).toContain("deep-work");
    expect(modeIds).toContain("study");
    expect(modeIds).toContain("break");
  });
});

describe("focus mode utilities", () => {
  test("retrieves focus modes by id", () => {
    const { getFocusModeById } = require("./focusModes.js");

    const deepWork = getFocusModeById("deep-work");
    expect(deepWork).toEqual(expect.objectContaining({
      id: "deep-work",
      name: "Deep Work"
    }));

    const notFound = getFocusModeById("nonexistent");
    expect(notFound).toBeUndefined();
  });

  test("validates focus mode ids", () => {
    const { isValidFocusMode } = require("./focusModes.js");

    expect(isValidFocusMode("deep-work")).toBe(true);
    expect(isValidFocusMode("study")).toBe(true);
    expect(isValidFocusMode("break")).toBe(true);
    expect(isValidFocusMode("invalid")).toBe(false);
    expect(isValidFocusMode("")).toBe(false);
  });

  test("determines tab muting for focus modes", () => {
    const { shouldMuteTabForMode } = require("./focusModes.js");

    expect(shouldMuteTabForMode("deep-work")).toBe(true);
    expect(shouldMuteTabForMode("study")).toBe(true);
    expect(shouldMuteTabForMode("break")).toBe(false);
    expect(shouldMuteTabForMode("invalid")).toBe(false);
  });
});
