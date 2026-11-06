import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Warm-up and steady-state measurement, drawn from examples.py run for real on this sandbox's Postgres: trial 1's 60
// order-lookup latencies straight after a cold restart, the detector's own rule (window 8, change under 12%, three in
// a row), and the five trials' steady-state and cold means with their 95% interval. These are this machine's
// timings, so every one is drawn as shape and position only; no millisecond value appears on screen.

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** A plain box with a centred label. */
const Box = ({
  x,
  y,
  w,
  h = 32,
  label,
  lit = false,
  o = 1,
  dash,
  stroke,
  f,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  lit?: boolean;
  o?: number;
  dash?: string;
  stroke?: string;
  f?: string;
  fill?: string;
}) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

/** A label-left / value-right line under a drawing. */
const Line2 = ({ y, l, r, o, rc = C.focus, lc = C.secondary, lx = 30 }: { y: number; l: string; r: string; o: number; rc?: string; lc?: string; lx?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <T x={lx} y={y} s={14} f={lc}>
        {l}
      </T>
      <T x={575} y={y} s={14} f={rc} a="end">
        {r}
      </T>
    </g>
  );

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

// examples.py run on this sandbox's Postgres (seed 42): trial 1's 60 order-lookup latencies in ms, straight after a
// cold restart. Drawn as shape only: these are this machine's timings, so no millisecond value is printed anywhere.
const LAT = [
  1.945, 0.642, 0.479, 0.488, 0.391, 0.284, 0.319, 0.326, 0.338, 0.285, 0.286, 0.292, 0.303, 0.243, 0.199, 0.189, 0.204, 0.203, 0.181, 0.156, 0.173, 0.154, 0.18, 0.141, 0.155, 0.147, 0.13, 0.17,
  0.151, 0.15, 0.123, 0.128, 0.142, 0.147, 0.168, 0.197, 0.16, 0.159, 0.148, 0.145, 0.15, 0.14, 0.134, 0.131, 0.129, 0.127, 0.167, 0.162, 0.19, 0.187, 0.145, 0.136, 0.135, 0.132, 0.14, 0.139, 0.149,
  0.135, 0.127, 0.135,
];
// detect_steady_state(): window 8, relative change < 0.12 for 3 windows in a row; on trial 1 it fires at index 9
// (windows 2, 3 and 4 change by 0.109, 0.066, 0.072 after window 1's 0.33).
const STEADY = 9;
// Steady-state means and cold first-window means of the 5 trials (each its own restart).
const HOT = [0.167, 0.186, 0.178, 0.277, 0.314];
const COLD = [0.609, 0.444, 0.539, 0.695, 0.617];
// 95% CI over HOT: mean 0.224, margin 1.96 × stdev / √5 = 0.058.
const HOT_MEAN = 0.2244;
const HOT_MARGIN = 0.0583;

/** Trial 1's latencies as bars from x0, `bw` apart, base y0, `top` = the ms value drawn full height `H`; the first bar
 *  is clipped with a break mark. `n` bars are shown; `col(i)` colours each. */
const Bars = ({ x0, y0, bw, H, top = 0.7, n = LAT.length, col }: { x0: number; y0: number; bw: number; H: number; top?: number; n?: number; col: (i: number) => string }) => (
  <g>
    {LAT.slice(0, n).map((v, i) => {
      const h = Math.min(1, v / top) * H;
      return <rect key={i} x={x0 + i * bw} y={y0 - h} width={bw - 2} height={h} fill={col(i)} />;
    })}
    {n > 0 && LAT[0] > top && <path d={`M${x0 - 2} ${y0 - H + 6} l${bw / 2} -4 l${bw / 2} 4`} fill="none" stroke={C.ink} strokeWidth={2} />}
  </g>
);

// 0 · Two timelines from the moment the service comes up. Engineer A measures at once — over the first, tall
// requests. Engineer B waits, a grey span, then measures the short ones. Their reported numbers stand side by side,
// far apart; beside them a bracket half that size: an ordinary day against a bad one.
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.8, 1.3));
  const b = easeOut(seg(t, 1.3, 1.8));
  const gap = easeOut(seg(t, 2.2, 2.7));
  return (
    <Svg label="two engineers benchmark the same query and report numbers twice as far apart as a good day versus a bad one." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={25} y1={30} x2={25} y2={160} stroke={C.focus} strokeWidth={1.6} />
        <T x={25} y={20} s={11} f={C.quiet}>
          service up
        </T>
        <Bars x0={30} y0={90} bw={5} H={50} col={(i) => (i < 8 ? C.primary : C.line)} />
        <Bars x0={30} y0={160} bw={5} H={50} col={(i) => (i >= 20 && i < 40 ? C.primary : C.line)} />
      </g>
      <g opacity={a}>
        <rect x={29} y={34} width={40} height={60} fill="none" stroke={C.badText} strokeWidth={1.3} />
        <T x={75} y={44} s={12} f={C.badText}>
          A: from the start
        </T>
      </g>
      <g opacity={b}>
        <rect x={30} y={146} width={100} height={8} fill={C.line} opacity={0.5} />
        <rect x={129} y={104} width={100} height={60} fill="none" stroke={C.second} strokeWidth={1.3} />
        <T x={235} y={120} s={12} f={C.second}>
          B: waited first
        </T>
      </g>
      <g opacity={easeOut(seg(t, 1.8, 2.2))}>
        <line x1={420} y1={170} x2={520} y2={170} stroke={C.line} />
        <rect x={430} y={170 - 130} width={30} height={130} fill={C.badText} opacity={0.7} />
        <rect x={480} y={170 - 38} width={30} height={38} fill={C.second} />
        <T x={445} y={188} s={12} f={C.badText} a="middle">
          A
        </T>
        <T x={495} y={188} s={12} f={C.second} a="middle">
          B
        </T>
      </g>
      <g opacity={gap}>
        <line x1={535} y1={40} x2={535} y2={132} stroke={C.focus} strokeWidth={1.3} />
        <line x1={555} y1={86} x2={555} y2={132} stroke={C.secondary} strokeWidth={1.3} />
        <T x={575} y={26} s={11} f={C.secondary} a="end">
          good vs bad day
        </T>
      </g>
    </Svg>
  );
}

