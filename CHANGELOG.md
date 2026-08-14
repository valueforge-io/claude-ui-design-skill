# Changelog

## 1.0.1 — 2026-08-14

- `scripts/screenshot.mjs`: resolve playwright/puppeteer from the project working directory first, not from the script's own location — fixes "No renderer found" when the skill is installed as a plugin and dependencies live in the project.
- Clear, actionable error when the Chromium build is missing or version-mismatched (`npx playwright install chromium`), exit code 3.
- SKILL.md and README: run the screenshot script from the project root via its absolute path.

## 1.0.0 — 2026-08-14

Initial release.

- Build + Review modes with a styleguide-first workflow
- Seven reference files: color, typography, spacing & layout, components (25 recipes), visual hierarchy, design process, review checklist
- Screenshot-based self-verification (`scripts/screenshot.mjs`, Playwright/Puppeteer)
- Benchmarked 97% vs 75% baseline on objective design assertions
