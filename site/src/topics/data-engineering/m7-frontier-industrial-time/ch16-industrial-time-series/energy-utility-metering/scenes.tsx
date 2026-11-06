import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Energy and utility metering: a register as a climbing staircase, a rollover around a 100,000 track, a reset's
// bounded band, a swap split, power integrated as trapezoids against a flat average, and a priced allocation gap.

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

/** Quadratic ease-in. */
const easeIn = (x: number) => x * x;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

/** A whole number counted up by k, with thousands separators. */
const n0 = (v: number, k: number) => Math.round(v * k).toLocaleString('en-US');

// 1 · A week of daily totals draws as bars. Day six's bar shoots off the top of the chart (the swap day). Then day
// three's bar, already sitting at zero, shows the red ghost of the reset the old fix threw away.
const DAYS = [72, 66, 0, 70, 64, 999, 68];
export function Hook({ t }: StepCtx) {
  const ghost = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="a line's daily energy total reads a normal figure most days and an astronomical one on a meter-swap day — a prior fix had already silently deleted a real reset" h={200}>
      <line x1={50} y1={160} x2={560} y2={160} stroke={C.line} strokeWidth={1.2} opacity={easeOut(seg(t, 0, 0.3))} />
      {DAYS.map((h, i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.22, 0.7 + i * 0.22));
        const x = 70 + i * 70;
        if (h === 999) {
          const up = easeIn(seg(t, 1.6, 2.4));
          const top = Math.max(16, 160 - lerp(70, 300, up) * k);
          return (
            <g key={i}>
              {k > 0 && <rect x={x} y={top} width={40} height={160 - top} fill={up >= 1 ? C.badText : C.primary} />}
              {up >= 1 && <path d={`M${x + 20} 4 l-8 10 h16 z`} fill={C.badText} />}
              <T x={x + 20} y={180} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 2.4, 2.8))}>
                swap
              </T>
            </g>
          );
        }
        return k <= 0 ? null : <rect key={i} x={x} y={160 - h * k} width={40} height={h * k} fill={C.primary} />;
      })}
      {ghost > 0 && (
        <g opacity={ghost}>
          <rect x={210} y={92} width={40} height={68} fill="none" stroke={C.badText} strokeDasharray="4 3" strokeWidth={1.4} />
          <T x={230} y={180} s={13} f={C.badText} a="middle">
            0
          </T>
          <T x={230} y={82} s={13} f={C.badText} a="middle">
            reset, dropped
          </T>
        </g>
      )}
      <T x={300} y={198} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 4.0, 4.5))}>
        which of these can be fixed?
      </T>
    </Svg>
  );
}

// 2 · A register climbs as a staircase. Two readings get pinned and the gap between them is the consumption, drawn as
// a bracket. At the very end the staircase lurches down once: a "?" in red.
const STAIR: [number, number][] = [
  [50, 160],
  [110, 160],
  [110, 140],
  [170, 140],
  [170, 116],
  [230, 116],
  [230, 100],
  [290, 100],
  [290, 78],
  [350, 78],
  [350, 60],
  [410, 60],
  [410, 44],
  [470, 44],
];
export function RevealCumulative({ t }: StepCtx) {
  const pin = easeOut(seg(t, 2.0, 2.4));
  const br = easeInOut(seg(t, 2.4, 3.0));
  const drop = easeIn(seg(t, 3.6, 4.0));
  return (
    <Svg label="a meter's own reading only ever goes up; consumption is a difference of two readings, which works until the register stops simply counting up" h={200}>
      <T x={50} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        register: only climbs
      </T>
      <Draw pts={STAIR} t={t} from={0.2} to={1.9} stroke={C.focus} w={2} pen={false} />
      {pin > 0 && (
        <g opacity={pin}>
          <circle cx={170} cy={116} r={5} fill={C.focus} />
          <circle cx={350} cy={60} r={5} fill={C.focus} />
          <line x1={170} y1={116} x2={510} y2={116} stroke={C.line} strokeDasharray="3 3" />
          <line x1={350} y1={60} x2={510} y2={60} stroke={C.line} strokeDasharray="3 3" />
        </g>
      )}
      {br > 0 && <path d={`M505 116 h10 v${-56 * br} h-10`} fill="none" stroke={C.second} strokeWidth={1.8} />}
      <T x={300} y={186} s={14} f={C.second} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
        consumption = later − earlier
      </T>
      {drop > 0 && (
        <g>
          <line x1={470} y1={44} x2={490} y2={44} stroke={C.focus} strokeWidth={2} />
          <line x1={490} y1={44} x2={490} y2={44 + 110 * drop} stroke={C.badText} strokeWidth={2} />
          <T x={540} y={162} s={18} f={C.badText} a="middle" o={drop}>
            ?
          </T>
        </g>
      )}
    </Svg>
  );
}