// 1 · A freshly started service with two empty gauges: buffer pool, page cache. "Who's closer?" After the answer the
// gauges fill as the early requests pass through, and B gets the ✓: the one who waited.
export function PredictWhoseNumber({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const fill = on ? easeInOut(seg(s, 0.3, 1.5)) : 0;
  return (
    <Svg label="whose number is closer to a real, long-running deployment?" h={180}>
      {['buffer pool', 'page cache'].map((l, i) => (
        <g key={l} opacity={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))}>
          <T x={25} y={40 + i * 50} s={12} f={C.secondary}>
            {l}
          </T>
          <rect x={150} y={26 + i * 50} width={250} height={20} rx={3} fill="none" stroke={C.line} strokeWidth={1.2} />
          <rect x={150} y={26 + i * 50} width={250 * fill * (i === 0 ? 1 : 0.9)} height={20} rx={3} fill={C.second} opacity={0.6} />
          <T x={410} y={41 + i * 50} s={12} f={on ? C.second : C.quiet} o={1}>
            {on && fill >= 1 ? 'warm' : 'empty'}
          </T>
        </g>
      ))}
      <T x={575} y={150} s={13} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 1.0, 1.4))}>
        who's closer: A or B?
      </T>
      {on && (
        <g opacity={easeOut(seg(s, 1.6, 2.0))}>
          <Tick x={30} y={146} k={1} />
          <T x={45} y={150} s={13} f={C.focus}>
            B, who waited for this
          </T>
        </g>
      )}
    </Svg>
  );
}

