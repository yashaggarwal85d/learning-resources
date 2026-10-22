import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher: a string looks like the simplest structure in the chapter, and hides the whole
// chapter's toolkit inside it -- immutability's real cost, the quadratic shape of naive
// concatenation, and the byte-vs-code-point indexing split every UTF-8 string carries. Every
// number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'The simplest-looking structure in the chapter',
      body: (
        <>
          Every structure so far has held fixed-size records at known offsets. A string looks like it should be the simplest of all of them
          &mdash; and it hides this chapter&rsquo;s whole toolkit inside something that looks like plain text.
        </>
      ),
      duration: 3.2,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Immutability: every edit is a new string',
      body: (
        <>
          &ldquo;Modifying&rdquo; a string &mdash; concatenating, slicing, changing case &mdash; allocates a brand-new string and copies into
          it. The original is untouched. That buys safe sharing and hashability as a dictionary key; it costs a full copy on every edit.
        </>
      ),
      duration: 4,
      fig: 'Immutability',
      Visual: S.Immutability,
    },
    {
      title: 'The real cost of building one, piece by piece',
      body: (
        <>
          Build a long string with s = s + piece, k times: each + allocates a whole new buffer sized to everything built so far, and copies
          it all in. Total cost grows like k squared &mdash; the same shape as an array that reallocates by one element every time.
        </>
      ),
      duration: 4.2,
      fig: 'QuadraticCost',
      takeaway: 'Immutability makes every += in a loop copy the whole string so far — the loop itself is quadratic.',
      Visual: S.QuadraticCost,
    },
    {
      title: 'What actually fixes the loop?',
      body: <>The loop above is quadratic. What actually fixes it?</>,
      duration: 1.8,
      fig: 'FixPredict',
      predict: {
        options: [
          { label: 'A smarter immutable string that detects the pattern' },
          { label: 'A bigger initial string so fewer reallocations happen' },
          { label: 'A separate mutable buffer the string is built from, once', correct: true },
          { label: "There's no way around it — strings are just slow to build" },
        ],
        explain: (
          <>
            You don&rsquo;t make the immutable string smarter, and you can&rsquo;t pre-size one &mdash; an immutable string has no in-place
            fill operation at all. Build in a genuinely mutable buffer instead, and convert to an immutable string once, at the end.
          </>
        ),
      },
      Visual: S.FixPredictViz,
    },
    {
      title: "The string builder: topic 1's mechanism, applied here",
      body: (
        <>
          That mutable buffer is a string builder. Its own documentation: a string builder has a capacity, and an overflowing buffer is
          automatically made larger &mdash; topic 1&rsquo;s doubling dynamic array, specialized to bytes.
        </>
      ),
      duration: 4,
      fig: 'Builder',
      takeaway: "A string builder isn't a new idea — it's topic one's growable array, wearing a different name.",
      Visual: S.Builder,
    },
    {
      title: 'One character, one to four bytes',
      body: (
        <>
          UTF-8 encodes every code point as one to four bytes. ASCII bytes stay single and byte-identical to ASCII text; most accented
          letters take two or three bytes; many emoji take four.
        </>
      ),
      duration: 4,
      fig: 'Utf8Bytes',
      Visual: S.Utf8Bytes,
    },
    {
      title: 'Is indexing the nth character O(1)?',
      body: <>A byte array indexes in O(1). Does indexing &ldquo;the nth character&rdquo; cost the same?</>,
      duration: 1.8,
      fig: 'IndexPredict',
      predict: {
        options: [
          { label: 'No — it depends on how many earlier characters were multi-byte', correct: true },
          { label: 'Yes, every language decodes a lookup table at parse time' },
          { label: 'Only if the string is pure ASCII, otherwise undefined' },
          { label: 'Yes, because Unicode code points are a fixed width' },
        ],
        explain: (
          <>
            The byte offset of code point n depends on how many of code points zero through n minus one took more than one byte &mdash; and
            there's no way to know that without walking and decoding them. O(n), in general.
          </>
        ),
      },
      Visual: S.IndexPredictViz,
    },
    {
      title: 'Two real languages, two real trade-offs',
      body: (
        <>
          Go indexes a string by byte directly, O(1), and gives exactly one code-point-aware walk &mdash; for range &mdash; defined to decode
          one rune per step. Rust goes further: str has no single-character index at all; byte slicing is chosen to be constant-time, and
          panics off a character boundary.
        </>
      ),
      duration: 4.6,
      fig: 'TwoTradeoffs',
      takeaway: 'O(1) byte indexing and O(1) character indexing are different promises — no language gets both for free.',
      Visual: S.TwoTradeoffs,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A real compiled benchmark: naive concatenation's time roughly quadruples each time the size doubles; a string builder's only
          roughly doubles, even a hundred times larger. A hand-written UTF-8 walk needs n decode steps to reach character n; byte indexing
          never needs one.
        </>
      ),
      duration: 4.4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
