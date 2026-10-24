# Outline: Snapshot visibility over version chains (`rust.snapshot-visibility-over-version`)

Chapter 23, topic 59 (first of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real, minimal version chain per row (each version tagged with the creating transaction's id and, once superseded, the deleting transaction's id) and a real visibility check driven by a reader's own snapshot.
2. Measure that visibility is genuinely a function of version metadata plus the snapshot, never "the newest row": a reader's snapshot keeps seeing an older version even while a newer, as-yet-uncommitted version already sits at the end of the chain.
3. Measure that a writer never overwrites an existing version in place: it stamps the superseded version's own xmax and appends a brand-new version, leaving the old one's own fields untouched.
4. Measure that a reader's snapshot, once taken, keeps returning the identical version across any number of further, unrelated commits.
5. State, from PostgreSQL's own documentation, the real xmin/xmax mechanics and the real "reading never blocks writing" guarantee this prototype's own visibility check reproduces.

## Changes from the chapter plan

None. All claims are measured directly against a real, deterministic version chain and transaction manager built from in-memory Rust collections; nothing here needs root access, real file I/O, or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"A row's version chain has an old, committed version and a newer version just written by a transaction that hasn't committed yet. Which one does an existing reader's own snapshot see?"** (predict, hook) — `fig`: one chain, one old committed version, one newer uncommitted version. Options: whichever version is physically last in the chain / the old, committed version, until the new one actually commits (correct) / it depends on which one is smaller.
2. **"Measured: the old version, not the chain's own newest row"** — `fig`: the real, measured result, the reader's snapshot returning the old value while the chain's own tail already reads the new one. NO takeaway (this is the reel's own "from" step for the phone swipe-from-caption test, per `QUALITY.md`'s own guideline against a takeaway there; the point — visibility is a function of version metadata and the snapshot, never simply the newest row written — is stated directly in the step's own body instead).
3. **"That same newer version's writer now commits. Does the original reader's own snapshot change what it sees?"** (predict) — `fig`: the writer committing, the original reader still holding its own snapshot. Options: yes, it now sees the newly committed version / no, it keeps seeing exactly what it saw before (correct) / only if the reader re-reads from the very start of the chain.
4. **"Measured: the original reader's snapshot kept seeing exactly what it saw before, even after that writer committed"** — `fig`: the real, measured result, unchanged. Takeaway: "A snapshot taken once stays fixed for its own reader's entire lifetime, however many other transactions commit around it."
5. **"A transaction updates a row it can see. Does that update ever overwrite the existing version's own stored fields in place?"** (predict) — `fig`: an update event, the existing version sitting right there. Options: yes, the existing version's own fields are rewritten directly / no, never; a brand-new version is appended and only the old one's own xmax is stamped (correct) / only when no other reader could possibly still hold a snapshot of it.
6. **"Measured: the superseded version's own fields were never touched; a brand-new version was appended instead"** — `fig`: the real, measured chain growth, one version added, the old one's own fields bit-for-bit unchanged. Takeaway: "A writer creates a new version instead of overwriting one a concurrent reader may still need; that's what lets readers and writers never block each other."
7. **"PostgreSQL's own documentation states this guarantee directly. Does MVCC let a long write ever force a concurrent read to wait, or the reverse?"** (predict) — `fig`: PostgreSQL's own words on reading and writing, shown directly. Options: a long write forces concurrent reads to wait / a long read forces concurrent writes to wait / neither; reading never blocks writing and writing never blocks reading (correct).
8. **"PostgreSQL's own words, directly: reading never blocks writing, and writing never blocks reading"** — `fig`: the real quoted guarantee, shown directly. Takeaway: "MVCC buys that guarantee by giving every reader its own fixed snapshot instead of a lock on the row."
9. **"PostgreSQL's own system columns name exactly what this prototype's own version metadata stands in for: what does its xmin column actually record?"** — `fig`: PostgreSQL's own xmin/xmax definitions, shown directly. NO new predict (continues directly from step seven's own guarantee question, to the real system's own column names behind it). NO takeaway (a connecting step restating the real system's own words, not a new kind of claim).
10. **Recap** — visibility is a function of a version's own metadata and a reader's fixed snapshot, never the newest row written; a writer appends a new version instead of overwriting one a reader may still need, which is exactly what lets PostgreSQL's own documentation guarantee that reading never blocks writing and writing never blocks reading.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (about PostgreSQL's own reading/writing guarantee; step 9 continues from it directly, with no new predict, to the real system's own xmin/xmax column names behind it).
- Surprising fact: step 9 (the real system's own documentation naming exactly what this topic's own measured version metadata stands in for).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, being the reel's own "from" step for the phone swipe test; step 9 deliberately has none too, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| in MVCC, locks acquired for reading data do not conflict with locks acquired for writing data, so reading never blocks writing and writing never blocks reading | PostgreSQL Docs: 13.1. Introduction (quoted) |
| xmin is the identity of the inserting transaction for a row version, and a row version is an individual state of a row; each update creates a new row version for the same logical row | PostgreSQL Docs: 5.6. System Columns (quoted) |
| xmax is the identity of the deleting transaction, or zero for an undeleted row version; it can be nonzero in a visible row version when the deleting transaction hasn't committed yet or was rolled back | PostgreSQL Docs: 5.6. System Columns (quoted) |
| a query in a repeatable read transaction sees a snapshot as of the start of the first non-transaction-control statement in the transaction, not as of the start of the current statement | PostgreSQL Docs: 13.2. Transaction Isolation (quoted) |
| a reader's snapshot genuinely kept seeing an older version while the chain's own newest row already read a newer, as-yet-uncommitted value | `examples/runtime-demo/src/snapshot_visibility_version_chain.rs` (executed, measured) |
| a superseded version's own xmin and value are genuinely never touched by a later update; only a brand-new version is appended | `examples/runtime-demo/src/snapshot_visibility_version_chain.rs` (executed, measured) |
| a long-lived reader's snapshot genuinely keeps returning the identical version across further, unrelated commits | `examples/runtime-demo/src/snapshot_visibility_version_chain.rs` (executed, measured) |

## Concept ledger

- `introduces`: `snapshot-visibility-version-chain` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `lsm-write-read-amplification-paths` (topic 56), `compaction-strategy-amplification-tradeoff` (topic 57)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused: "Compaction cuts down how many SSTables a read eventually has to merge; it says nothing yet about how a read decides which SSTables are even worth opening in the first place." *(Reused from Chapter 22's own closing handoff, since this topic is this chapter's own first, continuing directly from Chapter 22's own close.)*
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Visibility decides which single version a reader sees; it says nothing yet about which concurrent histories of reads and writes across several transactions are even allowed to happen at all."
