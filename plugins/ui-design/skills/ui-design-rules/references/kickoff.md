# Kickoff Mode

The entry ritual for a new UI project or a new major surface: five short stages, each ending in a gate. Consult when starting something from nothing. For work inside an existing codebase, this file does not apply — see the collapse rules at the bottom.

## The governing principle

**Replace questions with comparisons** [PRINCIPLE]. Visual decisions must be made on pixels, not adjectives. "Do you prefer oxblood or steel navy?" is a question the user cannot answer honestly; two rendered candidates side by side answer themselves in seconds. The skill already renders and screenshots — Kickoff simply moves that capability from the end of the process to the front.

Corollary: asking *fewer* questions is not the goal — showing *more material* is. Keep the question count low (one per stage at most), but never let a visual decision happen in prose.

## Two kinds of gates

Not every gate closes the same way, and confusing them is how a ritual becomes theatre [PRINCIPLE]:

- **Confirm-by-silence** — a *summary you could correct*: the inventory and the intent brief. State it, invite a correction, move on. Silence is acceptance; these must never stall the work.
- **Requires an answer** — a *decision only the user can make*: the section arc (Stage 2) and the visual pick (Stage 3). State it, ask for the specific input, and **end your turn**. Silence here is not acceptance; it means the user hasn't looked yet.

Never put a confirm-by-silence stage and a requires-an-answer stage in the same message. Bundled, the decision reads as an appendix to the summary and scrolls past — the user "agrees" to a structure they never registered as a question.

## Stage 0 — Inventory

Purpose: know what exists before inventing anything. Produce a three-column list and confirm it in one message:

| Have | Don't have | Agent produces |
|---|---|---|
| brand assets, logo, cover art, photos | — | — |
| final copy, or partial copy | — | placeholder copy in the real register |
| existing design system, tokens, references you like | — | candidate palettes and pairings |

Ask once, compactly: *"Before I start: do you have (a) brand assets or imagery, (b) real copy or should I draft placeholders, (c) an existing design system or reference sites you like?"* Anything the user doesn't answer becomes "agent produces".

If assets exist, take stock of them before composing anything. Three jobs, and they belong to three different parties [PRINCIPLE]:

- **The script measures.** `node scripts/asset-inventory.mjs <dir> --arc=arc.json` walks the folder and reports, per file, dimensions, aspect ratio, orientation, whether it carries transparency, and whether it is light or dark. With an arc it also checks the assignments: a ratio that does not match its slot (the image will be cropped and nobody will notice until the page exists), a file too small for the size it renders at, a slot with no file, a file no slot uses.
- **You describe.** Open every image — you are multimodal, you can see them — and fill the "what it shows" column. The script cannot know that one file is the cover and another is a portrait; guessing it from a filename is how a landscape shot ends up in a portrait frame.
- **The user approves.** The finished table goes out next to the mockup in Stage 2, where every media slot prints the file assigned to it. Which picture goes where is then something the user agreed to, not something you decided quietly at build time.

Then measure the one asset that constrains everything else: `node scripts/extract-palette.mjs <image>` on the fixed asset — a published cover, a logo, packaging, a real product shot — for the ground hue, the signal hue and its share, and the lightness range. Those three numbers constrain the whole specimen (procedure and repair path: references/color.md, "Palette from an asset").

**Which way the influence runs depends on whether the asset can still change** [PRINCIPLE]. An asset that is already fixed dictates the palette, because the page has to live beside it and cannot redesign it — a cool-grey page under a warm-paper cover shows a seam at every edge. Imagery that will be chosen or made later obeys the palette instead, and its brief says so: `[Portret autora — mono, w duchu okładki]`. With no fixed asset at all, extract-palette says the image is essentially achromatic and the brand hue becomes a free choice from intent.

**Gate:** every row is assigned, every existing asset has been opened and measured, and each one is either mapped to a slot or explicitly set aside.

