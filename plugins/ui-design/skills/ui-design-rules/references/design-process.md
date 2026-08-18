# Design Process: Styleguide-First Workflow

Defines the order of work for building any UI: wireframe the structure, define a
mini-styleguide as code, build components strictly from those tokens, then grow the
tokens into a design system. Consult this before writing the first styled component
of a project, and whenever a task adds a new screen or component family.

## The Core Rule

Never style ad hoc. The default workflow for any UI task, in order:

1. **Wireframe** — decide what goes where, in grayscale.
2. **Styleguide** — decide the visual rules once, as tokens in code.
3. **Implementation** — build components strictly from those tokens.
4. **Design system** — as the project grows, promote tokens and components into a
   single source of truth.

Each step depends on the previous one — structure first, visual rules second,
high-fidelity polish last — because a layout problem costs minutes to fix in a
wireframe and hours to fix in a styled component.

## Step 1: Wireframe the Structure

Produce a low-fidelity layout of each screen before any styling: where navigation,
headings, text blocks, images, and actions go. In code this means gray-box JSX
(plain divs with placeholder content) or a written region map in the plan. Purpose:
catch placement and usability flaws early, and confirm every user task has visual
support, one problem at a time.

Wireframe rules:

- Work in shades of gray plus at most one primary and one accent color, reserved
  for the actions that must pop — early color only marks priority.
- Use placeholder boxes and dummy text, because real copy and imagery distract
  from judging structure.
- Keep element sizes proportional to real importance — establishing hierarchy is
  the wireframe's main job, and size is its main tool.
- Encode emphasis with gray value: on a dark background a lighter gray reads as
  more important; on a light background the darker gray does.
- Make every element recognizable to a non-technical viewer — a button must read
  as a button, an input as an input. Strip each element down until removing
  anything more would make it unrecognizable.

Minimal version (small project): a bulleted region list per screen (header, hero,
actions, content, footer) with one line on what each region holds.

Done when: every task the screen supports has a place, and the intended hierarchy
is readable from size and gray value alone.

## Step 2: Define the Mini-Styleguide (Before Styling Anything)

Produce the project's visual rules as named tokens before the first styled
component exists — a styleguide is to design what code conventions are to
developers: it makes every later decision referential instead of ad hoc, so all
screens speak one visual language.

Source the choices through the cascade defined in SKILL.md: existing project
system → explicit user instructions → quick intake (brand color, typography,
light/dark) → skill defaults. Only then encode them as tokens.

A minimal styleguide defines four things:

- **Color slots** — primary (brand and main actions), accent (success, warning,
  error), and one neutral ramp (backgrounds, borders, dividers, text shades).
  Cap brand colors at three.
- **Type roles** — one font family and a fixed set of roles (h1, h2, body, small),
  each with size, weight, and color; never style text outside a role.
- **Spacing scale** — one progressive scale for all margin, padding, and gaps;
  the smallest steps exist for tight pairs like label-to-input.
- **Shape tokens** — one radius per component class, one or two shadows.

Express it as code:

```js
// tailwind.config.js — the entire styleguide of a small project
const colors = require('tailwindcss/colors');
theme: {
  extend: {
    colors: {
      primary: colors.indigo,  // brand family — swap per product psychology
      neutral: colors.slate,   // one neutral ramp: backgrounds, borders, text
      accent:  colors.amber,   // optional; keep ≤10% of any screen
      success: colors.green, warning: colors.amber,
      error: colors.red, info: colors.sky,
    },
    fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    borderRadius: { control: '0.5rem', card: '0.75rem' },
    boxShadow: { card: '0 1px 3px 0 rgb(0 0 0 / 0.10)' },
  },
}
```

```jsx
// Type roles + spacing contract, referenced by every component.
export const type = {
  h1:    'text-3xl font-bold text-neutral-900',
  h2:    'text-xl font-semibold text-neutral-900',
  body:  'text-base leading-relaxed text-neutral-600',
  small: 'text-sm text-neutral-500',
};
// Spacing: use only Tailwind steps 1 2 3 4 6 8 12 16 24 (4–96px).
// Arbitrary values — text-[15px], p-[13px], raw hex in JSX — are violations.
```

Version note: `theme.extend` in `tailwind.config` is Tailwind v3 syntax (used by
the `cdn.tailwindcss.com` play CDN). Tailwind v4 declares the same tokens in CSS:
`@theme { --color-primary-600: oklch(...); }`. Detect which version the project
uses before wiring tokens — a v3 config in a v4 build silently no-ops and every
slot class resolves to nothing (verify by rendering, not by assumption).

Use progressive size steps and never intermediates (14, 16, 18, 20 — never 15);
Tailwind's built-in type and spacing scales already are progressive, so the
styleguide's job is restriction: pick the subset and forbid values outside it,
because one-off intermediate values are how a UI drifts inconsistent. CSS custom
properties or a constants file work equally well when no Tailwind config exists.

