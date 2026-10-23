import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Work stealing (local queue, global queue, lifo slot, stealing half a queue) and cooperative
// budgeting, each measured directly on a real tokio runtime.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · 200 tasks, one spawning worker (predict, hook) ──────────────────────────────────────────
export function StealPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="200 tasks, spawned from inside block_on"
        lines={['for _ in 0..200 {', '    tokio::spawn(work());', '}']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Stealing glyph: half a queue sliding over (no takeaway, "from" step) ────────────────────
export function StealReveal({ t }: StepCtx) {
  return (
    <Svg label="an idle worker steals half of a busy sibling's queue" h={220}>
      <g opacity={fa(t, 0.1, 0.4)}>
        <rect x={60} y={40} width={200} height={60} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} />
        <T x={160} y={70} s={13} a="middle" f={C.crema}>busy worker</T>
      </g>
      <g opacity={fa(t, 0.1, 0.4)}>
        <rect x={340} y={40} width={200} height={60} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <T x={440} y={70} s={13} a="middle" f={C.crema}>idle worker</T>
      </g>
      <g opacity={fa(t, 0.9, 0.4)} style={{ transform: `translateX(${(1 - fa(t, 0.9, 0.5)) * -120}px)` }}>
        <rect x={200} y={46} width={60} height={48} rx={4} fill={C.caramel} opacity={0.3} />
      </g>
      <T x={340} y={115} s={12} f={C.mocha} o={fa(t, 1.0, 0.4)}>half the queue, moved</T>
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.4, 0.4)}>only once both of its own queues are empty</T>
    </Svg>
  );
}

// ── 3 · Measured stealing (takeaway) ─────────────────────────────────────────────────────────────
export function StealMeasuredReveal({ t }: StepCtx) {
  return (
    <Svg label="tasks_get_stolen.rs: a real, measured spread" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>200 tasks, one spawning worker</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>ran across 3–4 real threads</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>measured directly, not assumed</T>
    </Svg>
  );
}

// ── 4 · A task wakes a sibling (predict) ─────────────────────────────────────────────────────────
export function LifoPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="task A wakes task B via a channel"
        lines={['tx.send(msg).unwrap();', '// B was blocked on this channel', '// does B go to the back of the queue?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 5 · LIFO slot (no takeaway, docs-naming "from" step) ─────────────────────────────────────────
export function LifoReveal({ t }: StepCtx) {
  return (
    <Svg label="the lifo slot: a fast lane for a just-woken task" h={220}>
      <g opacity={fa(t, 0.2, 0.4)}>
        <rect x={60} y={40} width={160} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={140} y={67} s={13} a="middle" f={C.mocha}>lifo slot</T>
      </g>
      <g opacity={fa(t, 0.2, 0.4)}>
        <rect x={60} y={96} width={160} height={70} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <T x={140} y={135} s={12} a="middle" f={C.crema}>local queue</T>
      </g>
      <T x={60} y={190} s={13} f={C.crema} o={fa(t, 0.8, 0.4)}>checked first, for message-passing locality</T>
      <T x={60} y={215} s={13} f={C.latte} o={fa(t, 1.4, 0.4)}>disabled after three uses in a row</T>
    </Svg>
  );
}

// ── 6 · Always-ready hot loop (predict) ──────────────────────────────────────────────────────────
export function BudgetPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="an always-ready hot loop"
        lines={['loop {', '    rx.recv().await;', '    resupply.send(()).ok();', '}']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 7 · Measured budget-forced yield (takeaway) ──────────────────────────────────────────────────
export function BudgetMeasuredReveal({ t }: StepCtx) {
  return (
    <Svg label="budget_forces_yield.rs: a bounded allowance, measured" h={220}>
      <T x={60} y={50} s={13} f={C.latte} o={fa(t, 0.2, 0.4)}>a spending limit before being asked to step aside</T>
      <g opacity={fa(t, 0.5, 0.4)}>
        <rect x={60} y={70} width={280} height={14} rx={4} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <rect x={62} y={72} width={fa(t, 0.5, 0.6) * 270} height={10} rx={3} fill={C.caramel} opacity={0.6} />
      </g>
      <g opacity={fa(t, 1.1, 0.4)}>
        <rect x={60} y={110} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={137} s={13} a="middle" f={C.mocha}>sibling ran, loop still going</T>
      </g>
      <T x={60} y={190} s={13} f={C.crema} o={fa(t, 1.6, 0.4)}>forced in well before the loop itself finished</T>
    </Svg>
  );
}

// ── 8 · unconstrained (predict) ───────────────────────────────────────────────────────────────────
export function UnconstrainedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical loop, opted out of the budget"
        lines={['tokio::spawn(task::unconstrained(async move {', '    loop { rx.recv().await; }', '}));']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 9 · Measured starvation (takeaway) ───────────────────────────────────────────────────────────
export function UnconstrainedMeasuredReveal({ t }: StepCtx) {
  return (
    <Svg label="unconstrained_starves_sibling.rs: no protection left" h={220}>
      <T x={60} y={50} s={13} f={C.latte} o={fa(t, 0.2, 0.4)}>the budget, switched off entirely</T>
      <g opacity={fa(t, 0.5, 0.4)}>
        <rect x={60} y={70} width={280} height={14} rx={4} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <rect x={62} y={72} width={276} height={10} rx={3} fill={C.caramel} opacity={0.85} />
      </g>
      <g opacity={fa(t, 1.1, 0.4)}>
        <rect x={60} y={110} width={240} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={180} y={137} s={13} a="middle" f={C.mocha}>sibling waits for the whole loop</T>
      </g>
      <T x={60} y={190} s={13} f={C.crema} o={fa(t, 1.6, 0.4)}>both land within milliseconds of each other</T>
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'an idle worker steals half of a busy sibling’s queue',
    'the lifo slot fast-paths a just-woken task, briefly',
    'a bounded budget forces a hot loop to yield',
    'unconstrained removes that protection entirely',
  ];
  return (
    <Svg label="recap: stealing, the lifo slot, and the budget" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