// 2 · The five named causes arrive one by one, each with a small mark. Then two of them — the buffer pool and page
// cache, and the empty caches — get a blue "here" tag: the two this sandbox reproduces for real.
export function RevealWarmupCauses({ t }: StepCtx) {
  const causes = ['compiler still warming up', 'buffer pool, page cache empty', 'caches never asked yet', 'background cleanup piling up', 'small files not merged'];
  const tag = easeOutBack(seg(t, 3.3, 3.8));
  return (
    <Svg label="five named causes of why the first minutes of a benchmark lie." h={260}>
      {causes.map((c, i) => {
        const y = 30 + i * 44;
        const real = i === 1 || i === 2;
        return (
          <g key={c} opacity={easeOut(seg(t, 0.5 + i * 0.45, 0.8 + i * 0.45))}>
            <rect x={25} y={y - 14} width={18} height={18} rx={3} fill="none" stroke={real && tag > 0.5 ? C.second : C.line} strokeWidth={1.3} />
            <T x={34} y={y} s={11} f={C.secondary} a="middle">
              {`${i + 1}`}
            </T>
            <T x={55} y={y} s={13} f={C.primary}>
              {c}
            </T>
            {real && (
              <g opacity={Math.min(1, tag)}>
                <rect x={480} y={y - 15} width={95} height={20} rx={10} fill="none" stroke={C.second} strokeWidth={1.3} />
                <T x={527} y={y} s={11} f={C.second} a="middle">
                  real, here
                </T>
              </g>
            )}
          </g>
        );
      })}
      <T x={575} y={250} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 3.6, 4.0))}>
        two of five, reproduced
      </T>
    </Svg>
  );
}

// 3 · A restart: the buffer pool and the OS cache beneath it drain empty. Then trial 1's order lookups plot one by one
// from the cold start — the first handful standing tall, the rest settling low.
export function RevealColdCacheReproduced({ t }: StepCtx) {
  const drain = easeInOut(seg(t, 0.3, 1.0));
  const n = Math.floor(seg(t, 1.3, 3.6) * LAT.length);
  return (
    <Svg label="the shop's order-lookup query, measured from a cold Postgres restart." h={220}>
      {['buffer pool', 'OS page cache'].map((l, i) => (
        <g key={l} opacity={easeOut(seg(t, 0, 0.3))}>
          <rect x={25 + i * 140} y={18} width={120} height={22} rx={3} fill="none" stroke={C.line} strokeWidth={1.2} />
          <rect x={25 + i * 140} y={18} width={120 * (1 - drain)} height={22} rx={3} fill={C.second} opacity={0.5} />
          <T x={85 + i * 140} y={56} s={11} f={C.secondary} a="middle">
            {l}
          </T>
        </g>
      ))}
      <T x={575} y={34} s={12} f={C.badText} a="end" o={easeOut(seg(t, 0.2, 0.5))}>
        restart: both empty
      </T>
      <line x1={25} y1={190} x2={565} y2={190} stroke={C.line} />
      <Bars x0={25} y0={190} bw={9} H={110} n={n} col={(i) => (i < 8 ? C.badText : C.primary)} />
      <T x={25} y={210} s={12} f={C.badText} o={easeOut(seg(t, 1.8, 2.1))}>
        first requests: slower
      </T>
      <T x={575} y={210} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 3.4, 3.8))}>
        request order →
      </T>
    </Svg>
  );
}

// 4 · The same 60 bars. A bracket eight requests wide slides along; each window's mean drops as a dot. The change from
// the previous window shows red while it is 12% or more, blue once it falls under; three blue in a row and a flag
// plants at request index 9: steady state, declared from the data.
export function RevealSteadyStateDetection({ t }: StepCtx) {
  const W = 8;
  const bw = 9;
  const means = LAT.slice(0, LAT.length - W + 1).map((_, i) => LAT.slice(i, i + W).reduce((a, b) => a + b, 0) / W);
  const win = Math.min(6, Math.floor(seg(t, 0.6, 3.0) * 7));
  const flag = easeOutBack(seg(t, 3.1, 3.6));
  const Y = (v: number) => 190 - Math.min(1, v / 0.7) * 110;
  return (
    <Svg label="a sliding window of recent latency, marking where it stops moving." h={240}>
      <line x1={25} y1={190} x2={565} y2={190} stroke={C.line} />
      <Bars x0={25} y0={190} bw={bw} H={110} col={() => C.line} />
      <rect x={25 + win * bw - 1} y={70} width={W * bw} height={124} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {means.slice(0, win + 1).map((m, i) => {
        const ch = i === 0 ? 1 : Math.abs(m - means[i - 1]) / means[i - 1];
        return <circle key={i} cx={25 + i * bw + (W * bw) / 2} cy={Y(m)} r={3.5} fill={i === 0 ? C.focus : ch < 0.12 ? C.second : C.badText} />;
      })}
      <T x={575} y={30} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 0.3, 0.6))}>
        window 8, change under 12%, 3 in a row
      </T>
      <g opacity={Math.min(1, flag)}>
        <line x1={25 + STEADY * bw} y1={50} x2={25 + STEADY * bw} y2={194} stroke={C.second} strokeWidth={1.8} />
        <path d={`M${25 + STEADY * bw} 50 h40 l-8 8 l8 8 h-40 z`} fill={C.second} />
        <T x={25 + STEADY * bw + 50} y={64} s={12} f={C.second}>
          steady state
        </T>
      </g>
      <T x={25} y={216} s={12} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
        detected, not guessed
      </T>
    </Svg>
  );
}

