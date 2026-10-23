# Fact-check — Resizing and incremental rehashing

Adversarial pass, re-deriving every claim in `OUTLINE.md`'s claims list from the fetched source
texts in `sources/`, never from memory of writing the outline.

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Doubling pays for the whole rehash in one insert, proportional to the table's current size — the same amortized argument already proved for a growable array. | Confirmed, cited not re-derived | This curriculum's own `dsa.aggregate-accounting-methods` (Ch.1) and `dsa.dynamic-arrays-growth-policy` (Ch.2) already prove the aggregate-method argument for doubling; this topic applies it to rehashing (the real cost here, distinct from copying) and measures the worst-single-operation number directly in `examples.py`. |
| 2 | Redis `dict` keeps both the old and new table live and migrates entries a bounded number at a time. | Confirmed | `sources/redis-dict-c.txt`: "Prepare a second hash table for incremental rehashing" and "Performs N steps of incremental rehashing. Returns 1 if there are still keys to move from the old to the new hash table." |
| 3 | Migration is piggybacked on ordinary lookup/insert operations, not a background thread. | Confirmed | `sources/redis-dict-c.txt`: "This function is called by common lookup or update operations in the dictionary so that the hash table automatically migrates from H1 to H2 while it is actively used." Confirmed further by the two real call sites of `_dictRehashStep(d)` inside the dictionary's own lookup/insert code paths. |
| 4 | A single incremental-migration step is bounded — caps both the number of buckets moved and the number of empty buckets it will scan. | Confirmed | `sources/redis-dict-c.txt`: "Note that a rehashing step consists in moving a bucket... it is not guaranteed that this function will rehash even a single bucket, since it will visit at max N*10 empty buckets in total, otherwise the amount of work it does would be unbound and the function may block for a long time." |
| 5 | Incremental migration keeps both tables live for the whole migration, a sustained memory cost, not a momentary one. | Confirmed by construction | `examples.py` measures the number of operations incremental migration takes to complete a single resize, directly showing the peak-memory window's real duration (many operations) versus doubling's (one operation). |
| 6 | Redis `dict` has a real, named minimum-fill threshold (1/8 occupancy) below which it is willing to shrink. | Confirmed | `sources/redis-dict-h.txt`: "#define HASHTABLE_MIN_FILL 8 /* Minimal hash table fill 12.5%(100/8) */". |
| 7 | Every number put on screen (steps 2, 6, 7, 8) is measured directly in `examples.py`. | Confirmed by construction | `examples.py` builds a real hash table under both resize strategies and measures per-operation cost, worst-case cost, and migration duration directly — see `examples.py` itself. |

## Red team: the predict questions

**Step 3 (LatencyPredict).** Distractors tested against the real mechanism:
- "About the same as any other insert" — wrong, and tests whether a learner has internalized "amortized O(1)" as meaning *every* operation is cheap, rather than *averaged* cheap; the one rehashing insert is not.
- "A bit slower, but still roughly constant" — wrong, and tests the same misconception at a softer degree; the cost scales with n, not a constant factor slower.
- "Proportional to the whole table's current size — far slower than its neighbors" (correct) — directly what doubling's all-at-once rehash does: every existing entry is rehashed before the triggering insert can finish.
- "It depends only on how many collisions that one key has" — wrong, and tests whether a learner conflates this topic's resize cost with an ordinary single-key lookup/insert cost from earlier topics, which is a different, already-covered question.

**Step 5 (MigrationPredict).** Distractors tested against the real mechanism:
- "A dedicated background thread, migrating continuously" — wrong, and tests the most common guess for "spread the work out"; Redis's own single-threaded event-loop design has no such thread for this.
- "Piggybacked on every ordinary lookup or insert that touches the table" (correct) — directly what the source's own comment and the two real `_dictRehashStep` call sites show.
- "All at once, just delayed until the server is idle" — wrong, and tests whether a learner imagines "incremental" as "deferred lump sum" rather than genuinely spread across many small steps.
- "Only when the table detects memory pressure" — wrong, and tests whether a learner conflates this topic's two separate ideas (incremental migration's trigger, and the shrink-under-memory-pressure threshold) into one mechanism.

## Currency notes

- Both Redis source files were fetched from the `unstable` branch, the repository's live, currently developed branch, not an archived historical snapshot.
- `HASHTABLE_MIN_FILL`'s value (8, meaning 1/8 or 12.5%) is read directly from the header's own `#define` and comment, not inferred or remembered from an older Redis version.

## Claims not made

- No claim that this topic's from-scratch table's measured numbers (worst-op cost, migration-duration-in-operations) match Redis's own real-world benchmarked performance — they are this topic's own honest measurements of the same two strategies' real shape.
- No claim that incremental migration is strictly better than doubling, or vice versa — `post-notes.md` and step 7's own caption name the real trade-off (smoother latency vs. sustained peak memory) without ranking one as universally superior.
- No claim about concurrent or lock-free resizing mechanics — named with no mechanism in `post-notes.md`'s frontier section, since the syllabus doesn't name it for this topic.
- No claim about the specific numeric value of Redis's expansion threshold (`dict_force_resize_ratio`) beyond what the fetched source's own comment states (a ratio of 4) — not independently re-derived from a separate definition site, since the comment itself is the primary source for that number.
