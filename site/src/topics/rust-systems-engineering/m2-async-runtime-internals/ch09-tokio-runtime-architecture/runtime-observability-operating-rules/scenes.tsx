import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Decode, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// Semaphore saturation, runtime-metrics backlog, and bounded-channel backpressure, each
// measured directly; tokio-console named from the crate's own words, closing the chapter.
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
  const N = 20;
  const slots = [0, 1, 2, 3];
  const flow = (i: number) => easeInOut(seg(t, 0.6 + i * 0.15, 1.0 + i * 0.15));
  const avail = 4 - slots.filter((i) => flow(i) >= 1).length;
  return (
    <Svg label="semaphore_bounds_concurrency.rs: twenty tasks queue for four permits; four take them, the semaphore reads 0 available, and the other sixteen wait" h={220}>
      <T x={30} y={30} s={14} f={C.crema} o={fa(t, 0.2, 0.3)}>20 tasks, 4 permits</T>
      {Array.from({ length: N }, (_, j) => {
        const isRunner = j < 4;
        const k = isRunner ? flow(j) : 0;
        const qx = 40 + (j % 10) * 22;
        const qy = 70 + Math.floor(j / 10) * 26;
        const sx = 400 + j * 36;
        const wait = !isRunner && t > 1.5 ? Math.sin(t * 9 + j) * 1.5 : 0;
        return <circle key={j} cx={lerp(qx, sx, k)} cy={lerp(qy, 84, k) + wait} r={7} fill={isRunner && k >= 1 ? C.caramel : C.latte} opacity={fa(t, 0.2 + j * 0.01, 0.3)} />;
      })}
      {slots.map((i) => (
        <circle key={i} cx={400 + i * 36} cy={84} r={12} fill="none" stroke={flow(i) >= 1 ? C.caramel : C.mocha} strokeWidth={1.5} />
      ))}
      <T x={454} y={56} s={13} a="middle" f={C.latte}>permits</T>
      <T x={454} y={128} s={14} a="middle" f={avail === 0 ? C.caramel : C.crema} w={700}>{`available: ${avail}`}</T>
      <T x={150} y={150} s={13} a="middle" f={C.latte} o={fa(t, 1.5, 0.3)}>the rest wait</T>
      <T x={30} y={196} s={13} f={C.latte} o={fa(t, 1.9, 0.4)}>never more than 4 running at once</T>
      <Reticle x={454} y={122} w={150} h={30} t={t} at={1.9} />
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
  const grow = easeOut(seg(t, 0.9, 1.3));
  const w = grow * 220;
  return (
    <Svg label="global_queue_depth_reveals_backlog.rs: a real backlog" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>one worker, 500 tasks</T>
      <rect x={60} y={85} width={w} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {grow > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>queued: 240</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>read straight from the runtime's own metrics</T>
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
  const m1 = easeInOut(seg(t, 0.4, 0.8)); // the first send fills the one slot
  const m2 = easeInOut(seg(t, 0.9, 1.25)); // the second hits a full channel
  const refuse = easeOutBack(seg(t, 1.25, 1.55));
  const recv = easeInOut(seg(t, 1.7, 2.0)); // the pending message is read out
  const m3 = easeInOut(seg(t, 2.05, 2.4)); // and the third goes straight in
  const SX = 300;
  return (
    <Svg label="bounded_channel_applies_backpressure.rs: one slot; the first send fills it, the second is refused, the receiver reads one out, and the third send goes through" h={210}>
      <T x={30} y={30} s={14} f={C.crema} o={fa(t, 0.2, 0.3)}>one slot, two sends</T>
      <T x={60} y={124} s={13} a="middle" f={C.latte}>sender</T>
      <T x={540} y={124} s={13} a="middle" f={C.latte}>receiver</T>
      <rect x={SX - 30} y={70} width={60} height={40} rx={7} fill="none" stroke={C.crema} strokeWidth={2} />
      <line x1={90} y1={90} x2={SX - 30} y2={90} stroke={C.mocha} strokeWidth={1.5} />
      <line x1={SX + 30} y1={90} x2={510} y2={90} stroke={C.mocha} strokeWidth={1.5} />
      {m1 > 0 && <rect x={lerp(60, SX, m1) + recv * (540 - SX) - 14} y={78} width={28} height={24} rx={5} fill={C.crema} opacity={1 - Math.max(0, recv - 0.8) * 5} />}
      {m2 > 0 && <rect x={lerp(60, SX - 60, m2) - refuse * 110 - 14} y={78 + refuse * 40} width={28} height={24} rx={5} fill={refuse > 0 ? C.cherryText : C.latte} />}
      <T x={150} y={164} s={13} a="middle" f={C.cherryText} o={refuse}>second send: refused</T>
      {m3 > 0 && <rect x={lerp(60, SX, m3) - 14} y={78} width={28} height={24} rx={5} fill={C.caramel} />}
      <T x={SX} y={140} s={14} a="middle" f={C.caramel} o={easeOut(seg(t, 2.4, 2.6))}>3</T>
      <T x={30} y={198} s={13} f={C.latte} o={fa(t, 2.3, 0.4)}>a third goes through once a slot frees up</T>
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
  const app = easeOut(seg(t, 0.4, 0.8));
  const words = ['tasks', 'resources', 'operations'];
  const targets: [number, number][] = [[110, 60], [180, 110], [110, 150]];
  const spin = t * 2.2;
  return (
    <Stack>
      <Code title="console-subscriber docs: what it collects" lines={['// diagnostic data on tasks, resources,', '// and operations in a running application']} t={t} start={0.1} end={0.5} highlight={t > 0.9 ? [0, 1] : []} />
      <Svg label="tokio-console's three probes reach into a running application: its tasks, its resources such as a semaphore, and its operations such as a channel send" h={190} fill>
        <g opacity={app}>
          <rect x={30} y={24} width={250} height={150} rx={12} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={44} y={18} s={13} f={C.latte}>running application</T>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={80 + i * 26 + Math.sin(spin + i) * 3} cy={60} r={7} fill={C.crema} />
          ))}
          <rect x={150} y={94} width={90} height={32} rx={6} fill={C.cocoa} stroke={C.crema} />
          <T x={195} y={115} s={12} a="middle" f={C.crema}>Semaphore</T>
          <line x1={60} y1={150} x2={160} y2={150} stroke={C.latte} strokeWidth={1.5} />
          <circle cx={60 + ((t * 0.8) % 1) * 100} cy={150} r={5} fill={C.caramel} />
        </g>
        <rect x={400} y={24} width={180} height={150} rx={12} fill={C.panel} stroke={C.crema} strokeWidth={1.5} opacity={app} />
        <T x={414} y={18} s={13} f={C.latte} o={app}>tokio-console</T>
        {words.map((w, i) => {
          const at = 1.0 + i * 0.35;
          const k = easeInOut(seg(t, at, at + 0.35));
          const [tx, ty] = targets[i];
          return (
            <g key={w}>
              {k > 0 && <line x1={400} y1={60 + i * 45} x2={lerp(400, tx + 30, k)} y2={lerp(60 + i * 45, ty, k)} stroke={C.cinnamon} strokeWidth={1.5} strokeDasharray="4 3" />}
              {t >= at + 0.3 && <Decode text={w} x={420} y={65 + i * 45} s={14} f={C.cinnamon} t={t} at={at + 0.3} dur={0.35} />}
            </g>
          );
        })}
      </Svg>
    </Stack>
  );
}

// ── 9 · The chapter's rules, named again (takeaway, moved off step 2) ───────────────────────────
export function RulesReveal({ t }: StepCtx) {
  const rows = ['small enough to yield — cooperative budgeting', 'bounded concurrency — a Semaphore, measured', 'bounded channels — enforced, not aspirational', 'cancellation, defined explicitly'];
  return <RecapList t={t} end={2.8} label="this chapter's operating rules, each one earned" rows={rows} step={48} s={13} />;
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    "a Semaphore's permits really run out",
    'runtime metrics report a real backlog, not a guess',
    'a bounded channel really refuses a send once full',
    'tokio-console turns all of this into a live view',
  ];
  return <RecapList t={t} end={3} label="recap: three real caps, and a live view of them" rows={rows} step={55} s={14} />;
}
