import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Point-in-time correct training data, drawn from examples.py run against Postgres 16 (seed 20261030): customer
// 2322's ticket events either side of its label moment, the naive join's AUC 0.997 against the as-of join's 0.743,
// the cancellation reason filled for 1,194 of 1,194 churners and 0 rows as of the label, and both TTL edges joining
// to None (TTL 14 d; nearest row 30 d back).

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

type Pt = readonly [number, number];

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

// examples.py's customer 2322 (seed 20261030, churned): ticket events in days relative to its label moment. Four more
// pre-label events sit before −30 d (−77.0, −64.8, −42.9, −36.5). The as-of join reads the −4.3 d row, tickets_open_total
// 2; the naive join reads the latest-ever row, +18.3 d, value 13.
const PRE = [-28.6, -20.7, -14.1, -6.8, -4.3];
const POST = [1.7, 4.1, 10.0, 14.6, 16.9, 18.3];
const DX = (d: number) => 40 + (d + 30) * 10.4;
const LX = DX(0);

/** Customer 2322's events on a −30 d … +20 d axis at height y; post-label dots take `postC`. */
const Events = ({ y, t, from = 0, postC = C.secondary, dim = 0 }: { y: number; t: number; from?: number; postC?: string; dim?: number }) => (
  <g>
    <line x1={30} y1={y} x2={565} y2={y} stroke={C.line} strokeWidth={1.2} opacity={easeOut(seg(t, from, from + 0.3))} />
    <T x={25} y={y + 22} s={12} f={C.quiet} o={easeOut(seg(t, from, from + 0.3))}>
      −30 d
    </T>
    {[...PRE, ...POST].map((d, i) => {
      const post = d > 0;
      const k = easeOut(seg(t, from + 0.1 + i * 0.04, from + 0.3 + i * 0.04));
      return <circle key={i} cx={DX(d)} cy={y} r={4} fill={post ? postC : C.primary} opacity={k * (post ? 1 - 0.65 * dim : 1)} />;
    })}
  </g>
);

/** The label moment: a white vertical mark through the axis at y. */
const LabelMark = ({ y, k, text = 'label moment' }: { y: number; k: number; text?: string }) =>
  k <= 0 ? null : (
    <g opacity={k}>
      <line x1={LX} y1={y - 34} x2={LX} y2={y + 12} stroke={C.focus} strokeWidth={2} />
      <T x={LX} y={y - 42} s={12} f={C.focus} a="middle">
        {text}
      </T>
    </g>
  );

/** A curved arrow from the label mark back (or forward) to x at axis y. */
const Reach = ({ y, x, k, c }: { y: number; x: number; k: number; c: string }) => {
  if (k <= 0) return null;
  const xe = lerp(LX, x, k);
  const mid = (LX + xe) / 2;
  const lift = Math.min(28, Math.abs(xe - LX) * 0.5);
  return <path d={`M${LX} ${y - 14} Q ${mid} ${y - 14 - lift} ${xe} ${y - 8}`} fill="none" stroke={c} strokeWidth={1.8} />;
};

// 0 · Two AUC bars on a 0–1 axis: offline grows long; live stops just past the dashed coin-flip line at 0.5. A tick
// beside "model unchanged". Beneath, customer 2322's events draw onto a timeline, the label mark drops in, and a red
// arrow reaches from the label forward to "today", the last event — the join that saw too far.
export function Hook({ t }: StepCtx) {
  const ax = (v: number) => 130 + v * 430;
  const off = easeOut(seg(t, 0.1, 0.8));
  const live = easeOut(seg(t, 0.4, 1.0));
  return (
    <Svg label="strong offline AUC. Barely better live. What got joined?" h={260}>
      <line x1={ax(0.5)} y1={18} x2={ax(0.5)} y2={100} stroke={C.secondary} strokeWidth={1.2} strokeDasharray="3 4" opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={ax(0.5)} y={14} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        coin flip
      </T>
      <T x={25} y={44} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        offline
      </T>
      <rect x={ax(0)} y={30} width={(ax(0.97) - ax(0)) * off} height={20} rx={3} fill={C.focus} />
      <T x={25} y={84} s={13} f={C.secondary} o={easeOut(seg(t, 0.3, 0.6))}>
        live
      </T>
      <rect x={ax(0)} y={70} width={(ax(0.55) - ax(0)) * live} height={20} rx={3} fill={C.badText} />
      <g opacity={easeOut(seg(t, 1.0, 1.3))}>
        <T x={575} y={86} s={12} f={C.secondary} a="end">
          model unchanged
        </T>
        <Tick x={385} y={81} k={1} />
      </g>
      <Events y={200} t={t} from={1.1} />
      <LabelMark y={200} k={easeOut(seg(t, 1.6, 1.9))} />
      <Reach y={200} x={DX(18.3)} k={easeInOut(seg(t, 1.9, 2.4))} c={C.badText} />
      <T x={DX(18.3)} y={232} s={12} f={C.badText} a="middle" o={easeOut(seg(t, 2.2, 2.5))}>
        today
      </T>
    </Svg>
  );
}