// 3 · "later − earlier < 0" drops in. Before the answer it sits over one "?". After it, three branches fan out
// to three different events — rollover, reset, swap — each with its own repair.
export function PredictNegative({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const KIDS: [string, string][] = [
    ['rollover', 'add the width'],
    ['reset', 'bound it'],
    ['swap', 'split it'],
  ];
  return (
    <Svg label="a register's difference between two readings comes back negative — does that always mean the same failure happened?" h={200}>
      <Box x={150} y={20} w={300} h={34} label="later − earlier < 0" lit o={easeOutBack(seg(t, 0.2, 0.7))} stroke={C.badText} f={C.badText} />
      {!on ? (
        <T x={300} y={120} s={22} f={C.secondary} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
          one cause?
        </T>
      ) : (
        KIDS.map(([a, b], i) => {
          const k = easeOut(seg(s, 0.2 + i * 0.25, 0.6 + i * 0.25));
          const cx = 110 + i * 190;
          return (
            <g key={a} opacity={k}>
              <line x1={300} y1={54} x2={lerp(300, cx, k)} y2={lerp(54, 96, k)} stroke={C.line} strokeWidth={1.4} />
              <Box x={cx - 80} y={96} w={160} h={32} label={a} />
              <T x={cx} y={156} s={13} f={C.focus} a="middle">
                {b}
              </T>
            </g>
          );
        })
      )}
    </Svg>
  );
}

// 4 · The register as a 0–100,000 track. A marker sits at 99,200, runs to the end, wraps to 0 and on to 650. The two
// travelled pieces light up: 800 + 650 = 1,450, while the naive difference reads −98,550 in red.
const rx = (v: number) => 60 + (v / 100_000) * 480;
export function RevealRollover({ t }: StepCtx) {
  const run = seg(t, 0.6, 2.2);
  const a = Math.min(1, run * 2);
  const b = Math.max(0, run * 2 - 1);
  const mx = b > 0 ? rx(650 * b) : rx(99_200 + 800 * a);
  return (
    <Svg label="a register wraps at its own known, fixed width — knowing that width recovers the exact real consumption, with no uncertainty left" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={60} y={70} width={480} height={14} fill={C.band} />
        <T x={60} y={104} s={12} f={C.quiet} a="middle">
          0
        </T>
        <T x={540} y={104} s={12} f={C.quiet} a="middle">
          100,000
        </T>
        <T x={60} y={24} s={13} f={C.secondary}>
          register width: 100,000
        </T>
      </g>
      {a > 0 && <rect x={rx(99_200)} y={70} width={rx(99_200 + 800 * a) - rx(99_200)} height={14} fill={C.second} />}
      {b > 0 && <rect x={60} y={70} width={rx(650 * b) - 60} height={14} fill={C.second} />}
      {b > 0 && b < 0.15 && <path d="M540 64 C 560 44, 40 44, 60 64" fill="none" stroke={C.second} strokeDasharray="4 3" />}
      {run > 0 && <circle cx={mx} cy={77} r={6} fill={C.focus} />}
      <T x={40} y={148} s={14} f={C.secondary} o={easeOut(seg(t, 2.4, 2.8))}>
        naive: 650 − 99,200
      </T>
      <T x={560} y={148} s={15} f={C.badText} a="end" o={easeOut(seg(t, 2.4, 2.8))}>
        −98,550
      </T>
      <T x={40} y={184} s={14} f={C.secondary} o={easeOut(seg(t, 3.0, 3.4))}>
        800 + 650
      </T>
      <T x={540} y={184} s={15} f={C.focus} a="end" o={easeOut(seg(t, 3.0, 3.4))}>
        {n0(1450, easeOut(seg(t, 3.0, 3.8)))}
      </T>
      <Tick x={558} y={179} k={easeOut(seg(t, 3.8, 4.2))} />
    </Svg>
  );
}

// 5 · The register reads 5,000, then the device restarts (✕) and it reads 12. Over the lost hour a shaded band grows
// from zero up to the line's fastest known rate: a ceiling of 1,800 kWh, labelled as a bound, not a value.
export function RevealReset({ t }: StepCtx) {
  const fall = easeIn(seg(t, 0.8, 1.2));
  const band = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="a device restart drops the register near zero; the lost consumption has no recovering formula, only an upper bound from elapsed time and a known maximum rate" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={60} y1={150} x2={540} y2={150} stroke={C.line} />
        <T x={60} y={168} s={12} f={C.quiet}>
          last good reading
        </T>
        <T x={540} y={168} s={12} f={C.quiet} a="end">
          1 h later
        </T>
      </g>
      <Draw
        pts={[
          [60, 60],
          [200, 50],
        ]}
        t={t}
        from={0}
        to={0.6}
        stroke={C.focus}
        w={2}
        pen={false}
      />
      <T x={60} y={44} s={13} f={C.primary} o={easeOut(seg(t, 0.3, 0.6))}>
        5,000
      </T>
      {fall > 0 && <line x1={200} y1={50} x2={200} y2={50 + 96 * fall} stroke={C.badText} strokeWidth={2} />}
      <Cross x={200} y={50} k={easeOutBack(seg(t, 0.8, 1.1))} />
      <T x={214} y={142} s={13} f={C.primary} o={easeOut(seg(t, 1.2, 1.5))}>
        12
      </T>
      {band > 0 && (
        <g>
          <rect x={260} y={150 - 110 * band} width={280} height={110 * band} fill={C.bad} opacity={0.55} />
          <line x1={260} y1={40} x2={540} y2={40} stroke={C.badText} strokeDasharray="5 3" opacity={band} />
        </g>
      )}
      <T x={400} y={30} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        ceiling: 1 h × 1,800 kWh/h
      </T>
      <T x={400} y={100} s={15} f={C.primary} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        lost: 0 to 1,800 kWh
      </T>
      <T x={300} y={194} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.8, 4.3))}>
        a bound, never the value
      </T>
    </Svg>
  );
}

