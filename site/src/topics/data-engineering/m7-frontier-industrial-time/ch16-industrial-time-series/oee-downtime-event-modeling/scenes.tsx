import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// OEE and downtime: shift-boundary timelines, factor bars that multiply and lock onto oee.com's worked example,
// events paired into intervals, a replay merged away, codes rolling up, MTBF's censored tail, and two policies.

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

/** A whole number counted up by k. */
const n0 = (v: number, k: number) => Math.round(v * k).toLocaleString('en-US');

// The 21:30–22:30 window around examples.py's 22:00 shift boundary, 8 px a minute: 21:50 → 220, 22:00 → 300, 22:20 → 460.
const bx = (minFrom2130: number) => 60 + minFrom2130 * 8;
const BOUND = bx(30);

/** The boundary: a dashed vertical line with its time on top and the two shifts either side. */
function Boundary({ o, y0 = 34, y1 = 140, names = true }: { o: number; y0?: number; y1?: number; names?: boolean }) {
  return o <= 0 ? null : (
    <g opacity={o}>
      <line x1={BOUND} y1={y0} x2={BOUND} y2={y1} stroke={C.primary} strokeDasharray="5 4" />
      <T x={BOUND} y={y0 - 8} s={13} f={C.primary} a="middle">
        22:00
      </T>
      {names && (
        <g>
          <T x={BOUND - 14} y={y0 + 10} s={13} f={C.quiet} a="end">
            evening
          </T>
          <T x={BOUND + 14} y={y0 + 10} s={13} f={C.quiet}>
            night
          </T>
        </g>
      )}
    </g>
  );
}

// 1 · Two plants, the same 21:50–22:20 changeover. Plant A's bar slides whole into the shift it started in; plant B's
// is cut at 22:00 into 10 and 20. Then a replayed copy lands on plant A's row in red: two plants, two numbers.
export function Hook({ t }: StepCtx) {
  const bar = easeOut(seg(t, 0.5, 1.3));
  const cut = easeInOut(seg(t, 1.6, 2.3));
  const dup = easeOutBack(seg(t, 2.8, 3.3));
  const q = easeOut(seg(t, 3.8, 4.3));
  return (
    <Svg label="a changeover crosses a shift boundary and a gateway replay duplicates one interval — the same shift reports two different OEE numbers at two plants" h={200}>
      <Boundary o={easeOut(seg(t, 0, 0.4))} y0={30} y1={156} />
      <T x={30} y={70} s={13} f={C.secondary} o={easeOut(seg(t, 0.2, 0.5))}>
        plant A
      </T>
      <T x={30} y={130} s={13} f={C.secondary} o={easeOut(seg(t, 0.2, 0.5))}>
        plant B
      </T>
      {bar > 0 && <rect x={bx(20)} y={78} width={240 * bar} height={18} rx={3} fill={C.primary} />}
      {dup > 0 && <rect x={bx(26)} y={60} width={240 * Math.min(1, dup)} height={14} rx={3} fill="none" stroke={C.badText} strokeWidth={1.6} strokeDasharray="4 3" opacity={Math.min(1, dup)} />}
      {bar > 0 && (
        <g>
          <rect x={bx(20) - 6 * cut} y={138} width={80 * bar} height={18} rx={3} fill={C.primary} />
          <rect x={BOUND + 6 * cut} y={138} width={Math.max(0, 240 * bar - 80)} height={18} rx={3} fill={C.second} opacity={0.4 + 0.6 * cut} />
        </g>
      )}
      <T x={bx(20)} y={114} s={13} f={C.primary} o={easeOut(seg(t, 1.3, 1.6))}>
        all 30 min to evening
      </T>
      <T x={bx(20) - 16} y={152} s={13} f={C.primary} a="end" o={cut}>
        10
      </T>
      <T x={bx(50) + 16} y={152} s={13} f={C.second} o={cut}>
        20
      </T>
      <T x={560} y={56} s={13} f={C.badText} a="end" o={easeOut(seg(t, 3.2, 3.6))}>
        sent twice
      </T>
      <T x={300} y={194} s={14} f={C.focus} a="middle" o={q}>
        one shift, two OEE numbers
      </T>
    </Svg>
  );
}

