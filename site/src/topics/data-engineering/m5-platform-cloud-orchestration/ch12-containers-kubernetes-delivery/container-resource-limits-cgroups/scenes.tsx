import { C, Svg, T, Reticle } from '../../../../../reels/kit';
import { easeOut, easeInOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Every number here is either examples.py's own real run (a genuine JVM OutOfMemoryError, a
// genuine Python RSS climb, cpu.max/Spark-overhead arithmetic) or a verbatim, dated number from
// the kernel's, Oracle's or Spark's own docs (SOURCES.md). No cgroup v2 host on this build
// machine, so the kernel OOM-kill signature itself is drawn from the sourced mechanism.

const LIMIT_Y = 80;
const BOX_X = 160;
const BOX_W = 280;
const BOX_BOTTOM = 300;

/** The chapter's limit line: one horizontal line is the kernel limit; a bar grows toward it. */
function LimitLine({ label }: { label: string }) {
  return (
    <g>
      <line x1={40} y1={LIMIT_Y} x2={560} y2={LIMIT_Y} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 4" />
      <T x={560} y={LIMIT_Y - 8} s={12} a="end" f={C.focus}>
        {label}
      </T>
    </g>
  );
}

// 1 · Hook: OOMKilled with a healthy-looking heap.
export function Hook({ t }: StepCtx) {
  const heapK = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="An executor pod is OOMKilled while its JVM heap sits at about half of what it was given" h={360}>
      <LimitLine label="container limit" />
      <rect x={BOX_X} y={LIMIT_Y} width={BOX_W} height={BOX_BOTTOM - LIMIT_Y} fill={C.cherry} opacity={0.35} stroke={C.cherryText} />
      <rect x={BOX_X + 20} y={LIMIT_Y + (BOX_BOTTOM - LIMIT_Y) * (1 - heapK * 0.5)} width={BOX_W - 40} height={(BOX_BOTTOM - LIMIT_Y) * heapK * 0.5} fill={C.panel} stroke={C.primary} />
      <T x={300} y={BOX_BOTTOM + 22} s={13} a="middle" f={C.primary}>
        JVM heap: about half used
      </T>
      <T x={300} y={BOX_BOTTOM + 44} s={13} a="middle" f={C.cherryText}>
        container: OOMKilled anyway
      </T>
    </Svg>
  );
}

// 2 · Predict: what did the kernel count that the heap didn't?
export function PredictNonHeap({ t }: StepCtx) {
  return (
    <Svg label="What did the kernel count that the heap didn't?" h={360}>
      <LimitLine label="container limit" />
      <rect x={BOX_X} y={LIMIT_Y} width={BOX_W} height={BOX_BOTTOM - LIMIT_Y} fill={C.panel} stroke={C.line} />
      <rect x={BOX_X + 20} y={LIMIT_Y + (BOX_BOTTOM - LIMIT_Y) * 0.5} width={BOX_W - 40} height={(BOX_BOTTOM - LIMIT_Y) * 0.5} fill={C.band} stroke={C.primary} />
      <T x={300} y={BOX_BOTTOM + 24} s={13} a="middle" f={C.primary}>
        heap: half full
      </T>
      <Reticle x={300} y={(LIMIT_Y + BOX_BOTTOM) / 2} w={BOX_W + 20} h={BOX_BOTTOM - LIMIT_Y + 20} t={t} at={0.3} />
      <T x={300} y={50} s={15} a="middle" f={C.crema} serif>
        container is full; heap is not
      </T>
    </Svg>
  );
}

// 3 · The limit is a kernel file (this is the test's "from" step: no takeaway here).
export function KernelFile({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.8));
  return (
    <Svg label="memory.max is a hard limit the kernel enforces; crossing it invokes the cgroup's OOM killer" h={340}>
      <rect x={60} y={60} width={480} height={60} rx={4} fill={C.panel} stroke={C.line} />
      <T x={300} y={95} s={14} a="middle" f={C.primary}>
        memory.max (a kernel file)
      </T>
      <g opacity={k}>
        <line x1={300} y1={130} x2={300} y2={180} stroke={C.focus} strokeWidth={1.5} />
        <rect x={160} y={190} width={280} height={50} rx={4} fill={C.cherry} opacity={0.4} stroke={C.cherryText} />
        <T x={300} y={220} s={14} a="middle" f={C.crema}>
          the cgroup's own OOM killer
        </T>
      </g>
      <T x={300} y={280} s={13} a="middle" f={C.quiet}>
        it doesn't care which byte crossed the line
      </T>
    </Svg>
  );
}

