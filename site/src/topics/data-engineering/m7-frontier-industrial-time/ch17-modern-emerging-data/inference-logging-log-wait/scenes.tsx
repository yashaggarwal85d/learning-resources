import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Inference logging and log-and-wait, drawn from examples.py run against Postgres 16: request 1's logged vector
// (4, 3, 18857, 684, churn-model-v3) and its label 40 days later, 2,000 joined rows with 0 mismatches, the storage
// arithmetic 1,000,000 × 2,048 B × 365 = 747,520,000,000 B = 696.2 GiB a year, and 2,000 of 2,000 rows still unique
// once the customer id is redacted.

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

/** A box with a centred label. */
const Card = ({ x, y, w, h = 30, l, c = C.primary, o = 1, dash }: { x: number; y: number; w: number; h?: number; l: string; c?: string; o?: number; dash?: boolean }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={5} fill={C.panel} stroke={c === C.primary ? C.line : c} strokeWidth={1.3} strokeDasharray={dash ? '4 3' : undefined} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={c} a="middle">
        {l}
      </T>
    </g>
  );

/** A short arrow from (x1,y) to (x2,y). */
const Arr = ({ x1, x2, y, k = 1, c = C.line }: { x1: number; x2: number; y: number; k?: number; c?: string }) =>
  k <= 0 ? null : (
    <g stroke={c} strokeWidth={1.4} fill="none" opacity={Math.min(1, k)}>
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <path d={`M${x2 - 6} ${y - 4} L${x2} ${y} L${x2 - 6} ${y + 4}`} />
    </g>
  );

// examples.py's request 1, logged by churn-model-v3 on 2026-01-01: tickets_open_total 4, orders_last_30d 3,
// avg_order_value_cents 18,857, days_since_signup 684, customer_id 444; its label arrives 40 days later, churned false.
const VEC = '4, 3, 18857, 684';

// 0 · Two feature vectors of twenty cells: offline and served. They fill cell by cell, identical, until one cell
// disagrees — both turn red, joined by ≠: one in twenty. Below, two code cards, offline and serving, each earn a ✓:
// both look correct on their own.
export function Hook({ t }: StepCtx) {
  const n = Math.min(20, Math.floor(seg(t, 0.1, 1.3) * 20.99));
  const bad = 13;
  const flag = easeOut(seg(t, 1.3, 1.6));
  return (
    <Svg label="one feature in twenty disagrees. Both code paths look correct." h={220}>
      {[0, 1].map((r) => (
        <g key={r}>
          <T x={25} y={36 + r * 40} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
            {r === 0 ? 'offline' : 'served'}
          </T>
          {Array.from({ length: 20 }, (_, i) => (
            <rect
              key={i}
              x={130 + i * 22}
              y={22 + r * 40}
              width={18}
              height={18}
              rx={2}
              fill={i < n ? (i === bad && flag > 0 ? C.badText : C.primary) : C.band}
              opacity={i < n ? (i === bad ? 1 : 0.7) : 1}
            />
          ))}
        </g>
      ))}
      <T x={130 + bad * 22 + 9} y={66} s={14} f={C.badText} a="middle" o={flag}>
        ≠
      </T>
      <T x={575} y={112} s={13} f={C.badText} a="end" o={easeOut(seg(t, 1.5, 1.8))}>
        1 in 20
      </T>
      <Card x={25} y={140} w={220} l="offline code" o={easeOut(seg(t, 1.7, 2.0))} />
      <Card x={300} y={140} w={220} l="serving code" o={easeOut(seg(t, 1.9, 2.2))} />
      <Tick x={257} y={152} k={easeOut(seg(t, 2.0, 2.3))} />
      <Tick x={532} y={152} k={easeOut(seg(t, 2.2, 2.5))} />
    </Svg>
  );
}