// 2 · The three factors grow as bars from oee.com's worked example (420 planned minutes, 47 down, 19,271 made, 423
// rejected); they multiply into one OEE bar. The short form — good parts × ideal cycle ÷ planned seconds — lands
// on the same 0.7479, and the two lock together with a tick.
export function RevealOeeFormula({ t }: StepCtx) {
  const rows: [string, number][] = [
    ['availability', 0.8881],
    ['performance', 0.8611],
    ['quality', 0.978],
  ];
  const mult = easeInOut(seg(t, 2.0, 2.8));
  const simple = easeOut(seg(t, 3.0, 3.6));
  const lock = easeOutBack(seg(t, 3.8, 4.3));
  return (
    <Svg label="Availability × Performance × Quality, run against oee.com's own published worked example — both the factored and simplest forms land on the identical OEE figure" h={220}>
      {rows.map(([l, v], i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.4, 0.9 + i * 0.4));
        const y = 30 + i * 34;
        return (
          <g key={l} opacity={Math.min(1, k * 2)}>
            <T x={30} y={y + 5} s={13} f={C.secondary}>
              {l}
            </T>
            <rect x={170} y={y - 8} width={300} height={14} fill={C.band} />
            <rect x={170} y={y - 8} width={300 * v * k} height={14} fill={C.primary} />
            <T x={575} y={y + 5} s={14} f={C.primary} a="end">
              {(v * k).toFixed(4)}
            </T>
          </g>
        );
      })}
      {mult > 0 && (
        <g>
          <line x1={170} y1={124} x2={470} y2={124} stroke={C.line} opacity={mult} />
          <T x={30} y={150} s={14} f={C.focus} o={mult}>
            A × P × Q
          </T>
          <rect x={170} y={136} width={300 * lerp(0.8881, 0.7479, mult)} height={18} fill={C.focus} />
          <T x={575} y={150} s={16} f={C.focus} a="end" o={mult}>
            {lerp(0.8881, 0.7479, mult).toFixed(4)}
          </T>
        </g>
      )}
      <T x={30} y={196} s={13} f={C.second} o={simple}>
        18,848 good × 1 s ÷ 25,200 s
      </T>
      <T x={545} y={196} s={16} f={C.second} a="end" o={simple}>
        0.7479
      </T>
      <Tick x={566} y={190} k={lock} />
      {lock > 0 && <rect x={470} y={134} width={110} height={70} rx={6} fill="none" stroke={C.focus} strokeWidth={1.2} opacity={Math.min(1, lock)} />}
    </Svg>
  );
}

// 3 · Raw state-change events land on an 06:00–14:00 axis as diamonds. Each pair of neighbours joins into an interval
// bar beneath, coloured by state, and the two down intervals count up: 15 + 12 = 27 minutes, a derived view.
const EV = [0, 120, 135, 350, 362, 480];
const ix = (m: number) => 40 + m * (520 / 480);
export function RevealIntervalTable({ t }: StepCtx) {
  return (
    <Svg label="raw state-change events, paired up into a derived interval table — the interval table is never the thing actually stored" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={40} y1={50} x2={560} y2={50} stroke={C.line} />
        <T x={40} y={28} s={13} f={C.secondary}>
          raw events
        </T>
        <T x={40} y={186} s={12} f={C.quiet}>
          06:00
        </T>
        <T x={560} y={186} s={12} f={C.quiet} a="end">
          14:00
        </T>
      </g>
      {EV.map((m, i) => {
        const k = easeOutBack(seg(t, 0.3 + i * 0.22, 0.6 + i * 0.22));
        const down = i === 1 || i === 3;
        return k <= 0 ? null : <rect key={m} x={ix(m) - 5} y={45} width={10} height={10} transform={`rotate(45 ${ix(m)} 50)`} fill={down ? C.badText : C.focus} opacity={Math.min(1, k)} />;
      })}
      <T x={40} y={92} s={13} f={C.secondary} o={easeOut(seg(t, 1.8, 2.1))}>
        paired into intervals
      </T>
      {EV.slice(0, -1).map((m, i) => {
        const k = easeInOut(seg(t, 2.0 + i * 0.25, 2.4 + i * 0.25));
        const down = i === 1 || i === 3;
        const w = (ix(EV[i + 1]) - ix(m)) * k;
        return k <= 0 ? null : (
          <g key={m}>
            <line x1={ix(m)} y1={56} x2={ix(m)} y2={108} stroke={C.line} strokeDasharray="2 3" opacity={k} />
            <rect x={ix(m) + 1} y={110} width={Math.max(0, w - 2)} height={20} rx={2} fill={down ? C.badText : C.band} stroke={down ? C.badText : C.line} />
          </g>
        );
      })}
      <T x={ix(127)} y={152} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 2.6, 2.9))}>
        15
      </T>
      <T x={ix(356)} y={152} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 3.1, 3.4))}>
        12
      </T>
      <T x={560} y={92} s={14} f={C.badText} a="end" o={easeOut(seg(t, 3.5, 3.9))}>
        {`down: ${n0(27, easeOut(seg(t, 3.5, 4.1)))} min`}
      </T>
      <T x={300} y={186} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.9, 4.4))}>
        derived, not stored
      </T>
    </Svg>
  );
}

