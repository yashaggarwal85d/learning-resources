# Outline — Practical hash functions and HashDoS

## Learning outcomes

1. Name the cost/safety trade-off across non-cryptographic, keyed and cryptographic hashes, with one real example of each, and say which tier a real system (Rust's `std::HashMap`, `rustc`'s own compiler) actually chose and why.
2. Explain the HashDoS mechanism: why a fast public hash over attacker-controlled keys degrades a hash table's expected O(1) lookup to worst-case O(n), measured, not just asserted.
3. Explain why a per-process random seed defeats an attacker who must guess keys in advance, and why that alone is not the same guarantee as a cryptographically strong keyed hash (PRF) against an attacker who can query and time the server adaptively.

## Engagement arc

- **Hook (step 1):** the log's request IDs need O(1) lookup by key, not O(n) scanning — a hash function is the mechanism, drawn as a black box the rest of the reel opens up.
- **Predict #1 (step 3, within the first four steps):** "An attacker controls every key your server hashes with a fast public hash. What happens?"
- **Predict #2 (step 5):** "Does giving that hash a random per-process secret fix it?" — the step the fact-check correction (below) exists to set up honestly.
- **Surprising number:** step 4's measured real slowdown inserting attacker-crafted colliding keys vs. random keys into the same chained table under a fast public hash (real ratio, computed in `examples.py`, not asserted).
- **Takeaways:** steps 4, 6, 8 (three, within the reel's nine steps, one per step maximum).
- **Recap (step 9, "Prove it"):** the three-tier speed/safety chart, all three numbers measured on the same machine in the same run.

## The correction this plan makes before any step is built

The chapter plan's visual idea for this topic said: "the same stream re-run under a known weak unkeyed hash with attacker-chosen keys, landing in a tight cherry cluster instead of spread out — then re-run a third time with a per-process seed added, scattering again," as if a random seed alone closes the problem. Research (section 3; see `SOURCES.md` → the SipHash paper) found this is not the whole story: Aumasson & Bernstein's own paper argues at length that merely adding random entropy to a *linear* public hash family (the Crosby–Wallach "secret-key universal hash" proposal, and "many of the hash-flooding defenses proposed since December 2011") is still breakable by an attacker who can observe per-query timing and issue adaptive queries, via Gaussian elimination against the hash's linear structure — regardless of how the seed was chosen. The actual fix needs the keyed hash to be a cryptographically strong PRF (SipHash's real design goal), not merely "has a secret." Steps 5–6 are built around this corrected claim, and `FACT-CHECK.md` records it as this topic's version of the kind of correction `strings-string-builders` made about CPython's concatenation masking (see `[[learning-resources-check-all-gotchas]]`-style project precedent). The step 5/6 predict-and-reveal pair teaches the naive-seed intuition as the *tempting wrong answer*, not as a strawman — it is the literal 2011–2012 industry response the sources describe.

## Steps

### 1 — Opening
- **fig:** `Opening`
- **Visual idea:** the log's request IDs (short strings) arriving one at a time; each one needs "find this record's slot" — first drawn as a doomed linear scan through a row of records (every record checked), then the same arrival cut to one step by a hash function box that turns the key directly into a slot index. What moves: the scan draws record by record (`Draw`, slow, deliberate) and visibly loses; the hash-box version `Decode`s the key straight to an index in one beat.
- **On screen:** "O(n) scan" vs "O(1) via h(key)" with the real record count from `examples.py`.
- **Caption:** every structure in this chapter needs one thing first: a function that turns a key into a number, fast, so a table can jump straight to it.
- **Narrator's line of thought:** she opens on the scan losing the race, not on a definition — "watch the scan; it has to touch every record before it can rule one out." Then: "the hash function is the only new idea in this picture — everything else is the array you already know." She does not read the caption; she explains why the scan is the thing being replaced.
- **Duration:** ~3.5s.

