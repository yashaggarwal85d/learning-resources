# OUTLINE: Choosing the data-flow shape (`de.choosing-data-flow-shape`)

## Learning outcomes
1. Given a freshness SLO and a reprocessing requirement, choose among batch, micro-batch, streaming and hybrid and justify it with the decision card.
2. State what changes in the choice as the SLO tightens from hours to minutes to seconds.
3. Place Lambda, Kappa and a unified engine on the card.
4. Decide push or pull for a given source and name who owns each failure.

## Engagement arc
- Hook: step 1 (three teams propose three shapes for the shop's own fifteen-minute SLO).
- Predict: step 2, within the first four steps (which shape wins at lowest cost, and what reprocessing question could flip it).
- Takeaways: step 4 (choose the cheapest shape whose floor clears the SLO), step 6 (Lambda's real cost is organizational, not computational), step 8 (a pulled source's silence looks identical to "nothing happened").
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the shop's freshness SLO (from topic 1) is fifteen minutes; three teams propose streaming, hourly batch, and five-minute micro-batch — which meets the SLO at the lowest cost?
- **On screen:** the SLO line, three proposals listed beside it.

### 2. Predict
- **fig:** which of the three proposals meets the SLO at the lowest operating cost, and what single question about reprocessing could flip the choice?
- **Options:** (a) streaming always wins once it meets the SLO, since it has the most headroom [wrong — headroom isn't free, it's the most expensive shape]; (b) the cheapest shape whose latency floor still clears the SLO wins, unless reprocessing cost says otherwise [correct].

### 3. Reveal — the decision card, four shapes against the SLO line
- **fig:** batch, micro-batch, streaming, hybrid — each with its own latency floor as a bar against the fifteen-minute line; any floor above the line dims immediately.
- **Moves:** four cards, bars rising to each shape's floor, the ones above the line dimming.

### 4. Reveal — survivors compared, cheapest that clears wins
- **fig:** of the shapes that clear the floor, compare operational burden and replay ease; the cheapest survivor lifts.
- **takeaway:** "Choose the cheapest shape whose latency floor still clears the SLO — not the fastest one available."

### 5. Reveal — Lambda, Kappa and a unified engine, placed on the card
- **fig:** Lambda sits on the hybrid card (two code paths, one batch one speed); Kappa sits on the streaming card (replay as the batch path, from the retained log); a unified engine (naming Flink's unified execution, Spark's `availableNow`) is the way to get Kappa's one-code-path property without hand-rolling the replay logic.
- **Narrator's line of thought:** she places each one as a named point, pointing at the chapter it belongs to, not re-explaining the engines.

### 6. Reveal — the real cost Lambda pays, and the real cost Kappa pays
- **fig:** Lambda's cost is keeping two systems' logic in sync, not compute (Kreps's own LinkedIn experience); Kappa's cost is a real, temporary doubling of output storage during a reprocessing run — neither is free, they're different costs.
- **takeaway:** "Lambda's real cost is organizational — keeping two systems' logic in sync — not a computational one."

### 7. Reveal — push vs pull, decided per source
- **fig:** at each source boundary, someone either pushes (the source team owns delivery and the schema) or is pulled from (the pipeline owns extraction); the boundary decides who's paged when data stops.
- **Narrator's line of thought:** this is a question topic 10's interrogation settles for a real source — here it's named as a structural choice, not worked in depth.

### 8. Predict
- **fig:** a pulled source goes silent — zero new rows today. Does that look different from "nothing happened today," or the same?
- **Options:** (a) different — the pull job itself would show an obvious error [wrong, tempting because an error feels like it should be loud]; (b) identical — a successful pull with zero rows looks exactly like a quiet business day, until a freshness alert eventually catches it [correct].
- **takeaway:** "A pulled source's silent failure looks identical to a quiet day — only a freshness alert, not an error, catches it."

### 9. Recap
- **fig:** the decision card with the SLO line, the cheapest-that-clears rule, Lambda/Kappa/unified placed on it, and push vs pull's different failure visibility.

### 10. Prove it
- **fig:** the shop's freshness SLO tightens from fifteen minutes to thirty seconds for a new fraud-review ask — which shapes survive the card now, and what does the tightened SLO force?
- **predict options:** (a) only streaming clears a thirty-second floor, and the reprocessing-cost question now matters far more, since there's no batch fallback left to lean on [correct]; (b) micro-batch can still be tuned fast enough by just shrinking the batch interval far enough [wrong, tempting because micro-batch sounds infinitely tunable, but its floor is bounded by trigger and shuffle overhead].

## Post-notes headings
- **Internals:** the Dataflow Model's framing of batch and streaming as points on one model (Akidau et al.), named as the theoretical unification unified engines implement.
- **Lab:** this topic's own `examples.py` — exercise: change the SLO and watch which shapes survive the card.
- **Production:** LinkedIn's own lived experience with a "transparent" dual-run API (Kreps) as the concrete failure mode "maintaining two systems" becomes in practice.
- **Frontier:** unified batch/streaming execution (Flink, Spark's `availableNow`) as the still-maturing way to get Kappa's one-code-path property without hand-building the replay harness.
- **Where this goes next:** hands off to storage, layout and lifecycle (topic 4), which the data-flow shape and the dominant access path jointly decide.

## Concept ledger
- **Introduces:** `data-flow-shape-decision`, `freshness-slo-as-floor`, `push-pull-source-boundary`.
- **Uses:** `ask-to-slo-translation`, `capacity-estimate-chain` (topics 1–2, this chapter).
- **Declared (chapter-plan ids not yet resolvable in `registry.ts` — Chapters 3/5/7/8/9/14 not live for these):** `lambda-architecture`, `kappa-architecture`, `medallion-bronze-silver-gold`, `at-least-once-plus-idempotence`, `atomic-offset-output-commit`, `queues-vs-logs`.

## Changes from the chapter plan
Same pattern as topics 1–2: chapter-plan `uses` ids from Chapters 3/7/8/9/14 moved to `declared`
since none of those chapters has these ids live in `registry.ts` yet. No scope cut.

## Claims list (for fact-check)
1. Kreps: maintaining equivalent logic in two distributed systems (Lambda's batch and speed layers) is painful and, in his view, not fixable. — SOURCES.md.
2. Kreps: LinkedIn's own hybrid-Hadoop and "transparent" dual-run API experience — it worked but was never pleasant or productive. — SOURCES.md.
3. Kreps: reprocessing defined precisely as re-deriving output from retained input after the processing code changes. — SOURCES.md.
4. Kreps: the Kappa proposal — retain the full input log, start a second instance of the same job from the start of the log to reprocess, write to a new output table. — SOURCES.md.
5. Kreps: the "Kappa Architecture" name, offered with explicit modesty. — SOURCES.md.
6. Kreps: the real resource trade-off — Kappa's reprocessing run needs roughly double the output storage temporarily, not a free alternative to Lambda. — SOURCES.md.
