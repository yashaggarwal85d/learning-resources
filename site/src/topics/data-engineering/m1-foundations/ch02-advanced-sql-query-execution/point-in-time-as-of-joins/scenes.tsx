import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the correct (closest earlier) match, cherryText = a wrong or leaking match, crema = data,
// latte = labels, taupe = structure. Prices change on day 1 (10), day 10 (12), day 20 (11); orders on days 5, 9, 12, 25.

const PRICES = [{ d: 1, p: 10 }, { d: 10, p: 12 }, { d: 20, p: 11 }];
const ORDERS = [5, 9, 12, 25];
const x = (d: number) => 30 + (d / 26) * 540;

function Timeline({ y = 110, show = 1, hi = -1 }: { y?: number; show?: number; hi?: number }) {
  return (
    <g>
      <line x1={25} y1={y} x2={575} y2={y} stroke={C.taupe} strokeWidth={2} />
      {PRICES.map((p) => (
        <g key={p.d} opacity={clamp(show)}>
          <rect x={x(p.d) - 22} y={y - 64} width={44} height={30} rx={6} fill={C.cocoa} stroke={C.mocha} />
          <T x={x(p.d)} y={y - 43} s={14} f={C.crema} a="middle">{String(p.p)}</T>
          <line x1={x(p.d)} y1={y - 34} x2={x(p.d)} y2={y} stroke={C.mocha} />
        </g>
      ))}
      {ORDERS.map((d, i) => (
        <g key={d}>
          <circle cx={x(d)} cy={y} r={8} fill={i === hi ? C.caramel : C.crema} />
          <T x={x(d)} y={y + 28} s={13} f={C.latte} a="middle">{String(d)}</T>
        </g>
      ))}
    </g>
  );
}
const priceAt = (d: number) => [...PRICES].reverse().find((p) => p.d <= d)!;

// 1 · Problem.
export function Problem({ t }: StepCtx) {
  const k = Math.min(3, Math.floor(seg(t, 1.0, 3.2) * 4));
  return (
    <Svg label="Prices change on days 1, 10 and 20; each order needs the price in effect on its day" h={260}>
      <Timeline hi={k} show={easeOut(seg(t, 0.2, 1.0))} />
      <T x={300} y={200} s={16} f={C.caramel} a="middle" o={easeOut(seg(t, 1.2, 2.0))}>{`order day ${ORDERS[k]} → price ${priceAt(ORDERS[k]).p}`}</T>
    </Svg>
  );
}

// 2 · All pairs.
export function AllPairs({ t }: StepCtx) {
  return (
    <Svg label="Joining on product alone pairs each order with every price" h={300}>
      <Timeline y={120} />
      {ORDERS.flatMap((d, i) => PRICES.map((p, j) => (
        <line key={`${i}-${j}`} x1={x(d)} y1={120} x2={x(p.d)} y2={86} stroke={C.cherryText} strokeWidth={1} opacity={0.5 * easeOut(seg(t, 0.2 + (i * 3 + j) * 0.18, 0.6 + (i * 3 + j) * 0.18))} />
      )))}
      <T x={300} y={230} s={20} f={C.cherryText} a="middle" w={700} o={easeOut(seg(t, 2.6, 3.4))}>4 × 3 = 12 rows</T>
    </Svg>
  );
}

// 3 · Predict count.
export function CountPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The inequality keeps every price that started on or before the order" h={300}>
      <Timeline y={120} />
      {answered && ORDERS.flatMap((d, i) => PRICES.filter((p) => p.d <= d).map((p, j) => (
        <line key={`${i}-${j}`} x1={x(d)} y1={120} x2={x(p.d)} y2={86} stroke={C.caramel} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2 + (i * 3 + j) * 0.15, 0.6 + (i * 3 + j) * 0.15))} />
      )))}
      {!answered ? <T x={300} y={230} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={300} y={230} s={20} f={C.caramel} a="middle" w={700}>1 + 1 + 2 + 3 = 7 rows</T>}
    </Svg>
  );
}

// 4 · Closest.
export function Closest({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 2.0));
  return (
    <Svg label="Keep only the latest price that started on or before each order: 4 rows" h={300}>
      <Timeline y={120} />
      {ORDERS.map((d, i) => {
        const p = priceAt(d);
        return <line key={i} x1={x(d)} y1={120} x2={x(p.d)} y2={86} stroke={C.caramel} strokeWidth={3} opacity={a} />;
      })}
      <T x={300} y={230} s={20} f={C.caramel} a="middle" w={700} o={a}>4 rows: one per order</T>
    </Svg>
  );
}

// 5 · Hand built.
export function HandBuilt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.2));
  const b = easeOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="Correlated subquery and LATERAL with ORDER BY and LIMIT 1, both helped by an index" h={280}>
      <T x={25} y={44} s={14} f={C.caramel} w={700} o={a}>(SELECT price … ORDER BY valid_from DESC LIMIT 1)</T>
      <T x={25} y={100} s={14} f={C.caramel} w={700} o={b}>CROSS JOIN LATERAL (… ORDER BY valid_from DESC LIMIT 1)</T>
      <rect x={25} y={140} width={300} height={44} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={easeOut(seg(t, 2.6, 3.4))} />
      <T x={175} y={168} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>index (product_id, valid_from)</T>
    </Svg>
  );
}

