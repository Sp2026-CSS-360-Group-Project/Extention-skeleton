# Extention-skeleton

## Static analysis and review

This project uses Prettier as the formatter. Run `npm run format` to format
tracked source, test, configuration, and documentation files, or
`npm run format:check` to verify formatting without changing files.

This project uses ESLint through the existing project lint script:
`npm run lint`.

This project uses npm audit for dependency security analysis through
`npm run security`.

GitHub Actions enforces the static-analysis and test rules in
`.github/workflows/ci.yml`. The workflow runs:

```bash
npm ci
npm run format:check
npm run lint
npm run security
npm test
npm run smoke
```

Every pull request must be reviewed by at least one other team member before
merging.

This repo will be the base of our chrome extentions

To test and use this you will have to follow these steps.

download node js v24.15.0 LTS for (your pc model) using nvm with npm from https://nodejs.org/en/download
Then I used npm install --save-dev @types/chrome in the terminal to install type definitions for Chrome's extension APIs
After that i used npm test to run the tests

Smoke test note:

- `npm run smoke` intermittently times out or sees the Pomodoro UI stay on `Paused` right after `Start`.
- I reproduced the issue with a Playwright debug script and confirmed the popup renders, the service worker loads, and the Pomodoro flow can lag between the popup and background state updates.
- I also checked runtime messaging, storage sync, and service-worker wake timing while tracing the popup flow.

For testing on google chrome i first went to the three dots dropdown and clicked on manage extentions
then I clicked on developer mode
then used load unpacked to put in my code
after that just test
