# Kickoff Mode

The entry ritual for a new UI project or a new major surface: five short stages, each ending in a gate. Consult when starting something from nothing. For work inside an existing codebase, this file does not apply — see the collapse rules at the bottom.

## The governing principle

**Replace questions with comparisons** [PRINCIPLE]. Visual decisions must be made on pixels, not adjectives. "Do you prefer oxblood or steel navy?" is a question the user cannot answer honestly; two rendered candidates side by side answer themselves in seconds. The skill already renders and screenshots — Kickoff simply moves that capability from the end of the process to the front.

Corollary: asking *fewer* questions is not the goal — showing *more material* is. Keep the question count low (one per stage at most), but never let a visual decision happen in prose.

## Stage 0 — Inventory

Purpose: know what exists before inventing anything. Produce a three-column list and confirm it in one message:

| Have | Don't have | Agent produces |
|---|---|---|
| brand assets, logo, cover art, photos | — | — |
| final copy, or partial copy | — | placeholder copy in the real register |
| existing design system, tokens, references you like | — | candidate palettes and pairings |

Ask once, compactly: *"Before I start: do you have (a) brand assets or imagery, (b) real copy or should I draft placeholders, (c) an existing design system or reference sites you like?"* Anything the user doesn't answer becomes "agent produces".

**Gate:** every row is assigned. Assets that exist are looked at before deciding color (a cover or logo constrains hue — the palette should agree with it, not fight it).

## Stage 1 — Intent

Purpose: the 8-line brief and archetype (procedure and format: design-intent.md). Infer from the request and the inventory; ask at most one question when the primary job is genuinely ambiguous. State the brief back in the message — the user corrects a line if it's wrong.

**Gate:** the user has seen the brief and hasn't objected. Silence is acceptance; this stage must not stall.

## Stage 2 — Specimen (the visual gate)

Purpose: the user picks palette and typography from rendered pixels.

1. Compose 3 palette candidates and 3–4 type pairings from the intent (visual-directions.md sets the character, color.md the construction). Make them differ in *character*, not in decimals — a control variant close to the obvious choice is useful as an anchor.
2. Write them into `specimen.json` and run `node scripts/specimen.mjs specimen.json --out=specimen.html`. The script renders every candidate on the project's real copy, computes each palette's key contrast pairs, and badges failures.
3. Fix anything badged FAIL *before* showing it — a failing candidate is not a choice (warm-hue actions usually need the escape hatch in color.md). Re-run until every candidate passes.
4. **Put the image on their screen, then ask — in that order** [PRINCIPLE]. A specimen the user never opens is worth nothing: they will answer from the option list instead of from the pixels, which is exactly the failure this stage exists to prevent. The script opens the PNG in the system viewer automatically (`--open=false` disables it). If your environment cannot display images inline, say plainly *"Otwórz specimen.png — czekam"* / *"Open specimen.png — I'll wait"* and **stop your turn there**. Ask for the picks only in the next message, after the user has confirmed they're looking at it.
5. Ask for two picks: a number (palette) and a letter (pairing). Do **not** label any option "recommended" or "default" at this point — a recommendation short-circuits the comparison you just rendered. State instead that every candidate passes the checks, so the choice is purely about character. "Choose for me" remains available if the user asks for it, but it must be their move, not your suggestion.

Fonts: verify every family actually exists and carries the subsets the language needs (Polish needs `latin-ext`) before putting it in the specimen; a hallucinated family name is a build error later. Curl the Google Fonts CSS endpoint or check the provider's catalogue — and validate your check with a deliberately fake name, so a probe that always says yes gets caught.

**Gate:** an explicit pick (or an explicit deferral). Nothing gets coded before this.

**Rejection path:** if the user rejects all candidates, ask what specifically is wrong (too loud / too cold / too corporate / too playful), move that dial, and re-render. Never argue for a candidate — re-render; it costs a minute.

## Stage 3 — Arc

Purpose: agree on the page structure *before* it exists in code. Produce a numbered list of sections, each one line: what it says and what job it does. Start from the archetype's default arc (design-intent.md), adapted to this product.

Present it as an editable list — the user reorders, cuts, or adds. This is also where real copy enters: any section the user has final text for gets it now, the rest get placeholder copy in the right register and length.

**Gate:** the section list is accepted. Structural disagreements are cheap here and expensive after implementation.

## Stage 4 — Tokens, then build

Purpose: convert picks into tokens and record the reasoning. Write the token layer (Tailwind config or `@theme`, per version detection), the type roles, and `design-system/MASTER.md` (intent + direction + tokens + deviations log — design-process.md). Content goes into a single content module, never into components (content-design.md).

**Gate:** zero raw hex and zero arbitrary values in component code. From here, the normal Build workflow (SKILL.md) takes over, ending in the usual verification.

## Collapsing the ritual

The ritual scales down to nothing — the default is to skip it:

- Component tweak, bug fix, restyle inside an existing system → **no stages at all**; the styleguide cascade already has the answers.
- New surface in an existing project → stages 3–4 only, reusing MASTER.md.
- New project, user says "just build it" → run stages internally, show the specimen anyway (it costs one message and prevents a rebuild), take defaults for everything else.
- Every stage accepts "choose for me": pick the first candidate, state the choice in one line, keep going. The ritual must never block on a user who wants to delegate.

Total budget: at most three messages of back-and-forth before the first rendered page. If Kickoff feels like a workshop, it has failed — cut a stage rather than a screenshot.
