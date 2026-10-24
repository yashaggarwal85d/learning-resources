import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results on this sandbox's own PostgreSQL cluster (examples.py, via the pageinspect
// extension): a fifty-thousand-row table's own primary-key B-tree keeps a root level of one
// (two levels total) and a small, bounded page count — fanout bounding lookup depth. Under an
// identical batch of mid-range inserts, a fillfactor=100 index grows by real pages while an
// otherwise identical fillfactor=10 index on the same data grows by none. An index on a heavily
// duplicated column (ten distinct values across fifty thousand rows) is real pages smaller with
// deduplication on than off. The Lehman-Yao concurrency algorithm, PG18's skip scan, and the
// InnoDB clustered-vs-Postgres heap-organized lookup-cost contrast are named and sourced
// directly from Postgres's own nbtree README, release notes, and MariaDB's own documentation
// rather than reproduced, since this sandbox has no InnoDB engine and reproducing a genuine
// concurrent page split would require instrumenting Postgres's own internals. No literal digits
// anywhere (the duration numbers below are exempt).
const reel: Reel = {
  steps: [
    {
      title: "Hook: every mechanism so far assumed one path to a row — what finds the right page fast?",
      body: (
        <>
          Every topic in this chapter so far has quietly assumed you already know which page
          holds the row you want. Real tables have millions of rows across many pages. What
          actually finds the right one fast, instead of checking every page in order?
        </>
      ),
      duration: 4.8,
      fig: 'every earlier topic assumed one path to a row: a direct page read. What finds the right page fast?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: structure & fanout (real measurement)',
      body: (
        <>
          A real index, built on fifty thousand rows on this sandbox's own cluster, read
          directly via Postgres's own page-inspection tools: the tree stays just two levels
          deep. Fanout is why depth barely grows as row count grows.
        </>
      ),
      duration: 4.8,
      fig: 'a real index, fifty thousand rows: how many levels deep does it actually stay?',
      Visual: S.RevealFanout,
    },
    {
      title: 'Reveal: page split & cascade',
      body: (
        <>
          When a leaf page can't fit a new tuple, it splits, and a pointer to the new page goes
          into the parent. If the parent is also full, it splits too — all the way up to the
          root, if it has to, which is the one moment the tree grows a new level.
        </>
      ),
      duration: 4.8,
      fig: 'a leaf page fills up. What happens to the tuple that does not fit?',
      Visual: S.RevealPageSplit,
    },
    {
      title: 'Predict: fillfactor',
      body: (
        <>
          About to insert fifty thousand rows into a brand-new index: should it pack every
          page as full as it'll go, or leave real room on each page on purpose?
        </>
      ),
      duration: 2.8,
      fig: 'should a new index pack its pages as full as possible, or leave room?',
      predict: {
        options: [
          { label: 'As full as possible — wasted space is wasted space' },
          { label: 'Leave real room on each page — it trades initial size for fewer future splits', correct: true },
        ],
        explain: (
          <>
            Packing every page to its limit leaves zero room for a future insert that lands
            inside an existing page's key range, forcing an immediate split on the very next
            one. A lower fillfactor trades some space up front for real room to absorb inserts
            and updates without splitting — exactly the trade-off the documentation describes.
          </>
        ),
      },
      Visual: S.PredictFillfactor,
    },
    {
      title: 'Reveal: the real fillfactor measurement',
      body: (
        <>
          The identical batch of mid-range inserts, run against two otherwise identical indexes:
          one packed tight, one left loose. Measured directly, the tight index grows. The loose
          one, on the identical data, doesn't grow at all.
        </>
      ),
      duration: 4.8,
      fig: 'the same mid-range inserts, two fillfactors: how many pages does each index actually grow by?',
      takeaway: 'Under identical mid-range inserts, a tightly packed index grows; a loosely packed one, on the same data, does not.',
      Visual: S.RevealFillfactorMeasurement,
    },
    {
      title: 'Reveal: the real deduplication measurement',
      body: (
        <>
          A column with only ten distinct values across fifty thousand rows, indexed twice:
          once with deduplication on, once off. Measured directly, the deduplicated index is
          a fraction the size of the other.
        </>
      ),
      duration: 4.8,
      fig: 'an index on a column with only ten distinct values: how much smaller with deduplication on?',
      takeaway: 'Deduplication shrinks a heavily duplicated index to roughly a third its size, measured directly.',
      Visual: S.RevealDeduplicationMeasurement,
    },
    {
      title: 'Reveal: Lehman-Yao concurrency',
      body: (
        <>
          A search is reading a page exactly when it splits underneath it. Postgres's own source
          adds one pointer to every page — to its right sibling — and one bound, a high key,
          which is enough to detect the split and recover without locking the whole tree.
        </>
      ),
      duration: 4.8,
      fig: 'a search is reading a page exactly when it splits underneath it. What stops that from reading garbage?',
      takeaway: "A concurrent split is detected by a page's own high key, then handled with a right-link, no whole-tree lock.",
      Visual: S.RevealLehmanYao,
    },
    {
      title: 'Reveal: two more production features',
      body: (
        <>
          Two more real, named things worth stating precisely. Postgres eighteen lets a
          multicolumn index still be used even when a query skips the leading column. And a
          genuinely different engine design: one clustered table's own secondary lookup costs
          an extra tree traversal that a heap-organized table's doesn't.
        </>
      ),
      duration: 4.8,
      fig: 'two features production systems actually use: a smarter multicolumn lookup, and a different engine own trade-off.',
      Visual: S.RevealProductionFeatures,
    },
    {
      title: 'Recap',
      body: (
        <>
          Fanout keeps a real index's depth bounded, measured directly at two levels for fifty
          thousand rows. Fillfactor and deduplication are real, measured trade-offs: a tight
          index splits where a loose one doesn't; deduplication shrinks a duplicate-heavy index
          to a fraction its size. None of it needs a whole-tree lock to stay safe under
          concurrent writes.
        </>
      ),
      duration: 4.8,
      fig: 'fanout bounds depth, fillfactor and deduplication measured directly, and concurrency without a whole-tree lock',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team sees this topic's own measurement — deduplication shrank a duplicate-heavy
          index to a fraction its size — and redesigns the schema so that column's values become
          nearly all unique. What happens to deduplication's own benefit on that same index now?
        </>
      ),
      duration: 2.8,
      fig: "a team removes all duplicates from a heavily duplicated index column. What should happen to deduplication's own benefit?",
      predict: {
        options: [
          { label: 'Nothing changes — deduplication still saves the same amount of space' },
          { label: 'The benefit shrinks or disappears — deduplication only helps when there really are duplicate tuples to pack together', correct: true },
        ],
        explain: (
          <>
            Deduplication's entire benefit comes from packing tuples that share identical
            indexed values into one compact representation. If a schema change makes those
            values mostly unique, there's nothing left to pack — the feature becomes a no-op
            rather than a space saver, exactly the inverse of this topic's own measurement,
            where concentrating duplication made the saving large.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
