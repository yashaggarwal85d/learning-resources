import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a toy TTL-bounded dedup store that really
// forgets an id past its window, a real small Bloom filter whose false-positive rate is really
// measured from this run (not cited), and a deterministic id that really recomputes identically
// and gets caught by a downstream store. No literal digits anywhere below (duration numbers are
// exempt); the real values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a set that never stops growing',
      body: (
        <>
          A consumer remembers every event id it has ever seen, forever, and eventually runs out
          of memory. A bounded window underneath a filter holds memory flat instead.
        </>
      ),
      duration: 4.8,
      fig: "an ever-growing id set runs out of memory; a bounded window holds it flat",
      Visual: S.Hook,
    },
    {
      title: 'Setup: the same idea, one level up',
      body: (
        <>
          A deterministic id made one specific kind of write idempotent. This generalizes it to
          any consumer at all — remember which ids were applied, within a bound you can afford.
        </>
      ),
      duration: 4.8,
      fig: "one sink's deterministic id generalizes to any consumer, no transaction needed",
      Visual: S.Setup,
    },
    {
      title: 'Predict: a very late redelivery',
      body: (
        <>
          The exact same event id is redelivered, but only after the dedup window has long since
          passed. Does the consumer still recognize it as a duplicate?
        </>
      ),
      duration: 2.8,
      fig: 'the same id arrives again, but only after the dedup window has already passed',
      predict: {
        options: [
          { label: 'Yes — the id was genuinely seen before, so it is still caught' },
          { label: 'No — the window forgot it on purpose, so it looks new again', correct: true },
          { label: 'It depends on how many other ids arrived since' },
        ],
        explain: (
          <>
            No. A bounded window deliberately forgets old ids to keep memory flat — a redelivery
            that late is accepted as a stated, known gap, not a bug.
          </>
        ),
      },
      Visual: S.PredictWindow,
    },
    {
      title: 'Reveal: forgotten on purpose',
      body: (
        <>
          Inside the window, a repeat is caught every time. Outside it, the id is gone from
          memory and the same redelivery is simply treated as new — a deliberate trade-off.
        </>
      ),
      duration: 4.8,
      fig: 'an id outside the window is forgotten on purpose, a stated and accepted gap',
      takeaway: 'A bounded dedup window trades perfect memory for flat memory — a late redelivery is accepted as no longer caught.',
      Visual: S.RevealWindow,
    },
    {
      title: 'Reveal: two ways to set the bound',
      body: (
        <>
          A wall-clock TTL prunes an id after a fixed real-world duration. A watermark bound
          instead prunes relative to how far the stream itself has progressed.
        </>
      ),
      duration: 4.8,
      fig: 'a wall-clock TTL or a stream-relative watermark — the same trade-off, different clock',
      Visual: S.RevealBound,
    },
    {
      title: 'Predict: which way can a filter be wrong?',
      body: (
        <>
          A Bloom filter answers "might contain" for an id. Can that answer ever be wrong, and if
          so, in which direction?
        </>
      ),
      duration: 2.8,
      fig: 'a Bloom filter says an id might be present — can that answer ever be wrong?',
      predict: {
        options: [
          { label: 'It can miss an id that really was inserted' },
          { label: "It can flag an id that was never inserted", correct: true },
          { label: 'It is never wrong in either direction' },
        ],
        explain: (
          <>
            Only one direction. Bits only ever get set, never cleared, so an inserted id is
            always found — but a genuinely new id can occasionally collide and look familiar.
          </>
        ),
      },
      Visual: S.PredictBloom,
    },
    {
      title: 'Reveal: one-directional, and measured',
      body: (
        <>
          Every inserted id is found, with certainty, every time. A small, real, bounded fraction
          of ids never inserted get flagged anyway — measured directly, not assumed.
        </>
      ),
      duration: 4.8,
      fig: 'never a false negative — only, rarely, a false positive, measured directly',
      takeaway: 'A Bloom filter never misses a real duplicate; its only cost is a small, measured chance of flagging something new.',
      Visual: S.RevealBloom,
    },
    {
      title: 'Reveal: idempotence, propagated one hop further',
      body: (
        <>
          A derived event given an id computed from its own inputs recomputes to the same id
          every time — letting the very next consumer deduplicate it the same way.
        </>
      ),
      duration: 4.8,
      fig: "a derived event's id, recomputed identically, lets the next stage dedup the same way",
      takeaway: "A derived event's deterministic id propagates idempotence one hop further, letting the next consumer dedup it the same way.",
      Visual: S.RevealDerived,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy models,
          just now — the window's boundary, the filter's real rate, and the derived id downstream.
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
          An id set once at the source. A dedup window bounded on purpose. A filter that only
          ever errs one way. And a derived id that carries deduplication one stage further.
        </>
      ),
      duration: 4.8,
      fig: 'source ids, a bounded window, a one-directional filter error, and ids that propagate',
      Visual: S.Recap,
    },
  ],
};

export default reel;
