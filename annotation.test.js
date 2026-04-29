// annotation.test.js - verifies each JavaScript source file has a file-level note.

const fs = require("fs");
const path = require("path");

const projectRoot = __dirname;
const ignoredDirectories = new Set([".git", "coverage", "node_modules", "playwright-report", "test-results"]);

function collectJavaScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (ignoredDirectories.has(entry.name)) {
      return [];
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectJavaScriptFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith(".js") ? [fullPath] : [];
  });
}

describe("JavaScript annotations", () => {
  test("every JavaScript file starts with a file-level comment", () => {
    const files = collectJavaScriptFiles(projectRoot);

    expect(files.length).toBeGreaterThan(0);

    files.forEach(file => {
      const firstLine = fs.readFileSync(file, "utf8").split(/\r?\n/).find(line => line.trim().length > 0);

      expect(firstLine).toMatch(/^\/\/|^\/\*/);
    });
  });
});
