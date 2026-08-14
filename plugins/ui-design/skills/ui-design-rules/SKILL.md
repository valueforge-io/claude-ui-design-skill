---
name: ui-design-rules
description: >-
  Professional UI design rules distilled for React + Tailwind: color palettes,
  typography, spacing, component anatomy, visual hierarchy, and a styleguide-first
  workflow. Use whenever building or styling ANY frontend UI — pages, components,
  dashboards, landing pages, forms, admin panels — whenever the user wants something
  to "look good", "look professional", or "look modern", or mentions design, styling,
  CSS, or Tailwind. Also use when reviewing, critiquing, or improving the look of
  existing UI code or screenshots. Trigger even when the user doesn't explicitly say
  "design" — any task that produces visible UI benefits from this skill.
---

# UI Design Rules

Turn design from taste into system: establish tokens first, style only from tokens, verify with hard checks. Good-looking UI is the product of consistency and hierarchy, not inspiration.

Two modes:

- **Build** (default) — creating or styling UI. Follow the workflow below.
- **Review** — critiquing or fixing existing UI. Follow `references/review-checklist.md`.

## Build workflow

### Step 0 — Establish the styleguide (before styling anything)

Never style ad hoc. Source every visual decision through this cascade, first hit wins:

1. **Existing project system.** Look for `tailwind.config` color/font extensions, CSS custom properties, a component library (shadcn/ui, Flowbite…), or repeated class patterns in existing components. If found, follow it completely — consistency with the codebase beats every default in this skill. Never introduce skill defaults into a project that already has its own voice.
2. **Explicit instructions** in the request: a brand hex, "make it green", an attached mockup or screenshot.
3. **Guided intake.** Starting a new project, app, or standalone page with no constraints from 1–2? Don't make the user pick from abstract adjectives — read the product context from the request (domain, audience, competition) and PROPOSE, in one compact message:
   - 2–3 concrete palette proposals fitted to this product, one line each: hue + why it fits + when to prefer it, one marked as default. Example for a team time-tracker: "indigo (default) — trust + modern SaaS convention, safe for B2B; teal — calmer, more human, stands out among blue competitors; slate + amber accent — bolder, if the brand should feel energetic". Ground the reasoning in the psychology table in references/color.md.
   - A matching typography suggestion per proposal, one line: neutral sans (Inter) default; geometric (Poppins) when the brand should feel friendly and product-y; serif display + sans body for editorial or premium.
   - Mode: light (default), dark, or both.
   "Take the default" must be a complete answer. A given hex or brand asset skips the proposals — build the scale from it instead (references/color.md). No product context at all? Ask one question — which personality fits: trustworthy/corporate, premium/creative, friendly/energetic, calm/health, bold/consumer — then propose.
4. **Skill defaults.** User defers, or the task is too small to justify questions: `indigo` primary, `slate` neutrals, Inter/system sans, 1.25 type scale, light mode.

Do NOT run the intake for: component tweaks inside an existing codebase, bug fixes, or requests like "just make it look good" — that phrasing is deferral, take defaults and go. When surroundings can answer the question, never ask the user.

Then record the outcome as tokens **before the first styled component** — `theme.extend` in Tailwind config (v3) or `@theme` CSS variables (v4; check which version the project runs before wiring tokens) plus a type-roles map (template in `references/design-process.md`). From here on, component code references only tokens: no raw hex, no raw families (`indigo-600` → `primary-600`), no arbitrary values (`p-[13px]`, `text-[15px]`).

### Step 1 — Structure before style

For new screens, decide the layout before any styling: what regions exist, what the reading order is, and which single element is the primary action of the view. A gray-box sketch or a written region list is enough. Layout mistakes cost minutes here and hours after styling. Details: `references/design-process.md`.

### Step 2 — Style from the system

Build using token classes and the defaults below. Consult the domain references (table at the bottom) when the task touches their area — they carry the full rules; this file only carries the core.

### Step 3 — Verify before delivering

Run every time, and prefer computed checks over eyeballing:

