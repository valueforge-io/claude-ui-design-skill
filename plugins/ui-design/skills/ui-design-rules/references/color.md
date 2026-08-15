# Color

Rules for choosing and applying color in React + Tailwind UIs: semantic slots, the weight
scale, a palette-building procedure, scheme types, temperature, saturation control, contrast,
psychology, and dark mode. Consult before defining a palette and whenever styling components.

## Core Model

- Hue is position on the color wheel. Pick hues by wheel relationship — adjacent hues harmonize, opposite hues contrast — never by eyeballing arbitrary hex values, because wheel distance predicts whether colors work together and raw RGB/hex picking does not.
- A Tailwind palette family (50–950) is a prebuilt tint/tone/shade scale of one hue: low steps add white (tint — recedes, low priority), high steps add black (shade — advances, high priority), and the whole family carries a little gray (tone) so nothing reads oversaturated.
- Control visual priority by moving along the step scale, not by switching hue. Darker step = more contrast = more important; lighter step = blends into the background = less important.

## Semantic Slots

Define slots in `tailwind.config` (`theme.extend.colors`) and reference only slot names in components. Never use raw family names like `indigo-600` outside the config — tokens keep every color decision made once.

| Slot | Default family | Role |
|---|---|---|
| `primary` | `indigo` | Brand hue: main actions, links, active states, focus rings |
| `neutral` | `slate` | Text, backgrounds, borders, passive structure |
| `accent` | complementary of primary (`amber` for indigo) | Rare emphasis; at most 10% of any screen |
| `success` | `green` | Confirmations, positive status |
| `warning` | `amber` | Caution, reversible risk |
| `error` | `red` | Failures, destructive actions, alerts |
| `info` | `sky` | Neutral notices, education |

Swap `primary` to fit brand psychology (table below). Keep the four semantic slots fixed — users read red/amber/green/blue by convention, and repurposing them breaks learned meaning.

**When the brand hue collides with a semantic slot** (a crimson thriller, an amber energy brand, a green finance app), don't repaint the semantic — separate them by *treatment*, which is what users actually read:

- Brand hue: solid marks, links, eyebrows, rules, one accent surface per view.
- Semantic state: always a tinted surface + icon + text label (`bg-error-50 text-error-700` + icon + "Nie udało się zapisać"), never a bare colored word. Nudge the semantic hue 15–25° away from the brand hue where the family allows (crimson brand at 25° → error at 10–15°, colder).
- The rule that survives: a state is recognized by its full treatment, not its hue alone [STANDARD] — which is the same reason color never carries meaning by itself.

## Weight Scale — Which Step for What (light mode)

| Steps | Use for |
|---|---|
| 50–100 | Page and card backgrounds, subtle tinted fills |
| 200–300 | Borders, dividers, tags, badges, disabled fills |
| 400–500 | Placeholders, icons, large secondary text only (mid steps often fail body-text contrast) |
| 600 | Solid buttons, links, brand color at rest, secondary text (`neutral-600`) |
| 700 | Hover of solid elements, emphasized secondary text |
| 800–900 | Headings, body text, overlays |
| 950 | Near-black text, dark-mode backgrounds |

Default component patterns:

- Solid button: `bg-primary-600 hover:bg-primary-700 text-white` — hover always darkens one step, because added shade signals priority and response; never lighten on hover in light mode.
- Secondary button: `bg-primary-50 text-primary-700 hover:bg-primary-100` — tinted fill blends it toward the background, ranking it below the solid button.
- Body text: `text-neutral-900` on `bg-white` or `bg-neutral-50`.
- Secondary/description text: `text-neutral-600`; placeholders `text-neutral-400`.
- Borders: `border-neutral-200`; stronger dividers `border-neutral-300`.
- Status surface: `bg-{slot}-50 text-{slot}-700 border-{slot}-200` (e.g. error alert `bg-error-50 text-error-700 border-error-200`).

## Default Palette Recipe

Execute in order when starting a UI:

