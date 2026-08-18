# Spacing & Layout

Baseline spacing system and grid defaults for React + Tailwind UIs: the 4-point scale, default gap values for every grouping level, and column/gutter rules.
Consult before setting any padding, margin, gap, or grid template — every spacing decision must come off this scale.

## What spacing covers

Spacing is the room inside, outside, and around elements. It is not a component, but it is what makes all components read as consistently designed. It applies to:

- **Padding** — space inside a component, between its edge and its content.
- **Margins / gaps** — space outside a component, between it and its neighbors.
- **Distance** — space between groups and sections; larger distances signal stronger boundaries.
- **Gutters** — space between columns in a grid.

Define the spacing system early in the project and reuse the same standards for components, typography blocks, and icons — retrofitting spacing later is rework.

## The 4-point baseline

Set a single 4px baseline unit and express every margin, padding, gap, gutter, and keyline as a multiple of it (4, 8, 12, 16, 20, 24…), because predictable increments are what make separate components read as one cohesive design.

Tailwind's spacing scale IS a 4-point system — 1 spacing unit = 4px — so staying on the numeric scale keeps the whole UI on the baseline automatically:

| px | Tailwind unit | Example classes | Typical use |
| --- | --- | --- | --- |
| 4 | 1 | `p-1`, `gap-1`, `mt-1` | control → helper text |
| 8 | 2 | `p-2`, `gap-2`, `space-y-2` | label → control, icon → text |
| 12 | 3 | `p-3`, `gap-3` | between buttons and siblings |
| 16 | 4 | `p-4`, `px-4`, `gap-4` | component padding, gutters |
| 20 | 5 | `p-5`, `gap-5` | roomier component padding |
| 24 | 6 | `p-6`, `gap-6` | group boundaries, wide gutters |
| 32 | 8 | `p-8`, `gap-8` | strong group boundaries |
| 40 | 10 | `h-10`, `p-10` | control heights, large padding |
| 48 | 12 | `h-12`, `py-12` | section spacing (minimum) |
| 64 | 16 | `py-16` | section spacing (baseline — see Rhythm below; never one value for every section) |

Rules:

