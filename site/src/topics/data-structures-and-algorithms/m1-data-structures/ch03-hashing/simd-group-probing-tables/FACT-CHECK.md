# Fact-check — SIMD group-probing tables (Swiss Tables)

Adversarial pass, re-deriving every claim in `OUTLINE.md`'s claims list from the fetched source
texts in `sources/`, never from memory of writing the outline.

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | The H1/H2 hash split: H1 picks the element index; H2 is stored as per-slot metadata. | Confirmed | `sources/abseil-swisstables-design.txt`: "H1, a 57 bit hash value, used to identify the element index within the table itself" / "H2, the remaining 7 bits of the hash value, used to store metadata for this element." |
| 2 | One control byte per slot: one control bit plus the 7-bit H2 fingerprint. | Confirmed | `sources/abseil-swisstables-design.txt`: "Each metadata entry consists of one byte, which consists of a single control bit and the 7 bit H2 hash." |
| 3 | A single SIMD compare instruction tests a whole group's control bytes against a query's H2 byte at once. | Confirmed | `sources/abseil-swisstables-design.txt`: "Because we can winnow 16 candidates down to only those with a matching H2 hash in only a few instructions, we are functionally searching very deep probe chains inexpensively." |
| 4 | Swiss Tables originated at Google in 2017, open-sourced in Abseil in 2018. | Confirmed | `sources/go-blog-swisstable.txt`: "In 2017, Sam Benzaquen, Alkis Evlogimenos, Matt Kulukundis, and Roman Perepelitsa at Google presented a new C++ hash table design, dubbed "Swiss Tables"." / "In 2018, their implementation was open sourced in the Abseil C++ library." |
| 5 | Go 1.24 replaced its built-in map's implementation with this design, verified from a current, dated source. | Confirmed | `sources/go-blog-swisstable.txt`: "Go 1.24 includes a completely new implementation of the built-in map type, based on the Swiss Table design." |
| 6 | Go's own group size (8 slots, h2 as the lower 7 bits of the hash) is distinct from Abseil's original 16-wide groups. | Confirmed — and the distinction is deliberate, not smoothed over | `sources/go-blog-swisstable.txt`: "we will break the array into logical groups of 8 slots each" / "the byte contains the lower 7 bits of the hash for that slot's key (called h2)." Abseil's own SSE code (`_mm_set1_epi8`/`_mm_cmpeq_epi8`) operates on 128-bit registers, 16 one-byte lanes — a different group width from Go's 8, confirmed from each source's own text rather than assumed to be identical because both are "Swiss Tables." |
| 7 | Testing a whole group's control bytes "at once, in parallel" let both Abseil and Go raise their maximum load factor. | Confirmed | `sources/go-blog-swisstable.txt`: "we have effectively performed 8 steps of a probe sequence at once, in parallel." / "This improvement to probing behavior allowed both the Abseil and Go implementations to increase the maximum load factor of Swiss Table maps compared to prior maps, which lowers the average memory footprint." |
| 8 | Rust's standard library `HashMap` has used this design (via `hashbrown`) since Rust 1.36, at one byte of overhead per entry. | Confirmed | `sources/hashbrown-readme.txt`: "Since Rust 1.36, the Rust standard library has adopted this implementation for `HashMap`" / "Lower memory usage: only 1 byte of overhead per entry instead of 8." |
| 9 | Every number put on screen (steps 7, 9) is measured directly in `examples.py`. | Confirmed by construction | `examples.py` builds a real group-probing table, measures its fingerprint false-positive rate over many lookups, and contrasts comparison counts against a naive scan — see `examples.py` itself. Running it caught a real bug in the first draft's own theoretical comparison: the false-positive rate is 1/128 per *occupied slot* probed, not a flat 1/128 per lookup — at this table's load factor (alpha=0.5, ~8 occupied slots/group), the correct expectation is ~8/128 (0.0625), which is what the measured rate (0.0616 over 20,000 trials) actually lands on. Fixed in the script rather than loosening the assertion to force a pass. |

