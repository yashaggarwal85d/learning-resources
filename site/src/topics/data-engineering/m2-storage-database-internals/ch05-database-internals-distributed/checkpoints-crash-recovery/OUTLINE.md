# OUTLINE — Checkpoints and crash recovery

## Learning outcomes

1. Explain why a checkpoint exists at all: it is the thing that lets crash recovery stop replaying WAL at some point short of "the beginning of time," by guaranteeing every dirty page as of that point is already on disk.
2. Read and reason about the real trade-off a checkpoint interval controls: a shorter interval bounds replay distance but forces more full-page images (`full_page_writes`); a longer interval does the opposite — and show this as a real, measured number, not a rule of thumb.
3. Name the one structural difference between Postgres's own crash recovery and ARIES's: Postgres performs a single redo-only roll-forward from the checkpoint's redo record; ARIES defines a third, separate undo pass for transactions still in flight at crash time, which Postgres's own row-visibility mechanism makes unnecessary.
4. Recognize checkpoints/WAL as the one mechanism three later-looking features reuse directly: point-in-time recovery (stop replay early), physical replication (ship the same WAL bytes, replay continuously), logical decoding/CDC (decode the same stream into row changes instead of raw bytes).

## Changes from the chapter plan

CHAPTER.md's own entry for this topic calls for a crash-recovery measurement. This sandbox runs one shared Postgres cluster with no safe way to actually kill and restart it mid-topic without risking every other topic's own live scripts. Per the sibling topic's own precedent (`write-ahead-logging-fsync` measured FPI/sync counts without ever crashing the server), this topic measures the real, underlying quantities a crash recovery would act on — `pg_control_checkpoint()`'s `redo_lsn` and the live WAL gap behind it via `pg_current_wal_lsn()` — rather than staging an actual `kill -9`/restart. The ARIES three-pass structure and the PITR/replication/logical-decoding substrate claims are sourced-only (named, not independently reproduced): this sandbox has no second ARIES-style engine to time, and no second node to replicate to.

## Claims list (for fact-check)

1. A checkpoint guarantees every dirty page as of that point is flushed; crash recovery never needs to look further back than the latest checkpoint's redo record. — Source: `wal-configuration.txt` (checkpoint-redo-record).
2. Reducing checkpoint_timeout/max_wal_size → more frequent checkpoints → faster crash recovery (less to redo) at the cost of more frequent page flushing, and, with `full_page_writes` on, more full-page images per unit of wall time. — Source: `wal-configuration.txt` (checkpoint-frequency-tradeoff).
3. `full_page_writes` logs the entire page content on the first modification of a page after each checkpoint (a torn-page defense). — Source: `wal-configuration.txt` (checkpoint-frequency-tradeoff, same quote as claim 2).
4. Postgres describes its own crash recovery as roll-forward/REDO from the WAL; no separate pass physically undoes an uncommitted transaction — visibility is decided by transaction status, not a second pass. — Source: `wal-intro.txt` (wal-redo-roll-forward); corroborated by absence of "undo" in `transam-readme.txt`.
5. ARIES defines three passes: analysis, redo, and undo — undo physically rolls back "loser" transactions still in progress at crash time. — Source: Mohan et al. 1992, named only (OCR unreliable), its own legible comparison table ("DB2 makes three passes (analysis, redo, and then undo)").
6. This topic's own measurement: checkpointing every round (10 rounds) vs. checkpointing once before 10 identical rounds, on a 2000-row table, produces far more full-page images in the frequent case and a far smaller live replay gap. — Source: `examples.py`, real run.
7. Point-in-time recovery stops WAL replay before the end, producing a consistent snapshot at any time since the base backup — same mechanism, replay just doesn't run to completion. — Source: `continuous-archiving.txt` (wal-pitr-substrate).
8. Physical replication ships the same WAL bytes to a standby, which continuously applies them (the same REDO path) against its own copy of the files. — Source: `warm-standby.txt` (wal-replication-standby).
9. Logical decoding reads the same WAL stream and decodes it into row-level changes rather than raw page bytes, which is what CDC pipelines (DE Ch.8) consume. — Source: `logicaldecoding.txt` (wal-logical-decoding).
10. `pg_control_checkpoint()`'s `redo_lsn` is exactly where recovery would resume if the server crashed right now; the gap to `pg_current_wal_lsn()` is a live, direct measurement of how much WAL a crash this instant would force a replay of. — Source: direct reasoning from claim 1 + Postgres function semantics, confirmed structurally by `examples.py`'s own use of exactly this gap.

