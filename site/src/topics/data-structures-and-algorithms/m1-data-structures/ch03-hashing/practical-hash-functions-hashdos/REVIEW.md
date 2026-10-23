## Content review, self-review, 2026-10-23

- Claims traced to sources: xxHash3's recommended-default status and non-adversarial quality scoping
  are quoted from xxHash's own README; Rust's `std::HashMap` SipHash 1-3 default and HashDoS-resistance
  claim are quoted from its own docs; the PRF definition and the hash-flooding history (1999
  `dnscache`, Crosby & Wallach 2003, Klink & Wälde 2011) are quoted from the SipHash paper itself,
  cross-checked independently against the AppSec slides; `rustc-hash`'s explicit DoS-resistance
  trade-off is quoted from its own README; CPython's own use of SipHash since PEP 456, and the
  independent citation of `oCERT-2011-003`, are quoted from the PEP itself. All 50 quotes pass
  `sources.mjs check`.
- A real, non-trivial correction was caught and fixed, not papered over: the chapter plan's own
  visual idea implied a random per-process seed alone defeats a collision-flooding attack.
  Re-deriving the claim from the SipHash paper (not from memory of writing the outline) found this
  overstates the guarantee — the paper's own §7 argues a randomly-seeded but still-linear public hash
  is breakable by a timing/adaptive attacker via Gaussian elimination, "the attack works no matter how
  k0, k1, ... are chosen." `FACT-CHECK.md` row 9 records this; steps 5-6 teach it as a predict-and-
  reveal pair rather than silently fixing the plan's wording.
- A second, independent real correction was caught while building `examples.py`, not before: an early
  draft benchmarked a from-scratch pure-Python SipHash loop against C-accelerated `hashlib.sha256` and
  got the ordering backwards (SHA-256 measuring "faster"). Diagnosed as measuring interpreter overhead,
  not the algorithms — the same class of mistake this project's topics 5/6 document for CPython string
  operations. Fixed by discovering, via PEP 456 and Python's own cmdline docs (now cited in
  `SOURCES.md`), that CPython's built-in `hash()` of `bytes`/`str` is itself a real, C-accelerated,
  randomly-seeded SipHash — the fair stand-in for the keyed/PRF tier. `FACT-CHECK.md` rows 13-15 record
  this, including the new, honest finding that the fast and keyed tiers measure close together on this
  machine, which the reel's step 9 presents as support for the paper's own "competitive in speed"
  claim rather than smoothing over.
- Two more real bugs were found and fixed by re-deriving what the measured numbers should mean, not
  by suppressing failing assertions: a `lookup_cost` that returned `len(bucket)` instead of actually
  walking the chain (produced a flat, meaningless 1.0x "slowdown"); and a `weak_hash` keyed with a
  scalar additive seed, which cannot scatter a precomputed collision set built on a byte sum (a sum is
  invariant under adding the same constant to every colliding key) — fixed by keying the hash's actual
  linear coefficients instead, exactly the Crosby-Wallach form the SipHash paper itself critiques.