// 6 · Spellings.
export function Spellings({ t }: StepCtx) {
  const rows = [['DuckDB', 'ASOF JOIN … ON o.t >= p.valid_from'], ['ClickHouse', 'ASOF LEFT JOIN … ON … <= …'], ['Snowflake', 'ASOF JOIN … MATCH_CONDITION (…)']];
  return (
    <Svg label="DuckDB, ClickHouse and Snowflake spell the operator differently" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.7, i * 0.7 + 0.7))}>
          <T x={25} y={60 + i * 70} s={17} f={C.caramel} w={700}>{r[0]}</T>
          <T x={25} y={86 + i * 70} s={13} f={C.crema}>{r[1]}</T>
        </g>
      ))}
      <T x={300} y={268} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 2.4, 3.2))}>same operator: at most one closest right row per left row</T>
    </Svg>
  );
}

// 7 · Unmatched.
export function UnmatchedPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="An order before the first price change" h={260}>
      <line x1={25} y1={100} x2={575} y2={100} stroke={C.taupe} strokeWidth={2} />
      <circle cx={60} cy={100} r={8} fill={C.crema} />
      <T x={60} y={128} s={13} f={C.latte} a="middle">day 0</T>
      <rect x={x(1) - 22} y={40} width={44} height={30} rx={6} fill={C.cocoa} stroke={C.mocha} />
      <T x={x(1)} y={61} s={14} f={C.crema} a="middle">10</T>
      {!answered ? <T x={380} y={190} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={330} y={190} s={18} f={C.caramel} a="middle" w={700}>order kept, price NULL</T>}
    </Svg>
  );
}

// 8 · Merge walk.
export function MergeWalk({ t }: StepCtx) {
  const p = clamp(t / 3.4);
  return (
    <Svg label="A merge walks both time-ordered inputs once; a nested loop seeks once per order" h={280}>
      <T x={25} y={36} s={14} f={C.caramel} w={700}>merge: one pass over both</T>
      <line x1={25} y1={64} x2={575} y2={64} stroke={C.taupe} strokeWidth={2} />
      <circle cx={25 + 550 * p} cy={64} r={8} fill={C.caramel} />
      <T x={25} y={130} s={14} f={C.cinnamon} w={700}>nested loop: one seek per order</T>
      {ORDERS.map((d, i) => <path key={i} d={`M ${x(d)} 150 L ${x(d)} 190`} stroke={C.cinnamon} strokeWidth={2} opacity={clamp(p * 4 - i)} />)}
      <T x={300} y={240} s={13} f={C.latte} a="middle">both sides are already in time order</T>
    </Svg>
  );
}

// 9 · Leakage.
export function Leakage({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.6));
  const b = easeOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="Joining a day-5 example to today's price 11 leaks the future; the as-of value is 10" h={300}>
      <Timeline y={130} />
      <line x1={x(5)} y1={130} x2={x(20)} y2={96} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 5" opacity={a} />
      <T x={x(12)} y={80} s={13} f={C.cherryText} a="middle" o={a}>current price: 11 (future)</T>
      <line x1={x(5)} y1={130} x2={x(1)} y2={96} stroke={C.caramel} strokeWidth={3} opacity={b} />
      <T x={x(1) + 40} y={200} s={14} f={C.caramel} o={b}>as-of price: 10 (known then)</T>
    </Svg>
  );
}

// 10 · Bitemporal.
export function Bitemporal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="Valid time and the time the database learned a fact are two axes" h={300}>
      <line x1={60} y1={240} x2={560} y2={240} stroke={C.taupe} strokeWidth={2} />
      <line x1={60} y1={240} x2={60} y2={40} stroke={C.taupe} strokeWidth={2} />
      <T x={560} y={264} s={13} f={C.latte} a="end">valid time: when it was true</T>
      <T x={70} y={34} s={13} f={C.latte}>transaction time: when we learned it</T>
      <circle cx={200} cy={170} r={9} fill={C.crema} opacity={a} />
      <circle cx={200} cy={90} r={9} fill={C.caramel} opacity={b} />
      <line x1={200} y1={170} x2={200} y2={90} stroke={C.mocha} strokeDasharray="4 4" opacity={b} />
      <T x={225} y={96} s={13} f={C.caramel} o={b}>a late correction</T>
    </Svg>
  );
}

// 11 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['native ASOF JOIN', 'where the engine has one'], ['PostgreSQL', 'LATERAL + index'], ['feature pipelines', 'audit every "current value" join']];
  return (
    <Svg label="Three rules for point-in-time joins" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={19} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveInequality({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Is an as-of join an equi-join" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>as-of join is an equi-join?</T>
      {answered ? <T x={430} y={104} s={24} f={C.cherryText} w={700}>No</T> : <T x={440} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProveClause({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Snowflake's as-of clause" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>Snowflake →</T>
      {answered ? <T x={200} y={104} s={22} f={C.caramel} w={700}>MATCH_CONDITION</T> : <T x={230} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
