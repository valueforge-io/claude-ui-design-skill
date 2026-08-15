🇵🇱 [Wersja polska](README.pl.md)

# UI Design Rules — a Claude Code skill

An opinionated design system for AI-built frontends. This skill makes Claude Code apply professional UI design rules — consistently, verifiably — whenever it builds or reviews React + Tailwind interfaces.

LLMs are good at producing working UI and notoriously uneven at making it *look designed*: ad-hoc spacing, four shades of gray that almost match, three competing call-to-action buttons, text that fails contrast. This skill replaces taste-by-accident with a system:

- **Styleguide-first workflow** — before styling anything, Claude establishes tokens (palette, type roles, spacing scale) and then styles only from tokens.
- **Opinionated defaults** — 4-point spacing grid, modular type scale, WCAG-checked color pairs, one primary action per view, complete interactive states.
- **Weighted rules** — standards, principles, defaults, and heuristics are explicitly distinguished, so the agent knows what must always hold, what usually holds, and what is merely a lens — and deviates intelligently.
- **Design intelligence** — an intent brief and ten product archetypes decide what the UI should BE; twelve visual-direction grammars propose how it should LOOK; `design-system/MASTER.md` remembers both across sessions.
- **Two modes** — *Build* (create/style UI) and *Review* (audit existing UI with severity-tagged findings and concrete before → after fixes).
- **Self-verification** — Claude screenshots its own output (via the bundled Playwright script) and inspects the pixels before delivering; contrast ratios and grid compliance are computed, not eyeballed. A keyboard audit (Tab-walk, focus visibility, target sizes) is the third verification track.

## Install

**Recommended — as a Claude Code plugin:**

```
/plugin marketplace add valueforge-io/claude-ui-design-skill
/plugin install ui-design@valueforge-skills
```

**Manual — as a personal skill:**

```bash
git clone https://github.com/valueforge-io/claude-ui-design-skill.git
cd claude-ui-design-skill && ./install.sh
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

On a fresh project with no existing styles, the skill sketches a design intent (product archetype, density, expression) and proposes 2–3 visual directions — palette, typography, and density character with reasoning. Pick one in seconds or say "defaults"; the choice is remembered in `design-system/MASTER.md`.

## What's inside

| File | Contents |
|---|---|
| `SKILL.md` | Workflow (build + review), core defaults, verification checklist |
| `references/design-intent.md` | Intent brief, ten product archetypes, verification priorities |
| `references/visual-directions.md` | Twelve style grammars and how a direction becomes tokens |
| `references/color.md` | Semantic color slots, palette recipe, contrast rules, dark mode |
| `references/typography.md` | Type roles, modular scale, weight/leading/tracking rules |
| `references/spacing-layout.md` | 4-point baseline, spacing ladder, grids and gutters |
| `references/components.md` | Recipes for 26 components (buttons → dialogs → toasts) |
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

Claude reads `SKILL.md` when the skill triggers and pulls individual reference files only when the task needs them, so routine work stays cheap.

## Does it actually help?

Benchmarked against the same model without the skill on identical tasks (landing page, admin table view, settings form), graded on objective assertions — axe-core contrast violations, 4pt-grid compliance, interactive-state coverage, mobile overflow, action hierarchy:

| | pass rate |
|---|---|
| with skill | **97%** |
| without skill | 75% |

Baseline failures clustered exactly where you'd expect: text contrast, missing focus states, competing primary buttons.

*Measured at v1.0 on three build tasks. The skill has since gained interaction models, accessibility floors, design intelligence, and three more knowledge domains (see CHANGELOG); a broader multi-run benchmark is planned.*

## Design sources

The rules encode widely accepted UI design practice: WCAG 2.x contrast minimums, 4-point spacing systems, modular type scales, 60-30-10 color distribution, and standard component and visual-hierarchy conventions used across mature design systems.

## Releasing (maintainers)

1. Edit the skill files.
2. Bump `version` in `plugins/ui-design/.claude-plugin/plugin.json` **and** in the plugin entry of `.claude-plugin/marketplace.json` (keep both in sync).
3. Add an entry to `CHANGELOG.md`.
4. Commit, push, then tag: `git tag vX.Y.Z && git push --tags`.

Users receive updates via background marketplace auto-update, or manually with `/plugin marketplace update valueforge-skills`.

## License

MIT
