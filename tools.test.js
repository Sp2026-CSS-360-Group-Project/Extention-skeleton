// Mock chrome API before importing the runtime registry.
global.chrome = {
  storage: {
    local: {
      set: jest.fn()
    }
  }
};

const { TOOLS, FOCUS_MODES } = require("./tools.js");

describe("TOOLS registry", () => {
  test("has the required productivity tools", () => {
    const ids = TOOLS.map(tool => tool.id);

    expect(ids).toEqual(expect.arrayContaining(["pomodoro", "iris", "eisenhower"]));
  });

  test("every tool has complete render and launch data", () => {
    TOOLS.forEach(tool => {
      expect(tool).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        icon: expect.any(String),
        desc: expect.any(String),
        launch: expect.any(Function)
      }));
    });
  });

  test("tool ids are unique", () => {
    const ids = TOOLS.map(tool => tool.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  test("launch persists the selected tool without throwing", () => {
    const button = document.createElement("button");

    TOOLS[0].launch(button);

    expect(button.classList.contains("active-tool")).toBe(true);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ activeTool: TOOLS[0].id });
  });
});

describe("FOCUS_MODES registry", () => {
  test("has at least three focus modes", () => {
    expect(FOCUS_MODES.length).toBeGreaterThanOrEqual(3);
  });

  test("every mode has complete render data", () => {
    FOCUS_MODES.forEach(mode => {
      expect(mode).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        icon: expect.any(String),
        desc: expect.any(String)
      }));
    });
  });
});