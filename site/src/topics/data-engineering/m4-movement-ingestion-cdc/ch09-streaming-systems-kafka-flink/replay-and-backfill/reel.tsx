import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a real offset-for-times lookup (bisect over a
// toy time index), a real scoped replay (partition and time-range filters), a real backfill-
// source choice by data age, and a real overwrite-vs-versioned-sink diff. No literal digits
// anywhere below (duration numbers are exempt); the real values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a bug found two weeks late',
      body: (
        <>
          A derived metric is wrong, found past the hot log's retention but still within tiered
          storage's reach. Replaying the affected week to a new, separate output lets the two be
          compared before anyone trusts the fix.
        </>
      ),
      duration: 4.8,
      fig: 'a derived metric, found wrong two weeks late, replayed to a new version to diff',
      Visual: S.Hook,
    },
    {
      title: 'Setup: resetting offsets by timestamp',
      body: (
        <>
          A dead-lettered record gets fixed one at a time. Sometimes the whole pipeline was wrong
          for a while, and the fix is a time-scoped replay — starting from the first offset at or
          after a given moment.
        </>
      ),
      duration: 4.8,
      fig: "jump a consumer straight to the first offset at or after a given time",
      Visual: S.Setup,
    },
    {
      title: 'Predict: scope the replay',
      body: (
        <>
          Does fixing this mean replaying the whole topic from the very beginning, or something
          narrower?
        </>
      ),
      duration: 2.8,
      fig: 'replay the whole topic from the start, or just the part that was actually wrong?',
      predict: {
        options: [
          { label: 'The whole topic, from the beginning, every time' },
          { label: 'Just the affected partition or time range', correct: true },
          { label: 'Neither — a replay always needs a brand-new topic' },
        ],
        explain: (
          <>
            Just the affected partition or time range. A replay can be scoped to exactly what
            broke, instead of always starting over from the beginning.
          </>
        ),
      },
      Visual: S.PredictScope,
    },
    {
      title: 'Reveal: scoped, not whole-topic',
      body: (
        <>
          A replay can be scoped to a single partition, if only that partition's data was wrong,
          or to a bounded time range — never required to touch the whole topic from the start.
        </>
      ),
      duration: 4.8,
      fig: 'scoped to one partition, or a bounded time range, not the whole topic',
      Visual: S.RevealScope,
    },
    {
      title: 'Reveal: where the data actually comes from',
      body: (
        <>
          If the range has aged out of the hot log but is still within tiered storage's total
          retention, it's pulled from there; otherwise it has to be rebuilt from the lakehouse
          instead.
        </>
      ),
      duration: 4.8,
      fig: "still in Kafka within tiered storage's retention, otherwise rebuilt from the lakehouse",
      takeaway: "A backfill has two sources once the hot log is gone: tiered storage within retention, the lakehouse beyond it.",
      Visual: S.RevealSource,
    },
    {
      title: 'Predict: overwrite or version the output?',
      body: (
        <>
          Say a buggy replay's output simply overwrites the original metric, in place. What does
          that cost?
        </>
      ),
      duration: 2.8,
      fig: "a buggy replay overwrites the original metric in place — what's lost?",
      predict: {
        options: [
          { label: 'Nothing — the newer value is always the correct one' },
          { label: 'The original value, with nothing left to compare the replay against', correct: true },
          { label: 'Only the timestamp of the original write' },
        ],
        explain: (
          <>
            The original value. Once it's overwritten, there's nothing left to tell whether the
            replay actually fixed anything, or made it worse.
          </>
        ),
      },
      Visual: S.PredictVersion,
    },
    {
      title: 'Reveal: the original is gone',
      body: (
        <>
          Overwriting in place destroys the one thing needed to judge the replay: the original
          value to diff it against.
        </>
      ),
      duration: 4.8,
      fig: 'the original value is simply gone, with nothing left to diff the replay against',
      Visual: S.RevealOverwrite,
    },
    {
      title: 'Reveal: versioned output, side effects suppressed',
      body: (
        <>
          Writing to a new, separately labeled version keeps both, so a bad replay can be
          compared and rolled back. A flag on each replayed record suppresses any external side
          effect it would otherwise trigger again.
        </>
      ),
      duration: 4.8,
      fig: 'a new, separately labeled version, plus a flag that suppresses the side effect',
      takeaway: "A replay is safe to repeat only when its output is versioned and its side effects know they're a repeat.",
      Visual: S.RevealVersioned,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy models,
          just now — the offset lookup, the scoped replay, and the overwrite-versus-versioned
          diff.
        </>
      ),
      duration: 4.8,
      fig: "this topic's own real run, every number read straight off it",
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          Reset by timestamp, scope the replay to what actually broke, choose the right backfill
          source for the data's age, and keep the replay itself from becoming a second incident.
        </>
      ),
      duration: 4.8,
      fig: 'reset by time, scope the replay, pick the source, keep it safe to repeat',
      takeaway: "The whole point of scoping and versioning a replay is that a fix should never risk becoming a second mistake.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
