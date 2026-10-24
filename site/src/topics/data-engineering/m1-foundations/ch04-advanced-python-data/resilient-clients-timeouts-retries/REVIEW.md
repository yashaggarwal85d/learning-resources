# Review — de.resilient-clients-timeouts-retries

## Content review, self-review, 2026-10-24

Read cold, in order: topic 33's reel and Deep dive, then this topic's files in order (reel and
scenes, narration, post-notes, pre-notes, prerequisites, registry entry, `coverage.json`,
`SOURCES.md`, `FACT-CHECK.md`), then the next syllabus line (testing data code).

1. **Flow.** Clean. The hook names the exact handoff topic 33 left open (a pool decides how many
   connections exist; it says nothing about a failed call) rather than a generic restatement. No
   concept is used before `introduces`/`uses` establishes it; the only `uses` dependency
   (`connection-pool-sizing`) is never re-taught, only assumed, matching `CHAPTER.md`'s own
   framing of this topic as built directly on the pooled client.
2. **Pre-notes.** Checked against `notes-rules.ts` (5 bullets, under 400 words, no links). Every
   term (deadline propagation, jitter, retry budget, circuit breaker, idempotency key) is
   genuinely assumed rather than taught by this reel; "jitter" is called out specifically as the
   predict step's own counter-intuitive center, matching the reel's own emphasis.
