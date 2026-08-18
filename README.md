🇵🇱 [Wersja polska](README.pl.md)

# UI Design Rules — a Claude Code skill

An opinionated design system for AI-built frontends. This skill makes Claude Code apply professional UI design rules — consistently, verifiably — whenever it builds or reviews React + Tailwind interfaces.

LLMs are good at producing working UI and notoriously uneven at making it *look designed*: ad-hoc spacing, four shades of gray that almost match, three competing call-to-action buttons, text that fails contrast. This skill replaces taste-by-accident with a system:

- **Styleguide-first workflow** — before styling anything, Claude establishes tokens (palette, type roles, spacing scale) and then styles only from tokens.
- **Opinionated defaults** — 4-point spacing grid, modular type scale, WCAG-checked color pairs, one primary action per view, complete interactive states.
- **Weighted rules** — standards, principles, defaults, and heuristics are explicitly distinguished, so the agent knows what must always hold, what usually holds, and what is merely a lens — and deviates intelligently.
- **Design intelligence** — an intent brief and ten product archetypes decide what the UI should BE; twelve visual-direction grammars propose how it should LOOK; `design-system/MASTER.md` remembers both across sessions.
- **The expression slider has teeth** — the energy level the brief declares is measured after the build (rendered type scale, chromatic area, temperature rhythm, empty sections). A page can pass every floor and still fail for being beige.
- **Beige is measurable** — a page can pass every correctness floor and still be the modal AI page: uniform slabs, an accent that lives only on buttons, no imagery. The expression slider in the brief is a budget, and after the build a script audits whether it was spent.
- **Which picture goes where is approved, not assumed** — the project's images are inventoried and matched to declared slots, with ratio and resolution mismatches caught before the build.
- **Imagery is measured, not eyeballed** — text over a photograph is checked against the actual pixels behind each glyph, and the script returns the exact scrim opacity that closes the gap.
- **Structure before style** — the page arc is rendered as a greyscale mockup at two viewports, with every section and slot numbered, before a single colour is chosen. Every string must sit in `[brackets]` or the mockup refuses to render, and those brackets become the keys of the content module.
- **Assets first** — when a cover, logo, or product shot exists, the palette is measured out of it (ground hue, signal hue, lightness range) instead of invented, with a documented repair path for sampled colours that fail contrast.
- **Three modes** — *Kickoff* (entry ritual for new projects: inventory → intent → **rendered mockup** → **rendered specimen** → tokens), *Build* (create/style UI), and *Review* (audit existing UI with severity-tagged findings and concrete before → after fixes).
- **Self-verification** — Claude screenshots its own output (via the bundled Playwright script) and inspects the pixels before delivering; contrast ratios and grid compliance are computed, not eyeballed. Seven measured tracks in all: contrast, keyboard and focus, 320px reflow, colour harmony, text over imagery, expression against the brief, and the pixels themselves.

## Install

**Recommended — as a Claude Code plugin:**

```
/plugin marketplace add valueforge-io/vf-ui-design-skill
/plugin install ui-design@valueforge-skills
```

**Manual — as a personal skill:**

```bash
git clone https://github.com/valueforge-io/vf-ui-design-skill.git
cd vf-ui-design-skill && ./install.sh
```

(or copy `plugins/ui-design/skills/ui-design-rules/` into `~/.claude/skills/` yourself; per-project: into `<project>/.claude/skills/`).

## Optional: visual self-verification

The skill can look at what it built. For that it needs a headless browser in your project:

```bash
npm i -D playwright && npx playwright install chromium
```

The browser download (~150 MB) happens once per machine; the library is per project. Without it the skill still works — it falls back to code-level checks (computed contrast, grid greps, state coverage) instead of screenshots. Claude Code will offer to run the install when the skill first needs it. Run the script from your project root — it resolves the project's Playwright automatically even though the script itself lives in the plugin directory.

## Usage

The skill triggers automatically on UI work — building pages, styling components, "make it look professional", design reviews. You can also invoke it explicitly with `/ui-design-rules`.

Example prompts:

```
Build a landing page for our time-tracking SaaS: hero, 3 features, pricing, footer.
Restyle this settings form so it looks consistent with the rest of the app.
Review the visual design of src/components/Dashboard.tsx and list concrete fixes.
```

On a fresh project, the skill runs **Kickoff**, and both of its decisions are made on rendered material rather than in prose:

1. **Inventory** — what you already have. Existing images get measured and mapped to slots; a fixed asset like a cover or logo also sets the palette's hue.
2. **Intent** — an eight-line brief and a product archetype, stated back for you to correct.
3. **Mockup** — the page arc rendered in greyscale at desktop and mobile width, every section and slot numbered. You cut, reorder and add by number, and paste any copy you already have.
4. **Specimen** — palette and type-pairing candidates side by side on your real copy, each with computed WCAG ratios badged PASS/FAIL. Anything that fails is fixed before you see it; you pick a number and a letter from the picture.
5. **Tokens, then build** — the picks become the token layer, the mockup becomes the content module, and the reasoning lands in `design-system/MASTER.md` so the next session inherits it.