// 1 · Left: two blocks of code lines, and a highlight scanning down them line by line — reread. Right: two value chips,
// logged and offline, joined by "=?". After the answer the scan stops, greyed, and the chips light with ✓: two numbers
// that either match or don't.
export function PredictWhatLoggingBuys({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r = on ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const line = on ? -1 : Math.floor((t * 4) % 8);
  return (
    <Svg label="read the code again, or diff two logged numbers. Which finds it?" h={220}>
      {[0, 1].map((b) => (
        <g key={b} opacity={easeOut(seg(t, b * 0.2, 0.4 + b * 0.2)) * (1 - 0.6 * r)}>
          {Array.from({ length: 4 }, (_, i) => {
            const k = b * 4 + i;
            return <rect key={i} x={25 + (i % 2) * 18} y={24 + b * 84 + i * 18} width={[180, 150, 200, 120][i]} height={8} rx={2} fill={k === line ? C.second : C.line} />;
          })}
        </g>
      ))}
      <T x={25} y={208} s={12} f={C.secondary} o={easeOut(seg(t, 0.5, 0.8))}>
        reread both
      </T>
      <g opacity={easeOut(seg(t, 0.8, 1.2))}>
        <Card x={330} y={40} w={245} l="logged value" c={r > 0.5 ? C.focus : C.primary} />
        <Card x={330} y={120} w={245} l="offline value" c={r > 0.5 ? C.focus : C.primary} />
        <T x={452} y={104} s={14} f={C.focus} a="middle">
          {r > 0.5 ? 'diff' : '=?'}
        </T>
      </g>
      <T x={575} y={208} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 1.0, 1.3))}>
        diff two numbers
      </T>
      <Tick x={355} y={203} k={r} />
    </Svg>
  );
}

