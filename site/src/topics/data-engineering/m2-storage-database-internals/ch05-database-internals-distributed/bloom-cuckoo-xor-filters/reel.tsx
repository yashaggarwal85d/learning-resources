import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The Bloom filter's sizing formula and its real measured-vs-predicted false-positive rate are
// both reproduced for real in examples.py, built from scratch (a real bit array, double hashing
// for the hash positions) rather than asserted from a description. What a cuckoo filter adds and
// what xor and ribbon filters trade are documented, quoted facts from their own papers and
// RocksDB's own wiki, named but not separately implemented, since this topic's own scope is the
// Bloom filter base case's sizing and measurement.
// No literal digits anywhere.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a tiny bit array answers a membership question about a value it never stored',
      body: (
        <>
          A bit array, far smaller than the set it describes, can answer one question about a
          value it has never actually stored: could this possibly be in the set at all.
        </>
      ),
      duration: 5.6,
      fig: 'a tiny bit array, far smaller than the set it describes, answers one question about a value it never stored',
      Visual: S.Hook,
    },
    {
      title: 'Predict: can the filter ever wrongly say a value is absent when it was actually added',
      body: (
        <>
          Every value that was genuinely added gets checked against the exact same array. Could
          that check ever come back saying a value is absent, when it was really added earlier?
        </>
      ),
      duration: 2.8,
      fig: 'can the filter ever wrongly say a value is absent when it was actually added?',
      predict: {
        options: [
          { label: 'Yes — a crowded array can eventually forget an older entry' },
          { label: 'No — a value that was added always checks out as present', correct: true },
        ],
        explain: (
          <>
            No. Every bit a value sets on insertion stays set forever; checking that same value
            later always finds every one of those bits still on. The only error this structure can
            ever make runs the other way.
          </>
        ),
      },
      Visual: S.PredictFalseNegative,
    },
    {
      title: 'Reveal: the guarantee comes from using the same hash positions both ways',
      body: (
        <>
          Inserting a value sets a handful of bit positions. Checking that same value later looks
          at those exact same positions. If they were set on the way in, they're still set on the
          way out — which is exactly why a genuine member can never be missed.
        </>
      ),
      duration: 5.2,
      fig: 'the guarantee comes from using the exact same hash positions for insertion and lookup',
      Visual: S.RevealSamePositions,
    },
    {
      title: 'Reveal: sizing is a trade a target false-positive rate dictates',
      body: (
        <>
          Fewer bits set aside per key means a crowded array and more false positives. A real
          sizing formula ties the bits used per key, and how many positions each value touches,
          directly to whatever false-positive rate was chosen as the target.
        </>
      ),
      duration: 5.6,
      fig: "sizing is a trade a target false-positive rate dictates: fewer bits per key, more false positives",
      takeaway: 'A target false-positive rate directly sets how many bits per key a filter needs.',
      Visual: S.RevealSizing,
    },
    {
      title: "Reveal: a real filter's measured rate, checked against its own predicted rate",
      body: (
        <>
          A real filter, sized by that formula and built from scratch, gets queried against a
          large batch of values that were genuinely never added. The rate it actually gets wrong
          tracks the formula's own predicted rate closely.
        </>
      ),
      duration: 5.6,
      fig: "a real filter, built and queried, with its measured false-positive rate checked against the formula's own predicted rate",
      takeaway: "A real filter's measured false-positive rate tracks its own sizing formula closely.",
      Visual: S.RevealMeasured,
    },
    {
      title: 'Reveal: a standard filter can never delete a single item',
      body: (
        <>
          Removing just one entry from a standard filter would mean rebuilding the entire
          structure from scratch, in the engine's own words. A cuckoo filter adds a real way out:
          it stores an actual fingerprint per entry, which it can remove directly.
        </>
      ),
      duration: 5.6,
      fig: "a standard filter can never delete one item without rebuilding; a cuckoo filter removes a stored fingerprint directly",
      takeaway: 'A cuckoo filter adds real deletes by storing a fingerprint it can remove directly.',
      Visual: S.RevealCuckooDeletes,
    },
    {
      title: 'Reveal: xor and ribbon filters trade build cost for an even smaller footprint',
      body: (
        <>
          Both need the entire set known up front, and neither can be changed once built. In
          exchange, both use less memory per key than a standard or cuckoo filter at the same
          false-positive rate — a real engine's own documentation names exactly that trade for the
          filter it actually ships.
        </>
      ),
      duration: 5.6,
      fig: 'xor and ribbon filters need the whole set known up front, trading that build cost for an even smaller footprint',
      takeaway: 'Xor and ribbon filters trade a one-time, costlier build for an even smaller footprint.',
      Visual: S.RevealXorRibbon,
    },
    {
      title: 'Recap',
      body: (
        <>
          A filter never misses a value that was genuinely added. A target false-positive rate
          directly sets how it's sized, and a real build tracks that prediction closely. A cuckoo
          filter adds real deletes. Xor and ribbon filters trade a costlier build for even less
          memory per key.
        </>
      ),
      duration: 5.6,
      fig: 'no false negatives ever, sizing driven by a target rate, cuckoo adds real deletes, xor and ribbon trade build cost for space',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A system already has a per-file filter that skips files that can't hold a key before
          every disk read. A teammate asks whether switching that filter to a cuckoo filter would
          help. What does a cuckoo filter actually add here, and does this system need it?
        </>
      ),
      duration: 2.8,
      fig: "an existing per-file filter already skips files that can't hold a key — would switching it to a cuckoo filter help?",
      predict: {
        options: [
          { label: "Yes — a cuckoo filter is strictly better, so switching always helps" },
          { label: "No — this system never deletes a filter without deleting the whole file", correct: true },
        ],
        explain: (
          <>
            No. A cuckoo filter's real advantage is deleting a single entry directly. This system
            only ever drops a filter by deleting the whole file it belongs to — there's nothing
            here for that extra capability to buy, so the standard filter already fits.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