// 5 · Five trials, each its own cold restart: their steady-state means drop onto one axis, one by one. Then the mean
// line, and the 95% interval bracket spreads around it.
export function RevealConfidenceIntervals({ t }: StepCtx) {
  const X = (v: number) => 60 + ((v - 0.1) / 0.25) * 480;
  const ci = easeInOut(seg(t, 2.6, 3.3));
  return (
    <Svg label="the same steady-state run, repeated, reported as an interval." h={220}>
      <line x1={50} y1={130} x2={560} y2={130} stroke={C.line} strokeWidth={1.2} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={560} y={150} s={11} f={C.quiet} a="end" o={easeOut(seg(t, 0, 0.3))}>
        slower →
      </T>
      {HOT.map((v, i) => {
        const k = easeOutBack(seg(t, 0.4 + i * 0.35, 0.8 + i * 0.35));
        return k <= 0 ? null : (
          <g key={i}>
            <circle cx={X(v)} cy={lerp(40, 130, Math.min(1, k))} r={6} fill={C.primary} />
            <T x={X(v)} y={lerp(30, 112, Math.min(1, k))} s={11} f={C.secondary} a="middle" o={Math.min(1, k)}>
              {`${i + 1}`}
            </T>
          </g>
        );
      })}
      <g opacity={ci}>
        <line x1={X(HOT_MEAN)} y1={90} x2={X(HOT_MEAN)} y2={160} stroke={C.focus} strokeWidth={1.6} />
        <path d={`M${X(HOT_MEAN - HOT_MARGIN * ci)} 172 v-8 H${X(HOT_MEAN + HOT_MARGIN * ci)} v8`} fill="none" stroke={C.second} strokeWidth={1.6} />
      </g>
      <T x={300} y={200} s={12} f={C.second} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        mean ± 95% interval, over 5 runs
      </T>
    </Svg>
  );
}

// 6 · Cold and hot as two labelled columns, each with its five trial dots. A third "blended" column tries to form between
// them, averaging both — and is struck: it answers neither question.
export function RevealColdHotTwoNumbers({ t }: StepCtx) {
  const Y = (v: number) => 180 - (v / 0.75) * 150;
  const blend = easeOut(seg(t, 2.4, 2.9));
  const cols: [string, number[], string, number][] = [
    ['cold', COLD, C.badText, 0.4],
    ['hot', HOT, C.second, 1.0],
  ];
  return (
    <Svg label="cold-cache and hot-cache, reported side by side, never blended." h={220}>
      <line x1={25} y1={180} x2={575} y2={180} stroke={C.line} />
      {cols.map(([l, vs, c, st], j) => {
        const x = j === 0 ? 130 : 470;
        return (
          <g key={l} opacity={easeOut(seg(t, st, st + 0.4))}>
            {vs.map((v, i) => (
              <circle key={i} cx={x - 24 + i * 12} cy={Y(v)} r={5} fill={c} />
            ))}
            <T x={x} y={202} s={13} f={c} a="middle">
              {l}
            </T>
            <T x={x} y={Y(Math.max(...vs)) - 14} s={11} f={C.quiet} a="middle">
              {j === 0 ? 'restarts constantly' : 'stays up for days'}
            </T>
          </g>
        );
      })}
      <g opacity={blend * (1 - 0.5 * easeOut(seg(t, 3.0, 3.3)))}>
        <circle cx={300} cy={Y((0.5808 + HOT_MEAN) / 2)} r={7} fill={C.primary} />
        <T x={300} y={202} s={13} f={C.secondary} a="middle">
          blended
        </T>
      </g>
      <Cross x={300} y={Y((0.5808 + HOT_MEAN) / 2)} k={easeOut(seg(t, 3.0, 3.3))} />
    </Svg>
  );
}

