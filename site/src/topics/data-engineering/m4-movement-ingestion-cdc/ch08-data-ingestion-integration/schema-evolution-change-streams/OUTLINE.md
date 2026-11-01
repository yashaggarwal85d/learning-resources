# OUTLINE: Schema evolution in change streams (`de.schema-evolution-change-streams`)

## Learning outcomes
1. Trace an `ALTER TABLE` through to a sink and say what the decoded stream carries and what a
   consumer must infer on its own.
2. Classify adding, dropping and retyping a column as safe, destructive or dangerous for a given
   reader.
3. Decide when a change forces a re-snapshot, and why widening or reapplying a type sometimes
   isn't enough.

## Engagement arc
- Hook: step 1 (a Friday retype keeps the pipeline running while a sink silently rounds away
  every fraction from then on).
- Predict: step 2, within the first four steps (loud error or silence for a dropped column);
  step 10 (whose job it is to gate a new schema version).
- Takeaways: step 4 (neither an add nor a drop is ever announced), step 6 (widening costs
  nothing a reader that keeps up), step 7 (the identical retype costs real precision once a
  reader falls behind), step 9 (recap: nothing announces itself either way).

## Steps (storyboard)

### 1. Hook
- **fig:** a column is retyped to carry a fraction on a Friday; the sink's own column keeps its
  old shape, and every fractional amount since arrives rounded away, with nothing raising an
  error.
- **On screen:** a column changing shape at the source while the sink's own column stays frozen,
  values arriving rounded.

### 2. Predict
- **fig:** a dropped column stops appearing in the stream entirely. Does a consumer that expects
  it get an error, or does nothing happen at all?
- **Options:** (a) an error, since the stream can't honor a request for a field that no longer
  exists [wrong — nothing checks for an expected field that isn't there]; (b) nothing at all —
  the field is simply absent, and nothing forces anyone to notice [correct].

### 3. Reveal — no DDL event
- **fig:** an `ALTER TABLE` statement decodes to an empty transaction: a begin and a commit, with
  nothing between them.
- **Moves:** one transaction's own begin and commit markers, with an empty gap between them
  where a row event would otherwise sit.

### 4. Reveal — add and drop, measured
- **fig:** the real run: a new column shows up only on the row event that carries it, and a
  dropped column disappears the same way, with no announcement either time.
- **takeaway:** "A column is never announced, coming or going — it only shows or stops showing on its own row event."

### 5. Reveal — a retype looks the same way
- **fig:** a retyped column is nothing special to the stream: still one row event, now carrying
  a different type tag beside the same column name.
- **Narrator's line of thought:** she names exactly why a retype isn't treated as a bigger event
  than an add or a drop, to set up why the next two measurements turn out so differently anyway.

### 6. Reveal — widening, measured
- **fig:** the real run: a column widened to hold a value no smaller type ever could; a sink
  that widened to match stored that exact value, nothing lost.
- **takeaway:** "A reader that widens its own column right alongside the source loses nothing at all."

### 7. Reveal — narrowing, measured
- **fig:** the real run: a column retyped to carry a fraction; a sink left at its old narrower
  type accepts the write anyway and rounds the fraction away, with no error.
- **takeaway:** "The exact same kind of retype that cost nothing widening costs real precision the moment a reader falls behind it."

### 8. Reveal — when retyping is not enough
- **fig:** when a retyped column's own old rows can't be reinterpreted under the new shape at
  all, widening or reapplying a type isn't enough; only a fresh incremental snapshot repairs it.
- **Narrator's line of thought:** she names the exact repair this situation needs, pointing
  straight back at topic 14's own chunked-snapshot mechanism rather than inventing a new one.

### 9. Recap
- **fig:** an added or dropped column shows up or vanishes only on its own row event, never
  announced; a widened type survives a reader that keeps up, a narrowed one punishes a reader
  that doesn't.
- **takeaway:** "Nothing about any of this announces itself — a reader either keeps its own shape current, or falls behind it."

### 10. Prove it
- **fig:** a new column shows up in a stream your sink has never seen before. Something has to
  decide if this is even allowed before anyone writes a row. Whose job is that?
- **predict options:** (a) the sink's own job, deciding row by row as data arrives [wrong — a
  sink only sees a row after the decision is already made]; (b) a schema registry's job,
  checking the new version's compatibility first [correct].

## Post-notes headings
- **Internals:** the no-DDL-event proof, the add/drop measurement, and the widen/narrow pair are
  all measured directly against this sandbox's own PostgreSQL cluster and a real DuckDB sink;
  Debezium's own MySQL schema history, JDBC sink schema evolution, and Flink CDC's behaviors are
  named only.
- **Production:** assuming a narrowed or reinterpreted column fails loudly, and treating a
  dropped column as merely absent rather than permanently frozen at the sink, as the two concrete
  failure shapes this topic exists to prevent.
- **Frontier:** Flink CDC's own configurable `schema.change.behavior` policy, named only, since
  Flink CDC's own architecture is topic 21's subject.
- **Where this goes next:** a column added is the most polite change a stream carries; a row
  that stops existing is the rudest, setting up the next topic's subject: deletes and tombstones.

## Concept ledger
- **Introduces:** `cdc-schema-evolution-resnapshot`.
- **Uses:** `mysql-binlog-gtid-schema-history`, `watermark-window-incremental-snapshot`,
  `logical-decoding-slot`, `data-contract-specification` — all confirmed live via the
  registry-parsing script.
- **Declared:** the idea of a schema registry as a service that stores versioned schemas
  (Chapter 9 topic 16 teaches it).

## Changes from the chapter plan
This sandbox has no JVM or Kafka, so Debezium's own MySQL connector, JDBC sink connector and
Flink CDC itself cannot be run directly — all named from their own documentation rather than
reproduced, disclosed in `SOURCES.md` and `FACT-CHECK.md`. This sandbox also has no MySQL server
(confirmed absent in topic 11), so MySQL's own binlog-carried DDL is named only, for contrast.
The four measured claims (no DDL event, add/drop silence, lossless widening, lossy narrowing)
are all measured directly against this sandbox's real PostgreSQL 16 cluster and a real DuckDB
sink reached from the same process, exactly as CHAPTER.md's own "Lab" line describes.

## Claims list (for fact-check)
1. "Logical decoding does not support DDL changes." — SOURCES.md (Debezium PostgreSQL docs);
   measured directly in `examples.py`.
2. The incremental-snapshot schema-change limitation — SOURCES.md (Debezium PostgreSQL docs);
   named only.
3. The MySQL schema history topic — SOURCES.md (Debezium MySQL docs); named only, no MySQL
   server in this sandbox.
4. `schema.evolution: basic` — SOURCES.md (Debezium JDBC sink docs); named only.
5. The Oracle 23 dialect-rejection caveat — SOURCES.md (Debezium JDBC sink docs); named only.
6. Flink CDC's `schema.change.behavior` enum — SOURCES.md (Flink CDC docs); named only.
7. dlt's variant-column strategy — SOURCES.md (dlt docs); named only.
