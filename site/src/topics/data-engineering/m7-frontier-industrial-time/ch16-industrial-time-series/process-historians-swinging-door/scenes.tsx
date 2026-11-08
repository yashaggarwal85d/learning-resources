import { useEffect, useState } from 'react';
import { C, Draw, Plot, Reticle, Svg, T } from '../../../../../reels/kit';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Process historians, drawn from examples.py: the kettle hour's 3,600 readings → 50 points through the exception
// filter and swinging door (worst error 0.558 against CompDev 0.6), the lopsided hour's 8 + 495 knees and its three
// averages (169.66, 153.89, 153.34), and the valve whose line reads 0.999 where the hold reads 0.

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

type Pt = readonly [number, number];

// examples.py's hour of kettle temperature (random.seed(7)), one value a second; every 60th value here.
// prettier-ignore
const SIG60 = [149.95, 150.11, 149.97, 149.86, 149.93, 149.9, 149.93, 149.94, 150.05, 149.85, 149.9, 149.99, 150.05, 149.94, 149.9, 149.94, 149.86, 150.09, 149.92, 152.46, 156.12, 159.47, 161.91, 162.0, 161.98, 162.14, 162.05, 162.04, 162.09, 162.08, 162.05, 162.09, 161.87, 162.14, 161.94, 161.97, 162.12, 161.87, 161.96, 162.04, 162.06, 161.98, 161.53, 160.32, 159.11, 157.93, 157.87, 158.01, 157.97, 158.06, 157.96, 157.9, 158.08, 158.11, 158.06, 157.95, 157.86, 158.12, 157.89, 157.95];
// The 50 points the exception filter passes (ExcDev 0.3, ExMax 400 s) — every one of them is also a swinging-door knee.
// prettier-ignore
const KNEES: [number, number][] = [[0, 149.95], [400, 149.87], [800, 150.1], [1105, 150.42], [1111, 150.74], [1117, 151.05], [1125, 151.62], [1132, 151.99], [1139, 152.41], [1146, 152.85], [1152, 153.23], [1157, 153.55], [1163, 153.9], [1169, 154.24], [1177, 154.66], [1183, 155.11], [1190, 155.46], [1195, 155.8], [1200, 156.12], [1206, 156.46], [1214, 156.92], [1221, 157.32], [1226, 157.67], [1233, 158.04], [1238, 158.38], [1243, 158.72], [1251, 159.16], [1259, 159.58], [1266, 159.93], [1270, 160.32], [1277, 160.74], [1285, 161.05], [1289, 161.41], [1296, 161.88], [1696, 162.03], [2096, 161.99], [2496, 162.1], [2505, 161.77], [2524, 161.47], [2545, 160.97], [2567, 160.63], [2580, 160.32], [2596, 159.96], [2620, 159.5], [2636, 159.16], [2653, 158.83], [2671, 158.48], [2688, 158.09], [3088, 158.07], [3488, 157.92]];

// The lopsided hour: 150 for 3,000 s, then 170 + 4 sin((i − 3000) / 3) for the last 600 s. 8 knees land in the quiet
// part (every 400 s), 495 in the wobble.
const lop = (i: number) => (i < 3000 ? 150 : 170 + 4 * Math.sin((i - 3000) / 3));
const LOP_PTS = (x0: number, w: number, y0: number, h: number): Pt[] =>
  Array.from({ length: 721 }, (_, j) => {
    const i = j * 5;
    return [x0 + (i / 3600) * w, y0 + h - ((lop(i) - 145) / 31) * h] as const;
  });

