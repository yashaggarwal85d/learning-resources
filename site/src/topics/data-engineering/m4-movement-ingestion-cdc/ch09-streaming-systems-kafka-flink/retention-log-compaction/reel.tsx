import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a toy segment-age retention check, a dirty-
// ratio cleaning-trigger comparison, a three-way compaction-lag-window check, and a tombstone-
// visibility-versus-consumer-lag comparison. No literal digits anywhere below (duration numbers
// are exempt); the real values are shown in scenes.tsx instead.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a day later, the old value's still there",
      body: (
        <>
          A team expects a compacted topic to shrink the moment a new value for a key lands. A
          full day later, the old value is still readable. Not a bug — exactly what the
          configuration they set actually promises.
        </>
      ),
      duration: 4.8,
      fig: "a compacted topic's old value, still readable a full day after the new one landed",
      Visual: S.Hook,
    },
    {
      title: 'Setup: the same strip, two different rules for keeping it',
      body: (
        <>
          The partition strip from earlier in this chapter, now under two completely different
          rules for what survives: delete whatever's old enough, or keep only the latest value
          per key.
        </>
      ),
      duration: 4.8,
      fig: 'the same partition strip, now governed by two different retention rules',
      Visual: S.Setup,
    },
    {
      title: 'Predict: one record deleted, or a whole segment?',
      body: (
        <>
          Time-based retention eventually discards old data. Does it ever remove a single record
          once that record ages out, or does it always act on a whole segment at once?
        </>
      ),
      duration: 2.8,
      fig: 'retention kicks in — does it remove one record, or a whole segment at once?',
      predict: {
        options: [
          { label: 'A single record, the moment it individually ages out' },
          { label: 'A whole segment, once every record in it has aged out', correct: true },
          { label: 'Whichever is cheaper for the broker to compute' },
        ],
        explain: (
          <>
            A whole segment, every time — retention deletes entire closed segment files, never a
            single record out of one, which is a direct consequence of how a segment is stored on
            disk in the first place.
          </>
        ),
      },
      Visual: S.PredictSegment,
    },
    {
      title: 'Reveal: whole segments, measured',
      body: (
        <>
          A real toy run: a segment whose newest record is still fresh survives entirely. A
          segment whose newest record has aged past the retention window is deleted whole.
        </>
      ),
      duration: 4.8,
      fig: 'three segments, measured against a retention window: one deleted whole, two kept whole',
      takeaway: 'Retention deletes a whole segment once its newest record ages out — never a single record alone.',
      Visual: S.RevealSegment,
    },
    {
      title: 'Predict: does compaction run continuously, or wait for something?',
      body: (
        <>
          Compaction rewrites a log to drop superseded records. Does the cleaner do that
          continuously as soon as a record is superseded, or does it wait for some condition
          first?
        </>
      ),
      duration: 2.8,
      fig: 'the cleaner and a superseded record — does it rewrite immediately, or wait for something?',
      predict: {
        options: [
          { label: 'Continuously, the instant any record is superseded' },
          { label: 'It waits until the uncompacted fraction crosses a threshold', correct: true },
          { label: 'Only when an operator manually triggers a cleaning pass' },
        ],
        explain: (
          <>
            It waits for the dirty ratio to cross a configured threshold — rewriting a log on
            every single superseded record would mean constant, wasteful recopying for little
            benefit, so the cleaner batches its work instead.
          </>
        ),
      },
      Visual: S.PredictDirty,
    },
    {
      title: 'Reveal: the dirty-ratio gauge, measured',
      body: (
        <>
          A real toy run: below the configured threshold, the cleaner stays off entirely. Cross
          that threshold, and a cleaning pass fires.
        </>
      ),
      duration: 4.8,
      fig: 'the dirty ratio, measured below and above its configured threshold',
      takeaway: 'The cleaner only fires once the uncompacted fraction of a log crosses its configured threshold, not on every superseded record.',
      Visual: S.RevealDirty,
    },
    {
      title: 'Reveal: a floor and a ceiling on how long a record waits',
      body: (
        <>
          A fresh record stays protected regardless of the dirty ratio. An old enough record gets
          forced eligible regardless of the dirty ratio. Only the middle case actually depends on
          it.
        </>
      ),
      duration: 4.8,
      fig: 'a record measured at three ages: too fresh, forced eligible, and in between',
      takeaway: 'A minimum lag protects a fresh record; a maximum lag forces an old one eligible regardless.',
      Visual: S.RevealLagWindow,
    },
    {
      title: "Reveal: a tombstone's own expiration",
      body: (
        <>
          A delete marker survives for a fixed window of its own. A consumer that catches up in
          time sees it. One that lags past that window can miss the delete entirely.
        </>
      ),
      duration: 4.8,
      fig: 'a tombstone, measured against a consumer that catches up in time and one that lags too far',
      Visual: S.RevealTombstone,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy retention
          and compaction model, just now — the segment check, the dirty-ratio gate, the lag
          window, and the tombstone's visibility.
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
          Deletion by age acts on whole segments. Compaction waits for the dirty ratio, bounded
          by a floor and a ceiling. A tombstone expires on its own schedule. Together, that's what
          makes calling a compacted topic a changelog precise, not loose language.
        </>
      ),
      duration: 4.8,
      fig: 'segment-granularity deletion, a dirty-ratio gate, a lag window, and a tombstone that expires on its own schedule',
      Visual: S.Recap,
    },
  ],
};

export default reel;
