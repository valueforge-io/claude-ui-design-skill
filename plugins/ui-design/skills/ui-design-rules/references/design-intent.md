# Design Intent

What this UI should BE, decided before any wireframe: product context → archetype → an 8-line brief → visual direction. Consult at project kickoff, when adding a major new surface, or when a review reveals a screen serving the wrong job. Small tasks skip this file entirely.

## When to establish intent (cascade)

Same discipline as the styleguide cascade in SKILL.md — first hit wins:

1. `design-system/MASTER.md` exists → intent is already recorded; follow it, update it deliberately at the source.
2. The request and the repo carry enough context → infer the brief silently and state it back in one line; don't interrogate.
3. Fresh project with material ambiguity → ask ONE compact question (what does the product do, for whom, used how often?), then infer the rest.
4. Component tweaks, bug fixes, "just make it look good" → skip intent entirely; the surroundings answer.

Intent is cheap — eight lines of reasoning, not a workshop. Its job is to make the next three decisions non-arbitrary: visual direction, density, and information priority.

## The intent brief

Write it as a compact block (it goes verbatim into MASTER.md later):

```
product:  B2B fleet-operations dashboard
users:    dispatchers, ops managers
primary_job: spot exceptions and act fast
usage:    daily · long sessions · desktop · keyboard+pointer
content:  data-heavy, high density
brand:    precise, calm, competent
sliders:  expression quiet ●──── · density ────● compact · motion ●──── static
risks:    misreading vehicle status; missing a critical alert
```

- The sliders steer tokens directly: **expression** → type contrast and accent budget; **density** → which band of the spacing ladder and control heights; **motion** → the transition budget.
- **The sliders are budgets, and budgets get audited** [PRINCIPLE]. Risks become named checks — sliders must too, or they are decoration on the brief: after the build, run `expression-check.mjs` with the declared expression level. "High" that renders as a memo (display/body under 3, accent confined to buttons, zero texture) is a verification failure exactly like a contrast violation — the page broke a promise the brief made.

**A slider is a promise the build must spend** [PRINCIPLE]. Risks become named checks; sliders become budgets — concrete, measured after the build:

| expression | display/body ratio | colour at page scale | moment |
|---|---|---|---|
| quiet | ≥ 2 | accent on interactive elements only is fine | none required |
| medium | ≥ 2.5 | ≥1 tinted surface, or ≥2 temperature shifts | one earns its keep |
| high | ≥ 3.25 | a chromatic or dark band every 2–3 sections | at least one, non-negotiable |

- **Moving a slider mid-project is legitimate; drifting past it is not** [PRINCIPLE]. The owner looking at the shipped page and saying "more life" is a brief revision: move the slider, record one line of why in MASTER.md, re-audit at the new level. What is never legitimate is the build quietly exceeding or undershooting the declared level — that is drift, and the audit exists to catch it in both directions.

`node scripts/expression-check.mjs <page> --expression=<level>` measures all of it — rendered type ratio, chromatic area, temperature rhythm, empty slabs, the moment. A brief that says *high* and a page that measures *quiet* is a failed build even though every floor passes: floors prevent broken, the budget prevents beige. Record the declared level in MASTER.md with the rest of the brief, so reviews audit against the promise that was actually made.
- **risks** name what verification must protect (here: status must survive grayscale; alerts must win the squint test).
- **primary_job** orders the wireframe: whatever serves it is visually first (visual-hierarchy.md).

## Product archetypes

Behavior-based, not industry-based — a medical portal is *trust-sensitive + transactional*, and that carries the design; the industry label carries nothing. Most products mix two archetypes: name the dominant one, borrow guardrails from the second.

| Archetype | Dominant job | Design bias |
|---|---|---|
| Data-dense operational | scan, monitor, act fast | compact density; tables & status; exceptions surface first |
| Transactional | complete a process correctly | one path, one primary action; visible progress; forms discipline |
| Creation tool | make things in a workspace | quiet chrome; canvas gets the space and the color budget |
| Content / editorial | read and discover | measure-driven typography; minimal chrome |
| Conversion / marketing | narrate and persuade | bold display type; one CTA arc; section rhythm |
| Search / discovery | find the right object | query + filters + comparable results; designed empty states |
| Collaboration | see people, activity, state | presence, attribution, freshness cues |
| Configuration / admin | change settings safely | grouped forms; guarded destructive zones; clarity over flair |
| Trust-sensitive | avoid costly errors | conservative palette; explicit copy; consequences named |
| Onboarding / workflow | progress with confidence | one decision per screen; defaults; visible progress |

What each archetype protects (verification priorities):

- **Data-dense operational** — scannability: status is color+icon+text, alerts outrank aesthetics, grouping gaps survive compact density.
- **Transactional** — completion: no competing CTAs, inline error recovery, no redundant entry (accessibility.md).
- **Creation tool** — the workspace: UI stays neutral and recedes; chroma belongs to user content (see Data Canvas direction).
- **Content / editorial** — reading: measure, leading, and hierarchy carry the design; nothing interrupts the column.
- **Conversion / marketing** — the narrative arc: one message per section; the CTA returns where scans exit.
- **Search / discovery** — comparability: uniform result anatomy; filters visible; loading/empty states designed.
- **Collaboration** — recency and attribution: who/when always visible; live changes announced (interaction.md).
- **Configuration / admin** — reversibility: destructive isolated in the error slot, current values visible, save state explicit.
- **Trust-sensitive** — comprehension: plain language, verifiable numbers, no dark patterns, generous contrast headroom.
- **Onboarding / workflow** — momentum: fewest choices per screen, sensible defaults, progress visible, exits allowed.

## Default section arcs

Where the sequence itself is knowledge, start from these and adapt — they are opening positions to edit with the user (Kickoff stage 3), never a layout to impose:

- **Conversion / marketing:** hook (what and for whom) → proof it works → what it actually is → try it (sample, demo, free tier) → who made it → social proof → objections (FAQ, guarantees) → close. Price appears wherever the audience expects it — early for cheap and obvious, late for considered purchases.
- **Content / editorial:** entry point (why read this) → the piece itself in a single measure → related paths → subscribe/follow. Chrome stays out of the column.
- **Onboarding / workflow:** orient (where am I, how long) → one decision per screen → progress made visible → confirm and hand off to the product. Every screen has an exit that doesn't lose work.
- **Transactional:** summarize what's happening → the fields, grouped → cost and consequences stated before the button → one primary action → confirmation with what happens next.

Other archetypes are structured by their content, not by a canonical sequence — derive the order from the primary job instead.

## From intent to direction and structure

1. Archetype + sliders → shortlist 2–3 visual directions (visual-directions.md); propose them with one-line reasoning — **and name what each direction's register codes as on this market**, in categories the user already knows ("reads as boutique publisher", "reads as IT integrator"). A direction whose register codes a category the copy explicitly walks away from is flagged here, for the price of one sentence; discovered after a full specimen round, the same flaw costs the round. The user picks or defers to your default.
2. primary_job orders the wireframe's regions and the reading order; risks become named checks in Step 3 verification and in reviews.
3. Record the final brief and the chosen direction in `design-system/MASTER.md` (design-process.md) — the next session inherits the reasoning, not just the tokens.
