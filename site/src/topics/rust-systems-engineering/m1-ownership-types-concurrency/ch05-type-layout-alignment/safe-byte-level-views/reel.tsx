import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Closes the Type Layout, Alignment, and ABI chapter: the previous topic's padded field order, which only ever cost extra bytes
// there, is exactly the shape that makes reading a byte buffer back as that struct unsound here.
// bytemuck's derive-checked Pod/NoUninit traits replace a hand-rolled transmute, refusing to
// compile a type with padding; an explicit byte order (never the platform's native one) is a
// second, independent requirement for reading bytes that crossed a wire or a file. Every snippet
// and every claim is executed by examples.py (rustc 1.97.0 stable, edition 2024, x86_64 Linux;
// the bytemuck examples are driven through cargo).
const reel: Reel = {
  steps: [
    {
      title: 'The same padding that cost bytes now costs soundness',
      body: (
        <>
          The padded field order from the last topic left real gaps between fields. Those gaps are never guaranteed to hold any particular value at all.
        </>
      ),
      duration: 3.2,
      takeaway: 'A struct’s padding bytes are never guaranteed initialized, so reading them back as a value is undefined behaviour.',
      Visual: S.PaddingIsUB,
    },
    {
      title: 'Does a derive-checked view accept the padded header?',
      body: (
        <>
          Add a derive-checked trait to that same padded header and try to build it. Does a checked view accept a type with padding, or refuse it?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [
          { label: 'Yes — it only checks the fields, not the gaps between them' },
          { label: 'No — it refuses to compile a type with padding', correct: true },
          { label: 'Yes, but every read panics at run time' },
          { label: 'It compiles, with a warning about the padding' },
        ],
        explain: (
          <>
            No. The derive itself checks for padding at compile time and refuses to build at all — a one-time, compile-time proof about the type's own shape, not a runtime check repeated on every read.
          </>
        ),
      },
      Visual: S.PodDerivePredict,
    },
    {
      title: 'A padding-free header, read with no unsafe code at all',
      body: (
        <>
          The earlier, padding-free field order instead. The exact same bytes, viewed directly as the struct, with no copy and no unsafe block anywhere.
        </>
      ),
      duration: 3.4,
      Visual: S.BytemuckSafeRead,
    },
    {
      title: 'What derive(Pod) actually checks',
      body: (
        <>
          Try the derive on the padded header for real. The compiler's own message names the exact reason it refuses — padding, by name, not a generic complaint.
        </>
      ),
      duration: 3.2,
      takeaway: 'bytemuck’s Pod derive checks for padding once, at compile time, instead of trusting every call site to get it right.',
      Visual: S.PodDeriveRejects,
    },
    {
      title: 'Read the same two wire bytes without choosing a byte order',
      body: (
        <>
          The same two bytes, read without picking a byte order at all. On this machine, what number comes out?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [
          { label: 'The same number either way — bytes are bytes' },
          { label: 'A different number, depending on which order you read them in', correct: true },
          { label: 'It depends only on the field’s type, never the platform' },
          { label: 'Rust always defaults to the wire format’s own order' },
        ],
        explain: (
          <>
            A different number. This machine's native order happens to disagree with the wire format's own big-endian choice, and reading the identical bytes the wrong way gives a completely different value.
          </>
        ),
      },
      Visual: S.EndiannessPredict,
    },
    {
      title: 'Big-endian, little-endian, and the one wrong default',
      body: (
        <>
          The same two wire bytes, decoded three ways. One order is the wire format's real choice; the platform's native order is neither correct nor safe to assume.
        </>
      ),
      duration: 3.4,
      takeaway: 'A wire format picks its own byte order; reading it in the platform’s native order instead is a real bug.',
      Visual: S.EndiannessFig,
    },
    {
      title: 'Recap: padding is real, and bytes need a byte order',
      body: (
        <>
          A struct's padding bytes are never guaranteed initialized. A derive-checked view refuses to compile a type with padding, and needs no unsafe code to use. A wire format's byte order is its own choice, never assumed.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
