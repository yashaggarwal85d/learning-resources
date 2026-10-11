# Design — how a reel step looks

The house style for every reel, in one page. The content-plan agent storyboards to it, the run builds to it, and the looks review judges against it. It distils the plan's [Rule #4](PROJECT_PLAN.md#rule-4--beautiful-and-effortless-to-memorize), [Animation principles](PROJECT_PLAN.md#animation-principles) and [Theme](PROJECT_PLAN.md#theme--coffee), and every layout problem in [QUALITY.md](QUALITY.md) so far. If this page and the plan disagree, the plan wins; fix this page.

## What a great step is

- **One idea, one picture.** The visual shows the mechanism the caption names, so a learner who only watches still gets it. If the picture would make sense without the concept, it is decoration: cut it.
- **Readable at a glance.** The eye lands on one thing first (the biggest, brightest element is the point), then reads at most three or four labels. Everything else is quieter (taupe, smaller) or absent.
- **Real values.** Numbers on screen come from `examples.py` (the build checks this). Prefer the number that surprises: 499,500 against 1,000.
- **Moves to explain, then holds.** Motion shows a process (data moving, a count rising, a bound being crossed) and lands on a clear final frame. The final frame is the still summary: it must teach the whole step on its own, because that is what a paused or reduced-motion learner sees.
- **Its own idea.** Each topic invents its visual for its concept; two topics that explain different things the same way means one hasn't found its idea yet.

## Canvas and layout

- Build every step from `site/src/reels/kit.tsx`: `Stack`, `Svg` (600 units wide, height you choose), `T` (text), `Bar`, the colour tokens `C`, and `Code` for code panels. Don't copy them into the topic.
- **Phone first.** On a phone the drawing gets about 360 × 300 CSS pixels above the caption; the 600-unit canvas is scaled to about 0.6. Design the portrait frame first, then check landscape.
- **Text size:** 13 units minimum for any label (it renders about 9.5 px on a phone after the phone text scale), 15–17 for values, 20+ for the one number that matters. The reel test fails text under 9 px.
- **Room for text:** at phone scale a 13-unit monospace character is about 8 units wide on the canvas, so a 40-character label needs about 320 units. Never put two labels on one line unless both fit with 24+ units between them; stack them instead. Never place a label where a line, bar or another label can reach it at any point of the animation.
- **Inside the box:** nothing runs past the drawing's edges at either size (the reel test fails it). Long explanations belong in the caption, not the drawing.
- **Code plus a drawing:** a code panel takes most of a phone's height. Keep code to 8 lines or fewer when a drawing sits under it (use `Svg fill`), or show the code and then swap it for the drawing on portrait (`portrait` in the step context), as the Python refresher's predict steps do.
- **Side rail:** keep important content out of the right 64 px on desktop (the side buttons sit there).

## Colour and type

- Background is the reel's dark roast; draw on it, don't paint panels behind everything.
- `crema` for primary labels and values, `latte` for secondary, `taupe` for quiet captions and axes, `caramel` for the thing to look at, `cinnamon` for the second accent (large text only), `cherry` for bad outcomes (fills only; for red text use `C.cherryText`).
- At most two accent colours in one step. Colour carries meaning (good/bad, before/after) consistently across the reel.
- Labels in JetBrains Mono (the `T` default); one serif (Fraunces) number or word per step at most, for emphasis.

## Motion

- Every animation is a pure function of `t` (use `seg`, `easeOut`, `easeOutBack`, `lerp` from `anim.ts`); seeded randomness only.
- Things arrive on a steady beat (about 0.4–1.0 s apart) in the order the caption explains them; the step's `duration` ends when the final frame is complete.
- Animate position, scale and opacity only. No filters or blur on moving layers.
- Predict steps: the question frame shows the setup without giving the answer away; the answer is revealed by the visual after the learner chooses (`answer` in the step context).

## The looks review checks

For every step at desktop and phone size: is the point visible at a glance; is the final frame a complete summary; is any text crowded, overlapping, clipped, under-sized or low-contrast; are there more than two accents or more than four labels competing; does the caption say what the picture shows; does the step look like it belongs to this site and still have its own idea.

## Good examples

- Python refresher, step 7 (context managers): a timeline of four dots, one red, with one label line above; the whole idea in a glance.
- Asymptotic notation (DSA), the ratio cards: three rows, each one function pair, its values and a verdict symbol on the right.