- Use the 4-point system, not a 5-point one (5/10/15…): 5-point also works as a system, but it fights Tailwind's native scale and forces arbitrary values — there is no reason to pay that cost.
- DON'T write off-scale spacing (`p-[13px]`, `mt-[30px]`) or mix unrelated values (1, 3, 11, 9) around one element — inconsistent spacing looks unprofessional even when no single value is noticeable. DO snap every value to the nearest scale step.
- Apply increments symmetrically: equal spacing top/bottom and left/right unless a deliberate ratio (like a button's 2:1) says otherwise.
- Measure distances *between* elements on the same scale: 12px (`gap-3`) is the standard gap between buttons and neighboring elements.

## Default spacing values

Apply this ladder everywhere. Each level roughly doubles the previous one, because the size of a gap is what tells the user how strongly two things belong together.

| Level | Default | Tailwind | Applies to |
| --- | --- | --- | --- |
| Micro | 4px | `gap-1`, `mt-1` | control → helper/error text, badge internals |
| Tight pair | 8px | `gap-2`, `mb-2` | label → control, icon → adjacent text |
| Related elements | 12px | `gap-3` | buttons in a row, adjacent controls |
| Inside components | 16px | `p-4`, `px-4` | padding of inputs, table cells, toasts (cards step up to `p-6`) |
| Between fields/items | 16px | `space-y-4` | stacked form fields, list blocks |
| Between groups | 24–32px | `gap-6` / `gap-8` | form sections, heading → content block |
| Between page sections | 48–64px+ | `py-12` / `py-16` | section boundaries on a page |

Per level:

- **Inside components:** default `p-4` (16px). Compact interactive controls use the 2:1 horizontal:vertical ratio instead (`px-4 py-2`), so text gets breathing room where users click.
- **Between related elements:** `gap-3` (12px) is the standard gap; reduce to `gap-2` only inside dense composite controls.
- **Between groups:** double the standard gap (`gap-6`–`gap-8`) — the jump in distance is what marks the group boundary, before any divider or color is added.
- **Between sections:** triple the standard gap or more (`py-12`+ as the floor); the actual value per section comes from its job — see Rhythm. Step down across the board only in dense dashboard UIs. On narrative pages the default is a floor, not a uniform — see Vertical rhythm below.
- **Labeled controls** keep a 2:1 internal ratio: 8px label → control, 4px control → helper text.

## Consistency rules

- Same component, same spacing, everywhere: if one button is `px-4 py-2`, every button is; if one card is `p-4`, every card is. One-off exceptions destroy the cohesion the system buys.
- Scale padding with font size (em-based ratios) when creating size variants, so a large button stays proportional to a small one.
- Reuse the spacing standards for icons and typography blocks too — one system, applied everywhere, is the whole point.

## Rhythm [PRINCIPLE]

**Uniform section spacing is monotony, not consistency.** Consistency means same-role elements match; a hero, a proof strip, a prose block and a final call do not share a role, and giving them all `py-16` and the same background produces the modal AI page: identical slabs of air scrolling by, each politely correct, none doing anything. This is the failure mode that passes every floor-check — whitespace is only a design lever when its *variation* carries meaning.

- **Padding states the section's importance and density.** A manifesto moment may take `py-32` and a viewport of air around one towering line; a logo strip or metrics bar compresses to `py-6`–`py-8`; long-form prose sits between. If two adjacent sections have the same padding, that should be a decision, not a default.
- **The tone sequence is composed, not accumulated.** Read the page as a strip of section backgrounds — light, dark, tinted. Three identical full-height tones in a row means the temperature never changes; break the run with a tint, a texture, a compression, or an inversion. The alternation is itself content: it tells the reader where one thought ends.
- **Air must frame something.** A 700px section carrying two sentences at body size is not "breathing room", it is an empty slab — either give the section a voice (display-scale type, an image, a texture) or give its height back.
- **Verification:** `node scripts/expression-check.mjs page.html` measures the height histogram, the tone sequence and the empty slabs; with the brief's expression slider (`--expression=high|mid|quiet`) the budget becomes binding.

## Grids & columns

- Websites and marketing pages: 12-column grid — `grid grid-cols-12 gap-6`. Application views: a repeating equal-column grid — `grid grid-cols-3 gap-4`, adjusting column count per breakpoint.
- Gutters come off the baseline like everything else: `gap-4` (16px) default, `gap-6` (24px) for wide page layouts.
- Place every element into preset column spans (`col-span-4`, `col-span-6`, `col-span-12`) so widths and gutters stay uniform across rows.
- DON'T hand-set widths for elements sharing a row — per-element widths drift and look clumsy. DO derive all widths from the column system.
- Keep the same grid across unrelated components on the page, because shared columns are what keep separate blocks visually connected.

## Quick recipes

- Page section: `<section class="py-16">` wrapping `<div class="mx-auto grid max-w-6xl grid-cols-12 gap-6 px-4">`.
- Equal card row: `grid grid-cols-1 gap-4 md:grid-cols-3` — never three hand-sized divs in a flex row.
- Form stack: `form.space-y-8` → group `space-y-4` → label `mb-2` → helper `mt-1`.
- Button row: `flex items-center gap-3`; icon + text: `inline-flex items-center gap-2`.
- Content block under its heading: heading `mb-2`–`mb-4`, next group starts at `mt-8`.

## Start generous, then reduce

When unsure how much white space to use, start with generous amounts and reduce gradually until the layout feels comfortable — it is far easier to trim abundant space than to add space to a cramped design.

- Practically: begin groups at `gap-8` and step down one notch at a time; for sections, choose the padding per section from its job (Rhythm below) — `py-16` is the fallback for a section you have not thought about yet, and a page full of fallbacks reads as one. Then, on narrative pages, *vary* from there — identical generosity everywhere is the failure the rhythm rule exists to stop.
- DO treat crowding as the failure you correct toward; DON'T start dense and try to air the layout out later.

## DO / DON'T checklist

- DO define spacing standards before building screens; DON'T improvise values screen by screen.
- DO keep every margin, padding, and gap on increments of 4; DON'T reach for arbitrary values like `p-[13px]`.
- DO give identical components identical spacing everywhere; DON'T let one button or card drift from the rest.
- DO size row layouts with preset column spans and shared gutters; DON'T hand-set widths per element.
- DO separate groups by doubling the gap and sections by tripling it; DON'T rely on borders where distance can do the job.
- DO begin with abundant white space and trim down; DON'T begin cramped and try to add air later.

## Vertical rhythm [PRINCIPLE]

Uniform section padding is correct on application surfaces — a settings page has no drama to stage. On **narrative pages** (conversion/marketing, editorial, portfolio, landing) it is a bug: generosity applied identically to every section reads as emptiness, the eye stops registering section boundaries as events, and the page becomes slabs. This is a confirmed field failure — a page that passed every floor check and was still described by its owner as "white sections too big, overall picture bland" had five sections of identical height whose content filled under a third of each.

- Density follows the section's job: a hero breathes (`py-24`+), a proof bar is a tight strip (`py-8`–`py-12`), prose sits between; a closing CTA can be tall again. Down the page, avoid two adjacent sections sharing both background and padding class.
- Padding must never do the work of content [HEURISTIC]: a section taller than ~80vh whose children occupy under a third of its height either loses the air or gains material.
- Temperature is part of rhythm: a page that flips once (dark hero, then white forever) has a lid, not a rhythm. Plan where the canvas darkens or takes tint *at the arc stage* — a `band` section in the arc is cheaper than a rebuild.
- Verification: `node scripts/expression-check.mjs <page> --expression=<level>` measures section heights, content share, and temperature transitions; uniform slabs and empty slabs are named findings.