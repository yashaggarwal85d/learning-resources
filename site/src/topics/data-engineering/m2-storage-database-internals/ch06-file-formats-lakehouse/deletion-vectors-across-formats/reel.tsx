import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against Iceberg's own spec (deletion vectors as a per-file
// bitmap, stored using the deletion-vector-v1 Puffin blob, at most one per data file), the
// Puffin spec itself (the blob's big-endian framing chosen for compatibility with existing
// Delta deletion vectors), Delta's own deletion-vectors docs (default rewrite-the-file behavior,
// the deletion-vector alternative, OPTIMIZE/REORG TABLE compaction), Hudi's own table-types docs
// (its different, non-bitmap mechanism: delete records written into merge-on-read log files),
// and the real RoaringBitmap format spec (the 4,096-element array/bitset threshold) — and
// against a real deletion vector built and measured in this sandbox: a 1,200-position array
// container, a 5,000-position bitset container, and a real, repeated-measured read cost that
// a real compaction pass pays back.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Merge-on-read's own delete files are themselves a mechanism worth a topic on their own.
          This topic is exactly that: the deletion vector, a per-file RoaringBitmap, built
          directly in this sandbox and compared across Delta, Iceberg v3 and Hudi.
        </>
      ),
      duration: 4.8,
      fig: "a small log file was last topic's answer -- this topic opens up what it actually holds.",
      Visual: S.Hook,
    },
    {
      title: "Predict: a file needs 1,200 of its 50,000 rows deleted, without rewriting it — cheapest way to record it?",
      body: (
        <>
          A data file needs 1,200 of its 50,000 rows marked deleted, without rewriting the file.
          What's the cheapest way to record that?
        </>
      ),
      duration: 4.8,
      fig: '1,200 of 50,000 rows need deleting, without rewriting the file -- a list, or a bitmap?',
      predict: {
        options: [
          { label: "A plain list of every deleted row's position" },
          { label: 'A bitmap, one bit per row position', correct: true },
        ],
        explain: (
          <>
            A bitmap is the real mechanism Delta and Iceberg v3 both use — but the real format
            doesn't commit to one shape blindly, as the next few steps show.
          </>
        ),
      },
      Visual: S.PredictArrayOrBitmap,
    },
    {
      title: 'Reveal: a deletion vector is a bitmap, not a list',
      body: (
        <>
          Iceberg's own spec: "Deletion vectors identify deleted rows of a file by encoding
          deleted positions in a bitmap. A set bit at position P indicates that the row at
          position P is deleted."
        </>
      ),
      duration: 4.8,
      fig: 'a bitmap, one bit per row position -- a set bit at position P means that row is deleted.',
      Visual: S.RevealBitmapNotList,
    },
    {
      title: 'Reveal: reproduced for real — a small deletion vector stays an array',
      body: (
        <>
          Built for real in this sandbox: 1,200 deleted positions, at or under the real Roaring
          format's own 4,096-element threshold, stored as a plain array — 2,400 bytes, 2 bytes
          per deleted position.
        </>
      ),
      duration: 4.8,
      fig: 'a real deletion vector, 1,200 positions, under the threshold -- a 2,400-byte array container.',
      takeaway: "Below the real format's own threshold, a deletion vector is just a plain, compact list of positions.",
      Visual: S.RevealSmallStaysArray,
    },
    {
      title: 'Predict: what happens once the deletion count crosses that threshold?',
      body: (
        <>
          The deletion count keeps climbing, past the array's own 4,096-element threshold.
          What happens to the container that stores it?
        </>
      ),
      duration: 4.8,
      fig: 'deletions keep climbing past the threshold -- does the array just keep growing, or does it switch shape?',
      predict: {
        options: [
          { label: 'The array keeps growing, one entry per deleted row' },
          { label: 'The container switches to a fixed-size bitset', correct: true },
        ],
        explain: (
          <>
            The real RoaringBitmap format switches container types right at this threshold — a
            growing array would eventually cost more than just flipping bits in a fixed bitset.
          </>
        ),
      },
      Visual: S.PredictArrayGrowsOrSwitches,
    },
    {
      title: 'Reveal: reproduced for real — a large deletion vector becomes a bitset',
      body: (
        <>
          Built for real: 5,000 deleted positions, over the threshold, switches the same
          container to a fixed 8,192-byte bitset — the exact crossover the RoaringBitmap format
          spec itself defines.
        </>
      ),
      duration: 4.8,
      fig: 'a real deletion vector, 5,000 positions, over the threshold -- a fixed 8,192-byte bitset container.',
      takeaway: 'Past the threshold, the container stops growing — one fixed-size bitset, no matter how many more rows.',
      Visual: S.RevealLargeBecomesBitset,
    },
    {
      title: 'Reveal: the real cost a deletion vector leaves behind at read time',
      body: (
        <>
          Delta's own docs: deletion vectors "mark existing rows as removed without rewriting the
          Parquet file," and reads "resolve current table state by applying the deletions" at
          read time — real work, paid on every read.
        </>
      ),
      duration: 4.8,
      fig: 'no rewrite at write time -- but every read now has to apply the bitmap to find out what survived.',
      Visual: S.RevealRealReadCost,
    },
    {
      title: 'Reveal: reproduced for real — compaction pays that cost back',
      body: (
        <>
          Measured for real: scanning the file while applying the deletion vector costs
          measurably more than a plain scan. Delta names the fix directly: "REORG TABLE ... APPLY
          (PURGE) rewrites all data files" with deletion-vector modifications.
        </>
      ),
      duration: 4.8,
      fig: 'a real measured cost increase from applying the deletion vector -- and a real measured drop after compaction.',
      takeaway: 'A deletion vector defers the cost of a delete to every future read, until compaction purges it for good.',
      Visual: S.RevealCompactionPaysItBack,
    },
    {
      title: 'Reveal: the same bitmap, three formats, one real difference',
      body: (
        <>
          The Puffin spec names it directly: deletion vectors use big-endian framing "for
          compatibility with existing deletion vectors in Delta tables." Hudi answers the same
          question differently — delete records written straight into its own log files, no
          bitmap at all.
        </>
      ),
      duration: 4.8,
      fig: "Delta and Iceberg v3 share one bitmap format -- Hudi's merge-on-read logs answer the same question another way.",
      Visual: S.RevealThreeFormatsOneDifference,
    },
    {
      title: 'Recap',
      body: (
        <>
          A deletion vector is a real bitmap indexed by row position, with a real array-vs-bitset
          size tradeoff at a fixed threshold. It buys a no-rewrite delete, but every read pays a
          real cost for it until compaction purges it for good.
        </>
      ),
      duration: 4.8,
      fig: 'a bitmap buys a cheap delete -- every read pays for it until compaction purges it for good.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
