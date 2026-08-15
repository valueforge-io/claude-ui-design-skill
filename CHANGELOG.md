# Changelog

## 2.4.0 — 2026-08-16

Structure is decided on rendered material too. The section arc stops being a markdown table and becomes a neutral mockup — and it now comes *before* the specimen.

- **New** `scripts/wireframe.mjs`: renders `arc.json` as a greyscale mockup at two viewports (web and mobile), with every section and slot addressed — `3.2` is section 3, slot 2 — so a cut is a number, not a paragraph. Fifteen block types covering content roles rather than layout components: eyebrow, heading, text, list, action(s), field, price, quote, rating, person, media, cards, disclosure, logos, meta.
- **The unit of the structural decision moved from the section to the slot.** One CTA or two, cover beside the headline or above it, a sample chapter that costs an email address, three formats or one — these shape a page and a table row cannot hold them. Enumerated as slots they become edits a user makes in seconds.
- **The bracket rule is enforced by the script, not by discipline**: any user-visible string outside `[brackets]` fails validation and nothing renders. A mockup that looks finished gets approved as a design, and then the user has agreed to a look nobody proposed.
- **Stages swapped: arc (2) now precedes specimen (3).** The mockup is neutral by construction, so it loses nothing by going first — and the specimen gains a great deal, because it can render candidates on the page's real headline at its real length instead of on sample text.
- **The mockup is an input, not a document to approve**: `--content=content/site.ts` turns every bracket into a key with its brief intact, so the closing shopping list is a grep for `[` rather than a summary someone has to remember to write.
- The mobile viewport is not decoration — it forces decisions that otherwise happen silently in code (what collapses, what moves above what), and `"asideMobile": "last"` makes the one that matters most an explicit knob.

## 2.3.0 — 2026-08-15

Assets first: when the brand material already exists, the palette is measured out of it.

- **New** `scripts/extract-palette.mjs`: samples an asset (cover, logo, product shot), clusters colours in OKLCH, and reports the neutral ground hue, the chromatic families ranked by identity weight, the lightness range, and whether the asset's own accent can carry text or only marks. Validated against a real project: it reproduces, to the pixel, the palette a field agent had derived by hand — ground hue 80° at chroma 0.013, signal hue 27° peaking at rgb(203, 45, 41) on 0.037% of the image.
- Calibration mattered more than the maths: a brand accent can occupy a fraction of a percent of an asset and still carry its entire identity, so families are judged by *peak* chroma rather than average, and rarity is reported as a role (signal vs accent vs ground colour) instead of being filtered out as noise.
- **New rule** color.md — "Palette from an asset": carry the ground hue into the project's neutrals so the asset sits on the page rather than on top of it; treat the extracted accent as an input, never a token; repair by moving lightness while keeping hue, and never soften the asset's colour into a near-miss of the printed original.
- **New section** components.md — Imagery: real objects shown flat (3D box renders read as infoproduct), where imagery earns its place, measured scrims for text over photography, sizing and alt-text basics, texture as the cheap credibility lever, and placeholders that must look unfinished.
- Kickoff Stage 0 now looks at and measures existing assets before any candidate is composed.

## 2.2.3 — 2026-08-15

Third field run. The gates held; the handover didn't.

- **The finished page must reach the user's screen too.** The specimen rule stopped at the specimen: a full Kickoff ended with a verified, running site and a summary — and the user still had to ask "how do I see the page?". Builds now end by serving it, opening it, and leading with the URL, plus the command to bring it back and the rebuild step. Show, don't describe, applies to the deliverable as much as to the candidates.
- **`interaction-check.mjs` gained a document-semantics pass**: heading-outline skips (h2 → h4 hides structure from screen-reader navigation), landmark placement (a `<footer>` nested in `<main>` gets no contentinfo role — exactly where contact and legal information live), single `<h1>`/`<main>`, and form controls that are mandatory without saying so. All three defects were found by an adversarial reviewer in the field and were invisible to the previous checks; now they fail the script.
- **Typographic quotes are a documented build trap** (content-design.md): a typographic opening mark closed with a plain `"` terminates a JS/TS literal and the compiler blames a line far from the cause. It cost a real run several cycles across 21 strings.
- **A token change and its MASTER.md entry are one operation** (design-process.md): the field run left two values in the contract that no longer matched the code, because verification moved a token and the document stayed behind. Review checklist gains the doc-vs-code drift check.

