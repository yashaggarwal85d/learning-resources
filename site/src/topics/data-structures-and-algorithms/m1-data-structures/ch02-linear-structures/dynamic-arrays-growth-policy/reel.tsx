import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Chapter 1 proved amortized O(1) append for any fixed growth factor. This topic asks the question
// Chapter 1 left open: which factor, and why, with four real libraries' real, differing answers
// (GCC's libstdc++, Facebook's fbvector, CPython's list, Rust's Vec), then reserve, shrink_to_fit
// and reallocation invalidation exactly as the C++ standard states them. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'The doubling array, proved and left open',
      body: (
        <>
          The last reel proved that doubling a vector is amortized O(1) to append, for any fixed growth factor. It never said which factor, or
          why two became the default so many places use without re-deriving it. That is this topic&rsquo;s question.
        </>
      ),
      duration: 3.4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Does the old memory ever come back?',
      body: <>A vector doubles four times in a row. Does the memory it frees ever become large enough to satisfy the next request on its own?</>,
      duration: 1.8,
      fig: 'Reuse',
      takeaway: 'Doubling a vector can never reuse any of the memory it has already freed.',
      predict: {
        options: [
          { label: 'Yes, after a few resizes' },
          { label: 'Yes, immediately' },
          { label: 'No, never', correct: true },
          { label: 'It depends on the allocator' },
        ],
        explain: (
          <>
            Never, for a factor of two: each new chunk is bigger than the sum of every chunk freed before it, 1 + 2 + 4 + &hellip; + 2
            <sup>n</sup> = 2<sup>n+1</sup> &minus; 1, always one short. The vector can only crawl forward in memory.
          </>
        ),
      },
      Visual: S.ReusePredict,
    },
    {
      title: 'Doubling outgrows everything it ever freed',
      body: (
        <>
          Every chunk freed so far, stacked together, still falls one short of the next chunk requested: that is the geometric identity 1 + 2 +
          4 + &hellip; + 2<sup>n</sup> = 2<sup>n+1</sup> &minus; 1, not an accident of one example.
        </>
      ),
      duration: 3.6,
      fig: 'Crawl',
      Visual: S.Crawl,
    },
    {
      title: 'A factor under two can reuse a block',
      body: (
        <>
          Switch the factor to one and a half, and the discarded pile does catch up: Facebook&rsquo;s engineers found that a factor of 1.5 lets a
          vector reuse its own freed memory after 4 reallocations, 1.45 after 3, and 1.3 after only 2.
        </>
      ),
      duration: 3.8,
      fig: 'Reuse2',
      Visual: S.Reuse2,
    },
    {
      title: 'Four libraries, four growth policies',
      body: (
        <>
          GCC&rsquo;s C++ library doubles. Facebook&rsquo;s fbvector deliberately chose 1.5. CPython&rsquo;s list grows by only about one eighth
          plus a small constant each time. Rust&rsquo;s Vec documents no fixed rate at all. Four real answers to the same trade-off.
        </>
      ),
      duration: 4.2,
      fig: 'Libraries',
      Visual: S.Libraries,
    },
    {
      title: 'What does Rust actually guarantee?',
      body: <>Rust&rsquo;s Vec documents no particular growth rate. If the rate isn&rsquo;t promised, what is?</>,
      duration: 1.8,
      fig: 'RustGuarantee',
      takeaway: 'A library’s real promise is usually the complexity bound, not the mechanism that delivers it.',
      predict: {
        options: [
          { label: 'Nothing at all' },
          { label: 'That it will double' },
          { label: 'Amortized O(1) push, nothing about the rate', correct: true },
          { label: 'That it matches the C++ standard' },
        ],
        explain: (
          <>
            Rust&rsquo;s own documentation: no particular growth strategy is guaranteed, but whatever strategy is used will of course guarantee
            O(1) amortized push. The complexity bound is the real contract; the mechanism behind it is free to change.
          </>
        ),
      },
      Visual: S.RustGuaranteePredict,
    },
    {
      title: 'Reserve skips the early resizes',
      body: (
        <>
          A directive, not a resize itself: reserve(n) reallocates if and only if the current capacity is already below n, and nothing resizes
          again until the vector would exceed the capacity it reserved.
        </>
      ),
      duration: 3.6,
      fig: 'Reserve',
      Visual: S.Reserve,
    },
    {
      title: 'Shrink is a request, not a promise',
      body: (
        <>
          shrink_to_fit never increases capacity and may reduce it by reallocating, but the C++ standard calls it non-binding, by name, to allow
          an implementation to decline it entirely.
        </>
      ),
      duration: 3.6,
      fig: 'ShrinkToFit',
      Visual: S.ShrinkToFit,
    },
    {
      title: 'Is a pointer safe after shrink_to_fit?',
      body: <>A pointer into the vector, taken just before a call to shrink_to_fit. Is it still safe to use afterward?</>,
      duration: 1.8,
      fig: 'Dangle',
      predict: {
        options: [
          { label: 'Always safe' },
          { label: 'Always invalid' },
          { label: 'Only if that call actually reallocated', correct: true },
          { label: 'Safe only for the first element' },
        ],
        explain: (
          <>
            It depends on whether that call reallocated. If it did, every reference, pointer and iterator into the old buffer is invalid, the
            past-the-end iterator included. If it didn&rsquo;t, every one of them is still valid. The standard states this as one remark
            attached to both reserve and shrink_to_fit.
          </>
        ),
      },
      Visual: S.DanglePredict,
    },
    {
      title: 'Every pointer into the old buffer dies at once',
      body: (
        <>
          Not a probability, not a maybe: the instant a reallocation happens, every reference, pointer and iterator into the sequence is
          invalid, unconditionally, the past-the-end iterator included.
        </>
      ),
      duration: 3.8,
      fig: 'Invalidate',
      takeaway: 'Reallocation invalidates every pointer into the old buffer, the past-the-end iterator included, the instant it happens.',
      Visual: S.Invalidate,
    },
    {
      title: 'Contiguous wins before the first cache miss',
      body: (
        <>
          One cache-line fetch from a contiguous vector serves several elements at once. The same records as separate linked nodes can cost one
          cache line per element &mdash; the next topic builds that structure and measures the gap.
        </>
      ),
      duration: 3.6,
      fig: 'Locality',
      Visual: S.Locality,
    },
    {
      title: 'Back to the problem',
      body: (
        <>
          Four libraries, four answers: GCC crawls forward and never looks back; fbvector trades a few more copies for memory it can reuse;
          CPython grows gently and resizes often; Rust promises the bound, not the mechanism. reserve and shrink_to_fit are precise tools with
          one shared, unconditional rule about what a reallocation invalidates.
        </>
      ),
      duration: 4,
      fig: 'Verdict',
      Visual: S.Verdict,
    },
    {
      title: 'Prove it, 1 of 2',
      body: (
        <>
          A million appends from empty: doubling resizes 20 times and copies 1,048,575 elements; a factor of 1.5 resizes 33 times and copies
          2,099,719 &mdash; more than twice the copying, for a capacity that ends up barely smaller.
        </>
      ),
      duration: 4,
      fig: 'ProveIt1',
      Visual: S.ProveIt1,
    },
    {
      title: 'Prove it, 2 of 2',
      body: (
        <>
          The same million appends under CPython&rsquo;s own formula: 85 resizes and 8,445,096 copies &mdash; far gentler growth costs far more
          total copying. There is no free lunch, only a choice of where to pay.
        </>
      ),
      duration: 4,
      fig: 'ProveIt2',
      Visual: S.ProveIt2,
    },
  ],
};

export default reel;
