# Fact-check — de.cdc-from-oltp-into

## Claims re-derived against the source

1. **`max_slot_wal_keep_size` is the setting that bounds a replication slot's retained WAL; past
   the bound, a slot that has fallen behind by more than the cap can no longer continue
   replication because the WAL it needs has been removed.** SOURCES.md's PostgreSQL quote
   supports this directly and names the mechanism exactly: the cap is measured against
   `restart_lsn` falling behind the current LSN, not wall-clock time or connector-down duration.
   Checked step 5's "cap" reveal states the cost (forced re-snapshot) as a direct consequence of
   this exact mechanism, not an invented penalty.

2. **A replication slot retains all the WAL entries a connector like Debezium needs, even while
   that connector is stopped or down.** SOURCES.md's first Debezium quote supports this
   directly. Checked step 4's "the guarantee is the hazard" framing doesn't overclaim this as a
   Postgres-wide behavior independent of slots generally — the quote is specifically about what
   the slot guarantees for Debezium's own consumption, which is exactly the mechanism the hook's
   stopped connector exercises.

3. **A heartbeat event, configured via a connector's heartbeat interval, is Debezium's own
   documented fix for a slot that would otherwise lag on a quiet table.** SOURCES.md's second
   Debezium quote supports this directly, including the exact scenario (many database updates,
   few relevant to the tracked tables). Checked step 5's heartbeat mention doesn't claim the
   heartbeat shrinks retained WAL that already exists — only that it advances the slot's
   confirmed position on an otherwise-quiet table, which is what the quote states.

4. **The pipeline strip, the snapshot-versus-watermark-incremental-snapshot handover decision,
   the delete-and-schema-change policy, and the compaction-to-slot interaction are this
   chapter's own established method and this topic's own derived design.** Not an independent
   citation beyond claims 1–3 — `CHAPTER.md`'s own scope line states the snapshot-handover
   decision card, the delete/schema-change policy and the compaction interaction as this topic's
   own worked design, naming DBLog (Andreakis and Papapanagiotou, 2019) and Debezium's
   signalling documentation as the named real-world precedent for the watermark-based
   incremental-snapshot alternative, not re-derived here beyond the characterization
   `CHAPTER.md` itself already gives it ("interleav[es] transaction log events with rows that we
   directly select from tables," "does not use locks and has minimum impact on the source") —
   checked step 6's decision-card text doesn't extend this characterization beyond what
   `CHAPTER.md` quotes.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("the connector itself leaked disk space through a
  memory or log bug") is a genuine, plausible-sounding first guess for an on-call engineer
  seeing a disk gauge climb — a real connector bug is a real failure mode elsewhere in this
  chapter's own failure-table method (topic 7) — but it's ruled out by the hook's own stated
  fact pattern: the connector was "healthy for nine months" and the growth tracks exactly with
  the stopped state, which is the slot-retention mechanism this topic's own reveal establishes,
  not a code defect.
- **Predict 2 (step 10, "Prove it"):** checked that "compute the slot's own growth rate against
  the time left to the cap" genuinely follows from the same mechanism as claim 1 above (the cap
  is measured against `restart_lsn` lag, which grows at a rate the connector's own stopped state
  determines) — raising the cap is ruled out because it doesn't change the trade-off the design
  itself names (source disk versus forced re-snapshot), it only moves the same cliff further out.

## Illustrative numbers (figs for steps 1, 5, 8, 10)

The hook's "94 percent disk by Wednesday" and "nine healthy months," the WAL-growth simulation's
specific retention curve and cap line, the compaction backlog's exact file counts, and the
second table's "already past half the configured cap" in step 10 are illustrative, stated lab
numbers for the storyboard and the simulation in `examples.py`, not cited real-world incident
figures — no claim is made about any specific company's actual outage or disk-fill incident.

## Outcome

No open findings. Every claim about the slot's retention guarantee, the cap setting, and the
heartbeat fix traces to one of SOURCES.md's three verbatim quotes across two sources
(PostgreSQL, Debezium); the snapshot-handover decision card, the delete/schema-change policy and
the compaction interaction rest on `CHAPTER.md`'s own stated scope and its own quoted
characterization of DBLog's incremental snapshot, not an unsourced factual claim; both predicts
are checked against the chapter's own established mechanisms rather than invented reasoning.