## Stage 1 — Intent

Purpose: the 8-line brief and archetype (procedure and format: design-intent.md). Infer from the request and the inventory; ask at most one question when the primary job is genuinely ambiguous. State the brief back in the message — the user corrects a line if it's wrong.

**Gate (confirm-by-silence):** the user has seen the brief and hasn't objected. This stage must not stall — but it also must not carry a decision stage along with it.

## Stage 2 — Arc (the structural gate)

Purpose: agree on **what stands where inside each section**, and on where the real words come from, before either exists in code. This stage gets its own message; it is never appended to the intent brief.

The unit of this decision is the slot, not the section [PRINCIPLE]. Whether the hero carries one call to action or two, whether the cover stands beside the headline or above it, whether the sample chapter costs an email address, whether the offer shows three formats or one — these are the decisions that actually shape a page, and a table row cannot hold them. Listed as slots they become cuts the user can make in seconds; left in prose they get made silently in code.

1. Compose `arc.json` from the archetype's default arc (design-intent.md), adapted to this product: sections, each with a goal and its blocks in reading order. Propose a **full** arc — never ask "what sections would you like", which is as unanswerable as asking whether they prefer oxblood or steel navy.
2. Render it: `node scripts/wireframe.mjs arc.json --out=wireframe`. Greyscale, one system typeface, every slot dashed and addressed (`3.2` = section 3, slot 2), at **two viewports — web and mobile, both**. The narrow view is not a courtesy: it forces the decisions that otherwise happen by accident — what collapses, what moves above what, in what order a section is read on a phone (`"asideMobile": "last"` drops a side slot below the copy instead of above it).
3. **Every user-visible string lives in [square brackets]** and the script refuses to render otherwise [STANDARD]. This is what stops a mockup from being taken for a design: bracketed text cannot be admired, only filled in. Write the brief inside the bracket — `[Bio, 2–3 zdania: kim jest i skąd wiarygodnie zna świat, o którym pisze]` — because a slot that says what to write and how long it runs is worth more than a table cell saying "biogram".
4. **Put both images on their screen, then ask — in that order** [PRINCIPLE]. Same rule as every rendered gate: the script opens them; if your environment cannot, say *"Otwórz wireframe-web.png i wireframe-mobile.png — czekam"* / *"Open both files — I'll wait"* and **stop your turn there**.
5. Then ask plainly: *"Tnij, przestawiaj i dodawaj po numerach — sekcji i slotów. Wklej treści, które już masz. Napisz 'ok', jeśli pasuje."* / *"Cut, reorder, add — by number, sections and slots. Paste any copy you already have. Say 'ok' if it fits."*

Keep the mockup honest about what it does **not** claim: it shows order and contents, not proportion, colour or type. Say so in one line — those come next, on the specimen.

**Gate (requires an answer):** an explicit reply — numbers, pasted copy, or "ok". Silence means they haven't looked. A structural disagreement costs one message here and a rebuild after implementation.

## Stage 3 — Specimen (the visual gate)

Purpose: the user picks palette and typography from rendered pixels — now on the page's **real** slots, which is why this stage follows the arc. Set the headline candidates in the actual headline, the hook at its actual length, the button in its actual label: a pairing that looks elegant on sample text and breaks the real title across three lines has to fail here, not after the build.

