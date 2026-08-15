# Visual Hierarchy

How to rank elements on a screen so users see them in the intended order. Covers the levers that promote or demote any element (size, weight, color, contrast, proximity, alignment, whitespace), scan-pattern placement, action hierarchy, grouping, consistency, and balance.
Consult this file when laying out any screen with competing elements — heroes, forms, dashboards, pricing — and whenever a build looks flat or everything seems equally important.

## Core principle

- Decide the reading order before styling: what must be seen first, second, last — then make the visuals enforce that order, because users scan pages instead of reading them.
- Prominence is relative: promoting one element demotes its neighbors, and if everything is emphasized nothing is.
- Give each view exactly one dominant focal point, because a clear winner removes friction and hesitation.
- DO keep clear hierarchy between text, images, and actions. DON'T ship a view where two elements tie for first place.

## Scan patterns — where things go [HEURISTIC]

Reading tendencies, not laws — an explicit focal point (size, contrast, isolation) beats pattern position every time; when the levers and the pattern disagree, trust the levers. Users' eyes tend to follow predictable paths; place elements along those paths in order of importance instead of fighting the flow.

Z-pattern — default for landing and marketing pages with sparse content:
- Put the logo top-left (first fixation) and the nav plus a compact CTA top-right.
- Put the headline and lead on the diagonal, and end the pattern on the primary CTA so the scan exits on an action.

F-pattern — default for information-heavy pages and app screens (dashboards, lists, tables, settings):
- Load the top row with the most important content: page title left, primary action top-right.
- Anchor each row with its key label on the left edge, because vertical scanning hugs the left margin.

Override deliberately: a significantly larger element is read first even when it appears later in the flow — use size to pull attention out of document order when the important fact isn't first.

## The seven levers

Alter hierarchy by adjusting these. Change one lever at a time, with the smallest step that works, then re-check the whole screen.

### Size
- Signals: importance and reading order — bigger is scanned first, smaller last.
- Default: hero `text-4xl`–`text-5xl`, lead `text-xl`, section heading `text-lg`, body `text-base`, meta `text-sm`.
- DO keep a visible step between levels (roughly 4x/2x/1x for title/subtitle/body). DON'T size title, subtitle, and body nearly the same — reading order then collapses to accidental position.
- Watch for: several elements sharing the largest size — when three things are biggest, nothing is first.

### Weight
- Signals: emphasis within a size level, and overall "visual mass" without extra footprint.
- Default: `font-bold` page and hero titles, `font-semibold` section headings and button labels, `font-medium` form labels, `font-normal` body.
- DO promote a key phrase by one weight step. DON'T bold whole paragraphs — mass bolding erases the emphasis it borrows.
- Watch for: mixed weights inside one group (e.g. nav links) — members of a group must share one weight or the group breaks apart.

### Color
- Signals: priority and meaning — saturated brand color says "act here", muted grays say "supporting".
- Default: titles `text-neutral-900`, body `text-neutral-600`, meta `text-neutral-400`; one saturated `bg-primary-600` surface per view for the main action; red reserved for destructive.
- DO highlight one word of a headline in the primary color to create a focal point. DON'T give body text the same color and contrast as the title — nothing tells the eye where to start.
- Watch for: accent color spreading — every extra saturated element dilutes the one action that should own it.

### Contrast
- Signals: "this one is different, look here" — works through color, size, surrounding space, or shape; the odd one out wins attention.
- Default: text at 4.5:1 minimum against its background; important text darker, supporting text lighter; emphasized card differs on one clear axis (background, scale, or slight skew on hover).
- DO make the emphasized element differ strongly on a single axis. DON'T pair heavy clashing hues (red on green) — strain without hierarchy, and harder to read.
- Apply contrast to states too: lift a hovered card with a slight scale, skew, or shadow (`hover:scale-[1.02] hover:shadow-md`) — hover states identical to rest hide interactivity.
- Watch for: demoted text falling below 4.5:1 — quieter must still be legible; verify with a WCAG contrast checker.

### Proximity
- Signals: relationship — small gaps mean "same group", large gaps mean "separate topics"; whitespace is the group boundary.
- Default: label to input `gap-1.5`, fields within a group `gap-4`, between groups `gap-8`, between page sections `py-16`–`py-24`.
- DO keep gaps inside a group visibly smaller than gaps between groups (at least ~2x). DON'T space everything evenly — uniform gaps dissolve grouping and camouflage structure.
- Watch for: a gap equal to both its group's internal spacing and the external spacing — membership becomes ambiguous.

### Alignment
- Signals: order and belonging — shared edges form invisible rails the eye rides along while scanning.
- Default: left-align text and content; one shared container per page (`max-w-[1200px] mx-auto px-8`) used by every section.
- DO align related cards to the same top edge. DON'T let one element sit off-grid — a stray edge reads as a mistake, not emphasis.
- Watch for: container width drifting between sections — a hero wider than the nav forces the eye to re-find its anchor on every scroll.

