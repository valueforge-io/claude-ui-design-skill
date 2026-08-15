# Changelog

## 1.1.0 — 2026-08-15

Correctness release: the skill now knows what kind of rule each rule is.

- Rule levels: every rule carries an explicit weight — [STANDARD] / [PRINCIPLE] / [DEFAULT] / [HEURISTIC] — defined in SKILL.md. Scan patterns, color psychology, temperature, and 60-30-10 downgraded to heuristics; 16px body and one-type-family reframed as defaults with documented exceptions.
- Fix: focus guidance no longer claims CSS `outline` shifts layout (it never did). Visible focus indicator is the requirement; ring stays the house default, outline equally valid.
- color.md: custom brand scales built in OKLCH (perceptually uniform, matches Tailwind v4) with gamut guidance; dark mode gains role-based semantic mapping (surfaces/text/borders/actions) beyond the quick inverted-ladder default.
- typography.md: heading level (document semantics) explicitly separated from heading slot (visual style).
- Review mode: audit order starts from intent, structure, and interaction basics before system consistency and polish; new "Structure & interaction basics" checklist section.

## 1.0.2 — 2026-08-14

- Guided intake: on fresh projects the skill now reads the product context and proposes 2–3 concrete palettes with reasoning (plus matching typography), instead of asking the user to pick from abstract adjectives.
- New "Hue Discipline (Harmony)" section in references/color.md: computable rules for hue-family count, pairwise hue relationships (monochrome/analogous/complementary/triadic vs the 60–150° clash zone), chroma coherence, and tinted neutrals.
- New `scripts/palette-check.mjs`: samples real rendered colors, clusters hue families, classifies relationships, and flags clashes, extra families, and chroma outliers (exit 1 on findings).
- Review checklist: harmony added to the color audit and to programmatic verification.

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
