# Content Design

The words are part of the interface — a perfectly spaced screen with "Are you sure? [OK] [Cancel]" is still broken UI. Consult when writing any label, error, empty state, confirmation, or helper text, and during reviews.

## Content lives in one place [PRINCIPLE]

Every user-visible string lives in a single content module (`content.ts`, `copy/`, or the project's i18n resource) — components import it and contain **zero** hard-coded words. This is not tidiness; it is what makes real copy cheap to introduce at any stage: swapping placeholders for final text becomes one file edit with no layout risk, and the same structure is what a translator or CMS plugs into later.

- Placeholder copy is written in the target register and realistic length (never lorem ipsum): only real-shaped text reveals whether a headline wraps badly, a measure is too wide, or a card breaks on a long quote.
- Mark every invented value that could escape into production: a TODO block at the top of the content module, obviously fake identifiers (ISBN `978-83-000000-0-0`), and **generic attributions** for testimonials or press quotes — never invent a named publication or person, even in a mockup, because fabricated endorsements survive in code long after the mockup dies.
- Numbers, prices, dates, and legal text are placeholders until confirmed; never let a plausible-looking figure ship unverified.

## Action labels

- Verb + object [PRINCIPLE]: "Create project", "Delete account", "Send invoice" — the button says what happens next. Never "Submit", "OK", "Yes", "Proceed", "Confirm" alone: they say only that a button was clicked.
- Pairs: the safe action is specific too — "Cancel" + "Delete project", never "No" + "Yes". Reading the buttons alone (without the question) must tell the whole story.
- Sentence case [DEFAULT] ("Create project", not "Create Project"); no trailing periods on buttons and labels; no ALL CAPS except overline slots (typography.md).
- One term per concept across the app [PRINCIPLE]: pick "workspace" or "project" and never alternate — vocabulary is part of the interface, and synonyms read as different features.

## Errors

The template: **what happened + why (when known) + what to do next.**

- "Couldn't save the invoice — the connection dropped. Your edits are kept locally; retry when you're back online." Not: "Error", "Something went wrong", "Request failed (500)".
- Never blame the user ("Invalid input" → "Enter a date after the start date"); error codes in parentheses at the end, if support needs them — never as the message.
- Placement: inline at the failing field, wired via `aria-describedby` (accessibility.md); error toasts carry the next step, not just the bad news.
- Tone freezes in errors and destructive flows [PRINCIPLE]: whatever the direction's personality, errors are calm, plain, and joke-free — a playful brand may joke in an empty state, never over lost data.

## Empty states

An empty state has three jobs: explain what belongs here, why it's empty, and offer the first action.

- "No invoices yet — they'll appear here once you create one. [Create invoice]". Never a bare "No data".
- First-use empties may teach (one sentence + action); filtered-to-empty says so ("No results for 'kowal' — clear filters?"); error-empty is an error, use the error template.

## Confirmation vs undo

- Reversible action → do it, offer undo [PRINCIPLE]: "Archived 'Q3 report'. [Undo]" (toast, with the undo also available somewhere persistent — interaction.md). Confirmation dialogs for reversible actions train users to click through dialogs.
- Irreversible → confirm by naming the object and the consequence (components.md): "Delete 'Project Alpha'? This permanently removes the project and its 38 tasks. [Cancel] [Delete project]".
- Type-to-confirm (retype the name) only for catastrophic, plural, or shared-resource deletions — it's friction by design; spend it rarely.

## Waiting and progress

- Label what is happening: "Importing 3 of 12…" beats a bare spinner; determinate progress whenever the total is knowable.
- Skeletons for arriving content, in-control progress for actions (button label switches to the gerund: "Saving…", `aria-busy`); after ~10 seconds add words and an escape (motion.md for the timing rules).

## Helper text

- Help before failure [DEFAULT]: format requirements sit under the field before typing ("8+ characters, one number"), not in an error after. Placeholders are examples, never instructions (components.md).
- Front-load every string: users read the first two words — "Delete project" not "Click here if you would like to delete the project". Titles ≤ ~8 words; helper lines one sentence.

## Localization awareness

- Never concatenate sentence fragments in code ("You have " + n + " items") — plural rules and word order break in other languages; use the project's i18n plural mechanism.
- Expect +40% string length in translation: labels must wrap, buttons must not be width-fixed (accessibility.md); no text baked into images.

## Common failures

"Are you sure?" · "Something went wrong" · "Submit" · placeholder-as-instructions · jokes in error messages · "Click here" links (the link text is the destination) · dialogs whose buttons can't be understood without rereading the question · three names for the same feature.
