# Review — de.cache-consistency-invalidation

## Content review, self-review, 2026-10-31

Read cold, in order: the previous topic's (`de.cache-patterns-eviction-policies`) own handoff,
then this topic's own files in order (reel and scenes, narration, post-notes, pre-notes,
prerequisites, registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next
topic's syllabus line (Redis and Valkey internals).

1. **Flow.** Clean. The hook directly answers topic 25's own handoff ("an eviction policy alone
   says nothing about whether a cached value is still correct"), posing the exact race rather
   than a generic restatement. `uses: ['cache-patterns-eviction', 'physical-vs-logical-replication']`
   matches `CHAPTER.md`'s own plan for this topic.
2. **Pre-notes.** Checked against `notes-rules.ts` (5 bullets, no links). Cache-aside and CDC are
   genuinely carried forward from earlier topics, not retaught; idempotent operation and eventual
   consistency are primers for what this reel actually teaches; race condition names the whole
   topic's own frame.
3. **Gap hunt.** Checked the syllabus line (`syllabus/data-engineering.md:275`) clause by clause.
   Caught one mismatch on the first pass: the syllabus's own "update the cache" uses double
   quotes, and my first `coverage.json` clause used single quotes, which the checker's own
   exact-substring match correctly rejected — fixed by copying the double-quote style exactly.
   Four clauses: the race and why update is wrong, versioned keys/leases, CDC-driven invalidation,
   and per-field staleness. All four mapped to real steps; no gap against the syllabus line, the
   four sources, or the expert list (ten items).
4. **Expert reader.** The predict step (step 2) was checked for the trap of assuming updating the
   cache (rather than deleting it) would have prevented the hook's race: the wrong answer is
   tempting because it sounds like "doing more" should help, and the explain text names the real
   reason it's actually riskier (updates can land out of order and silently overwrite a newer
   value) rather than just asserting delete is better. The "Prove it" step was checked against the
   trap of assuming leases (rather than CDC-driven invalidation) would catch a forgotten
   invalidation call — leases only arbitrate a specific read-then-write race, they do nothing for
   a write path that never tries to invalidate at all.
5. **Engagement.** Hook (step 1) poses the real open question topic 25's own handoff left.
   Predict at step 2, within the first two. Four takeaways (steps 4, 5, 6, 7), each a distinct,
   separately-sourced claim. Recap (step 8) pulls every layer into one line each. "Prove it"
   (step 9) is a genuine synthesis task (a new, unnamed failure mode — a forgotten invalidation
   call — reasoned about using this topic's own fixes) rather than a restatement.
6. **Narration teaches.** `narration-teaches.mjs` passed clean on the first run: 0 flags, highest
   overlap 9% (step 9), every line under the 50-word limit. No digits, symbols or code names
   appear in any narration line: "lease" is spoken as "a token tied to that exact request," "CDC"
   as "the real system's own record of what changed," "TTL" as "how fresh something needs to be."

No other findings. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check site/src/topics/.../cache-consistency-invalidation` —
  4/4 quotes verified word for word (after trimming one quote that broke on a footnote marker
  merged into the source text — see Fixes below).
- `python3 examples.py` — pass. The delete-after-write race, reproduced without a lease, ends
  with the cache holding the stale value ("Alice") while the database holds the new one ("v2").
  With a lease, the identical interleaving's stale write-back is rejected and the cache stays
  cold. This topic's own hosted lab legs also ran: an unprotected baseline where 50 concurrent
  readers caused 50 backing-store fetches; single-flight coalescing reducing the same 50 readers
  to 1 fetch; and early expiration's refresh-probability sum measured rising from 0.0005 (far
  from expiry) to 0.5530 (close to it), confirming a smooth curve rather than a cliff at the exact
  TTL boundary.
- `node scripts/check-all.mjs --skip reels,links,narration --topic cache-consistency-invalidation`
  — failed once on the first run (coverage: the quote-style mismatch on the "update the cache"
  clause), fixed by matching the syllabus's own double-quote style; passed clean on the second
  run (locked, docs, sources, build — 238 pages built).
- `node scripts/check-all.mjs --only links,narration --topic cache-consistency-invalidation` —
  pass, 0 broken links; the title mismatches reported are all pre-existing, in the Rust domain,
  unrelated to this topic.
- `node scripts/check-all.mjs --only reels --topic cache-consistency-invalidation` — pass, "Reel
  smoke test passed" at desktop and phone sizes (confirmed after learning topic 25's own
  Row-length gotcha and keeping every label/value to 1-3 words from the start this time).

## Fixes made during this build

- **One `SOURCES.md` quote broke on a footnote marker** ("commits [7]. We deploy invalidation
  daemons" in the Memcache paper) — fixed by starting the quote after the marker instead of
  trying to quote around it, the same class of fix as the recurring footnote-marker gotcha.
- **The build's own coverage check caught a quote-style mismatch**: the syllabus line's own
  `"update the cache"` uses double quotes, and the first `coverage.json` clause used single
  quotes — an exact-substring check correctly rejected it. Fixed by copying the syllabus's own
  punctuation exactly.
- **Learned from topic 25 and applied from the start this time**: every `scenes.tsx` `Row`
  label/value was kept to 1-3 words from the first draft, rather than discovered as a reel-test
  failure after the fact — the reel smoke test passed on its first real run for this topic.

## Looks review, self-review

`check-all.mjs --only reels --topic cache-consistency-invalidation` passed on the first run at
both sizes, with no text-overlap fix needed.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: each reveal's own row text (e.g.
  "reader's lease" / "now invalid", "stale write-back" / "rejected") makes the claim explicit,
  not just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  measured value (the stale cache state, the rejected write-back, the commit log's own
  guarantee, the marked-critical field, every "Prove it" conclusion) — never decorative.
- Captions match the picture at every checked step.

No findings beyond the fixes already made above. `coverage.json` → `gapReview`: date
2026-10-31, by "Claude (single session)", open: [] (recorded in the committed file). All reviews
in this file are self-review by the same session that wrote the content; no independent reviewer
ran. Expert sign-off: pending.