// 4 · The 21:50–22:20 changeover draws across 22:00. Before the answer, two tallies wait under it. After it, they fill:
// whole-to-start gives evening 30 / night 0, the split gives 10 / 20 — the shift cells differ (red), the day stays 30.
export function PredictBoundary({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const fill = on ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const cols = [300, 420, 540];
  const rows: [string, string[]][] = [
    ['whole', ['30', '0', '30']],
    ['split', ['10', '20', '30']],
  ];
  return (
    <Svg label="a changeover crosses a shift boundary — does assigning it whole to one shift ever report a different number than splitting it?" h={200}>
      <Boundary o={easeOut(seg(t, 0, 0.4))} y0={26} y1={76} names={false} />
      <Draw
        pts={[
          [bx(20), 56],
          [bx(50), 56],
        ]}
        t={t}
        from={0.4}
        to={1.4}
        stroke={C.primary}
        w={14}
        pen={false}
      />
      <g opacity={easeOut(seg(t, 1.4, 1.8))}>
        {['evening', 'night', 'day'].map((h, i) => (
          <T key={h} x={cols[i]} y={108} s={13} f={C.quiet} a="end">
            {h}
          </T>
        ))}
        {rows.map(([l, vals], r) => (
          <g key={l}>
            <T x={40} y={140 + r * 32} s={14} f={C.secondary}>
              {l}
            </T>
            {vals.map((v, i) =>
              on ? (
                <T key={i} x={cols[i]} y={140 + r * 32} s={15} f={i < 2 ? C.badText : C.focus} a="end" o={fill}>
                  {v}
                </T>
              ) : (
                <T key={i} x={cols[i]} y={140 + r * 32} s={15} f={C.quiet} a="end" o={easeOut(seg(t, 2.0 + r * 0.3, 2.4 + r * 0.3))}>
                  ?
                </T>
              ),
            )}
          </g>
        ))}
      </g>
      <Tick x={566} y={150} k={on ? easeOut(seg(s, 0.8, 1.2)) : 0} />
      {on && fill > 0 && <rect x={208} y={122} width={222} height={58} rx={5} fill="none" stroke={C.badText} strokeWidth={1.2} opacity={easeOut(seg(s, 0.9, 1.3))} />}
    </Svg>
  );
}

// 5 · The 30-minute bar is cut at 22:00: a blade drops, the two halves part, and each counts up — 10 min and 20 min.
// Then both slide down into one sum, 10 + 20 = 30, ticked.
export function RevealSplit({ t }: StepCtx) {
  const blade = easeIn(seg(t, 0.6, 1.1));
  const part = easeOut(seg(t, 1.2, 1.8));
  const cnt = easeOut(seg(t, 1.6, 2.6));
  const join = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="the identical downtime interval, split at the real shift boundary, into two exact pieces that add back up to the original duration" h={200}>
      <Boundary o={easeOut(seg(t, 0, 0.4))} y0={30} y1={110} />
      <rect x={bx(20) - 10 * part} y={64} width={80} height={22} rx={3} fill={C.primary} opacity={easeOut(seg(t, 0, 0.4))} />
      <rect x={BOUND + 10 * part} y={64} width={160} height={22} rx={3} fill={C.second} opacity={easeOut(seg(t, 0, 0.4))} />
      {blade > 0 && blade < 1 && <line x1={BOUND} y1={40 + 0 * blade} x2={BOUND} y2={40 + 60 * blade} stroke={C.focus} strokeWidth={3} />}
      <T x={bx(20) + 30 - 10 * part} y={108} s={14} f={C.primary} a="middle" o={cnt}>
        {`${n0(10, cnt)} min`}
      </T>
      <T x={BOUND + 90 + 10 * part} y={108} s={14} f={C.second} a="middle" o={cnt}>
        {`${n0(20, cnt)} min`}
      </T>
      {join > 0 && (
        <g>
          <rect x={bx(20)} y={lerp(64, 140, join)} width={80} height={22} rx={3} fill={C.primary} opacity={join} />
          <rect x={BOUND} y={lerp(64, 140, join)} width={160} height={22} rx={3} fill={C.second} opacity={join} />
        </g>
      )}
      <T x={300} y={186} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        10 + 20 = 30 min
      </T>
      <Tick x={436} y={180} k={easeOut(seg(t, 3.9, 4.3))} />
    </Svg>
  );
}