### 2 — NonCryptoSpeed
- **fig:** `NonCryptoSpeed`
- **Visual idea:** a short bar race of three real non-cryptographic hashes (XXH3, wyhash, FxHash, named) processing the same batch of request-ID-sized keys — measured relative throughput from `examples.py` (`zlib.crc32`, a real C-accelerated non-cryptographic checksum, stands in for "a fast non-cryptographic hash," benchmarked on this machine; the named XXH3/wyhash/FxHash are the syllabus's real examples of the tier, not the specific function timed — their own vendor GB/s figures are cited in prose only). What moves: `Plot` one bar per hash landing in order of speed, then `Count` the ratio to the next tier up (built in step 7/9).
- **On screen:** the real measured nanoseconds-per-key for the fast hash.
- **Caption:** these are built for one thing: raw speed on ordinary keys. None of them were designed to resist an opponent choosing those keys.
- **Narrator's line of thought:** "notice what's missing from that list of design goals — nobody asked what happens if the keys are chosen against you." She names the wrong intuition directly: fast usually also means "good enough," and that's the assumption the next two steps break.
- **Takeaway candidate:** none (first half of the setup).
- **Duration:** ~3.5s.

### 3 — FloodPredict (predict #1)
- **fig:** `FloodPredict`
- **Visual idea:** the question frame only: the same fast-hash table from step 2, now fed a stream of keys with a red question mark over the incoming arrow — "an attacker chooses every one of these keys." No answer shown yet.
- **Predict options:**
  1. "Nothing changes — a hash function's speed doesn't depend on its input." (wrong: conflates raw hashing speed with table performance)
  2. "The table gets a little slower, proportional to how many keys collide." (tempting half-truth: true for a few collisions, not for a crafted flood)
  3. **"The table's performance can collapse to one giant list — every lookup becomes O(n)."** (correct)
  4. "It only matters if the attacker also knows the table's exact size." (wrong: table size is usually guessable or irrelevant — a multicollision degrades performance across any reasonable size)
- **Explain (revealed after the pick):** a fast public hash has one published formula. An attacker who can compute it offline can find — and send — thousands of keys that all land in the same slot, on purpose. The table doesn't get "a little slower": every one of those keys now lives in the same bucket, so a lookup there costs as much as scanning the whole flood.
- **Narrator's line of thought:** she asks the question and holds — "think about what 'fast' actually promised you back there. Did it promise anything about who chooses the keys?" — before revealing.
- **Duration:** ~2s.

### 4 — HashDoSReveal
- **fig:** `HashDoSReveal`
- **Visual idea:** two rows built from the same fast hash: a chained table fed random keys (chains short, roughly even) beside the same table fed `examples.py`'s own crafted colliding keys (one chain growing to swallow almost every key, `cherry`). What moves: both tables fill key by key on the same beat; the colliding row's one chain visibly outpaces every other slot, `cherry`-flashed once it's clearly the longest.
- **On screen:** the real measured insert time for n colliding keys vs. n random keys into the same table (the surprising number, computed in `examples.py` — a concrete ratio, e.g. "X times slower" at a stated n, both numbers real and asserted).
- **Caption:** this isn't hypothetical — it's the oldest denial-of-service trick in the hashing book, found independently twice: 1999's `dnscache`, Crosby & Wallach's 2003 paper, and a 2011 disclosure that took down web servers with 500 KB of crafted form data.
- **Takeaway:** "A fast public hash assumes the input doesn't fight back — an attacker who can choose every key can make every one of them collide."
- **Narrator's line of thought:** she names the real history before the mechanism, because the mechanism alone sounds like a toy: "this has been rediscovered twice, a decade apart, because the fix people reach for first — just add some randomness — turns out not to be enough. You're about to find out why, the same way the field did."
- **Duration:** ~4.2s.

### 5 — SeedPredict (predict #2)
- **fig:** `SeedPredict`
- **Visual idea:** the question frame only: the same weak hash, now with a small padlock icon labelled "random seed, chosen once per process, unknown to the attacker" added to its formula. No answer shown.
- **Predict options:**
  1. "Yes — the attacker can no longer predict which keys collide, so the flood fails." (tempting, the actual industry response in 2011–2012; incomplete)
  2. **"Not by itself — if the hash is still a simple linear formula, an attacker who can time your server's responses can still work out the seed."** (correct)
  3. "No, random seeds don't help at all against this attack." (wrong — a seed does defeat a precomputed, offline attack; it's not nothing)
  4. "Yes, as long as the seed is at least 128 bits." (wrong: the issue isn't seed length, it's whether the hash family itself is a strong pseudorandom function)
- **Explain (revealed after the pick):** a random seed really does stop an attacker who has to precompute colliding keys offline, in advance, with no access to your server. It does not stop an attacker who can send one key at a time and measure how long each lookup takes: if the underlying hash is a simple linear formula (the kind Crosby & Wallach proposed keying), that timing signal leaks enough information to solve for the seed itself, one guess at a time — the fix needs the hash to be unpredictable in a much stronger sense than "has a secret."
- **Narrator's line of thought:** "this is the answer most teams actually shipped in 2011, and it is not wrong — it's just not enough. Watch what's different about the one case where it still breaks." She directs attention to "linear formula" as the exact property the fix has to remove, not "random enough."
- **Duration:** ~2.2s.

### 6 — SeedReveal
- **fig:** `SeedReveal`
- **Visual idea:** split frame. Left: the step-4 crafted colliding keys fed to the same weak hash, now with a random per-process seed the attacker doesn't know (implemented as a random coefficient vector in the hash's own linear formula, not a scalar added on) — measured, they scatter back into separate buckets (`examples.py`: count of distinct buckets, before vs. after seeding — a real jump from "all 4,000 keys in one bucket" to "256 of 256 buckets," i.e. the whole table). Right: a small, slowed-down diagram of the timing side-channel — one probe, one timing measurement, one narrowed-down guess about the seed, repeating — ending on a `cherry` label "linear ⇒ solvable by elimination," not a working exploit, since this is a cited mathematical argument, not a system this topic builds.
- **On screen:** the real measured bucket-scatter numbers (left, e.g. "1 of 256" → "256 of 256"); the labelled argument, not a number, on the right.
- **Takeaway:** "A random seed defeats an attacker who has to guess your keys in advance — it doesn't defeat one who can query your server and time the answers."
- **Narrator's line of thought:** "the left side is real and it's good news — go check it yourself, those are the same crafted keys from before, landing almost one per bucket now. The right side is the part that surprised the field in 2012: being unpredictable to a guesser isn't the same as being unpredictable to someone who can watch you compute." She never claims to have built the timing attack; she's explicit that it's the paper's own argument, cited, not demonstrated here.
- **Duration:** ~4.4s.

### 7 — SipHashPRF
- **fig:** `SipHashPRF`
- **Visual idea:** the weak linear hash's formula fades; SipHash's actual structure (a few labelled ARX rounds over a 128-bit key, drawn as a short pipeline from a from-scratch reference implementation verified against the paper's own published test vector, not derived on screen) replaces it, with a caption-level definition of PRF: indistinguishable from a function that just picks a random output for every input. A small line names that CPython's own built-in `hash()` of `str`/`bytes` is a real, shipped SipHash, since PEP 456 — the step 9 chart's "keyed/PRF tier" bar is measuring that real function, not a toy. What moves: the pipeline's rounds `Draw` in sequence on the beat; a small "PRF" `Reticle` locks onto the pipeline once it's fully drawn.
- **On screen:** "SipHash-2-4" and "128-bit key" labelled directly from the design (not asserted — these are the paper's own parameters; the reference implementation's test-vector check is in `examples.py`).
- **Caption:** SipHash was built to be a real pseudorandom function — strong enough that seeing its output teaches an attacker nothing about any other input — while staying fast enough to compete with the non-cryptographic hashes from step 2. It's not a museum piece: it's the hash Python itself calls every time you hash a string.
- **Narrator's line of thought:** "PRF is the one new term this whole topic needed — everything from here is just 'is this hash a PRF, and how expensive is that?'" She ties it back explicitly: "a PRF is exactly the property step 6's linear hash didn't have" — and grounds it: "you've been calling this exact algorithm every time you hash a string in Python."
- **Duration:** ~3.8s.

### 8 — RustDefault
- **fig:** `RustDefault`
- **Visual idea:** two real, current language/library decisions side by side: Rust's `std::HashMap`, defaulting to SipHash 1-3 with a random per-process seed (labelled "resists HashDoS," from its own docs), beside `rustc`'s own `FxHashMap`, explicitly opting out (labelled "the compiler's own inputs aren't adversarial," from `rustc-hash`'s own README). What moves: both boxes `Draw` in together; a small `cherry`-outlined warning box drops onto a *third*, hypothetical case — a `HashMap` built with a fixed, non-random hasher in a `const` — labelled "not HashDoS-resistant," per the docs' own explicit warning.
- **On screen:** "SipHash 1-3" and "FxHasher" as the two named defaults, quoted from their own documentation.
- **Takeaway:** "Rust's own standard library ships a slower default hash on purpose, specifically so an attacker can't choose your map's worst case — and lets you opt out, deliberately, the moment you can prove your keys aren't adversarial."
- **Narrator's line of thought:** "this isn't a hypothetical trade-off — it's a decision two real teams made differently, for the same language, on purpose." She contrasts, rather than ranks: "the compiler isn't being careless by using the faster hash; it knows its own inputs."
- **Duration:** ~4s.

### 9 — ProveIt
- **fig:** `ProveIt`
- **Visual idea:** the three-tier chart the whole reel has been building toward: the same batch of keys hashed by the fast non-cryptographic stand-in (step 2's `zlib.crc32`), Python's own built-in `hash()` — CPython's real, shipped SipHash (step 7's tier) — and `hashlib.sha256` (the cryptographic tier), all benchmarked in the same run of `examples.py` on the same machine — three real bars, with the real measured ratios between them labelled. What moves: all three bars `Plot` in together; the ratio labels `Count` up from 1× to their real measured values.
- **On screen:** the three real measured figures and their ratios, asserted in `examples.py` — the honest result is that the fast and keyed/PRF bars land close together (near 1×, sometimes the keyed tier faster), while the cryptographic bar is clearly and consistently ~8-9× slower.
- **Caption:** three tiers, in order of what they buy: raw speed with no promises about adversarial input; a real pseudorandom-function guarantee at nearly the same speed — exactly the "competitive in speed" claim SipHash's own paper makes; and full cryptographic collision resistance, far slower, for when the hash itself must never be invertible or forgeable.
- **Narrator's line of thought:** recap, not new content — "every number on this chart you've already seen build, one tier at a time. Notice the surprise isn't the first two bars — they're close, just like the paper promised. It's the third one." She ties the three measured numbers to the three decisions (step 2's speed, step 7's PRF, step 8's real-world choice) by name, and is explicit that the PRF guarantee came at almost no measured cost here.
- **Duration:** ~4.4s.

## Post-notes headings (Deep dive)

- `outcomes` — restates the three learning outcomes above, same wording as `post-notes.md`.
- `internals` — the PRF definition precisely (indistinguishable from random, and why "has a secret key" alone is weaker); the Crosby–Wallach linear-hash attack's mechanism in plain prose (no new mechanism beyond what step 6 already showed, written out in full since the reel's time budget only sketches it).
- `lab` — none planned beyond `examples.py`'s own benchmarks (no syllabus *Lab* bullet in §3.1).
- `production` — real avalanche/quality terminology (xxHash's own "non-adversarial" scoping) as a production checklist item: before picking a hash for a table, ask "can anyone outside my own process choose the keys?" and treat "yes" and "no" as a real fork, not a style preference.
- `frontier` — universal and k-independent hashing (skipped in this syllabus) named as the deeper theoretical tool that would make "why keying helps" a proof instead of an argument; one sentence, no mechanism, consistent with the chapter plan's explicit skip list.
- `questions` — two or three questions in the house style, e.g. "If an attacker can't time your server at all (a fixed, published latency budget absorbs the difference), does the step 6 attack still work?"; "`rustc`'s `FxHashMap` is explicit that its inputs aren't adversarial — name one real situation where that assumption would be wrong for a compiler."
- `next` — the handoff below, word for word.

## Examples to execute (`examples.py`)

1. A from-scratch pure-Python SipHash-2-4 reference implementation, verified against the algorithm's own published test vector (key = `bytes(range(16))`, empty message → `0x726FDB47DD0E0E31`) — used only to show the mechanism's real round structure (step 7's diagram), never for timing: an early draft timed this pure-Python loop against C-accelerated `hashlib.sha256` and got the ordering backwards (measuring the interpreter, not the algorithms — see `FACT-CHECK.md` row 14).
2. Three C-accelerated primitives benchmarked against each other over the same batch of 200,000 realistic 8–16 byte keys, so the comparison measures the algorithms, not interpreter overhead: `zlib.crc32` (the "fast tier" stand-in, step 2/9), Python's own built-in `hash()` of a `bytes` object — CPython's real, shipped SipHash since PEP 456, the "keyed/PRF tier" (step 7/9) — and `hashlib.sha256` (the "cryptographic tier", step 9). Assert the cryptographic tier is slower than the fast tier; report all three real ns/key and their ratios. The honest result: the fast and keyed tiers land close together, the cryptographic tier is clearly slower (~8-9×) — see `FACT-CHECK.md` row 15.
3. A deliberately weak hash (`weak_hash`: the Crosby–Wallach linear form `H(m) = Σ mᵢ·kᵢ`, public coefficients all 1 by default — effectively a byte sum mod table_size — named as weak on screen, never presented as a real library's choice) and a from-scratch chained hash table built on it, with a real `lookup` that walks and compares each chain entry; construct n keys that all collide under this weak hash by direct formula (not search) and insert+lookup them, timed, against n keys drawn at random; assert the colliding run is measurably slower (the step 4 surprising number, reliably >20× across runs) and report the real ratio.
4. The same crafted colliding keys fed through `weak_hash` with an unknown-to-the-attacker random per-process coefficient vector (keying the same linear formula, per the Crosby–Wallach proposal the SipHash paper critiques — not a scalar seed added on, which a linear sum is invariant under) — assert they land in a real, measured spread of distinct buckets (≥90% of the table, from a single starting bucket), demonstrating the precomputation-defeating property step 6's left half claims — and nothing stronger than that.
5. Every number steps 2, 4, 6 and 9 put on screen is asserted directly from these runs; nothing is asserted that this script doesn't compute.

## Bridge and handoff

- **Bridge** (word for word, matching `CHAPTER.md` and Chapter 2 topic 6's real handoff): "A string is a sequence of bytes, and so far this chapter has only ever compared them byte by byte or copied them whole. Turning a string, or any key, into a number fast and safely is a mechanism of its own: next, practical hash functions, and the attack a bad one invites."
- **Handoff** (word for word, matching `CHAPTER.md`): "A hash function turns any key into a number. It says nothing yet about what happens when two different keys turn into the same one. Next: the oldest answer, and the one every language's standard library still ships."

## Concept ledger

- **Introduces:** `hash-function`, `avalanche-property`, `non-cryptographic-hash`, `keyed-hash`, `cryptographic-hash`, `hashdos`, `per-process-seed`.
- **Uses:** none from earlier chapters directly (per `CHAPTER.md`, this topic is the chapter's own foundation).
- **Declared:** none new beyond its own.

## Claims list (claim → source)

1. XXH3 is xxHash's current recommended default, generating 64- or 128-bit hashes, and benchmarks at tens of GB/s on the vendor's own table. → `SOURCES.md` § xxHash README.
2. xxHash's own quality claim ("uniform distribution") is explicitly scoped to non-adversarial input. → `SOURCES.md` § xxHash README.
3. wyhash's "salted"/dynamic-secret design and its real adoption by Zig, V, Nim and Go (since 1.17); the project's own README says it has since evolved into rapidhash. → `SOURCES.md` § wyhash README.
4. FxHash/`rustc-hash` explicitly gives up DoS resistance because the compiler's inputs aren't adversarial, and its name persists from its Firefox origin despite the underlying hash having changed. → `SOURCES.md` § rustc-hash README.
5. Rust's `std::collections::HashMap` defaults to a hashing algorithm "selected to provide resistance against HashDoS attacks," currently SipHash 1-3, randomly seeded per instance; other algorithms are faster for small/large keys but "will typically not protect against attacks such as HashDoS." → `SOURCES.md` § Rust HashMap docs.
6. A `HashMap` built with a fixed, non-random hasher (e.g. in a `const`/`static`) is explicitly documented as not HashDoS-resistant. → `SOURCES.md` § Rust HashMap docs.
7. SipHash is formally a PRF, designed and evaluated as "indistinguishable from a uniform random function," and designed to be "competitive in speed with popular non-cryptographic hash functions" for short inputs. → `SOURCES.md` § SipHash paper.
8. Hash flooding's documented history: the 1999 `dnscache` source comment, Crosby & Wallach's 2003 "algorithmic complexity attacks" paper, and Klink & Wälde's December 2011 CCC 28c3 disclosure (500 KB of POST data occupying one PHP5 server for a full minute of CPU time). → `SOURCES.md` § SipHash paper and § Hash-flooding DoS reloaded slides.
9. **The correction:** merely adding random entropy to a linear public hash family is still breakable by an attacker who can time adaptive queries, via Gaussian elimination against the hash's linear structure — "the attack works no matter how k0, k1, ... are chosen"; the paper proposes a cryptographically strong PRF instead. → `SOURCES.md` § SipHash paper.
10. Hash flooding's concrete mechanism and a worked cost example (200,000 colliding 10-byte strings in 2 MB of POST data, ≈40 billion string comparisons, ≥10s on a 2 GHz machine). → `SOURCES.md` § Hash-flooding DoS reloaded slides.
11. BLAKE3 is faster than SHA-1/SHA-2/SHA-3/BLAKE2 by its own design claim, and its multithreaded `b3sum` is "an order of magnitude faster… than e.g. `sha256sum`" on typical hardware — used only to scope the cryptographic tier's own internal range, not to assert a cross-tier number. → `SOURCES.md` § BLAKE3 README.
12. Every speed ratio actually put on screen (steps 2, 7, 9) is measured in `examples.py` on this machine, not quoted from any vendor table, since those tables use different hardware and methodologies (xxHash's own table measures SipHash itself, at 3.0 GB/s against XXH3's 59.4 GB/s on the vendor's own hardware — cited in prose, as one data point, not asserted as this machine's number). → `SOURCES.md` § xxHash README; `examples.py`.
13. CPython's own built-in `hash()` of `str`/`bytes` objects has used SipHash since PEP 456, specifically to fix hash-collision attacks, and cites the same `oCERT-2011-003` disclosure independently of the SipHash paper and the AppSec slides. → `SOURCES.md` § PEP 456; `examples.py`.
14. `PYTHONHASHSEED` is the real, documented environment variable controlling that per-process randomization. → `SOURCES.md` § Python command line docs.
15. **New honest finding:** measured directly on this machine, the fast tier (`zlib.crc32`) and the keyed/PRF tier (`hash()`) run close together (ratio near 1×), while the cryptographic tier (`hashlib.sha256`) is clearly and reproducibly ~8-9× slower — empirical support for the SipHash paper's own "competitive in speed" claim (claim 7), not a general ranking of non-cryptographic hashes. → `examples.py`; `FACT-CHECK.md` row 15.

## Changes from the chapter plan

The chapter plan's visual idea (quoted above) implied a random per-process seed alone defeats the attack. Research found this overstates the real guarantee (see "The correction" above). The topic keeps the plan's scenario (the log's keys; a weak-hash flood; a seed) but adds one predict-and-reveal pair (steps 5–6) the plan didn't specify, to teach the correction honestly instead of silently fixing the plan's wording. This adds one step to the reel beyond the plan's implied three-beat visual; recorded here per `.claude/skills/make-topic/SKILL.md` section 1.
