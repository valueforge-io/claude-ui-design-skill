# Kickoff Mode

The entry ritual for a new UI project or a new major surface: five short stages, each ending in a gate. Consult when starting something from nothing. For work inside an existing codebase, this file does not apply — see the collapse rules at the bottom.

## The governing principle

**Replace questions with comparisons** [PRINCIPLE]. Visual decisions must be made on pixels, not adjectives. "Do you prefer oxblood or steel navy?" is a question the user cannot answer honestly; two rendered candidates side by side answer themselves in seconds. The skill already renders and screenshots — Kickoff simply moves that capability from the end of the process to the front.

Corollary: asking *fewer* questions is not the goal — showing *more material* is. Keep the question count low (one per stage at most), but never let a visual decision happen in prose.

## Two kinds of gates

Not every gate closes the same way, and confusing them is how a ritual becomes theatre [PRINCIPLE]:

- **Confirm-by-silence** — a *summary you could correct*: the inventory and the intent brief. State it, invite a correction, move on. Silence is acceptance; these must never stall the work.
- **Requires an answer** — a *decision only the user can make*: the visual pick (Stage 2) and the section arc (Stage 3). State it, ask for the specific input, and **end your turn**. Silence here is not acceptance; it means the user hasn't looked yet.

Never put a confirm-by-silence stage and a requires-an-answer stage in the same message. Bundled, the decision reads as an appendix to the summary and scrolls past — the user "agrees" to a structure they never registered as a question.

## Stage 0 — Inventory

Purpose: know what exists before inventing anything. Produce a three-column list and confirm it in one message:

| Have | Don't have | Agent produces |
|---|---|---|
| brand assets, logo, cover art, photos | — | — |
| final copy, or partial copy | — | placeholder copy in the real register |
| existing design system, tokens, references you like | — | candidate palettes and pairings |

Ask once, compactly: *"Before I start: do you have (a) brand assets or imagery, (b) real copy or should I draft placeholders, (c) an existing design system or reference sites you like?"* Anything the user doesn't answer becomes "agent produces".

If assets exist, **look at them and measure them before composing any candidate**: open the image (you are multimodal — see what it actually is), then run `node scripts/extract-palette.mjs <image>` for the ground hue, the signal hue and its share, and the lightness range. Those three numbers constrain the whole specimen: the palette should agree with the asset rather than fight it (procedure and repair path: references/color.md, "Palette from an asset").

**Gate:** every row is assigned, and any existing asset has been looked at and measured.

## Stage 1 — Intent

Purpose: the 8-line brief and archetype (procedure and format: design-intent.md). Infer from the request and the inventory; ask at most one question when the primary job is genuinely ambiguous. State the brief back in the message — the user corrects a line if it's wrong.

**Gate (confirm-by-silence):** the user has seen the brief and hasn't objected. This stage must not stall — but it also must not carry a decision stage along with it.

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

## Stage 3 — Arc (the structural gate)

Purpose: agree on the page structure *and* on where real content comes from — before either exists in code. This stage gets **its own message**; it is never appended to the intent brief.

Produce a numbered table: section · what job it does · what content it needs · who supplies it. Start from the archetype's default arc (design-intent.md), adapted to this product. Example row: `3 · Fragment · daje próbkę pisania · pierwsze 2 strony rozdziału · **masz? wklej — inaczej piszę wypełniacz**`.

The content column is the point, not decoration: it shows the user the shopping list before anything is built, and it invites real copy exactly where they already have it. Anything unclaimed becomes placeholder in the target register and length (content-design.md).

Then ask plainly, and **stop**: *"Wytnij, przestaw albo dodaj — podaj numery. Wklej treści, które już masz. Napisz 'ok', jeśli pasuje."* / *"Cut, reorder, or add — give me numbers. Paste any copy you already have. Say 'ok' if it fits."*

**Gate (requires an answer):** an explicit reply — edits, pasted copy, or "ok". Silence means they haven't read it. Structural disagreements cost one message here and a rebuild after implementation.

## Stage 4 — Tokens, then build

Purpose: convert picks into tokens and record the reasoning. Write the token layer (Tailwind config or `@theme`, per version detection), the type roles, and `design-system/MASTER.md` (intent + direction + tokens + deviations log — design-process.md). Content goes into a single content module, never into components (content-design.md).

**Gate:** zero raw hex and zero arbitrary values in component code. From here, the normal Build workflow (SKILL.md) takes over, ending in the usual verification.

**Hand over a page they can open** [PRINCIPLE]. Serve it, open it, and lead with the URL — the finished work must reach the user's screen exactly like the specimen did, or they end up asking "how do I see this?" after you have declared it done. Include the one-line command to bring it back, and the rebuild step after they edit content.

**Close every build with the content shopping list** [PRINCIPLE]. Once the page renders, end the message with the concrete list of fields still carrying placeholder text — named, in one line each, in the order they appear on the page: *"Do wypełnienia w `content/book.ts`: cytat prasowy, fragment rozdziału, biogram autora, liczba stron, ISBN."* A section that renders nothing because its content is missing is reported too, not silently dropped — the count of empty sections is the honest measure of how much of the page is still owed. Never let placeholder text become permanent by going unmentioned.

## Collapsing the ritual

The ritual scales down to nothing — the default is to skip it:

- Component tweak, bug fix, restyle inside an existing system → **no stages at all**; the styleguide cascade already has the answers.
- New surface in an existing project → stages 3–4 only, reusing MASTER.md.
- New project, user says "just build it" → run stages internally, show the specimen anyway (it costs one message and prevents a rebuild), take defaults for everything else.
- Every stage accepts "choose for me": pick the first candidate, state the choice in one line, keep going. The ritual must never block on a user who wants to delegate.

Total budget: at most three messages of back-and-forth before the first rendered page. If Kickoff feels like a workshop, it has failed — cut a stage rather than a screenshot.