// 6 · 09:00–10:30. The real 40-minute stop draws; the replayed copy lands on top of it, offset 10 minutes, in red.
// The naive sum counts up to 80. Then the copy slides into the original, their union is one 50-minute bar, ticked.
const mx = (m: number) => 60 + (m - 180) * 5.6;
export function RevealMerge({ t }: StepCtx) {
  const real = easeOut(seg(t, 0.2, 0.8));
  const dup = easeOutBack(seg(t, 1.0, 1.5));
  const naive = easeOut(seg(t, 1.6, 2.6));
  const merge = easeInOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="a replayed, overlapping interval inflates the naive sum; merging overlapping intervals before summing recovers the real total" h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={60} y1={110} x2={560} y2={110} stroke={C.line} />
        {[
          [180, '09:00'],
          [240, '10:00'],
        ].map(([m, l]) => (
          <T key={l} x={mx(m as number)} y={128} s={12} f={C.quiet} a="middle">
            {l}
          </T>
        ))}
      </g>
      <rect x={mx(200)} y={70} width={(mx(240) - mx(200) + merge * (mx(250) - mx(240))) * real} height={20} rx={3} fill={merge > 0.95 ? C.focus : C.primary} />
      <T x={mx(200) - 8} y={85} s={13} f={C.secondary} a="end" o={real}>
        real
      </T>
      {dup > 0 && merge < 1 && (
        <g opacity={Math.min(1, dup) * (1 - merge)}>
          <rect x={mx(210)} y={lerp(36, 70, merge)} width={mx(250) - mx(210)} height={20} rx={3} fill="none" stroke={C.badText} strokeWidth={1.8} strokeDasharray="5 3" />
          <T x={mx(250) + 10} y={51} s={13} f={C.badText}>
            replay
          </T>
        </g>
      )}
      <T x={60} y={168} s={14} f={C.secondary} o={naive}>
        naive sum: 40 + 40
      </T>
      <T x={560} y={168} s={15} f={C.badText} a="end" o={naive}>
        {`${n0(80, naive)} min`}
      </T>
      <T x={60} y={202} s={14} f={C.secondary} o={easeOut(seg(t, 3.4, 3.8))}>
        merged first
      </T>
      <T x={540} y={202} s={15} f={C.focus} a="end" o={easeOut(seg(t, 3.4, 3.8))}>
        {`${n0(50, easeOut(seg(t, 3.4, 4.2)))} min`}
      </T>
      <Tick x={560} y={196} k={easeOut(seg(t, 4.2, 4.6))} />
      {merge > 0.95 && (
        <T x={(mx(200) + mx(250)) / 2} y={62} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
          one stop, 50 min
        </T>
      )}
    </Svg>
  );
}