1. Compose 3 palette candidates and 3–4 type pairings from the intent (visual-directions.md sets the character, color.md the construction). Make them differ in *character*, not in decimals, and **spread them on an energy axis**: one quieter than the brief, one at it, one a notch louder. Three variants of safe is the classic failure — the user picks the middle of a distribution whose entire width is beige, and the real choice was made before they saw anything. If an asset exists, the hues measured in Stage 0 constrain every candidate (color.md, "Palette from an asset").
2. Write them into `specimen.json` and run `node scripts/specimen.mjs specimen.json --out=specimen.html`. The script renders every candidate on the project's real copy, computes each palette's key contrast pairs, and badges failures.
3. Fix anything badged FAIL *before* showing it — a failing candidate is not a choice (warm-hue actions usually need the escape hatch in color.md). Re-run until every candidate passes.
4. **Put the image on their screen, then ask — in that order** [PRINCIPLE]. A specimen the user never opens is worth nothing: they will answer from the option list instead of from the pixels, which is exactly the failure this stage exists to prevent. The script opens the PNG in the system viewer automatically (`--open=false` disables it). If your environment cannot display images inline, say plainly *"Otwórz specimen.png — czekam"* / *"Open specimen.png — I'll wait"* and **stop your turn there**. Ask for the picks only in the next message, after the user has confirmed they're looking at it.
5. Ask for two picks: a number (palette) and a letter (pairing). Do **not** label any option "recommended" or "default" at this point — a recommendation short-circuits the comparison you just rendered. State instead that every candidate passes the checks, so the choice is purely about character. "Choose for me" remains available if the user asks for it, but it must be their move, not your suggestion.

Fonts: verify every family actually exists and carries the subsets the language needs (Polish needs `latin-ext`) before putting it in the specimen; a hallucinated family name is a build error later. Curl the Google Fonts CSS endpoint or check the provider's catalogue — and validate your check with a deliberately fake name, so a probe that always says yes gets caught.

**Gate:** an explicit pick (or an explicit deferral). Nothing gets coded before this.

**Rejection path:** if the user rejects all candidates, ask what specifically is wrong (too loud / too cold / too corporate / too playful), move that dial, and re-render. Never argue for a candidate — re-render; it costs a minute.

## Stage 4 — Tokens, then build

Purpose: convert picks into tokens and record the reasoning. Write the token layer (Tailwind config or `@theme`, per version detection), the type roles, and `design-system/MASTER.md` (intent + direction + tokens + deviations log — design-process.md).

The content module is **generated, not transcribed**: `node scripts/wireframe.mjs arc.json --content=content/site.ts` turns every bracket into a key with its brief intact. Components import from it and hold zero strings (content-design.md). This is what makes the closing shopping list a query instead of a memory exercise — the fields still owed are exactly the keys whose values are still in brackets.

**Gate:** zero raw hex and zero arbitrary values in component code. From here, the normal Build workflow (SKILL.md) takes over, ending in the usual verification.

**Hand over a page they can open** [PRINCIPLE]. Serve it, open it, and lead with the URL — the finished work must reach the user's screen exactly like the specimen did, or they end up asking "how do I see this?" after you have declared it done. Include the one-line command to bring it back, and the rebuild step after they edit content.

**Close every build with the content shopping list** [PRINCIPLE]. Once the page renders, end the message with the concrete list of fields still carrying placeholder text — grep the content module for `[` and you have it — named, in one line each, in the order they appear on the page: *"Do wypełnienia w `content/book.ts`: cytat prasowy, fragment rozdziału, biogram autora, liczba stron, ISBN."* A section that renders nothing because its content is missing is reported too, not silently dropped — the count of empty sections is the honest measure of how much of the page is still owed. Never let placeholder text become permanent by going unmentioned.

## Collapsing the ritual

The ritual scales down to nothing — the default is to skip it:

- Component tweak, bug fix, restyle inside an existing system → **no stages at all**; the styleguide cascade already has the answers.
- New surface in an existing project → stages 2 and 4 only (arc, then build), reusing MASTER.md: the palette and type are already decided.
- New project, user says "just build it" → run stages internally, show the mockup and the specimen anyway (two messages, and they prevent a rebuild of the whole page), take defaults for everything else.
- Every stage accepts "choose for me": pick the first candidate, state the choice in one line, keep going. The ritual must never block on a user who wants to delegate.

Total budget: at most three messages of back-and-forth before the first rendered page. If Kickoff feels like a workshop, it has failed — cut a stage rather than a screenshot.