3. **Gap hunt.** Checked the syllabus line clause by clause against `coverage.json`'s mapped
   clauses: all four clauses present, each mapped to real steps, nothing left uncovered. Checked
   every `coverage.json` `at.step`/`at.deep` reference resolves against the real `reel.tsx` step
   titles and `post-notes.md` headings (matched the heading text "Production failures this topic
   warns about" exactly, per the gotcha caught on the previous topic) — no mismatch found this
   time, since both were checked before the first build run rather than after. No other gap found
   against the syllabus line, the sources, or the expert list.
4. **Expert reader.** The predict step (step 4) was checked specifically for the trap of
   overstating what backoff alone already does: the wrong answer ("capped exponential backoff on
   its own already prevents clients bunching up") is a genuinely tempting misreading of what
   backoff accomplishes, since backoff does slow every client down — it just does so by the same
   schedule, which the reveal (step 5) then demonstrates directly rather than merely asserting.
   The retry-budget and circuit-breaker steps (6–7) are kept visually and narratively distinct
   (a per-client volume cap vs. a per-dependency on/off switch) rather than blended into one
   "stop retrying" idea, matching the sources' own treatment of them as separate mechanisms for
   separate problems.
5. **Engagement.** Hook (step 1) poses the real open question left by topic 33. Predict at step
   4, within the first four. Six takeaways (steps 2, 3, 5, 6, 7, 8), well over the minimum three.
   The jitter reveal (step 5) functions as the "surprising number" beat alongside the circuit
   breaker reveal (step 7) — a measured microseconds-vs-full-timeout contrast is a concrete,
   countable result. Recap (step 9) pulls every reveal into one line each. "Prove it" (step 10) is
   a genuine synthesis task: diagnosing two independent failures (missing idempotency key, reset
   deadlines) in one production scenario, not a restatement of any single step.
6. **Narration teaches.** `narration-teaches.mjs` reports 0 flags; highest description overlap
   22% (steps 1, 5, 9), well under the flagged threshold; every line speaks in the professor's own
   voice — asking the open question before answering it (step 4), stating what the backend-pid
   or effect-counter check rules out before stating the conclusion (steps 6, 8) — rather than
   reading `reel.tsx`'s body text. No digits, symbols or code names appear in any narration line;
   "idempotency key" is spoken as "a repeated key" / "one shared, repeated key", "circuit
   breaker" as "tripped logic", and "token bucket" / "retry budget" as "a fixed retry allowance".

No other findings. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check` — 27/27 quotes verified word for word.
- `python3 examples.py` — pass, "resilient-clients-timeouts-retries examples: all numbers check
  out" (a real client timeout against a real slow vs. fast local endpoint; a three-hop deadline
  trail, the last hop skipping work once the shared deadline had passed; capped exponential
  backoff with full jitter against a real flaky server, five attempts to succeed, every sleep
  bounded by the cap; a disclosed simulation of a hundred synchronized clients with and without
  jitter, matching the source article's own simulated method; a real token-bucket retry budget
  against an always-failing server, attempts exactly equal to the budget; a real circuit breaker
  measurably failing in microseconds once open versus milliseconds while closed; an idempotency
  key confirmed against the server's own real effect counter, not just client-visible responses).
- `node scripts/narration-teaches.mjs .../resilient-clients-timeouts-retries` — pass, 0 flags,
  highest overlap 22%, longest line under the 50-word limit, no digits.
- `node scripts/check-all.mjs --skip reels,links,narration --topic
  resilient-clients-timeouts-retries` — pass (locked, docs, sources, build — the build's own
  topic-file check caught four real over-length takeaways during the build, all fixed, see Fixes
  below).
- `node scripts/check-all.mjs --only links,narration --topic
  resilient-clients-timeouts-retries` — pass, 0 broken links; no new blocked or title-mismatch
  warnings traced to this topic.
- `node scripts/check-all.mjs --only reels --topic resilient-clients-timeouts-retries` — result
  recorded in the Looks review below once it completes.

## Fixes made during this build

- **A `handle_error` override needed on the server class, not the request handler**: an early
  version of `examples.py` tried `FlakyHandler.handle_error`, which `socketserver` never calls on
  the handler (it lives on the server). The symptom was a noisy `BrokenPipeError` traceback
  printed to stderr whenever the client-timeout demo's already-timed-out client closed its
  socket before the slow server could reply — harmless, but noise. Fixed by subclassing
  `socketserver.ThreadingTCPServer` instead and overriding `handle_error` there.
- **An idempotency-dedup assertion that miscounted the expected effect total**: the first
  version asserted the server's real effect counter equaled the number of unique idempotency
  keys used (two), missing that the two no-key control calls each produce their own, separate,
  un-deduplicated effect too. Fixed by correcting the expected total to four (two keyed effects
  plus two no-key effects) and recording why in a short comment, rather than loosening the
  assertion to something that wouldn't have caught a real regression.
- **Four takeaways over the twenty-word limit** (deadline propagation, jitter, retry budget,
  circuit breaker), caught by the build's own topic-file check. Fixed by trimming each to its
  core claim without dropping the comparison it makes.

## Looks review, self-review

First `check-all.mjs --only reels --topic resilient-clients-timeouts-retries` run genuinely
failed on phone: "swipe from the caption on step 2 went to 2" — the same documented gotcha hit
on the previous topic (project memory, `learning-resources-scenes-reel-gotchas`): step 2's
`takeaway` squeezes the phone Visual pane and shifts the caption, breaking the test's swipe
target at the first non-predict step. Fixed per the documented remedy: removed the `takeaway`
from step 2 and folded its sentence into the step's own `body`, leaving five takeaways on the
reel (steps 3, 5, 6, 7, 8), still well over the minimum three. Re-ran `narration-teaches.mjs`
(still 0 flags) and the reel test; the second run passed cleanly: "Reel smoke test passed: 1
live reel(s) at desktop and phone sizes."

Opened a representative set of screenshots from `site/test-results/` and judged them against
`DESIGN.md`'s looks-review checklist:

- `phone-resilient-clients-timeouts-retries-02.png` (step 2, connection timeout, phone,
  post-fix) — renders cleanly, no caption shift, both rows legible with no crowding.
- `desktop-resilient-clients-timeouts-retries-07.png` (step 7, the circuit-breaker reveal,
  desktop) — the two-row contrast (closed, still failing / pays the full timeout vs. open,
  after it trips / fails in microseconds) renders cleanly, takeaway shown below it, sidebar step
  list and fig caption both legible.
- `desktop-resilient-clients-timeouts-retries-04-q.png` (step 4, predict frame, desktop) — both
  answer-option cards render fully, no clipping.
- `phone-resilient-clients-timeouts-retries-09.png` (Recap, phone) — the four-row recap renders
  cleanly with no overlap.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: the circuit-breaker reveal's own
  words ("fails in microseconds" vs. "pays the full timeout") make the mechanism explicit, not
  just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size, including the step 2 fix above.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  corrected value (the deadline already gone, the cluster of synchronized retries, an open
  breaker's fast failure, a new effect with no key) — never decorative.
- Captions match the picture at every checked step.

No findings beyond the phone-caption collision already fixed above. `coverage.json` →
`gapReview`: date 2026-10-24, by "Claude (single session)", open: [] (recorded in the committed
file). All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
