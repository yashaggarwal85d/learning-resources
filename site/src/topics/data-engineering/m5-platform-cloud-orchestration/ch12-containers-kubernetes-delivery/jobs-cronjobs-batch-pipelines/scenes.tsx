import { C, Svg, T, Reticle } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// No local Kubernetes cluster on this build machine, so the Job and CronJob controllers' live
// behaviour is sourced from Kubernetes' own documentation (SOURCES.md). The per-index backoff
// model, the pod-failure-policy evaluator, the success-policy evaluator, the concurrency-policy
// resolver and the missed-schedule counter are run for real in examples.py.

const GRID_COLS = 20;
const GRID_ROWS = 10;
const CELL = 20;
const GRID_X = 60;
const GRID_Y = 60;

function Grid({ failing, highlightOnly }: { failing: number; highlightOnly?: boolean }) {
  const cells = [];
  for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const isFailing = i === failing;
    cells.push(
      <rect
        key={i}
        x={GRID_X + col * CELL}
        y={GRID_Y + row * CELL}
        width={CELL - 3}
        height={CELL - 3}
        rx={2}
        fill={isFailing ? C.bad : highlightOnly ? C.panel : C.band}
        stroke={isFailing ? C.badText : C.line}
      />,
    );
  }
  return <>{cells}</>;
}

// 1 · Hook: 200 partitions, one malformed record.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="A 200-partition Job: partition 137 is malformed and crashes every time" h={320}>
      <Grid failing={137} />
      <T x={300} y={280} s={13} a="middle" f={C.quiet}>
        one shared retry budget — six failures kill the whole Job
      </T>
    </Svg>
  );
}

// 2 · Predict: which setting isolates the one bad partition.
export function PredictIsolate({ t }: StepCtx) {
  return (
    <Svg label="Which setting makes partition 137 fail alone, and what is the Job's final status?" h={300}>
      <Grid failing={137} highlightOnly />
      <Reticle x={300} y={150} w={520} h={240} t={t} at={0.3} />
      <T x={300} y={40} s={15} a="middle" f={C.crema} serif>
        isolate the one bad index — what's the Job's status after?
      </T>
    </Svg>
  );
}

// 3 · Indexed Jobs: no work queue.
export function IndexedNoQueue({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="Each pod's completion index tells it which partition to process — no external queue" h={320}>
      <rect x={120} y={60} width={360} height={60} rx={4} fill={C.panel} stroke={C.focus} />
      <T x={300} y={90} s={13} a="middle" f={C.focus}>pod with index i</T>
      <T x={300} y={108} s={11} a="middle" f={C.quiet}>annotation · label · hostname · JOB_COMPLETION_INDEX</T>
      <g opacity={k}>
        <T x={300} y={180} s={13} a="middle" f={C.primary}>index i always processes partition i</T>
        <T x={300} y={202} s={13} a="middle" f={C.primary}>— no work queue to coordinate</T>
      </g>
    </Svg>
  );
}

// 4 · More than one pod per index.
export function TwoPodsOneIndex({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.8));
  return (
    <Svg label="A replacement pod can start before the old one is confirmed terminal — briefly, two pods share an index" h={320}>
      <rect x={150} y={60} width={300} height={50} rx={4} fill={C.panel} stroke={C.focus} />
      <T x={300} y={90} s={13} a="middle" f={C.focus}>index 4, pod A (terminating)</T>
      <g opacity={k}>
        <rect x={150} y={150} width={300} height={50} rx={4} fill={C.panel} stroke={C.second} />
        <T x={300} y={180} s={13} a="middle" f={C.second}>index 4, pod B (replacement, running)</T>
      </g>
      <T x={300} y={250} s={13} a="middle" f={C.primary}>each index's work must be idempotent</T>
    </Svg>
  );
}

