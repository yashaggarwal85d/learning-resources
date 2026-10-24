import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A length read from untrusted input is a real security boundary
// whether or not anyone decided to treat it as one; checking it first
// is what makes the difference measurable rather than theoretical.
const reel: Reel = {
  steps: [
    {
      title: "A naive parser reads a declared length straight off the wire and slices the buffer with it, no check against how much buffer is actually left. A real, deliberately malformed input claims far more bytes than the real buffer holds. What happens?",
      body: (
        <>
          A naive parser, slicing with the claimed length.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It returns whatever bytes happen to be there' },
          { label: "It genuinely panics; the slice's own end runs past the buffer", correct: true },
          { label: 'It silently returns an empty result' },
        ],
        explain: (
          <>
            It panics. The end index runs past the buffer.
          </>
        ),
      },
      Visual: S.BoundsPredict,
    },
    {
      title: "Measured: the naive parser's own unchecked slice genuinely panics on the oversized claim, while a checked parser, validating the same length against the real remaining buffer first, rejects it cleanly with no panic at all",
      body: (
        <>
          The oversized claim, checked against all buffer.
        </>
      ),
      duration: 3.0,
      Visual: S.BoundsReveal,
    },
    {
      title: "Now a declared length that genuinely fits inside the real buffer, but is still larger than this format's own stated maximum payload size. Does the naive parser, which only ever checks the buffer's own bounds, actually catch this one too?",
      body: (
        <>
          A length that fits, but breaks the policy.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, any oversized length gets caught the same way' },
          { label: 'No, genuinely; it fits the buffer so it gets let straight through', correct: true },
          { label: 'Only if the maximum is checked somewhere else first' },
        ],
        explain: (
          <>
            No. Fitting the buffer isn't the policy.
          </>
        ),
      },
      Visual: S.PolicyPredict,
    },
    {
      title: "Measured: the naive parser genuinely accepts the over-policy payload, since nothing in it ever checks a maximum size at all, while the checked parser, which validates against that real, stated maximum directly, rejects it",
      body: (
        <>
          The policy, checked where bounds alone weren't.
        </>
      ),
      duration: 3.0,
      takeaway: "A length that merely fits the buffer still isn't safe without a real, separate maximum-size policy.",
      Visual: S.PolicyReveal,
    },
    {
      title: "Two attacker-influenced lengths get added together with plain, unchecked arithmetic, in a real release build, where overflow checks are off by default. Does a real sum that genuinely overflows actually show up as a big, obviously wrong number?",
      body: (
        <>
          Two lengths, added with plain arithmetic.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, overflow always produces something huge and wrong' },
          { label: 'No, genuinely; it silently wraps around to a small number', correct: true },
          { label: 'Only in a debug build' },
        ],
        explain: (
          <>
            No. It wraps to something small instead.
          </>
        ),
      },
      Visual: S.OverflowPredict,
    },
    {
      title: "Measured: the naive, unchecked sum of two lengths that genuinely overflow a 32-bit addition wraps silently to a small number, while the identical real addition done with checked_add correctly reports that it overflowed, rather than handing back a small number that looks perfectly safe",
      body: (
        <>
          The overflow, measured both ways at once.
        </>
      ),
      duration: 3.0,
      takeaway: 'Silent wraparound is the dangerous case, since it looks like a small, safe number instead of an obvious failure.',
      Visual: S.OverflowReveal,
    },
    {
      title: "The Rust standard library's own checked_add documentation and Cargo's own reference on overflow-checks each state this directly: checked_add reports None on overflow instead of wrapping, and a release build's own overflow checks are off by default, so an unchecked plus genuinely wraps there instead of panicking. Does this topic's own two measured comparisons match exactly what both sources describe?",
      body: (
        <>
          checked_add and overflow-checks, in their own words.
        </>
      ),
      duration: 2.8,
      takeaway: 'A length read from untrusted input is a real security boundary whether or not anyone treats it as one.',
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a length nobody checked before trusting it',
      body: (
        <>
          A length that merely fits the buffer, and a sum that merely looks small, are both real traps a parser can fall into without ever doing anything that looks obviously wrong; checking a real maximum and using real, checked arithmetic are what actually turn an assumed boundary into a real one.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
