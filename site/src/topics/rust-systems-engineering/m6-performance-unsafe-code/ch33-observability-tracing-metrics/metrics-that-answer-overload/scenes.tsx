import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp, easeOutBack } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// Five real calls, a deliberately uneven real delay pattern, one real
// checkpoint while two are still running: a counter only ever counts
// what finished, a histogram built from finished work shares that
// blind spot, and only a gauge, read as a current value, can answer
// whether anything is genuinely backed up right now.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));
// ── Moves shared by this topic's measured, quoted and recap figures ─────────
/** Eased 0..1 from `a` over `d` seconds. */
const ez = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A caption line that slides in from the left on its beat; its marker draws itself (tick, cross) or grows (dot). */
function Line({ t, at, y, text, mark = 'dot', mf = C.caramel, f = C.crema }: { t: number; at: number; y: number; text: string; mark?: 'dot' | 'tick' | 'cross'; mf?: string; f?: string }) {
  const k = ez(t, at, 0.45);
  const m = ez(t, at + 0.2, 0.35);
  if (k <= 0) return null;
  return (
    <g opacity={k} transform={`translate(${(-28 * (1 - k)).toFixed(2)} 0)`}>
      {mark === 'dot' && <circle cx={30} cy={y - 5} r={5 * m} fill={mf} />}
      {mark === 'tick' && <path d={`M23 ${y - 5} l5 5 l10 -11`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - m)} />}
      {mark === 'cross' && <path d={`M24 ${y - 11} l12 12 M36 ${y - 11} l-12 12`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={34} strokeDashoffset={34 * (1 - m)} />}
      <T x={48} y={y} s={13} f={f}>
        {text}
      </T>
    </g>
  );
}

/**
 * A quoted source: the quote panel rises into place, a rule draws down its left edge, each quoted line slides in on
 * its beat, and the line that carries the point gets an underline drawn under it once the quote has landed.
 */
function Quote({ t, lines, y0 = 40, gap = 40, hot, at = 0.25, beat = 0.55 }: { t: number; lines: string[]; y0?: number; gap?: number; hot: number; at?: number; beat?: number }) {
  const k = ez(t, 0, 0.5);
  const top = y0 - 26;
  const bottom = y0 + (lines.length - 1) * gap + 16;
  const u = at + lines.length * beat;
  return (
    <g>
      <rect x={14} y={top + (1 - k) * 14} width={572} height={bottom - top} rx={6} fill={C.roast} opacity={k} />
      <Draw pts={[[26, top + 8], [26, bottom - 8]]} t={t} from={0.15} to={0.15 + beat * lines.length} stroke={C.taupe} w={2} pen={false} />
      {lines.map((l, i) => {
        const s = ez(t, at + i * beat, 0.45);
        return (
          <g key={l} opacity={s} transform={`translate(${(-22 * (1 - s)).toFixed(2)} 0)`}>
            <T x={42} y={y0 + i * gap} s={14} f={i === hot ? C.focus : C.crema} serif italic>
              {l}
            </T>
          </g>
        );
      })}
      <Draw pts={[[42, y0 + hot * gap + 8], [42 + Math.min(520, lines[hot].length * 7.2), y0 + hot * gap + 8]]} t={t} from={u} to={u + 0.5} stroke={C.focus} w={1.5} />
    </g>
  );
}

/**
 * The recap as a payoff: a spine draws down the left, each point's tick is drawn as the spine reaches it and the
 * point slides in beside it, and the last point, the one the topic stands on, is locked on once it lands.
 */
