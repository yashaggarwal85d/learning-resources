import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the outer row under the spotlight and the rows it picks, cherryText = the blocked or
// empty case, crema = data, taupe = structure. Customers c1..c4 own 5, 2, 0 and 4 orders; the cap is 3.

const OWN = [5, 2, 0, 4];
const NAMES = ['c1', 'c2', 'c3', 'c4'];
const PICK = OWN.map((n) => Math.min(n, 3));

function Customers({ lit = -1, x = 25 }: { lit?: number; x?: number }) {
  return (
    <g>
      {NAMES.map((n, i) => (
        <g key={n}>
          <rect x={x} y={44 + i * 62} width={80} height={44} rx={8} fill={C.cocoa} stroke={lit === i ? C.caramel : C.mocha} strokeWidth={lit === i ? 3 : 1} />
          <T x={x + 40} y={72 + i * 62} s={14} f={C.crema} a="middle">{n}</T>
        </g>
      ))}
    </g>
  );
}
function OrderRow({ i, k, picked, o = 1 }: { i: number; k: number; picked: boolean; o?: number }) {
  return <rect x={200 + k * 44} y={52 + i * 62} width={36} height={28} rx={6} fill={picked ? C.caramel : C.cocoa} stroke={picked ? C.caramel : C.mocha} opacity={o} />;
}

// 1 · The question.
export function Question({ t }: StepCtx) {
  return (
    <Svg label="Four customers and their orders; the 3 most recent per customer is the question" h={320}>
      <Customers />
      {OWN.map((n, i) => Array.from({ length: n }, (_, k) => <OrderRow key={`${i}-${k}`} i={i} k={k} picked={false} o={easeOut(seg(t, 0.2 + i * 0.3, 0.8 + i * 0.3))} />))}
      <T x={300} y={308} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 1.8, 2.6))}>newest 3 of each customer's own orders</T>
    </Svg>
  );
}

// 2 · The wall.
export function Wall({ t }: StepCtx) {
  const down = easeOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="Without LATERAL a subquery cannot see the outer row; with it, the wall is gone" h={300}>
      <rect x={30} y={70} width={150} height={60} rx={10} fill={C.cocoa} stroke={C.mocha} />
      <T x={105} y={106} s={14} f={C.crema} a="middle">customers c</T>
      <rect x={380} y={70} width={190} height={60} rx={10} fill={C.cocoa} stroke={C.mocha} />
      <T x={475} y={106} s={14} f={C.crema} a="middle">(subquery) o</T>
      <rect x={265} y={50} width={14} height={100 * (1 - down) + 6} rx={4} fill={C.cherryText} opacity={0.4 + 0.6 * (1 - down)} />
      <T x={272} y={44} s={13} f={C.cherryText} a="middle" o={1 - down}>cannot see c.customer_id</T>
      <line x1={180} y1={100} x2={380} y2={100} stroke={C.caramel} strokeWidth={3} opacity={down} />
      <T x={280} y={194} s={16} f={C.caramel} a="middle" w={700} o={down}>LATERAL: may use c.customer_id</T>
    </Svg>
  );
}

// 3 · The spotlight sweeps.
export function Spotlight({ t }: StepCtx) {
  const p = clamp(t / 4.4) * 4;
  const lit = Math.min(3, Math.floor(p));
  return (
    <Svg label="For each customer the subquery reruns and keeps the newest 3 of that customer's orders" h={320}>
      <Customers lit={lit} />
      {OWN.map((n, i) =>
        Array.from({ length: n }, (_, k) => {
          const done = i < lit || (i === lit && p - lit > 0.4);
          return <OrderRow key={`${i}-${k}`} i={i} k={k} picked={done && k < 3} />;
        }),
      )}
      <T x={470} y={72 + lit * 62} s={14} f={C.caramel}>{`keeps ${PICK[lit]}`}</T>
    </Svg>
  );
}

// 4 · Predict: count.
export function CountPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="CROSS JOIN LATERAL returns 3, 2, 0 and 3 rows per customer" h={300}>
      <Customers />
      {PICK.map((n, i) => Array.from({ length: n }, (_, k) => <OrderRow key={`${i}-${k}`} i={i} k={k} picked={answered} o={answered ? 1 : 0.35} />))}
      {!answered && <T x={470} y={160} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={470} y={160} s={20} f={C.caramel} a="middle" w={700}>3 + 2 + 0 + 3 = 8</T>}
    </Svg>
  );
}

// 5 · LEFT JOIN LATERAL.
export function LeftKeep({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="With LEFT JOIN LATERAL the customer with no orders still appears, with NULLs" h={300}>
      <Customers />
      {PICK.map((n, i) => Array.from({ length: n }, (_, k) => <OrderRow key={`${i}-${k}`} i={i} k={k} picked />))}
      <rect x={200} y={52 + 2 * 62} width={80} height={28} rx={6} fill="none" stroke={C.latte} strokeDasharray="5 4" opacity={a} />
      <T x={290} y={72 + 2 * 62} s={13} f={C.latte} o={a}>NULLs, but c3 is kept</T>
      <T x={470} y={160} s={20} f={C.caramel} a="middle" w={700} o={a}>9 rows</T>
    </Svg>
  );
}

