import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a real tumbling-vs-sliding state-cost
// comparison, a real session-window merge triggered by a late record, a real global window
// shown inert under the default trigger and alive under a custom one, and a real live-pane
// count that peaks and drops to zero. No literal digits anywhere below (duration numbers are
// exempt); the real values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: the same stream, four very different shapes',
      body: (
        <>
          Switch the toy aggregator's windows from tumbling to a half-overlap sliding
          configuration, and its live pane count and memory footprint jump — with no change to
          the input stream at all. Two session windows minutes apart merge into one the instant a
          late record lands inside the gap.
        </>
      ),
      duration: 4.8,
      fig: 'same stream, same key, four different window shapes drawn under one time axis',
      Visual: S.Hook,
    },
    {
      title: "Setup: a window is where a watermark's chunk of time actually lives",
      body: (
        <>
          A watermark says when a chunk of event time is probably complete enough to act on. A
          window is the chunk itself — a concrete span of time, or activity, that a group of
          elements gets assigned to.
        </>
      ),
      duration: 4.8,
      fig: "a window is the concrete chunk of time a watermark's claim gets applied to",
      Visual: S.Setup,
    },
    {
      title: 'Predict: does a sliding window cost the same as a tumbling one?',
      body: (
        <>
          Same stream, same window size. Switch only the window type from tumbling to a
          half-overlap sliding window. Does the amount of state the aggregator has to hold change
          at all?
        </>
      ),
      duration: 2.8,
      fig: 'same stream, same window size — does the shape change the cost?',
      predict: {
        options: [
          { label: 'No — state cost depends only on the window size, not its type' },
          { label: 'Yes — overlap multiplies how many windows each element lands in', correct: true },
          { label: 'Yes, but only once the overlap is large enough to matter' },
        ],
        explain: (
          <>
            Yes, immediately. A tumbling window assigns each element to exactly one window. A
            sliding window copies that same element into every window its timestamp overlaps —
            the overlap fraction sets the multiplier, from the very first overlapping window.
          </>
        ),
      },
      Visual: S.PredictStateCost,
    },
    {
      title: 'Reveal: tumbling is one copy per element; sliding multiplies it',
      body: (
        <>
          Tumbling windows are fixed-size and non-overlapping, so each element belongs to exactly
          one window. Sliding windows overlap by a step smaller than their size, so each element
          is duplicated into every window it falls inside.
        </>
      ),
      duration: 4.8,
      fig: 'tumbling assigns once; sliding duplicates into every window it overlaps',
      takeaway: 'A sliding window is not a fancier tumbling window — its state cost scales directly with how much it overlaps.',
      Visual: S.RevealStateCost,
    },
    {
      title: 'Reveal: a session window has no fixed shape, and can merge',
      body: (
        <>
          A session window has no fixed start or end — it extends as long as a gap of inactivity
          doesn't close it. Two sessions that were separate windows merge into one the instant a
          late-arriving record closes the gap between them.
        </>
      ),
      duration: 4.8,
      fig: 'no fixed shape — a late record inside the gap pulls two sessions into one',
      Visual: S.RevealSessionMerge,
    },
    {
      title: 'Predict: does a global window ever emit anything on its own?',
      body: (
        <>
          A global window covers the entire stream in one window with no boundary at all. Left to
          the system's own default trigger — fire when the watermark passes the window's end —
          does it ever produce output?
        </>
      ),
      duration: 2.8,
      fig: 'one window, the whole stream, no end at all — does the default trigger ever fire?',
      predict: {
        options: [
          { label: 'Yes, eventually, once the watermark catches up to the present' },
          { label: "No — the default trigger waits for an end the window doesn't have", correct: true },
          { label: 'Yes, but only after the allowed-lateness period expires' },
        ],
        explain: (
          <>
            No, never. The default trigger fires when the watermark passes the window's end. A
            global window has no end for the watermark to pass, so left alone it simply never
            fires at all.
          </>
        ),
      },
      Visual: S.PredictGlobalFires,
    },
    {
      title: 'Reveal: a global window is inert without a custom trigger',
      body: (
        <>
          With the default trigger, a global window never fires — the watermark has no end to
          pass. It is useless on its own; it only becomes useful once an explicit custom trigger
          decides when to emit.
        </>
      ),
      duration: 4.8,
      fig: 'the default trigger waits for the watermark to pass the window’s end, which never comes',
      takeaway: 'A global window and its trigger are deliberately separate decisions, unlike every other window shape, which bundles the two together.',
      Visual: S.RevealGlobalInert,
    },
    {
      title: 'Reveal: every pane eventually has to die',
      body: (
        <>
          Each window, for each key, holds its own accumulator state — a pane. A pane closes and
          its state is dropped once the watermark, plus any allowed lateness, passes the window's
          end. Once the source goes idle, every remaining pane has to close too.
        </>
      ),
      duration: 4.8,
      fig: "every pane closes once the watermark, plus lateness, passes its window's end",
      takeaway: 'A pane that never closes is not a feature — it is unbounded state growth with a window-shaped excuse.',
      Visual: S.RevealPaneCleanup,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel came from a real run of this topic's own toy aggregator, just
          now — the tumbling-versus-sliding state cost, the session merge, the global window's
          silence and its custom-trigger fires, and the live-pane count falling to zero.
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
          Tumbling, sliding, session, and global windows each have their own notion — or lack of
          one — of when they end. State cost scales with overlap. And every pane, no matter the
          shape, must eventually close.
        </>
      ),
      duration: 4.8,
      fig: 'four shapes, four notions of an end, a cost that scales, state that must die',
      Visual: S.Recap,
    },
  ],
};

export default reel;
