# Accessibility

The floor under everything else in this skill: aesthetics never outrank access [PRINCIPLE].
Consult when building forms, touch surfaces, or dense UIs, and during every review. Contrast rules live in color.md, keyboard and focus models in interaction.md — this file covers the rest of the floor.

## Semantic HTML is the baseline [STANDARD]

- Native elements before ARIA; ARIA only fills genuine gaps. Links navigate (`<a href>`), buttons act (`<button>`) — never the reverse.
- Landmarks structure the page: `header`, `nav`, `main` (exactly one), `footer`; headings follow the outline without skipping levels (typography.md).
- Every image has `alt` (empty `alt=""` when decorative); every icon-only control has an accessible name (`aria-label`).

## Target size — three tiers

- [STANDARD] Compliance floor: pointer targets ≥ **24×24 CSS px** (WCAG 2.2), with recognized exceptions — inline links in prose, native browser controls, and targets spaced ≥24px from every neighbor.
- [DEFAULT] Comfortable touch: ~**44×44px** for primary touch controls — on mobile-first surfaces pad controls up (`h-11`/`h-12`, generous `p-`), don't shrink the icon, grow the hit area.
- Deliberate exception: dense pointer-first UIs (data grids, toolbars) may draw smaller visuals when the *hit area* (padding or pseudo-element) still meets the floor and spacing prevents mis-clicks. Record it as a deviation.
- The skill's `h-10` (40px) control default sits between the tiers: fine for desktop, pad to ≥44px on touch.

## Focus visibility [STANDARD]

- Every interactive element shows a visible focus indicator: ≥3:1 against adjacent colors, at least as visible as the house ring (`focus-visible:ring-2`), and not obscured by sticky headers, toasts, or overlays (`scroll-mt-24` under sticky bars helps).
- Never `outline: none` without an equally visible replacement — and prefer removing that CSS entirely.

## Forms

- Every field has a real `<label>`; placeholder is an example, never the label (components.md).
- Errors are identified in text next to the field, wired via `aria-describedby`, `aria-invalid` on the control; color alone never carries the error [STANDARD].
- Required is marked in the label text, not by color or a bare asterisk alone; format instructions appear before input, not only after failure.
- Redundant entry [STANDARD, WCAG 2.2]: never make the user re-type what the flow already knows — prefill, autofill, "same as shipping".
- Accessible authentication [STANDARD, WCAG 2.2]: no cognitive puzzle as the only path — allow paste in password fields, support password managers and autofill.
- Consistent help [STANDARD, WCAG 2.2]: help and contact mechanisms sit in the same place on every page.

## Zoom, reflow, and text spacing

- The layout survives 200% zoom with no horizontal scrolling — content reflows at 320 CSS px width [STANDARD]; text-heavy views should stay usable at 400%.
- Content survives user text-spacing overrides (line-height 1.5×, paragraph spacing 2×, letter 0.12em, word 0.16em) [STANDARD] — never hard-fix container heights around text; let text size the box.
- Long translations and RTL: labels wrap without breaking layout; avoid fixed-width buttons; test one 40%-longer language if the product localizes.

## Motion & vestibular safety

- Respect `prefers-reduced-motion` [STANDARD]: gate non-essential animation behind it — in Tailwind, pair `motion-safe:` for decoration and `motion-reduce:` fallbacks for anything that must remain.
- Nothing flashes more than three times per second [STANDARD].
- Dragging alternatives [STANDARD, WCAG 2.2]: every drag interaction (reorder, kanban, sliders) has a single-pointer, non-drag path — move buttons, a "move to…" menu, or direct numeric input — which is also the keyboard path.

## Announcements

- Async outcomes announce themselves: `role="status"` for progress and success, `role="alert"` sparingly for errors, `aria-busy` on regions while loading.
- SPA route changes update the document title and announce the new page.

## Review quick list

Tab walk clean (interaction.md) · accessible names on all controls · labels on all fields · errors in text, not color · targets ≥24px (≥44 touch) · 200% zoom without horizontal scroll · reduced-motion respected · contrast per color.md [STANDARD].