// 7 · The stop log's five coded stops fly from the left into their category bars: Unplanned fills to 40, Planned to 30.
// Last, a stop too short to code drops in — and lands in the Performance box, not either downtime bar.
const LOG: [string, number, number][] = [
  ['R-101 · 12', 12, 0],
  ['R-102 · 8', 8, 0],
  ['R-201 · 15', 15, 0],
  ['R-301 · 30', 30, 1],
  ['R-101 · 5', 5, 0],
];
export function RevealReasonCodes({ t }: StepCtx) {
  const fly = LOG.map((_, i) => easeInOut(seg(t, 0.6 + i * 0.4, 1.0 + i * 0.4)));
  const fillU = LOG.reduce((a, [, m, c], i) => a + (c === 0 ? m * fly[i] : 0), 0);
  const fillP = LOG.reduce((a, [, m, c], i) => a + (c === 1 ? m * fly[i] : 0), 0);
  const micro = easeInOut(seg(t, 3.4, 4.2));
  return (
    <Svg label="reason codes roll up to category totals; a micro-stop too short to log a reason for still counts, inside Performance rather than Availability" h={200}>
      {LOG.map(([l, , c], i) => {
        const k = fly[i];
        const y0 = 14 + i * 34;
        const y1 = c === 0 ? 34 : 90;
        const kx = Math.min(1, k * 2);
        const ky = Math.max(0, k * 2 - 1);
        return k >= 1 ? null : (
          <g key={i} opacity={easeOut(seg(t, 0, 0.4))} transform={`translate(${lerp(0, 220, kx)} ${lerp(0, y1 - y0 - 6, ky)})`}>
            <rect x={30} y={y0} width={120} height={26} rx={3} fill={C.panel} stroke={c === 1 ? C.second : C.line} />
            <T x={90} y={y0 + 18} s={13} f={c === 1 ? C.second : C.primary} a="middle">
              {l}
            </T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={380} y={24} s={13} f={C.secondary}>
          Unplanned
        </T>
        <rect x={380} y={32} width={160} height={16} fill={C.band} />
        <rect x={380} y={32} width={fillU * 4} height={16} fill={C.badText} />
        <T x={575} y={46} s={14} f={C.primary} a="end">
          {n0(fillU, 1)}
        </T>
        <T x={380} y={80} s={13} f={C.secondary}>
          Planned
        </T>
        <rect x={380} y={88} width={160} height={16} fill={C.band} />
        <rect x={380} y={88} width={fillP * 4} height={16} fill={C.second} />
        <T x={575} y={102} s={14} f={C.primary} a="end">
          {n0(fillP, 1)}
        </T>
      </g>
      <g opacity={easeOut(seg(t, 3.0, 3.4))}>
        <rect x={380} y={140} width={180} height={30} rx={4} fill={C.panel} stroke={micro >= 1 ? C.focus : C.line} />
        <T x={470} y={160} s={13} f={micro >= 1 ? C.focus : C.primary} a="middle">
          Performance
        </T>
      </g>
      {micro > 0 && <circle cx={lerp(200, 470, micro)} cy={lerp(130, 155, micro) - 30 * Math.sin(Math.PI * micro)} r={5} fill={C.focus} opacity={micro >= 1 ? 0 : 1} />}
      <T x={200} y={192} s={13} f={C.secondary} o={easeOut(seg(t, 3.2, 3.6))}>
        micro-stop, no reason
      </T>
    </Svg>
  );
}

// 8 · 72 hours. Up-time bars draw between failures (red ✕ at 10 h, 28 h, 50 h), each counting its hours: 10, 17.5,
// 21.25. The stretch after the last repair draws dashed and grey: censored. Then MTBF and MTTR land beneath.
const hx = (h: number) => 40 + h * (520 / 72);
const UPS: [number, number, string][] = [
  [0, 10, '10 h'],
  [10.5, 28, '17.5 h'],
  [28.75, 50, '21.25 h'],
];
export function RevealMtbf({ t }: StepCtx) {
  const tail = easeInOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="up-times between observed failures count toward MTBF; the stretch after the last failure, unclosed by a second failure, is excluded as censored" h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={40} y1={92} x2={560} y2={92} stroke={C.line} />
        <T x={40} y={114} s={12} f={C.quiet}>
          0 h
        </T>
        <T x={560} y={114} s={12} f={C.quiet} a="end">
          72 h
        </T>
      </g>
      {UPS.map(([a, b, l], i) => {
        const k = easeInOut(seg(t, 0.3 + i * 0.7, 0.9 + i * 0.7));
        return (
          <g key={l}>
            {k > 0 && <rect x={hx(a)} y={72} width={(hx(b) - hx(a)) * k} height={16} rx={2} fill={C.primary} />}
            <T x={(hx(a) + hx(b)) / 2} y={60} s={13} f={C.primary} a="middle" o={easeOut(seg(t, 0.7 + i * 0.7, 1.0 + i * 0.7))}>
              {l}
            </T>
            <Cross x={hx(b)} y={80} k={easeOutBack(seg(t, 0.9 + i * 0.7, 1.1 + i * 0.7))} />
          </g>
        );
      })}
      {tail > 0 && <rect x={hx(50.33)} y={72} width={(hx(72) - hx(50.33)) * tail} height={16} rx={2} fill="none" stroke={C.quiet} strokeDasharray="4 3" />}
      <T x={(hx(50.33) + hx(72)) / 2} y={60} s={13} f={C.quiet} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        censored
      </T>
      <T x={40} y={160} s={14} f={C.secondary} o={easeOut(seg(t, 3.4, 3.8))}>
        MTBF = 48.75 h ÷ 3
      </T>
      <T x={575} y={160} s={15} f={C.focus} a="end" o={easeOut(seg(t, 3.6, 4.0))}>
        16.25 h
      </T>
      <T x={40} y={196} s={14} f={C.secondary} o={easeOut(seg(t, 3.9, 4.3))}>
        MTTR = 95 min ÷ 3
      </T>
      <T x={575} y={196} s={15} f={C.focus} a="end" o={easeOut(seg(t, 4.1, 4.5))}>
        31.67 min
      </T>
    </Svg>
  );
}

// 9 · Two copies of the 420 planned minutes. In both, the 47-minute breakdown cuts out of the bar (red). The 30-minute
// changeover chip then goes two ways: up and away as planned (88.81%), or into the bar as a second cut (81.67%).
const px = (m: number) => 40 + m * (360 / 420);
export function RevealPolicy({ t }: StepCtx) {
  const brk = easeInOut(seg(t, 0.6, 1.2));
  const co = easeInOut(seg(t, 1.6, 2.4));
  const va = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="the identical raw downtime minutes, classified under two different planned/unplanned policies, give two different Availability figures" h={200}>
      {[0, 1].map((r) => {
        const y = 50 + r * 76;
        const cut = 47 + (r === 1 ? 30 * co : 0);
        return (
          <g key={r} opacity={easeOut(seg(t, r * 0.2, 0.4 + r * 0.2))}>
            <T x={40} y={y - 14} s={13} f={C.secondary}>
              {r === 0 ? 'changeover = planned' : 'changeover = unplanned'}
            </T>
            <rect x={px(0)} y={y} width={px(420) - px(0)} height={20} fill={C.primary} />
            <rect x={px(420 - 47 * brk)} y={y} width={px(420) - px(420 - 47 * brk)} height={20} fill={C.badText} />
            {r === 1 && co > 0 && <rect x={px(420 - cut)} y={y} width={px(420 - 47) - px(420 - cut)} height={20} fill={C.bad} stroke={C.badText} />}
            {r === 0 && co > 0 && (
              <g>
                <rect x={lerp(px(343), 420, co)} y={lerp(y, y - 30, co)} width={px(30) - px(0)} height={14} rx={2} fill="none" stroke={C.second} opacity={1 - 0.3 * co} />
                <T x={454} y={y - 18} s={12} f={C.second} o={easeOut(seg(co, 0.7, 1))}>
                  set aside
                </T>
              </g>
            )}
            <T x={575} y={y + 15} s={15} f={r === 0 ? C.focus : C.badText} a="end" o={va}>
              {r === 0 ? '88.81%' : '81.67%'}
            </T>
          </g>
        );
      })}
      <T x={300} y={192} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.1))}>
        same minutes, two numbers
      </T>
    </Svg>
  );
}

