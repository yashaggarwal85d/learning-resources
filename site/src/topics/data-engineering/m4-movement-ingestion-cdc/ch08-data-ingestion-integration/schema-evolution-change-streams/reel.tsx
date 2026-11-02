import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this sandbox's own
// PostgreSQL cluster and a real DuckDB sink: a real ALTER TABLE decoded directly, a real column
// added and dropped, a real widened type that round-trips, and a real narrowed type that a sink
// left behind silently rounds away.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A column is retyped to carry a fraction. The sink's own column keeps its old shape, and
          every fractional amount since arrives rounded away, with nothing raising an error.
        </>
      ),
      duration: 4.8,
      fig: "a column is retyped to carry a fraction on a Friday; the sink's own column keeps its old shape, and every fractional amount since arrives rounded away, with nothing raising an error.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: loud error or silence',
      body: (
        <>
          A dropped column stops appearing in the stream entirely. Does a consumer that expects
          it get an error back, or does nothing happen at all?
        </>
      ),
      duration: 2.8,
      fig: 'a dropped column stops appearing in the stream entirely. Does a consumer that expects it get an error, or does nothing happen at all?',
      predict: {
        options: [
          { label: "An error — the stream can't honor a request for a field that no longer exists" },
          { label: 'Nothing at all — the field is simply absent, and nothing forces anyone to notice', correct: true },
        ],
        explain: (
          <>
            Nothing announces a drop any more than it announces an add. The field is just gone
            from the next row event onward, and only a consumer that was paying attention notices.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: no DDL event',
      body: (
        <>
          An ALTER TABLE statement decodes to an empty transaction: a begin and a commit, with
          nothing between them. Logical decoding carries no event for the DDL itself.
        </>
      ),
      duration: 4.8,
      fig: 'an ALTER TABLE statement decodes to an empty transaction: a begin and a commit, with nothing between them. Logical decoding carries no event for the DDL itself.',
      Visual: S.RevealNoDDLEvent,
    },
    {
      title: 'Reveal: add and drop, measured',
      body: (
        <>
          Run directly against this sandbox's real PostgreSQL: a new column appears for the first
          time only on the row event that actually carries it, and a dropped one disappears the
          same way, with no announcement either time.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: a new column shows up only on the row event that carries it, and a dropped column disappears the same way, with no announcement either time.',
      takeaway: 'A column is never announced, coming or going — it only shows or stops showing on its own row event.',
      Visual: S.RevealAddDropMeasured,
    },
    {
      title: 'Reveal: a retype looks the same way',
      body: (
        <>
          A retyped column is nothing special to the stream: still one row event, now carrying a
          different type tag beside the same column name.
        </>
      ),
      duration: 4.8,
      fig: 'a retyped column is nothing special to the stream: still one row event, now carrying a different type tag beside the same column name.',
      Visual: S.RevealRetypeMechanism,
    },
    {
      title: 'Reveal: widening, measured',
      body: (
        <>
          Run directly against the real database: a column widened to hold a value no smaller
          type ever could; a sink that widened its own column to match stored that exact value.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: a column widened to hold a value no smaller type ever could; a sink that widened to match stored that exact value, nothing lost.',
      takeaway: 'A reader that widens its own column right alongside the source loses nothing at all.',
      Visual: S.RevealWideningMeasured,
    },
    {
      title: 'Reveal: narrowing, measured',
      body: (
        <>
          Run directly against the real database: the same kind of retype, but toward a fraction
          this time; a sink left at its old, narrower type accepted the write and rounded the
          fraction away, with nothing raised anywhere.
        </>
      ),
      duration: 4.8,
      fig: "the real run: a column retyped to carry a fraction; a sink left at its old narrower type accepts the write anyway and rounds the fraction away, with no error.",
      takeaway: "The exact same kind of retype that cost nothing widening costs real precision the moment a reader falls behind it.",
      Visual: S.RevealNarrowingMeasured,
    },
    {
      title: 'Reveal: when retyping is not enough',
      body: (
        <>
          When a retyped column's own old rows can't be reinterpreted under the new shape at all,
          widening or reapplying a type isn't enough. Only a fresh incremental snapshot of that
          table actually repairs it.
        </>
      ),
      duration: 4.8,
      fig: "when a retyped column's own old rows can't be reinterpreted under the new shape at all, widening or reapplying a type isn't enough; only a fresh incremental snapshot of that table repairs it.",
      Visual: S.RevealReSnapshot,
    },
    {
      title: 'Recap',
      body: (
        <>
          An added or dropped column shows up or vanishes only on its own row event, never
          announced. A widened type survives a reader that keeps up with it; a narrowed one
          punishes a reader that doesn't.
        </>
      ),
      duration: 4.8,
      fig: "an added or dropped column shows up or vanishes only on its own row event, never announced; a widened type survives a reader that keeps up, a narrowed one punishes a reader that doesn't.",
      takeaway: 'Nothing about any of this announces itself — a reader either keeps its own shape current, or falls behind it.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new column shows up in a stream your sink has never seen before. Something has to
          decide if this is even allowed before anyone writes a single row. Whose job is that?
        </>
      ),
      duration: 2.8,
      fig: 'a new column shows up in a stream your sink has never seen before. Something has to decide if this is even allowed before anyone writes a row. Whose job is that?',
      predict: {
        options: [
          { label: "The sink's own job, deciding row by row as the data actually arrives" },
          { label: "A schema registry's job, checking the new version's compatibility before anything uses it", correct: true },
        ],
        explain: (
          <>
            A sink deciding row by row only discovers a problem after it has already tried to
            write one. A registry checks a new schema version against its own compatibility rule
            before any consumer is ever handed an event built from it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
