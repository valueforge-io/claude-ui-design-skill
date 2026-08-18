# Changelog

## 2.8.0 — 2026-08-18

Life without theatre. 2.7 taught the skill to detect a page that avoids being wrong without being anything; 2.8 teaches it what to do about one — rules only, no new scripts.

- **New** color.md, "Atmosphere — depth without decoration": a cost-ordered ladder for grounds that stop being flat without becoming wallpaper. Same-hue gradients that move only lightness (atmosphere precisely because nobody can point at it), grain, technical patterns that are chosen for their register because they will be read, and the page's single duotone event — a second one demotes both. Guardrails: measured on the composite via scrim-check, at most one slow ambient, dark mode gets its own values because an inverted gradient stops being light and starts being glow.
- **New** motion.md, "Making a page feel alive": the four classes ordered by return — scroll entrances whose stagger repeats the hierarchy in time (heading, lede, actions: a page that arrives in reading order explains itself), micro-interactions, drawn rules for precision registers, and **one signature element**. The governing principle: one living event per viewport — a page where everything moves is exactly as dead as one where nothing does.
- **Named the "AI agency" uniform** in motion's failure list: default parallax, floating blobs, typewriter headlines, universal hover scale, glow behind display type. Each is a filled-in blank, not a decision.
- **design-intent.md**: moving a slider mid-project is the owner's legitimate brief revision — recorded in MASTER.md, re-audited at the new level. Drifting past the declared level without the revision is what the audit catches, in both directions.
- Review mode now asks for the signature moment (zero reads as static, two compete) and checks whether atmosphere is doing quiet work or absent everywhere.

## 2.7.1 — 2026-08-18

Three calibration fixes to `expression-check.mjs`, all forced by its first field run — a real site whose ritual had run correctly, whose floors all passed, and whose owner still called it bland. The check agreed, but only after learning three things:

- **Computed backgrounds are not always rgb().** Modern Chromium serializes oklch-authored backgrounds as `oklch(L C H)`, and the naive number-grab read H as the blue channel — every section on the measured site came back "dark and blue". Colors now normalize through a 1×1 canvas, the same fix palette-check needed in its day.
- **Colour can be spent as ambient, not only as events.** A whole band on a chroma-0.02 tinted ground clearly reads as colour, though no single pixel clears the 0.045 "visible chroma" bar — perceptibility scales with area. The budget now accepts either route: chroma events (high ≥2%, mid ≥0.5%) or ambient tint (high ≥12%, mid ≥6%). This matters because a tinted ground is exactly the fix a disciplined one-hue system reaches for.
- **A large inline SVG is an image moment.** The measured site's only graphic is an inline diagram; `<svg>` over 40k px² now counts alongside img/video/canvas and background images.

Field result after calibration: the site scores chroma events 0.18%, ambient 0.07%, a closing run of four same-tone sections — while holding display/body at 4.0 and passing every floor. The owner's complaint ("kolorystyka nijaka, sekcje zbyt wielkie") maps one-to-one onto the two failed measurements, which is what the check exists to do.

## 2.7.0 — 2026-08-18

Cut from a field report of the opposite failure: a page built with the skill passed every check and still looked like nothing — bland palette, oversized white slabs. The diagnosis held across the whole system: ten scripts measured ten ways a page can be *broken*, and none measured whether it is *alive*. Floors converge on the middle of the distribution; taste-by-accident had been replaced by safe-by-default, and safe is beige.

- **New** `scripts/expression-check.mjs`: measures whether the page spent the energy its brief declared. Rendered display/body ratio (the largest text actually painted, not the token), chromatic area share at page scale, light/dark temperature transitions down the page, empty slabs (sections whose content fills under a third of their height), section-height uniformity, and the presence of one memorable moment. Budgets keyed to the brief's expression slider: quiet, medium, high.
- Calibrated against a reconstruction of the field page: at `high` it fails with five findings that map one-to-one onto the owner's complaints — chromatic area 0.09% ("kolorystyka nijaka"), five 1100px sections with content under 36% of height ("białe sekcje zbyt wielkie"), no moment. The same content with a 96px display, a chromatic band and a tight proof strip passes. A quiet brief tolerates a metronome: uniformity downgrades to advisory there.
- **Sliders became budgets** (design-intent.md). Risks were already named checks; now the expression slider is a table of concrete numbers, recorded in MASTER.md and verified after the build. A brief that says high and a page that measures quiet is a failed build even though every floor passes.
- **Vertical rhythm** (spacing-layout.md): uniform section padding is correct on app surfaces and a bug on narrative pages — the skill itself prescribed "begin sections at `py-16`" with no counterweight, making this the second confirmed case of a default causing the failure it should prevent (after `leading-none`). Density now follows the section's job, padding must never do the work of content, and temperature changes are planned at the arc stage.
- **The specimen spreads on an energy axis** (kickoff.md): one candidate quieter than the brief, one at it, one louder — never three variants of safe, where the user picks the middle of a distribution whose entire width is beige.
- **Spending the accent** (color.md): rare means concentrated, not homogeneously shy — one full-bleed deployment beats twenty link colours, and an accent that lives only on buttons rounds to zero at page scale.