// 7 · Four lines with their pictures: the tall first bars, the flag planting, five dots under an interval, two columns
// never merged.
export function Recap({ t }: StepCtx) {
  const L: [string, string][] = [
    ['the first minutes', 'lie, for named reasons'],
    ['steady state', 'detected from the data'],
    ['repeated runs', 'an interval, not one number'],
    ['cold and hot', 'two labelled results, never blended'],
  ];
  const k = (i: number) => easeOut(seg(t, 0.3 + i * 0.9, 0.7 + i * 0.9));
  return (
    <Svg label="the first minutes lie. Discard them, detect steady state, repeat, and report both numbers honestly." h={300}>
      {L.map(([a, b], i) => (
        <g key={a} opacity={k(i)}>
          <T x={25} y={40 + i * 70} s={13} f={C.secondary}>
            {a}
          </T>
          <T x={25} y={62 + i * 70} s={13} f={C.primary}>
            {b}
          </T>
        </g>
      ))}
      <g opacity={k(0)}>
        <Bars x0={470} y0={66} bw={4} H={40} n={25} col={(i) => (i < 8 ? C.badText : C.primary)} />
      </g>
      <g opacity={k(1)}>
        <line x1={470} y1={136} x2={570} y2={136} stroke={C.line} />
        <line x1={500} y1={100} x2={500} y2={136} stroke={C.second} strokeWidth={1.6} />
        <path d={`M500 100 h${22 * easeOut(seg(t, 1.4, 1.8))} l-5 5 l5 5 h${-22 * easeOut(seg(t, 1.4, 1.8))} z`} fill={C.second} />
      </g>
      <g opacity={k(2)}>
        {HOT.map((v, i) => (
          <circle key={i} cx={470 + ((v - 0.1) / 0.25) * 100} cy={190} r={3.5} fill={C.primary} />
        ))}
        <path d={`M${470 + ((HOT_MEAN - HOT_MARGIN - 0.1) / 0.25) * 100} 204 v-5 H${470 + ((HOT_MEAN + HOT_MARGIN - 0.1) / 0.25) * 100} v5`} fill="none" stroke={C.second} strokeWidth={1.4} />
      </g>
      <g opacity={k(3)}>
        <rect x={480} y={238} width={22} height={34} fill={C.badText} opacity={0.7} />
        <rect x={540} y={260} width={22} height={12} fill={C.second} />
      </g>
    </Svg>
  );
}

// 8 · A vendor's card: one number. "What would you ask?" After the answer two questions appear beside it — warm-up
// discarded? repeated? — each with a red "not said". Then the card's number slides over the tall first bars of a cold
// trace: it may be measuring the system waking up.
export function ProveIt({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  return (
    <Svg label="a vendor reports one number, no mention of warm-up or trial count." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={25} y={20} width={180} height={80} rx={6} fill={C.panel} stroke={C.secondary} strokeWidth={1.3} />
        <T x={115} y={46} s={12} f={C.secondary} a="middle">
          vendor benchmark
        </T>
        <T x={115} y={80} s={20} f={C.focus} a="middle">
          one number
        </T>
      </g>
      <T x={575} y={60} s={13} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 1.0, 1.4))}>
        what would you ask?
      </T>
      {on &&
        ['warm-up discarded?', 'how many runs?'].map((q, i) => (
          <g key={q} opacity={easeOut(seg(s, 0.2 + i * 0.4, 0.5 + i * 0.4))}>
            <T x={240} y={46 + i * 36} s={13} f={C.primary}>
              {q}
            </T>
            <T x={575} y={46 + i * 36} s={12} f={C.badText} a="end">
              not said
            </T>
          </g>
        ))}
      {on && (
        <g opacity={easeOut(seg(s, 1.2, 1.6))}>
          <line x1={240} y1={180} x2={560} y2={180} stroke={C.line} />
          <Bars x0={240} y0={180} bw={8} H={60} n={40} col={(i) => (i < 8 ? C.badText : C.line)} />
          <rect x={239} y={116} width={64} height={68} fill="none" stroke={C.badText} strokeWidth={1.3} />
          <T x={25} y={150} s={12} f={C.badText} o={easeOut(seg(s, 1.7, 2.1))}>
            maybe the wake-up,
          </T>
          <T x={25} y={170} s={12} f={C.badText} o={easeOut(seg(s, 1.7, 2.1))}>
            not the running system
          </T>
        </g>
      )}
    </Svg>
  );
}
