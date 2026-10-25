# Outline — de.lsm-compaction-rum-trade

## Outcomes

1. Contrast leveled, tiered and FIFO compaction strategies.
2. State the RUM conjecture precisely (read, write and space amplification trade off, at most two optimized at once) and back it with a real measured comparison between this sandbox's Postgres and RocksDB instances.
3. Explain compaction debt, a write stall and tombstone build-up as real production failure modes.
4. Decide, from measured amplification and latency numbers rather than received wisdom, when a B-tree (Postgres) beats an LSM tree (RocksDB) and vice versa.

## Storyboard

### 1. Hook

- **fig:** none (title card).
- **Visual idea:** the previous topic's own handoff, restated as the open question.
- **On screen:** "sorted runs pile up forever" → "something has to merge them back down" → "compaction — and the trade-off it can't escape".
- **Moves:** `Draw` the handoff sentence in, `lock-on` the question.
- **Final frame:** the question held on screen, unanswered.
- **Caption point:** this topic is that merge, the real trade-off every compaction strategy makes.

### 2. Reveal: the same writes, two different shapes

- **fig:** `CompactionStyleCompare`.
- **Visual idea:** the identical shuffled write pattern, run through RocksDB's own two real compaction styles, counted directly.
- **On screen:** "one write pattern" → "level compaction: settles to a few files" → "universal compaction: settles to a few more".
- **Moves:** `Plot` two bar counts side by side, `decode` why one merges more eagerly.
- **Real values:** the same 20,000-key, shuffled write pattern settles to 3 live files under RocksDB's level (leveled) compaction style and 4 under its universal (tiered) style (examples.py: `compaction_style_file_counts`).
- **Final frame:** "3 files vs. 4 files," the same data, same workload.
- **Caption point:** leveled compaction keeps one sorted run per level by merging aggressively, which costs more write work now; tiered (RocksDB's own "Universal") lets more sorted runs coexist before merging, costing less write work now and more read work later, until something merges them.
- **Takeaway:** none (step before the chapter's own midpoint; `QUALITY.md` #59).

### 3. Reveal: FIFO, the style that never merges

- **fig:** `FifoDropsOldest`.
- **Visual idea:** a real FIFO-style store, written past its own configured size cap, with the oldest file's own keys gone and the newest still there.
- **On screen:** "a size cap, configured" → "write past it" → "the oldest file: gone" → "the newest file: still there".
- **Moves:** `Draw` files queueing up to the cap, `Reticle` the oldest one disappearing.
- **Real values:** with a 100-kilobyte cap, the oldest round's own key is gone and the newest round's own key is still present, measured directly (examples.py: `fifo_drops_oldest`).
- **Final frame:** "oldest: gone. newest: there." held on screen.
- **Caption point:** FIFO compaction never merges anything at all — once the total size crosses its own configured cap, it deletes the oldest file outright, cache-like, trading correctness of old data for the cheapest possible write cost.
- **Takeaway:** none (step before the chapter's own midpoint; `QUALITY.md` #59).

### 4. Predict: the trade-off none of them escape

- **fig:** none (predict card).
- **On screen:** the question: "Leveled costs more to write. Tiered costs more to read later. FIFO just throws old data away. Is there a compaction style that avoids all three costs?"
- **Options:** (a) "Not yet invented, but a better algorithm could find one" (tempting: sounds like an engineering-maturity answer); (b) "No — minimizing any two of read, write and space cost makes the third worse, provably" (correct).
- **Moves:** `lock-on` the question, hold both options on screen.
- **Final frame:** both options visible, unresolved.
- **Caption point:** sets up the reveal that follows — this isn't a gap in today's engineering, it's a conjecture with a name.

### 5. Reveal: the RUM conjecture, precisely

- **fig:** `RumConjectureStated`.
- **Visual idea:** the three overheads named exactly, each as a ratio, with the conjecture itself stated as a hypothesis.
- **On screen:** "read overhead → read amplification" → "update overhead → write amplification" → "memory overhead → space amplification" → "optimize any two, the third gets worse".
- **Moves:** `Eq` the three ratio definitions, `decode` the conjecture's own claim.
- **Final frame:** the hypothesis held on screen, naming all three terms.
- **Caption point:** read, write and space amplification are each a precise ratio (actual work or space divided by the logical amount, with a theoretical floor of 1.0); the RUM conjecture says an access method optimal in one of the three can't be optimal in both of the other two at once.
- **Takeaway:** "Read, write and space amplification aren't independent knobs. Minimizing any two makes the third worse."

### 6. Reveal: write stalls, a real trigger crossed

- **fig:** `WriteStallTrigger`.
- **Visual idea:** a real, configured L0-file-count trigger, with RocksDB's own real count measured past it.
- **On screen:** "a configured trigger: too many L0 files" → "real count, measured" → "past the trigger".
- **Moves:** `count` the real L0 file total against the configured threshold, `Reticle` lock onto the crossed line.
- **Real values:** with a slowdown trigger configured at a small count, a real RocksDB instance's own L0 file count reaches a visibly higher number after the same write pattern used in step 2 (examples.py: `write_stall_trigger_crossed`).
- **Final frame:** the real count held next to the configured trigger, visibly past it.
- **Caption point:** a write stall isn't a bug — it's RocksDB's own, documented response once flush or compaction can't keep up: slow writes down on purpose, because the alternative is space amplification and read amplification both growing without any bound at all.
- **Takeaway:** "A write stall isn't RocksDB breaking. It's RocksDB refusing to let space and read amplification grow without limit."

### 7. Reveal: compaction debt, the same shape as a tombstone

- **fig:** `CompactionDebt`.
- **Visual idea:** the previous topic's own tombstone, redrawn as one instance of a bigger pattern: uncollected merge work, owed to the engine's own future self.
- **On screen:** "a tombstone: uncollected merge work, on one key" → "a stall: the same debt, on a whole column family" → "one shape, two scales".
- **Moves:** `Draw` the tombstone from the previous topic folding into the larger debt picture, `decode` the shared mechanism.
- **Final frame:** both named side by side: a tombstone, a stall — the same debt.
- **Caption point:** every tombstone is compaction debt in miniature; a write stall is what happens when that debt, system-wide, finally forces the engine to slow down rather than let it grow forever — the same trade the RUM conjecture names, now as an operational failure mode rather than an abstract ratio.
- **Takeaway:** "A tombstone and a write stall are the same debt, at two different scales: uncollected compaction work."

### 8. Reveal: the chapter's own lab — Postgres vs. RocksDB, measured

- **fig:** `RumLabCompare`.
- **Visual idea:** the chapter's own paired-bar comparison — the identical insert/update/read workload run against a real Postgres cluster and a real RocksDB instance, three metrics, six bars.
- **On screen:** "same workload, two real engines" → "write amplification: Postgres higher" → "space amplification: Postgres higher" → "read latency: RocksDB's own in-process read is faster, but that's not the whole story".
- **Moves:** `Plot` three paired bars at their real measured heights, `decode` the one honest caveat on the read-latency pair.
- **Real values:** on the identical 2,000-row insert-then-half-updated workload, Postgres measures roughly double RocksDB's write amplification and nearly double its space amplification; RocksDB's own point-read p99 is far lower, but it is an in-process, embedded read against a client-server round trip, not a pure read-amplification comparison (examples.py: `rum_lab`).
- **Final frame:** the three paired bars, Postgres higher on two of three, the read-latency pair's caveat named directly on screen.
- **Caption point:** this is the RUM conjecture made concrete on two real engines doing the identical work — Postgres's B-tree-and-heap design pays more in write and space overhead than RocksDB's compacted LSM tree does, on this workload; the read-latency gap is real but partly architectural (embedded vs. client-server), not purely the B-tree-vs-LSM mechanism this chapter teaches.
- **Takeaway:** "Minimizing write amplification isn't free. RocksDB pays less here because compaction already did the work this lab measures."

### 9. Recap

- **fig:** none.
- **On screen:** leveled vs tiered vs FIFO → the RUM conjecture, precisely → a write stall, a real trigger → compaction debt, one shape at two scales → Postgres vs RocksDB, measured.
- **Moves:** `Draw` each piece folding into the next, in order.
- **Final frame:** the full chain, start to finish.
- **Caption point:** every compaction strategy is a different point on the same triangle; nothing escapes it, and this chapter's own lab shows exactly what two real engines pay for where they sit on it.

### 10. Prove it (predict)

- **fig:** none (predict card).
- **On screen:** "A workload is almost all writes, rarely reads anything back, and disk space is cheap. Which engine from this lab actually fits better — the B-tree or the LSM tree?"
- **Options:** (a) "The B-tree — it's the more mature, general-purpose choice" (tempting: sounds like the safe, default answer); (b) "The LSM tree — it was measured paying less for exactly the cost this workload cares about: writes" (correct).
- **Moves:** `lock-on` the question, then reveal the answer against this topic's own measured numbers.
- **Final frame:** the correct answer, pointing back at step 8's real write-amplification bars.
- **Caption point:** "which engine wins" isn't received wisdom — it's whichever point on the RUM triangle a workload's own read/write/space priorities actually land on, decided from measured numbers like this chapter's own lab, not a reputation.

## Engagement arc

- **Hook (step 1):** the previous topic's own handoff, posed as an open question — what merges sorted runs back down, and what does that merge cost?
- **Early prediction (step 4, within the first four):** is there a compaction style that avoids all three costs — the tempting wrong answer is "not yet invented", the real answer is "provably no, for any access method".
- **Surprising number:** step 8 — on the identical workload, Postgres measures roughly double RocksDB's write and space amplification, with the honest caveat that the read-latency gap is partly architectural.
- **Second prediction (step 10, Prove it):** a write-heavy, space-tolerant workload — the tempting wrong answer is "the B-tree, because it's the safe default".
- **Three takeaways:** steps 5, 6, 8 — all at or after the chapter's own midpoint, per `QUALITY.md` #59 (steps 2 and 3's points are carried by their own captions and the recap instead).
- **Recap (step 9):** the whole compaction-styles-to-measured-lab chain, one triangle seen at every step.

## Narrator's line of thought

- **Step 1:** Open on the handoff itself — this is the question the whole topic answers, not a restatement of the picture.
- **Step 2:** Don't just name "leveled" and "tiered" — say why the exact same data, written the exact same way, settles into a different number of files depending only on which style is merging it.
- **Step 3:** Treat FIFO with real respect rather than as the "worst" option — for genuinely cache-like data, throwing away the oldest file on purpose is the correct trade, not a shortcut.
- **Step 4:** Ask the predict question the way an engineer who hasn't met the RUM conjecture yet would answer it — "surely a cleverer algorithm fixes this" is the natural, wrong instinct.
- **Step 5:** Land on the word "ratio" for each overhead before naming the conjecture — read, write and space amplification are measurable numbers, not vibes, and that's what makes the conjecture checkable rather than hand-wavy.
- **Step 6:** Don't frame the write stall as a failure — frame it as RocksDB choosing the lesser of two real costs on purpose, and show the actual number that triggered it.
- **Step 7:** Make the callback to the previous topic explicit and specific — the exact same uncollected-work shape, now at the scale of an entire column family instead of one key.
- **Step 8:** Be honest about the read-latency caveat before the picture tempts a stronger claim — the write/space gap is the real architectural story; the latency gap mixes in something this lab didn't control for.
- **Step 9:** Pull the thread taut: three strategies, one conjecture, one real operational failure, one real measured lab.
- **Step 10:** Treat "the B-tree is the safe default" with real weight — it's true often enough to be a reasonable prior, and naming exactly why it's wrong for this workload is the point.

## Post-notes plan (headings match the sibling set)

- **Outcomes:** restate the four learning outcomes plainly.
- **Lab:** the full chapter lab write-up — the identical Postgres/RocksDB workload, the exact measured write/space amplification and p99 numbers, the read-latency caveat spelled out in full, and how to reproduce it.
- **Production failures this topic warns about:** write stalls (the two real, named RocksDB triggers — too many L0 files, too many pending compaction bytes — each with its own slowdown and full-stop threshold) and compaction debt generally, tied back to the previous topic's tombstone build-up as the same failure at a smaller scale.
- **Frontier:** Cassandra, ScyllaDB and Pebble as real systems sitting at different points on the same leveled/tiered spectrum RocksDB exposes as configuration, named but not measured; the Dostoevsky paper's "Leveled-N" and Fluid LSM as a more tunable middle ground between pure leveled and pure tiered.
- **Where this goes next:** the handoff, verbatim.

## Examples to execute

`examples.py`, four real experiments, all asserted and stable across repeated runs:

1. `rum_lab`: the chapter's own lab — an identical 2,000-row insert-then-half-updated-then-200-random-reads workload against this sandbox's real Postgres cluster and a real RocksDB instance. Postgres: write amplification ≈2.61×, space amplification ≈1.89×. RocksDB: write amplification ≈1.85×, space amplification ≈1.11×. RocksDB's own p99 point-read latency is measured lower in every run, with the embedded-vs-client-server caveat recorded directly in the code and in `post-notes.md`.
2. `compaction_style_file_counts`: the identical shuffled 20,000-key write settles to 3 live files under RocksDB's level (leveled) compaction style and 4 under its universal (tiered) style.
3. `fifo_drops_oldest`: with a 100-kilobyte FIFO size cap, the oldest round's own key is gone and the newest round's own key is present after writing well past the cap.
4. `write_stall_trigger_crossed`: with `level0_slowdown_writes_trigger` configured to 2, a real RocksDB instance's own `rocksdb.num-files-at-level0` property reaches 6 after the same write pattern, measured directly past the configured trigger.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 8's handoff verbatim): "An LSM tree accumulates sorted runs forever unless something merges them back down. This topic is that merge, the real trade-off (the RUM conjecture) every compaction strategy makes, and the production failures that strategy's own debt causes."
- **Handoff** (to topic 10, verbatim): "Every mechanism in this section so far lived inside one engine, on one machine. The next section asks what a transaction even means once two transactions can run at the same time at all — starting with a precise restatement of ACID itself."

## Concept ledger

- **Introduces:** `lsm-compaction-rum`.
- **Uses:** `lsm-write-read-path` (the previous topic — the sorted runs this topic's compaction strategies actually merge), `btree-fanout-blink` (the B-tree side of this topic's own measured comparison).
- **Declared:** none beyond this topic.

## Claims list

1. Classic leveled compaction minimizes space amplification at the cost of read and write amplification. — RocksDB Compaction wiki.
2. Tiered compaction (RocksDB's own "Universal" style) usually costs less write amplification than leveled, at the cost of more read and space amplification, since more sorted runs coexist before merging. — RocksDB Compaction wiki.
3. FIFO compaction drops the oldest file once a configured total size is exceeded, intended for cache-like data. — RocksDB Compaction wiki.
4. L0 is the newest-data level; a version of a key in L0 is newer than versions of the same key in every level below it. — RocksDB Compaction wiki.
5. Read, write and space amplification are each a precisely defined ratio (actual data moved or stored, divided by the logical amount), with a theoretical minimum of 1.0 for each. — RUM Conjecture paper.
6. The RUM conjecture: an access method optimal with respect to one of the read, update (write) and memory (space) overheads cannot achieve the optimal value for both remaining overheads. — RUM Conjecture paper.
7. A write stall has two concrete, named triggers in RocksDB — too many L0 files and too many pending-compaction bytes — each with its own slowdown threshold and a separate, harder full-stop threshold. — RocksDB Write Stalls wiki.
8. Without write stalls, a write rate compaction can't keep up with grows both space amplification (risking running out of disk) and read amplification (more and more structures to check) without bound. — RocksDB Write Stalls wiki.
9. Once a stall condition triggers, RocksDB reduces the write rate to a configured `delayed_write_rate` rather than simply blocking outright, and can reduce it further if pending-compaction bytes keep accumulating. — RocksDB Write Stalls wiki.
10. In this sandbox: the identical shuffled 20,000-key write pattern settles to 3 live files under RocksDB's level (leveled) compaction style and 4 under its universal (tiered) style. — `examples.py`.
11. In this sandbox: with a 100-kilobyte FIFO size cap, writing well past it leaves the oldest round's own key gone and the newest round's own key present. — `examples.py`.
12. In this sandbox: with `level0_slowdown_writes_trigger` configured to 2, the same write pattern used for the leveled/tiered comparison leaves `rocksdb.num-files-at-level0` at 6 — past the configured trigger. — `examples.py`.
13. In this sandbox: an identical 2,000-row insert-then-half-updated workload measures roughly 2.61× write amplification and 1.89× space amplification on Postgres, versus roughly 1.85× write amplification and 1.11× space amplification on RocksDB. — `examples.py`.
14. In this sandbox: RocksDB's own p99 point-read latency on the same workload is measured lower than Postgres's in every run, though the comparison mixes an embedded, in-process read against a client-server round trip rather than isolating read amplification alone. — `examples.py`.

## Changes from the chapter plan

None. The topic keeps `CHAPTER.md`'s scope, bridge, handoff and visual idea exactly — the paired-bar RUM comparison is built directly from `rum_lab`'s own real measured numbers.

## Progress

- Research done: `SOURCES.md` (17 quotes verified word for word across 3 sources), `coverage.json → expert` (11 items).
- Content plan done: this file.
- Next: fact-check (section 5).
