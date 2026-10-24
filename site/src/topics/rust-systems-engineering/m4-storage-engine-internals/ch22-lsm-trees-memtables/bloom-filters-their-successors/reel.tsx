import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A Bloom filter never forgets a key it was actually given, so a
// negative result is always proof of absence; a positive result only
// grants permission to go look, never a guarantee. Spending more bits
// per key genuinely lowers the real false-positive rate, though with
// diminishing returns, exactly because the whole point is cutting the
// disk reads a lookup would otherwise have to pay for.
const reel: Reel = {
  steps: [
    {
      title: "A Bloom filter says a key is either 'maybe present' or 'definitely absent.' For a key that was genuinely inserted earlier, could it ever come back 'definitely absent'?",
      body: (
        <>
          One filter, one key, genuinely inserted.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, sometimes, for a tightly packed filter' },
          { label: 'No, never, at any budget', correct: true },
          { label: 'Only once the filter holds more keys than it has bits' },
        ],
        explain: (
          <>
            Never, genuinely. An inserted key always comes back positive.
          </>
        ),
      },
      Visual: S.NeverForgetsPredict,
    },
    {
      title: 'Measured: zero false negatives, at every budget',
      body: (
        <>
          The real, measured result, every inserted key found.
        </>
      ),
      duration: 3.0,
      takeaway: 'A Bloom filter never forgets a key it was actually given; a negative result is always proof of absence.',
      Visual: S.NeverForgetsReveal,
    },
    {
      title: 'Build that same filter with a much tighter bits-per-key budget. Does a key that was never inserted at all ever come back maybe present?',
      body: (
        <>
          A tight budget, a key never inserted.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, only genuinely inserted keys ever come back positive' },
          { label: 'Yes, genuinely; some never-inserted keys come back maybe-present', correct: true },
          { label: 'Only if two different keys happen to collide exactly' },
        ],
        explain: (
          <>
            Yes, genuinely. Some never-inserted keys come back positive.
          </>
        ),
      },
      Visual: S.FalsePositivesPredict,
    },
    {
      title: 'Measured: a tight bits-per-key budget genuinely produced real false positives against keys that were never inserted at all',
      body: (
        <>
          The real, measured false positives, found.
        </>
      ),
      duration: 3.0,
      takeaway: "A positive result only grants permission to go look; it's never a guarantee the key is actually there.",
      Visual: S.FalsePositivesReveal,
    },
    {
      title: 'Spend far more bits per key on that same filter instead. Does that genuinely change how often a never-inserted key comes back maybe present?',
      body: (
        <>
          The same filter, a far larger budget.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No change; bits per key only affects memory, not accuracy' },
          { label: 'Yes, genuinely lower', correct: true },
          { label: 'Yes, genuinely higher, since more bits means more chances to collide' },
        ],
        explain: (
          <>
            Genuinely lower. More bits per key cuts the false-positive rate.
          </>
        ),
      },
      Visual: S.MoreBitsPredict,
    },
    {
      title: 'Measured: spending far more bits per key genuinely lowered the measured false-positive rate',
      body: (
        <>
          The real, measured rate, dropping.
        </>
      ),
      duration: 3.0,
      takeaway: "More bits per key genuinely buys a lower false-positive rate; it's a real budget, not a free setting.",
      Visual: S.MoreBitsReveal,
    },
    {
      title: "RocksDB's own wiki states a real bits-per-key table directly. Does a small increase near the low end buy as much improvement as that same size increase further up the table?",
      body: (
        <>
          RocksDB's own bits-per-key table.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the same improvement no matter where you start' },
          { label: 'No, genuinely; the low end buys far more improvement per bit spent', correct: true },
          { label: 'It is the reverse: the low end buys the least' },
        ],
        explain: (
          <>
            No. The low end buys far more improvement per bit spent.
          </>
        ),
      },
      Visual: S.TablePredict,
    },
    {
      title: "Measured, in RocksDB's own numbers: the low end of the table buys far more improvement per bit spent than the same size increase further up",
      body: (
        <>
          RocksDB's own bits-per-key numbers, shown directly.
        </>
      ),
      duration: 3.0,
      takeaway: 'Spending bits per key has diminishing returns; the first few bits buy far more than the next few.',
      Visual: S.TableReveal,
    },
    {
      title: "RocksDB's own wiki also states, directly, why any of this bits-per-key spending is worth it at all: what does a real filter actually save a lookup from doing?",
      body: (
        <>
          RocksDB's own words on cutting disk reads, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.DiskReadsReveal,
    },
    {
      title: 'Recap: what a Bloom filter guarantees, and what it only budgets',
      body: (
        <>
          A Bloom filter never forgets a key it was actually given, so a negative result is always proof of absence; a positive result only grants permission to go look, never a guarantee. Spending more bits per key genuinely lowers the real false-positive rate, though with diminishing returns, exactly because the whole point, as RocksDB's own documentation names directly, is cutting the disk reads a lookup would otherwise have to pay for.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
