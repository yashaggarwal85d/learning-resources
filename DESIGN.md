# Design — how a reel step looks

The house style for every reel, in one page. The content-plan agent storyboards to it, the run builds to it, and the looks review judges against it. It distils the plan's [Rule #4](PROJECT_PLAN.md#rule-4--beautiful-and-effortless-to-memorize), [Animation principles](PROJECT_PLAN.md#animation-principles) and [Theme](PROJECT_PLAN.md#theme--briefing), and every layout problem in [QUALITY.md](QUALITY.md) so far. If this page and the plan disagree, the plan wins; fix this page.

The look is a **briefing** (owner decision 2026-10-20): black and white, hairlines, framed figures, serif titles over mono labels, colour only where it means something, and motion in every step. Reels made before the switch keep their scenes and take the new look through the theme tokens; every topic drafted from now on is storyboarded to this page in full.

## What a great step is

- **One idea, one picture, in motion.** The visual shows the mechanism the caption names, and shows it *happening*: data moves, a curve draws, a count rises, a bound is crossed, brackets lock onto the answer. A learner who only watches still gets it. If the picture would make sense as a still image, or without the concept, it is decoration: find the motion or cut it.
- **Readable at a glance.** The eye lands on one thing first (the brightest, largest, solid-white element is the point), then reads at most three or four labels. Everything else is quieter (grey, smaller) or absent.
- **Real values.** Numbers on screen come from `examples.py` (the build checks this). Prefer the number that surprises: 499,500 against 1,000.
- **Moves to explain, then holds.** Motion lands on a clear final frame. The final frame is the still summary: it must teach the whole step on its own, because that is what a paused or reduced-motion learner sees.
- **Its own idea.** Each topic invents its visual for its concept; two topics that explain different things the same way means one hasn't found its idea yet.

## What makes a reel engaging

Every topic drafted from 2026-10-20 on follows this arc (the content plan names each part in `OUTLINE.md`):

1. **The hook.** Step 1 opens on a hard, concrete problem or a surprising fact with its real number, not on a definition. The figure shows the problem.
2. **Predict before explaining.** At least one `predict` step in a refresher, at least two in a full topic, and the first one within the first four steps. The question frame shows the setup without the answer; the visual reveals the answer after the learner picks.
3. **The mechanism, built up.** Each step adds one piece to the picture, on the beat, in the order the caption explains it.
4. **The surprising number.** At least one step makes a number land: a count racing up, a bar overtaking another, a ratio settling.
5. **Takeaways.** Each key step carries a `takeaway`: one sentence worth keeping, at most 20 words, saying nothing the step does not show. It appears under the description once the step's animation ends, and the debrief collects them all. A reel has at least three, and no more than one per step.
6. **The recap.** The last step pulls the pieces together in one figure.

The narration carries the same arc in the professor's voice (PROJECT_PLAN.md → Narration): it asks the question before the reveal and says why the picture looks the way it does.

## Canvas and layout

- Build every step from `site/src/reels/kit.tsx` (the kit, below) and `Code` for code panels. Don't copy them into the topic.
- **Phone first.** On a phone the drawing gets about 360 × 300 CSS pixels above the caption; the 600-unit canvas is scaled to about 0.6. Design the portrait frame first, then check landscape.
- **Desktop is a briefing room.** On wide screens (1280 px and up, landscape) the step index takes the left column, the caption the middle, the figure the right; the figure gets about 680 × 600 px at 1440 × 900.
- **The frame belongs to the shell.** The player draws corner ticks around the figure, a scan line as each step arrives, and on desktop "Fig NN · name" and the step clock on the frame's top edge. Don't draw a border around the whole canvas; name the figure with the step's `fig` field (a few words, such as "ratio to n²").
- **Text size:** 13 units minimum for any label (it renders about 9.5 px on a phone after the phone text scale), 15–17 for values, 20+ for the one number that matters. The reel test fails text under 9 px.
- **Room for text:** at phone scale a 13-unit monospace character is about 8 units wide on the canvas, so a 40-character label needs about 320 units. Never put two labels on one line unless both fit with 24+ units between them; stack them instead. Never place a label where a line, bar or another label can reach it at any point of the animation.
- **Inside the box:** nothing runs past the drawing's edges at either size (the reel test fails it). Long explanations belong in the caption, not the drawing.
- **Code plus a drawing:** a code panel takes most of a phone's height. Keep code to 8 lines or fewer when a drawing sits under it (use `Svg fill`), or show the code and then swap it for the drawing on portrait (`portrait` in the step context), as the Python refresher's predict steps do.
- **Side rail:** keep important content out of the right 64 px on desktop (the side buttons sit there).

## Colour and type

- **Black and white carry the picture.** Draw in white and greys on the near-black background; don't paint panels behind everything.
- Colours by role (`C` in the kit; new topics use the role names): `C.focus` (white) for the thing to look at, `C.primary` for primary labels and values, `C.secondary` for secondary labels, `C.quiet` for quiet captions and axis labels, `C.line` for axes and rules, `C.band` for bands and tracks, `C.panel` for a raised box.
- **Colour is rare.** `C.bad` / `C.badText` (red) only for a failure, a danger or a wrong answer; `C.second` (pale blue) only for a second series or a before/after pair. At most these two in one step, and most steps need neither. Colour carries the same meaning across the whole reel.
- **Focus by more than brightness.** White against light grey is only 1.7:1, so the thing to look at is also bigger, bolder, a solid shape, or locked on with `Reticle`. Never a white label next to a grey label as the only cue.
- **Type:** labels in JetBrains Mono (the `T` default); formulas and the one emphasised word or number per step in the serif (`Eq`, or `T serif`), Source Serif 4. Use Unicode for maths (², ₀, Θ, λ, ≤); the serif has Greek.

