import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A run-based checker only ever asks about the path it actually takes;
// the identical violation on an unexercised branch sits there, real,
// and goes unasked.
const reel: Reel = {
  steps: [
    {
      title: "A real interpreter runs one program with a real branch, and this run takes the branch whose every operation stays inside a sixteen-byte buffer. Does the real checker, run only on this branch's own operations, find a violation?",
      body: (
        <>
          One real run, one real branch, taken.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, genuinely; somewhere in this branch' },
          { label: "No, genuinely; none of this branch's own operations is out of bounds", correct: true },
          { label: 'Only on the last operation' },
        ],
        explain: (
          <>
            No. Every operation genuinely stays in bounds.
          </>
        ),
      },
      Visual: S.SafeBranchPredict,
    },
    {
      title: "Measured: the real checker, run over the three operations this branch actually takes, finds no violation; every one genuinely stays inside the sixteen-byte buffer",
      body: (
        <>
          The real, measured safe-branch run.
        </>
      ),
      duration: 3.0,
      Visual: S.SafeBranchReveal,
    },
    {
      title: 'The identical interpreter now runs the branch its first run never took, which holds a real, genuinely out-of-bounds operation. Does the checker catch it this time?',
      body: (
        <>
          The other branch, taken this time.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, it already decided the program is safe' },
          { label: 'Yes, genuinely; once a run actually takes the branch that holds it', correct: true },
          { label: 'Only if the buffer is also resized' },
        ],
        explain: (
          <>
            Yes. Caught, the moment it is actually run.
          </>
        ),
      },
      Visual: S.OtherBranchPredict,
    },
    {
      title: "Measured: the real checker, run over this branch's own two operations, genuinely catches the violation on the second one, the moment a run actually takes this branch",
      body: (
        <>
          The real, measured other-branch run.
        </>
      ),
      duration: 3.0,
      takeaway: 'The identical violation is real and checkable the instant a run actually reaches it.',
      Visual: S.OtherBranchReveal,
    },
    {
      title: "The safe branch's own run never took the other branch at all. How many of the other branch's own two operations did that first run's checker actually examine?",
      body: (
        <>
          The first run's own count of examined ops.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'All of them, just in case' },
          { label: 'Some, partially' },
          { label: 'None, genuinely; that branch was never taken', correct: true },
        ],
        explain: (
          <>
            None. A branch never taken is never checked.
          </>
        ),
      },
      Visual: S.UncheckedOpsPredict,
    },
    {
      title: "Measured: the safe-branch run genuinely examined exactly its own three operations and none of the other branch's two; the violation sat there, real and uninspected, the whole time",
      body: (
        <>
          The real, measured examined-ops count.
        </>
      ),
      duration: 3.0,
      takeaway: 'A checker that never runs a branch never asks it a single question.',
      Visual: S.UncheckedOpsReveal,
    },
    {
      title: "Miri's own README states the identical limitation directly, in its own words: Miri can tell you whether one particular way of interacting with your code causes undefined behavior in one particular execution, among the many an unexplored branch could have taken. The Unstable Book's own AddressSanitizer docs name a different, complementary tool with its own different real reach. Does this topic's own small interpreter model exactly the limitation both sources describe?",
      body: (
        <>
          Both sources' own words on this limitation.
        </>
      ),
      duration: 2.8,
      takeaway: "A run-based checker's silence means this run found nothing, not that nothing is there.",
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a checker only asks the path it runs',
      body: (
        <>
          A run-based checker only ever asks about the path it actually takes; the identical violation on a branch that run never touched sits there, real, and goes genuinely unasked.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
