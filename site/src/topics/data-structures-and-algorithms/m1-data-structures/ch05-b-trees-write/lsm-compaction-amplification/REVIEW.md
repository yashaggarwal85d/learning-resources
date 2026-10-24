## Content review, self-review, 2026-10-23

- Claims traced to sources: the leveled/tiered/hybrid trade-off (leveled minimizes space at the cost of read+write; tiered minimizes write at the cost of read+space; hybrid lands between both) is quoted directly from RocksDB's own Compaction wiki. The per-level merge mechanic and exponentially increasing target sizes are quoted directly from the same wiki plus its Leveled Compaction page. The size-amplification-ratio formula is quoted directly from RocksDB's Universal Compaction wiki. Monkey's own diagnosis (a uniform per-level false-positive rate is suboptimal) and its fix (filter false-positive rate proportional to run size) are quoted directly from the Monkey paper (SIGMOD 2017). Dostoevsky's Lazy Leveling and its own per-workload navigation under a space-amplification constraint are quoted directly from the Dostoevsky paper (SIGMOD 2018). The RUM conjecture's own precise statement is quoted directly from the RUM paper (EDBT 2016). All 28 quote-check passes (`sources.mjs check`) pass.
- `examples.py` reuses topic 28's WAL/memtable/SSTable shape to drive leveled and tiered compaction over the identical six-thousand-write, three-hundred-key workload, first confirming both policies' final live key set exactly matches a plain replay of every write in order (correctness before any cost claim). Measured: leveled's write amplification of roughly three and a half times against tiered's roughly two and a half; leveled checking two runs per worst-case read against tiered's five; leveled's space amplification of roughly one and two tenths times against tiered's roughly three and six tenths — the stated trade-off, demonstrated on real numbers, not assumed from either paper's own reported figures. A separate measurement built real, hash-based Bloom filters (reusing topic 28's class) at a uniform bits-per-key setting versus a Monkey-style proportional-to-run-size setting, at the identical total memory budget, and confirmed the proportional setting's summed false-positive rate is lower.
- Gap hunt (`coverage.json` → `gapReview`): no open items. The RUM conjecture's own lower-bound proof, and Monkey's and Dostoevsky's own closed-form cost models, are named as the papers' own results, not re-derived; the measured numbers are scoped to this topic's own workload and parameters; RocksDB's further per-level compaction-priority tuning is named only in the frontier section.
- The syllabus clause (the full sentence naming leveled/tiered/hybrid, the RUM trade-off, Monkey, and Dostoevsky together) is mapped in `coverage.json` against six reel steps; the six sources are each mapped to the specific claims they support. Ten expert items were written blind, from the syllabus line and the six fetched sources alone.
- `FACT-CHECK.md`'s red team specifically checked that this topic's "read/write/space amplification" vocabulary is not misattributed to the RUM paper itself (which uses "read/update/memory overheads," a related but distinct general framing), that Monkey's result is orthogonal to the choice of merge policy rather than a fourth compaction family, and that Dostoevsky's Lazy Leveling does not claim to escape the trade-off, only to find a better point on it — each checked directly against the paper's own wording, not assumed from a secondary summary.
- Narration (all ten steps) was written as the professor's own reasoning, distinct from each step's on-screen caption/body, and verified clean with `scripts/narration-teaches.mjs` on the first run: no description-verbatim overlap above six percent on any step, no unspeakable-character hits, and no line over the fifty-word limit.
- Two predict steps (step 2: what should happen to a growing pile of runs; step 6: can one compaction policy win on all three amplification numbers at once) satisfy the full topic's two-predict requirement; both have matching `answer` arrays in `narration.json`.
- Three takeaways (steps 4, 7, 9) satisfy the three-minimum rule.
- No build failures on the first `npm run build`: every number in `reel.tsx` prose is spelled as a word (including level references, written as "a shallower level"/"the next level down" rather than numbered levels), with no digit characters anywhere in the file, comments included, after the digit-in-a-comment gotcha topic 28 surfaced — checked for directly before the first build run this time, rather than discovered by it.
- This topic closes Chapter 5: its handoff is the chapter's own closing line to Chapter 6 (binary heaps), quoted word for word from `CHAPTER.md`.

## Looks review, self-review, 2026-10-23

`npm run build` is clean on the first run. `node scripts/sources.mjs check` and
`node scripts/check-all.mjs --only reels --topic dsa.lsm-compaction-amplification` both pass, with
the reel smoke test confirming zero live-reel regressions (the topic ships `held`, as every new
topic does).

- Step 1 (Opening): the tall stack of sealed runs below a memtable renders without overlap at both sizes.
- Step 2 (CompactionPredict) and its answer state: the pulsing stack and the predict/answer text are legible at both sizes.
- Step 3 (LeveledReveal): the small-level-merges-into-bigger-level move renders cleanly, without the two level boxes overlapping.
- Step 4 (TieredReveal): the several-same-sized-runs-sweeping-together move fits inside the frame at both sizes.
- Step 5 (AmplificationDefine): the three unlabeled bars and their definitions render clearly.
- Step 6 (TradeoffPredict) and its answer state: the three bars and the predict/answer text are legible at both sizes.
- Step 7 (TradeoffReveal): the three policies' bar sets (leveled, tiered, hybrid) render side by side without crowding.
- Step 8 (MonkeyReveal): the flat uniform-filter row beside the Monkey-sized row renders cleanly at both sizes.
- Step 9 (DostoevskyReveal): the tiered-to-leveled spectrum with its sliding marker fits the frame.
- Step 10 (ProveIt): all measured comparisons (amplification bars, filter false-positive-rate bars) and their captions fit cleanly at both sizes.

Final reel check (`npm run build`, `sources.mjs check`, `check-all.mjs --only reels`): all pass.
This is the fourth and final topic of Chapter 5 (B-Trees and Write-Optimized Trees).
