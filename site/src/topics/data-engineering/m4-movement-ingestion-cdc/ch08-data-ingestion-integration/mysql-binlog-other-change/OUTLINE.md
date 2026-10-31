# OUTLINE: MySQL binlog and other change logs (`de.mysql-binlog-other-change`)

## Learning outcomes
1. Configure MySQL for row-based CDC and say why each of the three settings is needed.
2. Explain why GTIDs make failover survivable and file-and-offset positions not.
3. Say what happens when binlog retention expires under a stopped consumer, and how that
   differs from PostgreSQL's slot.
4. Explain why a schema-history topic exists, and place Oracle and SQL Server capture on the
   spectrum between reading a log and polling a change table.

## Engagement arc
- Hook: step 1 (a MySQL replica is promoted after a primary failure; a CDC connector reconnects
  with a file-and-offset position that means nothing there and silently starts from the wrong
  place; the same transaction's GTID matches on both servers).
- Predict: step 2, within the first four steps (whether a trigger-free, replica-promoted
  connector following a bare file-and-offset position can tell it has landed in the wrong
  place).
- Takeaways: step 4 (row-based logging with a full image is what makes a binlog event decodable
  at all), step 6 (a GTID survives exactly the handoff a file-and-offset position cannot), step
  8 (retention expiry forces a resnapshot on MySQL, where PostgreSQL's slot instead pins disk).
- Recap: step 9. Prove it: step 10 (DDL and the schema-history topic, then where Oracle and
  SQL Server sit on the poll-versus-log spectrum).

## Steps (storyboard)

### 1. Hook
- **fig:** two binlog strips, the primary's and the promoted replica's, with the identical
  transaction at two different byte offsets; a connector reconnecting by file-and-offset lands
  on the wrong transaction on the new server, silently; the same transaction's GTID lines up on
  both strips.
- **On screen:** two offset numbers that disagree, one GTID that matches.

### 2. Predict
- **fig:** the connector above has just reconnected to the promoted replica using only a
  file-and-offset position copied from the old primary. Does it notice it has landed in the
  wrong place?
- **Options:** (a) yes — a file-and-offset position carries enough information to detect a
  mismatched server [wrong — a binlog position is only ever meaningful on the server that wrote
  it; nothing in the position itself names which server it belongs to]; (b) no — it silently
  starts reading from whatever transaction happens to sit at that same byte offset on the new
  server, which is very likely the wrong one [correct].

### 3. Reveal — row-based logging is what makes an event decodable
- **fig:** a statement-format binlog entry carries only the SQL text that was run; a row-format
  entry carries the actual column values a statement changed.
- **Moves:** one SQL statement collapses into readable text on the left; the same statement,
  logged as a row event, expands into named columns and values on the right.

### 4. Reveal — row image, measured
- **fig:** the modelled run: the identical update, logged under minimal and full row images; the
  minimal image's before-row is missing the one column that actually changed when a different
  column is inspected, the full image has it.
- **takeaway:** "A row event is only as complete as the image setting behind it — full is the one that never leaves a column out."

### 5. Reveal — a position is only meaningful on the server that wrote it
- **fig:** the same transaction, two file-and-offset numbers, one on the primary and a different
  one on the replica that inherits its data.
- **Narrator's line of thought:** she treats this as the direct cause of the hook's own failure,
  not a separate fact — a position is a byte address, and a byte address means nothing once you
  change which file it's an address into.

### 6. Reveal — GTIDs, measured
- **fig:** the modelled run: the identical transaction's GTID, compared against both servers'
  own file-and-offset positions for it.
- **takeaway:** "A GTID names the transaction, not a location — that's exactly what survives a failover a byte offset can't."

### 7. Reveal — retention expiry is a different failure than PostgreSQL's
- **fig:** a consumer stopped long enough that the binlog segment holding its own position gets
  purged; unlike a PostgreSQL slot, nothing on the MySQL side was pinning that segment for it.
- **Narrator's line of thought:** she contrasts this directly with topic 10's own slot — a slot
  trades a filling disk for a safe position; MySQL's retention clock trades a bounded disk for a
  position that can simply expire.

### 8. Reveal — retention expiry, measured
- **fig:** the modelled run: a short downtime that still finds its position, a long downtime
  past the retention window that doesn't.
- **takeaway:** "Past the retention window a MySQL consumer's old position is just gone — no slot ever pinned it for you."

### 9. Recap
- **fig:** row image deciding what a decoded event carries, a GTID surviving a failover a byte
  offset can't, and retention expiry forcing a resnapshot with nothing pinning the log for you.

### 10. Prove it
- **fig:** none of this explains how a consumer makes sense of a row event logged before a
  column was added, or where Oracle and SQL Server's own capture mechanisms fit next to MySQL's
  binlog and PostgreSQL's slot.
- **predict options:** (a) a MySQL row event carries enough of its own schema that this is
  never a problem [wrong — a binlog row event addresses columns by position, not by name, so an
  old event is ambiguous without knowing the schema that was in force when it was written]; (b)
  the connector has to keep its own record of every DDL statement, in binlog order, to interpret
  an old row event correctly [correct].

## Post-notes headings
- **Internals:** row-based binlog with a full image, GTIDs, retention, and the schema-history
  topic are modelled in plain Python against the documented mechanics, not a live MySQL server,
  which this sandbox does not have. Oracle's LogMiner and XStream, and SQL Server's capture
  instance and `_CT` change table, are named from their own documentation and placed on the
  poll-versus-log spectrum topic 9 introduced, not independently exercised.
- **Lab:** none of its own, per `CHAPTER.md` — the GTID-versus-offset demonstration that would
  run on a real second MySQL is modelled instead and disclosed as such.
- **Production:** the hook's own scenario (a connector silently landing on the wrong
  transaction after a failover) as the concrete cost of configuring a MySQL CDC pipeline by
  file-and-offset instead of GTID.
- **Frontier:** none claimed — binlog, GTIDs, LogMiner, XStream and SQL Server's CDC tables are
  each established, long-documented mechanisms.
- **Where this goes next:** PostgreSQL's slot is a convenience with a sharp edge: it never lets
  go of what its consumer has not confirmed. When a consumer stalls, that edge is the production
  disk.

## Concept ledger
- **Introduces:** `mysql-binlog-gtid-schema-history`, `engine-capture-mechanisms`.
- **Uses:** `logical-decoding-slot`, `query-vs-log-cdc`, `replica-identity-before-image` — all
  confirmed live via the registry-parsing script.
- **Declared:** none beyond topic 10.

## Changes from the chapter plan
This sandbox has no MySQL, Oracle or SQL Server server, exactly as `CHAPTER.md` anticipates
("the sandbox may not have a second MySQL"; "Lab: none of its own"). Every measured claim is
instead a Python model of the documented mechanics (row image, GTID position-naming, retention
expiry, DDL-versus-schema-history), disclosed as such in `FACT-CHECK.md` and `SOURCES.md`. The
MariaDB GTID page named by `CHAPTER.md` renders as a JavaScript app in this sandbox's fetch and
is not independently quoted; GTID position-independence is sourced entirely from Debezium's own
MySQL page instead, which is sufficient for this topic's claim. The MySQL 8.4 manual remains
unfetchable, as `CHAPTER.md` itself already discloses.

## Claims list (for fact-check)
1. "The binlog-format must be set to ROW or row" / "The binlog_row_image must be set to FULL or
   full." — SOURCES.md (Debezium MySQL docs); modelled directly in `examples.py`.
2. "The connector records its position in the server's binlog, which is different on each
   server in the cluster" / "most HA MySQL clusters use GTIDs" — SOURCES.md (Debezium MySQL
   docs); modelled directly in `examples.py`.
3. "After the connector restarts, if the logs have been pruned, the connector's position in the
   logs might no longer available... a new snapshot is required." — SOURCES.md (Debezium MySQL
   docs); modelled directly in `examples.py` using Debezium's own example retention value.
4. "This database schema history topic is for internal connector use only." — SOURCES.md
   (Debezium MySQL docs); modelled directly in `examples.py`.
5. "Oracle LogMiner is responsible only for reading redo and archive logs from disk and
   streaming the raw changes" / "To use the XStream API, you must have a license for the
   GoldenGate product." — SOURCES.md (Debezium Oracle docs, Oracle LogMiner docs); modelled in
   `examples.py`.
6. "Change data capture utilizes the SQL Server Agent to log insertions, updates, and
   deletions" / the `_CT` change table naming — SOURCES.md (Microsoft SQL Server CDC docs);
   modelled in `examples.py`.
