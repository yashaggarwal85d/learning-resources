import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real, executed lot-genealogy DAG (examples.py, run against this sandbox's own PostgreSQL 16
// cluster): a merge, a split, and a rework loop, with one split edge deliberately dropped to
// reproduce a real missing-link recall. No literal digits anywhere (the duration numbers below
// are exempt).
const reel: Reel = {
  steps: [
    {
      title: "Hook: a recall query answers, but it doesn't say it's wrong",
      body: (
        <>
          A contaminated lot needs a recall. The query that's supposed to find every finished
          lot it touched runs cleanly, returns an answer, and raises no error at all. What if
          the answer it returns is simply too small, with nothing in its own output to say so?
        </>
      ),
      duration: 4.8,
      fig: "a recall query over a lot's genealogy runs cleanly and returns an answer with no error — what if that answer is simply too small, with nothing in its own output to say so?",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the objects a lot actually moves through',
      body: (
        <>
          A work order is what the business asked for. A run is what actually happened on the
          floor. And a run never points at "the recipe" in general — it points at one exact,
          versioned recipe, because two runs of the same product months apart can easily have
          used two different versions.
        </>
      ),
      duration: 5.2,
      fig: "a work order, a run, and the one exact recipe version a run actually points to, never 'the recipe' in general",
      takeaway: 'A run joins to one exact recipe version, never to "the recipe" in general.',
      Visual: S.RevealEntities,
    },
    {
      title: "Reveal: two standards, two models, named separately",
      body: (
        <>
          One standard describes the equipment a plant is built from, nested six levels deep.
          A related but separate standard describes how a batch actually gets made, nested four
          levels deep. They describe different things, from different standards, and the
          correspondence between them is stated only as far as either one actually says.
        </>
      ),
      duration: 5.4,
      fig: 'one standard nests the equipment six levels deep; a separate, related standard nests how a batch gets made four levels deep',
      Visual: S.RevealTwoModels,
    },
    {
      title: 'Predict: does an unprotected loop in the data ever stop a recursive query on its own?',
      body: (
        <>
          Some of a rejected lot's material gets reworked back into an earlier stage of
          production. A query that follows lot to lot, with nothing in it remembering which
          lots it has already visited, now has a loop sitting right in its own path. Does it
          ever finish on its own?
        </>
      ),
      duration: 3.4,
      fig: "a rejected lot's material gets reworked back into an earlier stage, putting a real loop in the data — does a recursive query with no memory of visited lots ever finish on its own?",
      predict: {
        options: [
          { label: 'Yes — it eventually runs out of new lots to discover, loop or not' },
          {
            label: 'No — without remembering which lots it has already visited, it keeps rediscovering the same loop forever',
            correct: true,
          },
        ],
        explain: (
          <>
            No. A loop in the data means the query can walk back to a lot it has already
            counted, and without tracking which lots it has visited, nothing stops it from
            walking that same loop again, and again, forever.
          </>
        ),
      },
      Visual: S.PredictLoop,
    },
    {
      title: "Reveal: run it for real, capped, and watch it never stop short of the cap",
      body: (
        <>
          Run the unprotected version for real, with a hard cap on how deep it's allowed to go.
          It doesn't stop early. It fills the entire cap, which is exactly what it looks like
          right before a query that was never going to stop on its own. A database's own cycle
          protection exists precisely so it doesn't have to be capped at all.
        </>
      ),
      duration: 5.4,
      fig: 'the unprotected query, run for real with a hard depth cap, fills the entire cap rather than stopping short of it — exactly what never-converging looks like from the outside',
      takeaway: 'An uncapped loop-prone query filled its entire depth cap rather than stopping early, confirming it would never finish unaided.',
      Visual: S.RevealCycleClause,
    },
    {
      title: 'Reveal: the real recall list, traced forward from one contaminated lot',
      body: (
        <>
          Run the cycle-protected version for real, starting from one contaminated raw lot. It
          returns every lot downstream of it, including the ones reached only by following the
          rework loop back around once, safely, without ever looping twice.
        </>
      ),
      duration: 4.8,
      fig: 'the cycle-protected query, run for real from one contaminated raw lot, returns every downstream lot, including the ones reached through the rework loop',
      Visual: S.RevealForward,
    },
    {
      title: 'Reveal: one missing edge, and the exact lots a recall would miss',
      body: (
        <>
          Delete one real edge, a single split that sends part of the contaminated lot down a
          second path. Run the identical query again. It returns a smaller set, with no warning
          and no error — just two real, named lots that a recall would now simply never reach.
        </>
      ),
      duration: 5.2,
      fig: 'one real split edge deleted, the identical query run again — a smaller set returned, with two specific lots a recall would now miss, no warning and no error',
      takeaway: 'Deleting one real split edge silently dropped two lots from the recall, with no error or warning.',
      Visual: S.RevealMissingEdge,
    },
    {
      title: 'Recap',
      body: (
        <>
          A run points at one exact recipe version. Two related standards, each nesting a
          different thing, named separately rather than blurred together. An unprotected loop
          that measurably never stops on its own. A real recall, correct when every edge is
          there, and silently short two lots the moment one edge is missing.
        </>
      ),
      duration: 5.2,
      fig: 'one recipe version per run, two standards named separately, an unprotected loop that never stops, and a recall silently short two lots when one edge is missing',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A recall team re-runs its query a second time, after someone notices a lot went
          unlisted and manually adds the edge that was missing. The second answer is bigger than
          the first. Does that bigger second answer mean the first one was simply incomplete but
          otherwise safe?
        </>
      ),
      duration: 3.2,
      fig: 'a recall query re-run after someone manually adds a missing edge returns a bigger answer the second time — does the bigger answer mean the first one was merely incomplete but safe?',
      predict: {
        options: [
          { label: "Yes — a bigger second answer just means the first one was an undercount, nothing worse" },
          {
            label: 'No — an undercounted recall is the worse failure, since every lot it dropped was never recalled at all while the team trusted it',
            correct: true,
          },
        ],
        explain: (
          <>
            No. An undercounted recall is not a smaller version of a correct one — the lots it
            silently dropped were never recalled while the team believed the first answer was
            complete. The fix isn't noticing the second number is bigger; it's never shipping an
            edge table with a hole in it in the first place.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
