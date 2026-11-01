import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this sandbox's own
// PostgreSQL cluster: a hand-written implementation of DBLog's own watermark-based chunk
// algorithm (Andreakis & Papapanagiotou, Netflix, published on arXiv), run under a real
// concurrent update, delete and insert load, diffed against the source table at the end.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A chunk's own row is read at the exact instant a transaction deletes that very order.
          Without any marker in the log, the snapshot brings the deleted order right back.
        </>
      ),
      duration: 4.8,
      fig: "a chunk's own row is read at the same instant a transaction deletes that order; without any marker in the log, the snapshot brings the deleted order back.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: resurrected or gone',
      body: (
        <>
          That order was deleted at almost the same moment its row was read into the chunk. Does
          the deleted order come back in this chunk's own output, or does it stay gone for good?
        </>
      ),
      duration: 2.8,
      fig: "does the deleted order come back in this chunk's own output, or does it stay gone?",
      predict: {
        options: [
          { label: 'It comes back, since the chunk already read it before the delete happened' },
          { label: 'It stays gone, because a marker around the chunk lets the delete outrank the stale copy', correct: true },
        ],
        explain: (
          <>
            A chunk's own read is treated as provisional, not final. Anything that touches the
            same key before the chunk's window closes outranks what the chunk already read.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: the watermark window',
      body: (
        <>
          A chunk opens with one marker, reads its rows into memory, and closes with a second
          marker. Anything that touches a row between those two markers outranks the chunk's
          own copy of it.
        </>
      ),
      duration: 4.8,
      fig: "a chunk opens with one marker, reads its rows, and closes with a second marker; anything touched between the two markers outranks the chunk's own copy.",
      Visual: S.RevealWatermarkWindow,
    },
    {
      title: 'Reveal: superseded, measured',
      body: (
        <>
          Run directly against this sandbox's real PostgreSQL: an update inside the window
          replaces the chunk's own stale copy, and a delete inside the window removes the row
          outright, with nothing resurrected.
        </>
      ),
      duration: 4.8,
      fig: "the real run: an update inside the window replaces the chunk's own stale copy; a delete inside the window removes the row outright, with no resurrection.",
      takeaway: "A delete between the two markers is an extreme update — the stale chunk copy never gets the last word.",
      Visual: S.RevealSupersedeMeasured,
    },
    {
      title: 'Reveal: no lock, and the log never waits',
      body: (
        <>
          The only writes this whole algorithm makes are the two marker updates, one per chunk.
          Everything else is a plain read. The log keeps flowing the entire time, with no table
          lock anywhere.
        </>
      ),
      duration: 4.8,
      fig: 'the only writes this algorithm makes are the two marker updates; the log keeps flowing the entire time, chunk after chunk, with no table lock anywhere.',
      Visual: S.RevealNoLockInterleaved,
    },
    {
      title: 'Reveal: the full run, measured',
      body: (
        <>
          Run directly against the real database: a whole table copied one chunk at a time,
          with genuine updates, deletes and inserts fired between every single chunk, diffed
          against the source once the run finishes.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: a whole table copied chunk by chunk, with real updates, deletes and inserts fired between every single chunk, diffed against the source at the end.',
      takeaway: 'A table under constant, heavy concurrent writes still comes out an exact match, with no lock at any point.',
      Visual: S.RevealFullRunMeasured,
    },
    {
      title: 'Reveal: pausing costs nothing',
      body: (
        <>
          Only the position of the last finished chunk is ever stored anywhere. Stopping
          partway through and picking back up from that one position costs the run nothing
          extra.
        </>
      ),
      duration: 4.8,
      fig: "only the last finished chunk's own position is ever stored; stopping partway through and picking up from that position costs nothing extra.",
      Visual: S.RevealPauseResume,
    },
    {
      title: 'Reveal: pause and resume, measured',
      body: (
        <>
          Run directly against the real database: one run finishes every chunk without
          stopping; a second run is deliberately stopped after its second chunk and later
          resumes from exactly that point.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: one run finishes its chunks without stopping; a second run is stopped after its second chunk and later resumes from that exact point; both finish identical.',
      takeaway: 'A run stopped partway through and a run that never stopped end up in the exact same final state.',
      Visual: S.RevealPauseResumeMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          A window of two markers lets any chunk be overruled by the live log, needs no lock
          anywhere on the table, and can pause and resume cleanly at any chunk boundary.
        </>
      ),
      duration: 4.8,
      fig: 'a window of two markers lets any chunk be superseded by the log, needs no lock, and can pause and resume at any chunk boundary.',
      takeaway: 'The same two-marker trick that stops a resurrection also lets the snapshot pause, resume, and run without any lock.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A table gets added to a connector that's already running, and nobody wants to stop
          the stream just to pick it up. What actually triggers that one table's own snapshot
          without touching anything else?
        </>
      ),
      duration: 2.8,
      fig: 'a table gets added to a running connector after the fact, and nobody wants to stop the stream to pick it up. What actually triggers that one table\'s own snapshot?',
      predict: {
        options: [
          { label: 'Restarting the whole connector, since that is the only way to pick up a newly added table' },
          { label: 'A signal naming that one table, sent to a signalling table or a Kafka signalling topic', correct: true },
        ],
        explain: (
          <>
            A signal names exactly the table (or tables) to snapshot, through a dedicated
            signalling table or a Kafka signalling topic, while the connector keeps streaming
            every other table without interruption.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