// 1 · The same timeline. Two arrows leave the label mark: red forward to today's event, white back to the −4.3 d event.
// Two chips: "naive AUC ?" and "as-of AUC ?". After the answer, everything right of the label shades red as the
// future, the naive arrow dashes, and the as-of chip lights with ✓: the one a live model gets.
export function PredictNaiveVsAsof({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const fut = on ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const ok = on ? easeOut(seg(s, 0.7, 1.2)) : 0;
  return (
    <Svg label="current value, or value as of the label? Which AUC is real?" h={260}>
      <rect x={LX} y={78} width={565 - LX} height={60} fill={C.bad} opacity={0.35 * fut} />
      <T x={565} y={92} s={12} f={C.badText} a="end" o={fut}>
        the future
      </T>
      <Events y={120} t={t} />
      <LabelMark y={120} k={easeOut(seg(t, 0.3, 0.6))} />
      <Reach y={120} x={DX(18.3)} k={easeInOut(seg(t, 0.7, 1.2))} c={C.badText} />
      <Reach y={120} x={DX(-4.3)} k={easeInOut(seg(t, 1.0, 1.4))} c={C.focus} />
      {[0, 1].map((i) => {
        const x = i === 0 ? 330 : 25;
        const k = easeOut(seg(t, 1.4 + i * 0.3, 1.8 + i * 0.3));
        const lit = i === 1 && ok > 0;
        return (
          <g key={i} opacity={k}>
            <rect
              x={x}
              y={176}
              width={245}
              height={36}
              rx={5}
              fill={C.panel}
              stroke={lit ? C.focus : i === 0 ? C.badText : C.line}
              strokeWidth={lit ? 1.8 : 1.2}
              strokeDasharray={i === 0 && fut > 0.5 ? '4 3' : undefined}
            />
            <T x={x + 16} y={199} s={13} f={i === 0 ? C.badText : C.focus}>
              {i === 0 ? 'naive AUC' : 'as-of AUC'}
            </T>
            {lit ? (
              <Tick x={x + 220} y={194} k={ok} />
            ) : (
              <T x={x + 225} y={199} s={13} f={C.focus} a="end">
                ?
              </T>
            )}
          </g>
        );
      })}
      <T x={25} y={242} s={12} f={C.focus} o={ok}>
        the only value a live model will see
      </T>
    </Svg>
  );
}

// 2 · Customer 2322's events. The label mark drops in; every event after it greys out under "never after". A cursor
// starts at the label and walks backward, slowly, to the first event at or before it, −4.3 d. It locks with a ring:
// tickets_open_total = 2. Faintly at the far right, the naive join's value, 13, which this join never reads.
export function RevealAsOfMechanism({ t }: StepCtx) {
  const y = 150;
  const dim = easeOut(seg(t, 1.0, 1.5));
  const walk = easeInOut(seg(t, 1.6, 2.8));
  const cx = lerp(LX, DX(-4.3), walk);
  const lock = easeOutBack(seg(t, 2.8, 3.2));
  return (
    <Svg label="scan backward from the label. Stop at the first point at or before it." h={260}>
      <Events y={y} t={t} dim={dim} />
      <LabelMark y={y} k={easeOut(seg(t, 0.5, 0.8))} />
      <g opacity={dim}>
        <line x1={LX + 8} y1={y + 26} x2={565} y2={y + 26} stroke={C.badText} strokeWidth={1.2} strokeDasharray="4 3" />
        <T x={565} y={y + 48} s={12} f={C.badText} a="end">
          never after
        </T>
      </g>
      {walk > 0 && (
        <g>
          <line x1={cx} y1={y - 22} x2={cx} y2={y + 22} stroke={C.second} strokeWidth={2} />
          <path d={`M${cx + 4} ${y - 30} l-8 4 l8 4`} fill="none" stroke={C.second} strokeWidth={1.6} />
        </g>
      )}
      {lock > 0 && <circle cx={DX(-4.3)} cy={y} r={9 * Math.min(1.2, lock)} fill="none" stroke={C.focus} strokeWidth={2} opacity={Math.min(1, lock)} />}
      <g opacity={easeOut(seg(t, 3.0, 3.4))}>
        <T x={25} y={30} s={13} f={C.secondary}>
          as of the label
        </T>
        <T x={300} y={30} s={16} f={C.focus} w={600}>
          tickets = 2
        </T>
      </g>
      <g opacity={0.6 * easeOut(seg(t, 3.5, 3.9))}>
        <T x={25} y={62} s={13} f={C.quiet}>
          latest ever
        </T>
        <T x={300} y={62} s={14} f={C.badText}>
          13, never read
        </T>
      </g>
    </Svg>
  );
}

// 3 · examples.py on 4,000 labels and 70,312 ticket events: two AUC bars on a 0.5–1.0 axis from the coin-flip line.
// The naive bar grows to 0.997, the as-of bar to 0.743; each number appears only once its bar has stopped. A bracket
// spans the difference, 0.254, labelled as leakage. Same model both times.
export function RevealTemporalLeakageMeasured({ t }: StepCtx) {
  const ax = (v: number) => 150 + ((v - 0.5) / 0.5) * 400;
  const n = easeOut(seg(t, 0.6, 1.6));
  const a = easeOut(seg(t, 1.2, 2.2));
  const br = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="naive AUC inflated by leakage; as-of AUC the honest number." h={220}>
      <T x={25} y={22} s={12} f={C.quiet} o={easeOut(seg(t, 0, 0.4))}>
        4,000 labels, 70,312 ticket events
      </T>
      <line x1={ax(0.5)} y1={40} x2={ax(0.5)} y2={150} stroke={C.secondary} strokeWidth={1.2} strokeDasharray="3 4" opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={ax(0.5)} y={168} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        0.5
      </T>
      <T x={25} y={70} s={13} f={C.secondary} o={easeOut(seg(t, 0.4, 0.7))}>
        naive
      </T>
      <rect x={ax(0.5)} y={56} width={(ax(0.997) - ax(0.5)) * n} height={22} rx={3} fill={C.badText} />
      <T x={ax(0.997) - 8} y={72} s={13} f={C.ink} a="end" o={easeOut(seg(t, 1.6, 1.9))}>
        0.997
      </T>
      <T x={25} y={124} s={13} f={C.secondary} o={easeOut(seg(t, 0.9, 1.2))}>
        as-of
      </T>
      <rect x={ax(0.5)} y={110} width={(ax(0.743) - ax(0.5)) * a} height={22} rx={3} fill={C.focus} />
      <T x={ax(0.743) + 10} y={126} s={13} f={C.focus} o={easeOut(seg(t, 2.2, 2.5))}>
        0.743
      </T>
      {br > 0 && (
        <g opacity={br}>
          <line x1={ax(0.743)} y1={96} x2={ax(0.997)} y2={96} stroke={C.badText} strokeWidth={1.4} />
          <line x1={ax(0.743)} y1={90} x2={ax(0.743)} y2={102} stroke={C.badText} strokeWidth={1.4} />
          <line x1={ax(0.997)} y1={90} x2={ax(0.997)} y2={102} stroke={C.badText} strokeWidth={1.4} />
        </g>
      )}
      <T x={575} y={200} s={13} f={C.badText} a="end" w={600} o={easeOut(seg(t, 3.3, 3.8))}>
        0.254 of it was leakage
      </T>
      <T x={25} y={200} s={12} f={C.quiet} o={easeOut(seg(t, 3.6, 4.0))}>
        same model
      </T>
    </Svg>
  );
}

