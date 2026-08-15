# Visual Directions

Twelve composable style grammars — systems of dependencies, not image presets. Consult after the intent brief (design-intent.md): shortlist 2–3 that fit the archetype, propose them with one-line reasoning, then let the chosen direction set the dials that tokens implement (color.md, typography.md, spacing-layout.md).

## How to use directions

- Propose 2–3, one marked default. Each proposal is one line: name + hue & type character + density + why it fits this product (+ its cost, when real: "quieter brand presence").
- A direction sets DIALS, tokens implement them: type contrast between slots, color budget, density band, radius language, elevation, motion posture.
- Mixing: composition from one grammar + color character from another is legal only when both serve the same archetype; never mix two personalities on one surface. Different surfaces may run different directions (bold marketing pages + calm app shell) — record both in MASTER.md.
- Every grammar lists its **failure** — that's the specific thing to check on the screenshot after building.

## The grammars

### Restrained Operational
Composition: dense panels, strong left rail, exceptions surfaced at top. Type: one grotesk, low contrast between roles, tabular numerals. Color: neutral-dominant; one action hue; status colors appear ONLY as status. Shape: `rounded-md`, minimal elevation. Density: compact (p-3/gap-3 band, `h-9` controls on desktop). Motion: functional only. Personality: precise, calm.
Fits: data-dense operational, configuration/admin. Poor fit: marketing. **Failure:** gray soup — nothing ranks; keep the one action hue genuinely reserved.

### Trust Institutional
Composition: symmetric, explicit sections, generous forms. Type: sober grotesk or humanist sans, medium contrast. Color: blue/indigo family, conservative accent budget. Shape: small-to-medium radius, borders present and honest. Density: medium. Motion: minimal. Personality: dependable, official.
Fits: trust-sensitive, transactional. Poor fit: playful consumer. **Failure:** a bureaucratic wall of fields — group, stage, and explain instead.

### Soft Product
Composition: airy cards, roomy app pages. Type: friendly grotesk (Inter, Plus Jakarta), medium contrast. Color: tinted surfaces (primary-50 washes), solid primaries for action. Shape: `rounded-lg/xl`, soft shadows. Density: spacious. Motion: gentle transitions. Personality: approachable, modern SaaS.
Fits: collaboration, onboarding, general SaaS. Poor fit: dense operations. **Failure:** everything tinted — text contrast collapses; body text stays on neutral surfaces.

### Precision Editorial
Composition: strong typographic hierarchy, wide section separation, dense data regions inside. Type: neutral grotesk for UI + assertive editorial display, high contrast between the two. Color: mostly neutral with a single high-chroma action. Shape: small radius, minimal elevation. Density: mixed — airy shell, dense tables. Motion: functional. Personality: premium, exact.
Fits: analytics products with brand ambition, data-forward marketing. **Failure:** display type leaking into UI controls — the display face never touches buttons or forms.

### Minimal Luxury
Composition: huge whitespace, asymmetric heroes, few elements per screen. Type: serif display + quiet sans body, high contrast. Color: warm neutrals, near-monochrome, hairline rules. Shape: squarish, elevation near zero. Density: very spacious. Motion: slow and sparse. Personality: restrained, expensive.
Fits: content/editorial, premium conversion, portfolio. Poor fit: anything operational. **Failure:** every screen oversized and sparse — data pages still need working density.

### Bold Conversion
Composition: full-bleed sections, Z-pattern, oversized display type. Type: heavy display weights, tight leading. Color: saturated primary, strong contrast blocks (dark sections between light). Shape: medium radius, chunky buttons. Density: spacious. Motion: entrance reveals above the fold, restraint after. Personality: confident, loud.
Fits: conversion/marketing. Poor fit: admin, trust-sensitive forms. **Failure:** every section shouts — alternate loud and quiet sections so the CTA arc survives.

### Calm Care
Composition: single-column flows, generous line height. Type: humanist sans, larger body sizes. Color: teal/green/soft blue, warm neutrals, low saturation. Shape: `rounded-lg`, soft. Density: spacious. Motion: minimal, nothing sudden. Personality: reassuring.
Fits: onboarding/workflow, consumer trust-sensitive (health, personal finance). **Failure:** so soft nothing looks actionable — primaries stay solid and confident.

### Playful Consumer
Composition: card grids, badge-heavy, sticker-like moments. Type: rounded grotesk, chunky weights. Color: vivid accents (two allowed — hue discipline still applies), tinted backgrounds. Shape: `rounded-xl+`, bold shadows allowed. Density: medium. Motion: springy micro-interactions (`prefers-reduced-motion` respected). Personality: energetic, young.
Fits: consumer lifestyle, community, education. Poor fit: enterprise ops, institutional trust. **Failure:** accent sprawl — run palette-check; two accents means two.

### Technical Utility
Composition: dense toolbars and panels, keyboard-first affordances, visible structure. Type: grotesk UI + monospace for data/code; small sizes tolerated (accessibility floors hold). Color: neutral, often dark-first; restrained accent; syntax/chart colors belong to content. Shape: small radius, hairline borders. Density: compact. Motion: none to instant. Personality: expert, no-nonsense.
Fits: developer/creation tools, data-dense operational. **Failure:** unlabeled icon walls — labels and tooltips are still mandatory (components.md).

### Data Canvas
Composition: neutral shell, maximal canvas for user content; toolbars quiet and collapsible. Type: compact grotesk. Color: the shell is nearly achromatic — the chroma budget belongs to data marks and user content. Shape: small radius. Density: compact shell; the content breathes. Motion: functional (zoom, pan, transitions that explain). Personality: recedes behind the work.
Fits: creation tools, analytics. **Failure:** the shell stealing chroma from the data — audit with palette-check; the loudest color on screen must be data.

### Content First
Composition: single column, measure-driven (`max-w-prose`), sparse chrome. Type: reading serif or high-legibility sans for body, strong heading scale. Color: near-monochrome plus one link/action hue. Shape: minimal UI presence. Density: airy line-height, tight page chrome. Motion: none. Personality: a quiet host.
Fits: content/editorial, documentation. **Failure:** app-style cards fragmenting the reading column — prose flows, it isn't boxed.

### Warm Marketplace
Composition: imagery-led card grids, sticky filter rails. Type: friendly grotesk with clear price/number emphasis (tabular numerals). Color: warm accents (amber/coral) on light neutrals; photography carries most color. Shape: `rounded-lg`, gentle hover lift. Density: medium-dense grids. Motion: subtle lift on hover/focus. Personality: inviting — busy but ordered.
Fits: search/discovery, commerce, community. **Failure:** photos and accents fighting — flatten the chrome wherever imagery is rich.

## Direction → tokens

- **Color character** → palette recipe inputs (color.md): hue family, neutral warmth, accent budget, dark-first or light-first.
- **Type character** → family choice and the contrast between slots (typography.md): how far Display sits from Body.
- **Density band** → the spacing subset (spacing-layout.md): compact = p-3/gap-3 core with `h-9` controls; spacious = p-6/gap-8 core with `h-11`; accessibility floors hold either way (accessibility.md).
- **Shape / elevation / motion** → the radius token, the shadow ladder, and the transition budget — all recorded in `design-system/MASTER.md` (design-process.md).
