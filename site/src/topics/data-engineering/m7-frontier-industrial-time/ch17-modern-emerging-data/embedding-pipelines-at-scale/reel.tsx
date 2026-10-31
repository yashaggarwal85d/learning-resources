import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This sandbox has no GPU and no embedding-model library, so the throughput and cost figures
// this reel describes come from a real, CPU-bound encoder stand-in timed on the build machine,
// using the published benchmark's own cost formula — disclosed in examples.py as a smaller,
// honest scale, never presented as a GPU-scale number.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop's support-ticket search re-embeds its entire corpus every night, and the bill
          keeps climbing as the corpus grows — even though most tickets never change once closed.
        </>
      ),
      duration: 2.6,
      fig: 'the whole corpus, every night, whether it changed or not.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what single change cuts the bill',
      body: (
        <>
          What single change cuts that bill the most, without touching correctness at all?
        </>
      ),
      duration: 2.4,
      fig: 'most of the corpus never changes. What should skip it, then?',
      predict: {
        options: [
          { label: 'A smaller embedding model, traded for lower quality on every ticket' },
          { label: 'Hashing each chunk and re-embedding only the ones whose hash changed', correct: true },
        ],
        explain: (
          <>
            For a mostly-closed ticket corpus, the overwhelming majority of chunks have the exact
            same content they had last night. A hash comparison finds that out without touching
            the embedding model at all.
          </>
        ),
      },
      Visual: S.PredictBillCut,
    },
    {
      title: 'Reveal: content hashing, the mechanism',
      body: (
        <>
          Hash each chunk's content, not the whole document, and compare it to the hash stored at
          last embedding. An edit relights exactly one chunk's tag.
        </>
      ),
      duration: 4.2,
      fig: 'one changed chunk. Every other tag stays lit the same as last night.',
      Visual: S.RevealContentHashing,
    },
    {
      title: 'Reveal: throughput and cost per million tokens',
      body: (
        <>
          A published benchmark states its own method plainly: a fixed sequence length, the
          largest batch that fits, a stated hardware rental rate. Reproducing that method on a
          smaller machine, honestly disclosed as smaller, is reading the benchmark for its method
          rather than quoting its number as if it were locally measured.
        </>
      ),
      duration: 4.5,
      fig: "read a benchmark's method. Don't borrow its number.",
      takeaway: "A benchmark's number means nothing without its stated method: sequence length, batch size, hardware.",
      Visual: S.RevealThroughputAndCost,
    },
    {
      title: 'Reveal: the API-bound case',
      body: (
        <>
          An API embedding service is bounded by its own rate limit, a ceiling measured in tokens
          per minute, not by GPU batching throughput at all. The same backlog can be compute-bound
          on a GPU and rate-limit-bound through an API.
        </>
      ),
      duration: 4.2,
      fig: 'two different ceilings. Optimizing the wrong one does nothing.',
      takeaway: "Naming which ceiling actually binds comes before optimizing anything underneath it.",
      Visual: S.RevealApiBoundCase,
    },
    {
      title: 'Reveal: deletes and tombstones',
      body: (
        <>
          Removing a source document has to remove or tombstone its vectors too, or a deleted
          record keeps turning up in search results that should no longer be able to find it.
        </>
      ),
      duration: 4.2,
      fig: 'deleted, but still findable, is not deleted at all.',
      takeaway: 'A tombstone propagated to the index is a correctness requirement, not a cleanup chore for later.',
      Visual: S.RevealDeleteTombstone,
    },
    {
      title: 'Reveal: why a model change cannot be an in-place swap',
      body: (
        <>
          Two different embedding models' vectors for the identical chunk are not comparable — a
          fact this topic depends on, taught plainly rather than re-derived.
        </>
      ),
      duration: 4.2,
      fig: 'same chunk, two models, no shared space to compare them in.',
      takeaway: 'Swapping a model changes what every vector means, not just how it was computed.',
      Visual: S.RevealWhyNotInPlaceSwap,
    },
    {
      title: 'Reveal: the dual-index backfill',
      body: (
        <>
          The old model's index keeps serving every query while the new model's index is built in
          full for the whole corpus. Only once that new index is complete does a cut-over switch
          the query target.
        </>
      ),
      duration: 4.5,
      fig: 'old index still answering. New index still building. Then, only then, cut over.',
      takeaway: 'No downtime means no moment without an answer, not that the backfill finishes instantly.',
      Visual: S.RevealDualIndexBackfill,
    },
    {
      title: 'Recap',
      body: (
        <>
          Read a benchmark for its method, not its number. Hash chunks to skip what hasn't
          changed. Tombstone what's deleted. Never swap models in place — build the new index,
          then cut over.
        </>
      ),
      duration: 4.5,
      fig: 'a method, a hash, a tombstone, a cut-over.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team moves from an API embedding service to running the model on their own GPU.
        </>
      ),
      duration: 2.6,
      fig: 'which of this topic’s techniques actually depend on the move?',
      predict: {
        options: [
          { label: 'All four techniques change, since the whole pipeline moved to new hardware' },
          { label: "Only the rate-limit ceiling disappears — hashing, tombstones and the dual index stay exactly the same", correct: true },
        ],
        explain: (
          <>
            Content hashing, tombstone propagation and the dual-index backfill none of them care
            which kind of ceiling is binding. Only the ceiling itself changes: a GPU is compute-
            bound instead of rate-limit-bound.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