### Whitespace
- Signals: importance through isolation — the more empty space around an element, the more attention it draws.
- Default: card padding `p-6`; content never touches container edges; body `leading-normal`–`leading-relaxed` (about 1.5x font size).
- DO surround the primary CTA with clear space. DON'T crowd elements to fit more in — clutter hides focal points and users refuse to parse it.
- Watch for: so much space around an element that it detaches from its own group and reads as unrelated.

## Action hierarchy: buttons [PRINCIPLE]

One view, one primary action; every other action visibly steps down.

**What "one view" means on a scrolling page**: the unit is the viewport, not the document. A landing page that repeats the *same* action (nav CTA, hero CTA, pricing CTA, closing CTA) has one primary action repeated — that is correct and expected; the repeats may share the primary treatment. What must never happen is two *different* actions competing at primary weight in the same viewport: there, one drops a tier. Practical test: screenshot each viewport-height slice and count solid primaries with different labels — more than one in a slice is the finding.

- Primary (exactly one per view): solid `bg-primary-600 text-white px-4 py-2 rounded-lg font-medium` — the strongest button on the screen; hero CTAs may step up to `px-6 py-3 text-base`.
- Secondary: tinted (`bg-primary-50 text-primary-700 hover:bg-primary-100`) or neutral outline (`border border-neutral-300 text-neutral-700`) or ghost, same or smaller size than the primary.
- Tertiary: link style — `text-primary-600 underline underline-offset-2`, no box.
- Destructive: solid `bg-error-600 text-white` for irreversible actions (e.g. account deletion), paired with a quieter outline/ghost Cancel, because color must warn before the click.
- DO make the primary button in a form larger and stronger than sibling actions (Save beats Add item). DON'T style two adjacent actions identically — equal buttons force users to guess.
- DON'T give a secondary action the primary color, and DON'T recolor primary actions per page — the primary color on a button must always mean "main action here".
- Placement: put the primary action where the scan ends — end of the hero on landing pages, top-right on app list/detail screens, after the fields (right-aligned or full-width) in forms.

## Inputs

- Size inputs by importance: the input feeding the main action is largest (`h-12 text-base` for an email-capture field); secondary inputs like search or filters smaller (`h-9 text-sm`), because equal inputs split focus.
- Keep an input and its submit button adjacent, baseline-aligned, and tightly gapped (`gap-2`) — they are one group and must read as one.

## Text

- Order by size: title first, lead paragraph second, section headings next, body last — the reading order should survive a blur.
- Demote supporting text with lower contrast (`text-neutral-500`/`text-neutral-600`) and smaller size rather than deleting it.
- Promote at most one phrase inside a title via primary color or higher contrast — one focal point per title.
- On dense screens, size beats position: enlarge the key fact (a name, a price, a total) even when other data precedes it in the markup.
- In display contexts only (hero headlines), a single word may break the pattern — a different shape, rotation, or color — to create an emotional focal point; never inside body or UI text.

## Grouping via proximity

- Forms: label directly above its input (`space-y-1.5`); label/input pairs separated by `space-y-4`; titled field groups (e.g. personal vs account info) separated by `space-y-8` with a group heading — grouped forms scan faster and complete more often.
- Cards: pack related content tightly inside (image, title, rating, price, CTA at `gap-2`–`gap-3`) and separate card from card with more (`gap-6`); if internal gaps exceed external ones the card falls apart visually.
- Navigation: keep nav links in one tight cluster and push the logo and the sign-out/CTA away from it (`justify-between` plus margin) so they read as separate groups.
- Sidebars: tight spacing between nav items (`space-y-1`) marks them as one group; extra space isolates the logo above and the log-out below (`mt-auto`), because equal spacing would camouflage all of them as one list.
- Headings belong to the text below them: keep the heading-to-body gap smaller than the gap to the preceding section (`mt-12 mb-4` on section headings).
- DO place labels next to what they describe. DON'T use the same gap between a label and its field as between neighboring fields — association becomes ambiguous.

## Alignment

- Left-align text blocks and form content; reserve centering for short standalone blocks (a subscribe blurb, an empty state), because centered long text is hard to scan.
- Use one content container (max ~1200px wide, at least 30px side padding) and keep every section — nav, hero, features, CTA — on the same container edges; a constant left rail is what makes a page scannable.
- Cards with clearly different heights: align tops (`items-start`). Slightly different heights, like a logo beside nav links: align centers (`items-center`).
- Baseline-align an input row with its button; never let one control float above its partner.
- Treat misalignment as noise: an off-grid element draws the eye like a focal point, so either align it or promote it on purpose.
- DON'T give sibling cards different starting points, and DON'T let the container exceed the screen — both break scanning.

## Consistency

Consistency lets users transfer what they learned on one screen to every other screen; a predictable UI needs no instructions.

