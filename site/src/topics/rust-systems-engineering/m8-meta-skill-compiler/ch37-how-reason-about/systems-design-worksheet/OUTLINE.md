# Outline — The systems design worksheet

Concept ledger: introduces `an-implicit-backpressure-point-is-still-a-real-decision`; reuses `a-rejected-request-never-reaches-the-layer-behind-it` (Ch.34) directly, building the identical bounded design as its own explicit half of a real comparison, per Chapter 37's own CHAPTER.md §A.7.

Bridge/handoff (verbatim from CHAPTER.md §A.8): "An implicit decision answered by a real default is still a real decision, measured directly; the next real question is whether a decision that was made on purpose, an optimization, actually did what it was meant to."

Chapter 37's own disclosed convention (§A.3/§A.6) applies: this topic's own crate (`examples/worksheet_demo/`) builds two real, independent Axum services over the identical real request/worker shape — one genuinely bounded (capacity two, the explicit Chapter 34 design) and one genuinely unbounded (`tokio::sync::mpsc::unbounded_channel`, the implicit default) — and drives the identical real burst of eight sequential requests against each, measuring each one's own real queue length at the same checkpoint via hand-rolled `enqueued`/`started` atomic counters.

## Storyboard (8 steps, 3 predict/reveal pairs)

1. **BoundedPredict** — A real burst of eight requests, arriving faster than one worker can finish them, hits a real service whose own backpressure point was stated on purpose (capacity two, Chapter 34's own design). Does its real queue length stay capped? Options: no, it grows to fit whatever the burst sends; yes, genuinely, it stays capped and sheds the rest of the burst (correct); only if the requests arrive more slowly.
2. **BoundedReveal** — Measured: of the eight real requests, three are genuinely admitted and five genuinely rejected, and the real queue length at the checkpoint stays at exactly two. No separate takeaway here (this is the reel's own "from" step for the phone swipe test; its takeaway moves to step 7, the connecting step, below).
3. **UnboundedPredict** — The identical real burst of eight requests hits a second, independent service that never states its own backpressure point at all. Does leaving that real decision implicit change what actually happens? Options: no, an unstated default behaves the same as a stated one; yes, genuinely, the real queue keeps growing with every request instead of shedding any of it (correct); only once the burst is much larger.
4. **UnboundedReveal** — Measured: all eight real requests are genuinely admitted, none rejected, and the real queue length at the identical checkpoint has grown to seven. Takeaway: leaving a backpressure point implicit does not avoid the decision, it genuinely defaults to an unbounded queue instead.
5. **ComparePredict** — Side by side, under the identical real overload, which real design actually protects the service behind it? Options: the one that never rejects anyone, since nothing is ever turned away; the one that sheds load at a real boundary it chose, genuinely, since the other only defers the real cost instead of shedding it (correct); both protect it equally well.
6. **CompareReveal** — Measured: the identical eight-request burst leaves one real queue capped at two and the other genuinely climbing to seven, side by side. Takeaway: an implicit decision is still a real decision, just one answered by whatever default a library ships instead of by a choice someone actually made.
7. **DocsReveal** — The `tokio::sync::mpsc` documentation states this directly, in its own words: a bounded channel communicates with backpressure, an unbounded one communicates without it. Does this topic's own measured comparison match exactly what both of the module's own two functions describe? Takeaway (moved here from step 2): the worksheet's own backpressure question is never optional, only ever answered explicitly or answered by default.
8. **Recap** — A design that states its own backpressure point sheds load at a real boundary it chose; a design that leaves it unstated still gets a real answer, just not one anybody actually chose; together, that is why the worksheet's own nine questions get checked before writing code, not after.

## Engagement arc

- Predicts: steps 1, 3, 5 — each a genuine guess about what this exact pair of real services actually does under the identical real burst.
- Takeaways: steps 4, 6, 7 (three — step 2 deliberately carries none, since it is the reel's own "from" step for the phone swipe test; its takeaway moves to step 7, the connecting step; step 8's recap carries the closing statement instead of a fourth).

## Deferred to post-notes (not measured in the reel itself, per the kit's real-measurement standard)

- `tokio::sync::mpsc::Receiver::len()`, a real method that reports a channel's own current length directly; this topic's own crate measures queue length with hand-rolled `enqueued`/`started` atomics instead, to avoid sharing a `Receiver` between the worker task and an HTTP endpoint without risking a deadlock — Internals.
- The worksheet's own other eight questions (resources, owners, sharing rules, persistence boundary, failure modes, consistency rule, observability signals, and the backpressure point's own siblings), each answerable the identical explicit-versus-implicit way this topic measures for one of the nine — In production.
- `tower::load_shed`, which performs a real, explicit rejection as a drop-in middleware layer rather than inside the handler by hand, the identical mechanism this topic's own bounded instance uses directly — The frontier.
