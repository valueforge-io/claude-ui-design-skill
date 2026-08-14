# Typography

Rules for choosing, sizing, and styling text in React + Tailwind UIs: a fixed slot system for every text role, a modular scale, and defaults for family, weight, leading, tracking, line length, and emphasis. Consult this file before writing any heading, paragraph, label, link, or button text, and whenever you are tempted to pick a font size ad hoc.

## Core rules

- Map every text node to a named slot below. Never invent a per-element size/weight/leading combination; consistency is the deliverable.
- Use one sans-serif family for everything. Distinguish headings from body by size and weight, never by rendering them identically.
- Scale properties inversely with size: bigger text gets tighter leading, tighter tracking, and less weight; smaller text gets more leading and more weight.
- Treat emphasis (bold, italic, underline, caps) as a scarce resource: one or two emphasized items per view, because every added emphasis dilutes the rest.

## Type slots (default system)

| Slot | Tailwind classes | Use for |
|---|---|---|
| Display | `text-4xl md:text-6xl font-bold tracking-tight leading-none` | Hero headline, at most one per page |
| H1 | `text-3xl md:text-4xl font-bold tracking-tight leading-tight` | Page title, one per page |
| H2 | `text-2xl md:text-3xl font-semibold tracking-tight leading-tight` | Section headings |
| H3 | `text-xl md:text-2xl font-semibold leading-snug` | Subsection headings |
| H4 | `text-lg font-semibold leading-snug` | Card titles, minor headings |
| Body large | `text-lg leading-relaxed` | Ledes, long-form prose on desktop |
| Body | `text-base leading-relaxed` | Paragraphs; use `leading-normal` inside dense UI |
| Caption | `text-sm leading-normal` + muted color | Helper text, metadata, secondary info |
| Label / overline | `text-xs font-medium uppercase tracking-wide` | Form labels, eyebrows, tags, table headers |
| Button | `text-sm font-medium` | Buttons, sentence case by default |

If you need more than four heading levels, restructure the content instead of adding H5/H6 slots; deep heading nesting signals a hierarchy problem, not a typography problem.

## Modular scale

- Default a 1.25 (major third) modular scale from a 16px base: 16 → 20 → 25 → 31 → 39 → 49. Compute sizes from the scale, never by eye; harmonious ratios are what make a page feel designed.
- Tailwind's default ladder already approximates this scale: `text-base` 16 → `text-xl` 20 → `text-2xl` 24 → `text-3xl` 30 → `text-4xl` 36 → `text-5xl` 48 → `text-6xl` 60. Stay on named steps; never use arbitrary values like `text-[22px]`.
- Keep adjacent heading levels at least one Tailwind step apart so levels stay distinguishable.
- Deviate to a wider ratio (~1.333, i.e. skip a step between roles) only on hero-driven marketing pages that need extra drama.

## Font family and pairing

- Default one sans-serif family for the entire app (`font-sans`, configured to Inter or the system-ui stack); sans stays legible at small sizes and on screens.
- Swap in a less overexposed humanist sans when brand distinctiveness matters; ubiquitous defaults read as generic.
- Add a second family only as a serif for Display/H1 on editorial or brand-heavy pages, because serifs carry style and emotion at large sizes.
- Never set paragraphs, labels, captions, or controls in serif; never exceed two families per project.
- DO make headings visibly distinct from body via weight and size. DON'T style headings and paragraphs with the identical family + size + weight treatment.

## Font size

- Set body at `text-base` (16px) minimum on every device; smaller body text fails older users and small screens. `text-sm` is the floor, and only for captions and secondary text.
- Step long-form prose up to `md:text-lg` on desktop; large screens sit farther from the eye.
- Cap body text at `text-2xl` (24px); paragraph text above ~30px stops reading as body copy.
- Make each heading clearly larger than the text it heads. DON'T set a heading to the same size as its paragraph.
- Size headlines so they do not wrap on target viewports; shrink the slot before accepting a broken display line.
- When the page is text-heavy, the audience skews older, or the layout is visually busy, step body size up, not down.

### Responsive sizing

- Write mobile-first: declare the small size, add `md:` upgrades (already built into the slots above).
- Shrink headings far more than body across breakpoints: body reduces ~0–25% from desktop to mobile, headings up to ~50%; oversized headings devour mobile viewports while body must stay readable everywhere.
- DO keep `text-base` body constant across breakpoints. DON'T add responsive variants to captions, labels, or buttons.

## Font weight

