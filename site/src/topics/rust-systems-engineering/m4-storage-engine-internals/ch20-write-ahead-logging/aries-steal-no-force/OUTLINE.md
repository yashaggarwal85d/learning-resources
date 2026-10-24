# Outline: ARIES steal/no-force recovery (`rust.aries-steal-no-force`)

Chapter 20, topic 53 (second of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real, minimal ARIES-style recovery: an analysis pass, a redo pass, and an undo pass, over a log containing both a committed transaction and one that never committed.
2. Measure that redo reapplies every update in the log, committed or not, before undo ever runs — redo itself never distinguishes a winner from a loser.
3. Measure that a fuzzy checkpoint's own dirty-page bound lets redo visit genuinely fewer log records than a full scan from the start, while still reaching the identical, correctly recovered final state.
4. Measure that a second, independent crash partway through undo is recovered correctly from the compensation log records already written, without repeating or skipping any of the undo work — the bounded-logging guarantee the ARIES paper names directly.
5. State, from the original ARIES paper, what a CLR is and why its own update is never itself undone, and from PostgreSQL's own documentation, what a checkpoint record names as the point recovery must redo from.
6. State why steal and no-force are the high-performance buffer policy this topic's own recovery assumes, and when a simpler, redo-only design (no-steal) is enough instead.

## Changes from the chapter plan

None. All three of this topic's own claims are measured directly against a real, minimal write-ahead log, a real analysis/redo/undo recovery, and real compensation log records; nothing here needs root access or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"Build a real log with two transactions: one commits, one never does. Run only the redo pass over it, before any undo. Does redo apply the committed transaction's own updates, the uncommitted one's, or both?"** (predict, hook) — `fig`: two transactions' updates, one committed, one not, redo about to run. Options: only the committed transaction's updates / only the uncommitted one's, since it needs undoing anyway / both, genuinely; redo doesn't know or care about commit status yet (correct).
2. **"Measured: redo genuinely reapplied the uncommitted transaction's own updates too, exactly like the committed one's; nothing about redo itself tells them apart"** — `fig`: the real, measured redo, both transactions' pages changed. Takeaway: "Redo repeats history for everyone first; only the undo pass that follows tells a winner from a loser."
3. **"A checkpoint recorded that one page was already safely on disk, with nothing else dirty at that moment. Does redo, starting from that checkpoint's own bound instead of the very start of the log, still reach the correct final state?"** (predict) — `fig`: a checkpoint, one page already durable, redo's own starting point in question. Options: no, skipping older records risks missing something the checkpoint got wrong / yes, genuinely; the checkpoint's own bound is exactly how far back redo actually needs to look (correct) / only if no transaction was active at checkpoint time.
4. **"Measured: redo starting from the checkpoint's own bound visited genuinely fewer log records, and reached the exact same final state as a full scan from the start"** — `fig`: the real, measured scan, fewer records, identical result. Takeaway: "A fuzzy checkpoint's own dirty-page bound lets redo skip what's already durable, without skipping anything it actually needs."
5. **"Undo the uncommitted transaction's own last update, writing a compensation log record for it. Now crash again, right there, mid-undo. On the next recovery, does undo repeat that same step, skip it, or resume exactly where it left off?"** (predict) — `fig`: one update undone, one CLR written, a second crash mid-undo. Options: it repeats the step, undoing the same update a second time harmlessly / it resumes exactly where it left off, thanks to the CLR already in the log (correct) / it skips ahead too far, missing an earlier update that still needs undoing.
6. **"Measured: the second recovery resumed undo exactly where the first one left off; the already-undone update got exactly one compensation log record, total, across both attempts"** — `fig`: the real, measured resumption, one CLR per update, no more. Takeaway: "A compensation log record bounds undo's own work across repeated failures: nothing already undone gets undone twice."
7. **"The original ARIES paper names this kind of log record directly: a compensation log record, or CLR. Once ARIES writes a CLR undoing some update, is that CLR's own effect ever itself undone later?"** (predict) — `fig`: the paper's own words on CLRs, shown directly. Options: yes, if the transaction that wrote it is itself later rolled back again / no, never; a CLR is a redo-only log record (correct) / only during a third or later recovery attempt.
8. **"The paper's own words: in ARIES, a CLR's own update is never undone, and hence CLRs are viewed as redo-only log records"** — `fig`: the paper's own words, shown directly. NO takeaway (a connecting step restating the real paper's own rule, not a new kind of claim).
9. **"The same paper names the buffer policy this topic's own recovery assumes: steal, allowing an uncommitted page to be written back early, and no-force, allowing a committed one to stay unwritten. Redo and undo together are exactly why that combination is safe: whatever was written back, and whenever, both passes can fix it up"** — `fig`: steal and no-force, named directly, next to this topic's own analysis/redo/undo. NO new predict (continues directly from step seven's own question about CLRs, to this paper's own named buffer policy). Takeaway: "Steal and no-force are safe because redo and undo together can fix up a page however it was written back."
10. **Recap** — redo repeats history for everyone first, winners and losers alike; a fuzzy checkpoint's own dirty-page bound lets it skip what's already durable without skipping anything it needs; and a compensation log record bounds undo's own work across repeated failures, so nothing already undone gets undone twice. That's exactly what makes steal and no-force, the high-performance buffer policy, safe — a simpler no-steal, redo-only design, typical of LSM engines, gives up that freedom in exchange for never needing an undo pass at all.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (about CLRs; step 9 continues from it directly, with no new predict, to why steal + no-force works).
- Surprising fact: step 9 (steal + no-force being the deliberate, high-performance choice this topic's whole recovery enables, not an accident).
- Takeaways: steps 2, 4, 6, 9 (four — step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| ARIES supports fuzzy checkpoints, selective and deferred restart, fuzzy image copies, media recovery, and high concurrency lock modes | ARIES paper (quoted) |
| a log record's update is redone if the affected page's page-LSN is less than the log record's LSN; no logging is performed when updates are redone | ARIES paper (quoted) |
| in ARIES, a CLR's update is never undone, and hence CLRs are viewed as redo-only log records | ARIES paper (quoted) |
| checkpoints guarantee that data files have been updated with all information written before that checkpoint; a special checkpoint record is written to the WAL | PostgreSQL docs (quoted) |
| the crash recovery procedure looks at the latest checkpoint record to determine the point in the WAL (the redo record) from which to start the redo operation | PostgreSQL docs (quoted) |
| redo reapplies every update in the log, committed or not, before undo ever runs | `examples/runtime-demo/src/aries_analysis_redo_undo.rs` (executed, measured) |
| a fuzzy checkpoint's own dirty-page bound lets redo visit genuinely fewer records while reaching the identical final state | `examples/runtime-demo/src/aries_analysis_redo_undo.rs` (executed, measured) |
| a second crash partway through undo is recovered from its own compensation log records, without repeating or skipping any of the undo work | `examples/runtime-demo/src/aries_analysis_redo_undo.rs` (executed, measured) |

## Concept ledger

- `introduces`: `aries-steal-no-force-recovery` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `write-ahead-lsn-redo-idempotence` (topic 52)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A log record and a page that each carry their own LSN are enough to tell whether a change still needs replaying; the next question is what a real recovery does with that, across a log containing both committed and uncommitted work."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A correct recovery says nothing yet about how expensive making a transaction durable in the first place actually is, or what it costs to make that cheaper."