// 4 · The 4,000 customers as one bar: 1,194 churned (red) and 2,806 stayed. The cancellation-reason column fills for
// all 1,194 churned and 0 stayed. Below, one churned customer: the label mark, and the reason recorded a few days after
// it. A cursor scans back from the label and finds nothing — empty, at the label, for anyone: 0 rows.
export function RevealPostOutcomeField({ t }: StepCtx) {
  const W = 550;
  const cw = (W * 1194) / 4000;
  const bar = easeOut(seg(t, 0, 0.6));
  const fill = easeOut(seg(t, 0.8, 1.6));
  const scan = easeInOut(seg(t, 2.4, 3.2));
  const lx = 300;
  return (
    <Svg label="a field only churners have. No join timing fixes this." h={220}>
      <g opacity={bar}>
        <rect x={25} y={24} width={cw} height={20} fill={C.bad} />
        <rect x={25 + cw} y={24} width={W - cw} height={20} fill={C.band} stroke={C.line} strokeWidth={1} />
        <T x={25} y={62} s={12} f={C.badText}>
          1,194 churned
        </T>
        <T x={575} y={62} s={12} f={C.secondary} a="end">
          2,806 stayed
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.7, 1.0))}>
        <rect x={25} y={74} width={W} height={14} fill="none" stroke={C.line} strokeWidth={1} />
        <rect x={25} y={74} width={cw * fill} height={14} fill={C.badText} opacity={0.85} />
        <T x={575} y={106} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 1.6, 1.9))}>
          reason filled: 1,194 / 0
        </T>
      </g>
      <g opacity={easeOut(seg(t, 1.8, 2.2))}>
        <line x1={120} y1={165} x2={480} y2={165} stroke={C.line} strokeWidth={1.2} />
        <line x1={lx} y1={145} x2={lx} y2={175} stroke={C.focus} strokeWidth={2} />
        <T x={lx} y={137} s={12} f={C.focus} a="middle">
          label
        </T>
        <circle cx={lx + 50} cy={165} r={5} fill={C.badText} />
        <T x={lx + 62} y={170} s={12} f={C.badText}>
          reason
        </T>
      </g>
      {scan > 0 && <line x1={lerp(lx, 130, scan)} y1={151} x2={lerp(lx, 130, scan)} y2={177} stroke={C.second} strokeWidth={2} />}
      <T x={25} y={210} s={13} f={C.focus} w={600} o={easeOut(seg(t, 3.3, 3.7))}>
        as of the label: 0 rows
      </T>
    </Svg>
  );
}