## Motion

One motion language for the whole site. Shell motion (the player, panels, the hub) is built in; scene motion is yours, from the kit.

- **Pure functions of time.** Every scene animation is a function of `t` (use `seg`, `easeOut`, `easeInOut`, `easeOutExpo`, `lerp` from `anim.ts`, and the kit's moves); seeded randomness only. Pausing, scrubbing and `?t=` must work.
- **Two curves.** `easeOutExpo` (the shell's ease-brief, `cubic-bezier(.16, 1, .3, 1)`) for anything arriving; `easeInOut` for things travelling or changing in place. `easeOutBack` only for a small object landing, never for text or panels.
- **On the beat.** Things arrive about 0.4–1.0 s apart, in the order the caption explains them; the step's `duration` ends when the final frame is complete (typically 3–6 s).
- **Every step moves.** At least one element in every step is animated by `t` (not counting the shell). A storyboard says what moves on which beat.
- **The moves** (kit primitives, one vocabulary across reels):
  - **Draw** — a line, curve, arrow or path draws itself with a pen point at its tip (`Draw`). For trajectories, curves, flows, pointers.
  - **Plot** — points land one per beat with a stem (`Plot`). For measurements, samples, a sequence of results.
  - **Count** — a number rises or falls to its real value (`fmt(lerp(a, b, easeOut(seg(t, …))))`). For the surprising number.
  - **Decode** — a short mono label resolves left to right (`Decode`, 24 characters or fewer). For a verdict, an identifier, a result appearing. Never for sentences.
  - **Lock-on** — four brackets close on the one thing the step is about, at its final beat (`Reticle`). At most one per step.
  - **Surface** — a turning wireframe surface for anything that lives in 3D (`Surface`): a cost landscape, a loss surface, a distribution.
- **Shell moves** (built in, every reel): the eyebrow decodes, the title rises out of a mask, a hairline draws under it, the description follows; the figure scales in from 98.5% while its frame's ticks settle and a scan line sweeps it; the step index's marker glides to the current step; the debrief fills one cell per step and locks onto a check mark.
- **Position, scale and opacity only.** No filters or blur on moving layers; no animated layout properties. It must stay at 60 fps on a mid-range phone.
- **Predict steps:** the question frame shows the setup without giving the answer away; the answer is revealed by the visual after the learner chooses (`answer` in the step context), ideally with a lock-on.
- **Reduced motion:** the player opens every step at its final frame and the shell skips its moves; nothing else to do, as long as the final frame teaches.

## The kit

| Piece | What it is |
|---|---|
| `Stack`, `Svg` | The layout stack and the 600-unit canvas (`h` you choose; `fill` under a code panel) |
| `T`, `Eq` | Text (mono by default, `serif`, `italic`), and a formula in the serif italic |
| `Bar` | A bar on a track |
| `Draw`, `Plot`, `Reticle`, `Decode`, `Surface` | The moves above |
| `C` | Colours by role (`focus`, `primary`, `secondary`, `quiet`, `line`, `band`, `panel`, `second`, `bad`, `badText`) and by their old names |
| `Code` | A code panel whose lines type in, with highlighted lines |
| Step fields | `title`, `body`, `duration`, `hold`, `predict`, `fig` (the figure's name), `takeaway` (one sentence) |

A new primitive is added to the kit when a second topic would need it; until then it lives with its topic.

## The notes panel

Everything that is not the reel lives in one panel that opens from the side buttons (owner decision 2026-10-17):

- **Shape.** On a desktop it slides in from the right edge, at most 36rem wide, over a dimmed reel that is paused while it is open; on a phone it is a full-height drawer, edge to edge, with a close button at the top right. Escape and a tap on the dimmed reel close it (with a confirmation if an edit is unsaved).
- **Four tabs, always in this order and with these names:** Prerequisites (links only), Pre-notes (what to know before watching), Post-notes (the Deep dive), Sources. The tab named by the button you pressed is open, underlined; switching tabs keeps the panel.
- **Prose** (`.deep` in `global.css`): body in `crema`, terms and headings in chalk with headings in the serif, links in chalk with a grey underline and opening in a new tab, code in the mono face. Pre-notes are one bullet per term with an italic "Where you meet it".
- **Editing** (any device): an Edit button above the text; the editor is the Markdown text with a Preview toggle, Save via GitHub issue, Cancel, and the build's problems listed in red under it. Save always opens a prefilled GitHub issue (no token ever lives in a browser); the notes-edit workflow checks it and commits it, refusing rather than overwriting if the file changed meanwhile.

## The looks review checks

For every step at desktop and phone size:

- Is the point visible at a glance, and shown by more than brightness alone?
- Does the step move, and does the motion show the mechanism (not decoration)? Does it land on a final frame that is a complete summary?
- Is any text crowded, overlapping, clipped, under-sized or low-contrast?
- Is colour used only for failure or a second series, with at most two colours and at most four labels competing?
- Does the caption say what the picture shows? Is the takeaway one sentence the step really shows?
- Across the reel: does it hook on step 1, ask a prediction early, land a surprising number, and recap at the end?
- Does the step look like it belongs to this site and still have its own idea?

## Good examples

- Python refresher, step 7 (context managers): a timeline of four dots, one red, with one label line above; the whole idea in a glance.
- Asymptotic notation (DSA), step 2: the ratio (3n² + 10n) / n² traces in, red while it is still above 4n², white once it settles inside the band from n₀ = 10; the threshold is the one thing to read.
- Asymptotic notation (DSA), the ratio cards: three rows, each one function pair, its values and a verdict symbol on the right.
