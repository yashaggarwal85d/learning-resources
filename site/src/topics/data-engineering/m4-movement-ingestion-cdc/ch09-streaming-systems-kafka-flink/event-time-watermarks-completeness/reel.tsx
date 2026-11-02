import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a real synthetic late/duplicate event stream
// (reused by this chapter's lab), a real idle-source stall and its timeout-based fix, real
// watermark alignment bounding drift, and a real measured latency-vs-completeness trade-off. No
// literal digits anywhere below (duration numbers are exempt); the real values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: one silent partition freezes everything',
      body: (
        <>
          A toy source with one partition goes silent for a while, and the entire pipeline's
          watermark simply stops — not a crash, just nothing telling the watermark generator the
          silent partition has nothing to say.
        </>
      ),
      duration: 4.8,
      fig: "one silent partition, and the whole pipeline's watermark simply stops",
      Visual: S.Hook,
    },
    {
      title: 'Setup: two needles, one axis',
      body: (
        <>
          Event time is when something actually happened. Processing time is when the system
          happens to see it. Under delay, retries, and backlog, the two can drift apart
          arbitrarily.
        </>
      ),
      duration: 4.8,
      fig: 'two needles on one axis, free to drift apart under delay and backlog',
      Visual: S.Setup,
    },
    {
      title: 'Predict: is a watermark a guarantee?',
      body: (
        <>
          A watermark claims no more data before a given point will ever arrive. Is that claim
          actually provable in a real system?
        </>
      ),
      duration: 2.8,
      fig: "would a real system's watermark ever actually be wrong?",
      predict: {
        options: [
          { label: 'Yes — a watermark is a provable, correct guarantee' },
          { label: 'No — it almost always has to be a heuristic', correct: true },
          { label: 'It depends entirely on which stream processor is used' },
        ],
        explain: (
          <>
            No. For nearly any real, distributed source, there's no way to know for certain that
            nothing older is still coming — so the claim is a heuristic, not a guarantee.
          </>
        ),
      },
      Visual: S.PredictGuarantee,
    },
    {
      title: 'Reveal: a heuristic claim, generated per partition',
      body: (
        <>
          A watermark is almost always heuristic, not provable. It's also generated separately
          per source partition — which is exactly why one silent partition can freeze the
          watermark everyone else depends on.
        </>
      ),
      duration: 4.8,
      fig: 'a claim, almost always heuristic, generated separately per partition',
      takeaway: "A watermark's heuristic nature isn't a flaw to fix — it's the honest price of claiming anything about completeness.",
      Visual: S.RevealHeuristic,
    },
    {
      title: "Predict: does the idle partition's silence fix itself?",
      body: (
        <>
          The global watermark is the minimum across every partition. If one partition goes
          quiet and stays quiet, does that minimum ever recover on its own?
        </>
      ),
      duration: 2.8,
      fig: 'without an explicit timeout, does the stalled watermark ever recover?',
      predict: {
        options: [
          { label: 'Yes — the other partitions eventually outvote the silent one' },
          { label: "No — it's held back indefinitely unless something explicitly handles it", correct: true },
          { label: 'Only if the silent partition eventually sends one more record' },
        ],
        explain: (
          <>
            No. The minimum stays pinned to the silent partition's last value forever, no matter
            how far the others advance, unless idleness is explicitly detected and handled.
          </>
        ),
      },
      Visual: S.PredictSelfFix,
    },
    {
      title: 'Reveal: idle-source detection unfreezes it',
      body: (
        <>
          A timeout-based idle detector excludes a silent partition from the minimum once it's
          been quiet past a threshold, letting the global watermark advance again.
        </>
      ),
      duration: 4.8,
      fig: 'a timeout excludes the silent partition, and the global watermark moves again',
      Visual: S.RevealIdleFix,
    },
    {
      title: 'Reveal: alignment bounds the opposite problem',
      body: (
        <>
          A fast partition can race its watermark far ahead of a slow one, forcing a downstream
          operator to buffer excessively. Alignment caps how far ahead any one partition's
          watermark can get.
        </>
      ),
      duration: 4.8,
      fig: "a fast partition's watermark is capped, bounding the buffer it forces downstream",
      takeaway: "Idle sources and alignment fix mirror-image problems — stuck behind, or racing ahead — the same way: a bound.",
      Visual: S.RevealAlignment,
    },
    {
      title: 'Reveal: the trade-off, measured',
      body: (
        <>
          A tighter bound means lower latency but more results that later need revising. A looser
          bound means higher latency but more complete results on the first try — measured
          directly on the stream this topic generates.
        </>
      ),
      duration: 4.8,
      fig: 'tighter means faster but less complete; looser means slower but more complete',
      takeaway: "No bound is simply better — each trades latency for completeness in whatever direction a case needs.",
      Visual: S.RevealTradeoff,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy models,
          just now — the idle-source stall and its fix, alignment bounding the drift, and the
          measured trade-off.
        </>
      ),
      duration: 4.8,
      fig: "this topic's own real run, every number read straight off it",
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          Event time and processing time can drift apart freely. A watermark is a heuristic
          claim, not a guarantee. Idle sources and alignment are necessary refinements, not edge
          cases. And the bound you pick trades latency for completeness.
        </>
      ),
      duration: 4.8,
      fig: 'two needles, a heuristic claim, two necessary fixes, and a measured trade-off',
      Visual: S.Recap,
    },
  ],
};

export default reel;
