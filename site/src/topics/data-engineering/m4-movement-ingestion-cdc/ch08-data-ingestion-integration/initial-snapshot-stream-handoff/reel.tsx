import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this sandbox's own
// PostgreSQL cluster: a real CREATE_REPLICATION_SLOT ... EXPORT_SNAPSHOT call over the
// replication protocol, a real SET TRANSACTION SNAPSHOT import in a second session, and a
// hand-written snapshot-then-stream loop that is genuinely killed with a raised exception,
// restarted, and diffed row for row against its own source table.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A connector is killed most of the way through snapshotting a huge table. On restart,
          its progress bar snaps back to empty. The WAL this table's slot is still pinning keeps
          climbing the entire time.
        </>
      ),
      duration: 4.8,
      fig: 'a connector is killed most of the way through snapshotting a huge table; on restart the progress bar snaps back to empty while the retained-WAL bar keeps climbing.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: resume or restart',
      body: (
        <>
          That snapshot was most of the way done when it was killed. On restart, does it pick up
          close to where it left off, or does it begin again from the very first row?
        </>
      ),
      duration: 2.8,
      fig: 'on restart, does the snapshot pick up close to where it was killed, or does it begin again from the very first row?',
      predict: {
        options: [
          { label: 'It resumes close to where it was killed, since most of the work was already done' },
          { label: 'It begins again from the very first row, because nothing short of the very last step ever marked it complete', correct: true },
        ],
        explain: (
          <>
            A snapshot's own completion is recorded only once, at its final step. A kill at any
            point before that leaves nothing behind that a restart could resume from.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: "Reveal: completion is recorded only at the end",
      body: (
        <>
          A snapshot's workflow reads the log position, scans every row, and only then marks
          itself done. A kill at any earlier point leaves no record anywhere that any work ever
          happened.
        </>
      ),
      duration: 4.8,
      fig: "a snapshot's own completion is written only at its very last step; a kill before that step leaves nothing recorded at all.",
      Visual: S.RevealCompletionRecordedOnlyAtEnd,
    },
    {
      title: 'Reveal: the exported snapshot, measured',
      body: (
        <>
          Run directly against this sandbox's real PostgreSQL: creating a slot exports a
          snapshot, and a second session that imports it cannot see a row written right after
          the slot existed.
        </>
      ),
      duration: 4.8,
      fig: "the real run: a slot's own exported snapshot is read in a second session, while a row written right after the slot is checked against it.",
      takeaway: "The exported snapshot shows exactly the database's state at the slot's own start — nothing written after it.",
      Visual: S.RevealExportedSnapshotMeasured,
    },
    {
      title: 'Reveal: no gap and no overlap, by construction',
      body: (
        <>
          A slot's own start position and the snapshot it exports describe the same instant.
          Whatever the snapshot misses, the stream picks up from exactly that point onward.
        </>
      ),
      duration: 4.8,
      fig: "the snapshot position and the stream's own start position are the same point in the log, by construction, not by coincidence.",
      Visual: S.RevealNoGapNoOverlap,
    },
    {
      title: 'Reveal: no gap and no overlap, measured',
      body: (
        <>
          Run directly against the real database: a row written during the snapshot is missing
          from the snapshot's own dump, then shows up in the decoded stream exactly once.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: a row written during the snapshot is missing from the dump and shows up in the decoded stream exactly once.',
      takeaway: 'A row the snapshot misses, the stream catches once — not zero times, and never twice.',
      Visual: S.RevealOverlapMeasured,
    },
    {
      title: 'Reveal: the kill-mid-snapshot lab',
      body: (
        <>
          A hand-written loop copies a source table into a target, row by row, and is killed on
          purpose partway through. The target it leaves behind is real, and only partly filled.
        </>
      ),
      duration: 4.8,
      fig: 'a hand-written snapshot loop, killed on purpose partway through copying rows, leaves a target table that is only partly filled.',
      Visual: S.RevealKillMidSnapshotLab,
    },
    {
      title: 'Reveal: the restart, measured',
      body: (
        <>
          Run directly against the real database: the killed attempt's partial rows are
          discarded, a fresh attempt starts over at row one, and the final target is diffed row
          by row against the source.
        </>
      ),
      duration: 4.8,
      fig: "the real run: the killed attempt's partial rows are discarded, a fresh attempt restarts from the first row, and the final target is diffed row for row against the source.",
      takeaway: 'Throwing away a killed attempt and starting clean still ends in an exact match — no gap, no overlap.',
      Visual: S.RevealRestartMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          A crash before the last step restarts the whole snapshot. The exported snapshot and
          the stream share one seam by construction. A handful of modes decide what a restart
          actually does.
        </>
      ),
      duration: 4.8,
      fig: 'a crash before the last step restarts the whole snapshot; the exported snapshot and the stream share one seam; several modes decide what a restart does.',
      takeaway: 'A snapshot that restarts from zero is cheap on a small table and genuinely dangerous on a huge one.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A brand-new connector, one that just restarted, and one recovering after a gap each
          need something different from a snapshot. Which mode fits a connector that only ever
          needs rows still sitting in the log?
        </>
      ),
      duration: 2.8,
      fig: 'a brand-new connector, one just restarted, and one recovering from a gap each want a different snapshot mode. Which fits a connector that only ever needs fresh rows, never the old ones?',
      predict: {
        options: [
          { label: "initial_only, since it snapshots once and then deliberately stops" },
          { label: "no_data, since it skips the snapshot entirely and streams straight from the slot's own creation point", correct: true },
        ],
        explain: (
          <>
            A connector that never needs a row older than what the log already holds has no use
            for a snapshot at all. `no_data` skips it outright and streams from the slot's own
            start — safe only when every row of interest is still in the log.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