- Same role, same style: every primary button, card, and link looks identical across the app — reuse one component instead of restyling per page.
- Colors keep their meaning everywhere: primary means main action, red means destructive or error, green means success — never swap meanings between screens.
- Typography: at most two font families, one for headings and one for everything else; never mix families, weights, or styles within one group such as a nav.
- Icons: one style per set — outline icons for navigation, solid icons for buttons, form elements, and inline support; never mix styles or colors within a set except to mark an active/hover state.
- Copy: keep message templates uniform ("Post saved successfully" / "Category saved successfully", not two unrelated phrasings) — vocabulary is part of the interface.
- Layout: keep the app shell (sidebar, top nav) on every page, because removing it strands users on dead-end pages; follow conventions users already know (sign-in top-right, logo top-left links home).

## Whitespace (negative space)

- Build it deliberately from margin, padding, and line-height/letter-spacing — it is a designed element, not leftover room.
- Body line height ≈1.5x font size (16px text → 24px line height; `leading-normal`–`leading-relaxed`), tighter for large headings.
- Keep line gaps within a paragraph smaller than the gap separating a heading from its body — spacing must mirror the outline structure.
- Never let text or images touch card or container edges; give atomic elements generous padding (`p-6` cards), because cramped edges hurt reading and look broken.
- Separate unrelated page sections with large space (`py-16`–`py-24`) so users can disengage from one topic before the next; related content stays close.
- Keep whitespace identical for repeated instances of the same component — uneven internal spacing makes one component read as two groups.
- More surrounding space promotes an element, but too much isolation detaches it from its own group — promote with space in moderation.
- DO remove unnecessary elements and let the survivors breathe. DON'T compress spacing to squeeze more above the fold.

## Balance and visual weight

- Balance the perceived weight across the screen; weight rises with size (bigger is heavier), color (red and saturated hues heaviest, pale hues lightest), and density (clustered elements make an area heavier).
- Symmetrical layouts feel stable and professional — but repeated on every section they turn monotonous; alternate with asymmetric sections to keep flow.
- Asymmetrical layouts put a dominant element on one side balanced by lesser ones opposite (image left, text right) — use for movement and a modern feel, and alternate sides between sections.
- Radial emphasis centers the recommended option and balances the rest around it — e.g. highlight the middle pricing plan with a distinct background so the choice is instant.
- Color balance ≈60/30/10 [HEURISTIC] — a proportion lens, not arithmetic: dominant neutral 60%, secondary 30%, accent 10%; keep to 2–3 colors total, because more compete and clutter.
- DON'T flood a whole section with saturated color — it steals attention from the CTA inside it; emphasize the action, not the box.
- Balance text against images so neither overpowers: place text over the calm, empty region of an image, never across its busy area; if a text block dwarfs its image, split it into smaller chunks with smaller images.

## Hierarchy debugging

Run this after building any screen:

1. Squint at the screen (or blur a screenshot) and note what pops first, second, third.
2. Compare against the intended order: the primary CTA or key message must win; if the wrong element wins, fix it — don't rationalize.
3. Count focal points: more than about three strong ones means demote until there is one winner and a clear second tier.
4. Check grouping at a glance: if you can't see the groups without reading, shrink in-group gaps or grow between-group gaps.
5. Trace the scan path (F or Z): confirm it passes through the elements that matter, in order.

To promote an element (pick one or two levers, smallest step that works):
- Increase size one step; raise weight; raise contrast (darker text or saturated background); add surrounding whitespace; move it onto the scan path; make its shape differ from its peers.

To demote an element:
- Shrink it one step; lighten it toward gray (`text-neutral-500`); swap solid for outline or ghost; tuck it tighter into its group; move it off the primary scan path.

Re-run the squint test after every change, because each promotion shifts the balance of everything else on the screen.

## Defaults at a glance

| Concern | Default |
|---|---|
| Type scale | hero `text-4xl`–`text-5xl` · lead `text-xl` · section `text-lg` · body `text-base` · meta `text-sm` |
| Text color steps | title `text-neutral-900` · body `text-neutral-600` · meta `text-neutral-400` |
| Primary button | `bg-primary-600 text-white px-4 py-2 rounded-lg font-medium` — exactly one per view |
| Secondary button | tinted `bg-primary-50 text-primary-700`, or neutral outline / ghost |
| Tertiary action | link: `text-primary-600 underline underline-offset-2` |
| Destructive action | `bg-error-600 text-white`, quiet outline/ghost Cancel beside it |
| Label to input | `gap-1.5` |
| Fields within a group | `gap-4` |
| Between field groups | `gap-8` |
| Inside a card / between cards | `gap-2`–`gap-3` / `gap-6` |
| Between page sections | `py-16`–`py-24` |
| Content container | `max-w-[1200px] mx-auto px-8`, identical for every section |
| Body line height | ~1.5x font size (`leading-normal`–`leading-relaxed`) |
| Color proportions | ~60% dominant neutral / 30% secondary / 10% accent, 2–3 colors total |
| Text contrast | 4.5:1 minimum against background |
