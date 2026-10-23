import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Opens Chapter 5: every guarantee Chapter 4 made was about who owns a value and who may
// mutate it, never about the value's own bytes. repr(Rust) (the default) is free to reorder a
// struct's fields and change its padding between compilations; repr(C) fixes the order to
// source order, making size, alignment, and offset_of! checkable facts instead of assumptions.
// Every snippet and every claim is executed by examples.py (rustc 1.97.0 stable, edition 2024,
// x86_64 Linux; the -Z randomize-layout step runs on nightly).
const reel: Reel = {
  steps: [
    {
      title: 'Same four fields, two orders — one repr(Rust) layout',
      body: (
        <>
          A header struct, written two ways: the same four fields, in opposite order. Under the default <code>repr(Rust)</code>, both compile to the exact same layout.
        </>
      ),
      duration: 3.2,
      takeaway: 'repr(Rust) is free to reorder a struct’s fields, and usually already picks the smallest layout it can.',
      Visual: S.ReprRustSame,
    },
    {
      title: 'Does field order ever change a struct’s size?',
      body: (
        <>
          The same four fields, reordered yet again. Does writing them in a different order ever actually change the struct's size?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [
          { label: 'Never — the compiler always finds the smallest layout' },
          { label: 'Yes, once the order is pinned to how it’s written', correct: true },
          { label: 'Only past one cache line’s worth of fields' },
          { label: 'Only for enums, never for plain structs' },
        ],
        explain: (
          <>
            Yes — once something fixes field order to source order, as <code>repr(C)</code> does, reordering genuinely changes the padding and the total size. The saving only existed because nothing
            was forcing the order to stay as written.
          </>
        ),
      },
      Visual: S.OrderMattersPredict,
    },
    {
      title: 'repr(C): the same reorder, now it costs four bytes',
      body: (
        <>
          The same four fields under <code>repr(C)</code>, which fixes the order to the one written. One order costs nothing extra; the other leaves real padding behind.
        </>
      ),
      duration: 3.4,
      Visual: S.ReprCDiffers,
    },
    {
      title: 'offset_of! and a compile-time assertion make the claim checkable',
      body: (
        <>
          <code>offset_of!</code> reads each field's real byte offset back from the compiler. A <code>const</code> assertion then checks a layout claim at build time, not at run time.
        </>
      ),
      duration: 3.2,
      takeaway: 'offset_of! plus a compile-time assertion turn a layout assumption into something the build itself checks.',
      Visual: S.OffsetsChecked,
    },
    {
      title: 'What happens when the claim is wrong?',
      body: (
        <>
          The same assertion, now claiming a field sits at an offset it plainly doesn't. What actually happens when this gets built?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [
          { label: 'It compiles, and panics the first time the program runs' },
          { label: 'It fails to compile, before the program can exist at all', correct: true },
          { label: 'It’s silently ignored, since offset_of! is only diagnostic' },
          { label: 'It compiles, with a warning in the build log' },
        ],
        explain: (
          <>
            It fails to compile. A <code>const</code> context's <code>assert!</code> is evaluated by the compiler itself, so a false layout claim is a compile error — the program never ships with it.
          </>
        ),
      },
      Visual: S.AssertionFailPredict,
    },
    {
      title: '-Z randomize-layout: the same struct, shuffled on purpose',
      body: (
        <>
          The identical <code>repr(Rust)</code> struct, compiled twice with two different random seeds. The compiler lays the same fields out two different ways, on purpose.
        </>
      ),
      duration: 3.4,
      takeaway: '-Z randomize-layout deliberately changes a repr(Rust) type’s layout between builds, exposing code that wrongly assumed one.',
      Visual: S.RandomizeLayout,
    },
    {
      title: 'Recap: layout is the compiler’s choice, until you fix it',
      body: (
        <>
          Size is always a multiple of alignment. Under <code>repr(Rust)</code>, field order is the compiler's to pick. Under <code>repr(C)</code>, the order you write is the order you pay for.{' '}
          <code>offset_of!</code> and a compile-time assertion make the claim checkable, not assumed.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
