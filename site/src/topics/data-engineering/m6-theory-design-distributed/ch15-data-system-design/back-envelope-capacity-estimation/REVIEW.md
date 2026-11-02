# Review — de.back-envelope-capacity-estimation

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, the previous topic's handoff (`de.requirements-
into-slos`), this topic's own files in order (reel and scenes, narration, post-notes, pre-notes,
prerequisites, registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next
topic's syllabus line (choosing the data-flow shape, §15.1 topic 3).

1. **Flow.** The bridge answers topic 1's handoff verbatim as required, and the handoff to topic
   3 is written to match what topic 3's own `CHAPTER.md` entry expects (the design rate and the
   freshness SLO together choosing the data-flow shape). `uses` stays limited to what's actually
   live or available within this chapter (`ask-to-slo-translation`, `six-dimension-requirement-
   checklist` from topic 1, `latency-percentiles` from the live Chapter 1) — the chapter plan's
   own Chapter 1/3/4/5 ids were moved to `declared` rather than guessed, same pattern and same
   reasoning as topic 1, logged in `OUTLINE.md`.
2. **Pre-notes.** 6 bullets, under 400 words, no links. Every term (throughput, peak-to-average
   ratio, replication factor, in-flight, order of magnitude, connection pool) is assumed
   vocabulary the reel uses without re-deriving.
3. **Gap hunt.** Checked both syllabus clauses' relevant text against `coverage.json` word for
   word. One real find: the syllabus clause for "the reference numbers to carry in your head"
   also lists memory/SSD/network latencies and Chapter 1 cost-model material by name — this topic
   deliberately does not re-teach those (they're Chapter 1's own subject, `declared` not
   re-introduced) and only maps the three *new* reference numbers this topic itself contributes
   (Kafka throughput, S3 request limits, the measured scan rate). Logged as a deliberate scope
   boundary in `OUTLINE.md`'s "Leaves out" framing (mirroring `CHAPTER.md`'s own "Leaves out"
   clause for this topic), not a gap.
4. **Expert reader.** The red team's main finding (see `FACT-CHECK.md`) was making sure the
   replication multiplier in `capacity_chain()` is applied to the *stored* bytes total, matching
   the source's own "written to network or disk" wording, not only a transient bandwidth figure —
   fixed before this review by checking `examples.py`'s own formula directly.
5. **Engagement.** Hook (step 1, a genuine two-reading disagreement); predict within the first
   four steps (step 2); the surprising finding (the "laptop" reading's division was actually
   correct — the miss was everything downstream of it) lands in the predict's explain text; three
   takeaways (steps 4, 6, 8); recap (step 9); "Prove it" (step 10) applies the chain to a new
   scenario (approval-service calls) rather than restating the shop's own clickstream numbers.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing after two fixes (an
   unspeakable literal year, a line that echoed the reel's own recap text too closely — see the
   file's own history). Spot-checked step 7 (the reference-numbers reveal): the narrator argues
   for *why* each number needs its own tag, rather than just listing the three numbers.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened every screenshot in `site/test-results/` for this topic after the `PREVIEW_HELD=1` reel
test run.

1. **Found:** step 6 (consumer sizing), phone — "events in flight" / "divided by per-consumer
   capacity" collided. **Fix:** shortened both sides and grew the row gap; re-ran, clean.
2. **Found:** step 7 (reference numbers), phone — two of three rows' label/value pairs collided
   at phone text scale. **Fix:** shortened every label and value to its essential words and grew
   both the drawing height and the row spacing; re-ran, clean.
3. **Found:** step 8 (right vs. wrong use), phone — both rows collided. **Fix:** shortened both
   sides to their essential words and grew the row gap; re-ran, clean.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the two "focus" highlights per step (the dominant row, the correct claim),
matching `DESIGN.md`'s rule that colour is rare and means something. The unrelated `test:editor`
check again fails in this sandbox on its own hardcoded, unrelated topic
(`de.b-trees-vs-lsm`) with "a save did not open a new GitHub issue" — unrelated to anything this
topic touches, same as noted in topic 1's review.
