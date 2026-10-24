import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// An explicit SIMD kernel, called only once the real CPU's own support
// is checked at runtime, computes the exact identical answer as its
// scalar equivalent while processing far fewer real operations, by
// exactly the real lane width, and that runtime check is the genuine
// safety contract making any of it sound to call at all.
const reel: Reel = {
  steps: [
    {
      title: "Build an explicit AVX2 kernel, summing eight values at a time instead of one. Before ever calling it, check the real CPU's own feature support at runtime. Does the real CPU here genuinely support AVX2?",
      body: (
        <>
          The runtime feature check, before the kernel ever runs.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, the kernel always falls back to the scalar path' },
          { label: 'Yes, genuinely, the real CPU supports it', correct: true },
          { label: 'Only if the binary was compiled with a special flag' },
        ],
        explain: (
          <>
            Genuinely supports it. The check runs for real, not assumed.
          </>
        ),
      },
      Visual: S.DetectPredict,
    },
    {
      title: 'Measured: the real CPU here genuinely supports AVX2, detected at runtime, so the explicit kernel ran for real',
      body: (
        <>
          The kernel is only ever called once the real CPU's own support is actually checked, never assumed.
        </>
      ),
      duration: 3.0,
      Visual: S.DetectReveal,
    },
    {
      title: 'Run the explicit SIMD kernel and the plain scalar loop on the identical column. Does the kernel produce the exact identical sum as the scalar loop?',
      body: (
        <>
          Both paths' own final sums, side by side.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, summing eight lanes at a time changes the total slightly' },
          { label: 'Yes, genuinely, the exact identical sum', correct: true },
          { label: "Only if the column's own length happens to divide evenly by eight" },
        ],
        explain: (
          <>
            The exact identical sum. SIMD changes cost, not correctness.
          </>
        ),
      },
      Visual: S.CorrectnessPredict,
    },
    {
      title: 'Measured: the exact identical sum, from both the explicit SIMD kernel and the plain scalar loop',
      body: (
        <>
          The real, measured identical sums.
        </>
      ),
      duration: 3.0,
      takeaway: 'An explicit SIMD kernel changes how many values one instruction touches, never the real answer it computes.',
      Visual: S.CorrectnessReveal,
    },
    {
      title: 'Now measure vector operations instead: does the SIMD kernel genuinely process far fewer of them than the scalar loop processes scalar operations, on the identical column?',
      body: (
        <>
          The real, measured operation counts.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, both process the same real number of operations' },
          { label: 'Yes, genuinely, far fewer in the SIMD kernel', correct: true },
          { label: "Only if the column's own values happen to repeat" },
        ],
        explain: (
          <>
            Far fewer. Each vector op does eight values' worth.
          </>
        ),
      },
      Visual: S.OpCountPredict,
    },
    {
      title: 'Measured: far fewer vector operations in the SIMD kernel, matching the real lane width exactly',
      body: (
        <>
          The real, measured operation counts, and the exact match.
        </>
      ),
      duration: 3.0,
      takeaway: "The real cut a SIMD kernel buys isn't a rough estimate; it follows exactly from the lane width.",
      Visual: S.OpCountReveal,
    },
    {
      title: "The Rust standard library's own documentation states why that runtime check has to come first, in its own words. Does it name calling an AVX2 function on a CPU that genuinely lacks AVX2 as unsafe?",
      body: (
        <>
          The standard library's own words on the safety contract, shown directly.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, calling it anyway is merely slower, never unsafe' },
          { label: 'Yes, genuinely; it names that call directly as unsafe', correct: true },
          { label: 'Only when the function also reads uninitialized memory' },
        ],
        explain: (
          <>
            Yes. Unsafe, named directly, not merely implied.
          </>
        ),
      },
      Visual: S.SafetyPredict,
    },
    {
      title: "Measured, in the Rust standard library's own words: it is unsafe to call an AVX2 function on a CPU that doesn't actually support AVX2",
      body: (
        <>
          The standard library's own words, shown directly.
        </>
      ),
      duration: 3.0,
      takeaway: "The runtime feature check isn't a performance nicety; it's the real safety contract an explicit SIMD kernel depends on.",
      Visual: S.SafetyReveal,
    },
    {
      title: "The standard library's own documentation also names exactly what that runtime check itself relies on: does it state that runtime detection currently relies mostly on the cpuid instruction?",
      body: (
        <>
          The standard library's own words on how the check itself works, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.CpuidReveal,
    },
    {
      title: 'Recap: what makes an explicit SIMD kernel sound to call',
      body: (
        <>
          An explicit SIMD kernel, called only once the real CPU's own support is checked at runtime, computes the exact identical answer as its scalar equivalent while processing far fewer real operations, by exactly the real lane width, and that runtime check is the genuine safety contract making any of it sound to call at all.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