- Gap hunt (`coverage.json` → `gapReview`): two real gaps found and consciously scoped out, both
  recorded with reasons rather than silently dropped — the timing side-channel attack is cited, not
  built (a separate, much larger undertaking than this topic's scope); universal/k-independent hashing
  is named with no mechanism, matching the syllabus's own *(skipped)* marking for that topic.
- Both syllabus clauses in `coverage.json` are copied word-for-word from
  `syllabus/data-structures-and-algorithms.md` line 74, matching the raw clause text exactly, with
  backticks stripped (coverage's `clean()` strips them from `scope` too). 16 expert items were written
  blind, from the syllabus line and sources alone, before any step was planned; two more were added
  after the benchmark-methodology correction, honestly dated after the fact rather than backdated.
- `FACT-CHECK.md`'s "Claims not made" section explicitly declines to claim the from-scratch SipHash-2-4
  implementation is production-ready or side-channel-resistant, declines to rank any tier as
  universally "best," and declines to re-derive the MurmurHash3 differential-cryptanalysis attack the
  AppSec slides only sketch.
- Narration was written directly in the MIT-professor persona and checked against
  `narration-teaches.mjs`'s description-overlap rule; three lines originally used digit years (1999,
  2011, 2012) inside spoken narration, flagged by `scripts/check-all.mjs`'s unspeakable-text check and
  rewritten as spoken words ("nineteen ninety nine," "twenty eleven," "twenty twelve").
- Two predict steps (step 3: what happens when an attacker chooses every key; step 5: does a random
  seed fix it) both have matching `answer` arrays in `narration.json`; both predict-question
  distractor sets were red-teamed in `FACT-CHECK.md` against the real nuance this topic's correction
  uncovered (precomputed vs. adaptive-timing attacker), not left as generic wrong answers.
- Three takeaways (steps 4, 6, 8) satisfy the three-minimum rule for a full topic's engagement arc;
  the build's 20-word takeaway limit caught three takeaways that were too long on the first pass
  (25, 28 and 35 words) — shortened without losing the claim.
- The build's on-screen-number check caught one number (`500`, from the historical "500 KB of POST
  data" figure) that appeared in `reel.tsx`'s body text without being computed in `examples.py` —
  reworded to "a few hundred kilobytes," since this is a cited historical fact, not a number this
  topic's own benchmark asserts.

## Looks review, self-review, 2026-10-23

`npm run build` is clean; `check-all.mjs --changed` passes every check (locked, docs, sources, build,
narration, reels, links). The reel smoke test (`PREVIEW_HELD=1 node tests/reels.mjs ... practical-
hash-functions-hashdos`) was run against a built, served preview to check the held topic specifically,
since a normal `--changed` sweep only tests live reels.

Two rounds of fixes made and confirmed this session:
1. First run (desktop + phone): step 5's padlock glyph ran into its own "random seed, chosen once per
   process" label (both too close together); step 6's two-column split-frame layout overflowed the
   drawing and overlapped itself on phone width. Fixed by moving step 5's label below the glyph instead
   of beside it, and rebuilding step 6 as a single vertical stack (scatter counts, then the timing
   side-channel) instead of a left/right split — phone-friendly, matching the kit's own `Stack`
   vertical-layout convention used elsewhere in this project.
2. Second run (desktop + phone): step 5's seed-label and its answered-state reveal text were still too
   close on phone (enlarged phone text scale). Fixed by pushing the answered-state text further down.
   Third run: clean at both sizes, both predict steps' answered states, all nine steps.

- Step 1 (Opening): the scanned-record row and the hash-box arrow render cleanly; the "every structure
  needs this first" line sits below both drawings without overlap.
- Step 2 (NonCryptoSpeed): four bars (XXH3, wyhash, FxHash, the measured `zlib.crc32` stand-in) land in
  sequence; the measured bar is caramel-highlighted against the other three's cinnamon, matching the
  colour grammar's "mechanism in focus" rule.
- Step 3 (FloodPredict) and its answer state: four choices legible at both sizes; the answered state's
  single-bucket collapse and O(n) caption render cleanly.
- Step 4 (HashDoSReveal): the short random-key chains beside the one long colliding chain, plus the
  measured ms/ratio figures and the three-disclosure history line, fit the frame at both sizes.
- Step 5 (SeedPredict) and its answer state: the padlock glyph and seed label sit clear of the hash
  box; four choices legible at both sizes.
- Step 6 (SeedReveal): rebuilt as a vertical stack (scatter counts, then the timing side-channel) after
  the left/right split overflowed phone width on the first smoke-test run; both parts stay legible and
  separated at both sizes now.
- Step 7 (SipHashPRF): the round pipeline cells and the PEP 456 callout read cleanly at both sizes.
- Step 8 (RustDefault): the `std::HashMap` and `FxHashMap` blocks, plus the cherry-outlined `const`
  warning, are legible and distinct without splitting needed.
- Step 9 (ProveIt): three bars (fast, keyed, crypto) at their real relative widths, plus the two
  summary lines, fit cleanly; the crypto bar's length (clearly the longest) reads at a glance as the
  one real surprise, matching the step's intent.

Final reel check: `Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.`
