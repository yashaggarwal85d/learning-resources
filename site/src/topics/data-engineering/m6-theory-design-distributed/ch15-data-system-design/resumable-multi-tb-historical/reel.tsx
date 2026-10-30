import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The checkpoint-resume, throttle, cost and diff claims are asserted in
// examples.py's own simulate_crash_and_resume(), throttled_concurrency(),
// backfill_cost() and diff_is_intended_only(). The chunked-partition and
// shadow-branch claims trace to Dagster's and Iceberg's own docs, quoted
// in SOURCES.md and checked step by step in FACT-CHECK.md. No literal
// digits appear below; duration words are exempt.
const reel: Reel = {
  steps: [
    {
      title: "Hook: one job, one crash, nothing saved",
      body: (
        <>
          A revenue-logic bug needs years of history reprocessed. The first attempt is a single
          job that runs most of a day, takes the shared warehouse's concurrency down for finance,
          and dies near the end with nothing checkpointed.
        </>
      ),
      duration: 5.0,
      fig: "one long job; a concurrency drop for finance; a crash with nothing saved",
      Visual: S.Hook,
    },
    {
      title: "Predict: what four decisions prevent this?",
      body: (
        <>
          The single job failed in three distinct ways at once. What four decisions, made before
          the first chunk ran, turn this into an unremarkable week instead?
        </>
      ),
      duration: 4.6,
      predict: {
        options: [
          { label: "just a bigger machine and a longer timeout, since the job only needed more resources and patience" },
          {
            label: "chunking, idempotence, a checkpoint, a throttle, and a shadow table, each addressing one of the failures",
            correct: true,
          },
        ],
        explain: (
          <>
            A bigger single job is still one unit of work — it still dies all at once with
            nothing saved, and still contends with production, just for longer. Each of the five
            decisions answers one specific failure the hook actually hit.
          </>
        ),
      },
      fig: "a bigger machine changes nothing about dying as one unit; five decisions do",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: chunk the history into independent pieces",
      body: (
        <>
          Years of history get cut into a grid of chunks, each a day or a partition, each
          independent of its neighbors. The backfill advances across the grid one chunk at a
          time, not as one undifferentiated job.
        </>
      ),
      duration: 4.8,
      fig: "a grid of chunk cells; the backfill advancing across them one at a time",
      Visual: S.RevealChunkGrid,
    },
    {
      title: "Reveal: idempotent chunks, a durable checkpoint",
      body: (
        <>
          A crash stops the backfill mid-run. The checkpoint tracks every completed chunk, so
          resuming picks up at the first incomplete one. Each chunk overwrites its own slot
          deterministically, so a rerun never produces a duplicate.
        </>
      ),
      duration: 5.0,
      takeaway: "A checkpoint resumes at the first incomplete chunk, not the start — the whole point of an idempotent chunk.",
      fig: "a crash mid-grid; the checkpoint bar, and resume starting right after it",
      Visual: S.RevealCheckpointResume,
    },
    {
      title: "Reveal: throttle against shared resources",
      body: (
        <>
          A concurrency cap and a rate limit on source reads both leave headroom for production.
          The real design question isn't how many workers the budget allows — it's what signal
          tells the backfill to slow down.
        </>
      ),
      duration: 4.8,
      fig: "a concurrency gauge and a source rate limit, both capped to leave headroom",
      Visual: S.RevealThrottleSignal,
    },
    {
      title: "Reveal: the throttle reacts to production, not a number",
      body: (
        <>
          Production's own latency line rises, and the concurrency gauge drops in direct
          response, automatically. When the latency line falls back, the gauge recovers on its
          own — no one has to watch it.
        </>
      ),
      duration: 4.8,
      takeaway: "A throttle's signal is production's own latency, not a fixed concurrency number chosen once and left alone.",
      fig: "a latency line rising, the concurrency gauge dropping, then both recovering together",
      Visual: S.RevealThrottleReacts,
    },
    {
      title: "Reveal: write to a shadow, then one atomic swap",
      body: (
        <>
          The backfill's output fills a shadow table beside the live one. Readers of the live
          table see nothing change until one atomic operation promotes the shadow. A failed run
          is discarded, never repaired in place.
        </>
      ),
      duration: 4.8,
      fig: "a shadow table filling beside the live one; one atomic swap promotes it",
      Visual: S.RevealShadowSwap,
    },
    {
      title: "Reveal: validate with a data diff before the swap",
      body: (
        <>
          Before the swap, the shadow is compared against the live table on the overlap, and
          against an independent recomputation on a sample. The panel must show only the change
          this backfill was actually meant to make.
        </>
      ),
      duration: 4.8,
      takeaway: "The diff must show only the intended change, or the swap doesn't happen at all.",
      fig: "a diff panel comparing shadow against live; only the intended rows differ",
      Visual: S.RevealDataDiff,
    },
    {
      title: "Recap",
      body: (
        <>
          History cut into independent chunks. A checkpoint that resumes past the first
          incomplete one. A throttle that reacts to production's own latency. A shadow table
          promoted by one atomic swap, gated by a diff that shows only what was meant to change.
        </>
      ),
      duration: 4.8,
      fig: "the chunk grid, the checkpoint, the throttle, the shadow-and-swap, and the diff gate",
      Visual: S.Recap,
    },
    {
      title: "Prove it: a throttle someone switched off",
      body: (
        <>
          A second backfill is already running, with its throttle disabled by an engineer "to
          make it finish faster." Production latency is already climbing. What's the right move?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "let it keep running at full speed, since a backfill already underway shouldn't be slowed now" },
          {
            label: "re-enable the throttle immediately and let the latency signal govern concurrency from this point on",
            correct: true,
          },
        ],
        explain: (
          <>
            The throttle's whole job is to react to production's own live latency, continuously
            — not to act only as a gate before the run starts. Letting it run at full speed
            treats a continuous signal as if it were a one-time check.
          </>
        ),
      },
      fig: "latency climbing with the throttle off; re-enabling it governs concurrency again",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
