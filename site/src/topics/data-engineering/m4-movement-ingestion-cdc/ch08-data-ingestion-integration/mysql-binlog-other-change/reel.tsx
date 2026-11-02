import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This sandbox has no MySQL, Oracle or SQL Server server (CHAPTER.md: "the sandbox may not
// have a second MySQL"; "Lab: none of its own"). Every figure here is a direct run of
// examples.py, modelling Debezium's and Microsoft's own documented mechanics in plain Python
// over data standing in for a binlog, a replica's own offsets, and a schema-history topic --
// not a live engine. Each modelled fact traces to a quoted sentence in SOURCES.md.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A MySQL replica gets promoted after a primary failure. A CDC connector reconnects
          with a file-and-offset position copied from the old primary, a position that means
          nothing on this new server, and silently starts reading from the wrong place. The
          same transaction's GTID would have matched on both.
        </>
      ),
      duration: 4.8,
      fig: "a replica is promoted; the connector reconnects with a file-and-offset position that means nothing there, but the GTID still matches.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: does the connector notice',
      body: (
        <>
          The connector above has just reconnected using only the old file-and-offset position.
          Does it notice it has landed in the wrong place?
        </>
      ),
      duration: 2.8,
      fig: 'the connector above just reconnected using only the old file-and-offset position. Does it notice it landed in the wrong place?',
      predict: {
        options: [
          { label: 'Yes — a file-and-offset position carries enough information to detect a mismatched server' },
          { label: 'No — it silently starts reading whatever transaction happens to sit at that same byte offset on the new server', correct: true },
        ],
        explain: (
          <>
            A binlog position is only ever meaningful on the server that wrote it. Nothing in
            the position's own value names which server it belongs to, so a connector handed
            only a byte offset has no way to tell it was meant for a different file entirely.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: row-based logging is what makes an event decodable',
      body: (
        <>
          A statement-format binlog entry carries only the SQL text that was run. A row-format
          entry carries the actual column values that statement changed.
        </>
      ),
      duration: 4.8,
      fig: 'a statement-format entry logs only the SQL text; a row-format entry logs the actual column values a statement changed.',
      Visual: S.RevealRowFormat,
    },
    {
      title: 'Reveal: row image, measured',
      body: (
        <>
          Modelled against Debezium's own documented settings: the identical update, logged
          under a minimal row image and a full row image, read back two ways.
        </>
      ),
      duration: 4.8,
      fig: "the same update, logged under a minimal image and a full image; only one of them keeps every old column.",
      takeaway: 'A row event is only as complete as the image setting behind it — full never leaves a column out.',
      Visual: S.RevealRowImageMeasured,
    },
    {
      title: 'Reveal: a position is only meaningful on the server that wrote it',
      body: (
        <>
          The identical transaction has two different file-and-offset positions, one on the
          primary and a different one on the replica that inherits its data.
        </>
      ),
      duration: 4.8,
      fig: "the identical transaction's byte position is only ever meaningful on the server that wrote it.",
      Visual: S.RevealPositionIsLocal,
    },
    {
      title: 'Reveal: GTIDs, measured',
      body: (
        <>
          Modelled directly: the identical transaction's GTID, compared against both servers'
          own file-and-offset positions for it.
        </>
      ),
      duration: 4.8,
      fig: "the same transaction's GTID, compared against both servers' own byte positions for it.",
      takeaway: 'A GTID names the transaction, not a location — that is exactly what survives a failover a byte offset cannot.',
      Visual: S.RevealGtidMeasured,
    },
    {
      title: "Reveal: retention expiry isn't PostgreSQL's failure mode",
      body: (
        <>
          A consumer stopped long enough finds its own binlog segment purged. Unlike a
          PostgreSQL slot, nothing on the MySQL side was pinning that segment for it.
        </>
      ),
      duration: 4.8,
      fig: "a stopped consumer's own binlog segment gets purged; nothing on the MySQL side was pinning it, unlike a PostgreSQL slot.",
      Visual: S.RevealRetentionContrast,
    },
    {
      title: 'Reveal: retention expiry, measured',
      body: (
        <>
          Modelled using Debezium's own example retention window: a short downtime that still
          finds its position, a long downtime past the window that doesn't.
        </>
      ),
      duration: 4.8,
      fig: "a short downtime still finds its position; a downtime past the retention window does not.",
      takeaway: "Past the retention window a MySQL consumer's old position is simply gone — no slot ever pinned it.",
      Visual: S.RevealRetentionMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          Row image deciding what a decoded event carries, a GTID surviving a failover a byte
          offset cannot, and retention expiry with nothing on the MySQL side pinning the log.
        </>
      ),
      duration: 4.8,
      fig: "row image deciding what a row event carries, a GTID surviving a failover, retention expiry with nothing pinning the log.",
      takeaway: "MySQL trades a PostgreSQL slot's pinned disk for a retention clock that can simply run out on a stalled consumer.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          None of this explains how a row event logged by column position, before a schema
          change, gets read correctly afterward.
        </>
      ),
      duration: 2.8,
      fig: "none of this says how an old row event, logged by column position, gets read correctly after the schema changes.",
      predict: {
        options: [
          { label: 'A MySQL row event carries enough of its own schema that this is never a problem' },
          { label: "The connector has to keep its own record of every DDL statement, in binlog order, to interpret an old row event correctly", correct: true },
        ],
        explain: (
          <>
            A binlog row event addresses columns by position, not by name, so an old event is
            ambiguous without knowing the schema that was in force when it was written. That is
            exactly what a schema-history topic exists to answer.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
