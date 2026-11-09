import type { StepCtx } from '../../../../../reels/types';
import { easeOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// Semaphore saturation, runtime-metrics backlog, and bounded-channel backpressure, each
// measured directly; tokio-console named from the crate's own words, closing the chapter.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · 20 tasks, 4 permits (predict, hook) ─────────────────────────────────────────────────────
export function SemaphorePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="20 tasks, one Semaphore with 4 permits"
        lines={['let sem = Semaphore::new(4);', 'for _ in 0..20 {', '    spawn(async { let _p = sem.acquire().await; ... });', '}']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 2 · Measured: 4 running, 0 available (this is the swipe test's "from" step — NO takeaway) ───
export function SemaphoreReveal({ t }: StepCtx) {
  return (
    <Svg label="semaphore_bounds_concurrency.rs: a real, measured cap" h={200}>
      <T x={60} y={40} s={13} f={C.quiet}>20 tasks, 4 permits</T>
      {[0, 1, 2, 3].map((i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.15, 0.2 + i * 0.15 + 0.3));
        return <rect key={i} x={60 + i * 55} y={55} width={44} height={44} rx={6} fill={k > 0.9 ? C.caramel : 'none'} stroke={C.caramel} strokeWidth={2} opacity={Math.max(0.3, k)} />;
      })}
      <Reticle x={60 + 2 * 55 - 5} y={77} w={240} h={56} t={t} at={0.9} />
      <T x={60} y={135} s={13} f={C.mocha} o={fa(t, 1.0, 0.3)}>available: 0</T>
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.3, 0.3)}>never more than 4 running at once</T>
    </Svg>
  );
}

// ── 3 · Spawn 500, ask the metrics (predict) ────────────────────────────────────────────────────
export function MetricsPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="500 tasks, one worker, then ask the metrics"
        lines={['for _ in 0..500 { handle.spawn(...); }', 'let depth = handle.metrics().global_queue_depth();']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: hundreds still queued (takeaway) ──────────────────────────────────────────────
export function MetricsReveal({ t }: StepCtx) {
  const n = 12;
  return (
    <Svg label="global_queue_depth_reveals_backlog.rs: a real backlog" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>one worker, 500 tasks</T>
      {Array.from({ length: n }).map((_, i) => {
        const k = easeOut(seg(t, 0.15 + i * 0.06, 0.15 + i * 0.06 + 0.3));
        return <rect key={i} x={60 + (i % 6) * 36} y={45 + Math.floor(i / 6) * 30} width={28} height={22} rx={3} fill={C.caramel} opacity={k} />;
      })}
      <T x={60} y={140} s={13} f={C.mocha} o={fa(t, 1.0, 0.3)}>queued: hundreds</T>
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.3, 0.3)}>read straight from the runtime's own metrics</T>
    </Svg>
  );
}

// ── 5 · A channel of one slot (predict) ─────────────────────────────────────────────────────────
export function ChannelPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="capacity for one message, no receiver yet"
        lines={['let (tx, rx) = mpsc::channel(1);', 'tx.try_send(1)?;', 'tx.try_send(2) // ?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 6 · Measured: refused, then accepted (takeaway) ─────────────────────────────────────────────
export function ChannelReveal({ t }: StepCtx) {
  const k1 = easeOut(seg(t, 0.2, 0.4));
  const bounceX = lerp(260, 190, easeOut(seg(t, 0.55, 0.8)));
  return (
    <Svg label="bounded_channel_applies_backpressure.rs: a real, enforced limit" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>one slot, two sends</T>
      <rect x={60} y={45} width={60} height={44} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <circle cx={90} cy={67} r={6} fill={C.caramel} opacity={k1} />
      <circle cx={bounceX} cy={67} r={6} fill={C.cherryText} opacity={fa(t, 0.55, 0.2)} />
      <T x={60} y={135} s={13} f={C.mocha} o={fa(t, 0.9, 0.3)}>second send: refused</T>
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.2, 0.3)}>a third goes through once a slot frees up</T>
    </Svg>
  );
}

// ── 7 · Just a log viewer? (predict) ────────────────────────────────────────────────────────────
export function ConsolePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="what does tokio-console actually watch?"
        lines={['// a log viewer?', '// or a live view of tasks, resources, operations?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · The crate's own words (no takeaway, naming step) ────────────────────────────────────────
export function ConsoleReveal({ t }: StepCtx) {
  return (
    <Code
      title="console-subscriber docs: what it collects"
      lines={['// diagnostic data on tasks, resources,', '// and operations in a running application']}
      t={t}
      start={0.1}
      end={2.2}
      highlight={[0, 1]}
    />
  );
}

// ── 9 · The chapter's rules, named again (takeaway, moved off step 2) ───────────────────────────
export function RulesReveal({ t }: StepCtx) {
  const rows = [
    'small enough to yield — cooperative budgeting',
    'bounded concurrency — a Semaphore, measured',
    'bounded channels — enforced, not aspirational',
    'cancellation, defined explicitly',
  ];
  return (
    <Svg label="this chapter's operating rules, each one earned" h={260}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    "a Semaphore's permits really run out",
    'runtime metrics report a real backlog, not an estimate',
    'a bounded channel really refuses a send once full',
    'tokio-console turns all of this into a live view',
  ];
  return (
    <Svg label="recap: three real caps, and a live view of them" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