// 6 · The same lost hour reported two ways. The old fix stamps a flat, confident "0 kWh" and gets crossed out; the
// honest answer draws a range bar from 0 to 1,800 with open ends.
export function RevealOldFix({ t }: StepCtx) {
  const stamp = easeOutBack(seg(t, 0.4, 0.9));
  const range = easeInOut(seg(t, 1.6, 2.6));
  const ex = (v: number) => 220 + (v / 1800) * 320;
  return (
    <Svg label="the old fix drops a negative difference and reports zero; the honest bound reports a real, nonzero upper range for the same event" h={200}>
      <T x={40} y={60} s={14} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        old fix
      </T>
      {stamp > 0 && (
        <g opacity={Math.min(1, stamp)}>
          <circle cx={ex(0)} cy={55} r={6} fill={C.primary} />
          <T x={ex(0) + 16} y={60} s={15} f={C.primary}>
            0 kWh, for sure
          </T>
        </g>
      )}
      <Cross x={ex(0)} y={55} k={easeOutBack(seg(t, 3.0, 3.4))} />
      <T x={40} y={120} s={14} f={C.secondary} o={easeOut(seg(t, 1.2, 1.5))}>
        honest
      </T>
      {range > 0 && (
        <g>
          <line x1={ex(0)} y1={115} x2={ex(1800 * range)} y2={115} stroke={C.focus} strokeWidth={4} />
          <line x1={ex(0)} y1={105} x2={ex(0)} y2={125} stroke={C.focus} strokeWidth={2} />
          {range >= 1 && <line x1={ex(1800)} y1={105} x2={ex(1800)} y2={125} stroke={C.focus} strokeWidth={2} />}
        </g>
      )}
      <T x={ex(0)} y={146} s={13} f={C.primary} a="middle" o={easeOut(seg(t, 2.4, 2.8))}>
        0
      </T>
      <T x={ex(1800)} y={146} s={13} f={C.primary} a="middle" o={easeOut(seg(t, 2.4, 2.8))}>
        1,800
      </T>
      <T x={300} y={188} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 3.4, 3.9))}>
        a confident zero hides the loss
      </T>
    </Svg>
  );
}