// 0 · The lopsided hour draws: a long flat stretch at 150, then a short hard wobble near 170. Its stored knees drop on
// as dots — eight spread over the flat, a dense wall of 495 in the wobble. Two averages land as lines: the plain average
// of the stored points, 169.66, red; the true time-weighted average, 153.34, white. 16.32 degrees apart.
export function Hook({ t }: StepCtx) {
  const x0 = 30;
  const w = 380;
  const y0 = 30;
  const h = 130;
  const vy = (v: number) => y0 + h - ((v - 145) / 31) * h;
  const dots = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="a year of a temperature tag, extracted and averaged, comes out several degrees off the plant's own reported average — nothing in the archive is actually broken" h={200}>
      <Draw pts={LOP_PTS(x0, w, y0, h)} t={t} from={0} to={1.4} stroke={C.secondary} w={1.2} pen={false} />
      {[0, 400, 800, 1200, 1600, 2000, 2400, 2800].map((i, j) => (
        <circle key={i} cx={x0 + (i / 3600) * w} cy={vy(150)} r={3.5} fill={C.focus} opacity={dots > j / 8 ? 1 : 0} />
      ))}
      <rect x={x0 + (3000 / 3600) * w} y={vy(174.5)} width={(600 / 3600) * w} height={vy(165.5) - vy(174.5)} fill={C.focus} opacity={0.55 * dots} />
      <line x1={x0} y1={vy(169.66)} x2={x0 + w} y2={vy(169.66)} stroke={C.badText} strokeWidth={1.6} strokeDasharray="5 3" opacity={easeOut(seg(t, 2.6, 3.0))} />
      <line x1={x0} y1={vy(153.34)} x2={x0 + w} y2={vy(153.34)} stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 3.3, 3.7))} />
      <T x={430} y={vy(169.66) + 2} s={12} f={C.badText} o={easeOut(seg(t, 2.8, 3.2))}>
        stored mean
      </T>
      <T x={575} y={vy(169.66) + 22} s={15} f={C.badText} a="end" w={600} o={easeOut(seg(t, 2.8, 3.2))}>
        169.66
      </T>
      <T x={430} y={vy(153.34) - 12} s={12} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
        true mean
      </T>
      <T x={575} y={vy(153.34) + 8} s={15} f={C.focus} a="end" w={600} o={easeOut(seg(t, 3.5, 3.9))}>
        153.34
      </T>
      <T x={30} y={190} s={12} f={C.quiet} o={easeOut(seg(t, 4.2, 4.6))}>
        nothing broken: 16.32 degrees apart
      </T>
    </Svg>
  );
}

// 1 · The same hour, smaller. Two blanks under it: the right mean, and what each extracted row should carry. Before the
// answer both read "?". After it, the area under the curve fills pale blue — time-weighted: 153.34 — and a row chip
// gains its flag and compression deviation: "recorded, CompDev 0.6".
export function PredictMean({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const x0 = 30;
  const w = 540;
  const y0 = 20;
  const h = 80;
  const pts = LOP_PTS(x0, w, y0, h);
  const fill = on ? easeOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg
      label="the historian kept only the points needed to reconstruct the curve within a stated error band — what would have given the right mean, and what should the extraction have recorded?"
      h={200}
    >
      {fill > 0 && <path d={`M${x0} ${y0 + h} ${pts.map((p) => `L${p[0]} ${p[1]}`).join(' ')} L${x0 + w} ${y0 + h} Z`} fill={C.second} opacity={0.3 * fill} />}
      <Draw pts={pts} t={t} from={0} to={1.0} stroke={C.secondary} w={1.2} pen={false} />
      <T x={25} y={140} s={13} f={C.secondary} o={easeOut(seg(t, 1.0, 1.3))}>
        right mean
      </T>
      <T x={25} y={180} s={13} f={C.secondary} o={easeOut(seg(t, 1.3, 1.6))}>
        each row carries
      </T>
      {!on ? (
        <g opacity={easeOut(seg(t, 1.6, 2.0))}>
          <T x={575} y={140} s={15} f={C.focus} a="end" w={600}>
            ?
          </T>
          <T x={575} y={180} s={15} f={C.focus} a="end" w={600}>
            ?
          </T>
        </g>
      ) : (
        <g>
          <T x={575} y={140} s={14} f={C.second} a="end" w={600} o={easeOut(seg(s, 0.8, 1.2))}>
            time-weighted: 153.34
          </T>
          <T x={575} y={180} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(s, 1.2, 1.6))}>
            recorded flag, CompDev 0.6
          </T>
        </g>
      )}
    </Svg>
  );
}

const SX = (i: number) => 30 + (i / 3600) * 540;
const SY = (v: number) => 170 - ((v - 148) / 16) * 140;

