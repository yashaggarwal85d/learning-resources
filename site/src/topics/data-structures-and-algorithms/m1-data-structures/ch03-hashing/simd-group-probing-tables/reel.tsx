import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Open addressing still walks a probe sequence one slot at a go. Swiss Tables test many
// candidate slots in a single instruction, by not looking at the entries at all until one byte
// says it's worth it. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "Open addressing still walks its probe sequence one slot at a go. This topic tests many candidate slots in a single instruction.",
      body: (
        <>
          Last topic&rsquo;s mechanism was correct. This one does the same kind of work &mdash; finding a slot &mdash; in far
          fewer instructions at a time.
        </>
      ),
      duration: 3.4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'A node-per-entry table pays a pointer and an allocation per entry, and almost every probe misses the cache.',
      body: (
        <>
          A chained table pays a pointer and an allocation per entry. An open-addressed table avoids the allocation, but its
          probe sequence still hops from slot to slot, missing the cache almost every time. Swiss Tables exist to avoid both
          real costs.
        </>
      ),
      duration: 3.6,
      fig: 'ForcingProblem',
      Visual: S.ForcingProblem,
    },
    {
      title: 'A group holds 16 slots. How many of them does one SIMD compare instruction actually test?',
      body: <>One group, sixteen slots, one control byte each. How many does a single SIMD compare instruction actually test?</>,
      duration: 2,
      fig: 'GroupPredict',
      predict: {
        options: [
          { label: 'Just 1 — SIMD only helps with arithmetic, not comparisons like this' },
          { label: '2, one pair at a time' },
          { label: 'All 16 at once, in a single instruction', correct: true },
          { label: "It depends on how many slots are actually occupied" },
        ],
        explain: (
          <>
            One wide instruction tests the whole group&rsquo;s control bytes against the query&rsquo;s fingerprint at once &mdash;
            Abseil&rsquo;s own words are &ldquo;winnow 16 candidates down&hellip; in only a few instructions.&rdquo; It tests every
            lane, occupied or not; the control byte is what says which ones matter.
          </>
        ),
      },
      Visual: S.GroupPredictViz,
    },
    {
      title: "H1 picks the element's index. H2 is stored as that slot's one-byte fingerprint.",
      body: (
        <>
          One hash value, split in two. H1, the larger share, picks which group to probe &mdash; the same job a hash always had.
          H2, a small slice, becomes the slot&rsquo;s own one-byte fingerprint, stored separately from the key itself.
        </>
      ),
      duration: 3.4,
      fig: 'H1H2Split',
      Visual: S.H1H2Split,
    },
    {
      title: "One instruction checks a whole group's control bytes against the query's H2 byte at once.",
      body: (
        <>
          Sweep the fingerprint across every control byte in the group in one motion. Most lanes fade &mdash; wrong fingerprint,
          ruled out instantly. The one or two that match are the only candidates worth a real key comparison.
        </>
      ),
      duration: 3.6,
      fig: 'GroupMatch',
      takeaway: "One SIMD instruction tests a whole group's control bytes at once — most wrong candidates are rejected by one byte.",
      Visual: S.GroupMatch,
    },
    {
      title: 'A 7-bit fingerprint has 128 possible values. What are the odds a wrong candidate matches by coincidence?',
      body: <>128 possible fingerprint values. What are the odds a wrong candidate&rsquo;s fingerprint matches by pure coincidence?</>,
      duration: 2,
      fig: 'FingerprintPredict',
      predict: {
        options: [
          { label: "Essentially never — collisions this specific don't really happen" },
          { label: 'About 1 in 128', correct: true },
          { label: 'About 1 in 2 — a byte only really narrows it down by half' },
          { label: "It depends on the hash function, not the fingerprint width" },
        ],
        explain: (
          <>
            128 distinct fingerprint values means two unrelated keys share one by chance about 1 time in 128 &mdash; rare, but not
            zero. That&rsquo;s exactly why a real key comparison still has to run on a match, instead of trusting the byte alone.
          </>
        ),
      },
      Visual: S.FingerprintPredictViz,
    },
    {
      title: "A 7-bit fingerprint has only a 1-in-128 chance of a false match that still needs a real key comparison.",
      body: (
        <>
          Measured directly, not just asserted: a 7-bit fingerprint&rsquo;s false-match rate lands right where the odds say it
          should. The fingerprint doesn&rsquo;t replace the real comparison &mdash; it just makes paying for one incredibly rare.
        </>
      ),
      duration: 3.6,
      fig: 'FingerprintOdds',
      takeaway: 'A 7-bit fingerprint has only a 1-in-128 chance of a false match that still needs a real key comparison.',
      Visual: S.FingerprintOdds,
    },
    {
      title: 'Three real, current languages and runtimes converged on this exact design, verified at research time.',
      body: (
        <>
          Abseil&rsquo;s own C++ design, from 2017. Rust&rsquo;s standard library HashMap, via hashbrown, since a version released years
          ago. Go&rsquo;s built-in map, adopted this very year &mdash; checked against Go&rsquo;s own current blog post, not remembered
          from an older version.
        </>
      ),
      duration: 3.8,
      fig: 'ThreeAdopters',
      takeaway: 'Three independent, real adopters converged on one control-byte-plus-SIMD-compare mechanism.',
      Visual: S.ThreeAdopters,
    },
    {
      title: 'Prove it',
      body: (
        <>
          One mechanism, three independent adopters, each verified: Abseil, Rust&rsquo;s standard library, Go&rsquo;s built-in map.
          And the asymmetry itself, measured: a vectorized group compare costs one unit of work every time; a naive
          byte-by-byte scan of a packed group costs sixteen.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