// 7 · The old meter climbs to 42,300; a swap line drops; the new meter starts at 0 and climbs to 1,100. A straight
// diff arrow across the swap reads −41,200 (✕). Then the right side alone: 1,100 − 0 = 1,100, ticked.
const sy = (v: number) => 160 - (v / 45_000) * 130;
export function RevealSwap({ t }: StepCtx) {
  const diff = easeInOut(seg(t, 2.0, 2.6));
  return (
    <Svg label="diffing straight across a meter swap gives a nonsensical huge number; splitting the series at the swap gives the real consumption on each side" h={200}>
      <line x1={40} y1={160} x2={560} y2={160} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <Draw
        pts={[
          [40, sy(30_000)],
          [140, sy(36_000)],
          [240, sy(42_300)],
        ]}
        t={t}
        from={0.1}
        to={0.9}
        stroke={C.primary}
        w={2}
        pen={false}
      />
      <T x={236} y={sy(42_300) - 8} s={13} f={C.primary} a="end" o={easeOut(seg(t, 0.8, 1.1))}>
        old: 42,300
      </T>
      <line x1={300} y1={24} x2={300} y2={160} stroke={C.focus} strokeDasharray="5 4" opacity={easeOut(seg(t, 1.0, 1.3))} />
      <T x={300} y={18} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        swap
      </T>
      <Draw
        pts={[
          [300, sy(0)],
          [400, sy(500)],
          [500, sy(1_100)],
        ]}
        t={t}
        from={1.3}
        to={1.9}
        stroke={C.second}
        w={2}
        pen={false}
      />
      <T x={512} y={sy(1_100) + 4} s={13} f={C.second} o={easeOut(seg(t, 1.8, 2.1))}>
        1,100
      </T>
      {diff > 0 && <line x1={240} y1={sy(42_300)} x2={lerp(240, 492, diff)} y2={lerp(sy(42_300), sy(1_100) - 6, diff)} stroke={C.badText} strokeWidth={1.6} strokeDasharray="5 3" />}
      <T x={420} y={70} s={15} f={C.badText} o={easeOut(seg(t, 2.5, 2.9))}>
        −41,200
      </T>
      <Cross x={400} y={65} k={easeOutBack(seg(t, 2.8, 3.2))} />
      <T x={40} y={190} s={14} f={C.secondary} o={easeOut(seg(t, 3.4, 3.8))}>
        split: 1,100 − 0
      </T>
      <T x={540} y={190} s={15} f={C.second} a="end" o={easeOut(seg(t, 3.4, 3.8))}>
        1,100
      </T>
      <Tick x={558} y={185} k={easeOut(seg(t, 3.9, 4.3))} />
    </Svg>
  );
}

// 8 · Five power samples at 0, 0.25, 1, 1.5 and 2 h. The area under them fills as trapezoids and counts to 78.8 kWh.
// Then the same five values, spread as if evenly spaced, average to a flat 37 kW over 2 h: 74.0 kWh, in pale blue.
const PS: [number, number][] = [
  [0, 40],
  [0.25, 55],
  [1, 50],
  [1.5, 20],
  [2, 20],
];
const qx = (h: number) => 60 + h * 200;
const qy = (p: number) => 150 - p * 2;
export function RevealIntegration({ t }: StepCtx) {
  const area = easeInOut(seg(t, 0.8, 2.0));
  const avg = easeOut(seg(t, 2.6, 3.2));
  const edge = qx(2 * area);
  const poly = `M${qx(0)} 150 ` + PS.map(([h, p]) => `L${Math.min(qx(h), edge)} ${qy(p)}`).join(' ') + ` L${edge} 150 Z`;
  return (
    <Svg label="an irregularly-sampled power series, properly integrated into energy, against a naive unweighted average of the same readings multiplied by elapsed time" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={60} y1={150} x2={460} y2={150} stroke={C.line} />
        <T x={60} y={168} s={12} f={C.quiet} a="middle">
          0 h
        </T>
        <T x={460} y={168} s={12} f={C.quiet} a="middle">
          2 h
        </T>
      </g>
      {area > 0 && <path d={poly} fill={C.band} stroke="none" />}
      <Draw pts={PS.map(([h, p]) => [qx(h), qy(p)] as [number, number])} t={t} from={0.2} to={0.8} stroke={C.focus} w={2} pen={false} />
      {PS.map(([h, p], i) => (
        <circle key={i} cx={qx(h)} cy={qy(p)} r={4} fill={C.focus} opacity={easeOut(seg(t, 0.1 + i * 0.12, 0.3 + i * 0.12))} />
      ))}
      {avg > 0 && <rect x={qx(0)} y={qy(37)} width={(qx(2) - qx(0)) * avg} height={150 - qy(37)} fill="none" stroke={C.second} strokeWidth={1.6} strokeDasharray="5 3" />}
      <T x={575} y={56} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 1.6, 2.0))}>
        integrated
      </T>
      <T x={575} y={86} s={16} f={C.focus} a="end" o={easeOut(seg(t, 1.6, 2.0))}>
        {`${(78.8 * easeOut(seg(t, 1.6, 2.4))).toFixed(1)}`}
      </T>
      <T x={575} y={114} s={13} f={C.second} a="end" o={avg}>
        averaged
      </T>
      <T x={575} y={144} s={16} f={C.second} a="end" o={avg}>
        {`${(74 * easeOut(seg(t, 2.8, 3.6))).toFixed(1)}`}
      </T>
      <T x={280} y={192} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.6, 4.1))}>
        averaged = 37 kW × 2 h
      </T>
    </Svg>
  );
}

