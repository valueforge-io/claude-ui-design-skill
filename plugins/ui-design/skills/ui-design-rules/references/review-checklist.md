# UI Review Checklist

Audit procedure for reviewing existing React + Tailwind UI code (or screenshots) against the design rules.
Consult when asked to review, critique, fix, or "make nicer" an existing screen or component.
Detailed rules live in the sibling reference files — this file is the audit pass that ties them together.

## How to run a review

1. Establish intent before judging: what is this screen for, what is its single primary action, what should the user see first, second, last? Judge against intent, not personal taste.
2. If the UI can be rendered or a screenshot exists, run the squint test first (see visual-hierarchy.md): blur or squint and note what pops first, second, third. Compare against intended order.
3. Audit in this order: intent & task fit → structure and reading order → interaction & accessibility basics → hierarchy → system consistency (tokens, spacing, typography, color) → component & visual polish. A perfectly tokenized screen with a wrong workflow is still bad UI — structure and interaction outrank cosmetics.
4. When one domain shows repeated violations, read its full reference file before writing the report — patterned failures usually share one root cause (most often: no styleguide exists).

## Severity levels

- **BLOCKER** — harms use: contrast below minimums, illegible text sizes, missing focus/hover states, meaning carried by hue alone, broken touch targets.
- **MAJOR** — breaks the system: off-scale values, raw hex in components, same-role elements styled differently, competing focal points, two primary buttons.
- **POLISH** — works but could read better: padding one step tight, weak grouping, minor alignment drift.

## Report format

Per issue: severity, location, the broken rule with a one-line why, and a concrete fix as before → after classes.

```
[MAJOR] ProductCard title — same size as body (`text-base` both): reading order collapses.
Fix: title → `text-lg font-semibold text-neutral-900`; body stays `text-base text-neutral-600`.
```

Open the report with the three highest-impact fixes in priority order. Close with what already works — an accurate positive list calibrates trust in the negatives.

## Structure & interaction basics

- Reading order matches task priority — what the user must see first is visually first; the primary action sits where the scan ends.
- Every interactive element is keyboard-reachable in a sensible order, with a clearly visible focus indicator at every stop [STANDARD].
- Interactive elements have their states (hover, focus-visible, disabled; valid/invalid on fields) — a missing state is a missing feature, not polish.
- Layers (menus, dialogs, comboboxes) close on Escape and return focus to their trigger; no positive `tabindex`; no clickable `div`s posing as buttons (interaction.md).
- Targets meet the 24×24px floor [STANDARD]; touch surfaces aim for ~44px (accessibility.md).

## Tokens & system

- Every color is a semantic token (`primary-600`, `neutral-200`), never a raw family or hex in component code.
- No arbitrary values: `p-[13px]`, `text-[15px]`, `w-[347px]` are violations; snap to the nearest scale step.
- Identical components have identical classes — diff repeated instances against each other; drift between two buttons is a finding even when each looks fine alone.
- A styleguide/token layer exists; if not, the first recommendation is to create one (design-process.md), not to patch instances.

## Spacing

- Every margin, padding, and gap is a multiple of 4px.
- In-group gaps visibly smaller than between-group gaps (≥2x); page sections separated by `py-12`+.
- Component padding consistent per component class; interactive controls keep the 2:1 horizontal:vertical ratio.
- Row layouts derive widths from grid columns and spans, not hand-set per-element widths.

## Typography

- Body text ≥16px (`text-base`); nothing below `text-xs`; captions/labels ≥ `text-sm` except overlines.
- Prose constrained to ~65ch (`max-w-prose`); no edge-to-edge paragraphs.
- Adjacent heading levels ≥1 Tailwind step apart; leading inverse to size (headings `leading-tight`, prose `leading-relaxed`).
- ≤2 font families; emphasis (bold/italic/caps/underline) scarce — 1–2 instances per view; `uppercase` always paired with `tracking-wide` on short strings only.

## Color & contrast

- Body text ≥4.5:1 against its background; large text and UI elements ≥3:1 [STANDARD] — compute the ratios (see verification below), never eyeball.
- Hierarchy survives grayscale; no meaning encoded in hue alone (color always paired with text, icon, or weight).
- Distribution near 60/30/10 (neutral surfaces / neutral text & structure / primary+accent+semantic); one saturated element family per view.
- Semantic slots keep their meaning: red/error = destructive-failure, green = success, amber = warning — never repurposed.
- Hover darkens one step in light mode; dark mode inverts the ladder and re-passes the same contrast minimums.
- Harmony: ≤3 non-neutral hue families; no family pair in the 60–150° clash zone (unless semantic status); one chroma band; tinted neutrals only when hue-matched to the primary — see color.md “Hue Discipline”.

## Components

- Every interactive element has visible default, hover, focus-visible, and disabled states; form fields add valid/invalid with helper text.
- Controls share the height token (`h-10` default), one radius token, and a clearly visible focus indicator (`focus-visible:ring-2` house default; a visible outline is equally valid).
- State changes move color/fill/shadow only — geometry (size, border width, position) stays stable.
- Placeholders are examples, never labels; exactly one primary button per view; badges smaller than buttons; toasts auto-dismiss.

## Hierarchy

- One dominant focal point; at most ~3 strong ones — count them.
- The scan path (Z for landing, F for app screens) passes through the elements that matter, in the intended order.
- One shared content container across sections; shared edges, no stray off-grid elements.
- Primary action sits where the scan ends (hero end / top-right of app screens / after form fields).

## Programmatic verification

Prefer computed checks over judgment where possible; they are faster and non-negotiable:

- Contrast: extract text/background pairs and compute WCAG ratios (relative luminance formula).
- Spacing: grep for arbitrary-value classes (`\[\d+px\]`) and off-scale steps.
- Tokens: grep component code for raw hex (`#[0-9a-fA-F]{3,8}`) and raw Tailwind families (`bg-indigo-`, `text-slate-`) that bypass slots.
- Consistency: collect class strings of repeated components and diff them.
- Harmony: run `node scripts/palette-check.mjs <page>` — samples rendered colors, clusters hue families, classifies relationships, flags clash pairs and chroma outliers.
- Interaction: run `node scripts/interaction-check.mjs <page>` — Tab-walk reachability, focus-visibility diffing, positive tabindex, fake buttons, sub-24px targets.

## Common quick wins

The fixes that most often transform a screen, in order of typical impact:

1. Demote everything except the one thing that matters — grays down (`text-neutral-600/500`), sizes down one step; promotion by demotion.
2. Fix grouping: halve in-group gaps, double between-group gaps.
3. Snap all off-scale values to the 4pt scale and unify repeated components.
4. Add the missing hover/focus-visible states.
5. Constrain text measure (`max-w-prose`) and raise body to `text-base`.
6. Reduce to one accent instance per view; move the saved color budget to the primary CTA.
