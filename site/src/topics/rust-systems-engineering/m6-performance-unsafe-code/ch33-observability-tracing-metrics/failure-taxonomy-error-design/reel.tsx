import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real, typed error, matched on its own variant, correctly drives
// two different real retry decisions for a real timeout and a real
// remote error; the identical pair, read only as text, shares a
// substring and cannot tell the two failures apart at all.
const reel: Reel = {
  steps: [
    {
      title: "A real, typed error distinguishes a real timeout from a real remote error. Matched directly on its own variant, does a real retry decision correctly retry the timeout and skip the remote error?",
      body: (
        <>
          A real, typed error: Timeout or Remote.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, a typed error still has to be read as text first' },
          { label: 'Yes, genuinely; matching the variant gives the right call', correct: true },
          { label: 'Only if the variant names happen to be spelled a specific way' },
        ],
        explain: (
          <>
            Yes. Matching the variant works.
          </>
        ),
      },
      Visual: S.TypedPredict,
    },
    {
      title: 'Measured: matched directly on the real, typed variant, the retry decision correctly retries the real timeout and correctly skips the real remote error, exactly as the taxonomy says it should',
      body: (
        <>
          The typed match, checked both ways.
        </>
      ),
      duration: 3.0,
      Visual: S.TypedReveal,
    },
    {
      title: "The identical two real errors, rendered only as plain strings, are checked by the identical retry logic, now reading each message's own text instead of a variant. Does it still correctly tell them apart?",
      body: (
        <>
          The same two errors, read only as text.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the words in the message still say which kind it is' },
          { label: 'No, genuinely; both messages share a substring the check keys on', correct: true },
          { label: 'Only if the messages are read in the wrong order' },
        ],
        explain: (
          <>
            No. Both share the same substring.
          </>
        ),
      },
      Visual: S.UntypedPredict,
    },
    {
      title: 'Measured: checked by text alone, the real retry decision now retries both the real timeout and the real remote error, since both real error messages share the identical "operation failed" substring the untyped check keys on',
      body: (
        <>
          The same two messages, checked as text.
        </>
      ),
      duration: 3.0,
      takeaway: 'A string rendering of an error can share the identical words for two different failures, where a typed variant cannot.',
      Visual: S.UntypedReveal,
    },
    {
      title: 'On the identical real remote error, does the typed decision and the untyped decision actually disagree about whether to retry it?',
      body: (
        <>
          The real remote error, decided two ways.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, both decisions always agree once an error has happened' },
          { label: 'Yes, genuinely; typed correctly skips it, untyped wrongly retries', correct: true },
          { label: "Only if the remote error's own message is unusually long" },
        ],
        explain: (
          <>
            Yes. The two decisions disagree.
          </>
        ),
      },
      Visual: S.DisagreePredict,
    },
    {
      title: 'Measured: on the real remote error, the typed decision correctly says skip, and the untyped decision incorrectly says retry, a real, direct disagreement produced by the identical error, read two different ways',
      body: (
        <>
          The real disagreement, measured directly.
        </>
      ),
      duration: 3.0,
      takeaway: "An untyped error's wrong retry decision comes from reading a real failure as text instead of as a type.",
      Visual: S.DisagreeReveal,
    },
    {
      title: "The thiserror and anyhow crates' own documentation each state this directly: thiserror provides a derive macro for the standard library's own Error trait, fitting a library's typed errors; anyhow provides one dynamic error type for an application's own contextual errors. Does this topic's own comparison model exactly the distinction both crates are built around?",
      body: (
        <>
          thiserror and anyhow's own words on this.
        </>
      ),
      duration: 2.8,
      takeaway: 'A typed error is chosen so a caller can match on what happened instead of reading about it.',
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a shape that tells failures apart',
      body: (
        <>
          A real, typed error, matched on its own variant, correctly drives two different real retry decisions for two genuinely different real failures; the identical pair, read only as text, cannot tell them apart at all, and a real retry loop built on it gets one of the two decisions genuinely wrong.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
