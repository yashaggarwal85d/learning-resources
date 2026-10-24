# Outline: Write-ahead rule and LSNs (`rust.write-ahead-rule-lsns`)

Chapter 20, topic 52 (first of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. State the write-ahead rule: a durable log record must reach its own durability point before the data page it describes can be trusted after a crash.
2. Measure that the identical kind of crash (interrupting between a page write and a log append) is survived correctly when the log is written first, and genuinely, silently loses the update when the page is written first instead.
3. Measure that redo is idempotent: comparing a page's own LSN against a record's own LSN (`page.lsn >= record.lsn`) makes replaying an already-applied record, or re-running a whole recovery pass, a genuine no-op.
4. Measure that a page torn by a partial write is caught by a checksum mismatch, and genuinely fixed by restoring the log's own full-page image, the fix PostgreSQL calls a full-page write.
5. State, from PostgreSQL's own documentation, the real reason the write-ahead rule exists (so a transaction's commit doesn't require flushing every data page it touched) and the real mechanism it uses against torn pages.

## Changes from the chapter plan

None. All three of this topic's own claims are measured directly against a real in-memory write-ahead log, a real page with its own LSN and checksum, and a real redo function; nothing here needs root access, a real filesystem crash, or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"Build a real write-ahead log and a real page, each carrying its own LSN. Apply the same update two different ways: log the change, then write the page; or write the page, then log the change. Now crash at the exact same point in both: right between the two steps. Which update survives?"** (predict, hook) — `fig`: a log and a page, mid-update, the crash point marked between them. Options: neither survives; the page was never flushed either way / only the logged-first update survives; the other is simply gone, with nothing to redo (correct) / both survive, since the page already had the new bytes in memory.
2. **"Measured: the log-first update survived the crash and recovered correctly; the identical crash, with the page written first, genuinely and silently lost the update"** — `fig`: the real, measured recovery, side by side. Takeaway: "Log first, data later: the exact same crash loses nothing with the rule followed, and silently loses the update when it's reversed."
3. **"Now replay an already-applied log record against the page it already describes. Does redo apply it again, or leave the page alone?"** (predict) — `fig`: one record, already reflected in the page's own LSN. Options: it applies again, overwriting the page with the same bytes harmlessly / it's a genuine no-op; the page's own LSN already covers it (correct) / it depends on whether the page is dirty.
4. **"Measured: replaying an already-applied record was a genuine no-op, and running the full recovery pass a second time changed nothing either"** — `fig`: the real, measured no-op, twice over. Takeaway: "Comparing a page's own LSN against a record's own LSN is what makes redo safe to run more than once."
5. **"A crash mid-write can tear a page: half its bytes land in the new state, half are still the old ones. Does a checksum over the page's own bytes catch that?"** (predict) — `fig`: a page, half new bytes, half old. Options: no, a checksum only catches corruption from bad hardware, not a partial write / yes, the checksum genuinely no longer matches a page that's half-written (correct) / only if the torn half happens to be the checksum's own region.
6. **"Measured: the torn page's own checksum genuinely didn't match, and restoring the log's own full-page image fixed it completely"** — `fig`: the real, measured tear, caught and fixed. Takeaway: "A torn page is caught by its own checksum, and fixed by restoring the log's own complete, already-durable image of it."
7. **"PostgreSQL's own documentation states the write-ahead rule directly: why doesn't a transaction's commit need every data page it touched flushed to disk?"** (predict) — `fig`: PostgreSQL's own words on WAL, shown directly. Options: because the OS guarantees it eventually will, on its own schedule / because the log record reaching disk is already enough; the data pages can be redone from it later (correct) / because PostgreSQL never actually guarantees this.
8. **"PostgreSQL's own words: changes to data files must be written only after those changes have been logged, and any change not yet applied to a data page can be redone from the WAL records"** — `fig`: the documentation's own words, shown directly. NO takeaway (a connecting step restating the real system's own rule, not a new kind of claim).
9. **"PostgreSQL's own fix for a torn page is a full-page write: periodically writing a complete image of a page to the WAL before modifying it on disk, so a partially-written page can always be restored from that image"** — `fig`: PostgreSQL's own words on full-page writes, next to this topic's own measured fix. NO new predict (continues directly from step seven's own question about why the rule exists). Takeaway: "A full-page write is PostgreSQL's own name for exactly the fix this topic just measured: a complete, already-durable image to restore a torn page from."
10. **Recap** — log first, data later: the exact same crash that's survived when the log comes first silently loses the update when it's reversed. Comparing a page's own LSN against a record's own LSN makes redo safe to run more than once. And a page torn by a partial write is caught by its own checksum, and fixed by restoring the log's own complete, already-durable image — PostgreSQL's own full-page write.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (about why the rule exists; step 9 continues from it directly, with no new predict, to PostgreSQL's own torn-page fix).
- Surprising fact: step 9 (full-page writes being exactly this topic's own measured fix, under a real system's own name).
- Takeaways: steps 2, 4, 6, 9 (four — step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| changes to data files must be written only after those changes have been logged, flushed to permanent storage first | PostgreSQL docs (quoted) |
| a change not yet applied to a data page can be redone from the WAL records | PostgreSQL docs (quoted) |
| a partial write can leave some 512-byte sectors written and others not; PostgreSQL periodically writes full page images to WAL before modifying the actual page, to guard against this | PostgreSQL docs (quoted) |
| during crash recovery, PostgreSQL can restore a partially-written page from WAL | PostgreSQL docs (quoted) |
| the identical crash between a page write and a log append is survived correctly when the log comes first, and genuinely, silently loses the update when the page comes first | `examples/runtime-demo/src/log_first_redo_idempotent_torn_page.rs` (executed, measured) |
| redo is idempotent: replaying an already-applied record, and re-running a full recovery pass, are both genuine no-ops | `examples/runtime-demo/src/log_first_redo_idempotent_torn_page.rs` (executed, measured) |
| a page torn by a partial write is caught by a checksum mismatch, and fixed by restoring the log's own full-page image | `examples/runtime-demo/src/log_first_redo_idempotent_torn_page.rs` (executed, measured) |

## Concept ledger

- `introduces`: `write-ahead-lsn-redo-idempotence` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `buffer-pool-pin-evict-contract` (Chapter 19, topic 51), `wal-batched-flush-points` (Chapter 15)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Chapter 19 closed on a buffer pool that can evict a dirty page at any time; this chapter is about what happens if the process or machine dies before that write reaches disk."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A log record and a page that each carry their own LSN are enough to tell whether a change still needs replaying; the next question is what a real recovery does with that, across a log containing both committed and uncommitted work."