// 4 · Three ways to die of memory: kernel kill, JVM OOM, Python RSS growth.
export function ThreeDeaths({ t }: StepCtx) {
  const rows = [
    { title: 'kernel OOM-kill', line: 'process ends, exit code 137', color: C.cherryText },
    { title: 'JVM OutOfMemoryError', line: 'process survives, an exception', color: C.focus },
    { title: 'Python RSS growth', line: 'no exception, climbs until stopped', color: C.second },
  ];
  return (
    <Svg label="Three different memory deaths, three different log lines" h={340}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 * i, 0.2 * i + 0.4));
        return (
          <g key={r.title} opacity={k}>
            <rect x={60} y={50 + i * 80} width={480} height={56} rx={4} fill={C.panel} stroke={r.color} />
            <T x={300} y={50 + i * 80 + 24} s={14} a="middle" f={r.color}>
              {r.title}
            </T>
            <T x={300} y={50 + i * 80 + 44} s={12} a="middle" f={C.quiet}>
              {r.line}
            </T>
          </g>
        );
      })}
      <T x={300} y={300} s={13} a="middle" f={C.quiet}>
        one log line per death; never guess which
      </T>
    </Svg>
  );
}

// 5 · Container-aware JVM sizing: MaxRAMPercentage default 25%.
export function JvmSizing({ t }: StepCtx) {
  const k = easeInOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="The JVM reads the container limit but defaults its heap ceiling to 25 percent of it" h={360}>
      <LimitLine label="container limit" />
      <rect x={BOX_X} y={LIMIT_Y} width={BOX_W} height={BOX_BOTTOM - LIMIT_Y} fill={C.panel} stroke={C.line} />
      <rect x={BOX_X + 20} y={LIMIT_Y + (BOX_BOTTOM - LIMIT_Y) * (1 - 0.25 * k)} width={BOX_W - 40} height={(BOX_BOTTOM - LIMIT_Y) * 0.25 * k} fill={C.second} opacity={0.5} stroke={C.second} />
      <T x={300} y={BOX_BOTTOM + 22} s={13} a="middle" f={C.second}>
        default heap ceiling: 25% of limit
      </T>
      <T x={300} y={BOX_BOTTOM + 44} s={13} a="middle" f={C.quiet}>
        the rest: metaspace, stacks, native
      </T>
    </Svg>
  );
}

// 6 · Spark memoryOverhead: 10% JVM, 40% non-JVM, floor 384 MiB.
export function SparkOverhead({ t }: StepCtx) {
  const rows = [
    { label: 'JVM executor', factor: '10%', w: 0.1 },
    { label: 'PySpark executor', factor: '40%', w: 0.4 },
  ];
  return (
    <Svg label="Spark's memoryOverhead is executor memory times a factor, floored at 384 mebibytes" h={320}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + 0.3 * i, 0.3 + 0.3 * i + 0.5));
        return (
          <g key={r.label}>
            <T x={40} y={80 + i * 90} s={13} f={C.primary}>
              {r.label}
            </T>
            <rect x={40} y={92 + i * 90} width={400} height={24} rx={3} fill={C.band} />
            <rect x={40} y={92 + i * 90} width={400 * r.w * k * 2.2} height={24} rx={3} fill={C.second} />
            <T x={450} y={109 + i * 90} s={13} f={C.second}>
              {r.factor}
            </T>
          </g>
        );
      })}
      <T x={300} y={290} s={13} a="middle" f={C.quiet}>
        floor: 384 MiB either way
      </T>
    </Svg>
  );
}

