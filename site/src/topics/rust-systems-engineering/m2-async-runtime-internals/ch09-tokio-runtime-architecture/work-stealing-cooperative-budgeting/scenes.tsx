import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// Work stealing (local queue, global queue, lifo slot, stealing half a queue) and cooperative
// budgeting, each measured directly on a real tokio runtime.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A recap as a payoff: each point slides in from the left on its beat (fitted to the step's `end`), its tick draws as it
 * lands, a spine grows down to meet it, and the last point (where the topic leads next) lights up and is locked on. */
function RecapList({ t, rows, label, end, step = 50, s = 15 }: { t: number; rows: string[]; label: string; end: number; step?: number; s?: number }) {
  const y0 = 40;
  const n = rows.length;
  const start = 0.15;
  const beat = Math.min(0.42, Math.max(0.2, (end - start - 1.15) / Math.max(1, n - 1)));
  const h = y0 + (n - 1) * step + 40;
  const lastY = y0 + (n - 1) * step;
  return (
    <Svg label={label} h={Math.max(300, h)}>
      <Draw pts={[[29, y0 - 5], [29, lastY - 5]]} t={t} from={start + 0.1} to={start + 0.1 + (n - 1) * beat} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map((r, i) => {
        const at = start + i * beat;
        const k = easeOut(seg(t, at, at + 0.45));
        const d = easeOut(seg(t, at + 0.2, at + 0.55));
        const y = y0 + i * step;
        const last = i === n - 1;
        if (k <= 0) return null;
        return (
          <g key={r} opacity={k} transform={`translate(${((1 - k) * -44).toFixed(1)} 0)`}>
            <circle cx={29} cy={y - 5} r={11} fill={C.espresso} stroke={last ? C.caramel : C.mocha} strokeWidth={1.5} />
            <path d={`M23 ${y - 5} l4 4 l8 -9`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 * (1 - d)} />
            <T x={46} y={y} s={s} f={last ? C.caramel : C.crema}>{r}</T>
          </g>
        );
      })}
      <Reticle x={300} y={lastY - 5} w={576} h={36} t={t} at={Math.max(start + (n - 1) * beat + 0.3, end - 0.6)} />
    </Svg>
  );
}

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
  const lanes = [0, 1, 2, 3];
  const N = 24; // dots standing for the 200 tasks
  const spawn = seg(t, 0.4, 1.0);
  return (
    <Svg label="tasks_get_stolen.rs: every task is spawned onto one worker's queue, and idle workers steal them, so they run across three or four real threads" h={220}>
      <T x={30} y={26} s={14} f={C.crema} o={fa(t, 0.2, 0.3)}>200 tasks, one spawning worker</T>
      {lanes.map((i) => (
        <g key={i}>
          <T x={30} y={66 + i * 34} s={13} f={C.latte}>{i ? 'worker' : 'spawner'}</T>
          <line x1={120} y1={62 + i * 34} x2={570} y2={62 + i * 34} stroke={C.cocoa} strokeWidth={14} strokeLinecap="round" />
        </g>
      ))}
      {Array.from({ length: N }, (_, j) => {
        const born = spawn * N > j;
        if (!born) return null;
        const lane = j % 4;
        const k = easeInOut(seg(t, 1.1 + (j / N) * 0.6, 1.5 + (j / N) * 0.6));
        const x = lerp(130 + j * 18, 130 + Math.floor(j / 4) * 18, k);
        const y = lerp(62, 62 + lane * 34, k);
        return <circle key={j} cx={x} cy={y} r={5} fill={lane === 0 || k <= 0 ? C.crema : C.caramel} />;
      })}
      {easeOut(seg(t, 2.1, 2.4)) > 0.85 && <T x={570} y={210} s={13} a="end" f={C.latte}>ran across 3–4 real threads</T>}
      <T x={30} y={210} s={13} f={C.latte} o={fa(t, 1.9, 0.4)}>measured directly</T>
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
  const drop = easeOut(seg(t, 0.5, 0.8));
  const dy = (1 - drop) * -150;
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
      <g transform={`translate(0,${dy})`}>
        <circle cx={300} cy={62} r={5} fill={C.caramel} />
        <T x={312} y={67} s={11} f={C.latte}>woken task</T>
      </g>
      <Draw pts={[[300, 62], [220, 62]]} t={t} from={0.5} to={0.8} stroke={C.caramel} w={2} />
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
  const loop = easeInOut(seg(t, 0.5, 1.8));
  const sib = easeOutBack(seg(t, 1.85, 2.2));
  const align = easeOut(seg(t, 2.2, 2.6));
  const END = 520;
  return (
    <Svg label="unconstrained_starves_sibling.rs: with the budget off, the hot loop runs to the end, and the sibling finishes only at that same moment" h={220}>
      <T x={60} y={36} s={13} f={C.latte} o={fa(t, 0.2, 0.4)}>the budget, switched off entirely</T>
      <T x={60} y={72} s={13} f={C.taupe}>hot loop</T>
      <rect x={150} y={60} width={END - 150} height={16} rx={4} fill={C.cocoa} />
      <rect x={150} y={60} width={(END - 150) * loop} height={16} rx={4} fill={C.caramel} />
      <T x={60} y={122} s={13} f={C.taupe}>sibling</T>
      <circle cx={sib > 0 ? END : 150} cy={118} r={7} fill={sib > 0 ? C.caramel : 'none'} stroke={C.crema} strokeWidth={1.5} transform={sib > 0 ? `translate(${END} 118) scale(${sib.toFixed(3)}) translate(${-END} -118)` : undefined} />
      {sib <= 0 && <T x={170} y={122} s={13} f={C.latte}>waiting…</T>}
      <line x1={END} y1={50} x2={END} y2={lerp(50, 140, align)} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" opacity={align > 0 ? 1 : 0} />
      <T x={END} y={160} s={13} a="middle" f={C.crema} o={align}>same moment</T>
      <T x={60} y={200} s={13} f={C.crema} o={fa(t, 2.4, 0.4)}>both land within milliseconds of each other</T>
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
  return <RecapList t={t} end={3} label="recap: stealing, the lifo slot, and the budget" rows={rows} step={55}
      s={13}
    />;
}