- **See it:** if any rendering path exists, screenshot the result and inspect the image — you are multimodal, and balance, crowding, and broken layout are visible only in pixels. Use the bundled `scripts/screenshot.mjs` — run it from the project root, calling the script by its absolute path (`node <path-to-this-skill>/scripts/screenshot.mjs page.html shot.png --width=1280`); it resolves playwright/puppeteer from the project's node_modules. Or use a running dev server plus a browser tool. Check desktop (`--width=1280`) and mobile (`--width=390`). Code-only checks are the fallback, not the norm.
- **Squint test** (on the screenshot, or mentally on the code): does the intended element win? Exactly one dominant focal point?
- **Contrast:** body text ≥4.5:1, large text and UI elements ≥3:1 — compute the ratios.
- **Spacing:** every value on the 4pt scale (grep for `\[\d+px\]`); in-group gaps smaller than between-group gaps.
- **States:** hover, focus-visible, and disabled present on everything interactive; valid/invalid on form fields.
- **Consistency:** same-role elements styled identically; exactly one primary button per view; no raw hex in components.

## Core defaults

The most-used values, inline so the references aren't needed for routine work.

**Spacing ladder** (Tailwind = 4pt system, stay on named steps):

| Level | Value | Classes |
|---|---|---|
| Control → helper text | 4px | `gap-1`, `mt-1` |
| Label → control, icon → text | 8px | `gap-2`, `mb-2` |
| Related elements, button rows | 12px | `gap-3` |
| Component padding; stacked fields | 16px | `p-4` (controls `px-4 py-2`), `space-y-4` |
| Card padding; group boundaries | 24–32px | `p-6`; `gap-6`–`gap-8` |
| Page sections | 48–64px+ | `py-12`–`py-16` |

**Type slots** (map every text node to one; never invent per-element combos):

| Slot | Classes |
|---|---|
| Display | `text-4xl md:text-6xl font-bold tracking-tight leading-none` |
| H1 | `text-3xl md:text-4xl font-bold tracking-tight leading-tight` |
| H2 | `text-2xl font-semibold tracking-tight leading-tight` |
| H3 | `text-xl font-semibold leading-snug` |
| Body | `text-base leading-relaxed` (dense UI: `leading-normal`) |
| Caption | `text-sm text-neutral-500` |
| Label / overline | `text-xs font-medium uppercase tracking-wide` |
| Button | `text-sm font-medium` |

Body text ≥16px always; prose constrained to `max-w-prose`; one font family unless the styleguide says otherwise.

**Color slots** (define in config, reference only slots in code):

| Slot | Default | Role |
|---|---|---|
| `primary` | `indigo` | Main actions, links, focus rings — one saturated family per view |
| `neutral` | `slate` | Text, backgrounds, borders — ~90% of every screen |
| `accent` | complementary (`amber`) | Rare emphasis, ≤10% of any screen |
| `success` / `warning` / `error` / `info` | `green` / `amber` / `red` / `sky` | Fixed meanings, never repurposed |

Distribution ≈ 60% neutral surfaces / 30% neutral text & structure / 10% color.

**Key patterns:**

- Solid (primary) button: `px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-2 disabled:opacity-50` — exactly one per view; secondary = tinted `bg-primary-50 text-primary-700`; tertiary = link.
- Body text `text-neutral-900` on `bg-white`/`bg-neutral-50`; secondary `text-neutral-600`; placeholders `text-neutral-400`; borders `border-neutral-200`.
- Controls share `h-10` height, one radius token (`rounded-lg`), ring focus (`focus-visible:ring-2`), `disabled:opacity-50`.
- Page container: `max-w-6xl mx-auto px-4` (or `px-8`), identical for every section of a page.
- Hover darkens one step in light mode; state changes move color/fill only, never geometry.

## Review mode

When asked to review, critique, or improve existing UI: read `references/review-checklist.md` and follow it — establish intent, squint test, audit tokens → spacing → typography → color → components → hierarchy, then report severity-tagged issues with concrete before → after fixes. Also run its programmatic checks (contrast computation, arbitrary-value grep) after any large Build task.

## Reference files — when to read

| File | Read when |
|---|---|
| `references/color.md` | Defining a palette, dark mode, contrast issues, choosing hues, custom brand scales |
| `references/typography.md` | Text-heavy screens, type hierarchy problems, font pairing |
| `references/spacing-layout.md` | Page layout, grids/columns, any spacing uncertainty |
| `references/components.md` | Building any specific component — recipes for 25 components |
| `references/visual-hierarchy.md` | Screen feels flat or cluttered, landing pages, placement decisions, "what goes where" |
| `references/design-process.md` | Project kickoff, creating the token layer, growing a design system |
| `references/review-checklist.md` | Review mode, or final verification of a large build |

## Deviations

These defaults are the starting position, not law. Brand requirements and platform conventions win when the deviation is deliberate. Bend a rule by adding a token or variant so the exception becomes system — never by an inline one-off. Each reference file explains why its rules exist; understand the why before overriding.
