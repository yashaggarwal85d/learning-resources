import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A documented safety contract plus a real guard that genuinely
// enforces it is what makes unsafe code sound: no safe caller can ever
// reach undefined behavior through it.
const reel: Reel = {
  steps: [
    {
      title: 'A function is marked unsafe and ships with a documented contract. Does calling it from behind a real safe guard that checks the contract first ever reach undefined behavior?',
      body: (
        <>
          An unsafe function, a documented contract, a guard.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, genuinely; unsafe code can always misbehave' },
          { label: 'No, genuinely; a guard that truly enforces the contract keeps it sound', correct: true },
          { label: 'Only if the guard is also marked unsafe' },
        ],
        explain: (
          <>
            No. A real, enforcing guard keeps it sound.
          </>
        ),
      },
      Visual: S.GuardPredict,
    },
    {
      title: 'Measured: every real call that genuinely satisfies the documented contract returns the genuinely correct value, every time',
      body: (
        <>
          The real, measured in-contract results.
        </>
      ),
      duration: 3.0,
      Visual: S.InContractReveal,
    },
    {
      title: 'Now send the guard three requests outside the real contract. Does it still let any of them reach the unsafe code underneath it?',
      body: (
        <>
          Three requests, a guard, a locked door.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, it genuinely lets some through anyway' },
          { label: 'No, genuinely; every one is rejected before the unsafe code ever runs', correct: true },
          { label: 'Only if the request count is small' },
        ],
        explain: (
          <>
            No. Every one is genuinely rejected first.
          </>
        ),
      },
      Visual: S.RejectPredict,
    },
    {
      title: "Measured: the real guard genuinely rejected every one of the three out-of-contract requests; the unsafe function's own real call counter never moved for them",
      body: (
        <>
          The real, measured call counter.
        </>
      ),
      duration: 3.0,
      takeaway: 'Soundness means a guard rejects every out-of-contract call, not merely most of them.',
      Visual: S.RejectReveal,
    },
    {
      title: 'Suppose a different caller skipped the guard and called the unsafe function directly, with the identical invalid inputs. Would that genuinely violate the documented contract?',
      body: (
        <>
          The identical inputs, no guard this time.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, the function would genuinely handle it anyway' },
          { label: "Yes, genuinely; those inputs are exactly outside the contract's own bound", correct: true },
          { label: 'Only for the largest of the three inputs' },
        ],
        explain: (
          <>
            Yes. Exactly outside the documented bound.
          </>
        ),
      },
      Visual: S.UnguardedPredict,
    },
    {
      title: 'Measured: the identical invalid inputs genuinely violate the real documented contract, the exact real bound the guard above was built to enforce',
      body: (
        <>
          The real, measured contract check.
        </>
      ),
      duration: 3.0,
      takeaway: '"My callers don\'t misuse it" is weaker than a guard that genuinely cannot be misused.',
      Visual: S.UnguardedReveal,
    },
    {
      title: `The Rust Reference's own words and the Rust API Guidelines' own words both state this exact rule directly: unsafe code is sound only if no safe caller can ever trigger undefined behavior through it, and a real "Safety" section is how that contract gets written down. Does this topic's own guard measure exactly that rule?`,
      body: (
        <>
          Both sources' own words on this exact rule, shown directly.
        </>
      ),
      duration: 2.8,
      takeaway: 'A documented contract plus a real, enforcing guard is the whole of what soundness asks for.',
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a real contract, a real guard, measured directly',
      body: (
        <>
          A documented safety contract plus a real guard that genuinely enforces it is what makes unsafe code sound: no safe caller, not even one handed the exact inputs that would break it, can ever reach undefined behavior through it.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