/** One TTL lane: an axis, a label mark at lx, feature dots, an optional 14-day window ending at the label. */
const Lane = ({ y, lx, dots, win, k }: { y: number; lx: number; dots: number[]; win?: number; k: number }) =>
  k <= 0 ? null : (
    <g opacity={k}>
      {win !== undefined && <rect x={lx - win} y={y - 14} width={win} height={28} fill={C.second} opacity={0.16} />}
      <line x1={60} y1={y} x2={565} y2={y} stroke={C.line} strokeWidth={1.2} />
      {dots.map((x, i) => (
        <circle key={i} cx={x} cy={y} r={4} fill={C.primary} />
      ))}
      <line x1={lx} y1={y - 22} x2={lx} y2={y + 14} stroke={C.focus} strokeWidth={2} />
    </g>
  );

// 5 · Two lanes. Too early: a label mark at the far left, every feature row to its right. Too stale: a label at the right,
// a blue 14-day window behind it, and its only feature row 30 days back, outside. Each lane asks "joins to ?". After
// the answer both read "nothing", and the stale lane's nearest row takes a red ✕: not the nearest.
export function PredictTtlEdges({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r = (i: number) => (on ? easeOut(seg(s, 0.2 + i * 0.4, 0.6 + i * 0.4)) : 0);
  const d = 8;
  return (
    <Svg label="too early, or past the TTL. What does each join to?" h={220}>
      <T x={25} y={30} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        too early
      </T>
      <Lane y={70} lx={120} dots={[260, 330, 400, 470]} k={easeOut(seg(t, 0.1, 0.5))} />
      <T x={25} y={130} s={13} f={C.secondary} o={easeOut(seg(t, 0.6, 0.9))}>
        too stale
      </T>
      <Lane y={170} lx={520} dots={[520 - 30 * d]} win={14 * d} k={easeOut(seg(t, 0.7, 1.1))} />
      <g opacity={easeOut(seg(t, 1.0, 1.3))}>
        <T x={520 - 7 * d} y={150} s={12} f={C.second} a="middle">
          14 d
        </T>
        <T x={520 - 30 * d} y={198} s={12} f={C.secondary} a="middle">
          30 d back
        </T>
      </g>
      {[0, 1].map((i) => (
        <T key={i} x={575} y={i === 0 ? 30 : 130} s={13} f={r(i) > 0 ? C.badText : C.focus} a="end" w={600} o={easeOut(seg(t, 1.4 + i * 0.3, 1.7 + i * 0.3))}>
          {r(i) > 0.5 ? 'nothing' : 'joins to ?'}
        </T>
      ))}
      <Cross x={520 - 30 * d} y={170} k={r(1)} />
    </Svg>
  );
}

// 6 · The same two lanes, run for real. Too early: a cursor walks back from the label to the axis's start and finds
// nothing: None. Too stale: a cursor walks back to the 14-day wall and stops; a dashed reach on to the 30-days-back
// row is struck through: None, not the nearest value.
export function RevealTtlMeasured({ t }: StepCtx) {
  const d = 8;
  const w1 = easeInOut(seg(t, 0.8, 1.8));
  const w2 = easeInOut(seg(t, 2.0, 2.8));
  const reach = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="both join to nothing, not the nearest guess." h={260}>
      <T x={25} y={34} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        label older than every row
      </T>
      <Lane y={80} lx={120} dots={[260, 330, 400, 470]} k={easeOut(seg(t, 0, 0.4))} />
      {w1 > 0 && <line x1={lerp(120, 62, w1)} y1={64} x2={lerp(120, 62, w1)} y2={96} stroke={C.second} strokeWidth={2} />}
      <T x={575} y={118} s={14} f={C.badText} a="end" w={600} o={easeOut(seg(t, 1.8, 2.1))}>
        None
      </T>
      <T x={25} y={152} s={13} f={C.secondary} o={easeOut(seg(t, 0.3, 0.6))}>
        30 d back, TTL 14 d
      </T>
      <Lane y={200} lx={520} dots={[520 - 30 * d]} win={14 * d} k={easeOut(seg(t, 0.3, 0.7))} />
      {w2 > 0 && <line x1={lerp(520, 520 - 14 * d, w2)} y1={184} x2={lerp(520, 520 - 14 * d, w2)} y2={216} stroke={C.second} strokeWidth={2} />}
      {reach > 0 && <line x1={520 - 14 * d} y1={200} x2={lerp(520 - 14 * d, 520 - 30 * d + 8, reach)} y2={200} stroke={C.badText} strokeWidth={1.6} strokeDasharray="4 3" />}
      <Cross x={(520 - 14 * d + 520 - 30 * d) / 2} y={200} k={easeOut(seg(t, 3.4, 3.8))} />
      <T x={575} y={244} s={14} f={C.badText} a="end" w={600} o={easeOut(seg(t, 3.6, 4.0))}>
        None, not the nearest
      </T>
    </Svg>
  );
}

