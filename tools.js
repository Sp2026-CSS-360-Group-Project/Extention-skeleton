// Mock chrome API
global.chrome = {
  runtime: {
    onMessage: { addListener: jest.fn() },
    getURL: jest.fn(path => `chrome-extension://abc/${path}`)
  },
  tabs: {
    query: jest.fn(),
    create: jest.fn(),
    sendMessage: jest.fn()
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};

const { TOOLS, FOCUS_MODES } = require("../tools.js");

describe("TOOLS registry", () => {
  test("has at least 3 tools", () => {
    expect(TOOLS.length).toBeGreaterThanOrEqual(3);
  });

  test("every tool has id, name, icon, and launch function", () => {
    TOOLS.forEach(tool => {
      expect(tool).toHaveProperty("id");
      expect(tool).toHaveProperty("name");
      expect(tool).toHaveProperty("icon");
      expect(typeof tool.launch).toBe("function");
    });
  });

  test("tool ids are unique", () => {
    const ids = TOOLS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("includes pomodoro, iris, and eisenhower", () => {
    const ids = TOOLS.map(t => t.id);
    expect(ids).toContain("pomodoro");
    expect(ids).toContain("iris");
    expect(ids).toContain("eisenhower");
  });
});

describe("FOCUS_MODES registry", () => {
  test("has at least 3 focus modes", () => {
    expect(FOCUS_MODES.length).toBeGreaterThanOrEqual(3);
  });

  test("every mode has id, name, icon, and desc", () => {
    FOCUS_MODES.forEach(mode => {
      expect(mode).toHaveProperty("id");
      expect(mode).toHaveProperty("name");
      expect(mode).toHaveProperty("icon");
      expect(mode).toHaveProperty("desc");
    });
  });
});