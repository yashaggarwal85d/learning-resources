import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The HyperLogLog register observable, its harmonic mean, its real measured error against an
// exact count, and the merge-matches-single-pass check are all reproduced for real in
// examples.py, against a real Zipf-skewed stream, rather than asserted from a description.
// HLL++'s bias correction and sparse mode, and a real warehouse's own APPROX_COUNT_DISTINCT, are
// sourced and named, not separately implemented, since this topic's own lab scope is the base
// structure. The chapter's own lab also builds a real Count-Min Sketch as a worked comparison.
// No literal digits anywhere.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a handful of small registers estimates how many distinct values passed by',
      body: (
        <>
          A small set of registers, each just counting a run length, can estimate how many
          distinct values passed through a stream — without ever storing a single one of them.
        </>
      ),
      duration: 5.6,
      fig: 'a handful of small registers estimates how many distinct values passed by, without storing one of them',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does merging two sketches from separate partitions match one built over all the combined data',
      body: (
        <>
          Two separate partitions each built their own sketch. If those two sketches are merged
          together, does the result match what a single sketch, built over all the combined data
          from scratch, would have produced?
        </>
      ),
      duration: 2.8,
      fig: 'does merging two sketches from separate partitions match one sketch built over all the combined data?',
      predict: {
        options: [
          { label: 'No — merging two approximations only compounds their error' },
          { label: 'Yes — the merged result matches a single combined-stream sketch exactly', correct: true },
        ],
        explain: (
          <>
            Yes, exactly. Merging two of these sketches just takes the larger value in each
            matching register across both — the identical result a single pass over the combined
            stream would have produced for that same register.
          </>
        ),
      },
      Visual: S.PredictMergeMatches,
    },
    {
      title: 'Reveal: each register tracks the longest run of leading zeros it has seen',
      body: (
        <>
          Every value gets hashed and lands in exactly one register, chosen by part of that hash.
          That register then keeps the longest run of leading zeros ever seen among every value
          that landed there.
        </>
      ),
      duration: 5.2,
      fig: 'each register tracks the longest run of leading zeros it has seen',
      Visual: S.RevealRegisterRunLength,
    },
    {
      title: 'Reveal: a harmonic mean, not an arithmetic one, is what tames one unlucky outlier',
      body: (
        <>
          One register that happens to see an unusually long run would badly distort a plain
          average. The structure's own evaluation function uses a harmonic mean across every
          register instead, which is far less sensitive to exactly that kind of outlier.
        </>
      ),
      duration: 5.6,
      fig: 'averaging registers with a harmonic mean, not an arithmetic one, is what tames one unlucky outlier',
      takeaway: "A harmonic mean across registers tames the one outlier a plain average couldn't.",
      Visual: S.RevealHarmonicMean,
    },
    {
      title: "Reveal: a real sketch's measured error shrinks as more registers get used",
      body: (
        <>
          Built with only a few registers, a real sketch's estimate drifts noticeably from an
          exact count taken over the same stream. Built with many more registers over that exact
          same stream, the real measured error against that same exact count shrinks substantially.
        </>
      ),
      duration: 5.6,
      fig: "a real sketch's error against an exact count shrinks as more registers get used",
      takeaway: "A real sketch's measured error against an exact count shrinks as registers grow.",
      Visual: S.RevealMeasuredError,
    },
    {
      title: 'Reveal: a measured bias correction and a sparse mode for small counts',
      body: (
        <>
          A real engineering refinement measures exactly how biased the raw estimate runs at small
          counts, and corrects for it directly. A second refinement skips storing every mostly
          empty register at all, keeping only the handful actually in use until that would cost
          more than simply storing them all.
        </>
      ),
      duration: 5.6,
      fig: "a measured bias correction and a sparse mode for small counts, named from the engine's own paper",
      takeaway: 'A measured bias correction and a sparse mode are real, documented refinements.',
      Visual: S.RevealHLLPlusPlus,
    },
    {
      title: "Reveal: a warehouse's own approximate count trades exactness for speed on purpose",
      body: (
        <>
          A real warehouse's own documented function returns a statistical estimate instead of an
          exact count, on purpose, because it performs far better at huge scale. Asking a
          completely different kind of question, such as what two sets share or don't, needs a
          different structure built for that instead.
        </>
      ),
      duration: 5.6,
      fig: "a warehouse's own approximate count trades exactness for speed, on purpose, at huge scale",
      takeaway: 'An exact set question — what two sets share or differ by — needs a different sketch.',
      Visual: S.RevealApproxCountDistinct,
    },
    {
      title: 'Recap',
      body: (
        <>
          Each register keeps the longest leading-zero run it has seen, and a harmonic mean tames
          any single outlier among them. A real sketch's measured error shrinks as more memory
          goes into it, and a real engineering refinement corrects small-count bias and skips
          mostly empty registers. A completely different question about sets needs a different
          sketch entirely.
        </>
      ),
      duration: 5.6,
      fig: 'leading zeros per register, a harmonic mean, real error shrinking with memory, bias correction and sparse mode, and set sketches for a different question',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team already merges per-day sketches into a rolling estimate of how many users were
          active. A teammate now also needs the exact number of users active on the very first
          day who never came back. Does the team's existing sketch answer that, or do they need
          something else?
        </>
      ),
      duration: 2.8,
      fig: "a team merges daily sketches into a rolling estimate; a teammate now needs an exact set difference — does the same sketch answer that?",
      predict: {
        options: [
          { label: 'Yes — the same rolling sketch already has everything needed' },
          { label: "No — that question needs a sketch built for set differences, not just counts", correct: true },
        ],
        explain: (
          <>
            No, something else entirely. A sketch like this one only ever answers how many —
            never which ones, and never how many are in one group but not another. A structure
            built specifically for set operations is what actually answers a question shaped like
            that one.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
