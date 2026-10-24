# Review — de.buffer-pool-page-replacement

## Content review, self-review, 2026-10-24

Read cold, in order: the previous topic's (`de.pages-slotted-pages-tuple`) own handoff, then
this topic's own files in order (reel and scenes, narration, post-notes, pre-notes,
prerequisites, registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next
topic's syllabus line (write-ahead logging and fsync semantics).

1. **Flow.** Clean. The hook directly answers the real handoff the previous topic left open
   ("the next question is the cache in front of it: the buffer pool"), rather than a generic
   restatement. `uses: ['slotted-page-layout']` matches `CHAPTER.md`'s own plan for this topic.
2. **Pre-notes.** Checked against `notes-rules.ts` (5 bullets, no links). Every term (buffer
   pool, pin/unpin, checkpoint, page cache) is genuinely assumed rather than taught by this reel,
   except where the term itself is exactly what the reel teaches — those bullets name the term as
   a primer, not the mechanism the reel reveals. The checksum/XID bullet is deliberately a
   non-primer, naming what's assumed-not-retaught from the last topic.
3. **Gap hunt.** Checked the syllabus line (`syllabus/data-engineering.md:231`) clause by clause
   against `coverage.json`'s mapped clauses, copying each clause from the markdown-*stripped*
   scope (per `site/src/lib/syllabus.ts`'s `clean()`, dropping the raw line's backticks around
   `O_DIRECT` and `io_method`) rather than the raw `.md` text — avoided on the first attempt,
   learned from topics 37 and 84. All three clauses present, each mapped to real steps, covering
   the syllabus line with nothing left over. Every `at.step` checked against the real `reel.tsx`
   titles after the one late title edit (step 8, to drop a literal "18") — re-synced immediately
   in `coverage.json` and `OUTLINE.md` in the same pass, not left stale. No gap found against the
   syllabus line, the seven sources, or the expert list (eleven items).
4. **Expert reader.** The predict step (step 4) was checked for the trap of assuming a big scan
   must occupy one real buffer per page touched: the wrong answer is tempting because that's
   exactly how a plain, unbounded LRU or clock sweep would behave, and the reveal (step 5)
   demonstrates the real ring-bounded footprint directly with a real, much-bigger-than-the-pool
   table rather than asserting it. The double-caching step (step 7) and the second-cluster step
   (step 8) were both checked for honesty: `O_DIRECT` is named and sourced but not run (neither
   cluster here uses it), while the second-cluster claim is not sourced-only — this sandbox
   genuinely runs a second, real PostgreSQL 18 cluster, discovered and confirmed directly with
   `SELECT version()` rather than assumed from the chapter plan's "sourced-only if PostgreSQL 16"
   fallback.
5. **Engagement.** Hook (step 1) poses the real open question the previous topic's handoff left.
   Predict at step 4, within the first four. Five takeaways (steps 3, 5, 6, 7, 8) — more than
   topic 84's three, since this topic's material has more independently measurable claims, and
   each takeaway states a distinct, separately-verified claim rather than restating another
   step's. Recap (step 9) pulls every layer into one line each. "Prove it" (step 10) is a
   genuine synthesis task: reasoning about whether two independent huge scans interfere with each
   other through the shared buffer pool, directly extending the ring-bounded-footprint claim to a
   new, two-scan scenario rather than just restating it.