## Concept ledger

- `introduces`: `['checkpoint-recovery-redo-undo']`
- `uses`: `['wal-lsn-fsync']`
- `declared`: `[]`

## Engagement arc

- Hook: step 1.
- Predicts: step 4 (torn-page / full-page-write cost) and step 10 ("Prove it" — redo-only vs. three-pass transfer question). Two predicts, satisfying the ≥2 requirement for a full topic.
- Surprising number: the real measured ratio — frequent checkpoints log roughly 19x the full-page images (1267 vs 66) of infrequent ones, while infrequent checkpoints leave a replay gap roughly 7x larger (~9.6 MB vs ~1.4 MB) — the same knob, pulling two real costs in opposite directions by almost an order of magnitude each.
- Takeaways (≥3): steps 3, 5, 6.
- Recap: step 9.

## Storyboard

### Step 1 — Hook
- **fig**: "Every crash recovery starts from somewhere. Where?"
- Visual idea: a WAL timeline (a long horizontal bar of ticks) with a single marked point near the right end labeled "checkpoint," and a question mark at the far left labeled "start of WAL."
- On screen (portrait → landscape): the timeline bar; a highlighted checkpoint tick; the question "does recovery replay all of this, or just this much?" with an arrow spanning from the checkpoint tick to "now."
- Beat: the arrow from checkpoint→now draws in, then the "start of WAL" end dims out.
- Real values shown: none yet (set-up step).
- Final frame: the dimmed-out full timeline next to the bright checkpoint→now span.
- Caption's point: recovery has a real, bounded starting point, and this topic is about what sets that point and what it costs to move it.
- Narrator's line of thought (MIT professor, never reads the description): "When a database crashes mid-write, something has to decide where in its own history to start repairing itself. Not at the very beginning — that would mean replaying years of changes. There has to be a more recent, trustworthy point to start from. That point has a name, and today we measure what it actually costs to move it."

### Step 2 — Reveal: the redo record
- **fig**: "The checkpoint doesn't restart history. It marks the one point recovery needs."
- Visual idea: two rows — `redo_lsn` (left, "where recovery starts") and `pg_current_wal_lsn()` (right, "where the log is right now") — with a bracketed gap between them labeled "what recovery would redo if we crashed this instant."
- On screen: `Row` for `redo_lsn`, `Row` for `pg_current_wal_lsn()`, a bracket connecting them.
- Beat: both rows fade in, then the bracket draws and its label types in.
- Real values shown: the live gap is the exact quantity `examples.py` measures via `pg_lsn` subtraction — described here conceptually, numbers arrive in steps 5–6.
- Final frame: the bracketed gap, fully labeled.
- Caption's point: the redo record is not an estimate — it's a specific, queryable WAL position, and the live gap behind it is a specific, queryable number of bytes.
- Narrator's line of thought: "Postgres doesn't guess where to resume. `pg_control_checkpoint()` names the exact position — the redo record — and `pg_current_wal_lsn()` names exactly where the log stands right now. The distance between those two numbers is, right now, how much work a crash would force."

### Step 3 — Reveal: the frequency trade-off (takeaway)
- **fig**: "A shorter checkpoint interval means less to redo — and more to log."
- Visual idea: two rows, "checkpoint more often" → "less to redo" (good), and directly below, "checkpoint more often" → "more full-page images" (cost), connected by the shared trigger.
- On screen: two `Row`s stacked, same left-hand trigger phrase, two different right-hand consequences, one colored as benefit and one as cost (`C.focus` used once, meaningfully).
- Beat: trigger phrase appears once at top, then both consequence rows reveal in sequence below it.
- Real values shown: none (documentation claim, numbers follow in step 5).
- Final frame: both consequences visible together under the one trigger.
- Caption's point: the same knob produces one win and one real cost — it is a trade-off, not a free improvement.
- `takeaway` (≤20 words): "A smaller checkpoint interval shortens replay — but logs a full page copy more often."
- Narrator's line of thought: "Here's the catch. Checkpoint more often, and there's less to redo after a crash — genuinely good. But Postgres's default also means: the first time each page changes after a checkpoint, the *entire* page gets logged, not just the change. Checkpoint more often, and you pay that full-page cost more often too."