// 5 · Per-index backoff: failedIndexes, doesn't stop the others.
export function PerIndexBackoff({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  const failing = new Set([0, 2, 4, 6, 8]);
  return (
    <Svg label="backoffLimitPerIndex: a failing index joins failedIndexes without stopping the rest" h={320}>
      {Array.from({ length: 10 }).map((_, i) => {
        const isFail = failing.has(i);
        const show = easeOut(seg(t, 0.1 + i * 0.07, 0.1 + i * 0.07 + 0.3)) * k;
        return (
          <g key={i} opacity={show}>
            <rect x={60 + i * 48} y={100} width={40} height={60} rx={4} fill={C.panel} stroke={isFail ? C.badText : C.second} />
            <T x={80 + i * 48} y={135} s={12} a="middle" f={isFail ? C.badText : C.second}>{i}</T>
          </g>
        );
      })}
      <T x={300} y={200} s={13} a="middle" f={C.quiet}>failedIndexes: 0,2,4,6,8 — completedIndexes: 1,3,5,7,9</T>
      <T x={300} y={230} s={13} a="middle" f={C.primary}>still ends Failed — but every index ran</T>
    </Svg>
  );
}

// 6 · maxFailedIndexes caps it.
export function MaxFailedIndexes({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="maxFailedIndexes caps how many indexes may fail before the rest are terminated early" h={320}>
      <rect x={100} y={40} width={400} height={50} rx={4} fill={C.panel} stroke={C.second} />
      <T x={300} y={70} s={13} a="middle" f={C.second}>under the cap</T>
      <T x={300} y={108} s={12} a="middle" f={C.quiet}>all indexes run; Job still ends Failed</T>
      <g opacity={k}>
        <rect x={100} y={160} width={400} height={50} rx={4} fill={C.cherry} opacity={0.25} stroke={C.cherryText} />
        <T x={300} y={190} s={13} a="middle" f={C.cherryText}>over maxFailedIndexes</T>
        <T x={300} y={228} s={12} a="middle" f={C.quiet}>remaining pods terminated; Job fails early</T>
      </g>
    </Svg>
  );
}

// 7 · Pod failure policy: classify, don't just count.
export function FailurePolicy({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="onExitCodes and onPodConditions classify a failure into Ignore, FailJob, FailIndex, or Count" h={340}>
      <rect x={60} y={60} width={220} height={60} rx={4} fill={C.panel} stroke={C.second} />
      <T x={170} y={88} s={13} a="middle" f={C.second}>exit code 42</T>
      <T x={170} y={106} s={11} a="middle" f={C.quiet}>action: FailJob</T>
      <rect x={320} y={60} width={220} height={60} rx={4} fill={C.panel} stroke={C.focus} />
      <T x={430} y={88} s={13} a="middle" f={C.focus}>DisruptionTarget</T>
      <T x={430} y={106} s={11} a="middle" f={C.quiet}>action: Ignore</T>
      <g opacity={k}>
        <T x={300} y={200} s={13} a="middle" f={C.primary}>a bug fails fast; an eviction doesn't burn the budget</T>
      </g>
    </Svg>
  );
}

// 8 · Predict 2: does a drain-caused eviction count?
export function PredictDrain({ t }: StepCtx) {
  return (
    <Svg label="A node drain evicts a running pod. Does it count against backoffLimitPerIndex?" h={300}>
      <rect x={100} y={70} width={400} height={60} rx={4} fill={C.panel} stroke={C.focus} />
      <T x={300} y={105} s={13} a="middle" f={C.focus}>node drain → pod evicted (DisruptionTarget)</T>
      <Reticle x={300} y={100} w={440} h={140} t={t} at={0.3} />
      <T x={300} y={40} s={15} a="middle" f={C.crema} serif>
        does this count against the retry budget?
      </T>
    </Svg>
  );
}

// 9 · Success policy: finish on partial completion.
export function SuccessPolicy({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  const succeeded = new Set([2]);
  const needed = new Set([0, 2, 3]);
  return (
    <Svg label="successPolicy ends the Job the moment the chosen indexes succeed and kills the rest" h={320}>
      {[0, 1, 2, 3, 4].map((i) => {
        const isNeeded = needed.has(i);
        const isSucceeded = succeeded.has(i);
        const show = easeOut(seg(t, 0.1 + i * 0.08, 0.1 + i * 0.08 + 0.3)) * k;
        return (
          <g key={i} opacity={show}>
            <rect x={100 + i * 80} y={100} width={60} height={60} rx={4} fill={C.panel} stroke={isSucceeded ? C.second : isNeeded ? C.focus : C.line} />
            <T x={130 + i * 80} y={135} s={12} a="middle" f={isSucceeded ? C.second : C.quiet}>{i}</T>
          </g>
        );
      })}
      <T x={300} y={200} s={13} a="middle" f={C.quiet}>succeededIndexes: 0,2,3 · succeededCount: 1</T>
      <T x={300} y={230} s={13} a="middle" f={C.primary}>index 2 alone satisfies the rule — lingering pods are killed</T>
    </Svg>
  );
}

// 10 · TTL cleanup.
export function TtlCleanup({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="ttlSecondsAfterFinished deletes a finished Job and its pods together" h={300}>
      <rect x={160} y={60} width={280} height={60} rx={4} fill={C.panel} stroke={C.second} opacity={1 - k * 0.8} />
      <T x={300} y={95} s={13} a="middle" f={C.second} o={1 - k * 0.6}>finished Job + pods</T>
      <T x={300} y={200} s={13} a="middle" f={C.quiet}>logs are gone too, unless shipped elsewhere first</T>
    </Svg>
  );
}

// 11 · CronJob: three concurrency policies, one overrun.
export function ConcurrencyPolicies({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  const labels = [
    { name: 'Allow', desc: 'runs alongside the old one', color: C.quiet },
    { name: 'Forbid', desc: 'skips the new run', color: C.second },
    { name: 'Replace', desc: 'kills old, starts new', color: C.focus },
  ];
  return (
    <Svg label="The previous run is still going. Allow, Forbid and Replace resolve the overrun three ways" h={380}>
      {labels.map((l, i) => {
        const show = easeOut(seg(t, 0.1 + i * 0.2, 0.1 + i * 0.2 + 0.3)) * k;
        return (
          <g key={l.name} opacity={show}>
            <rect x={100} y={40 + i * 100} width={400} height={70} rx={4} fill={C.panel} stroke={l.color} />
            <T x={300} y={72 + i * 100} s={13} a="middle" f={l.color}>{l.name}</T>
            <T x={300} y={94 + i * 100} s={11} a="middle" f={C.quiet}>{l.desc}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 12 · Missed schedules and the 100-miss rule.
export function MissedSchedules({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="A controller outage longer than 100 missed intervals: Kubernetes gives up and logs an error" h={320}>
      <rect x={60} y={60} width={480} height={16} rx={2} fill={C.band} />
      <rect x={60} y={60} width={480 * 0.0} height={16} rx={2} fill={C.bad} />
      <g opacity={k}>
        <T x={300} y={110} s={13} a="middle" f={C.primary}>controller down 08:29 → 10:21, no deadline set</T>
        <T x={300} y={135} s={13} a="middle" f={C.badText}>&gt;100 missed schedules — does not start, logs an error</T>
      </g>
    </Svg>
  );
}

// 13 · The boundary: CronJob vs orchestrator.
export function CronJobBoundary({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="A CronJob creates a Job approximately once per schedule — nothing more" h={320}>
      <rect x={100} y={50} width={400} height={50} rx={4} fill={C.panel} stroke={C.second} />
      <T x={300} y={80} s={13} a="middle" f={C.second}>CronJob: schedule + concurrency + history</T>
      <g opacity={k}>
        <rect x={100} y={150} width={400} height={80} rx={4} fill={C.panel} stroke={C.line} />
        <T x={300} y={178} s={12} a="middle" f={C.quiet}>no dependency graph · no data intervals</T>
        <T x={300} y={200} s={12} a="middle" f={C.quiet}>no backfill · no cross-job retries or alerts</T>
      </g>
    </Svg>
  );
}

// 14 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="Per-index retries isolate one bad partition; the CronJob is cron with a controller, not an orchestrator" h={320}>
      <Grid failing={137} highlightOnly />
      <T x={300} y={280} s={13} a="middle" f={C.quiet}>
        Jobs that end on purpose; a CronJob that starts them.
      </T>
      <T x={300} y={302} s={13} a="middle" f={C.quiet}>
        Chapter 11 for everything past that.
      </T>
    </Svg>
  );
}