6. **Narration teaches.** `narration-teaches.mjs` initially flagged step 1 (58% overlap, "reads
   the screen") and step 8 (a verbatim 30-word match against its own description) — both fixed by
   rewriting those lines to paraphrase the mechanism rather than the description's own wording;
   the second run passed clean: 0 flags, highest overlap 28% (step 5), every line under the
   50-word limit. No digits, symbols or code names appear in any narration line: "PostgreSQL" is
   spoken as "this sandbox's own cluster"/"a genuinely newer release," "clock sweep" as "a hand
   sweeps," "usage count" as "a counter," "`O_DIRECT`" as "one setting," "`io_method`"/"async I/O"
   as "a newer approach to reading many pages at once."

No other findings. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check` — 17/17 quotes verified word for word (after trimming one
  quote that broke on a line-wrap-hyphenated word, "user-space," in the Linux manual page's own
  text — see Fixes below).
- `python3 examples.py` — pass, "buffer-pool-page-replacement examples: all checks pass," run
  repeatedly for stability against this sandbox's own PostgreSQL 16 cluster and a genuine second
  PostgreSQL 18 cluster: a real buffer's usage count measured rising to a cap of `5`; a real
  `26,688`-page table (built with `CREATE TABLE AS SELECT`, itself using the documented 16MB
  bulk-write ring — confirmed separately at exactly `2,048` resident buffers immediately after
  load) measured leaving `2,144` buffers resident after a full scan; a real dirtied buffer's flag
  measured flipping `true` → `false` across a real checkpoint; a warm table's scan measured as
  zero new disk reads and new buffer hits; PostgreSQL 18's `io_method = worker` measured issuing
  real reads and hits under the `bulkread` context for a genuine scan on the sandbox's second
  cluster (port `5433`).
- `node scripts/narration-teaches.mjs .../buffer-pool-page-replacement` — failed once (step 1
  read the screen, step 8 verbatim-matched its description), passed clean on the second run: 0
  flags, highest overlap 28%, every line under the 50-word limit, no digits.
- `node scripts/check-all.mjs --skip reels,links,narration --topic buffer-pool-page-replacement`
  — pass (locked, docs, sources, build).
- `node scripts/check-all.mjs --only links,narration --topic buffer-pool-page-replacement` —
  pass, 0 broken links; no new title-mismatch warnings traced to this topic.
- `node scripts/check-all.mjs --only reels --topic buffer-pool-page-replacement` — pass, "Reel
  smoke test passed: 1 live reel(s) at desktop and phone sizes."

## Fixes made during this build

- **The Postgres and PostgreSQL 18 clusters were both down at the start of this session** (a
  fresh container) — caught directly (`psycopg2.OperationalError: Connection refused`) and fixed
  with `sudo service postgresql start`, which brought both clusters up together.
- **The first `sequential_scan_ring_bounds_a_bigger_tables_footprint` attempt used a plain
  `INSERT ... SELECT`**, which uses no buffer-ring strategy at all — the table's own pages simply
  filled the pool as written and stayed there, giving a false "fully resident" result that looked
  like the ring strategy had failed. Fixed by switching to `CREATE TABLE AS SELECT`, which
  genuinely exercises the documented 16MB bulk-write ring during the load itself (confirmed
  separately at exactly 2,048 resident buffers right after load, matching the sourced ring size).
- **A backend's own `pg_statio_user_tables`/`pg_stat_io` reads came back unchanged immediately
  after the exact query meant to move them**, on every run, not a one-off flake — diagnosed by
  confirming via a separate `psql` session that the real, non-zero values existed, which ruled
  out the measured query itself. Fixed with `pg_stat_force_next_flush()` immediately after each
  measured query, now also recorded as a general gotcha in shared project memory for any future
  topic in any domain that reads a cumulative-stats view.
- **One `SOURCES.md` quote from the Linux manual page broke on a line-wrap-hyphenated word**
  ("user-space," hyphenated across a line break in the source HTML, which the checker's own
  dehyphenation normalization collapsed to "userspace" while my quote kept the hyphen) — fixed by
  shortening the quote to end before that word.
- **`reel.tsx`'s step 8 title originally named "PostgreSQL 18" directly**, tripping the build's
  own whole-file digit scan — fixed by rewriting it to "a genuinely newer cluster's own async
  I/O, measured for real," and re-syncing `coverage.json`'s and `OUTLINE.md`'s matching
  references in the same pass.
- **`narration-teaches.mjs` flagged step 1 (58% overlap, reads the screen) and step 8 (a verbatim
  phrase match)** — both rewritten to paraphrase the mechanism in different words than the body;
  the second run passed clean.

## Looks review, self-review

`check-all.mjs --only reels --topic buffer-pool-page-replacement` passed on the first run at
both sizes, with no text-overlap fix needed this time (row label/value lengths were kept short
from the start, following the pattern established across every prior topic in this chapter).

Opened a representative set of screenshots from `site/test-results/` and judged them against
`DESIGN.md`'s looks-review checklist:

- `phone-buffer-pool-page-replacement-05.png` (the ring-footprint reveal, phone) — renders
  cleanly, no overlap, both numbers legible.
- `desktop-buffer-pool-page-replacement-04-q.png` (step 4, predict frame, desktop) — both
  answer-option cards render fully, no clipping.
- `desktop-buffer-pool-page-replacement-08.png` (step 8, the second-cluster reveal, desktop) —
  renders cleanly, sidebar and fig caption both legible.
- `phone-buffer-pool-page-replacement-09.png` (Recap, phone) — all four rows render cleanly with
  no overlap.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: each reveal's own row text (e.g.
  "the table" / "26,688 pages" vs. "resident after a scan" / "2,144 buffers") makes the measured
  claim explicit, not just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  measured value (the usage-count cap, the ring-bounded footprint, the cleaned dirty flag, the
  bypassing flag, the measured second-cluster activity, every "Prove it" conclusion) — never
  decorative.
- Captions match the picture at every checked step.

No findings beyond the fixes already made above. `coverage.json` → `gapReview`: date
2026-10-24, by "Claude (single session)", open: [] (recorded in the committed file). All reviews
in this file are self-review by the same session that wrote the content; no independent reviewer
ran. Expert sign-off: pending.
