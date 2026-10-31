import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Bloom filters: the structure Chapter 5 already used, this time derived from one line of
// probability all the way to its false-positive rate, its optimum, its space lower bound, the
// two-hash probe trick, and the one thing it cannot do. Every number shown is computed or
// asserted in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'How wrong is nearly free allowed to be?',
      body: (
        <>
          A read for a key that isn't in the database would otherwise open every run on disk.
          One earlier chapter's filter makes that read nearly free, at about ten bits per key —
          and lets one absent key in a hundred slip through. Getting that down to one in a
          million doesn't need a million times the memory.
        </>
      ),
      duration: 4.6,
      fig: 'a filter that answers almost every "no" for free',
      Visual: S.Hook,
    },
    {
      title: 'The structure',
      body: (
        <>
          A row of bits and a set of hash functions. Inserting a key sets the bit at each of its
          hash positions. Asking about a key checks the same positions: if any one of them is
          still zero, the answer is a certain "absent." If every one is set, the answer is only
          "maybe present." A bit, once set, is never cleared again.
        </>
      ),
      duration: 4.8,
      fig: 'k hash positions, set on insert, checked on query',
      Visual: S.Structure,
    },
    {
      title: "A bit that's already one",
      body: (
        <>
          Two different keys both hash to the same bit position, and the bit is already set from
          the first key. The second key's insert sets that same bit again. What happens?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Nothing changes — it was already one', correct: true },
          { label: 'The bit gets reset to zero to avoid confusion' },
          { label: 'The filter records that two keys share the bit' },
          { label: 'The insert fails and must retry at a new position' },
        ],
        explain: (
          <>
            Nothing changes. The structure never asks "who set this bit" or "how many keys share
            it," only "is it one." That's exactly why a query can only ever say "maybe."
          </>
        ),
      },
      fig: 'setting an already-set bit costs nothing, loses nothing',
      Visual: S.AlreadyOne,
    },
    {
      title: 'The rate, derived',
      body: (
        <>
          After every key sets its bits, a single bit is still zero only if nothing landed on it
          — that probability shrinks toward a clean exponential as more keys are added. A false
          "maybe" needs every one of a key's positions to have been set by something else, so the
          rate is that exponential, raised to the number of positions. Measured here at five
          different amounts of memory per key, against exactly that formula.
        </>
      ),
      duration: 5.2,
      fig: 'measured false-positive rate vs. the formula, five ways',
      takeaway: 'The false-positive rate is one probability, raised to the number of hash positions — and a measured filter matches it.',
      Visual: S.RateDerived,
    },
    {
      title: 'The optimum',
      body: (
        <>
          There's a best number of hash positions for a given amount of memory per key — fewer
          and each position gets reused too often, more and the positions don't shrink the rate
          fast enough. At that best number, exactly half the bits in the whole filter end up set.
          And the curve around that best number is flat: a few positions more or fewer barely
          move the rate at all.
        </>
      ),
      duration: 5,
      fig: 'the rate against the number of hash positions: a flat valley',
      Visual: S.Optimum,
    },
    {
      title: 'Not ten thousand times',
      body: (
        <>
          Going from one wrong answer in a hundred to one wrong answer in a million is getting it
          right ten thousand times more often. Does that need ten thousand times the memory per
          key?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes — rarity that extreme costs memory that extreme' },
          { label: 'No — a small, fixed number of extra bits per key', correct: true },
          { label: 'No — the filter needs fewer bits, not more' },
          { label: 'It depends entirely on how many keys are stored' },
        ],
        explain: (
          <>
            A small, fixed number of extra bits per key — not ten thousand times the memory.
            Each extra bit per key multiplies the rate down by a constant factor, so reaching a
            much rarer rate costs addition in bits, not multiplication in space.
          </>
        ),
      },
      fig: 'rarity costs bits, added — not space, multiplied',
      Visual: S.NotTenThousand,
    },
    {
      title: 'The bound',
      body: (
        <>
          No filter that never gives a false "absent" can do better than a fixed number of bits
          per key for a given rate — that's a counting argument, not a property of this
          particular structure. This filter's own best achievable rate sits within a fixed,
          constant factor of that floor, at every rate, however rare.
        </>
      ),
      duration: 5,
      fig: "this filter's best rate vs. the best any filter could do",
      takeaway: "However rare the target rate gets, this filter spends a fixed fraction more bits than the best any filter could.",
      Visual: S.Bound,
    },
    {
      title: 'Two hashes, or one each?',
      body: (
        <>
          A filter with many hash positions per key needs that many places to land. Does it need
          a separately built, independent hash function for each one, or can fewer do the job?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'One independent hash function per position, no fewer' },
          { label: 'Two hash functions, combined, can stand in for all of them', correct: true },
          { label: 'Only one hash function is ever needed, used once' },
          { label: 'It depends on how many bits the filter has' },
        ],
        explain: (
          <>
            Two. Combine two hash values arithmetically and the result lands in exactly as many
            places, with no measurable loss in how rare the wrong answers are.
          </>
        ),
      },
      fig: 'two hash values, combined, standing in for many',
      Visual: S.TwoHashesPredict,
    },
    {
      title: 'Derived probes',
      body: (
        <>
          Combine two hash values arithmetically, varying one small integer, and the results land
          in as many distinct places as a key needs. Measured side by side against positions from
          genuinely independent hash functions at the same amount of memory per key: the two
          agree, within the noise of the measurement itself.
        </>
      ),
      duration: 5,
      fig: 'derived positions vs. independent ones: the same rate',
      takeaway: 'Two combined hash values reach as many positions as independent ones need, and the false-positive rate barely notices the difference.',
      Visual: S.DerivedProbes,
    },
    {
      title: 'No deletes',
      body: (
        <>
          Clearing a key's bits to "remove" it clears bits other keys may also depend on — and
          suddenly a key that's still really there answers "absent," which this structure
          promised could never happen. Found on a small filter, by searching for it, not by
          picking an example to make the point. An immutable run never has this problem: its
          filter is built once and never edited.
        </>
      ),
      duration: 5.4,
      fig: 'clearing one key\'s bits silences another key that is still present',
      Visual: S.NoDeletes,
    },
    {
      title: 'Chapter 5 reconciliation',
      body: (
        <>
          An earlier chapter measured about ten bits per key against a published table and got
          roughly one wrong answer in a hundred, with seven hash positions. That isn't a separate
          fact — it's this topic's own formula, at exactly that amount of memory per key.
        </>
      ),
      duration: 4.4,
      fig: 'the earlier chapter\'s own number, from this formula',
      Visual: S.Reconciliation,
    },
    {
      title: 'Recap',
      body: (
        <>
          This structure spends a little more than the fewest bits any filter could, to answer
          one question about one key, and it pays for that with a one-sided wrong answer and two
          things it flatly cannot do: delete, or list what it holds.
        </>
      ),
      duration: 4.2,
      fig: 'one and a half times the floor, paid in one-sided error',
      Visual: S.Recap,
    },
  ],
};

export default reel;