// 9 · The header meter's 3,000 kWh drops into two split bars. By running hours: L4 2,250 | L6 750. By good count:
// L4 2,000 | L6 1,000. A bracket spans the two L4 edges: 250 kWh, which prices out at 45.00.
const ax = (v: number) => 150 + (v / 3000) * 400;
export function RevealAllocation({ t }: StepCtx) {
  const h = easeInOut(seg(t, 0.8, 1.6));
  const c = easeInOut(seg(t, 1.6, 2.4));
  const gap = easeOut(seg(t, 2.8, 3.3));
  const bar = (y: number, l4: number, k: number) => (
    <g>
      <rect x={ax(0)} y={y} width={ax(l4 * k) - ax(0)} height={22} fill={C.primary} />
      <rect x={ax(l4 * k)} y={y} width={ax(3000) - ax(l4 * k)} height={22} fill={C.second} opacity={k} />
      <T x={ax(0) + 8} y={y + 16} s={13} f={C.ink} o={k}>
        {`L4 ${n0(l4, k)}`}
      </T>
    </g>
  );
  return (
    <Svg label="one header meter's total, allocated to one line by two different rules, with the gap between them converted into an actual currency spread" h={220}>
      <Box x={ax(0)} y={8} w={400} h={30} label="header meter · 3,000 kWh" o={easeOut(seg(t, 0, 0.4))} />
      <T x={30} y={78} s={13} f={C.secondary} o={h}>
        by hours
      </T>
      {h > 0 && bar(62, 2250, h)}
      <T x={30} y={128} s={13} f={C.secondary} o={c}>
        by count
      </T>
      {c > 0 && bar(112, 2000, c)}
      {gap > 0 && (
        <g opacity={gap}>
          <line x1={ax(2000)} y1={140} x2={ax(2000)} y2={150} stroke={C.badText} />
          <line x1={ax(2250)} y1={84} x2={ax(2250)} y2={150} stroke={C.badText} strokeDasharray="3 2" />
          <line x1={ax(2000)} y1={150} x2={ax(2250)} y2={150} stroke={C.badText} strokeWidth={2} />
        </g>
      )}
      <T x={30} y={180} s={14} f={C.secondary} o={easeOut(seg(t, 3.2, 3.6))}>
        spread: 250 kWh × 0.18
      </T>
      <T x={575} y={180} s={16} f={C.badText} a="end" o={easeOut(seg(t, 3.4, 3.8))}>
        {(45 * easeOut(seg(t, 3.4, 4.2))).toFixed(2)}
      </T>
      <T x={300} y={210} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 3.9, 4.4))}>
        currency units, for one line
      </T>
    </Svg>
  );
}