function RecapList({ t, rows, label, y0 = 50, gap = 58, h = 300 }: { t: number; rows: string[]; label: string; y0?: number; gap?: number; h?: number }) {
  const beat = 2.2 / rows.length;
  const at = (i: number) => 0.2 + i * beat;
  const last = rows.length - 1;
  return (
    <Svg label={label} h={h}>
      <Draw pts={[[30, y0 - 5], [30, y0 - 5 + last * gap]]} t={t} from={at(0)} to={at(last)} stroke={C.mocha} w={2} pen={false} />
      {rows.map((r, i) => {
        const k = ez(t, at(i), 0.45);
        const m = ez(t, at(i) + 0.1, 0.35);
        const y = y0 + i * gap;
        const f = i === last ? C.focus : C.caramel;
        return (
          <g key={r}>
            <circle cx={30} cy={y - 5} r={11 * m} fill={C.espresso} stroke={f} strokeWidth={1.5} opacity={m} />
            <path d={`M24 ${y - 5} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={20} strokeDashoffset={20 * (1 - m)} />
            <g opacity={k} transform={`translate(${(-24 * (1 - k)).toFixed(2)} 0)`}>
              <T x={52} y={y} s={13} f={i === last ? C.focus : C.crema} w={i === last ? 600 : 500}>
                {r}
              </T>
            </g>
          </g>
        );
      })}
      <Reticle x={300} y={y0 + last * gap - 5} w={576} h={38} t={t} at={at(last) + 0.45} />
    </Svg>
  );
}


// ── 1 · Does the counter answer "backed up right now" (predict) ────────
export function CounterPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="five real calls, three finished, two still running"
        lines={['counter.fetch_add(1) // only on completion', '// read right now: does it say anything is stuck?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the counter misses what's running ────────────────────────
// Five calls run on a timeline. The checkpoint line drops in: the three that already finished are ticked and the
// counter counts them up, one by one; the two still running stretch on past the line, pulsing, uncounted.
const CALLS = [
  { a: 60, b: 220 },
  { a: 90, b: 300 },
  { a: 140, b: 330 },
  { a: 250, b: 520 },
  { a: 300, b: 560 },
];
export function CounterReveal({ t }: StepCtx) {
  const cx = 360;
  const grow = (i: number) => easeOut(seg(t, 0.1 + i * 0.1, 0.9 + i * 0.1));
  const line = easeOutBack(seg(t, 1.0, 1.3));
  const counted = CALLS.filter((c, i) => c.b < cx && t > 1.4 + i * 0.2).length;
  return (
    <Svg label="metric_demo, captured" h={250}>
      {CALLS.map((c, i) => {
        const done = c.b < cx;
        const end = done ? lerp(c.a, c.b, grow(i)) : lerp(c.a, Math.min(c.b, cx + 40 + i * 30), grow(i)) + (t > 1.0 ? (Math.sin(t * 6 + i) + 1) * 6 : 0);
        return (
          <g key={i}>
            <rect x={c.a} y={24 + i * 24} width={Math.max(2, end - c.a)} height={12} rx={3} fill={done ? C.latte : C.second} />
            {done && <path d={`M${c.b + 8} ${30 + i * 24} l4 4 l8 -9`} fill="none" stroke={C.focus} strokeWidth={2} strokeDasharray={20} strokeDashoffset={20 * (1 - ez(t, 1.4 + i * 0.2, 0.2))} />}
          </g>
        );
      })}
      <line x1={cx} y1={lerp(-120, 14, clamp(line))} x2={cx} y2={lerp(10, 148, clamp(line))} stroke={C.focus} strokeWidth={2} strokeDasharray="5 4" />
      <T x={cx} y={168} s={13} a="middle" f={C.latte} o={ez(t, 1.1)}>checkpoint</T>
      <rect x={440} y={150} width={130} height={30} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 1.2)} />
      <T x={452} y={170} s={13} f={C.latte} o={ez(t, 1.2)}>counter</T>
      <T x={560} y={170} s={15} a="end" f={C.focus} w={600} o={ez(t, 1.4)}>{counted || ''}</T>
      <Line t={t} at={1.3} y={210} text="checkpoint: 3 calls finished, 2 still running" />
      <Line t={t} at={2.1} y={242} text="counter reads: 3, misses the other 2" mark="cross" mf={C.cherryText} />
    </Svg>
  );
}

// ── 3 · Does the histogram do any better (predict) ──────────────────────
export function HistogramPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the histogram, built from completed latencies only"
        lines={['completed_latencies_ms.push(delay_ms) // on completion too', '// same checkpoint: does it see the 2 still running?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the histogram shares the counter's blind spot (takeaway)
export function HistogramReveal({ t }: StepCtx) {
  const calls = [0, 1, 2, 3, 4];
  return (
    <Svg label="metric_demo, captured" h={210}>
      {calls.map((i) => {
        const finished = i < 3;
        const start = 0.15 + i * 0.08;
        const travel = easeOut(seg(t, start, start + 0.3));
        const x0 = 50 + i * 55;
        const y0 = 40;
        return finished ? (
          <g key={i}>
            <Draw pts={[[x0, y0], [x0, 95]]} t={t} from={start} to={start + 0.3} stroke={C.caramel} w={2} pen />
            <circle cx={x0} cy={y0 + travel * 55} r={5} fill={C.caramel} opacity={fa(t, start, 0.2)} />
          </g>
        ) : (
          <circle key={i} cx={x0} cy={y0} r={5} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={fa(t, start, 0.2)} />
        );
      })}
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={30} y={95} width={160} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={110} y={120} s={12} a="middle" f={C.mocha}>histogram length: 3</T>
      </g>
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>built from finished work, blind to the rest</T>
    </Svg>
  );
}

// ── 5 · Does the gauge answer it correctly (predict) ────────────────────
export function GaugePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the gauge, read as a current value, not a total"
        lines={['gauge.fetch_add(1) on start, fetch_sub(1) on finish', '// same checkpoint: does reading it now answer correctly?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the gauge correctly reads 2 in flight (takeaway) ──────
export function GaugeReveal({ t }: StepCtx) {
  const rise = easeOut(seg(t, 0.15, 0.45));
  const fall = easeOut(seg(t, 0.6, 0.9));
  const netUnits = 5 * rise - 3 * fall;
  const barH = Math.max(netUnits, 0) * 16;
  return (
    <Svg label="metric_demo, captured" h={210}>
      <T x={60} y={35} s={12} f={C.latte} o={fa(t, 0.1, 0.3)}>5 starts, then 3 finishes</T>
      <rect x={60} y={120 - barH} width={40} height={barH} fill={C.caramel} opacity={fa(t, 0.15, 0.2)} />
      <T x={115} y={105} s={13} f={C.crema} o={fa(t, 0.9, 0.3)}>gauge now: 2</T>
      <g opacity={fa(t, 1.1, 0.4)}>
        <rect x={30} y={135} width={160} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={110} y={160} s={12} a="middle" f={C.mocha}>gauge reads: 2, right now</T>
      </g>
      <T x={60} y={190} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>a current value, not a running total</T>
    </Svg>
  );
}

// ── 7 · Prometheus's own docs, quoted (connecting) ─────────────────────────
// The quote lands in the order the narration names the three shapes, and each one's own trace draws under it on
// that beat: the counter only ever climbs, the histogram drops observations into buckets, and the gauge, alone,
// goes up and down, locked on at the end as the one that answers a right-now question.
export function DocsReveal({ t }: StepCtx) {
  const step = (i: number) => [60 + i * 20, 220 - i * 8] as const;
  const counter = Array.from({ length: 7 }, (_, i) => step(i)).flatMap(([x, y], i, a) => (i < a.length - 1 ? [[x, y] as const, [a[i + 1][0], y] as const] : [[x, y] as const]));
  const gauge = Array.from({ length: 25 }, (_, i) => [420 + i * 6, 200 - Math.sin(i * 0.7) * 20 - Math.sin(i * 0.23) * 8] as const);
  const buckets = [0.5, 1, 0.7, 0.3];
  const hk = seg(t, 1.3, 1.9);
  return (
    <Svg label="Prometheus's own docs, quoted" h={260}>
      <Quote t={t} lines={['counter: can only increase', 'histogram: counts observations into buckets', 'gauge: can arbitrarily go up and down']} hot={2} y0={36} gap={34} beat={0.45} />
      <Draw pts={counter} t={t} from={0.8} to={1.4} stroke={C.latte} w={2} />
      <T x={110} y={250} s={13} a="middle" f={C.latte} o={ez(t, 0.8)}>counter</T>
      {buckets.map((b, i) => (
        <rect key={i} x={250 + i * 26} y={226 - 50 * b * easeOut(clamp(hk * 4 - i))} width={20} height={50 * b * easeOut(clamp(hk * 4 - i))} rx={2} fill={C.second} />
      ))}
      <T x={300} y={250} s={13} a="middle" f={C.second} o={ez(t, 1.3)}>histogram</T>
      <Draw pts={gauge} t={t} from={1.75} to={2.4} stroke={C.focus} w={2} />
      <T x={492} y={250} s={13} a="middle" f={C.focus} o={ez(t, 1.75)}>gauge</T>
      <Reticle x={492} y={198} w={170} h={66} t={t} at={2.45} />
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: the right shape for the right question"
      rows={['a counter only ever counts what finished', 'a histogram shares that identical blind spot', 'only a gauge, read right now, can answer']}
      gap={70}
      y0={60}
    />
  );
}