// 2 · The serving pipeline: raw input → transform → model → decision, a dot running through it. A dashed tap before the
// transform is struck ✕. A solid tap after it drops to a log record that fills field by field with request 1's real
// row: the vector 4, 3, 18857, 684; churn-model-v3; request 1; served 2026-01-01.
export function RevealLoggingMechanism({ t }: StepCtx) {
  const flow = seg(t, 0.4, 1.2);
  const fx = flow < 1 ? lerp(25, 575, flow) : -99;
  const ROWS: [string, string][] = [
    ['vector', VEC],
    ['model', 'churn-model-v3'],
    ['request', '1'],
    ['served', '2026-01-01'],
  ];
  return (
    <Svg label="a log point after the transformation, not before it." h={240}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <Card x={25} y={20} w={120} l="raw input" />
        <Card x={175} y={20} w={125} l="transform" />
        <Card x={330} y={20} w={100} l="model" />
        <Card x={460} y={20} w={115} l="decision" />
        <Arr x1={145} x2={173} y={35} />
        <Arr x1={300} x2={328} y={35} />
        <Arr x1={430} x2={458} y={35} />
      </g>
      {fx > 0 && <circle cx={fx} cy={35} r={4} fill={C.second} />}
      <g opacity={easeOut(seg(t, 1.2, 1.5))}>
        <line x1={160} y1={36} x2={160} y2={84} stroke={C.badText} strokeWidth={1.4} strokeDasharray="4 3" />
        <Cross x={160} y={90} k={easeOut(seg(t, 1.5, 1.8))} />
      </g>
      <line x1={315} y1={36} x2={315} y2={lerp(36, 100, easeInOut(seg(t, 1.9, 2.3)))} stroke={C.focus} strokeWidth={2} />
      <g opacity={easeOut(seg(t, 2.2, 2.5))}>
        <rect x={190} y={100} width={385} height={130} rx={6} fill={C.panel} stroke={C.focus} strokeWidth={1.3} />
      </g>
      {ROWS.map(([l, v], i) => (
        <g key={l} opacity={easeOut(seg(t, 2.5 + i * 0.35, 2.8 + i * 0.35))}>
          <T x={205} y={126 + i * 28} s={12} f={C.secondary}>
            {l}
          </T>
          <T x={560} y={126 + i * 28} s={13} f={C.focus} a="end">
            {v}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · A day axis from served (day 0) to day 40; a label dot travels out along it and lands at +40 d: request 1,
// churned no. Three logged rows sit on the left. The label reaches back to row #1 by its request id; the row lights and
// a joined training row appears — the logged vector plus the label. 2,000 rows, 0 mismatches.
export function RevealLogAndWaitJoin({ t }: StepCtx) {
  const X = (d: number) => 120 + d * 11;
  const go = easeInOut(seg(t, 0.4, 1.4));
  const link = easeInOut(seg(t, 1.7, 2.4));
  const LOG: [string, string][] = [
    ['#1', VEC],
    ['#2', '3, 0, 17438, 537'],
    ['#3', '2, 1, 11618, 592'],
  ];
  return (
    <Svg label="a label arrives weeks later. Join by request id, no recomputation." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={X(0)} y1={30} x2={X(40)} y2={30} stroke={C.line} strokeWidth={1.2} />
        <line x1={X(0)} y1={22} x2={X(0)} y2={38} stroke={C.focus} strokeWidth={1.6} />
        <T x={X(0) - 10} y={35} s={12} f={C.secondary} a="end">
          served
        </T>
      </g>
      {go > 0 && <circle cx={X(40 * go)} cy={30} r={5} fill={C.second} />}
      <T x={575} y={56} s={12} f={C.second} a="end" o={easeOut(seg(t, 1.3, 1.6))}>
        +40 d
      </T>
      <g opacity={easeOut(seg(t, 1.3, 1.6))}>
        <rect x={440} y={68} width={135} height={28} rx={4} fill={C.panel} stroke={C.second} strokeWidth={1.3} />
        <T x={507} y={87} s={12} f={C.second} a="middle">
          #1 churned: no
        </T>
      </g>
      {LOG.map(([id, v], i) => (
        <g key={id} opacity={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))}>
          <rect x={25} y={68 + i * 30} width={260} height={26} rx={3} fill={i === 0 && link > 0.9 ? C.band : 'none'} stroke={i === 0 && link > 0.9 ? C.focus : C.line} strokeWidth={1} />
          <T x={38} y={86 + i * 30} s={12} f={C.secondary}>
            {id}
          </T>
          <T x={78} y={86 + i * 30} s={12} f={C.primary}>
            {v}
          </T>
        </g>
      ))}
      {link > 0 && <line x1={440} y1={82} x2={lerp(440, 286, link)} y2={82} stroke={C.focus} strokeWidth={1.6} strokeDasharray="4 3" />}
      <T x={300} y={170} s={13} f={C.focus} a="middle" w={600} o={easeOut(seg(t, 2.5, 2.9))}>
        {`${VEC} → no`}
      </T>
      <T x={575} y={206} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(t, 3.2, 3.6))}>
        2,000 rows, 0 mismatches
      </T>
    </Svg>
  );
}

// 4 · Three lanes, each model → log → decision, requests flowing as dots. Live: reaches the decision. Shadow: logs the
// same way, then its arrow to the decision stops at a red ✕. Canary: logs the same way and reaches the decision for a
// slice of traffic, every third dot.
export function RevealShadowVsCanary({ t }: StepCtx) {
  const LANES = ['live', 'shadow', 'canary'];
  return (
    <Svg label="both log the same way. Only one reaches the decision." h={220}>
      {LANES.map((l, i) => {
        const y = 40 + i * 66;
        const k = easeOut(seg(t, i * 0.3, 0.4 + i * 0.3));
        const dots = [0, 1, 2, 3, 4, 5].map((j) => (seg(t, 1.0 + j * 0.35, 2.2 + j * 0.35) * 1) % 1.0001);
        return (
          <g key={l} opacity={k}>
            <T x={25} y={y + 5} s={13} f={i === 1 ? C.second : C.secondary}>
              {l}
            </T>
            <Card x={110} y={y - 15} w={90} l="model" />
            <Arr x1={200} x2={262} y={y} />
            <rect x={264} y={y - 13} width={52} height={26} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.3} />
            <T x={290} y={y + 5} s={12} f={C.focus} a="middle">
              log
            </T>
            {i === 1 ? (
              <g>
                <line x1={316} y1={y} x2={400} y2={y} stroke={C.line} strokeWidth={1.4} strokeDasharray="4 3" />
                <Cross x={414} y={y} k={easeOut(seg(t, 1.8, 2.2))} />
              </g>
            ) : (
              <Arr x1={316} x2={458} y={y} />
            )}
            <Card x={460} y={y - 15} w={115} l="decision" c={i === 1 ? C.quiet : C.primary} />
            {dots.map((p, j) => {
              if (p <= 0 || p >= 1) return null;
              const x = lerp(200, i === 1 ? 400 : 458, p);
              if (i === 2 && j % 3 !== 0 && x > 316) return null;
              if (x > 258 && x < 322) return null;
              return <circle key={j} cx={x} cy={y} r={4} fill={C.second} />;
            })}
            {i === 2 && (
              <T x={387} y={y + 26} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
                a slice
              </T>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

/** A log-scale byte axis, KB to PB, at height y. */
const ByteAxis = ({ y, o }: { y: number; o: number }) => (
  <g opacity={o}>
    <line x1={60} y1={y} x2={540} y2={y} stroke={C.line} strokeWidth={1.2} />
    {['KB', 'MB', 'GB', 'TB', 'PB'].map((u, i) => (
      <g key={u}>
        <line x1={60 + i * 120} y1={y - 5} x2={60 + i * 120} y2={y + 5} stroke={C.line} strokeWidth={1.2} />
        <T x={60 + i * 120} y={y + 22} s={12} f={C.secondary} a="middle">
          {u}
        </T>
      </g>
    ))}
  </g>
);
/** x on the ByteAxis for a byte count. */
const BX = (b: number) => 60 + ((Math.log10(b) - 3) / 12) * 480;

// 5 · Three factors land one after another: 1,000,000 a day × 2,048 B × 365 days = ?. Beneath, a log-scale byte axis
// from KB to PB. After the answer a marker slides along it and settles just short of TB: on the order of a terabyte.
export function PredictStorageCost({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const m = on ? easeInOut(seg(s, 0.2, 1.2)) : 0;
  const F = ['1,000,000 /day', '× 2,048 B', '× 365 d'];
  return (
    <Svg label="one million requests a day, two kilobytes each. How much a year?" h={220}>
      {F.map((f, i) => (
        <T key={f} x={25 + i * 190} y={50} s={13} f={C.primary} o={easeOut(seg(t, i * 0.3, 0.3 + i * 0.3))}>
          {f}
        </T>
      ))}
      <T x={575} y={92} s={14} f={C.focus} a="end" o={easeOut(seg(t, 1.0, 1.3))}>
        = ?
      </T>
      <ByteAxis y={150} o={easeOut(seg(t, 1.1, 1.5))} />
      {m > 0 && (
        <g>
          <circle cx={lerp(BX(2048), BX(747520000000), m)} cy={150} r={7} fill={C.focus} />
          <T x={BX(747520000000)} y={126} s={13} f={C.focus} a="middle" o={easeOut(seg(s, 1.1, 1.4))}>
            about a TB
          </T>
        </g>
      )}
    </Svg>
  );
}

// 6 · The arithmetic, one row at a time, while a marker on a KB–PB log axis jumps with each product: 2,048 B a vector;
// × 1,000,000 a day = 2,048,000,000 B; × 365 = 747,520,000,000 B; ÷ 1024³ = 696.2 GiB a year.
export function RevealStorageMeasured({ t }: StepCtx) {
  const ROWS: [string, string][] = [
    ['one vector', '2,048 B'],
    ['× 1,000,000 a day', '2,048,000,000 B'],
    ['× 365 days', '747,520,000,000 B'],
    ['÷ 1024³', '696.2 GiB'],
  ];
  const VALS = [2048, 2048000000, 747520000000, 747520000000];
  const step = (i: number) => easeInOut(seg(t, 0.3 + i * 0.8, 0.9 + i * 0.8));
  let x = BX(VALS[0]);
  for (let i = 1; i < 4; i++) x = lerp(x, BX(VALS[i]), step(i));
  return (
    <Svg label="rate times width times retention, measured." h={200}>
      {ROWS.map(([l, v], i) => (
        <g key={l} opacity={step(i)}>
          <T x={25} y={24 + i * 28} s={13} f={C.secondary}>
            {l}
          </T>
          <T x={575} y={24 + i * 28} s={13} f={i === 3 ? C.focus : C.primary} a="end">
            {v}
          </T>
        </g>
      ))}
      <ByteAxis y={150} o={easeOut(seg(t, 0, 0.3))} />
      {step(0) > 0 && <circle cx={x} cy={150} r={7} fill={C.focus} />}
    </Svg>
  );
}

// 7 · Request 1's logged row as five cells: customer 444, tickets 4, orders 3, avg ¢ 18,857, days 684. The customer
// cell is blacked out — redacted. A bracket spans the four left. Beneath, all 2,000 logged rows as a 100 × 20 grid; a
// sweep lights each row whose remaining four fields are unique in the log: every one. 2,000 of 2,000.
export function RevealPiiRetention({ t }: StepCtx) {
  const CELLS: [string, string][] = [
    ['customer', '444'],
    ['tickets', '4'],
    ['orders', '3'],
    ['avg ¢', '18,857'],
    ['days', '684'],
  ];
  const red = easeOut(seg(t, 0.7, 1.1));
  const sweep = Math.floor(seg(t, 1.6, 3.2) * 2000);
  return (
    <Svg label="customer id redacted. The rest still describes one person." h={220}>
      {CELLS.map(([l, v], i) => {
        const x = 25 + i * 110;
        return (
          <g key={l} opacity={easeOut(seg(t, i * 0.1, 0.3 + i * 0.1))}>
            <T x={x + 51} y={18} s={12} f={C.secondary} a="middle">
              {l}
            </T>
            <rect x={x} y={26} width={102} height={30} rx={4} fill={C.panel} stroke={i === 0 ? C.line : sweep > 0 ? C.badText : C.line} strokeWidth={1.2} />
            <T x={x + 51} y={46} s={13} f={C.primary} a="middle">
              {v}
            </T>
            {i === 0 && red > 0 && <rect x={x + 4} y={30} width={94 * red} height={22} rx={2} fill={C.ink} stroke={C.secondary} strokeWidth={1} />}
          </g>
        );
      })}
      <path d="M135 64 v6 h432 v-6" fill="none" stroke={C.badText} strokeWidth={1.2} opacity={easeOut(seg(t, 1.2, 1.5))} />
      {Array.from({ length: 2000 }, (_, i) => (
        <rect key={i} x={25 + (i % 100) * 5.5} y={86 + Math.floor(i / 100) * 4.4} width={4.5} height={3.4} fill={i < sweep ? C.badText : C.band} />
      ))}
      <T x={575} y={210} s={13} f={C.badText} a="end" w={600} o={easeOut(seg(t, 3.2, 3.6))}>
        2,000 of 2,000 still unique
      </T>
    </Svg>
  );
}

// 8 · Three lanes draw in turn. Log the exact vector: a tap after the transform. Join the label later: a label chip
// reaching back to a logged row by id. Know the cost and the exposure: 696.2 GiB a year, and 2,000 of 2,000 unique.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, i * 1.3, i * 1.3 + 0.6));
  return (
    <Svg label="log the exact vector. Join the label later. Know the cost and the exposure." h={240}>
      <g opacity={k(0)}>
        <T x={25} y={44} s={13} f={C.secondary}>
          log the exact vector
        </T>
        <Card x={330} y={22} w={110} l="transform" />
        <Arr x1={440} x2={500} y={37} />
        <line x1={470} y1={37} x2={470} y2={lerp(37, 66, easeOut(seg(t, 0.5, 0.9)))} stroke={C.focus} strokeWidth={2} />
        <T x={575} y={44} s={12} f={C.focus} a="end">
          log
        </T>
      </g>
      <g opacity={k(1)}>
        <T x={25} y={124} s={13} f={C.secondary}>
          join the label later
        </T>
        <rect x={300} y={106} width={90} height={26} rx={3} fill="none" stroke={C.line} strokeWidth={1} />
        <T x={345} y={124} s={12} f={C.primary} a="middle">
          #1
        </T>
        <rect x={470} y={106} width={105} height={26} rx={3} fill={C.panel} stroke={C.second} strokeWidth={1.2} />
        <T x={522} y={124} s={12} f={C.second} a="middle">
          label
        </T>
        <line x1={470} y1={119} x2={lerp(470, 392, easeInOut(seg(t, 1.8, 2.3)))} y2={119} stroke={C.focus} strokeWidth={1.6} strokeDasharray="4 3" />
      </g>
      <g opacity={k(2)}>
        <T x={25} y={204} s={13} f={C.secondary}>
          cost and exposure
        </T>
        <T x={575} y={192} s={13} f={C.focus} a="end">
          696.2 GiB a year
        </T>
        <T x={575} y={216} s={13} f={C.badText} a="end">
          2,000 of 2,000 unique
        </T>
      </g>
    </Svg>
  );
}

// 9 · A log that is never trimmed: one bar per year stacks up, each year adding 696.2 GiB of vectors. Before the answer,
// "safe?" waits. After it, the stack turns red, its height reads 3,481 GiB at year five, and a ✕ marks the missing
// retention policy: a liability that compounds.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r = on ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const base = 190;
  return (
    <Svg label="every vector, full sample rate, forever, no retention policy. Safe?" h={220}>
      {[1, 2, 3, 4, 5].map((y, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.3, 0.5 + i * 0.3));
        const h = 28 * y * k;
        return (
          <g key={y}>
            <rect x={40 + i * 56} y={base - h} width={40} height={h} rx={3} fill={r > 0.5 ? C.badText : C.primary} opacity={0.4 + 0.12 * i} />
            <T x={60 + i * 56} y={base + 22} s={12} f={C.secondary} a="middle" o={k}>
              {`y${y}`}
            </T>
          </g>
        );
      })}
      <T x={25} y={24} s={12} f={C.secondary} o={easeOut(seg(t, 0.2, 0.5))}>
        +696.2 GiB every year, kept
      </T>
      {!on ? (
        <T x={575} y={90} s={14} f={C.focus} a="end" o={easeOut(seg(t, 1.8, 2.2))}>
          safe?
        </T>
      ) : (
        <g opacity={r}>
          <T x={575} y={60} s={13} f={C.badText} a="end">
            3,481 GiB by year 5
          </T>
          <T x={575} y={90} s={13} f={C.badText} a="end">
            no retention policy
          </T>
          <Cross x={322} y={85} k={1} />
        </g>
      )}
    </Svg>
  );
}