// 10 · Five rows, each with a glyph of its picture: three branches, a bounded band, a split staircase, a trapezoid
// against a flat average, and a priced gap.
const GLYPH = [
  (k: number) => (
    <g stroke={C.badText} strokeWidth={1.6}>
      <line x1={40} y1={-4} x2={lerp(40, 100, k)} y2={lerp(-4, -14, k)} />
      <line x1={40} y1={-4} x2={lerp(40, 100, k)} y2={-4} />
      <line x1={40} y1={-4} x2={lerp(40, 100, k)} y2={lerp(-4, 6, k)} />
    </g>
  ),
  (k: number) => <rect x={40} y={6 - 20 * k} width={60} height={20 * k} fill={C.bad} />,
  (k: number) => (
    <g>
      <path d="M30 6 L60 -12" stroke={C.primary} strokeWidth={1.8} />
      <line x1={66} y1={-16} x2={66} y2={8} stroke={C.focus} strokeDasharray="3 2" />
      <path d={`M72 6 L${lerp(72, 104, k)} ${lerp(6, -4, k)}`} stroke={C.second} strokeWidth={1.8} />
    </g>
  ),
  (k: number) => (
    <g>
      <path d="M30 6 L40 -12 L70 -10 L90 2 L104 2 L104 6 Z" fill={C.band} stroke={C.focus} strokeWidth={1.2} opacity={k} />
      <line x1={30} y1={-4} x2={104} y2={-4} stroke={C.second} strokeDasharray="3 2" />
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30} y={-10} width={60} height={8} fill={C.primary} />
      <rect x={30} y={0} width={lerp(60, 50, k)} height={8} fill={C.primary} />
      <line x1={80} y1={10} x2={90} y2={10} stroke={C.badText} strokeWidth={2} opacity={k} />
    </g>
  ),
];
export function Recap({ t }: StepCtx) {
  const rows = ['a negative diff: three causes', 'a reset: bounded, not zeroed', 'a swap: split, not diffed', 'power: integrated, not averaged', 'allocation: priced, 45.00'];
  return (
    <Svg label="three distinct ways a difference breaks, a bounded reset, a split swap, integration over averaging, and a costed allocation spread" h={260}>
      {rows.map((r, i) => {
        const a = 0.2 + i * 0.85;
        const o = easeOut(seg(t, a, a + 0.4));
        const k = easeOut(seg(t, a + 0.2, a + 0.8));
        return o <= 0 ? null : (
          <g key={r} opacity={o} transform={`translate(${lerp(-12, 0, o)} ${44 + i * 46})`}>
            {GLYPH[i](k)}
            <T x={130} y={2} s={14} f={i === 4 ? C.focus : C.primary}>
              {r}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 11 · The measured 3,000 kWh sits fixed at the top. A rule switch flips between hours and count. Before the answer the
// per-unit figure is a "?"; after it, both figures land side by side — 0.5625 and 0.5000 kWh per good unit.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const flip = on ? 0.5 + 0.5 * Math.sin(s * 3) : 0.5 + 0.5 * Math.sin(t * 3);
  return (
    <Svg label="a sustainability report needs one energy-per-good-unit figure for a shared-header-meter line — does the allocation rule change the reported number?" h={200}>
      <Box x={150} y={14} w={300} h={30} label="measured: 3,000 kWh" o={easeOut(seg(t, 0, 0.4))} />
      <g opacity={easeOut(seg(t, 0.4, 0.8))}>
        <T x={200} y={86} s={13} f={flip < 0.5 ? C.focus : C.quiet} a="end">
          hours
        </T>
        <rect x={214} y={72} width={56} height={20} rx={10} fill={C.panel} stroke={C.line} />
        <circle cx={lerp(224, 260, flip)} cy={82} r={7} fill={C.focus} />
        <T x={284} y={86} s={13} f={flip >= 0.5 ? C.focus : C.quiet}>
          count
        </T>
      </g>
      <T x={300} y={128} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.8, 1.2))}>
        L4, kWh per good unit
      </T>
      {!on ? (
        <T x={300} y={170} s={20} f={C.secondary} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
          ?
        </T>
      ) : (
        <g>
          <T x={200} y={170} s={20} f={C.focus} a="middle" o={easeOut(seg(s, 0.2, 0.6))}>
            0.5625
          </T>
          <T x={400} y={170} s={20} f={C.second} a="middle" o={easeOut(seg(s, 0.5, 0.9))}>
            0.5000
          </T>
          <T x={300} y={196} s={13} f={C.secondary} a="middle" o={easeOut(seg(s, 1.0, 1.4))}>
            same meter, a chosen split
          </T>
        </g>
      )}
    </Svg>
  );
}