// 7 · One transformation box feeds two pipes: historical backfill and live serving. An input dot runs down each pipe
// and both come out the same chip, f(x), each ✓. Then a second, dashed red box — an approximation — slides in on the
// backfill pipe; the dot runs again, comes out f′(x), and a red ≠ sits between the two outputs.
export function RevealBackfillSameLogic({ t }: StepCtx) {
  const run1 = easeInOut(seg(t, 0.6, 1.5));
  const out1 = easeOut(seg(t, 1.4, 1.8));
  const alt = easeOutBack(seg(t, 2.3, 2.9));
  const run2 = easeInOut(seg(t, 3.0, 3.6));
  const bad = easeOut(seg(t, 3.6, 4.0));
  const Out = ({ x, label, c, k }: { x: number; label: string; c: string; k: number }) =>
    k <= 0 ? null : (
      <g opacity={k}>
        <rect x={x - 55} y={176} width={110} height={30} rx={4} fill={C.panel} stroke={c} strokeWidth={1.4} />
        <T x={x} y={196} s={13} f={c} a="middle">
          {label}
        </T>
      </g>
    );
  return (
    <Svg label="one transformation, two pipes. Not two transformations." h={240}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={220} y={14} width={160} height={36} rx={6} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <T x={300} y={37} s={13} f={C.focus} a="middle">
          f, one copy
        </T>
        <path d="M300 50 C 300 90, 150 90, 150 170" fill="none" stroke={C.line} strokeWidth={1.4} />
        <path d="M300 50 C 300 90, 450 90, 450 170" fill="none" stroke={C.line} strokeWidth={1.4} />
        <T x={25} y={110} s={12} f={C.secondary}>
          backfill
        </T>
        <T x={575} y={110} s={12} f={C.secondary} a="end">
          live serving
        </T>
      </g>
      {run1 > 0 && run1 < 1 && (
        <g fill={C.second}>
          <circle cx={lerp(300, 150, run1)} cy={lerp(52, 168, run1)} r={5} />
          <circle cx={lerp(300, 450, run1)} cy={lerp(52, 168, run1)} r={5} />
        </g>
      )}
      <Out x={150} label={bad > 0.5 ? 'f′(x)' : 'f(x)'} c={bad > 0.5 ? C.badText : C.focus} k={out1} />
      <Out x={450} label="f(x)" c={C.focus} k={out1} />
      {out1 > 0 && bad <= 0 && (
        <g>
          <Tick x={222} y={190} k={out1} />
          <Tick x={522} y={190} k={out1} />
        </g>
      )}
      {alt > 0 && (
        <g opacity={Math.min(1, alt)} transform={`translate(${lerp(-80, 0, Math.min(1, alt))} 0)`}>
          <rect x={95} y={118} width={110} height={30} rx={5} fill={C.panel} stroke={C.badText} strokeWidth={1.4} strokeDasharray="4 3" />
          <T x={150} y={138} s={13} f={C.badText} a="middle">
            f′, approx
          </T>
        </g>
      )}
      {run2 > 0 && run2 < 1 && <circle cx={150} cy={lerp(150, 172, run2)} r={5} fill={C.badText} />}
      <T x={300} y={198} s={20} f={C.badText} a="middle" o={bad}>
        ≠
      </T>
      <T x={300} y={232} s={13} f={C.badText} a="middle" w={600} o={easeOut(seg(t, 4.0, 4.4))}>
        two features, one name
      </T>
    </Svg>
  );
}

