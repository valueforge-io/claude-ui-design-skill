# Data Visualization

Charts, KPIs, and dashboards. Consult when a task involves plotting data, choosing chart types, styling a charting library, or reviewing a dashboard.

## Core principle

The user's question comes first, the representation second [PRINCIPLE]. "What chart should this be?" is answerable only after "what will the user ask this data?" — name the question, then pick the form that answers it fastest. A chart chosen for looks answers nothing.

## Question → form

| The user asks | Default form | Notes |
|---|---|---|
| How do these compare? | bar (horizontal when labels are long) | sort by value, not alphabet, unless a natural order exists |
| How did it change over time? | line | area only for cumulative/volume feel; ≤4 lines, then facet |
| What makes up the whole? | stacked bar / 100% stacked | pie only with ≤5 slices and one obvious takeaway |
| How is it distributed? | histogram / box plot | bin count changes the story — try several |
| Do these relate? | scatter | add trend line only when the relationship is the point |
| Which are top/bottom? | ranked horizontal bar | show N + "others", not all 200 |
| What is the exact value? | table (components.md) | charts approximate; tables answer lookups |
| Is it on track? (single KPI) | big number + delta + sparkline | the number is the chart |

## Chart anatomy defaults

- Bar axes start at zero [PRINCIPLE] — bar length IS the encoding; a truncated bar axis is a lie. Line charts may zoom the range, but label it when the baseline isn't zero.
- Direct labeling beats legends [DEFAULT]: label lines at their ends, put values on/next to bars when few. Legends force eye tennis.
- Gridlines quiet: few, `neutral-200`-grade, behind the data; axis titles carry units ("Revenue, k PLN") — a number without a unit is decoration.
- Tabular numerals (`tabular-nums`) for every numeric column, axis, and KPI — proportional digits wobble.
- No 3D, ever. Dual axes: avoid [DEFAULT]; when genuinely unavoidable, color-match each axis to its series and say so in the title.
- Sparklines and small multiples: strip to the shape — no axes, no grid, one reference point at most.

## Color in charts

- Chart colors are tokens: define `chart-1…chart-6` slots in the styleguide (hue-spaced, chroma-matched — palette rules in color.md). The shell around the chart stays neutral; the chroma budget belongs to data (Data Canvas logic, visual-directions.md).
- Categorical: max 6 distinct hues, then group into "other". Sequential (magnitude): one hue, lightness ramp. Diverging (above/below a midpoint): two hues meeting at a neutral middle — and the midpoint must mean something.
- Semantic colors keep their meaning [PRINCIPLE]: green/red in a chart implies good/bad — use success/error slots only when the data means that; finance up/down follows locale conventions.
- Never meaning by hue alone [STANDARD]: pair color with direct labels, markers, or patterns; the chart must survive grayscale (color.md's test applies to data too).
- Highlight strategy: one series in primary, the rest in neutrals — "your team vs the others" beats six equal colors.

## States and interaction

- Data visible without hover [PRINCIPLE]: tooltips add precision, they never carry the only copy of a value.
- Interactive charts need a keyboard path and focus states (interaction.md); if the library can't provide one, pair the chart with an accessible table toggle.
- Loading: skeleton in the chart's own frame (no layout shift); empty: say what's missing and offer the fix ("No data for this range — widen the dates"); error: what happened + retry (content-design.md).
- Animate on first paint only; live data updates in place — re-animating every tick turns a dashboard into a lava lamp (motion.md).

## Accessibility

- One-sentence text summary near every non-trivial chart: what it shows and the takeaway ("Sales rose 12% QoQ, driven by EU"). Screen-reader users get the point; sighted users get the caption they secretly wanted.
- Complex/interactive charts offer a table alternative; units and locale formatting everywhere (1 234,56 vs 1,234.56 — follow the product locale).

## Implementation posture

Library-agnostic: use whatever the project has (Recharts, Chart.js, ECharts, D3…); wire its color config to the chart tokens, disable its default rainbow, size charts by container measurement rather than fixed pixels so reflow works (accessibility.md).

## Common failures

Pie with 12 slices · truncated bar axis "for drama" · rainbow categorical palette from the library default · legend hunting across the screen · gridlines louder than data · KPIs without deltas or context · charts answering no named question — the dashboard that "shows everything" shows nothing.