// 2 · The hour's raw readings appear as faint grey dots. A ±0.3 deadband rides along on the last passed value; each
// time a reading leaves it, the reading turns white and the band jumps. On the flats, only the 400-second ExMax lets
// a point through. 3,600 readings → 50 passed.
export function RevealException({ t }: StepCtx) {
  const sweep = seg(t, 1.0, 4.4) * 3600;
  const passed = KNEES.filter(([i]) => i <= sweep);
  const last = passed.length ? passed[passed.length - 1] : KNEES[0];
  return (
    <Svg label="a simple deadband applied at the interface passes a value only once it moves past a stated threshold, so nearly every point in a flat stretch never reaches the archive" h={200}>
      {SIG60.map((v, j) => (
        <circle key={j} cx={SX(j * 60)} cy={SY(v)} r={1.8} fill={C.quiet} opacity={easeOut(seg(t, j * 0.012, 0.2 + j * 0.012))} />
      ))}
      {sweep > 0 && sweep < 3600 && <rect x={SX(last[0])} y={SY(last[1] + 0.3)} width={SX(sweep) - SX(last[0])} height={SY(last[1] - 0.3) - SY(last[1] + 0.3)} fill={C.second} opacity={0.4} />}
      {passed.map(([i, v]) => (
        <circle key={i} cx={SX(i)} cy={SY(v)} r={3} fill={C.focus} />
      ))}
      <T x={30} y={192} s={12} f={C.second} o={easeOut(seg(t, 0.8, 1.2))}>
        deadband ±0.3, or every 400 s
      </T>
      <T x={575} y={192} s={14} f={C.focus} a="end" w={600} o={easeOut(seg(t, 4.4, 4.8))}>
        3,600 → 50
      </T>
    </Svg>
  );
}

// 3 · The doors, drawn on their own. An anchor point; each arriving point narrows an upper door (from anchor + 0.6) and a
// lower door (from anchor − 0.6). They stay open while one line could still pass within 0.6 of every point. The next
// point forces them to cross — no longer parallel — and the previous point turns white: a knee, the new anchor.
export function RevealSwingingDoor({ t }: StepCtx) {
  const A: Pt = [60, 120];
  const pts: Pt[] = [
    [130, 112],
    [200, 106],
    [270, 96],
    [340, 22],
  ];
  const dev = 26;
  const n = Math.min(4, Math.floor(seg(t, 0.8, 4.0) * 5));
  const shown = pts.slice(0, n);
  // slopes in value space (up is positive): the upper door takes the steepest, the lower the shallowest
  const su = shown.length ? Math.max(...shown.map(([x, y]) => (A[1] - y - dev) / (x - A[0]))) : 0;
  const sl = shown.length ? Math.min(...shown.map(([x, y]) => (A[1] - y + dev) / (x - A[0]))) : 0;
  const broke = n >= 4;
  const X2 = 420;
  return (
    <Svg label="two doors pivot on the last stored point, swinging open as values arrive, and a knee is recorded the moment the doors can no longer stay parallel" h={200}>
      <circle cx={A[0]} cy={A[1]} r={5} fill={C.focus} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={A[0]} y={A[1] + 50} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        anchor
      </T>
      <g opacity={easeOut(seg(t, 0.4, 0.8))}>
        {n > 0 && <line x1={A[0]} y1={A[1] - dev} x2={X2} y2={A[1] - dev - su * (X2 - A[0])} stroke={broke ? C.badText : C.second} strokeWidth={1.6} />}
        {n > 0 && <line x1={A[0]} y1={A[1] + dev} x2={X2} y2={A[1] + dev - sl * (X2 - A[0])} stroke={broke ? C.badText : C.second} strokeWidth={1.6} />}
        <line x1={A[0]} y1={A[1] - dev} x2={A[0]} y2={A[1] + dev} stroke={C.second} strokeWidth={1} strokeDasharray="3 3" />
        <T x={A[0] - 8} y={A[1] - dev + 4} s={11} f={C.second} a="end">
          +0.6
        </T>
        <T x={A[0] - 8} y={A[1] + dev + 4} s={11} f={C.second} a="end">
          −0.6
        </T>
      </g>
      {shown.map(([x, y], i) => {
        const knee = broke && i === 2;
        const forcing = broke && i === 3;
        return <circle key={i} cx={x} cy={y} r={knee ? 6 : 4} fill={knee ? C.focus : forcing ? C.badText : C.secondary} />;
      })}
      <T x={575} y={60} s={13} f={broke ? C.badText : C.secondary} a="end" w={broke ? 600 : 400} o={easeOut(seg(t, 1.0, 1.4))}>
        {broke ? 'past parallel' : 'doors still meet'}
      </T>
      <T x={pts[2][0]} y={pts[2][1] + 28} s={13} f={C.focus} a="middle" w={600} o={broke ? easeOut(seg(t, 4.2, 4.6)) : 0}>
        knee
      </T>
      <T x={575} y={190} s={12} f={C.quiet} a="end" o={easeOut(seg(t, 4.6, 5.0))}>
        the knee becomes the next anchor
      </T>
    </Svg>
  );
}

