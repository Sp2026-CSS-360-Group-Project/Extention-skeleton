# AGENTS.md

## Project

This is FocusKit, a Manifest V3 Chrome extension.

## Required checks before saying done

Run these commands before completing any task:

npm ci
npm test
npm run smoke

If any command fails, fix the issue and rerun the failing command.

## Extension rules

Do not leave placeholder endpoints.
Do not use api.example.com.
Do not put Jest test code inside runtime files.
Do not load test files from popup.html.
Do not add broad permissions unless the feature needs them.
Do not claim the popup works unless npm run smoke passes.

## Runtime acceptance

The popup must open without console errors.
Tools tab must show Pomodoro, Iris, and Eisenhower.
Focus tab must show at least three focus modes.
Settings must save and restore.
Selected focus mode must save and restore.

## Testing expectations

Use Jest for unit tests.
Use Playwright for extension smoke tests.
Mock chrome APIs in unit tests.
Use real Chromium extension loading for smoke tests.