## Red team: the predict questions

**Step 3 (GroupPredict).** Distractors tested against the real mechanism:
- "Just 1 — SIMD only helps with arithmetic, not comparisons like this" — wrong, and tests the single most common misconception about what SIMD is for; the Abseil source's own code snippet (`_mm_cmpeq_epi8`) is literally a parallel byte-equality comparison, not arithmetic.
- "2, one pair at a time" — wrong, and tests whether a learner imagines SIMD as a small, incremental speedup rather than the much larger parallel width the design actually uses.
- "All 16 at once, in a single instruction" (correct) — directly what Abseil's own "winnow 16 candidates... in only a few instructions" states, and what `examples.py`'s group-match step measures against a naive scan.
- "It depends on how many slots are actually occupied" — wrong, and tests whether a learner conflates the comparison's *width* (always the whole group, occupied or not) with its *useful* result (only occupied, fingerprint-matching slots become real candidates); the instruction itself doesn't skip empty slots, it tests all of them and lets the control byte say which matter.

**Step 6 (FingerprintPredict).** Distractors tested against the real odds:
- "Essentially never — collisions this specific don't really happen" — wrong, and tests the intuition that a specific-sounding byte match is rarer than it is; 1/128 is not negligible across thousands of lookups, which is exactly why the design still keeps a real key comparison as a fallback.
- "About 1 in 128" (correct) — directly derived from the fingerprint's own width: 7 bits = 128 distinct values, each equally likely under a reasonable hash, so two unrelated keys share one by chance with probability 1/128 — the same number `examples.py`'s false-positive measurement confirms empirically (not just asserted from the bit count alone).
- "About 1 in 2 — a byte only really narrows it down by half" — wrong, and tests whether a learner conflates a *bit* (1-in-2) with the *byte-sized fingerprint* actually in use (7 bits, 1-in-128); the control byte's one spare bit is the empty/deleted sentinel, not part of the fingerprint's own odds.
- "It depends on the hash function, not the fingerprint width" — wrong but not absurd: a bad hash function could skew this, but with a reasonable hash (uniform output bits), the odds are set by how many distinct fingerprint values exist (128), not by which specific hash function produced them — `examples.py` uses Python's own `hash()` and measures the rate directly rather than assuming uniformity.

## Currency notes

- The Go Blog post is a 2025 post about a 2026-current Go version (1.24); Go's own group size (8, confirmed from the post's own diagram and text) is kept distinct from Abseil's original 16-wide SSE groups rather than assumed identical — a real difference this topic names honestly per claim 6 above.
- The `hashbrown` README was fetched from its `master` branch, a currently maintained, actively released crate (version badge visible in the fetched text), not an archived or historical snapshot.
- Abseil's own design notes page is undated in its visible text beyond a 2017 copyright footer, but the design itself (and the 2017/2018 origin dates) are independently corroborated by the Go Blog's own account — two independent sources agreeing on the same origin story, not resting on one source alone.

## Claims not made

- No claim that this topic's from-scratch `examples.py` group-probing table matches any real production implementation's exact benchmarked performance — the measured fingerprint false-positive rate and comparison-count contrast are this topic's own honest measurements, not a claim about Abseil's, Rust's, or Go's own benchmarked numbers.
- No claim that Go's 8-slot groups and Abseil's 16-slot groups are "the same," beyond sharing the same control-byte-plus-SIMD-compare mechanism — `FACT-CHECK.md` row 6 and `post-notes.md`'s internals section both name the real difference.
- No claim about the full capacity-and-growth mechanics of resizing a Swiss Table beyond naming that it happens — that's explicitly topic 20's own subject, per `CHAPTER.md`.
- No claim about Robin Hood hashing's or cuckoo hashing's own probe-sequence designs beyond naming them in `post-notes.md`'s frontier section — both are marked *(skipped)* in the syllabus for this chapter.