// 4 · The original hour as faint dots, the 50 knees joined into the reconstruction line, and a ±0.6 CompDev band
// around it. Every original reading sits inside: the worst is 0.558 off. The count lands: 3,600 → 50, 98.6% fewer.
export function RevealErrorBand({ t }: StepCtx) {
  const line: Pt[] = KNEES.map(([i, v]) => [SX(i), SY(v)] as const);
  const band = easeOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="every stored knee stays within the stated compression deviation of the line it approximates, and the point count falls by more than 80%" h={200}>
      {band > 0 && (
        <path
          d={`M${KNEES.map(([i, v]) => `${SX(i)} ${SY(v + 0.6)}`).join(' L')} L${[...KNEES]
            .reverse()
            .map(([i, v]) => `${SX(i)} ${SY(v - 0.6)}`)
            .join(' L')} Z`}
          fill={C.second}
          opacity={0.25 * band}
        />
      )}
      {SIG60.map((v, j) => (
        <circle key={j} cx={SX(j * 60)} cy={SY(v)} r={1.6} fill={C.quiet} opacity={easeOut(seg(t, 0, 0.4))} />
      ))}
      <Draw pts={line} t={t} from={0.4} to={1.6} stroke={C.focus} w={1.8} />
      <T x={30} y={192} s={12} f={C.second} o={band}>
        CompDev ±0.6
      </T>
      <T x={250} y={192} s={13} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        worst: 0.558
      </T>
      <Tick x={420} y={187} k={easeOutBack(seg(t, 3.1, 3.5))} />
      <T x={575} y={26} s={14} f={C.focus} a="end" w={600} o={easeOut(seg(t, 3.8, 4.2))}>
        3,600 → 50
      </T>
      <T x={575} y={46} s={12} f={C.second} a="end" o={easeOut(seg(t, 4.2, 4.6))}>
        98.6% fewer
      </T>
    </Svg>
  );
}

// 5 · Two bars split the lopsided hour two ways. Time: the quiet hold takes 3,000 of 3,600 seconds, the wobble 600. Stored
// knees: the hold has 8, the wobble 495. The split flips — and a plain average weighs every knee the same.
export function RevealBias({ t }: StepCtx) {
  const W = 400;
  const a = easeOut(seg(t, 0.6, 1.6));
  const b = easeOut(seg(t, 2.2, 3.2));
  return (
    <Svg label="a long quiet hold collapses to almost nothing while a short volatile stretch forces many knees, and a plain average over the stored knees weighs them equally anyway" h={200}>
      <T x={25} y={46} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        time
      </T>
      <rect x={150} y={34} width={W * (3000 / 3600) * a} height={16} fill={C.secondary} />
      <rect x={150 + W * (3000 / 3600)} y={34} width={W * (600 / 3600) * a} height={16} fill={C.focus} />
      <T x={150} y={72} s={12} f={C.secondary} o={a}>
        hold: 3,000 s
      </T>
      <T x={575} y={72} s={12} f={C.focus} a="end" o={a}>
        wobble: 600 s
      </T>
      <T x={25} y={122} s={13} f={C.secondary} o={easeOut(seg(t, 1.8, 2.1))}>
        stored knees
      </T>
      <rect x={150} y={110} width={W * (8 / 503) * b} height={16} fill={C.secondary} />
      <rect x={150 + W * (8 / 503)} y={110} width={W * (495 / 503) * b} height={16} fill={C.bad} />
      <T x={150} y={148} s={12} f={C.secondary} o={b}>
        hold: 8
      </T>
      <T x={575} y={148} s={12} f={C.badText} a="end" w={600} o={b}>
        wobble: 495
      </T>
      <T x={300} y={188} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 3.8, 4.3))}>
        a plain average counts each knee once
      </T>
    </Svg>
  );
}