### Step 4 — Predict: torn page
- **fig**: "Why log the whole page instead of just the change?"
- Visual idea: a page split half-written (top half new data, bottom half old, a jagged tear line) next to "torn page."
- Predict options:
  - A: "Because the WAL format doesn't support partial-page diffs." (incorrect)
  - B: "Because a crash mid-write can leave a page half-old, half-new, and only a full before/after copy can repair that." (correct)
  - C: "Because full pages compress better than diffs." (incorrect)
- `explain`: a torn page is possible because disk/OS writes aren't guaranteed atomic at the page level; only a full-page image guarantees a clean copy to repair from, regardless of exactly where the tear fell. That's why it's keyed to "once per page per checkpoint" — after the first full copy, ordinary WAL deltas are safe until the next checkpoint resets the page's state.
- Beat: the torn page renders, pauses, then the three options appear.
- Caption's point: the full-page-write cost isn't arbitrary — it's the direct fix for a specific physical failure mode.
- Narrator's line of thought: "Before you see the answer — why would Postgres need the *whole* page, when it already logs every change as a compact delta? What could go wrong with just the delta?"

### Step 5 — Reveal: the real measurement, frequent (takeaway)
- **fig**: "Checkpointing every round: how many full pages, how far behind?"
- Visual idea: two rows, "full-page images: 1267" and "bytes to replay: ~1.42 MB," both labeled "checkpoint every round."
- On screen: two `Row`s with real numbers from `examples.py`'s `frequent_checkpoints_bound_replay_distance_but_cost_more_fpi`.
- Beat: fpi row reveals first (larger, to land the big number), then the replay-gap row.
- Real values shown: `1267` full-page images, `~1,420,664–1,420,688` bytes (reported as "~1.42 MB" to stay unit-friendly for narration).
- Final frame: both rows together.
- Caption's point: checkpointing every round keeps the replay gap small — but at a real, large full-page-image cost.
- `takeaway`: "Checkpoint every round: 1267 full-page images, but only ~1.4 MB left to replay."
- Narrator's line of thought: "This isn't a diagram — I ran it. Ten rounds of updates to a two-thousand-row table, checkpointing after every single round. 1267 full-page images. And the live replay gap behind the last checkpoint: about 1.4 megabytes."

### Step 6 — Reveal: the real measurement, infrequent (takeaway)
- **fig**: "Checkpointing once: how many full pages, how far behind?"
- Visual idea: the same two rows, now labeled "checkpoint once, before ten rounds."
- On screen: `Row` for fpi, `Row` for replay bytes, same layout as step 5 for direct visual comparison.
- Beat: same reveal order as step 5, inviting the side-by-side comparison.
- Real values shown: `66` full-page images, `~9,612,912–9,612,936` bytes (reported as "~9.6 MB").
- Final frame: both rows.
- Caption's point: the same workload, checkpointed once instead of ten times, flips the costs — far fewer full-page images, far more to replay.
- Narrator's line of thought: "Same ten rounds, same table — but checkpoint only once, up front. Full-page images: 66, not 1267 — almost twenty times fewer. But the replay gap: about 9.6 megabytes, nearly seven times larger. Same knob, same workload, opposite result."
- `takeaway`: "Checkpointing once logs far fewer full-page images, but leaves a far larger replay gap behind."

### Step 7 — Reveal: redo-only vs. ARIES's three passes (sourced-only)
- **fig**: "Postgres redoes. ARIES also undoes. Why the difference?"
- Visual idea: two rows, "Postgres: one pass (redo)" and "ARIES: three passes (analysis, redo, undo)."
- On screen: two `Row`s, directly contrasting pass counts.
- Beat: Postgres's row reveals first, then ARIES's row, then a short connecting line: "a row's own transaction status decides what's visible — no second pass needed."
- Real values shown: none (sourced-only; named in SOURCES.md, no live measurement — this sandbox runs no ARIES-style engine).
- Final frame: both rows plus the connecting line.
- Caption's point: redo-only recovery is not Postgres cutting a corner — it's a different, equally real design, where undo work is replaced by checking a row's own commit status.
- Narrator's line of thought: "Here's a real design difference between engines, not an optimization. The classic ARIES method — the one taught in nearly every database-systems course — makes three passes: figure out what was in flight, redo everything, then physically undo the transactions that never committed. Postgres's own documentation describes just one pass: redo. It never undoes a page. Why? Because whether a change is visible is decided by looking at the transaction's own status, not by rolling the page back."