// 7 · CPU quota and period, CFS throttling.
export function CpuQuota({ t }: StepCtx) {
  const periods = 4;
  const usedFrac = [1, 1, 0.6, 1];
  return (
    <Svg label="A hungry process burns its CPU quota early in the period and sits throttled for the rest" h={340}>
      {Array.from({ length: periods }).map((_, i) => {
        const k = easeOut(seg(t, 0.2 * i, 0.2 * i + 0.4));
        const quotaX = 60 + i * 130;
        return (
          <g key={i}>
            <rect x={quotaX} y={60} width={110} height={30} rx={3} fill={C.band} />
            <rect x={quotaX} y={60} width={110 * 0.4} height={30} rx={3} fill={C.second} opacity={0.5} />
            <rect x={quotaX} y={100} width={110 * usedFrac[i] * k} height={20} rx={3} fill={usedFrac[i] >= 1 ? C.cherryText : C.focus} />
            <T x={quotaX + 55} y={145} s={11} a="middle" f={C.quiet}>
              period {i + 1}
            </T>
          </g>
        );
      })}
      <T x={300} y={200} s={13} a="middle" f={C.quiet}>
        used past quota → throttled till next period
      </T>
    </Svg>
  );
}

// 8 · Predict 2: a CPU-limited pod on an idle node — still throttled?
export function PredictCpuIdle({ t }: StepCtx) {
  return (
    <Svg label="A pod has a CPU limit; the node is otherwise idle. Is it throttled anyway?" h={340}>
      <rect x={60} y={100} width={480} height={60} rx={4} fill={C.panel} stroke={C.line} />
      <T x={300} y={135} s={14} a="middle" f={C.primary}>
        node: otherwise idle
      </T>
      <Reticle x={300} y={130} w={500} h={80} t={t} at={0.3} />
      <T x={300} y={50} s={15} a="middle" f={C.crema} serif>
        is the pod throttled anyway?
      </T>
    </Svg>
  );
}

// 9 · Probes: liveness, readiness, startup.
export function Probes({ t }: StepCtx) {
  const rows = [
    { name: 'startup', does: 'holds the others back', color: C.second },
    { name: 'liveness', does: 'restarts the container', color: C.cherryText },
    { name: 'readiness', does: 'removes it from service', color: C.focus },
  ];
  return (
    <Svg label="Three probes, three different actions on failure" h={340}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 * i, 0.2 * i + 0.4));
        return (
          <g key={r.name} opacity={k}>
            <rect x={60} y={50 + i * 80} width={180} height={50} rx={4} fill={C.panel} stroke={r.color} />
            <T x={150} y={50 + i * 80 + 30} s={14} a="middle" f={r.color}>
              {r.name}
            </T>
            <line x1={240} y1={50 + i * 80 + 25} x2={340} y2={50 + i * 80 + 25} stroke={C.line} />
            <T x={350} y={50 + i * 80 + 30} s={13} f={C.primary}>
              {r.does}
            </T>
          </g>
        );
      })}
      <T x={300} y={300} s={13} a="middle" f={C.quiet}>
        a slow JVM + early liveness = a restart loop
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  const lines: [string, string][] = [
    ['A kernel limit is a file;', "crossing it invokes the cgroup's own OOM killer."],
    ['Three memory deaths, three logs:', 'kernel kill, JVM OOM, RSS growth.'],
    ['The JVM defaults its heap to', '25% of the container limit.'],
    ["Spark's overhead is a fraction", 'of executor memory, floored at 384 MiB.'],
    ['A startup probe holds liveness', 'and readiness back until it passes.'],
  ];
  return (
    <Svg label="Five things to keep from this topic" h={360}>
      {lines.map(([l1, l2], i) => {
        const k = easeOut(seg(t, 0.15 * i, 0.15 * i + 0.4));
        return (
          <g key={l1} opacity={k} transform={`translate(0 ${(1 - k) * 8})`}>
            <circle cx={30} cy={34 + i * 62} r={3} fill={C.focus} />
            <T x={48} y={34 + i * 62 + 5} s={13} f={C.primary} w={400}>
              {l1}
            </T>
            <T x={48} y={34 + i * 62 + 23} s={13} f={C.primary} w={400}>
              {l2}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}
