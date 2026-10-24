import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real measurements on this sandbox's own pandas 3.0.5 and pyarrow 26.0.0 (examples.py): the
// default string dtype and its NaN sentinel, contrasted against the older, still-present opt-in
// string[pyarrow] dtype's pd.NA sentinel; NumPy-backed Int64 vs. Arrow-backed int64[pyarrow],
// which share the identical pd.NA sentinel; the lazy copy-on-write mechanism (a subset shares
// memory with the original until mutated); chained assignment's real replacement warning
// (pd.errors.ChainedAssignmentError, not named in the pandas 3.0 whatsnew prose and disclosed
// here as a direct sandbox observation); microsecond-resolution datetime inference; and the
// pandas 2.3 migration flags' measured asymmetry on this install. No literal digits anywhere.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: is this library built on Arrow in name only, or for real?',
      body: (
        <>
          Arrow is the shared memory format topic 5 described. Here's the first library this
          chapter shows actually built on it. Do its own headline changes come from those
          buffers, or is "Arrow-backed" just a label bolted onto the same old API?
        </>
      ),
      duration: 4.8,
      fig: 'the first library built on arrow — do its own changes actually come from those buffers?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: a default string dtype, not object',
      body: (
        <>
          A plain list of strings used to infer the same catch-all type every other kind of
          Python value could also land in. Now it infers a dedicated type built just for
          strings — backed directly by the last topic's own buffers, on an install that has them.
        </>
      ),
      duration: 4.8,
      fig: 'a plain list of strings now infers its own dedicated type, not the old catch-all one',
      Visual: S.RevealDefaultStringDtype,
    },
    {
      title: 'Predict: does the new default sentinel match the strict or the loose marker?',
      body: (
        <>
          This new type is backed by the same buffers as the strict, typed missing-value tools
          this chapter already covered. Does its own missing-value marker match that strict
          marker, or does it match the old, loose marker it's actually replacing?
        </>
      ),
      duration: 2.8,
      fig: "backed by the strict buffers — does its missing marker match the strict tools, or the old loose one?",
      predict: {
        options: [
          { label: "The strict marker — it's backed by the same buffers as the strict tools" },
          { label: 'The old, loose marker — kept on purpose, to avoid breaking existing checks', correct: true },
        ],
        explain: (
          <>
            The old, loose marker. Being built on strict buffers didn't have to mean adopting the
            strict tools' own missing-value marker, and here it deliberately didn't — existing
            code checking for that old marker keeps working.
          </>
        ),
      },
      Visual: S.PredictSentinelMatch,
    },
    {
      title: 'Reveal: every indexing operation behaves as a copy',
      body: (
        <>
          Pulling a column out of a table can never let you silently change the original through
          it anymore. But underneath, nothing is actually duplicated until the moment something
          really does get changed — measured directly, before and after.
        </>
      ),
      duration: 4.8,
      fig: 'a subset shares the same memory as the original, right up until it gets mutated',
      Visual: S.RevealCopyOnWrite,
    },
    {
      title: 'Reveal: chained assignment stops working',
      body: (
        <>
          A once-common shortcut for updating a table in two steps never silently works now,
          confirmed directly against the real original table. And the warning that used to catch
          this is genuinely gone — a different, more specific one stands in its place.
        </>
      ),
      duration: 4.8,
      fig: 'the two-step shortcut never silently works — measured, and a different warning replaces the old one',
      Visual: S.RevealChainedAssignment,
    },
    {
      title: 'Reveal: two confusingly similar string dtypes',
      body: (
        <>
          The new default type from a few steps back, and an older, still-available type that
          sounds almost identical, both claim to be the Arrow-backed string option. Measured side
          by side, they print different type names and use different missing-value markers.
        </>
      ),
      duration: 4.8,
      fig: 'two similarly-named string types, measured side by side — different names, different markers',
      takeaway: "Two options can both be called Arrow-backed strings and still disagree on what a missing value even looks like.",
      Visual: S.RevealTwoStringDtypes,
    },
    {
      title: 'Reveal: NumPy-backed vs. Arrow-backed nullable numbers',
      body: (
        <>
          Here the opposite happens. A nullable number built on the older storage and the same
          kind of number built on the newer buffers use the exact same missing-value marker —
          measured directly, identical on both.
        </>
      ),
      duration: 4.8,
      fig: 'old storage, new buffers — the same missing-value marker either way, measured identical',
      takeaway: "What decides a missing-value marker is whether a type is strictly nullable at all, not which buffers sit underneath it.",
      Visual: S.RevealNumericSentinelMatch,
    },
    {
      title: 'Reveal: microsecond-resolution datetime inference',
      body: (
        <>
          Turning a date string into an actual date value used to always assume the single
          finest resolution available, no matter how little precision the string itself carried.
          Now the resolution actually used depends on what's really there — measured directly.
        </>
      ),
      duration: 4.8,
      fig: 'resolution now follows what the input actually carries, instead of always assuming the finest one',
      Visual: S.RevealMicrosecondResolution,
    },
    {
      title: "Reveal: migrating via pandas 2.3's warnings",
      body: (
        <>
          A change this size didn't just arrive overnight. The release right before it shipped
          two separate opt-in switches to rehearse this exact behavior early — and measured
          directly on this very release, one of those switches still actively warns, the other
          quietly does nothing at all.
        </>
      ),
      duration: 4.8,
      fig: 'two rehearsal switches from the release before — one still warns here, one goes quiet',
      takeaway: 'A breaking release this size still gave teams two separate switches to rehearse it early, one at a time.',
      Visual: S.RevealMigrationFlags,
    },
    {
      title: 'Recap',
      body: (
        <>
          A dedicated string type, deliberately kept backward-compatible on missing values. Every
          subset behaving as a copy, lazily. The two-step update shortcut gone for good, under a
          new name. Two near-identical string types with real differences, and two numeric types
          with none. Resolution that follows the input. And the release that rehearsed all of it
          first.
        </>
      ),
      duration: 4.8,
      fig: 'a new string type, lazy copies, a shortcut gone for good, real differences in one place and none in another',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team's existing code checks a column's type against the old catch-all type to find
          its string columns, and relies on the two-step update shortcut, defended by an extra
          copy call to silence a warning. Both checks are about to quietly stop doing what the
          team assumes. What breaks, and what's the one-line fix for each?
        </>
      ),
      duration: 2.8,
      fig: "an old type check and a two-step shortcut, both quietly broken — what's the one-line fix for each?",
      predict: {
        options: [
          { label: 'Neither actually breaks — both patterns still work exactly as before' },
          { label: 'The type check stops matching; the shortcut never worked and the copy call is now pointless', correct: true },
        ],
        explain: (
          <>
            The type check against the old catch-all type stops matching the new dedicated
            string type entirely — check against the new type instead. The two-step shortcut
            never silently works any more, and the extra copy call that used to silence its
            warning is now pointless — a single, one-step update replaces both.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
