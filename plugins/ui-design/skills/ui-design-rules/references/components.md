# Component Rules

Per-component design rules for React + Tailwind: anatomy, states, sizing, and a one-line class recipe for 25 components.
Consult when building or reviewing any individual UI component. Spacing follows the 4-point scale (see spacing-layout.md); color names like `primary-600` or `success-100` are palette slots — resolve them from the project palette; text classes map to the project type roles.

## Contents

[Buttons](#buttons) · [Borders](#borders) · [Shadows](#shadows) · [Icons](#icons) · [Labels](#labels) · [Dividers](#dividers) ·
[Forms](#forms) · [Inputs](#inputs) · [Checkbox](#checkbox) · [Radio](#radio) · [Textarea](#textarea) · [Toggle](#toggle) · [Dropdowns](#dropdowns) · [Submit buttons](#submit-buttons) ·
[Badges](#badges) · [Toasts](#toasts) · [Breadcrumbs](#breadcrumbs) · [Tables](#tables) · [Lists](#lists) · [Tooltips](#tooltips) ·
[Cards](#cards) · [Accordions](#accordions) · [Tabs](#tabs) · [Iconography](#iconography) · [Avatars](#avatars)

## Cross-component defaults

Apply these to every component before reading its specific block:

- **Consistency beats style:** design every component — small button or large table — with the same care, and give identical components identical spacing, radius, and treatment everywhere.
- **Control height:** interactive form controls share `h-10` (40px) by default so inputs, dropdowns, and buttons line up on one row; compact `h-8`, large `h-12`.
- **Radius:** one radius token across buttons, inputs, and containers (default `rounded-lg`); inner elements always use a smaller radius than their container.
- **Focus [STANDARD]:** a clearly visible focus indicator on everything interactive. `focus-visible:ring-2` is the house default; CSS `outline` is equally valid — outline never affects layout (only added borders do). Whatever the technique: visible at every stop, ≥3:1 against adjacent colors, not obscured by neighboring elements.
- **Disabled:** `disabled:opacity-50 disabled:pointer-events-none` — present but visibly inert.
- **Four checks per component:** usability (easy to use), aesthetics (looks like the rest of the system), functionality (works as expected), accessibility (usable by everyone).

## Component states

Every interactive component needs visible default, hover, focus, and disabled states, and form fields add valid/invalid — feedback states are semantics, not decoration.

- Encode state with color, fill, shadow, or helper text only; keep geometry (size, border width, position) stable so nothing jumps.
- Keep hover/focus shifts modest — a 5–15% tint or shade step — because dramatic flips disorient.
- Pair every color-coded state with text (helper line, label, message) so meaning survives without color.

## Buttons

- **Anatomy:** container + label, optional leading icon. Three priority tiers; visual weight must match action priority.
- **Tiers:** primary = filled `bg-primary-600`, one per view because competing primaries dilute the main action; secondary = subtle tinted background for alternative actions; tertiary = outline or bare text for passive actions.
- **States:** hover darkens the fill one step or adds a light shadow; focus shows a clearly visible indicator (ring or outline); disabled drops to ~50% opacity.
- **Sizing:** padding ratio 2:1 horizontal:vertical; label `text-sm` minimum — smaller text is hard to read and hit; scale padding together with font size (em ratios) so variants stay proportional.
- **Recipe:** `px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-2 disabled:opacity-50`; secondary: `bg-primary-50 text-primary-700`; tertiary: `text-primary-700 hover:underline`.

## Borders

- **Purpose:** separate information — active nav items, focused inputs, section boundaries — never decoration.
- **Default:** none. When in doubt leave the border off; one line beats a boxed frame, and shadows or spacing often replace borders entirely.
- **Contrast:** keep borders low-contrast (reduced opacity or a light neutral) so attention stays on content, not the frame.
- **Radius:** pick one radius and apply it to buttons, inputs, and containers alike for a consistent aesthetic.
- **Do/Don't:** DO use `border-b-2` to mark the active item in a nav. DON'T box every element — the more borders, the more overwhelming the UI.
- **Recipe:** `border border-neutral-200` when needed; stacked content: `divide-y divide-neutral-200`; active nav item: `border-b-2 border-primary-600`.

## Shadows

- **Purpose:** depth and attention — hover cues on actions, active forms, layering overlapped elements, separating sections. Darker + larger shadow = higher elevation.
- **Default:** subtle, ~15% black with a Y offset; drop the border when a shadow already outlines the element.
- **Ladder:** none → `0 5px 10px rgba(0,0,0,0.15)` → `0 7.5px 15px 5px rgba(0,0,0,0.45)`; reserve the heavy step for the topmost layer.
- **Do/Don't:** DO apply shadows gradually and minimally. DON'T use full-opacity shadows or shadow + border together — harsh edges read as clutter.
- **Recipe:** `shadow-[0_5px_10px_rgba(0,0,0,0.15)]` resting, `hover:shadow-lg` for lift; no `border` on shadowed elements.

## Icons

- **Purpose:** visual shorthand on buttons, labels, and inputs — add one only where the user's attention is wanted, because every extra icon competes with content.
- **Pairing:** match the icon size to its text (18px text = 18px icon), same color as the text, center-aligned, spaced ~1em away (`gap-2`–`gap-3`).
- **Consistency:** one size and style per context; give icons to all inputs in a form or to none; skip the icon on buttons when the screen already carries several.
- **Icon-only:** allowed for universal symbols; otherwise keep the text label.
- **Recipe:** `inline-flex items-center gap-2` with icon `size-[1.25em] shrink-0` — em sizing keeps the icon tracking the font size.

## Labels

- **Purpose:** feedback messages — error, success, information — hidden until the state exists, then shown next to the element they concern.
- **Placement:** info labels go above the content they introduce so they are read first; error/warning labels go directly below the failing element so it holds its position while content beneath shifts down.
- **Color:** the slot encodes the meaning (error / success / info); pair the color with a message that says what happened and what to do next.
- **Do/Don't:** DO default to more information rather than less. DON'T park messages at the top or bottom of the page away from their element.
- **Recipe:** `flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-error-50 text-error-700` (swap slots for success/info).

## Dividers

- **Forms:** pick the lightest that works — negative space → single line → background color block → shadow.
- **Single line:** 1px at reduced opacity so it separates without stealing focus.
- **Space as divider:** double or triple the standard gap to split groups (16px within a group → 32–48px between groups).
- **Do/Don't:** DO divide clustered grouped content and add extra spacing around the divider itself. DON'T add a divider when nothing follows it.
- **Recipe:** `<hr class="my-6 border-neutral-200" />`; color-block grouping: alternate `bg-neutral-50` sections; space-only: `mt-8` on the next group.

## Forms

- **Anatomy:** a coordinated system of inputs, checkboxes, radios, textareas, button groups, and a submit — style them as one family that matches the site.
- **Structure first:** clear labels and grouped sections improve a form more than any styling or color, so organize before decorating.
- **Grouping:** cluster related fields under a short group heading (e.g. account details vs. login details); a single column of fields is the default.
- **Do/Don't:** DO use labels and space to make each field easy to find. DON'T run many inputs in an unbroken sequence — it overwhelms and kills completion.
- **Recipe:** `<form class="max-w-md space-y-8">` → each group `space-y-4` under a group-heading role.

## Inputs

- **Anatomy:** label above, field, helper text below — combine all three; the placeholder is an example, never the label.
- **States:** default, focus, disabled, valid, invalid — encode state via border/fill/helper changes only; never change geometry (a 2px border that shifts layout).
- **Style:** prefer a background one shade darker than the page over a border; deepen it 5–15% on hover and again on focus — dramatic flips (white → black) disorient. Focus indicator via `focus:ring-2` (house default) or an equally visible outline.
- **Validation:** tint border or background with the error/success slot and show the matching label text beneath.
- **Placeholder:** ~50% opacity so it reads as passive and can't be confused with a typed value.
- **Sizing:** heights 32/40/48px (`h-8`/`h-10`/`h-12`, default `h-10`), horizontal padding 16px (`px-4`); label → field 8px, field → helper 4px; width proportional to expected content (a ZIP field stays short) so users keep track of what's asked.
- **Do/Don't:** DO keep inputs visually distinct from buttons. DON'T use strong fills or heavy borders that make an input look clickable.
- **Recipe:** `h-10 w-full rounded-lg bg-neutral-100 px-4 text-sm placeholder:text-neutral-400 hover:bg-neutral-200/70 focus:ring-2 focus:ring-primary-500 disabled:opacity-50` + label `mb-2 block text-sm font-medium` + helper `mt-1 text-xs text-neutral-500`.

## Checkbox

- **Anatomy:** group label, box, item label — wrap the label around the control so the entire row is clickable.
- **States:** unchecked (default), checked, indeterminate — indeterminate for a parent whose children are partially selected.
- **Copy:** phrase positively ("Turn on notifications", never "enable to turn off"), capitalize the first word, no trailing periods, one checkbox per line.
- **Sizing:** 16px box (`size-4`), 8px gap to label, `text-sm`; on mobile grow to 24px box and `text-base` for touch.
- **Upgrade:** convert to check tokens (selectable chips) when you need bigger hit targets and a clearer cue.
- **Recipe:** `<label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 rounded accent-primary-600" /> Label</label>` in a `space-y-2` group under a group label.

## Radio

- **Anatomy:** group label, circular input, item label — label wraps the input as the click target; wrapped text sits beneath itself with control and label top-aligned.
- **Use when:** one choice among 5 or fewer mutually exclusive options — radios expose options a dropdown hides; preselect the most common option.
- **States:** selected / unselected; capitalize labels; avoid negative or near-duplicate phrasings.
- **Sizing:** 20px input (`size-5`), 8px gap to label, 8px between options; mobile 24px + `text-base`.
- **Recipe:** `<label class="flex items-start gap-2 text-sm"><input type="radio" class="size-5 accent-primary-600" /> Label</label>` in a `space-y-2` group.

## Textarea

- **Anatomy:** label, character indicator (top-right of the label row), multi-line field, help text.
- **States:** focus, disabled, valid, invalid — same treatment as inputs.
- **Counter:** empty → "Maximum N characters"; while typing → remaining count; over limit → error border plus the excess text colored.
- **Sizing:** ~100px tall (about 4 rows), 16px horizontal padding, label → field 8px, field → helper 4px; size it to the expected answer — too small blocks the reply, too large intimidates.
- **Do/Don't:** DO reserve textareas for long-form text. DON'T use one for single values, stretch it full page width on desktop, or rely on placeholder-as-label.
- **Recipe:** `min-h-[100px] w-full rounded-lg bg-neutral-100 p-4 text-sm focus:ring-2` + label row `flex items-center justify-between text-sm` with counter `text-xs text-neutral-500`.

## Toggle

- **Anatomy:** short label + switch; the switch alone shows state.
- **Behavior:** applies immediately — a toggle must never need a Save/Submit; if it does, use a checkbox.
- **Copy:** direct affirmative labels ("Show average price"); no questions, no "On/Off" text beside or inside the control — extra state text clutters and confuses decoding.
- **States:** on = high-contrast `bg-primary-600` fill, off = neutral; the color jump is what signals the change.
- **Sizing:** 48×24px track with an 18px thumb, 8px gap to label, `text-sm`; mobile 48×26px track, 22px thumb, `text-base`.
- **Recipe:** `relative h-6 w-12 rounded-full bg-neutral-300 transition-colors data-[checked]:bg-primary-600` + thumb `size-[18px] rounded-full bg-white shadow`.

## Dropdowns

- **Anatomy:** label, container, placeholder, chevron; open state adds menu, options, divider, scrollbar; error state adds feedback text below.
- **Use when:** 5+ options (fewer → radio group); order options alphabetically or by another obvious logic; cut options that only add cognitive load.
- **Placeholder:** a generic "Select…" / "Choose a country" with nothing preselected, so users can't submit a value they never chose.
- **Long lists:** add type-ahead so users filter instead of scrolling.
- **Sizing:** 40px trigger (`h-10`) and 40px menu rows, 16px horizontal padding, label 8px above, error text 4px below, 1px dividers in the menu.
- **Recipe:** trigger `h-10 w-full rounded-lg bg-neutral-100 px-4 text-left text-sm focus:ring-2` + menu `mt-1 max-h-60 overflow-auto rounded-lg bg-white shadow-lg` + option `flex h-10 items-center px-4 hover:bg-neutral-100`.

## Submit buttons

- **Anatomy:** primary button + a label naming the exact outcome.
- **Copy:** "Create Account", "Place order" — never technical "Submit", never all caps (hurts readability), never redundant words ("Create new account").
- **Placement:** bottom-left of the form where the eye comes to rest; secondary action first, primary last so reading ends on the primary; keep the two visually distinct tiers.
- **Feedback:** on click, swap in a spinner — always show submission progress.
- **Sizing:** same 2:1 padding ratio as buttons.
- **Recipe:** `flex gap-3` → tertiary `Cancel` + `px-4 py-2 rounded-lg bg-primary-600 text-sm font-medium text-white disabled:opacity-50` (`aria-busy` spinner state while submitting).

## Badges

- **Anatomy:** container, label, optional icon; purely informative — never interactive.
- **Semantics:** positive = success slot ("Approved", "Licensed"); negative = error slot ("Rejected", "Failed"); informative = info slot ("Live", "Active") — wrong slot/label pairs mislead.
- **Copy:** one capitalized word (two only for compound states like "Partially shipped"); no all-caps.
- **Placement:** tight to the object it describes; keep badges smaller than buttons so they can't be mistaken for actions; a number-only badge works as a counter inside buttons or on avatars.
- **Sizing:** small (default) `px-2 py-0.5 text-xs`; medium `px-2.5 py-1 text-sm` when it must rank higher on the page.
- **Recipe:** `inline-flex items-center gap-1 rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-700`.

## Toasts

- **Anatomy:** icon (type at a glance), title, message, optional inline action link, optional timestamp, close button.
- **Behavior:** auto-dismiss after 5 seconds and always closeable sooner; show at most two at once, fading the oldest out; after creating a resource, include a CTA to it ("View product").
- **Use for:** feedback on operations and system status only — not form validation (inline labels own that), not marketing, never permanent UI.
- **Content:** short title + one-line message; on failure include the next step to resolve it.
- **Sizing:** `p-4` padding, 20px icon (`size-5`), title `text-sm font-medium`, message `text-xs`; width fits content.
- **Recipe:** `flex w-96 items-start gap-3 rounded-lg bg-white p-4 shadow-[0_5px_10px_rgba(0,0,0,0.15)]` + close `ml-auto size-5 text-neutral-400 hover:text-neutral-600`.

## Breadcrumbs

- **Anatomy:** page links + separator — separator is "/" or ">" only, because anything else breaks the learned pattern.
- **Use when:** the hierarchy is 2+ levels deep; breadcrumbs are secondary navigation — never a replacement for the global or section nav; skip them on flat sites.
- **Copy:** one short word per crumb so the destination is predictable; style links as links; the current page is the last item and not a link.
- **Mobile:** collapse to the parent level only ("< Category name").
- **Sizing:** one step smaller than the main nav (main 18px → crumbs 14px) so it takes less priority; 8px around separators.
- **Recipe:** `flex items-center gap-2 text-sm text-neutral-500` + link `hover:text-neutral-800 hover:underline` + current `font-medium text-neutral-900`.

## Tables

- **Anatomy:** search, header row, sort controls, row checkboxes, columns, rows, pagination.
- **Text:** header `font-medium` at full contrast, body rows same color at ~60% — the contrast step separates them without borders; left-align text, right-align numbers; truncate overflow with an ellipsis + tooltip and make columns resizable.
- **Structure:** merge related values into one column; paginate — infinite scroll and "load more" hurt usability; fix the header on vertical scroll and the first column on horizontal scroll; zebra-stripe only large data sets; give hover and selected rows clearly distinct fills; color only significant data.
- **Borders:** rely on padding and row separators, not boxed cell borders — grid lines clutter.
- **Sizing:** 48px rows (`h-12`; compact 32px `h-8`), 16px cell padding (`px-4`), `text-sm`, 48px pagination row.
- **Mobile:** collapse each row into a stacked card carrying only the essential fields.
- **Recipe:** `w-full text-sm` + `th: h-12 px-4 text-left font-medium text-neutral-900` + `td: h-12 px-4 text-neutral-600` + `tr: hover:bg-neutral-50 data-[selected]:bg-primary-50` + zebra `even:bg-neutral-50` for large sets.

## Lists

- **Anatomy:** style indicator (number or bullet), list items, text — every item has text, in one consistent format so the list scans fast.
- **Choose by meaning:** numbers when order, priority, or sequence matters; bullets otherwise; sort alphabetically or by another logical order.
- **Copy:** capitalize each item; indent children one level under their parent — never at the parent's level; indent the list after its lead-in line.
- **Sizing:** `text-sm`, 8px marker-to-text gap, 16px indent per nesting level, items spaced `space-y-1`–`space-y-2`.
- **Recipe:** `list-disc pl-4 space-y-1 text-sm marker:text-neutral-400` (ordered: `list-decimal`); nested list adds `pl-4 mt-1`.

## Tooltips

- **Anatomy:** container + text only — no rich media, no interactive controls inside, never cropped by the viewport.
- **Trigger:** hover, focus, or touch; dismiss after a short duration; position adjacent to its element, with an arrow when several icons sit close together so ownership is unambiguous.
- **Content:** short, non-essential help — never restate the visible label; include the shortcut key when one exists; center-align short text; use tooltips to absorb redundant on-screen text and to explain interactive imagery.
- **Style:** solid dark container with no shadow.
- **Sizing:** max width 208px (`max-w-52`), 16px padding, keep ≥16px from viewport edges; compact hints may drop to `px-3 py-1.5`.
- **Recipe:** `max-w-52 rounded-md bg-neutral-900 p-4 text-xs text-white` (short hints: `px-3 py-1.5 text-center`).

## Cards

- **Anatomy:** container is the only required part; optional thumbnail, header text, subhead, media, supporting text, buttons, icons.
- **Hierarchy:** media → header → supporting text → actions in a single column; header larger than supporting text; left-align text — centered paragraphs are harder to read; use the heading level that fits the page outline.
- **Elevation:** subtle shadow `0 1px 3px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.04)`, never dark shadows; inner elements take a smaller radius than the container; dividers separate card regions or expandable areas.
- **Behavior:** if the card has no explicit CTA button, make the whole card the primary action.
- **Do/Don't:** DO keep content minimal with clear white space between elements. DON'T pack a card with large amounts of information — that's a page.
- **Sizing:** `p-6` padding (cards hold grouped content, so they take the group-level step, not the `p-4` control step); width/height follow content; on wide screens move media to the left and crop only its non-essential parts.
- **Recipe:** `rounded-xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.04)]` with media `rounded-lg` and actions row `mt-4 flex gap-3`.

## Accordions

- **Anatomy:** header (title + caret icon), panel, optional summary text. Caret only — it is the icon users already understand.
- **Behavior:** the whole header toggles (never just the caret); caret sits at the end of the header and rotates when open; allow multiple panels open at once so content stays comparable; don't use an accordion when users need most of the content anyway.
- **Text:** header reads as primary content at full contrast; summary text one step smaller at reduced contrast; header content and caret vertically centered.
- **Buttons:** if the panel has actions, show them at the bottom of the expanded panel.
- **Sizing:** 48px header (`h-12`; 64px `h-16` with a summary line), 16px padding, caret wrapper ≥16px (`size-4`+), equal spacing between stacked accordions.
- **Recipe:** header `flex h-12 w-full items-center justify-between px-4 text-sm font-medium` + caret `size-4 transition-transform data-[open]:rotate-180` + panel `px-4 pb-4 text-sm text-neutral-600`.

## Tabs

- **Anatomy:** container, tab items (text label, optional icon above the label), active tab indicator.
- **Use when:** views are parallel siblings of the same context; never nest tabs inside tabs and never stack tab rows.
- **States:** active = high contrast + `font-semibold` + 2px indicator; inactive = lower contrast, `font-normal`, still readable.
- **Do/Don't:** DO keep text labels and make targets easy to tap, with swipe support on mobile. DON'T replace labels with icons alone.
- **Sizing:** label `text-sm` minimum with 24px line height, icons in a 40×40 wrapper (icon ≤40px), icon and text horizontally centered, 8px icon-to-label gap, 1px container rule under the row.
- **Recipe:** list `flex border-b border-neutral-200` + tab `px-4 py-3 text-sm text-neutral-500 hover:text-neutral-700` + active `-mb-px border-b-2 border-primary-600 font-semibold text-primary-700`.

## Iconography

- **Grid:** design on 24×24; three sizes cover most needs — 20 / 24 / 32px (`size-5`/`size-6`/`size-8`), extend in multiples of 8; complex icons need ≥40px, and large feature icons use an 80×80 grid where extra detail is safe.
- **Styles:** outline icons for primary navigation at 24px, switching to filled when selected; solid icons for buttons, form elements, and supporting text at 20px; one consistent style per set — mixing styles reads as broken.
- **Delivery:** SVG or icon font, never raster images, because rasters don't scale.
- **Touch targets:** ~2× the icon — 24px icon → 48px target on touch screens, 20px → 40px on desktop.
- **Meaning:** don't redraw universally understood symbols; add a text label when possible and a tooltip when the icon stands alone, so meaning never depends on guesswork.
- **Recipe:** nav `size-6`, in-control `size-5`, wrapped in `flex size-12 items-center justify-center` (desktop `size-10`) targets; or `size-[1.5em]` to scale with the parent font size.

## Avatars

- **Types:** image, initials fallback, icon placeholder — use the same representation for a given person everywhere in the app; never gendered placeholder art.
- **Shape:** `rounded-full` (the standard); add a subtle neutral ring so the boundary survives a matching background; keep strong contrast behind initials and icons.
- **Overlays:** status dot bottom-right, notification-count badge top-right, action icon as an attached control, progress ring around the rim for completion states.
- **Images:** provide a crop tool on upload; center the face and keep it clear of the circle's edge.
- **Sizing:** small 24px (`size-6`) for lists, medium 40px (`size-10`) for headers/app bars, large 56px+ (`size-14`+) for profile pages — match size to context, don't oversize.
- **Recipe:** `size-10 rounded-full object-cover ring-1 ring-black/10`; initials: `flex size-10 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700`.