// 8 · Three lanes draw in turn, each a tiny timeline. As of the label: a back-reach from the label lands on a dot.
// Post-outcome field: a red reason dot after the label, struck out — dropped. TTL: a 14-day window with the only row
// outside it — null.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, i * 1.3, i * 1.3 + 0.6));
  const ROWS = ['as of the label', 'post-outcome field', 'TTL limit'];
  const lx = 470;
  return (
    <Svg label="read as of the label; drop post-outcome fields; respect the TTL." h={260}>
      {ROWS.map((r, i) => {
        const y = 50 + i * 80;
        return (
          <g key={r} opacity={k(i)}>
            <T x={25} y={y + 5} s={13} f={C.secondary}>
              {r}
            </T>
            <line x1={260} y1={y} x2={575} y2={y} stroke={C.line} strokeWidth={1.2} />
            <line x1={lx} y1={y - 18} x2={lx} y2={y + 12} stroke={C.focus} strokeWidth={2} />
            {i === 0 && (
              <g>
                <circle cx={300} cy={y} r={4} fill={C.primary} />
                <circle cx={420} cy={y} r={4} fill={C.primary} />
                <circle cx={530} cy={y} r={4} fill={C.quiet} />
                <path d={`M${lx} ${y - 12} Q ${(lx + 420) / 2} ${y - 30} 420 ${y - 8}`} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={easeOut(seg(t, 0.5, 1.0))} />
              </g>
            )}
            {i === 1 && (
              <g>
                <circle cx={520} cy={y} r={5} fill={C.badText} />
                <Cross x={520} y={y - 20} k={easeOut(seg(t, 1.9, 2.3))} />
              </g>
            )}
            {i === 2 && (
              <g>
                <rect x={lx - 112} y={y - 12} width={112} height={24} fill={C.second} opacity={0.16} />
                <circle cx={300} cy={y} r={4} fill={C.primary} />
                <T x={575} y={y + 30} s={12} f={C.badText} a="end" o={easeOut(seg(t, 3.2, 3.6))}>
                  null
                </T>
              </g>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · A time axis: launch, then nine months later the new feature is added. Live serving runs from there on, out of the
// online code — a box the backfilling engineer can't open (dashed, locked). The backfill line runs back across history
// from a "warehouse approx" box. Before the answer the two lines meet at the seam under a "?". After it, the backfill
// line slides off the live line's level and a red step opens at the seam: two features sharing one name.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const drift = on ? easeInOut(seg(s, 0.2, 1.0)) : 0;
  const seam = 400;
  const yl = 150;
  const yb = yl + 18 * drift;
  return (
    <Svg label="backfilled from the warehouse, not the online code. Trustworthy?" h={220}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <line x1={30} y1={196} x2={570} y2={196} stroke={C.line} strokeWidth={1.2} />
        <line x1={110} y1={190} x2={110} y2={202} stroke={C.secondary} strokeWidth={1.4} />
        <T x={110} y={216} s={12} f={C.secondary} a="middle">
          launch
        </T>
        <line x1={seam} y1={176} x2={seam} y2={202} stroke={C.focus} strokeWidth={1.6} />
        <T x={seam} y={216} s={12} f={C.focus} a="middle">
          +9 months
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.4, 0.8))}>
        <rect x={420} y={20} width={155} height={34} rx={5} fill={C.panel} stroke={C.secondary} strokeWidth={1.2} strokeDasharray="4 3" />
        <T x={497} y={42} s={13} f={C.secondary} a="middle">
          online code
        </T>
        <rect x={25} y={20} width={212} height={34} rx={5} fill={C.panel} stroke={C.badText} strokeWidth={1.2} />
        <T x={131} y={42} s={13} f={C.badText} a="middle">
          warehouse approx
        </T>
        <line x1={497} y1={54} x2={497} y2={yl - 8} stroke={C.line} strokeWidth={1} strokeDasharray="2 3" />
        <line x1={131} y1={54} x2={131} y2={yb - 8} stroke={C.line} strokeWidth={1} strokeDasharray="2 3" />
      </g>
      <Draw
        pts={
          [
            [seam, yl],
            [570, yl],
          ] as Pt[]
        }
        t={t}
        from={0.8}
        to={1.4}
        stroke={C.focus}
        w={2.2}
        pen={false}
      />
      <line x1={seam} y1={yb} x2={lerp(seam, 30, easeInOut(seg(t, 1.2, 2.0)))} y2={yb} stroke={C.badText} strokeWidth={2.2} />
      {drift > 0 && <line x1={seam} y1={yl} x2={seam} y2={yb} stroke={C.badText} strokeWidth={2.2} opacity={drift} />}
      {!on ? (
        <T x={seam} y={yl - 16} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
          ?
        </T>
      ) : (
        <T x={seam - 12} y={yl - 14} s={13} f={C.badText} a="end" w={600} o={easeOut(seg(s, 0.8, 1.2))}>
          two features, one name
        </T>
      )}
    </Svg>
  );
}
