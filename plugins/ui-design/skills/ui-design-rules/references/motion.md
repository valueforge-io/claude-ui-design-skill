# Motion

Animation and transitions with a job to do. Consult whenever adding any transition, animation, or loading indicator, and when a direction's motion posture (visual-directions.md) needs translating into values.

## Core principle

Motion explains change before it decorates it [PRINCIPLE]. Every animation answers one question for the user — *what just happened, where did it go, what is the system doing?* If an animation answers nothing, it costs attention and buys nothing: cut it.

## The five jobs of motion

Classify every animation into one of these before writing it — the category sets its budget:

- **Feedback** — confirms an input registered (button press, toggle flip, like). Budget: 100–150 ms, tiny distance, every time.
- **State transition** — shows A becoming B (panel expands, item added to list, tab switches). Budget: 150–250 ms; the change must remain understandable with motion off.
- **Spatial / navigation** — preserves orientation across surfaces (drawer slides in, dialog scales from trigger, page transition). Budget: 200–350 ms; direction must match the spatial model (drawer returns where it came from).
- **Attention** — pulls the eye to one thing (error shake, new-item highlight, badge pulse). Budget: one at a time on screen, runs once or stops after acknowledgment — a looping attention-getter becomes noise [PRINCIPLE].
- **Decorative / storytelling** — brand moments (hero reveals, celebration confetti). Budget: marketing surfaces and empty moments only; never on task-critical paths; always fully removable by reduced-motion.

## Defaults

- Durations [DEFAULT]: feedback 100–150 ms · state 150–250 ms · spatial 200–350 ms. Nothing above 500 ms outside decorative storytelling; a modal that takes 400 ms to open reads as a slow app, not an elegant one.
- Easing [DEFAULT]: entrances `ease-out` (fast start, settle), exits `ease-in`, on-screen moves `ease-in-out`; springy overshoot only where the direction's personality is playful.
- Animate only `transform` and `opacity` [DEFAULT] — they run on the compositor. Animating layout properties (width, height, top, margin) janks; when size must change, prefer scale or clip tricks, or accept an instant change.
- Small distances: slides of 4–8 px read as refined; long travels read as theatrical. Scale-in from 0.95, not from 0.
- Avoid `transition-all` — name the properties (`transition-[transform,opacity]` or `transition-colors`); `all` catches layout properties by accident and hides intent.
- Enter fast, exit faster: dismissals should be quicker than appearances (the user already decided; don't make them watch).

## Reduced motion [STANDARD]

`prefers-reduced-motion` is a hard requirement, not a nicety (accessibility.md): gate non-essential animation with Tailwind's `motion-safe:` variant and provide `motion-reduce:` fallbacks for anything that must stay (progress indication remains, but stops traveling — a static pulse or plain bar). Decorative motion disappears entirely under reduced motion. Vestibular triggers — parallax, large zooms, full-screen pans — are the first things to cut, and the last things to add.

## Framework posture

Framework-aware, never framework-dependent:

1. The project already has a motion library (Framer Motion, GSAP, Vue transitions…) → use it, follow its idioms.
2. No library → CSS transitions and keyframes cover feedback, state, and most spatial motion; use the platform's View Transitions API where available before adding a dependency.
3. Genuinely complex choreography (shared-element continuity, physics) → then choose a library deliberately, and record the choice in MASTER.md.

## Motion posture by direction

The direction (visual-directions.md) sets the dial; these are the mappings:

| Direction | Posture |
|---|---|
| Restrained Operational, Technical Utility, Data Canvas | functional-instant: feedback + state only, near-zero decoration |
| Trust Institutional, Content First | minimal: state transitions, nothing else |
| Soft Product, Calm Care, Warm Marketplace | gentle: soft ease-out transitions, subtle hover lifts |
| Playful Consumer | springy micro-interactions; still one attention motion at a time |
| Bold Conversion | entrance reveals above the fold, restraint after; hero may tell a story |
| Minimal Luxury | slow and sparse: few, longer, quiet |

## Waiting states

- Under ~300 ms: show nothing — a spinner that flashes in and out reads as glitch.
- Content loading → skeleton in the content's own layout (no layout shift on arrival); action in flight → spinner or progress in the control itself (`aria-busy`, label change: content-design.md).
- Over ~10 s → add words: what is happening, determinate progress if possible.

## Common failures

- Everything animates → nothing means anything; motion budget spent, attention bankrupt.
- Hover transforms that change layout (growing cards push neighbors) — lift with shadow/scale on the compositor instead.
- Looping attention animations that never stop; celebration effects on destructive actions.
- Charts re-animating on every data tick (data-viz.md) — animate on first paint, update in place after.

## Verification

Screenshot verification can't see motion — check it live or in code: reduced-motion pass exists for every `animate-`/`transition` class; no `transition-all` on interactive elements; no transitions on layout properties; attention motions terminate. In review mode, treat a page whose every element fades in as a MAJOR finding, not a style choice.