// 6 · A number line from 150 to 172. Three markers drop onto it: the true average, 153.34; the time-weighted average of
// values interpolated at every second, 153.89 — 0.55 off; and the plain knee average, 169.66 — 16.32 off, red.
export function RevealTimeWeighted({ t }: StepCtx) {
  const nx = (v: number) => 40 + ((v - 150) / 22) * 520;
  const marks = [
    { v: 153.34, l: 'true', c: C.focus, y: 62, a: 0.6, off: '' },
    { v: 153.89, l: 'interpolated, every second', c: C.second, y: 150, a: 1.8, off: '0.55 off' },
    { v: 169.66, l: 'knee average', c: C.badText, y: 62, a: 3.0, off: '16.32 off' },
  ];
  return (
    <Svg label="weighting by time instead of by row, or interpolating a value at every original timestamp, tracks the true average far more closely than the plain knee average does" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <line x1={nx(150)} y1={100} x2={nx(172)} y2={100} stroke={C.line} strokeWidth={1.4} />
        {[150, 155, 160, 165, 170].map((v) => (
          <g key={v}>
            <line x1={nx(v)} y1={96} x2={nx(v)} y2={104} stroke={C.line} strokeWidth={1} />
            <T x={nx(v)} y={120} s={11} f={C.quiet} a="middle">
              {String(v)}
            </T>
          </g>
        ))}
      </g>
      {marks.map((m) => {
        const k = easeOutBack(seg(t, m.a, m.a + 0.5));
        const up = m.y < 100;
        return (
          <g key={m.l} opacity={easeOut(seg(t, m.a, m.a + 0.3))}>
            <circle cx={nx(m.v)} cy={lerp(up ? 30 : 170, 100, k)} r={6} fill={m.c} />
            <T x={nx(m.v) + (m.v > 160 ? -12 : 12)} y={m.y} s={13} f={m.c} a={m.v > 160 ? 'end' : 'start'} w={600}>
              {m.v.toFixed(2)}
            </T>
            <T x={nx(m.v) + (m.v > 160 ? -12 : 12)} y={m.y + (up ? -18 : 20)} s={11} f={m.c} a={m.v > 160 ? 'end' : 'start'}>
              {m.off ? `${m.l}: ${m.off}` : m.l}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · A valve: closed (0) until second 1,500, then open (1). Two knees, at 0 and 1,500. A straight line drawn between
// them, red dashed, climbs across the whole closed stretch; holding the last value draws the true step in white. A probe
// at second 1,499 reads both: the line says 0.999, the hold says 0 — the truth.
export function RevealStep({ t }: StepCtx) {
  const vx = (i: number) => 40 + (i / 3600) * 520;
  const vy = (v: number) => 140 - v * 100;
  const probe = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="drawing a straight line between two knees across a genuine step badly misreads the value just before it moves, while holding the last recorded value reads it exactly" h={200}>
      <circle cx={vx(0)} cy={vy(0)} r={5} fill={C.focus} opacity={easeOut(seg(t, 0, 0.3))} />
      <circle cx={vx(1500)} cy={vy(1)} r={5} fill={C.focus} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <Draw
        pts={[
          [vx(0), vy(0)],
          [vx(1500), vy(1)],
        ]}
        t={t}
        from={0.7}
        to={1.5}
        stroke={C.badText}
        w={1.6}
        dash="5 3"
      />
      <Draw
        pts={[
          [vx(0), vy(0)],
          [vx(1500), vy(0)],
          [vx(1500), vy(1)],
          [vx(3600), vy(1)],
        ]}
        t={t}
        from={1.7}
        to={2.7}
        stroke={C.focus}
        w={2}
      />
      <T x={25} y={vy(0) + 22} s={11} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        closed 0
      </T>
      <T x={575} y={vy(1) - 10} s={11} f={C.quiet} a="end" o={easeOut(seg(t, 0, 0.3))}>
        open 1
      </T>
      <line x1={vx(1499) - 4} y1={20} x2={vx(1499) - 4} y2={158} stroke={C.secondary} strokeWidth={1} strokeDasharray="2 3" opacity={probe} />
      <T x={vx(1499) + 10} y={176} s={12} f={C.secondary} o={probe}>
        second 1,499
      </T>
      <T x={575} y={110} s={13} f={C.badText} a="end" w={600} o={easeOut(seg(t, 3.6, 4.0))}>
        line: 0.999
      </T>
      <Cross x={410} y={105} k={easeOutBack(seg(t, 3.8, 4.2))} />
      <T x={575} y={140} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(t, 4.2, 4.6))}>
        hold: 0
      </T>
      <Tick x={410} y={135} k={easeOutBack(seg(t, 4.4, 4.8))} />
    </Svg>
  );
}

// 8 · Five lanes with tiny pictures: a deadband band, two doors from an anchor, a dense wall of knees, a filled area,
// and a step — each one moving as its lane lands: the signal draws across the band, the doors swing shut, the wall
// rises, the area sweeps in, the step draws; brackets lock onto the time-weighted fix.
export function Recap({ t }: StepCtx) {
  const lane = (i: number) => 32 + i * 50;
  const k = (i: number) => easeOut(seg(t, i * 1.05, i * 1.05 + 0.5));
  const texts = [
    { l: 'exception filter', r: 'before archive', c: C.second },
    { l: 'swinging door', r: 'knees ±0.6', c: C.focus },
    { l: 'knee average', r: 'misleads', c: C.badText },
    { l: 'time-weighted', r: 'the fix', c: C.focus },
    { l: 'step series', r: 'hold the value', c: C.focus },
  ];
  // exception filter: a noisy signal draws across the deadband; only what leaves the band is passed on
  const noise: [number, number][] = Array.from({ length: 23 }, (_, i) => [25 + i * 5, lane(0) - 1 + Math.sin(i * 1.7) * (i % 7 === 3 ? 11 : 3)]);
  // swinging door: the two doors swing toward each other from the anchor until they meet
  const sw = easeInOut(seg(t, 1.3, 2.1));
  const up = lerp(-26, -4, sw);
  const dn = lerp(22, -2, sw);
  // knee average: the knees land, then the misleading wall rises
  const wall = easeOutBack(seg(t, 2.6, 3.0));
  // time-weighted: the area sweeps in under the curve
  const area = easeInOut(seg(t, 3.3, 3.9));
  return (
    <Svg
      label="exception filtering before compression, swinging-door knees within a stated error band, a plain knee average that misleads, a time-weighted fix, and step series that need step interpolation"
      h={260}
    >
      <g opacity={k(0)}>
        <rect x={25} y={lane(0) - 6} width={110} height={10} fill={C.second} opacity={0.4} />
      </g>
      <Draw pts={noise} t={t} from={0.2} to={0.8} stroke={C.quiet} w={1} />
      <g opacity={k(1)}>
        <circle cx={30} cy={lane(1)} r={3.5} fill={C.focus} />
        <line x1={30} y1={lane(1) - 6} x2={135} y2={lane(1) + up * 0.6 - 6} stroke={C.second} strokeWidth={1.4} />
        <line x1={30} y1={lane(1) + 6} x2={135} y2={lane(1) + dn * 0.6 + 6} stroke={C.second} strokeWidth={1.4} />
      </g>
      <Plot pts={[[25, lane(2)], [55, lane(2)], [85, lane(2)]]} t={t} start={2.2} beat={0.12} r={2.5} fill={C.secondary} />
      {wall > 0 && <rect x={110} y={lane(2) + 10 - 20 * clamp(wall, 0, 1.1)} width={25} height={20 * clamp(wall, 0, 1.1)} fill={C.bad} />}
      <g opacity={k(3)}>
        <clipPath id="hist-recap-area">
          <rect x={25} y={lane(3) - 14} width={110 * area} height={28} />
        </clipPath>
        <path clipPath="url(#hist-recap-area)" d={`M25 ${lane(3) + 10} L25 ${lane(3)} L105 ${lane(3)} L112 ${lane(3) - 10} L135 ${lane(3) - 8} L135 ${lane(3) + 10} Z`} fill={C.second} opacity={0.45} />
      </g>
      <Draw pts={[[25, lane(4) + 8], [80, lane(4) + 8], [80, lane(4) - 8], [135, lane(4) - 8]]} t={t} from={4.3} to={4.9} stroke={C.focus} w={1.8} />
      {texts.map((x, i) => (
        <g key={i} opacity={k(i)} transform={`translate(${((1 - k(i)) * -20).toFixed(1)} 0)`}>
          <T x={160} y={lane(i) + 5} s={14} f={C.primary}>
            {x.l}
          </T>
          <T x={575} y={lane(i) + 5} s={14} f={x.c} a="end" w={600}>
            {x.r}
          </T>
        </g>
      ))}
      <Reticle x={300} y={lane(3)} w={566} h={34} t={t} at={5.3} />
    </Svg>
  );
}

// 9 · A bare extraction: three values in a column — 161.88, 161.95, 162.03 — with nothing beside them. Before the answer:
// "recorded or interpolated?". After it, a "?" lands by each and the verdict reads indistinguishable; then the flag
// column the extraction should have carried slides in: recorded, interpolated, recorded, locked onto the interpolated one.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const rows = [
    { v: '161.88', f: 'recorded' },
    { v: '161.95', f: 'interpolated' },
    { v: '162.03', f: 'recorded' },
  ];
  return (
    <Svg label="an extraction carries only values, no flag and no compression deviation — can a later analyst tell a recorded point from an interpolated one?" h={200}>
      <T x={40} y={28} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        value
      </T>
      {rows.map((r, i) => {
        const y = 62 + i * 34;
        const k = easeOut(seg(t, 0.2 + i * 0.25, 0.5 + i * 0.25));
        const q = on ? easeOutBack(seg(s, 0.2 + i * 0.15, 0.5 + i * 0.15)) : 0;
        // the flag the extraction should have carried slides in from the right, after the verdict
        const fl = on ? easeOut(seg(s, 1.6 + i * 0.15, 1.95 + i * 0.15)) : 0;
        return (
          <g key={i}>
            <g opacity={k} transform={`translate(${((1 - k) * -24).toFixed(1)} 0)`}>
              <T x={40} y={y} s={15} f={C.primary} w={600}>
                {r.v}
              </T>
            </g>
            {q > 0 && (
              <g transform={`translate(175 ${y - 5}) scale(${clamp(q, 0, 1.3).toFixed(3)}) translate(-175 ${-(y - 5)})`}>
                <T x={170} y={y} s={15} f={C.badText} w={600}>
                  ?
                </T>
              </g>
            )}
            {fl > 0 && (
              <g opacity={fl} transform={`translate(${((1 - fl) * 40).toFixed(1)} 0)`}>
                <T x={575} y={y} s={13} f={r.f === 'recorded' ? C.focus : C.second} a="end">
                  {r.f}
                </T>
              </g>
            )}
          </g>
        );
      })}
      {on && (
        <T x={575} y={28} s={13} f={C.quiet} a="end" o={easeOut(seg(s, 1.4, 1.8))}>
          the missing flag
        </T>
      )}
      {/* the column that was dropped: drawn as an empty, dashed lane between the values and the flags */}
      {on && <Draw pts={[[220, 44], [220, 140]]} t={s} from={1.2} to={1.6} stroke={C.line} w={1.2} dash="4 4" pen={false} />}
      {!on ? (
        <T x={300} y={184} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 1.4, 1.8))}>
          recorded or interpolated?
        </T>
      ) : (
        <g opacity={easeOut(seg(s, 0.8, 1.2))} transform={`translate(${((1 - easeOut(seg(s, 0.8, 1.2))) * -24).toFixed(1)} 0)`}>
          <T x={40} y={184} s={14} f={C.badText} w={600}>
            without a flag: indistinguishable
          </T>
        </g>
      )}
      {on && <Reticle x={515} y={92} w={136} h={30} t={s} at={2.4} color={C.second} />}
    </Svg>
  );
}