- Treat weight as a graded scale (thin → black), not a bold on/off switch.
- Increase weight as text gets smaller: labels, badges, and button text at `text-xs`/`text-sm` get `font-medium`–`font-semibold` so thin strokes don't vanish.
- Decrease weight as text gets larger: `font-bold` is the ceiling for headings; reserve `font-light`/`font-extralight` for `text-4xl` and above, where large glyphs stay legible with less ink.
- DO mix two weights inside one display headline to make a key word stand out. DON'T bold an entire large headline block.
- DON'T use `font-light` or lighter below `text-lg`; hairline strokes disappear at small sizes.

## Line height (leading)

- Leading is inverse to size: paragraphs need room to breathe, headlines need to hold together as a unit.
- Display: `leading-none` (~1.0–1.1); titles should sit closely.
- Headings: `leading-tight` (1.25) is the ceiling for large text.
- Body: `leading-relaxed` (1.625) for prose, `leading-normal` (1.5) for dense UI text; never exceed ~1.75 or lines drift apart and the text feels disjointed.
- Longer lines need more leading; if a text block must run wide, bump leading one step.
- DO reduce leading as font size grows. DON'T reuse body leading on headings; it makes multi-line headings fall apart.

## Letter spacing (tracking)

- Leave body and UI text at `tracking-normal`; regular sizes rarely need adjustment.
- Apply `tracking-tight` (-0.025em) to `text-4xl` and larger (hero text, banners, large titles); large glyphs drift apart optically.
- Pair `tracking-wide` with `uppercase` on labels and overlines, always together; capitals without air congeal into a block.
- Never tighten until letters touch, and never letter-space a large headline wide apart.
- Keep tracking identical for every instance of a slot across the app; inconsistent tracking reads as sloppiness.

## Line length

- Constrain all body copy to `max-w-prose` (~65ch); full-width paragraphs tire the eye and demand extra leading.
- Never let text spread edge-to-edge in wide containers; wrap prose blocks in a measure container even inside dashboards.

## Emphasis

### Bold
- Bold only essential text: the key phrase, a warning, the primary action. Bold works best at small sizes and on high-contrast surfaces.
- DO bold at most one or two items per paragraph or view. DON'T scatter bold through text; overuse dilutes every instance and overwhelms the reader.
- When two adjacent actions compete, bold only the primary one and leave the secondary regular.

### Italics
- Reserve italics for quotes, testimonials, references, or one emphasized phrase.
- DO italicize a single item to make it stand out. DON'T italicize full paragraphs; slanted body text is hard to read and buries the message.
- Never italicize buttons, labels, or links; italics weaken affordances and are hard to spot.

### Underline
- Do not underline resting links; identify links by color and weight instead, and reveal the underline on hover (`hover:underline underline-offset-4`), because pages dense with underlined links overwhelm.
- Use a permanent underline only to emphasize one key statement per view; never underline large headings.
- Use decorative variants (`decoration-dotted`, `decoration-double`, `decoration-wavy`) only as a deliberate accent on a single emphasized element.

### Capitalization
- Uppercase only short strings of one to three words: labels, overlines, tags, alert badges, occasionally buttons; caps grab attention at that length.
- DO capitalize one item to make it stand out. DON'T set full sentences or paragraphs in caps; all-caps prose reads as shouting and looks unprofessional.
- Always add `tracking-wide` (and usually `text-xs font-medium`) with `uppercase`.

## Legibility checklist

Legibility is the combined result of family, size, weight, spacing, and contrast; diagnose the failing variable instead of tweaking a favorite one.

- Verify the smallest text (captions, labels) at the smallest breakpoint before shipping.
- Never shrink size or compress spacing to force text into a small area; cut copy or grow the container.
- Keep strong contrast between text and background, and never place text over busy imagery (details in the color reference).
- For older or vision-impaired audiences, increase size and weight rather than relying on contrast alone.

## Hierarchy through type

- Make size the primary importance signal: reading order should match size order, largest first.
- Support size with weight; the heaviest, largest element on screen is read first, so give it to the element users need first.
- Demote secondary text (help links, legal, metadata) to Caption slot; de-emphasis is as much a tool as emphasis.
- Use one emphasis signal per element (size, weight, caps, or color) rather than stacking several; stacked signals shout without adding clarity.

## Typography schema (make it a contract)

- Encode the slot table as shared code: a `Heading`/`Text` component, a class map, or Tailwind component classes; never re-type class soup per element.
- A schema entry = family + size + weight + leading (+ color token) per slot; define it once, reuse it everywhere.
- When a new text need appears, extend the schema deliberately with a new named slot; a one-off inline style is a schema bug.
- Provide the responsive variant inside the slot definition so pages inherit correct scaling for free.
