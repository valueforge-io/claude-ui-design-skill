# Interaction Models

Keyboard models, focus management, and state machines for interactive components.
Consult when building or reviewing anything the user operates — opens, selects, toggles, submits. Visual recipes live in components.md; this file defines how components BEHAVE. Semantics and keyboard come before cosmetics: a beautiful dialog that loses focus on close is broken, not unpolished.

## Ground rules

- Native element first [PRINCIPLE]: `<button>`, `<a href>`, `<input>`, `<select>`, `<details>`, `<dialog>` ship keyboard behavior, focus, and semantics for free. A `div` with `onClick` re-implements all of it, badly. Reach for ARIA roles only when no native element fits — and then implement the full keyboard model that role promises.
- Everything a pointer can do, a keyboard can do [STANDARD]. No hover-only affordances: whatever hover reveals must also be reachable by focus.
- Tab reaches widgets; arrows move within them [PRINCIPLE]. Tab/Shift+Tab jump between controls; arrow keys navigate inside composite widgets (menus, tab lists, radio groups) — one Tab stop per composite widget, roving focus (`tabindex="-1"` on members) inside.
- Never use `tabindex` greater than 0. `0` joins the natural order, `-1` enables programmatic focus. Positive values fork the tab order from the reading order and always end in tears.
- Focus is state — manage it: every open, close, and removal decides where focus goes next. Focus must never land on `<body>` or vanish into a removed node.
- Enter and Space activate buttons; Enter submits the focused form; Escape closes the nearest dismissible layer without side effects.

## The state matrix

Decide explicitly which of these states each component needs, then style and announce every one it has — a missing state is a missing feature, not missing polish:

`default · hover · focus-visible · active/pressed · selected/checked · expanded/collapsed · disabled · read-only · loading/busy · invalid · success · dragging`

- Not every component has every state: a divider has none, a button has ~6, a combobox ~9. The decision is the deliverable.
- States are announced, not just painted: disabled → `disabled` (or `aria-disabled` when focus should remain), expanded → `aria-expanded`, selected → `aria-selected`/`aria-checked`, busy → `aria-busy`, invalid → `aria-invalid` plus visible text.
- State changes move color/fill/shadow only, never geometry (components.md).

## Pattern models

For each: keys, focus behavior, states, common failures.

### Dialog / modal

- Open: focus moves into the dialog — first sensible control, or the labelled dialog container. Never leave focus behind the overlay.
- While open: Tab cycles inside only; the background is inert (`inert` attribute, or `aria-hidden` plus nothing tabbable).
- Escape closes. Closing returns focus to the element that opened it [PRINCIPLE] — the single most-forgotten rule in custom dialogs.
- Prefer native `<dialog>` with `showModal()`: trap, Escape, and `::backdrop` come free.
- States: closed, open, busy (async confirm: disable actions, show progress).
- Failures: focus dumped on `<body>` after close; hand-rolled traps that fight screen readers (use `inert` instead); stacked dialogs (avoid; if unavoidable, Escape closes only the topmost).

### Menu / dropdown (action menu)

- Trigger: Enter, Space, or ArrowDown opens and focuses the first item; ArrowUp opens focusing the last.
- Open: ArrowUp/Down move (roving focus), Home/End jump, typing jumps to matching item, Enter activates, Escape closes and returns focus to the trigger. Tab closes the menu and moves on — the whole menu is one Tab stop.
- Wiring: trigger `aria-haspopup="menu"` + `aria-expanded`; list `role="menu"`; items `role="menuitem"` with `tabindex="-1"`.
- Failure: a "menu" of navigation links. That's a disclosure pattern (button + `aria-expanded` + plain list of links), which is simpler and correct — reserve `role="menu"` for command menus.

### Select / combobox

- Closed: ArrowDown/Up opens; typing filters (editable combobox) or jumps (select-only).
- Open: arrows move the highlight, Enter selects and closes, Escape closes without selecting; highlight tracked via `aria-activedescendant` (input keeps DOM focus).
- States: closed, open, highlighted option, selected option, empty results, loading, invalid.
- Failures: filter resets highlight to nothing (always highlight the first result); typed text lost on blur; no visible "No matches for 'x'" state.
- Native `<select>` covers the select-only case — use it unless custom option rendering is genuinely required.

### Tabs

- One Tab stop — the active tab. ArrowLeft/Right move between tabs (Home/End to the ends); inactive tabs carry `tabindex="-1"`.
- Activate on focus (automatic) when panel switches are cheap; require Enter/Space (manual) when switching loads data.
- Wiring: `role="tablist"` / `tab` / `tabpanel`, `aria-selected` on the active tab, panel labelled by its tab.
- After the tab list, Tab enters the active panel — never the next tab.

### Accordion

- Each header is a real `<button>` inside a heading element; Enter/Space toggles; `aria-expanded` on the button; panel labelled by its header.
- Tab moves between headers — each is its own stop (unlike tabs).
- Failure: only the caret is clickable; the whole header row must toggle (components.md).

### Checkbox / radio group

- Checkbox: Space toggles; every checkbox is its own Tab stop; indeterminate is a real state (`el.indeterminate`) for parents of partial selections.
- Radio group: one Tab stop for the whole group; arrows move selection between options (selection follows focus); the group carries a label (`fieldset`+`legend`, or `role="radiogroup"` with a label).
- Failures: radios as individual Tab stops; custom controls that swallow Space; groups with no group label.

### Toggle / switch

- Space toggles; `role="switch"` + `aria-checked` (or a real checkbox under the hood).
- The label states the affirmative ("Show average price") — the switch shows on/off; the label must read the same in both states.
- Applies immediately — no Save step; if it needs one, it's a checkbox (components.md).

### Toast

- Never steals focus [PRINCIPLE]. Announce via `role="status"` (polite); `role="alert"` only for errors.
- An action inside a toast ("Undo") must also exist somewhere persistent — a control that evaporates in 5 seconds is not a keyboard path. Pause the dismiss timer on hover and on focus.
- Toasts aren't focused layers, so global Escape doesn't close them — keep the close button.

### Table (interactive rows)

- Row actions are real buttons inside the row, reachable by Tab; whole-row click is an enhancement, never the only path.
- Selection: header checkbox selects all (indeterminate when partial); selection count announced near the table (`role="status"`).
- Sort controls are buttons in `<th>` with `aria-sort` reflecting the current order.

## Verification

- Walk the page with Tab only: everything interactive reachable, a visible indicator at every stop, order follows reading order, no traps outside modal layers.
- Open every layer (menu, dialog, combobox): Escape closes it and focus returns to the trigger.
- `node scripts/interaction-check.mjs <page>` automates the static half — reachability, focus visibility, positive tabindex, fake buttons, target sizes. The dynamic half (Escape, arrows, trap behavior) is a two-minute manual walk.
