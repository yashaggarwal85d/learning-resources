import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured on this sandbox: a real inferred-member insert and resolve, and a real three-version
// SCD2 history joined two ways to a real backdated fact (SOURCES.md, examples.py). Every number
// on screen traces to a literal constant there; everything else is spelled in words.
const reel: Reel = {
  steps: [
    {
      title: 'A fact arrives, its customer does not exist yet',
      body: (
        <>
          An order lands referencing a customer who has no dimension row at all. Reject it and
          the sale vanishes from every report; what else can happen?
        </>
      ),
      duration: 4.8,
      fig: 'a fact, a dangling key — no dimension row to join to',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the inferred member, quoted directly',
      body: (
        <>
          Create the dimension row anyway — a placeholder, carrying only the unresolved key and
          generic unknown values, just enough for the fact to post right now.
        </>
      ),
      duration: 4.8,
      fig: 'a placeholder row, unresolved key, unknown values — enough to post the fact',
      Visual: S.RevealInferredQuote,
    },
    {
      title: 'Reveal: the inferred member, measured',
      body: (
        <>
          Run for real: one placeholder customer row, inserted first, and the order loaded
          against it immediately after, with no dangling key left anywhere.
        </>
      ),
      duration: 4.8,
      fig: 'one placeholder row, one fact loaded against it, right away',
      takeaway: 'An inferred member lets a fact post immediately, against a placeholder built just for it.',
      Visual: S.RevealInferredMeasured,
    },
    {
      title: 'Predict: when the real customer data shows up later, does it get a new row or an update?',
      body: (
        <>
          The placeholder was never a real version of anything. When the real data finally
          arrives, does resolving it add a row, the way a real change would?
        </>
      ),
      duration: 2.8,
      fig: 'the real data arrives — a new row, or the same one, filled in?',
      predict: {
        options: [
          { label: 'A new row — any dimension update works this way' },
          { label: 'The same row, overwritten in place', correct: true },
        ],
        explain: (
          <>
            The same row. A placeholder was never a genuine prior version of the customer, so
            there is nothing for a second row to preserve — it gets overwritten, not versioned.
          </>
        ),
      },
      Visual: S.PredictResolve,
    },
    {
      title: 'Reveal: the resolve, measured',
      body: (
        <>
          The real customer data lands on the exact same row: overwritten in place, flag cleared,
          row count unchanged from before the resolve.
        </>
      ),
      duration: 4.8,
      fig: 'same row, overwritten in place — the row count never moves',
      Visual: S.RevealResolveMeasured,
    },
    {
      title: 'Reveal: retroactive Type 2 changes are late-arriving data too, quoted directly',
      body: (
        <>
          A different kind of lateness: a correction to an attribute that already has history.
          That one does need a new row — and every fact it touches has to be restated.
        </>
      ),
      duration: 4.8,
      fig: 'a retroactive correction: a real new row, and facts restated to match',
      Visual: S.RevealRetroactiveQuote,
    },
    {
      title: "Predict: does a backdated fact get the customer's current address, or whichever one was true then?",
      body: (
        <>
          A sale from a while back shows up late. The customer has moved more than once since
          then. Which address does the sale get attached to?
        </>
      ),
      duration: 2.8,
      fig: 'a sale from before the most recent move — which address attaches?',
      predict: {
        options: [
          { label: "The current address — there's only one row worth joining to" },
          { label: 'Whichever address was true on the day the sale happened', correct: true },
        ],
        explain: (
          <>
            Whichever one was true then. A dimension with real history has more than one row
            worth joining to, and the fact's own date decides which one is correct.
          </>
        ),
      },
      Visual: S.PredictBackdated,
    },
    {
      title: 'Reveal: the late arriving fact, quoted directly',
      body: (
        <>
          When a fact's own moment doesn't match the dimension's current state, the fix is to
          search for the keys that were actually effective back then.
        </>
      ),
      duration: 4.8,
      fig: 'search the dimension for the keys effective back then, not now',
      Visual: S.RevealLateFactQuote,
    },
    {
      title: 'Reveal: the as-of join, measured',
      body: (
        <>
          Run both ways on the same real fact row: joining to the current flag lands on the wrong
          version; joining on the fact's own date lands on the one that was actually true.
        </>
      ),
      duration: 4.8,
      fig: 'same fact row, two joins, two different versions — only one is right',
      takeaway: "A backdated fact's correct join uses the fact's own date, never the dimension's current flag.",
      Visual: S.RevealAsOfMeasured,
    },
    {
      title: 'Predict: can a pipeline just search all of history for every late fact, no matter how late?',
      body: (
        <>
          Searching back for the right version worked perfectly just now. Should every pipeline
          just always search its entire history, for every late fact, forever?
        </>
      ),
      duration: 2.8,
      fig: 'always search all of history — is that the real answer?',
      predict: {
        options: [
          { label: "Yes — correctness should always win, search everything" },
          { label: 'No — every real strategy needs a named limit', correct: true },
        ],
        explain: (
          <>
            No. Unbounded lateness means unbounded resource retention, not just unbounded
            correctness — every real system, even one built for exactly this, draws a line.
          </>
        ),
      },
      Visual: S.PredictWindow,
    },
    {
      title: 'Reveal: the bounded reprocessing window',
      body: (
        <>
          Streaming systems name this limit directly: a window stays open for late data only so
          long, and then it closes — the same tradeoff a warehouse pipeline has to make.
        </>
      ),
      duration: 4.8,
      fig: 'a named horizon, past which a late event is handled another way',
      takeaway: 'A bounded reprocessing window trades a little completeness for predictable, bounded cost.',
      Visual: S.RevealWindow,
    },
    {
      title: 'Recap',
      body: (
        <>
          A missing dimension row gets a placeholder, resolved in place, never versioned. A
          backdated fact joins on its own date, never the current flag. Every strategy for
          lateness needs a named limit, or its cost has no limit either.
        </>
      ),
      duration: 4.8,
      fig: 'placeholder, resolved in place; as-of join; a named limit on all of it',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A correction to one of the oldest sales on record arrives after the reprocessing window
          has already closed on events that old. What happens to it?
        </>
      ),
      duration: 2.8,
      fig: 'a correction, older than the window itself — what happens?',
      predict: {
        options: [
          { label: 'It gets searched and reprocessed like any other late fact' },
          { label: 'It falls outside the window, so it needs a different, explicit path', correct: true },
        ],
        explain: (
          <>
            A different, explicit path. The window's whole point is a named limit — anything
            older than it was never going to be reprocessed automatically; it needs its own
            handling, decided on purpose, not silently skipped.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