## 2.2.2 — 2026-08-15

The structural gate had the same defect as the visual one: it happened, but not for the user.

- **Two kinds of gates, now distinguished.** Confirm-by-silence (inventory, intent brief — a summary you could correct) vs requires-an-answer (specimen pick, section arc — a decision only the user can make). Bundling them in one message, which is what happened in the field, turns the decision into an appendix to the summary: the "silence is acceptance" rule written for Stage 1 leaked onto Stage 3 and the user approved a structure they never registered as a question.
- **Stage 3 (Arc) rewritten**: gets its own message, and the section list gains a content column — section · job · what content it needs · who supplies it. The shopping list is visible before anything is built, and real copy is invited exactly where the user already has it.
- **Every build now closes with the content shopping list**: the named fields still carrying placeholder text, plus any section rendering nothing because its content is missing. Placeholder text must never become permanent by going unmentioned.

## 2.2.1 — 2026-08-15

Fixes from the first full Kickoff run on a real project.

- **The specimen gate only worked for the agent, not the user.** The image was rendered and the agent inspected it, but the user was asked for a pick in the same message — from an option list, with the file still unopened on disk. `specimen.mjs` now opens the PNG in the system viewer (`--open=false` to disable), and kickoff.md requires showing the image and asking in *separate* turns, with no option labelled "recommended" (a recommendation short-circuits the comparison).
- **The specimen's six contrast pairs were incomplete** — an adversarial reviewer showed all three candidates of a real project passing while carrying blocking defects. Added: signal on surface, CTA fill vs title color (a CTA that shares the headline's value wins nothing by color), accent vs body text in grayscale (an accent below body luminance vanishes without hue), and surface vs canvas as an advisory (imperceptible elevation is legal, but then the palette owes a border or shadow token).
- The same four structural pairs are now stated as rules in color.md and checked in the review checklist — they apply to ordinary building, not just to specimens.

## 2.2.0 — 2026-08-15

Kickoff mode: the user decides on pixels, and real content becomes a first-class citizen.

- **New mode — Kickoff** (`references/kickoff.md`): a five-stage entry ritual for new projects — inventory (what exists / what the agent invents) → intent brief → **specimen** → section arc → tokens, each with an explicit gate. Governing rule: *replace questions with comparisons*; no visual decision is made in prose. The ritual collapses to nothing for tweaks inside an existing system, and every stage accepts "choose for me".
- **New** `scripts/specimen.mjs`: renders palette and type-pairing candidates side by side on the project's real copy, computes each palette's six key contrast pairs in-page (oklch-safe), badges them PASS/FAIL, screenshots the sheet, and exits non-zero if any candidate fails — a failing candidate is not a choice.
- **Content as a first-class citizen** (content-design.md): user-visible strings live in one content module, components contain zero hard-coded words, so final copy can replace placeholders at any stage with one file edit. Placeholder copy is written in the real register and length; invented values are marked, and testimonials never carry invented named sources.
- **Default section arcs** per archetype (design-intent.md) for conversion, content, onboarding, and transactional products — presented as an editable list before implementation, not a layout imposed at build time.
- SKILL.md declares three modes; review checklist gains arc and content-source checks.

## 2.1.1 — 2026-08-15

Verification you can trust. Findings from the first real-world project run.

