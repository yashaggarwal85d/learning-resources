import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A validity rule and a provenance rule are both checked directly and
// safely, never by constructing the invalid case they describe.
const reel: Reel = {
  steps: [
    {
      title: "The Rust compiler is entitled to assume every value it ever sees is valid for its own type. Of the 256 possible byte patterns a bool's own one byte could hold, how many genuinely count as a valid bool?",
      body: (
        <>
          Every raw byte pattern, one real validity rule.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'All 256, a bool is just one byte' },
          { label: 'Only 2, genuinely: 0 and 1', correct: true },
          { label: 'Only 1, since false is the only canonical value' },
        ],
        explain: (
          <>
            Only 2. Every other byte value is invalid.
          </>
        ),
      },
      Visual: S.BoolValidityPredict,
    },
    {
      title: 'Measured: a real validity check run over every one of the 256 possible byte values finds exactly 2 that genuinely pass',
      body: (
        <>
          The real, measured validity count.
        </>
      ),
      duration: 3.0,
      Visual: S.BoolValidityReveal,
    },
    {
      title: "A pointer's address is read out, shifted, then rebuilt into a new pointer. Does it still carry the real right to read that allocation?",
      body: (
        <>
          An address, shifted, then rebuilt.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, the round trip genuinely loses that right' },
          { label: "Yes, genuinely; it copies the original pointer's provenance", correct: true },
          { label: "Only if the address didn't change" },
        ],
        explain: (
          <>
            Yes. with_addr keeps the original provenance.
          </>
        ),
      },
      Visual: S.AddrRoundTripPredict,
    },
    {
      title: 'Measured: the real addr()/with_addr() round trip genuinely recovers the exact correct element of the identical allocation',
      body: (
        <>
          The real, measured round trip.
        </>
      ),
      duration: 3.0,
      takeaway: 'with_addr keeps the real right to access memory explicit; a bare integer cast never makes that promise.',
      Visual: S.AddrRoundTripReveal,
    },
    {
      title: 'A reference to a 4-aligned type must genuinely be both non-null and a multiple of 4. Of 6 candidate addresses, how many genuinely pass both checks, without ever building a reference from them?',
      body: (
        <>
          Six candidate addresses, two real checks.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'All 6, alignment rarely matters this much' },
          { label: 'Exactly 3, genuinely', correct: true },
          { label: 'None; one check always fails on addresses this size' },
        ],
        explain: (
          <>
            Exactly 3. The rest fail one check or the other.
          </>
        ),
      },
      Visual: S.NullAlignPredict,
    },
    {
      title: 'Measured: the identical real non-null and alignment check run over the 6 candidate addresses finds exactly 3 that genuinely pass both',
      body: (
        <>
          The real, measured address check.
        </>
      ),
      duration: 3.0,
      takeaway: 'The validity rule is checked directly on the address; nothing invalid needs to be built to measure it.',
      Visual: S.NullAlignReveal,
    },
    {
      title: "The Rust Reference's own words, the standard library's own MaybeUninit docs, and std::ptr's own docs all state the identical rule directly: a value is valid for its type or producing it is immediate undefined behavior, and provenance is the real right that makes a dereference sound. Do this topic's own three measured checks apply exactly that rule?",
      body: (
        <>
          Three sources' own words on the identical rule.
        </>
      ),
      duration: 2.8,
      takeaway: "A type's own validity rule cuts far below what its raw bits could represent.",
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: validity and provenance, checked directly',
      body: (
        <>
          A validity rule and a provenance rule, both checked directly and safely on every possible value or on a fixed, real address, never by constructing the invalid case either one describes.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