### Step 8 — Reveal: the substrate reused later (sourced-only)
- **fig**: "The same WAL, three more jobs."
- Visual idea: three rows: "stop replay early → point-in-time recovery," "ship the same bytes → physical replication," "decode the same bytes → logical decoding / CDC."
- On screen: three `Row`s revealing in sequence.
- Beat: each row reveals, pauses briefly before the next — this step deliberately slows down since it's naming three distinct, later-chapter ideas.
- Real values shown: none (sourced-only, forward pointer — DE Ch.8 covers CDC in depth).
- Final frame: all three rows.
- Caption's point: nothing here is a new mechanism — all three are the same WAL and the same checkpoint-bounded recovery, pointed at a different goal.
- Narrator's line of thought: "Three things that sound unrelated turn out to be the exact same machinery. Stop the replay early instead of running it to the end, and you have point-in-time recovery. Ship the same bytes continuously to another machine that keeps redoing them, and you have physical replication. Decode the same bytes into row-level changes instead of raw pages, and you have the basis of change-data-capture, which a later chapter builds on directly."

### Step 9 — Recap
- **fig**: "What a checkpoint actually buys, and what it costs."
- Visual idea: three compact rows restating the three takeaways: the trade-off, the real numbers' shape (19x fpi, 7x gap), redo-only vs. three-pass.
- On screen: three `Row`s, deliberately terse — recap, not re-explanation.
- Beat: all three fade in close together, slightly faster than earlier reveals.
- Real values shown: the ratios restated (not the raw byte counts again).
- Final frame: all three rows, static for the longest hold of the reel.
- Caption's point: one knob (checkpoint frequency), one real measured trade-off, one structural recovery difference, one substrate reused three more times.
- Narrator's line of thought: "So: a checkpoint is where recovery starts, not an optimization you can ignore. Checkpoint more, and recovery is faster but logging is heavier — by almost twenty times in one direction and seven in the other, in this very run. Postgres never undoes a page; a row's own status does that job instead. And this exact WAL is also what point-in-time recovery, replication, and logical decoding all build on."

### Step 10 — Predict: "Prove it" (transfer)
- **fig**: "A system claims 'instant crash recovery, however long it's been running.' What's missing?"
- Predict options:
  - A: "Nothing — modern engines can redo arbitrarily long histories instantly." (incorrect)
  - B: "It must be bounding replay distance somehow — most likely with its own version of a checkpoint." (correct)
  - C: "It must be using an undo pass instead of redo." (incorrect — undo vs. redo doesn't bound replay distance by itself)
- `explain`: any crash-recovery claim that doesn't scale with uptime has to be capping how far back recovery looks — that's exactly what a checkpoint's redo record does. The claim "instant, however long it's running" without a stated bound is either marketing or hiding a periodic checkpoint-equivalent under another name.
- Beat: the claim renders first as a quote, then the three options.
- Caption's point: the specific numbers in this topic are Postgres's; the underlying idea — bound replay distance with a periodic marker — is close to universal, and a system that claims to skip it is worth being skeptical of.
- Narrator's line of thought: "Last one, and it's not about Postgres specifically. Someone tells you their database recovers instantly no matter how long it's been running, with no mention of a checkpoint. Before you believe it — what would have to be true?"

## Post-notes headings

- **Outcomes**: restate the 4 learning outcomes above, one line each.
- **Lab**: point at `examples.py`, describe the two functions and the real numbers they produce; mention the DSN/sandbox setup already used by the previous topic.
- **Production failures this topic warns about**: too-infrequent checkpointing causing unacceptably long crash-recovery windows in production (a real, cited operational concern — same documentation section warns of exactly this); full_page_writes disabled on unsafe storage as a real-world footgun.
- **Frontier**: engines that avoid full-page writes via other torn-page defenses (e.g. a double-write buffer, named only); multi-node consensus-based recovery (named only, out of scope for this sandbox).
- **Where this goes next**: verbatim handoff text — "Every mechanism so far assumed one path to a row: a direct page read. The next topic is the structure that makes finding the right page fast in the first place — the B-tree."

## Bridge / handoff (verbatim from CHAPTER.md)

- **Bridge**: "A WAL that's never allowed to grow forever needs a bound on how far back a crash recovery must replay. This topic is that bound: the checkpoint, and the two real recovery strategies (ARIES's redo/undo, Postgres's redo-only) built on top of the WAL topic 3 established."
- **Handoff**: "Every mechanism so far assumed one path to a row: a direct page read. The next topic is the structure that makes finding the right page fast in the first place — the B-tree."
