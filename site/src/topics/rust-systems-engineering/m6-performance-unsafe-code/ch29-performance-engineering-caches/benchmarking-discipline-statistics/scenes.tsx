import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, clamp, easeOutBack } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C, Draw, Reticle, Plot } from '../../../../../reels/kit';

// A distribution's own p50 and p99 are genuinely separate statistics; a
// real change can genuinely improve one while genuinely regressing the
// other, and a single average alone genuinely hides that divergence.
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


// ── 1 · Does a lower average mean faster for everyone (predict, hook) ─────
export function AveragePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a benchmark's own average, down after a change"
        lines={['after_avg < before_avg;', '// means every real request got faster?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// The "before" samples from the example, sorted: a tight cluster at the typical latency and one slow request.
const SAMPLES = Array.from({ length: 20 }, (_, i) => (i < 19 ? 10 : 45));

// ── 2 · Measured: two separate numbers ─────────────────────────────────────
// The sorted samples rise as bars, one per beat, nineteen short ones and one tall one. A p50 marker then drops onto
// the middle of the run and a p99 marker climbs to the last bar: two different readings off the identical samples.
export function PercentileReveal({ t }: StepCtx) {
  const base = 120;
  const bx = (i: number) => 60 + i * 25;
  const p50 = easeOutBack(seg(t, 1.3, 1.7));
  const p99 = easeOutBack(seg(t, 1.9, 2.3));
  return (
    <Svg label="tail_latency_diverges_from_the_average.rs" h={250}>
      <line x1={40} y1={base} x2={570} y2={base} stroke={C.mocha} strokeWidth={1.5} />
      {SAMPLES.map((ms, i) => {
        const k = easeOut(seg(t, 0.1 + i * 0.05, 0.4 + i * 0.05));
        const h = ms * 1.9 * k;
        return <rect key={i} x={bx(i) - 8} y={base - h} width={16} height={Math.max(0, h)} rx={2} fill={i === 9 ? C.focus : i === 19 ? C.cherryText : C.latte} />;
      })}
      <g opacity={clamp(p50)} transform={`translate(0 ${((1 - clamp(p50)) * -20).toFixed(1)})`}>
        <path d={`M${bx(9) - 7} ${base - 34} h14 l-7 9 z`} fill={C.focus} />
        <T x={bx(9)} y={base - 42} s={13} a="middle" f={C.focus}>p50</T>
      </g>
      <g opacity={clamp(p99)} transform={`translate(0 ${((1 - clamp(p99)) * 30).toFixed(1)})`}>
        <path d={`M${bx(19) - 7} ${base - 100} h14 l-7 9 z`} fill={C.cherryText} />
        <T x={bx(19) - 14} y={base - 94} s={13} a="end" f={C.cherryText}>p99</T>
      </g>
      <Line t={t} at={1.4} y={170} text="p50: the typical real request, 10ms" />
      <Line t={t} at={2.0} y={210} text="p99: the real worst case, 45ms" mf={C.cherryText} />
    </Svg>
  );
}

// ── 3 · Does the median dropping mean the p99 drops too (predict) ─────────
export function MedianPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real change, the real median genuinely drops"
        lines={['after_p50 < before_p50;', '// means after_p99 < before_p99 too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: median improved, p99 regressed (takeaway) ───────────────
export function MedianReveal({ t }: StepCtx) {
  const before50 = easeOut(seg(t, 0.4, 0.65));
  const after50 = easeOut(seg(t, 0.4, 0.65));
  const before99 = easeOut(seg(t, 0.85, 1.1));
  const after99 = easeOut(seg(t, 0.85, 1.1));
  return (
    <Svg label="tail_latency_diverges_from_the_average.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>p50: 10ms down to 8ms, genuinely faster</T>
      <T x={60} y={70} s={11} f={C.latte} o={fa(t, 0.35, 0.3)}>p50 before/after</T>
      <rect x={150} y={64} width={before50 * 100} height={10} rx={2} fill={C.taupe} />
      <rect x={150} y={76} width={after50 * 80} height={10} rx={2} fill={C.caramel} />
      <T x={60} y={105} s={11} f={C.latte} o={fa(t, 0.85, 0.3)}>p99 before/after</T>
      <rect x={150} y={99} width={before99 * 180} height={10} rx={2} fill={C.caramel} />
      <rect x={150} y={111} width={after99 * 220} height={10} rx={2} fill={C.cherry} opacity={0.85} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={140} s={13} a="middle" f={C.mocha}>p99: 45ms up to 55ms, genuinely slower</T>}
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>a median alone cannot show the real tail</T>
    </Svg>
  );
}

// ── 5 · Does the average show the real p99 regression (predict) ──────────
export function AverageDoesItPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical change, the real average instead"
        lines={['after_avg < before_avg;', '// does this still show the p99 regression?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the average hides the tail ───────────────────────────────
// Before and after, side by side. The average bars shrink from before to after: the change looks like a win. Then
// the p99 bars rise beside them, and the after one climbs past the before one, red, locked on: the tail got worse.
export function AverageHidesReveal({ t }: StepCtx) {
  const base = 130;
  const k = 3.2;
  const avg = easeOut(seg(t, 0.2, 0.7));
  const p99 = easeOut(seg(t, 0.9, 1.5));
  const bars = [
    { x: 90, h: 11.75 * k * 2 * avg, f: C.latte, label: 'before' },
    { x: 180, h: 10.35 * k * 2 * avg, f: C.caramel, label: 'after' },
    { x: 350, h: 45 * k * 0.6 * p99, f: C.latte, label: 'before ' },
    { x: 440, h: 55 * k * 0.6 * p99, f: C.cherryText, label: 'after ' },
  ];
  return (
    <Svg label="tail_latency_diverges_from_the_average.rs" h={250}>
      <line x1={40} y1={base} x2={560} y2={base} stroke={C.mocha} strokeWidth={1.5} />
      {bars.map((b) => (
        <g key={b.label}>
          <rect x={b.x - 22} y={base - b.h} width={44} height={Math.max(0, b.h)} rx={3} fill={b.f} />
          <T x={b.x} y={base + 20} s={13} a="middle" f={C.latte} o={ez(t, 0.1)}>
            {b.label}
          </T>
        </g>
      ))}
      <T x={135} y={base - 90} s={13} a="middle" f={C.crema} o={ez(t, 0.1)}>average</T>
      <T x={300} y={base - 100} s={13} a="end" f={C.crema} o={ez(t, 0.8)}>p99</T>
      <Reticle x={440} y={base - 55 * k * 0.3} w={60} h={55 * k * 0.6 + 10} t={t} at={1.7} color={C.cherryText} />
      <Line t={t} at={0.4} y={180} text="avg: 11.75ms down to 10.35ms, improved too" mark="tick" />
      <Line t={t} at={1.3} y={210} text="yet the real p99 regressed, 45 to 55" mark="cross" mf={C.cherryText} />
      <Line t={t} at={1.9} y={240} text="one average can hide a real tail cost" />
    </Svg>
  );
}

// ── 7 · Two sources agree (connecting) ─────────────────────────────────────
// The quote lands; under it, samples stream in over time. The first few, still warming up, are bracketed and set
// aside; the steady run settles; then the one slow request in the tail is ringed: the thing an uncorrected,
// averaged sample would have hidden.
export function DocsReveal({ t }: StepCtx) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const y = i < 3 ? 140 - (3 - i) * 12 : i === 12 ? 128 : 172;
    return [70 + i * 30, y] as const;
  });
  const warm = ez(t, 1.6, 0.3);
  return (
    <Svg label="Criterion.rs Docs / HdrHistogram README, quoted" h={220}>
      <Quote t={t} lines={['warmup, then outlier classification, first', 'an uncorrected sample hides its own slow tail']} hot={1} y0={40} gap={38} beat={0.45} />
      <g opacity={1 - 0.6 * warm}>
        <Plot pts={pts.slice(0, 3)} t={t} start={0.7} beat={0.06} r={5} fill={C.latte} />
      </g>
      <Plot pts={pts.slice(3)} t={t} start={0.9} beat={0.05} r={5} fill={C.crema} />
      <Draw pts={[[60, 186], [60, 194], [140, 194], [140, 186]]} t={t} from={1.6} to={1.9} stroke={C.taupe} w={1.5} pen={false} />
      <T x={150} y={198} s={13} f={C.taupe} o={warm}>warmup</T>
      <circle cx={pts[12][0]} cy={pts[12][1]} r={12} fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray={76} strokeDashoffset={76 * (1 - ez(t, 2.1, 0.4))} />
      <T x={pts[12][0] + 18} y={pts[12][1] + 5} s={13} f={C.cherryText} o={ez(t, 2.2)}>slow tail</T>
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a real latency distribution, measured"
      rows={['p50 and p99 are two separate real statistics', 'a median and the real tail can move apart', 'an average alone can hide what the tail does']}
      gap={70}
      y0={60}
    />
  );
}