// 10 · Seven lines, one per idea, each with a small glyph of its picture, arriving one per beat.
const GLYPH = [
  (k: number) => <rect x={30} y={-8} width={70 * k} height={10} fill={C.focus} />,
  (k: number) => (
    <g>
      {[30, 52, 74, 96].map((x, i) => (
        <rect key={x} x={x} y={-8} width={8} height={8} transform={`rotate(45 ${x + 4} -4)`} fill={i % 2 ? C.badText : C.focus} opacity={k} />
      ))}
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30 - 4 * k} y={-8} width={24} height={10} fill={C.primary} />
      <rect x={56 + 4 * k} y={-8} width={48} height={10} fill={C.second} />
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30} y={-8} width={lerp(40, 70, k)} height={10} fill={C.primary} />
      <rect x={40} y={-8} width={60} height={10} fill="none" stroke={C.badText} strokeDasharray="3 2" opacity={1 - k} />
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30} y={-8} width={50} height={10} fill={C.badText} />
      <circle cx={lerp(30, 100, k)} cy={-3} r={3.5} fill={C.focus} />
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30} y={-8} width={44} height={10} fill={C.primary} />
      <rect x={78} y={-8} width={28 * k} height={10} fill="none" stroke={C.quiet} strokeDasharray="3 2" />
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30} y={-8} width={76} height={10} fill={C.primary} />
      <rect x={lerp(96, 80, k)} y={-8} width={lerp(10, 26, k)} height={10} fill={C.badText} />
    </g>
  ),
];
export function Recap({ t }: StepCtx) {
  const rows = [
    'A × P × Q = 0.7479, both ways',
    'intervals: derived, not stored',
    'boundary: 10 + 20 min',
    'replay merged: 80 → 50 min',
    'micro-stops → Performance',
    'MTBF skips the censored tail',
    'policy moves the number',
  ];
  return (
    <Svg
      label="A×P×Q reconciled, a derived interval table, a boundary split, a merged double-count, rolled-up reason codes, MTBF/MTTR with a censored tail, and a policy that changes the number"
      h={260}
    >
      {rows.map((r, i) => {
        const a = 0.2 + i * 0.65;
        const o = easeOut(seg(t, a, a + 0.35));
        const k = easeOut(seg(t, a + 0.15, a + 0.7));
        return o <= 0 ? null : (
          <g key={r} opacity={o} transform={`translate(${lerp(-12, 0, o)} ${30 + i * 34})`}>
            {GLYPH[i](k)}
            <T x={130} y={2} s={14} f={i === 6 ? C.focus : C.primary}>
              {r}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 11 · A machine stamps parts onto a belt at a steady pace while the report beside it reads 81.67%. The policy switch
// flips (changeover → planned) and the report jumps to 88.81%. After the answer the belt is still going at exactly the
// same pace: ticked; only the report moved.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const flip = on ? 1 : easeInOut(seg(t, 1.4, 2.0));
  const clock = on ? 2.2 + s : t;
  const phase = (clock * 0.8) % 1;
  return (
    <Svg label="a plant manager reclassifies changeovers as planned, the day after reviewing this month's numbers — does the plant's machines or output change at all?" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <Box x={30} y={40} w={110} h={50} label="machine" />
        <line x1={140} y1={90} x2={330} y2={90} stroke={C.line} strokeWidth={2} />
        {Array.from({ length: 5 }, (_, i) => {
          const x = 150 + (i + phase) * 36;
          return x > 326 ? null : <rect key={i} x={x} y={78} width={12} height={12} rx={2} fill={C.primary} />;
        })}
      </g>
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        <rect x={380} y={34} width={190} height={66} rx={6} fill={C.panel} stroke={C.line} />
        <T x={395} y={58} s={13} f={C.secondary}>
          availability
        </T>
        <T x={555} y={88} s={20} f={flip > 0.5 ? C.focus : C.primary} a="end">
          {flip > 0.5 ? '88.81%' : '81.67%'}
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.6, 1.0))}>
        <T x={380} y={128} s={13} f={C.secondary}>
          changeover
        </T>
        <rect x={380} y={140} width={56} height={20} rx={10} fill={C.panel} stroke={flip > 0.5 ? C.second : C.line} />
        <circle cx={lerp(390, 426, flip)} cy={150} r={7} fill={flip > 0.5 ? C.second : C.quiet} />
        <T x={452} y={155} s={13} f={flip > 0.5 ? C.second : C.quiet}>
          {flip > 0.5 ? 'planned' : 'unplanned'}
        </T>
      </g>
      {!on ? (
        <T x={185} y={136} s={16} f={C.secondary} a="middle" o={easeOut(seg(t, 2.2, 2.6))}>
          ?
        </T>
      ) : (
        <g>
          <T x={30} y={136} s={13} f={C.focus} o={easeOut(seg(s, 0.3, 0.7))}>
            same parts, same pace
          </T>
          <Tick x={322} y={131} k={easeOut(seg(s, 0.6, 1.0))} />
          <T x={300} y={190} s={13} f={C.secondary} a="middle" o={easeOut(seg(s, 1.0, 1.4))}>
            only the paperwork changed
          </T>
        </g>
      )}
    </Svg>
  );
}
