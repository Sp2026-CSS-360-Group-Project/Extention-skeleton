// Run ESLint with auto-fix enabled.
const { ESLint } = require("eslint");

const eslint = new ESLint({
  fix: true,
  overrideConfigFile: true,
  overrideConfig: [
    {
      files: ["**/*.js"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "script"
      },
      rules: {
        "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
        "no-undef": "error",
        "no-console": "off"
      }
    }
  ]
});

async function lintCode() {
  const results = await eslint.lintFiles(["./**/*.js"]);
  await ESLint.outputFixes(results);
}

lintCode().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});
