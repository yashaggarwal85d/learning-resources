import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results on this sandbox's own PostgreSQL cluster (examples.py, pageinspect's own
// get_raw_page/heap_page_items): a real page's own header fields (pd_lower before pd_upper,
// at or before pd_special); line pointers whose own stored offset moved under a real VACUUM
// while the surviving rows' own CTIDs stayed bit-for-bit identical; a real null bitmap present
// only on a row that actually has a null column, naming the exact missing column; a real
// incompressible value chunked into several real rows of a separate TOAST table, leaving a far
// smaller row behind in the main table that still round-trips to the exact original value.
// InnoDB's own overflow-page mechanism is named and sourced directly rather than run, since this
// sandbox has no InnoDB instance. No literal digits anywhere (the duration numbers below are exempt).
const reel: Reel = {
  steps: [
    {
      title: "Hook: every engine this course has used was taken on faith — what's the one physical thing underneath all of them?",
      body: (
        <>
          A dataframe library, a hand-built extension, a database client — every one of them
          called a real database engine without ever opening what that engine actually reads and
          writes. What's the one physical unit every one of those engines shares?
        </>
      ),
      duration: 4.8,
      fig: 'every engine this course has used — Postgres, RocksDB, Polars reading Parquet — reads and writes the exact same physical unit. What is it?',
      Visual: S.Hook,
    },
    {
      title: "Reveal: a page's own five parts, read directly off a real table",
      body: (
        <>
          A real page, read directly off this sandbox's own Postgres cluster rather than
          diagrammed. A fixed-size header first, then two regions growing toward each other from
          opposite ends until they meet.
        </>
      ),
      duration: 4.8,
      fig: "a real page, read directly from this sandbox's own Postgres cluster — what are its five parts, and which direction does each one grow?",
      Visual: S.RevealFiveParts,
    },
    {
      title: 'Reveal: a line pointer, decoded',
      body: (
        <>
          Each entry in that line-pointer array, decoded directly: a byte offset and a length,
          four bytes total, one entry per row. This exact pair is the mechanism the next
          question turns on.
        </>
      ),
      duration: 4.8,
      fig: "the line-pointer array's own entries, read directly — what does each one actually store?",
      Visual: S.RevealLinePointer,
    },
    {
      title: "Predict: if VACUUM moves a surviving row to a new offset, does that row's own CTID change too?",
      body: (
        <>
          A real VACUUM reclaims the space a deleted row left behind by physically moving a
          surviving row to a new offset inside the page. Does that row's own CTID — the thing
          everything else points at it by — change along with it?
        </>
      ),
      duration: 2.8,
      fig: "VACUUM physically moves a surviving row to a new offset inside the page — does that row's own CTID change along with it, or stay exactly where it was?",
      predict: {
        options: [
          { label: 'Yes — a CTID names a byte offset, so moving the row must change it' },
          { label: 'No — a CTID names a line-pointer index, and the line pointer itself never moves', correct: true },
        ],
        explain: (
          <>
            No. A CTID is a page number plus a line-pointer index, not a byte offset. The line
            pointer stays at its own index and is simply updated to point at the row's new
            offset, so nothing that referenced this row's CTID ever has to notice the move.
          </>
        ),
      },
      Visual: S.PredictCtidStability,
    },
    {
      title: 'Reveal: the identical row, moved by a real VACUUM, CTID unchanged',
      body: (
        <>
          A real row, its deleted neighbors reclaimed by a real VACUUM against this sandbox's own
          cluster. Its own stored offset genuinely changes. Its CTID, read before and after,
          does not.
        </>
      ),
      duration: 4.8,
      fig: "a real row, deleted neighbors reclaimed by a real VACUUM — does its CTID survive the move, or does the move break it?",
      takeaway: 'A real VACUUM moves a surviving row to a new offset while its CTID, the line-pointer index, stays the same.',
      Visual: S.RevealVacuumMove,
    },
    {
      title: 'Reveal: the null bitmap, read off a real inserted row',
      body: (
        <>
          A row with one null column, inserted for real, and a row with none. Only one of them
          carries a bitmap at all, and where it exists, the real bit for the missing column
          reads exactly as the documentation says it should.
        </>
      ),
      duration: 4.8,
      fig: 'a row with one null column, read directly — does the bitmap actually mark which column is missing?',
      takeaway: "The null bitmap isn't stored unless a row has a null column, and its bits name the exact missing one.",
      Visual: S.RevealNullBitmap,
    },
    {
      title: 'Reveal: a large value, moved out of line by a real TOAST',
      body: (
        <>
          An incompressible value, inserted well past the threshold where a row stops fitting
          comfortably on one page. What's actually left behind in the main table once it moves
          out of line?
        </>
      ),
      duration: 4.8,
      fig: "an incompressible value far past the TOAST threshold, inserted for real — how much smaller is the row that's actually left in the main table?",
      takeaway: "TOAST doesn't shrink a large value — it moves it into a side table, leaving a tiny pointer behind.",
      Visual: S.RevealToastMove,
    },
    {
      title: "Reveal: InnoDB's own overflow pages, the same problem solved differently",
      body: (
        <>
          A different engine, the identical fixed-page problem, named directly from its own
          documentation rather than run here. Does it solve it the same way, or differently?
        </>
      ),
      duration: 4.8,
      fig: "InnoDB's own documentation, on the identical fixed-page problem — does it solve it the same way TOAST does, or differently?",
      Visual: S.RevealInnodbOverflow,
    },
    {
      title: 'Recap',
      body: (
        <>
          A page's own five parts, read directly off a real table. A line pointer decoded as a
          real offset-and-length pair. A real VACUUM moving a row's own offset while its CTID
          stays exactly the same. A real null bitmap naming the exact missing column. A real
          incompressible value chunked out of line by TOAST, leaving a tiny pointer behind. And
          the identical fixed-page problem, solved differently by a different engine.
        </>
      ),
      duration: 4.8,
      fig: "a page's own five parts, a line pointer decoded, a CTID surviving a real VACUUM, a real null bitmap, a real TOAST move, and InnoDB's own different answer to the same problem",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A maintenance script holds onto a row's CTID across a batch of unrelated updates
          happening elsewhere in the same table. A VACUUM runs somewhere in the middle of that
          batch. Does the script's own held CTID still point at the right row when the batch
          finishes, and why?
        </>
      ),
      duration: 2.8,
      fig: "a script holds a row's CTID across a batch of updates while a VACUUM runs in the middle — does the held CTID still point at the right row, and why?",
      predict: {
        options: [
          { label: 'No — any VACUUM anywhere in the table risks invalidating a held CTID' },
          { label: "Yes — VACUUM only ever updates a line pointer's own stored offset, never the line-pointer index a CTID actually names", correct: true },
        ],
        explain: (
          <>
            Yes, the held CTID still points at the right row. VACUUM only ever changes where a
            line pointer's own offset points within the page — it never changes which
            line-pointer index a given row occupies, and a CTID names exactly that index, not a
            byte offset. The script's own held reference is exactly what this topic's own real
            VACUUM measurement already proved stable.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
