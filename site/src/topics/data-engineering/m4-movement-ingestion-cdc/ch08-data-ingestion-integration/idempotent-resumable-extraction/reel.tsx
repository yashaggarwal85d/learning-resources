import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this topic's own
// in-process mock warehouse: a batch write and a checkpoint advance raced against a crash in
// three orderings (checkpoint-then-output, output-then-checkpoint, and both committed together),
// a deterministic range-derived batch id and a non-deterministic counter-derived id each re-run
// twice against the identical input, and a batch crash-injected partway through its rows, re-run
// to completion and diffed byte for byte against one clean run with no crash at all.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          An extractor crashes between writing its rows and saving its checkpoint. The restart
          re-extracts the identical rows, and the warehouse now holds a full duplicate batch that
          passes every row-level test anyone runs against it.
        </>
      ),
      duration: 4.8,
      fig: 'an extractor crashes between writing rows and saving its checkpoint; the restart duplicates every row.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which ordering loses data',
      body: (
        <>
          The output write and the checkpoint advance can happen in either order. One ordering
          loses data on a crash between them; the other duplicates it. Which order does which?
        </>
      ),
      duration: 2.8,
      fig: 'the output write and the checkpoint advance can happen in either order. Which order loses data?',
      predict: {
        options: [
          { label: 'Advancing the checkpoint first loses data — the batch is marked done before it is written', correct: true },
          { label: 'Writing the output first loses data — the checkpoint never catches up to it' },
        ],
        explain: (
          <>
            Writing the output first and crashing before the checkpoint advances only causes a
            duplicate on restart, because the rows already landed and the restart simply redoes
            work that already happened. Marking the checkpoint done first means a crash right
            after it leaves nothing written at all, and nothing downstream will ever retry a
            batch the checkpoint already calls finished.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: checkpoint first',
      body: (
        <>
          The checkpoint is marked done, then the crash happens before the output is ever
          written. Nothing downstream thinks this batch still needs doing, and the data is gone
          for good.
        </>
      ),
      duration: 4.8,
      fig: 'the checkpoint is marked done, then the crash happens before the output is ever written.',
      Visual: S.RevealCheckpointFirst,
    },
    {
      title: 'Reveal: all three orderings, measured',
      body: (
        <>
          Run directly against the mock: checkpoint-first loses the batch entirely. Output-first
          duplicates it on restart. Committing both together, atomically, stays consistent no
          matter when the crash lands.
        </>
      ),
      duration: 4.8,
      fig: 'the real run of all three: checkpoint-first loses data; output-first duplicates; atomic is consistent.',
      takeaway: 'Checkpoint before output loses data; output before checkpoint duplicates it — only an atomic commit closes the window.',
      Visual: S.RevealOrderingsMeasured,
    },
    {
      title: 'Reveal: the batch id that makes a re-run safe',
      body: (
        <>
          A batch id derived from the input range itself, not a counter or the wall clock, means
          the identical logical batch always computes the identical id, on every single run —
          whatever decides that is what decides whether a re-run lands on top of the first
          attempt or beside it.
        </>
      ),
      duration: 4.8,
      fig: 'a batch id derived from the input range itself, not a counter or the wall clock.',
      Visual: S.RevealBatchIdConcept,
    },
    {
      title: 'Reveal: deterministic versus non-deterministic ids, measured',
      body: (
        <>
          Run directly against the mock: a range-derived id names the same partition on both
          runs, so the re-run overwrites it and lands at the correct row count. A counter-derived
          id names a different partition each time, so the re-run's rows simply pile up beside
          the first attempt's.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: a range-derived id overwrites on a re-run; a counter-derived id piles up beside it.',
      takeaway: 'A batch id from the input range overwrites on a re-run — one from a counter just appends beside it.',
      Visual: S.RevealBatchIdMeasured,
    },
    {
      title: 'Reveal: the whole recipe, named',
      body: (
        <>
          At-least-once delivery, where redeliveries are allowed, plus an idempotent, keyed write,
          where applying one twice is harmless, is the general recipe for an exactly-once effect —
          not exactly-once delivery, which nothing here claims to achieve.
        </>
      ),
      duration: 4.8,
      fig: 'at-least-once delivery plus an idempotent, keyed write is the recipe for an exactly-once effect.',
      Visual: S.RevealRecipeNamed,
    },
    {
      title: 'Reveal: proof by diffing two runs, measured',
      body: (
        <>
          Run directly against the mock: a batch crashes partway through, is re-run in full from
          the beginning, and the final state after both runs is checked byte for byte against a
          single clean run with no crash at all. They match exactly.
        </>
      ),
      duration: 4.8,
      fig: 'a batch crashes partway, is re-run in full, and is checked byte for byte against one clean run.',
      takeaway: "Redelivery isn't prevented, it's made harmless — two runs of a crashed batch land byte-identical to one clean run.",
      Visual: S.RevealDiffMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three commit orderings, one batch-id choice, one recipe of at-least-once delivery plus
          an idempotent write — the property every source this chapter covered needed its own
          version of.
        </>
      ),
      duration: 4.8,
      fig: 'three commit orderings, one batch-id choice, one recipe — the property every source in this chapter needed.',
      takeaway: 'A re-runnable pipeline needed an atomic commit, a stable batch id, and an idempotent write.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A message broker redelivers the identical message to a consumer twice. Does that
          violate exactly-once delivery, exactly-once effect, both, or neither?
        </>
      ),
      duration: 2.8,
      fig: 'a broker redelivers the identical message twice. Does that violate exactly-once delivery, effect, both, or neither?',
      predict: {
        options: [
          { label: 'It violates both — the message was delivered more than once' },
          { label: 'It violates delivery but not effect, as long as the consumer’s own write is idempotent', correct: true },
        ],
        explain: (
          <>
            Exactly-once effect says nothing about how many times delivery happens, only about
            what the final state looks like once every redelivery has been applied. A redelivery
            genuinely breaks exactly-once delivery — it happened twice — but an idempotent,
            keyed write at the consumer makes the second delivery a no-op, so the effect stays
            exactly once.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