- **Fixed** `interaction-check.mjs`: the Tab walk aborted at the first focus stop outside its scanned set, so pages with `<summary>`, `<iframe>`, or contenteditable reported phantom "unreachable" elements and a truncated walk. It now tags every natively focusable element (summary included), keeps walking past unknown stops, and ends on a real cycle. Target sizing now judges the effective hit area (padded wrappers count) and exempts inline prose links per WCAG 2.2.
- **Fixed** `palette-check.mjs`: colors are read through a 1×1 canvas instead of a regex, so `oklch()`/`lab()`/`color()` values — the default in Tailwind v4 — are no longer silently skipped.
- **New** `scripts/contrast-check.mjs`: measures every visible text node against its real rendered backdrop (walking transparent ancestors, compositing alpha), applies WCAG thresholds by size and weight, and flags text over background images as unverifiable-by-static-means. The skill demanded computed contrast without shipping the tool; now it ships.
- **New** `scripts/reflow-check.mjs`: 320px (and any extra widths) reflow check that names the overflowing element and its cause — fixed width, min-width, nowrap, or an unwrapped table.
- **Rule** color.md — escape hatch for warm hues: when a hue cannot satisfy 4.5:1 label-on-fill and 3:1 fill-on-canvas simultaneously (common for crimson/orange on dark), the action leaves the hue for a light neutral fill and the brand hue becomes a signal role.
- **Rule** color.md — brand/semantic collision: separate them by treatment (brand = solid marks; state = tinted surface + icon + text), not by repainting the semantic slot.
- **Rule** visual-hierarchy.md — "one primary per view" defined for scrolling pages: the unit is the viewport, and a repeated *same* action counts as one primary; two *different* primaries in one viewport slice is the violation.

## 2.1.0 — 2026-08-15

Breadth release: motion, data, and words join the system.

- New `references/motion.md`: the five jobs of motion (feedback, state, spatial, attention, decorative) with duration/easing budgets, transform/opacity-only default, `prefers-reduced-motion` as a standard, framework-aware posture, and motion mapped to the visual-direction grammars.
- New `references/data-viz.md`: question-first chart selection (compare→bar, trend→line, …), bar-axes-from-zero, direct labeling over legends, chart color tokens (`chart-1…6`, sequential/diverging rules, never hue alone), loading/empty/error states, text summaries for accessibility.
- New `references/content-design.md`: verb+object action labels, the error template (what happened + why + what next), three-job empty states, confirmation vs undo, tone that freezes in errors, localization awareness.
- Review checklist: new "Motion, data, and words" audit section.
- SKILL.md wiring; reference table +3.

## 2.0.0 — 2026-08-15

Design Intelligence: the skill now reasons about what a UI should BE before enforcing how it is built.

- New `references/design-intent.md`: an 8-line intent brief (product, users, primary job, usage, sliders for expression/density/motion, named risks) established through the same cascade as the styleguide — inferred when possible, one question at most, skipped for small tasks. Ten behavior-based product archetypes (data-dense operational, transactional, creation tool, content, conversion, search, collaboration, admin, trust-sensitive, onboarding), each with the thing it protects.
- New `references/visual-directions.md`: twelve composable style grammars (Restrained Operational → Warm Marketplace), each a system of dependencies — composition, type and color character, density band, shape, elevation, motion posture, personality, fit, and its characteristic failure mode. Directions set dials; tokens implement them.
- Persistent design memory: after the styleguide is established, the skill writes `design-system/MASTER.md` (intent, direction, tokens, deviations log); the cascade reads it first in later sessions — ending visual drift between page one and page five.
- Guided intake upgraded: proposals are now full visual directions, not palettes alone.
- SKILL.md wiring throughout; reference table +2; still under 150 lines.

## 1.2.0 — 2026-08-15

Interaction release: components stop being paint and start being behavior.

- New `references/interaction.md`: keyboard models and focus management for nine interactive patterns (dialog, menu, combobox, tabs, accordion, checkbox/radio groups, toggle, toast, interactive tables), in the spirit of the ARIA Authoring Practices, plus the shared component state matrix.
- New `references/accessibility.md`: WCAG 2.2 floors with rule levels — three-tier target size (24px compliance floor / ~44px touch default / dense-UI exception), focus visibility and obscurement, zoom/reflow and text spacing, reduced motion, dragging alternatives, redundant entry, accessible authentication, consistent help.
- New `scripts/interaction-check.mjs`: third verification track — Tab-walk reachability, focus-indicator visibility (style diffing), positive tabindex, fake buttons, sub-24px targets. Calibrated on clean and deliberately broken fixtures.
- components.md: new Dialog recipe (native `<dialog>` first, destructive confirms name object and consequence); control height tied to the target-size model; state decisions routed through the matrix.
- SKILL.md: Step 2 becomes "build semantically, then style"; keyboard joins the Verify list as [STANDARD].

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