1. Pick the primary hue from the psychology table below. When in doubt use `indigo` or `blue` — trust and stability read safely in almost every product domain.
2. Choose the scheme: default is monochrome (primary family + neutral scale, nothing else). Add one complementary accent only if the UI genuinely needs a second voice (marketing highlights, charts, empty-state illustration).
3. Choose the neutral: default `slate`. For a branded neutral, keep the primary's hue (H), drop saturation to 5–10%, and run lightness from 98% (step 50) down to 10% (step 950) — a hue-tinted gray feels cohesive without competing.
4. If a brand hex is given, build the custom scale in OKLCH (perceptually uniform — equal lightness steps actually look equal, which HSL cannot promise; Tailwind v4's own palettes are OKLCH): convert the brand value, fix hue H, anchor it at step 500 or 600, then run lightness L in even steps from ~0.97 (step 50) down to ~0.25 (step 950), holding chroma C moderate and trimming it toward both extremes. If a step clips outside sRGB gamut, reduce C before touching H. HSL is an acceptable fallback when tooling lacks OKLCH — but check the mid steps for muddy or neon drift by eye.
5. Set semantic colors: `green-600`, `amber-500`, `red-600`, `sky-600` for solids, each with its 50/200/700 steps for tinted surfaces. Do not derive these from the brand hue.
6. Distribute by 60-30-10 [HEURISTIC]: roughly 60% of any screen is neutral surfaces (backgrounds, cards), 30% is neutral text and structure (borders, secondary surfaces), 10% is primary + accent + semantic color. A proportion lens, not arithmetic — dense data UIs legitimately run even more neutral. If a screen feels loud, count — primary exceeding 10% is the usual cause.
7. Assign steps per the weight table, then verify contrast (section below) and view the screen in grayscale: hierarchy must survive with hue removed.

Record the result as the token schema (slot × step, with hex) before building screens — the schema is the first artifact of the style guide, and components reference it, never ad-hoc values.

## Scheme Types

- Monochrome (default): one hue varied only by step. Darker steps for titles and buttons, lighter steps for backgrounds and borders. Safest scheme; a single Tailwind family already is one. Why: zero hue conflicts, hierarchy carried entirely by lightness.
- Analogous: the primary plus its one or two wheel neighbors (e.g. indigo + violet + blue). Use neighbors for illustration, charts, and secondary surfaces; keep exactly one hue for actions. Why: adjacent hues share undertones, so they harmonize while adding variety.
- Complementary: the hue opposite the primary (blue↔orange, red↔green) as accent. Strongest possible hue contrast — confine it to the 10% share and soften with tints/shades, or it fights the primary.
- Triadic: three hues 120° apart with fixed roles — main action, secondary, background tint. Use only for illustration-heavy or marketing surfaces; three voices rarely stay quiet in product UI.
- Tetradic: four hues. Avoid in product work — coherence collapses; if handed one, demote two hues to illustration only.

## Hue Discipline (Harmony)

Whether a palette holds together is largely checkable. Work in hue degrees (0–360°) and chroma — the spread between the highest and lowest RGB channel (0–1). Neutrals = chroma below ~0.16 (classic HSL saturation misreads tinted grays like `slate`; chroma does not). Semantic status colors are exempt from family counts where they genuinely mark status.

- Count non-neutral hue families (cluster hues within ~18°). Default 1–2, hard maximum 3 — more is noise that no step-tuning fixes; demote extras to illustration or drop them.
- Classify each family pair by circular hue distance: ≤15° monochrome; 15–60° analogous; 180°±20° complementary; 120°±15° triadic. A pair in the 60–150° gap that isn't doing status work reads as a clash — move the accent to the nearest legal relationship or remove it.
- Chroma coherence: chromatic colors should sit in one band (spread ≲ 0.35). One vivid element among muted ones shouts; one washed-out element among vivid ones looks broken.
- Tinted neutrals (chroma 0.08–0.16) are fine when deliberate and hue-matched to the primary (branded neutral, see the palette recipe); a bug when their tint hue drifts far from the primary's.
- Temperature roles hold inside the palette: cool/neutral structure, warmth only on attention targets (next section).

Verification: sample real rendered colors — `node scripts/palette-check.mjs <file.html|url>` renders the page, clusters hue families, classifies pair relationships, and flags clash pairs, extra families, and chroma outliers. Numbers catch rule violations; the final aesthetic call is made on the screenshot.

## Temperature [HEURISTIC]

- Warm hues (red, orange, yellow, amber) advance and demand attention. Reserve them for CTAs, warnings, and essential interactions.
- Cool hues (green, teal, blue, violet) recede. Use them for structure: backgrounds, framework, passive and general-purpose controls.
- Default: cool (or neutral) structure, warm only where the eye must land. Placing warm beside cool is the cheapest way to steer focus — a warm element always wins attention over a cool one.
- Nudge a color warmer by shifting hue toward yellow, cooler by shifting toward blue.

## Saturation, Tint, Tone, Shade

Default: never use fully saturated pure hues (`#ff0000`, HSL S=100/L=50) in UI — pick from the moderately saturated interior of the color space, which Tailwind's built-in palettes already do; deviate only for tiny attention-critical marks.

- DO lighten (tint) to demote: lighter text steps for descriptions and metadata, lighter fills to sink secondary buttons into the background — light recedes.
- DO order lists of elements by step so lightness reflects rank (900 title, 600 description, 400 meta).
- DON'T saturate to emphasize; darken instead — saturation shouts, shade ranks.
- DO keep a touch of gray (tone) in every color, including large fills — toned colors sit calmer on the eye over long sessions.
- DO darken (shade) headings and hover backgrounds — added black buys contrast and priority.
- DON'T place same-hue foreground on same-hue background at nearby steps; keep text at 700+ on fills of 100 or lighter, because closely matched weights destroy legibility.
- DON'T use steps 400–500 for body-size text on white; restrict them to icons and large text.

## Contrast

The contrast ratio scale runs 1:1 (identical colors) to 21:1 (black on white). Hard minimums:

- Body text: 4.5:1 against its background. Default safe pairs: `neutral-900` on `neutral-50` (~16:1), `neutral-600` on white (~7:1), white on `primary-600`.
- Large text (24px+, or 19px+ bold): 3:1 minimum.
- UI components, icons, and state-carrying borders: 3:1 against adjacent colors.
- A pair that barely passes (4.5–5:1) looks weak on poor displays — when near the line, darken the text one step; the cost is nothing, the headroom is real.
- Text on white: use step 600 or darker for body copy; 500 only for large text. Most families' 400s fail 4.5:1 on white.
- Never encode meaning in hue alone — pair color with text, icon, or weight; verify by viewing the screen in grayscale, which reveals whether hierarchy survives without hue (it must).
- Contrast between two different hues also counts: only juxtapose hues that remain distinguishable in grayscale.

## Color Psychology [HEURISTIC]

Hue choice sends a message — but the message is contextual: audience, culture, brand history, and juxtaposition can override every row below. Use this table as a tiebreaker when choosing a primary, never as a law that steers the system:

| Hue (family) | Reads as | Default use |
|---|---|---|
| Red (`red`) | Danger, urgency, power | Errors, destructive actions |
| Orange/amber (`amber`, `orange`) | Warning, friendly, energetic | Warnings, playful accents |
| Yellow (`yellow`) | Fun, optimism, highlight | Highlights only — poor text contrast |
| Green (`green`, `emerald`) | Success, growth, positive | Success states, finance-positive |
| Teal (`teal`) | Balance, calm, stability | Health, wellness, calm info |
| Blue (`blue`, `sky`) | Trust, security, finance, communication | Corporate, fintech, SaaS primary |
| Indigo/violet (`indigo`, `violet`, `purple`) | Luxury, creativity, nobility, mystery | Premium and creative products |
| Pink/magenta (`pink`, `fuchsia`) | Imagination, youth, boldness | Lifestyle, consumer, youth brands |
| White / light neutrals | Clean, simple, clear | Default light backgrounds |
| Black / dark neutrals | Authority, power, corporate | Pro/luxury surfaces, dark mode |

Background tone sets perceived authority: bright greens/yellows/pinks read young and vibrant; dark blues and near-blacks read corporate and serious. Choose the background family as deliberately as the brand hue.

## Dark Mode

Quick default for small projects: invert the weight ladder — each role swaps to the opposite end of the same scale, preserving the ordered hierarchy instead of inventing new colors.

For real products, prefer a role-based mapping over arithmetic inversion: name semantic roles — `surface.canvas / surface.default / surface.raised`, `text.primary / secondary / muted`, `border.default / strong`, `action.primary` — and assign each role independent light and dark values. Dark mode then becomes a second mapping of the same roles, tuned on its own (dark surfaces usually need lower chroma and compressed elevation steps), not a mirror of light mode. Re-verify contrast per mapping, not once.

- Backgrounds: `dark:bg-neutral-950`, cards `dark:bg-neutral-900`, borders `dark:border-neutral-800`.
- Text: body `dark:text-neutral-100`, secondary `dark:text-neutral-400`, headings `dark:text-neutral-50`.
- Primary: shift solids one step lighter (`dark:bg-primary-500`) — the 600 tuned for white lacks presence on dark; hover now lightens (`dark:hover:bg-primary-400`) because the darken-on-hover rule inverts with the ladder. This works for cool and mid hues; warm hues need the escape hatch below.
- **Escape hatch — when a hue can't carry the action** [PRINCIPLE]: a solid action button must satisfy two constraints at once — its label ≥4.5:1 against the fill, and the fill ≥3:1 against the page behind it. Warm, low-lightness hues (red, crimson, orange) on dark canvases often cannot: white text demands a dark fill, and a dark fill then dissolves into the near-black page. Don't compromise either threshold. Instead, **the action leaves the hue**: use a light neutral fill (bone/`neutral-50`) with dark text for the primary action, and demote the brand hue to a signal role — eyebrows, rules, links, small marks, hover accents — where 4.5:1 as text is achievable. The palette keeps its personality; the button keeps its legibility. Verify with `scripts/contrast-check.mjs`, never by eye.
- Tinted status surfaces invert too: `dark:bg-error-950 dark:text-error-300 dark:border-error-900`.
- Re-verify contrast after inversion; the same 4.5:1 / 3:1 minimums apply.

## Review Checklist

- Every color in the code is a semantic token, not a raw family or hex.
- One primary hue; accents and semantics together stay near the 10% share.
- No pure-saturation hues; emphasis achieved by shade, demotion by tint.
- Warm colors appear only on attention targets; structure stays cool/neutral.
- Body text ≥4.5:1, large text and UI elements ≥3:1, checked in both modes.
- The screen still ranks correctly in grayscale.