Say "choose for me" at any stage and it takes the safe default.

For work inside an existing project the ritual collapses to nothing — the existing tokens and MASTER.md already answer the questions.

## What's inside

| File | Contents |
|---|---|
| `SKILL.md` | Workflow (build + review), core defaults, verification checklist |
| `references/kickoff.md` | The five-stage entry ritual: asset inventory, the arc mockup, the specimen gate |
| `references/design-intent.md` | Intent brief, ten product archetypes, default section arcs |
| `references/visual-directions.md` | Twelve style grammars and how a direction becomes tokens |
| `references/color.md` | Semantic color slots, palette recipe, contrast rules, dark mode |
| `references/typography.md` | Type roles, modular scale, weight/leading/tracking rules |
| `references/spacing-layout.md` | 4-point baseline, spacing ladder, grids and gutters |
| `references/components.md` | Recipes for 27 components (buttons → dialogs → imagery) |
| `references/visual-hierarchy.md` | Scan patterns, the seven hierarchy levers, action tiers |
| `references/interaction.md` | Keyboard models, focus management, the component state matrix |
| `references/accessibility.md` | WCAG 2.2 floors: target size, zoom/reflow, reduced motion, forms |
| `references/motion.md` | The five jobs of motion, duration/easing defaults, reduced-motion |
| `references/data-viz.md` | Question-first chart selection, chart color tokens, chart accessibility |
| `references/content-design.md` | Action labels, errors, empty states, confirmation vs undo |
| `references/design-process.md` | Wireframe → styleguide → implementation → design system |
| `references/review-checklist.md` | Audit procedure, severity levels, report format |
| `scripts/screenshot.mjs` | Render-and-look helper (Playwright/Puppeteer) |
| `scripts/palette-check.mjs` | Color-harmony audit of the rendered page (hue families, clash detection) |
| `scripts/interaction-check.mjs` | Keyboard/focus audit: Tab-walk reachability, focus visibility, target sizes |
| `scripts/contrast-check.mjs` | WCAG contrast of every rendered text node against its real backdrop |
| `scripts/reflow-check.mjs` | 320px reflow check with the offending element and cause named |
| `scripts/expression-check.mjs` | Measures whether the page spent its declared energy: type scale, chromatic area, rhythm, empty slabs |
| `scripts/expression-check.mjs` | Measures whether the page spends any energy: section rhythm, tone sequence, chroma area, display/body ratio |
| `scripts/asset-inventory.mjs` | Measures every image in the project and checks it against the slots the arc declares |
| `scripts/scrim-check.mjs` | Measures text sitting on photos or gradients pixel by pixel, and computes the scrim that would fix it |
| `scripts/wireframe.mjs` | Renders the section arc as a neutral mockup (web + mobile) so structure is agreed slot by slot |
| `scripts/specimen.mjs` | Renders palette/type candidates side by side on real copy, with contrast badges |
| `scripts/extract-palette.mjs` | Measures ground hue, signal hue and lightness range out of an existing asset |

Claude reads `SKILL.md` when the skill triggers and pulls individual reference files only when the task needs them, so routine work stays cheap.

## Does it actually help?

Benchmarked against the same model without the skill on identical tasks (landing page, admin table view, settings form), graded on objective assertions — axe-core contrast violations, 4pt-grid compliance, interactive-state coverage, mobile overflow, action hierarchy:

| | pass rate |
|---|---|
| with skill | **97%** |
| without skill | 75% |

Baseline failures clustered exactly where you'd expect: text contrast, missing focus states, competing primary buttons.

*Measured at v1.0 on three build tasks — treat the numbers as indicative of that version, not this one. The skill has roughly tripled since (Kickoff with rendered gates, asset measurement, ten verification scripts, four field-tested revisions — see CHANGELOG), and the benchmark has not been re-run. A broader multi-run benchmark is the next thing owed here.*

## Design sources

The rules encode widely accepted UI design practice: WCAG 2.x contrast minimums, 4-point spacing systems, modular type scales, 60-30-10 color distribution, and standard component and visual-hierarchy conventions used across mature design systems.

## Releasing (maintainers)

1. Edit the skill files.
2. Bump `version` in `plugins/ui-design/.claude-plugin/plugin.json` **and** in the plugin entry of `.claude-plugin/marketplace.json` (keep both in sync).
3. Add an entry to `CHANGELOG.md`.
4. Commit and push, then tag: `git tag vX.Y.Z && git push origin vX.Y.Z`. Push tags one at a time rather than with `--tags` — you get an explicit result per tag instead of a silent "Everything up-to-date". If a tag already exists on the wrong commit, move it with `git tag -f vX.Y.Z && git push -f origin vX.Y.Z`.

Users receive updates via background marketplace auto-update, or manually with `/plugin marketplace update valueforge-skills`.

## License

MIT