// 6 · Not just an anti-join.
export function NotAntiJoin({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.2));
  const b = easeOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="An anti-join returns only the customers with no match; LATERAL returns them and the best matches' columns" h={300}>
      <T x={25} y={44} s={15} f={C.latte}>anti-join</T>
      <rect x={25} y={58} width={90} height={40} rx={8} fill={C.cocoa} stroke={C.mocha} opacity={a} />
      <T x={70} y={83} s={14} f={C.crema} a="middle" o={a}>c3</T>
      <T x={140} y={83} s={13} f={C.latte} o={a}>yes/no only</T>
      <T x={25} y={160} s={15} f={C.caramel}>LEFT JOIN LATERAL</T>
      <g opacity={b}>
        {['c1', 'c2', 'c3', 'c4'].map((n, i) => (
          <g key={n}>
            <rect x={25 + i * 100} y={176} width={90} height={40} rx={8} fill={C.cocoa} stroke={C.caramel} />
            <T x={70 + i * 100} y={201} s={14} f={C.crema} a="middle">{n}</T>
          </g>
        ))}
        <T x={25} y={248} s={13} f={C.latte}>everyone, plus the best match's own columns</T>
      </g>
    </Svg>
  );
}

// 7 · Dialects.
export function Dialects({ t }: StepCtx) {
  const rows = [['JOIN LATERAL', 'CROSS APPLY'], ['LEFT JOIN LATERAL … ON true', 'OUTER APPLY']];
  return (
    <Svg label="PostgreSQL LATERAL forms and the SQL Server APPLY forms that match them" h={260}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.9, i * 0.9 + 0.7))}>
          <T x={25} y={70 + i * 80} s={15} f={C.caramel} w={700}>{r[0]}</T>
          <T x={25} y={98 + i * 80} s={14} f={C.latte}>= {r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 8 · Pull-up.
export function PullUp({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.6));
  return (
    <Svg label="A simple equality subquery is pulled up into a join" h={280}>
      <rect x={30} y={70} width={160} height={50} rx={8} fill={C.cocoa} stroke={C.mocha} />
      <T x={110} y={101} s={13} f={C.crema} a="middle">foo, LATERAL (…)</T>
      <line x1={190} y1={95} x2={380} y2={95} stroke={C.caramel} strokeWidth={3} markerEnd="none" opacity={a} />
      <rect x={380} y={70} width={170} height={50} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={a} />
      <T x={465} y={101} s={13} f={C.crema} a="middle" o={a}>foo JOIN bar</T>
      <T x={300} y={190} s={15} f={C.latte} a="middle" o={easeOut(seg(t, 2.0, 2.8))}>same result, reorderable like any join</T>
    </Svg>
  );
}

// 9 · Predict: limit blocks pull-up.
export function LimitPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Adding ORDER BY and LIMIT to the subquery blocks the pull-up" h={280}>
      <rect x={30} y={70} width={220} height={50} rx={8} fill={C.cocoa} stroke={C.mocha} />
      <T x={140} y={101} s={13} f={C.crema} a="middle">LATERAL (… ORDER BY … LIMIT 1)</T>
      {answered ? (
        <>
          <line x1={250} y1={95} x2={400} y2={95} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 5" />
          <T x={325} y={84} s={20} f={C.cherryText} a="middle" w={700}>✕</T>
          <rect x={400} y={70} width={170} height={50} rx={8} fill="none" stroke={C.cherryText} strokeDasharray="5 4" />
          <T x={485} y={101} s={13} f={C.cherryText} a="middle">no plain join</T>
          <T x={300} y={190} s={15} f={C.crema} a="middle">stays a per-row nested loop</T>
        </>
      ) : (
        <T x={430} y={110} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>
      )}
    </Svg>
  );
}

// 10 · The index decides the price.
export function IndexPrice({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="Per-row index scan versus one big sort" h={300}>
      <T x={25} y={44} s={15} f={C.caramel} w={700}>LATERAL + index (customer, time)</T>
      <rect x={25} y={58} width={300 * a} height={20} rx={6} fill={C.caramel} />
      <T x={25} y={104} s={13} f={C.latte} o={a}>each run stops after the cap</T>
      <T x={25} y={170} s={15} f={C.cherryText} w={700}>window function</T>
      <rect x={25} y={184} width={460 * b} height={20} rx={6} fill={C.cherry} />
      <T x={25} y={230} s={13} f={C.latte} o={b}>sorts the whole joined set once</T>
      <T x={300} y={278} s={13} f={C.taupe} a="middle">which is cheaper depends on data and index</T>
    </Svg>
  );
}

// 11 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['per-row sort or cap', 'LATERAL'], ['keep every outer row', 'LEFT JOIN LATERAL … ON true'], ['top-N per group', 'index the correlated columns']];
  return (
    <Svg label="Three rules for LATERAL" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={18} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveApply({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="OUTER APPLY corresponds to LEFT JOIN LATERAL ON true" h={240}>
      <T x={40} y={100} s={20} f={C.latte}>OUTER APPLY =</T>
      {answered ? <T x={230} y={104} s={20} f={C.caramel} w={700}>LEFT JOIN LATERAL … ON true</T> : <T x={290} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProveCap({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A customer with 2 orders under a cap of 3 contributes 2 rows" h={240}>
      {[0, 1].map((k) => <rect key={k} x={60 + k * 60} y={80} width={46} height={34} rx={6} fill={C.caramel} />)}
      <rect x={180} y={80} width={46} height={34} rx={6} fill="none" stroke={C.latte} strokeDasharray="4 3" />
      <T x={300} y={104} s={20} f={C.latte}>cap 3 →</T>
      {answered ? <T x={430} y={106} s={22} f={C.caramel} w={700}>2 rows</T> : <T x={430} y={112} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