Minimal version: the two blocks above, retuned to the brand — about twenty lines.

Done when: every color, size, and spacing question in the upcoming build can be
answered by pointing at a token.

## Step 3: Implement in Brand Order

Build the styleguide's concrete assets in this order — each layer constrains the
next, so working backwards forces rework:

1. **Brand mark** — render the logo or app name as one component with fixed sizes
   and light/dark variants; never stretch, recolor, condense, or realign it per
   page, because an unstable mark reads as a different product.
2. **Color palette** — wire the color tokens into the config and give every color
   a job: action, status, surface, divider, or text. A color without a role is
   decoration; cut it.
3. **Typography** — apply the type roles everywhere. Default one font family, two
   at most, because each extra family adds visual noise. Tune line-height and
   letter-spacing against long real paragraphs, not single lines, since
   readability only shows at volume.
4. **Imagery and iconography** — pick exactly one icon set with fixed rendered
   sizes (default 16/20/24px) and one stroke style. Write a one-line placement
   rule (default: outline icons for navigation, solid icons inside forms and next
   to text) and one consistent treatment for photos and illustrations, so mixed
   sources still read as one brand.
5. **UI elements** — build buttons, inputs, links, cards, nav, alerts, and modals
   strictly from the tokens above. Ship every interactive component with all its
   states styled — default, hover, focus, disabled, loading, plus success, error,
   and warning for inputs — because a component without states is half-built.
   Compose larger components (a pricing card) from smaller finished ones (heading,
   list, button) instead of restyling from scratch.

Minimal version: a text wordmark instead of a logo, and five components — Button,
Input, Card, page shell, plus the type roles — cover most small apps.

Done when: component code contains zero raw hex values and zero arbitrary pixel
values — every visual property traces back to a token or role.

## Step 4: Grow It Into a Design System

Once the project passes a handful of screens, promote the styleguide and component
folder into the single source of truth: tokens, type roles, icon rules, components
with variant props, and page templates in one place, with pages assembled from
them — the payoff is consistency, speed, and scale as the product grows.

- **A token change and its MASTER.md entry are one operation, not two** [PRINCIPLE]. Fixing a value in the config while leaving the contract stale makes the document lie, and the next session — human or agent — trusts the lie. When verification forces a token to move (a contrast failure, a size bump), update the table and add a deviations-log line in the same edit, with the measured number that forced it.
- Change at the source, never at the instance: restyle a button by editing its
  base variant so the change propagates everywhere — scattered per-page overrides
  are exactly the inconsistency the system exists to prevent.
- Encode variants as component props (size, tone, state), not copied class
  strings, so new pages compose instead of re-deciding.
- A full design system covers branding rules, layout and grid rules, typography,
  color, iconography, interaction behavior, components, and page templates. Add
  each section when the project first needs it, not before.
- Default for small teams: adopt an established Tailwind-based component library
  (e.g. Flowbite, shadcn/ui) and re-token it to the brand — colors, fonts, radii,
  shadows — instead of building from scratch, because mature systems take teams
  years and libraries carry accessibility and contrast practice for free. Build
  custom only when the UI itself is the product's differentiator.

Minimal version: the config file plus a components folder already counts as the
design system, as long as pages import from it instead of restyling.

Done when: a new page can be assembled from existing tokens, components, and
templates without making a single new visual decision.

## Persist the System (design-system/MASTER.md)

After the styleguide exists, write it into the project so future sessions inherit decisions instead of re-making them — visual drift between page one and page five is what this prevents:

```
design-system/
├── MASTER.md    ← source of truth: intent, direction, tokens, deviations
└── pages/       ← optional per-surface overrides (marketing.md, app-shell.md)
```

MASTER.md contains, in order: the intent brief (design-intent.md), the chosen visual direction and one line on why, the token schema (color slots × steps, type roles, spacing subset, shape/elevation/motion budget), a deviations log (what · where · why, one line each), and the **state of verification**: which checks last ran, what they returned, and on what date. Without the date the next session cannot tell whether the numbers still describe the code or three changes' worth of history, and it will either re-run everything or trust a stale pass. Keep it under ~80 lines — it is a contract, not documentation.

- The styleguide cascade reads MASTER.md first: it carries the WHY (intent, direction) while `tailwind.config`/`@theme` stays the runtime truth for values. If they disagree, flag the drift — never silently pick a side.
- Change at the source: update MASTER.md and tokens together, log the change. Per-surface overrides only for genuinely different surfaces, and they still reference master tokens.

## Guardrails

- Tokens before pixels: if no styleguide exists yet, creating one is the first
  task of any UI request — never "just style this one screen".
- One source of truth: when a new design choice conflicts with the styleguide,
  either follow the styleguide or change it deliberately at the source.
- Record deviations as tokens: bending a rule is fine when intentional and
  consistent — add a new token or variant, never an inline exception.
- Know the rule before breaking it: defaults here are starting points; adapt them
  to the product only once their purpose is understood.
