import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Compressed bitmaps: Roaring. The previous chapter's handoff's exact counterpart to a Bloom filter:
// no false answers, split per 65,536-value chunk into whichever of array, bitmap or run
// container is actually smallest. Every number shown is computed or asserted in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'How much smaller, and by how much?',
      body: (
        <>
          A query is the intersection of several predicates, each matching a set of row ids out
          of four billion possible. A plain bitmap per predicate costs half a gigabyte whether it
          matches a thousand rows or two billion; a plain sorted array costs four bytes per
          matching row and stays smaller until a hundred and thirty four million rows match. What
          happens when the same set is dense in one part of the universe, sparse in another, and
          one long run in a third?
        </>
      ),
      duration: 4.8,
      fig: 'half a gigabyte, fixed, versus four bytes per match',
      Visual: S.Hook,
    },
    {
      title: 'The two-level structure',
      body: (
        <>
          Split the universe by its top sixteen bits into sixty five thousand five hundred and
          thirty six chunks, each covering the same number of possible values. A set becomes a
          sorted list of chunk keys, each paired with a container holding only that chunk's own
          low sixteen bits.
        </>
      ),
      duration: 4.6,
      fig: 'one key, one container, per chunk',
      Visual: S.TwoLevel,
    },
    {
      title: 'Does the same container win both?',
      body: (
        <>
          One chunk holds a hundred values, scattered with no two adjacent. Another holds thirty
          thousand values, bunched into short runs. Does the same kind of container turn out
          smallest for both?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes — one container is always smallest for any chunk' },
          { label: "No — the smallest depends on that chunk's own shape", correct: true },
          { label: 'Yes — a bitmap is always smallest once a chunk is dense' },
          { label: 'No — it depends only on how many values the chunk holds' },
        ],
        explain: (
          <>
            No — on the shape, not a fixed rule or the count alone: a hundred scattered values
            favor one container, thirty thousand bunched into short runs favor a different one.
          </>
        ),
      },
      fig: 'one scattered chunk, one bunched chunk',
      Visual: S.ShapePredict,
    },
    {
      title: 'Three containers, one honest size',
      body: (
        <>
          A sorted array at two bytes a value for a sparse chunk; a fixed eight kilobyte bitmap
          for a dense one; a run container, a start and a length per run, for one made of long
          stretches. Each chunk's own container is whichever of the three actually comes out
          smallest, measured directly against the worked sizes.
        </>
      ),
      duration: 5,
      fig: 'measured: array, bitmap and run, smallest wins',
      takeaway: "A chunk's own container is picked by measuring all three sizes, never by a fixed rule.",
      Visual: S.ThreeContainers,
    },
    {
      title: 'The 4,096 threshold',
      body: (
        <>
          Two bytes per value against a fixed eight kilobytes: the array and the bitmap cost the
          same at exactly four thousand and ninety six values. That number falls straight out of
          the arithmetic — it was never a tuned constant.
        </>
      ),
      duration: 4.2,
      fig: 'two bytes times four thousand and ninety six equals eight kilobytes',
      Visual: S.Threshold,
    },
    {
      title: 'Six bytes, or sixty-five thousand?',
      body: (
        <>
          A chunk holds every single one of its own sixty five thousand five hundred and
          thirty six possible values — one giant run, start to end. Is its container six bytes,
          or does it cost one unit for every value it holds?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Six bytes — one run, however long it runs', correct: true },
          { label: 'About sixty five thousand bytes — one per value' },
          { label: 'Eight kilobytes, the same as a bitmap' },
          { label: 'Two bytes per value, the same as an array' },
        ],
        explain: (
          <>
            Six bytes. A run container costs almost nothing for how many values it covers, only
            for how many separate runs it takes to cover them — and one giant run is the cheapest
            case there is.
          </>
        ),
      },
      fig: 'one run, from the first value to the last',
      Visual: S.FullChunkPredict,
    },
    {
      title: 'Run containers, and runOptimize',
      body: (
        <>
          A run container almost ignores how many values it covers, as long as they fall into
          few, long runs rather than many short ones. A set starts out as arrays and bitmaps
          only; a library routine scans it afterward and converts whichever containers that
          choice actually shrinks, typically done once, right before the set is stored for
          querying.
        </>
      ),
      duration: 5,
      fig: "measured: a run container's size against its own run count",
      takeaway: 'A run container prices how many runs a chunk takes, almost never how many values it holds.',
      Visual: S.RunOptimize,
    },
    {
      title: 'Three predicates, measured',
      body: (
        <>
          Dense, sparse, and clustered predicates over a few million row ids, each shaped the way
          a real one might be. A plain bitmap costs the same fixed amount regardless; a plain
          array costs four bytes a match. Picking per chunk beats both of them, on every one of
          the three.
        </>
      ),
      duration: 5,
      fig: 'measured: plain bitmap, plain array, picked-per-chunk',
      Visual: S.ThreeMeasured,
    },
    {
      title: 'What does a missing chunk cost?',
      body: (
        <>
          Intersecting two sets, chunk by chunk: one of them simply has no container at all for a
          particular chunk key. What does that chunk cost the intersection?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Nothing — a missing chunk is skipped outright', correct: true },
          { label: 'The cost of an empty container, computed and discarded' },
          { label: 'A full chunk-sized comparison, same as any other chunk' },
          { label: 'It depends on which container type the other side used' },
        ],
        explain: (
          <>
            Nothing. The two sorted key lists are merged like any two sorted lists — a key with
            no match on the other side is simply never visited at all.
          </>
        ),
      },
      fig: 'a key present on one side only, never touched',
      Visual: S.MissingChunkPredict,
    },
    {
      title: 'Chunk-by-chunk AND, and galloping',
      body: (
        <>
          A three-way intersection walks only the chunks every side actually has. Inside a shared
          chunk, two bitmaps AND word by word in one pass; two arrays merge when they're close in
          size, and gallop — jumping ahead exponentially — once one dwarfs the other, measured
          directly against a plain merge at the same sizes.
        </>
      ),
      duration: 5.2,
      fig: 'measured: a plain merge against galloping, as the gap grows',
      takeaway: 'Galloping wins decisively exactly once one side of an intersection dwarfs the other.',
      Visual: S.GallopReveal,
    },
    {
      title: 'Where Roaring is used',
      body: (
        <>
          Each use named at the strength its own source supports: two of a search engine's own
          classes inspired by this design, a cluster compute engine that uses the library
          directly for its own bookkeeping, a real-time analytics store's inverted index, and
          another's default bitmap-index compression.
        </>
      ),
      duration: 4.6,
      fig: 'four systems, four different strengths of adoption',
      Visual: S.Adoption,
    },
    {
      title: 'Recap',
      body: (
        <>
          Roaring answers exactly what a Bloom filter couldn't: no false answers, in close to
          whatever the densest honest encoding of each chunk would need. What it stores one way —
          a sorted list of small integers — is itself compressible further.
        </>
      ),
      duration: 4.2,
      fig: 'no false answers, close to the honest minimum',
      Visual: S.Recap,
    },
  ],
};

export default reel;
