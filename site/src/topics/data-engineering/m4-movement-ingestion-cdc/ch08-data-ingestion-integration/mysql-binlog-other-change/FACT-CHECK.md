# Fact-check — de.mysql-binlog-other-change

This sandbox has no MySQL, Oracle or SQL Server server, exactly as `CHAPTER.md` itself
anticipates ("the sandbox may not have a second MySQL"; "Lab: none of its own"). Every claim
below is sourced from documentation; `examples.py` models each one in plain Python over data
standing in for a binlog, a replica's offsets, or a schema-history topic, and each function's
docstring says so.

## Claims against sources

1. **"The binlog-format must be set to ROW or row" / "The binlog_row_image must be set to FULL
   or full."**
   Source: Debezium docs, MySQL connector (SOURCES.md quotes 1-2). Direct match. Modelled in
   `binlog_row_image_full_is_required_to_decode_an_update`: a statement-format event carries no
   column values at all; a row event under a minimal image is missing a changed column's old
   value; only a full image carries it, matching exactly what the quote requires and why.

2. **"The connector records its position in the server's binlog, which is different on each
   server in the cluster" / "Because most HA MySQL clusters use GTIDs, replicas are able to
   track all of the changes that occur on any primary server."**
   Source: Debezium docs, MySQL connector (SOURCES.md quotes 5-6). Direct match. Modelled in
   `gtid_resolves_across_servers_file_offset_does_not`: the identical transaction's two
   file-and-offset positions differ by server; its one GTID does not.

3. **`binlog_expire_logs_seconds = 864000` (Debezium's own configuration example) and "After
   the connector restarts, if the logs have been pruned, the connector's position in the logs
   might no longer available... a new snapshot is required."**
   Source: Debezium docs, MySQL connector (SOURCES.md quotes 3-4). Direct match. Modelled in
   `binlog_retention_expiry_forces_a_resnapshot` using Debezium's own example value as the
   retention window, not an invented number.

4. **"This database schema history topic is for internal connector use only."**
   Source: Debezium docs, MySQL connector (SOURCES.md quote 7). Direct match. Modelled in
   `ddl_requires_a_schema_history_to_interpret_old_row_events`: an old row event addressed by
   column position is ambiguous without consulting the schema that was in force at that binlog
   position; a PostgreSQL `pgoutput`-style message, carrying its own column names, needs no such
   lookup — the contrast CHAPTER.md itself draws.

5. **"Oracle LogMiner is responsible only for reading redo and archive logs from disk and
   streaming the raw changes" / "To use the XStream API, you must have a license for the
   GoldenGate product."**
   Source: Debezium docs, Oracle connector (SOURCES.md quotes 8-9). Direct match. Confirmed
   independently by Oracle's own LogMiner documentation ("enables you to query online and
   archived redo log files through a SQL interface," SOURCES.md quote 10) — two sources agreeing
   on what LogMiner does, not one source taken at face value.

6. **"Change data capture utilizes the SQL Server Agent to log insertions, updates, and
   deletions occurring in a table" / the capture instance / the `_CT` change table.**
   Source: Microsoft docs, SQL Server CDC (SOURCES.md quotes 11-13). Direct match. Modelled in
   `oracle_and_sql_server_sit_at_different_points_on_the_poll_vs_log_spectrum`: SQL Server's own
   capture mechanism writes from the log into a table, which a consumer then queries — the
   hybrid CHAPTER.md names, reusing topic 9's own query-vs-log framing directly rather than
   inventing a third category.

## Predict questions red-teamed

- **Step 2** ("does a connector following a bare file-and-offset position notice it has landed
  on the wrong server after a failover"): the wrong option claims the position itself carries
  enough information to detect the mismatch. Checked against the Debezium quote directly: a
  binlog position "is different on each server in the cluster" and nothing in the position's own
  value names which server it belongs to — a connector given only a byte offset has no way to
  tell it was meant for a different file entirely.

- **Step 10** ("does a MySQL row event carry enough schema of its own to be read without
  external help"): the wrong option claims it does. Checked against the Debezium quote directly:
  the schema-history topic exists specifically because a row event addresses columns by
  position, not name, so this is the connector's own documented remedy for a real ambiguity, not
  a convenience it could have skipped.

## Scope check against CHAPTER.md / syllabus

The full syllabus line for this topic names five clauses: row-based binlog with a full image,
GTIDs, binlog retention, DDL parsing and the schema-history topic, and Oracle/SQL Server as
contrasting mechanisms. All five are covered, each sourced from the documentation CHAPTER.md
itself names and modelled in `examples.py` rather than measured against a live engine this
sandbox does not have — exactly the allowance `CHAPTER.md`'s own "Lab" line grants. No claim
here depends on topic 10's PostgreSQL slot internals (used, not re-taught), topic 13's snapshot
lock modes, topic 16's schema-evolution consequences, or topic 19's connector structure, all
named in "Leaves out."
