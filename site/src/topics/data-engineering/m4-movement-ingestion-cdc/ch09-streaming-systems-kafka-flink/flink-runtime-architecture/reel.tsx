import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a real slot-bounded max-parallelism
// calculation, a real cost comparison between chained and unchained operators, a real
// credit-counter simulation of backpressure draining backward through a chain one hop at a
// time, and real adaptive-batch-scheduling parallelism decisions for two different data
// volumes. No literal digits anywhere below (duration numbers are exempt); the real values live
// in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: "Hook: throughput collapses, and nothing in the logs says why",
      body: (
        <>
          A job's throughput collapses the instant one downstream operator slows down, with no
          explicit error or signal anywhere in the logs — exactly what credit-based flow control
          is supposed to do, visibly, once you know where to look.
        </>
      ),
      duration: 4.8,
      fig: 'throughput collapses, nothing in the logs says why, and credits explain it',
      Visual: S.Hook,
    },
    {
      title: "Setup: a job needs a machine that runs it, continuously, at scale",
      body: (
        <>
          Everything so far has been about correctness inside a single stream-processing step,
          regardless of what runs it. This topic is the machine that actually runs it,
          continuously, at scale: Flink's own runtime.
        </>
      ),
      duration: 4.8,
      fig: 'correctness inside a step is one thing; the machine that runs it is another',
      Visual: S.Setup,
    },
    {
      title: "Predict: can a job's parallelism simply exceed its slots?",
      body: (
        <>
          A job asks for more parallelism than the cluster currently has slots for. Does it run
          anyway, just more slowly, or does something stop it outright?
        </>
      ),
      duration: 2.8,
      fig: 'ask for more parallelism than there are slots — what happens?',
      predict: {
        options: [
          { label: "It runs anyway, just with less parallelism than asked for" },
          { label: "It's a hard ceiling — the job can't be scheduled at all", correct: true },
          { label: 'Flink automatically starts more TaskManagers to cover the gap' },
        ],
        explain: (
          <>
            A hard ceiling. A job's parallelism is bounded by the total slots available across
            every TaskManager in the cluster — asking for more than that isn't a soft request,
            it's a job that simply can't be scheduled.
          </>
        ),
      },
      Visual: S.PredictSlots,
    },
    {
      title: 'Reveal: a coordinator, a set of workers, and a hard ceiling',
      body: (
        <>
          The JobManager schedules a job's tasks and coordinates checkpoints. TaskManagers run the
          actual work, each offering a fixed number of slots. A job's parallelism is bounded by
          the total slots available across all TaskManagers — not a soft limit, a hard one.
        </>
      ),
      duration: 4.8,
      fig: 'a coordinator, a set of workers, and a hard ceiling on parallelism',
      Visual: S.RevealSlots,
    },
    {
      title: 'Reveal: fusing operators together removes a hop entirely',
      body: (
        <>
          Consecutive operators with compatible parallelism and no shuffle between them are fused
          into one task at runtime — no network hop, no serialization between them. Measured
          directly on the same stream, the cost gap is real and large.
        </>
      ),
      duration: 4.8,
      fig: 'fused operators skip the hop entirely; separate ones pay for it, every record',
      takeaway: "Operator chaining isn't a minor tuning knob — skipping a hop entirely is a different order of cost entirely.",
      Visual: S.RevealChaining,
    },
    {
      title: 'Reveal: backpressure with no explicit signal, by design',
      body: (
        <>
          Credit-based flow control means a receiving task grants the sender credits rather than
          the sender pushing unboundedly. A slow consumer simply grants fewer credits, and the
          slowdown ripples backward through the whole chain, one hop at a time.
        </>
      ),
      duration: 4.8,
      fig: 'a receiver grants credits; run out, and the slowdown ripples backward',
      takeaway: "Backpressure needing no explicit message is the point — it's an emergent property of credits running out, nothing sent.",
      Visual: S.RevealBackpressure,
    },
    {
      title: 'Predict: when per-job mode was finally removed, what replaced it?',
      body: (
        <>
          Flink 2.0 removed the older per-job mode entirely. What runs a job's own code on the
          cluster in its place?
        </>
      ),
      duration: 2.8,
      fig: 'per-job mode is gone — what runs a job’s own code now?',
      predict: {
        options: [
          { label: 'A long-running session cluster, shared across every job' },
          { label: "Application mode — one dedicated cluster per application", correct: true },
          { label: 'Nothing — submitting a standalone job is no longer supported' },
        ],
        explain: (
          <>
            Application mode. It runs the job's own main method on the cluster itself, one
            JobManager per application, not shared — the model Flink standardized on once
            per-job mode was removed.
          </>
        ),
      },
      Visual: S.PredictPerJobMode,
    },
    {
      title: 'Reveal: application mode is what Flink standardized on',
      body: (
        <>
          Application mode runs the job's own code on the cluster itself, one JobManager per
          application, not shared. Flink's own release notes state the older per-job mode was
          removed outright, and application mode is what to use instead.
        </>
      ),
      duration: 4.8,
      fig: "one job's own code, run on the cluster itself, not shared with others",
      Visual: S.RevealApplicationMode,
    },
    {
      title: 'Reveal: the same runtime, two different kinds of job',
      body: (
        <>
          The same runtime and APIs execute both bounded batch jobs and unbounded stream jobs.
          Adaptive batch scheduling adjusts a batch job's parallelism between stages from the
          actual data volume the previous stage produced, instead of fixing it up front.
        </>
      ),
      duration: 4.8,
      fig: 'the same runtime runs both kinds of job; one of them sizes itself',
      takeaway: "Adaptive scheduling isn't guessing at the right parallelism in advance — it's deciding from data that's already been produced.",
      Visual: S.RevealAdaptiveBatch,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel came from a real run of this topic's own toy model, just now —
          the slot-bounded ceiling, the chained-versus-unchained cost gap, the backpressure stall
          draining backward hop by hop, and adaptive scheduling sizing two stages differently.
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
          A coordinator and a hard ceiling on parallelism. Fused operators that skip a hop
          entirely. Backpressure that needs no explicit signal. One standardized deployment mode.
          And one runtime for both batch and stream.
        </>
      ),
      duration: 4.8,
      fig: 'a coordinator, a ceiling, a fused hop, a silent slowdown, one runtime',
      Visual: S.Recap,
    },
  ],
};

export default reel;