## 2.6.0 — 2026-08-18

Answers "which picture goes where" with a table someone approved, instead of a decision the agent made quietly while building.

- **New** `scripts/asset-inventory.mjs`: walks the project's images and reports dimensions, aspect ratio, orientation, transparency, and whether each is light or dark. Given `arc.json` it also audits the assignments — a file whose ratio does not match its slot (it will be cropped, and the crop only becomes visible once the page exists), a file too small for the size it renders at, a slot with no file, a file no slot uses.
- **Three jobs, three parties, stated as a rule**: the script measures what is measurable, the model opens each image and says what it shows, the user approves the finished table. The "what it shows" column ships in brackets on purpose — a column filled by guessing from filenames is how a landscape photo ends up in a portrait frame.
- **The mapping is now visible on the mockup.** Every media slot prints the file assigned to it, or "brak pliku — do dostarczenia". Slot-to-file is confirmed together with the structure, at the gate that already stops and waits.
- **Named the direction of influence**, which had been implied and never written down: an asset that is already fixed — a published cover, a logo, packaging — dictates the palette, because the page must live beside it and cannot redesign it. Imagery still to be chosen or made obeys the palette instead. With no fixed asset, the brand hue is a free choice from intent, and extract-palette says so.
- Verified against a deliberately broken project: all five findings fired, including a cover whose declared slot ratio (992/1586) no longer matched the actual file (1053×1494) — precisely the mismatch that survives a file swap and surfaces as a silently cropped image.

## 2.5.0 — 2026-08-16

Cut from a field test that built and shipped a real landing page. Most of the machinery held; what follows is what did not, plus the imagery gap the last two releases left open.

- **Fixed a default that caused a bug.** typography.md prescribed `leading-none` for the Display role. Polish Ą and Ę descend past the baseline, so uppercase headings at line-height 1 collide with the line beneath — the failure surfaced on the word `DZIĘKUJĘ` and nowhere else on the page. The leading floor now belongs to the language and lives in a token.
- **The specimen now tests the condition that failed.** It carried a diacritic line, but at 14px in prose — never uppercase, never at display size, never at display leading. It now renders the stress case *and measures it*: per pairing it reports the leading floor computed from the font's own ink metrics (1.10 for the family in the field test, against the 1.12 that had been found by hand after the bug shipped), and whether the family actually loaded or silently fell back.
- **New** `scripts/scrim-check.mjs`. The rule "text over an image needs a measured guarantee" was a [STANDARD] with nothing behind it — contrast-check could only print a warning. The script screenshots each candidate twice, once with the text visible and once hidden, and diffs: the pixels that changed *are* the glyphs, so the backdrop gets sampled exactly where letters fall. The worst pixel decides, and a binary search returns the minimum scrim opacity that closes the gap. Verified end to end: white text failing at 1.4:1 was prescribed `rgba(0,0,0,0.32)`, and applying precisely that value measured back at 3.04:1.
- **A status code is not proof that the page is yours.** In the field the agent announced a URL that served a different project entirely: its own server had failed with `EADDRINUSE`, and the `200` came from whatever already owned port 3000. Verify the served page by a string only your page contains, treat an occupied port as a foreign app, and read the server log before believing it started.
- **`palette-check.mjs` was missing from the Build verification list** — present in the review checklist and in two reference files, absent from the list the agent actually works through after building. It never ran once. Added, along with `scrim-check`.
- **Imagery, expanded**: where images come from (generated is legitimate for atmosphere, never where the image asserts a fact — a real person, a real product, an actual cover); deliberate crops with a focal point held across breakpoints; one ratio, one treatment, one light across a set; and dark mode decided per asset rather than filtered.
- **Four patterns the field agent invented, now rules**: an action whose destination is still a placeholder renders disabled rather than as a link to nowhere; unfilled copy stays visibly unfilled in the running page; quoted prose is not a heading; bot traps are `type="hidden"` plus fill timing, never an off-screen visible input that produces the same three audit findings every run.
- Consent and privacy copy is now marked as blocking publication rather than as ordinary content debt, and MASTER.md carries the dated state of verification so the next session can tell a current pass from a stale one.

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
