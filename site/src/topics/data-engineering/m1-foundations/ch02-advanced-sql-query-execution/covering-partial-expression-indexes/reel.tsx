import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running example: PostgreSQL 16.15 (the existing "shop" database, topics 23-28), same sandbox.
// Every number below is in examples.py and SOURCES.md ("Measured directly").

const reel: Reel = {
  steps: [
    {
      title: 'One extra column in the index, 24x fewer buffers',
      body: (
        <>
          Same table, same filter, the same column read back. One index needs 20,809 buffer reads to answer it. Another, covering the identical
          column plus one extra payload column, needs 855.
        </>
      ),
      duration: 4.8,
      fig: '20,809 buffers vs. 855 — one extra column in the index',
      Visual: S.Hook,
    },
    {
      title: 'Predict: why would a column outside the WHERE clause matter?',
      body: (
        <>
          <code>amount</code> isn't part of this query's filter at all — only <code>status</code> is. Why would adding <code>amount</code> to the
          index change anything about reading it?
        </>
      ),
      duration: 2.4,
      fig: 'WHERE status = 5, but amount is what gets selected',
      predict: {
        options: [
          { label: 'It would not — only filtered columns affect an index' },
          { label: 'The index can now answer the whole query by itself', correct: true },
          { label: 'It makes the index itself match more rows' },
        ],
        explain: (
          <>
            The index can now answer the query entirely on its own — once every column the query needs, filtered or not, lives in the index, the
            table itself never has to be opened.
          </>
        ),
      },
      Visual: S.PredictWhyExtraColumn,
    },
    {
      title: 'Reveal: INCLUDE columns and index-only scans',
      body: (
        <>
          Add <code>amount</code> as a payload column, with <code>INCLUDE</code>, and the plan changes from a bitmap heap scan to an{' '}
          <code>Index Only Scan</code> — the index alone has everything this query asked for.
        </>
      ),
      duration: 4.4,
      fig: 'Index Only Scan — no table visit, Heap Fetches: 0',
      Visual: S.RevealIncludeScan,
    },
    {
      title: 'Reveal: this only works because of the visibility map',
      body: (
        <>
          A bit per heap page says every row on it is old enough to be visible to every transaction. An index-only scan checks that bit instead of
          the table — and the bit, not the index, is what makes the shortcut safe.
        </>
      ),
      duration: 4.4,
      fig: 'one bit per heap page: "every row here is visible to everyone"',
      takeaway: 'The real shortcut in an index-only scan is the visibility map, not the index itself, which only makes it possible.',
      Visual: S.RevealVisibilityMap,
    },
    {
      title: 'Predict: does the covering index survive an UPDATE of every row?',
      body: (
        <>
          Every row this query matches gets updated. The index itself isn't touched structurally. Does the index-only scan's own advantage
          survive that?
        </>
      ),
      duration: 2.4,
      fig: 'UPDATE every matching row — same index, same columns',
      predict: {
        options: [
          { label: 'Yes — the index was not rebuilt or dropped' },
          { label: 'No — the update clears the visibility map for those pages', correct: true },
        ],
        explain: (
          <>
            No — updating a row clears its page's visibility-map bit. The index itself is unchanged, but the shortcut it depended on is gone until
            those pages are revisited.
          </>
        ),
      },
      Visual: S.PredictSurvivesUpdate,
    },
    {
      title: 'Reveal: Heap Fetches jumps from 0 to 444,014',
      body: (
        <>
          Run the identical query against the identical, unchanged index after that update: <code>Heap Fetches: 444,014</code> instead of 0, and
          execution time climbs from 29.634 milliseconds to 319.894.
        </>
      ),
      duration: 4.8,
      fig: 'Heap Fetches: 0 → 444,014 — same index, dirtier pages',
      Visual: S.RevealHeapFetchesJump,
    },
    {
      title: 'Reveal: VACUUM restores it',
      body: (
        <>
          Run <code>VACUUM</code>, and the visibility map bit gets set again for those pages. The identical query, same unchanged index:{' '}
          <code>Heap Fetches: 0</code> again, execution time back down to 56.040 milliseconds.
        </>
      ),
      duration: 4.4,
      fig: 'VACUUM: Heap Fetches back to 0 — the index never moved',
      Visual: S.RevealVacuumRestores,
    },
    {
      title: 'Predict: is a full index on a 98%-one-value column ever wasteful?',
      body: (
        <>
          A column is one particular value in 98% of rows. The other 2% is what every query actually searches for. Is a full index on that column
          ever worth avoiding?
        </>
      ),
      duration: 2.4,
      fig: '98% one value, 2% the rows anyone actually searches for',
      predict: {
        options: [
          { label: 'No — a bigger index never actually costs anything' },
          { label: 'Yes — indexing the common 98% adds size with no payoff', correct: true },
        ],
        explain: (
          <>
            Yes — a query searching for a common value won't use the index for it anyway, so indexing that 98% is pure overhead with nothing to
            show for it.
          </>
        ),
      },
      Visual: S.PredictHotSubset,
    },
    {
      title: 'Reveal: partial indexes over a hot subset',
      body: (
        <>
          Build the index with a <code>WHERE</code> clause covering only the rare 2% instead of the whole column: 896 kilobytes, against 43
          megabytes for a full index on the identical column — about 49 times smaller.
        </>
      ),
      duration: 4.8,
      fig: '896 KB (partial, 2% of rows) vs. 43 MB (full column) — 49x smaller',
      takeaway: 'A partial index over a genuinely small hot subset can be dozens of times smaller than indexing the whole column.',
      Visual: S.RevealPartialIndex,
    },
    {
      title: 'Reveal: and less to update on every other write',
      body: (
        <>
          Every write touching one of the common 98% of rows never has to update this index at all — it isn't in the index's own subset. Only
          writes touching the rare 2% have anything to maintain.
        </>
      ),
      duration: 4.4,
      fig: 'writes to the common 98%: nothing in this index to update',
      Visual: S.RevealPartialWriteSaving,
    },
    {
      title: 'Predict: does an expression index help an equivalent expression?',
      body: (
        <>
          One query computes a name as <code>first_name || ' ' || last_name</code>. Another computes the exact same value with{' '}
          <code>concat(first_name, ' ', last_name)</code>. Does an index on the first expression help the second query too?
        </>
      ),
      duration: 2.8,
      fig: 'same computed value, two different expressions',
      predict: {
        options: [
          { label: 'Yes — they compute the identical value' },
          { label: 'No — only the exact expression the index was built on counts', correct: true },
        ],
        explain: (
          <>
            No — the planner matches expressions by their written form, not by what they compute. A different function call is a different
            expression to it, whatever value it happens to produce.
          </>
        ),
      },
      Visual: S.PredictExpressionMatch,
    },
    {
      title: 'Reveal: only the exact expression gets used',
      body: (
        <>
          The query written with <code>||</code>, matching the index exactly: 0.043 milliseconds, 4 buffers. The identical computation written with{' '}
          <code>concat()</code> instead: a full sequential scan, 399.183 milliseconds — over 9,000 times slower.
        </>
      ),
      duration: 4.8,
      fig: '0.043 ms (exact match) vs. 399.183 ms (concat instead of ||)',
      Visual: S.RevealExpressionMismatch,
    },
    {
      title: 'Reveal: this is syntax, not semantics',
      body: (
        <>
          An expression index earns its speed only from queries that write the exact expression it was built on. Nothing about how expensive or
          cheap the computation is changes that — it's purely a text match.
        </>
      ),
      duration: 4.4,
      fig: 'the planner matches expressions as written, not as computed',
      takeaway: 'An expression index only helps a query that writes the identical expression; an equivalent one written differently gets nothing.',
      Visual: S.RevealSyntaxNotSemantics,
    },
    {
      title: 'Recap',
      body: (
        <>
          INCLUDE columns make an index-only scan possible; the visibility map decides whether it pays off, and an UPDATE can quietly undo that
          until the next VACUUM. A partial index over a genuinely small hot subset shrinks both its size and its write cost. An expression index
          only helps the exact expression it was built on.
        </>
      ),
      duration: 4.8,
      fig: 'INCLUDE → visibility map decides → partial shrinks hot subsets → expression match is exact',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A covering index answers a query with <code>Heap Fetches: 0</code> on Monday. By Friday, every one of those rows has been updated, and
          the same query now shows <code>Heap Fetches: 50,000</code>. Did the index itself change?
        </>
      ),
      duration: 2.8,
      fig: 'Heap Fetches: 0 → 50,000, same query, same index',
      predict: {
        options: [
          { label: 'Yes — the index must have been rebuilt differently' },
          { label: 'No — the visibility map for those pages was cleared instead', correct: true },
        ],
        explain: (
          <>
            No — the index didn't change. The updates cleared the visibility-map bits for those pages, so the index-only scan now has to fall back
            to the heap, exactly as this topic's own measurement showed.
          </>
        ),
      },
      Visual: S.ProveHeapFetchesChange,
    },
  ],
};

export default reel;
