import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The full-versus-incremental crossover and the three silent-failure guards
// are asserted in examples.py's own crossover_table_size(), which_wins(),
// deleted_source_row_gap(), land_fact_with_inferred_dimension() and
// merge_by_unique_key(). The unique-key and MERGE claims trace to dbt's and
// PostgreSQL's own docs, quoted in SOURCES.md and checked step by step in
// FACT-CHECK.md. No literal digits appear below; the duration numbers are
// exempt.
const reel: Reel = {
  steps: [
    {
      title: "Hook: incremental looked clean, then the count fell short",
      body: (
        <>
          The nightly warehouse rebuild takes nine hours and costs enough that finance asked
          about it. The team switches to incremental. Weeks later, the warehouse's order count
          is short of the source's, because cancelled orders never reappeared in the extract.
        </>
      ),
      duration: 5.0,
      fig: "a rebuild time cut sharply, then a silent order-count gap weeks later",
      Visual: S.Hook,
    },
    {
      title: "Predict: which risk did the design not name?",
      body: (
        <>
          Incremental loads have more than one way to go wrong. Only one of them produces a
          permanent, silent gap rather than staleness that eventually catches up. Which one?
        </>
      ),
      duration: 4.4,
      predict: {
        options: [
          { label: "incremental loads run slower under heavy write load, which is why the count fell behind" },
          {
            label: "a deleted or cancelled source row is invisible to a plain incremental extract unless the design is told to look for it",
            correct: true,
          },
        ],
        explain: (
          <>
            A slow load produces staleness — a count that's behind but eventually catches up. A
            deleted row produces a gap that never closes on its own, because the extract was
            only ever built to pull changed-or-new rows, never to notice something missing.
          </>
        ),
      },
      fig: "which risk produces a permanent gap, rather than staleness that catches up?",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: grain first, three alternatives",
      body: (
        <>
          An order-line fact, a daily inventory snapshot fact, and conformed customer, product
          and date dimensions. A decision card weighs a wide denormalised table, a Data Vault,
          and the dimensional model — each priced for this exact workload.
        </>
      ),
      duration: 4.8,
      fig: "three model cards; the dimensional model lifting as the one chosen",
      Visual: S.RevealGrainFirst,
    },
    {
      title: "Reveal: the deleted-source-row hazard",
      body: (
        <>
          A cancelled order's row vanishes at the source. The incremental extract, built only to
          pull changed-or-new rows, never asks what's missing — so the row stays in the
          warehouse forever, unless the design adds a clause that checks for it.
        </>
      ),
      duration: 5.0,
      takeaway: "A deleted source row is invisible to a plain incremental extract unless the design is told to look for one.",
      fig: "a cancelled order vanishing at the source; the warehouse row staying forever",
      Visual: S.RevealDeletedRow,
    },
    {
      title: "Reveal: the late-arriving dimension",
      body: (
        <>
          An order-line fact lands before its customer dimension does. Rather than drop the fact
          or block the load, it gets an inferred, placeholder dimension key — backfilled once the
          real dimension row actually arrives.
        </>
      ),
      duration: 4.6,
      fig: "a fact landing now with an inferred key; the real dimension backfilled later",
      Visual: S.RevealLateDimension,
    },
    {
      title: "Reveal: SCD policy and the merge",
      body: (
        <>
          A customer's address change becomes a new SCD row under the policy that keeps history.
          A phone-number correction overwrites the existing row under the policy that keeps
          none. Both merge by a stated unique key — without one, the load silently duplicates.
        </>
      ),
      duration: 4.8,
      takeaway: "A changed row merges by a stated unique key, or it silently becomes a duplicate.",
      fig: "an address change kept as history; a phone fix overwritten, both merged by key",
      Visual: S.RevealSCDMerge,
    },
    {
      title: "Reveal: marts and the semantic layer",
      body: (
        <>
          A handful of derived marts serve the dominant queries — not every requested mart earns
          its keep. "Revenue" is defined once in a semantic layer, so it isn't recomputed
          slightly differently in each mart that needs it.
        </>
      ),
      duration: 4.4,
      fig: "a few marts chosen; revenue defined once rather than per mart",
      Visual: S.RevealMartsSemantic,
    },
    {
      title: "Reveal: the full-versus-incremental crossover",
      body: (
        <>
          A full refresh's cost rises steeply with table size. An incremental refresh's cost
          rises more slowly, but carries a fixed overhead the full refresh doesn't pay. Their
          lines cross at a table size computed from the shop's own numbers.
        </>
      ),
      duration: 4.8,
      takeaway: "The crossover is a number, computed from the shop's own constants, not a feeling about which approach sounds more modern.",
      fig: "a full-refresh line rising steeply, an incremental line rising shallowly, crossing",
      Visual: S.RevealCrossover,
    },
    {
      title: "Recap",
      body: (
        <>
          Grain first, then a model chosen from three alternatives. A deleted row and a
          late-arriving dimension each get a named guard. An SCD policy decides what history to
          keep; a unique key decides what merges instead of duplicating. And the
          full-versus-incremental crossover is a computed number, not a guess.
        </>
      ),
      duration: 4.6,
      fig: "the model, the two hazard guards, the SCD-and-merge policy, and the crossover chart",
      Visual: S.Recap,
    },
    {
      title: "Prove it: a table well past its own crossover",
      body: (
        <>
          A different table has been incremental for well over a year, past the point where a
          full refresh would actually be cheaper, because nobody ever recomputed the crossover
          as the table grew. What's the right first move?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "switch back to a full refresh immediately, since incremental has clearly stopped paying off" },
          {
            label: "compute the current crossover from this table's own numbers before changing anything, since the right answer depends on where it falls today",
            correct: true,
          },
        ],
        explain: (
          <>
            "Incremental has failed" is a feeling, not a measurement. The crossover formula takes
            this table's actual size and change rate and says, directly, which side of the line
            it's on right now — which may not even be the side the symptom suggests.
          </>
        ),
      },
      fig: "a table well past its crossover; the fix is to compute, not guess",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
