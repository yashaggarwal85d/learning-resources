import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the correct (closest earlier) match, cherryText = a wrong or leaking match, crema = data,
// latte = labels, taupe = structure. Prices change on day 1 (10), day 10 (12), day 20 (11); orders on days 5, 9, 12, 25.

const PRICES = [
  { d: 1, p: 10 },
  { d: 10, p: 12 },
  { d: 20, p: 11 },
];
const ORDERS = [5, 9, 12, 25];
const x = (d: number) => 30 + (d / 26) * 540;

const priceAt = (d: number) => [...PRICES].reverse().find((p) => p.d <= d)!;

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

// 1 · Problem: the three price tags drop onto the line, the orders appear, and a cursor sweeps right; each order it passes reaches back to the price in effect.
/** The price-and-orders timeline with per-tag and per-order fade-ins (0..1). */
function Tl({ y = 110, pk = () => 1, ok = () => 1, hi = -1 }: { y?: number; pk?: (j: number) => number; ok?: (i: number) => number; hi?: number }) {
  return (
    <g>
      <line x1={25} y1={y} x2={575} y2={y} stroke={C.taupe} strokeWidth={2} />
      {PRICES.map((p, j) => {
        const k = clamp(pk(j));
        return (
          <g key={p.d} opacity={k > 0 ? 1 : 0} transform={`translate(0 ${(1 - easeOutBack(k)) * -30})`}>
            <rect x={x(p.d) - 22} y={y - 64} width={44} height={30} rx={6} fill={C.cocoa} stroke={C.mocha} />
            <T x={x(p.d)} y={y - 43} s={14} f={C.crema} a="middle" o={k}>
              {String(p.p)}
            </T>
            <line x1={x(p.d)} y1={y - 34} x2={x(p.d)} y2={y} stroke={C.mocha} opacity={k} />
          </g>
        );
      })}
      {ORDERS.map((d, i) => (
        <g key={d} opacity={clamp(ok(i))}>
          <circle cx={x(d)} cy={y} r={8} fill={i === hi ? C.caramel : C.crema} />
          <T x={x(d)} y={y + 28} s={13} f={C.latte} a="middle">
            {String(d)}
          </T>
        </g>
      ))}
    </g>
  );
}
/** A link from an order on the line up to a price tag's foot. */
function link(d: number, pd: number, y = 110) {
  return `M${x(d)} ${y} Q ${(x(d) + x(pd)) / 2} ${y - 10} ${x(pd)} ${y - 34}`;
}

export function Problem({ t }: StepCtx) {
  const sweep = seg(t, 1.6, 3.4);
  const cx = x(0) + sweep * (x(26) - x(0));
  const passed = ORDERS.filter((d) => x(d) <= cx).length - 1;
  return (
    <Svg label="Prices change on days 1, 10 and 20; each order needs the price in effect on its day, so day 12 gets 12" h={260}>
      <Tl pk={(j) => seg(t, 0.2 + j * 0.25, 0.6 + j * 0.25)} ok={(i) => easeOut(seg(t, 1.0 + i * 0.12, 1.3 + i * 0.12))} hi={passed} />
      {ORDERS.map((d, i) => {
        const p = priceAt(d);
        const k = easeInOut(seg(cx, x(d), x(d) + 40));
        return <path key={i} d={link(d, p.d)} fill="none" stroke={C.caramel} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} />;
      })}
      {sweep > 0 && sweep < 1 && <line x1={cx} y1={40} x2={cx} y2={150} stroke={C.latte} strokeWidth={1} opacity={0.5} />}
      <T x={300} y={200} s={16} f={C.caramel} a="middle" o={passed >= 0 ? 1 : 0}>
        {passed >= 0 ? `order day ${ORDERS[passed]} → price ${priceAt(ORDERS[passed]).p}` : ''}
      </T>
    </Svg>
  );
}

// 2 · All pairs: the twelve red pairings draw one by one and a counter ticks up to 12.
export function AllPairs({ t }: StepCtx) {
  const at = (n: number) => 0.2 + n * 0.22;
  const n = Array.from({ length: 12 }, (_, k) => k).filter((k) => t >= at(k) + 0.25).length;
  return (
    <Svg label="Joining on product alone pairs each order with every price: 4 × 3 = 12 rows" h={300}>
      <Tl y={120} />
      {ORDERS.flatMap((d, i) =>
        PRICES.map((p, j) => {
          const k = easeInOut(seg(t, at(i * 3 + j), at(i * 3 + j) + 0.3));
          return <path key={`${i}-${j}`} d={link(d, p.d, 120)} fill="none" stroke={C.cherryText} strokeWidth={1.2} opacity={0.7} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} />;
        }),
      )}
      <T x={575} y={30} s={14} f={C.cherryText} a="end" o={t > 0.3 ? 1 : 0}>
        {`pairs: ${n}`}
      </T>
      <T x={300} y={230} s={20} f={C.cherryText} a="middle" w={700} o={easeOut(seg(t, 3.0, 3.5))}>
        4 × 3 = 12 rows
      </T>
    </Svg>
  );
}

// 3 · Predict: all twelve pairings, faint. After the answer, the ones into the future fade out, the survivors turn caramel, and each order's count lands.
export function CountPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const cut = answered ? easeInOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="The inequality keeps every price that started on or before the order: 1 + 1 + 2 + 3 = 7 rows" h={300}>
      <T x={25} y={30} s={14} f={C.caramel} o={easeOut(seg(t, 0.2, 0.6))}>
        valid_from ≤ order day
      </T>
      <Tl y={120} />
      {ORDERS.flatMap((d, i) =>
        PRICES.map((p, j) => {
          const future = p.d > d;
          return (
            <path
              key={`${i}-${j}`}
              d={link(d, p.d, 120)}
              fill="none"
              stroke={future ? C.cherryText : answered ? C.caramel : C.latte}
              strokeWidth={answered && !future ? 1.8 : 1}
              opacity={future ? 0.5 * (1 - cut) : answered ? 0.5 + 0.5 * cut : 0.5}
            />
          );
        }),
      )}
      {answered &&
        ORDERS.map((d, i) => (
          <T key={d} x={x(d)} y={176} s={15} f={C.caramel} a="middle" w={700} o={easeOut(seg(s, 0.9 + i * 0.2, 1.1 + i * 0.2))}>
            {String(PRICES.filter((p) => p.d <= d).length)}
          </T>
        ))}
      {!answered ? (
        <T x={300} y={236} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <T x={300} y={236} s={20} f={C.caramel} a="middle" w={700} o={easeOut(seg(s, 1.8, 2.2))}>
          1 + 1 + 2 + 3 = 7 rows
        </T>
      )}
    </Svg>
  );
}

// 4 · Closest: the rule builds in three parts; then, order by order, the older matches fade and the closest one thickens.
export function Closest({ t }: StepCtx) {
  const parts = ['= product', '≤ time', 'latest wins'];
  const n = [0.2, 0.6, 1.0].filter((a) => t >= a).length;
  return (
    <Svg label="Equality on product, an inequality on time, and the latest wins: each order keeps one price, 4 rows" h={300}>
      <T x={25} y={30} s={14} f={C.caramel} w={700}>
        {parts.slice(0, n).join(' · ')}
      </T>
      <Tl y={120} />
      {ORDERS.flatMap((d, i) => {
        const pick = easeInOut(seg(t, 1.4 + i * 0.45, 1.8 + i * 0.45));
        const best = priceAt(d).d;
        return PRICES.filter((p) => p.d <= d).map((p, j) => {
          const win = p.d === best;
          return <path key={`${i}-${j}`} d={link(d, p.d, 120)} fill="none" stroke={C.caramel} strokeWidth={win ? 1.5 + 1.5 * pick : 1.5} opacity={win ? 1 : 1 - 0.9 * pick} />;
        });
      })}
      <T x={300} y={230} s={20} f={C.caramel} a="middle" w={700} o={easeOut(seg(t, 3.4, 3.9))}>
        4 rows: one per order
      </T>
    </Svg>
  );
}

// 5 · Hand built: the two spellings type out; then the index lets a lookup jump to one leaf, and without it a red scan sweeps the whole history.
export function HandBuilt({ t }: StepCtx) {
  const l1 = '(SELECT price … ORDER BY valid_from DESC LIMIT 1)';
  const l2 = 'CROSS JOIN LATERAL (… ORDER BY valid_from DESC LIMIT 1)';
  const n1 = Math.round(l1.length * seg(t, 0.2, 1.0));
  const n2 = Math.round(l2.length * seg(t, 1.1, 1.9));
  const ix = easeOut(seg(t, 2.0, 2.3));
  const jump = easeInOut(seg(t, 2.3, 2.8));
  const scan = seg(t, 3.1, 3.9);
  return (
    <Svg label="A correlated subquery or LATERAL with ORDER BY and LIMIT 1; an index on product and start date lets each lookup jump, without it every order rescans" h={280}>
      <T x={25} y={40} s={14} f={C.caramel} w={700}>
        {l1.slice(0, n1)}
      </T>
      <T x={25} y={84} s={14} f={C.caramel} w={700}>
        {l2.slice(0, n2)}
      </T>
      <g opacity={ix}>
        <rect x={25} y={110} width={300} height={40} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
        <T x={175} y={135} s={14} f={C.crema} a="middle">
          index (product_id, valid_from)
        </T>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={360 + i * 26} y={118} width={22} height={24} rx={4} fill={i === 5 && jump >= 1 ? C.caramel : C.cocoa} stroke={C.mocha} />
        ))}
        <path d="M325 122 C 380 80 470 80 501 116" fill="none" stroke={C.caramel} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - jump} />
      </g>
      <T x={25} y={200} s={14} f={C.cherryText} o={easeOut(seg(t, 2.9, 3.2))}>
        without it: every order rescans
      </T>
      <rect x={25} y={214} width={540} height={14} rx={4} fill="none" stroke={C.mocha} opacity={easeOut(seg(t, 2.9, 3.2))} />
      <rect x={25} y={214} width={540 * scan} height={14} rx={4} fill={C.cherry} />
    </Svg>
  );
}

// 6 · Spellings: the three engines slide in with their syntax, a bracket gathers them, and the shared meaning is stated.
export function Spellings({ t }: StepCtx) {
  const rows = [
    ['DuckDB', 'ASOF JOIN … ON o.t >= p.valid_from'],
    ['ClickHouse', 'ASOF LEFT JOIN … ON … <= …'],
    ['Snowflake', 'ASOF JOIN … MATCH_CONDITION (…)'],
  ];
  const br = easeInOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="DuckDB, ClickHouse and Snowflake spell the operator differently but mean the same: at most one closest right row per left row" h={280}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.8, 0.8 + i * 0.8));
        return (
          <g key={r[0]} opacity={k} transform={`translate(${(1 - k) * -40} 0)`}>
            <T x={25} y={50 + i * 70} s={17} f={C.caramel} w={700}>
              {r[0]}
            </T>
            <T x={25} y={76 + i * 70} s={13} f={C.crema}>
              {r[1]}
            </T>
          </g>
        );
      })}
      <path d={`M556 32 h10 V${lerp(32, 222, br)} h-10`} fill="none" stroke={C.caramel} strokeWidth={2} opacity={br > 0 ? 1 : 0} />
      <T x={300} y={262} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.3, 3.8))}>
        same operator: at most one closest right row per left row
      </T>
    </Svg>
  );
}

// 7 · Predict: the day-0 order reaches back and finds nothing. After the answer, the result row appears with an empty price.
export function UnmatchedPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const reach = easeInOut(seg(t, 0.3, 1.1));
  const row = answered ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="An order before the first price change: the left as-of join keeps the order with a NULL price" h={260}>
      <line x1={25} y1={100} x2={575} y2={100} stroke={C.taupe} strokeWidth={2} />
      <path d={`M60 92 Q 44 ${lerp(92, 70, reach)} ${lerp(60, 26, reach)} ${lerp(92, 66, reach)}`} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 4" />
      <circle cx={60} cy={100} r={8} fill={C.crema} />
      <T x={60} y={128} s={13} f={C.latte} a="middle">
        day 0
      </T>
      <rect x={x(1) - 22} y={40} width={44} height={30} rx={6} fill={C.cocoa} stroke={C.mocha} />
      <T x={x(1)} y={61} s={14} f={C.crema} a="middle">
        10
      </T>
      {!answered ? (
        <T x={380} y={190} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <>
          <g opacity={row}>
            <rect x={150} y={146} width={110} height={32} rx={6} fill={C.cocoa} stroke={C.caramel} />
            <T x={205} y={167} s={13} f={C.crema} a="middle">
              order day 0
            </T>
            <rect x={270} y={146} width={110} height={32} rx={6} fill="none" stroke={C.latte} strokeDasharray="4 4" />
            <T x={325} y={167} s={13} f={C.latte} a="middle">
              NULL
            </T>
          </g>
          <T x={265} y={226} s={18} f={C.caramel} a="middle" w={700} o={easeOut(seg(s, 0.6, 1.0))}>
            order kept, price NULL
          </T>
        </>
      )}
    </Svg>
  );
}

// 8 · Merge walk: one scan line sweeps both time-ordered lanes together; below, each order fires its own seek in turn.
export function MergeWalk({ t }: StepCtx) {
  const p = seg(t, 0.4, 2.4);
  const sx = 25 + 550 * p;
  return (
    <Svg label="A merge walks both time-ordered inputs once; a nested loop seeks once per order" h={280}>
      <T x={25} y={30} s={14} f={C.caramel} w={700}>
        merge: one pass over both
      </T>
      <line x1={25} y1={56} x2={575} y2={56} stroke={C.taupe} strokeWidth={1.5} />
      <line x1={25} y1={92} x2={575} y2={92} stroke={C.taupe} strokeWidth={1.5} />
      {PRICES.map((pr) => (
        <rect key={pr.d} x={x(pr.d) - 6} y={50} width={12} height={12} rx={2} fill={sx >= x(pr.d) ? C.caramel : C.crema} />
      ))}
      {ORDERS.map((d) => (
        <circle key={d} cx={x(d)} cy={92} r={6} fill={sx >= x(d) ? C.caramel : C.crema} />
      ))}
      <line x1={sx} y1={44} x2={sx} y2={104} stroke={C.caramel} strokeWidth={2.5} opacity={p > 0 && p < 1 ? 1 : 0} />
      <T x={25} y={136} s={14} f={C.cinnamon} w={700} o={easeOut(seg(t, 2.2, 2.5))}>
        nested loop: one seek per order
      </T>
      {ORDERS.map((d, i) => {
        const k = easeIn2(seg(t, 2.6 + i * 0.3, 2.9 + i * 0.3));
        return (
          <g key={i} opacity={k > 0 ? 1 : 0}>
            <line x1={x(d)} y1={150} x2={x(d)} y2={lerp(150, 190, k)} stroke={C.cinnamon} strokeWidth={2} />
            <rect x={x(d) - 10} y={192} width={20} height={14} rx={3} fill={k >= 1 ? C.cinnamon : 'none'} stroke={C.cinnamon} />
          </g>
        );
      })}
      <T x={300} y={248} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.5, 3.9))}>
        both sides are already in time order
      </T>
    </Svg>
  );
}
const easeIn2 = (v: number) => v * v;

// 9 · Leakage: a training example on day 5 reaches to today's price 11 (red, dashed, the future); then the as-of link to 10 draws and the leak fades.
export function Leakage({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.6, 1.4));
  const b = easeInOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="Joining a day-5 training example to today's price 11 leaks the future; the as-of value is 10" h={300}>
      <Tl y={130} hi={0} />
      <line x1={x(26)} y1={56} x2={x(26)} y2={150} stroke={C.latte} strokeDasharray="3 4" opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={x(26)} y={44} s={13} f={C.latte} a="end" o={easeOut(seg(t, 0.2, 0.5))}>
        today
      </T>
      <path d={link(5, 20, 130)} fill="none" stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 5" opacity={a * (1 - 0.6 * b)} />
      <T x={300} y={44} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
        current price: 11 (future)
      </T>
      <path d={link(5, 1, 130)} fill="none" stroke={C.caramel} strokeWidth={3} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - b} />
      <T x={x(1) + 40} y={210} s={14} f={C.caramel} o={easeOut(seg(t, 3.0, 3.4))}>
        as-of price: 10 (known then)
      </T>
    </Svg>
  );
}

// 10 · Bitemporal: the two axes draw, the fact appears, a late correction rises up the transaction-time axis, and an as-of-asked line sweeps across.
export function Bitemporal({ t }: StepCtx) {
  const ax = easeInOut(seg(t, 0.2, 0.8));
  const a = easeOutBack(seg(t, 1.0, 1.3));
  const rise = easeInOut(seg(t, 1.7, 2.5));
  const ask = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="Valid time and the time the database learned a fact are two axes; a late correction moves up the second one" h={300}>
      <line x1={60} y1={240} x2={lerp(60, 560, ax)} y2={240} stroke={C.taupe} strokeWidth={2} />
      <line x1={60} y1={240} x2={60} y2={lerp(240, 40, ax)} stroke={C.taupe} strokeWidth={2} />
      <T x={560} y={264} s={13} f={C.latte} a="end" o={ax}>
        valid time: when it was true
      </T>
      <T x={70} y={34} s={13} f={C.latte} o={ax}>
        transaction time: when we learned it
      </T>
      <circle cx={200} cy={170} r={9} fill={C.crema} opacity={clamp(a)} />
      {rise > 0 && <line x1={200} y1={170} x2={200} y2={lerp(170, 90, rise)} stroke={C.mocha} strokeDasharray="4 4" />}
      {rise > 0 && <circle cx={200} cy={lerp(170, 90, rise)} r={9} fill={C.caramel} />}
      <T x={225} y={96} s={13} f={C.caramel} o={easeOut(seg(t, 2.5, 2.9))}>
        a late correction
      </T>
      <line x1={60} y1={130} x2={lerp(60, 560, ask)} y2={130} stroke={C.cinnamon} strokeWidth={1.5} strokeDasharray="6 4" />
      <T x={560} y={150} s={13} f={C.cinnamon} a="end" o={easeOut(seg(t, 3.5, 3.9))}>
        what we believed then
      </T>
    </Svg>
  );
}

// 11 · Verdict: three rules, each underlined and ticked.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['native ASOF JOIN', 'where the engine has one'],
    ['PostgreSQL', 'LATERAL + index'],
    ['feature pipelines', 'audit "current value" joins'],
  ];
  return (
    <Svg label="Three rules for point-in-time joins: the native ASOF JOIN where available, LATERAL and an index in PostgreSQL, audit current-value joins in feature pipelines" h={280}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, i * 0.9, i * 0.9 + 0.5));
        const bar = easeInOut(seg(t, i * 0.9 + 0.3, i * 0.9 + 0.9));
        const tick = easeOut(seg(t, i * 0.9 + 0.8, i * 0.9 + 1.1));
        return (
          <g key={r[0]} opacity={k}>
            <T x={25} y={50 + i * 80} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={82 + i * 80} s={19} f={C.caramel} w={700}>
              {r[1]}
            </T>
            <rect x={25} y={92 + i * 80} width={360 * bar} height={3} fill={C.caramel} />
            <path d={`M540 ${70 + i * 80} l8 8 l16 -18`} fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
          </g>
        );
      })}
    </Svg>
  );
}

export function ProveInequality({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const parts = ['=', '≤', 'latest'];
  return (
    <Svg label="An as-of join is not an equi-join: it needs equality, an inequality on time and a closest-wins rule" h={240}>
      <T x={40} y={80} s={18} f={C.latte}>
        as-of join is an equi-join?
      </T>
      {answered ? (
        <>
          <T x={40} y={lerp(150, 136, k)} s={24} f={C.cherryText} w={700} o={k}>
            No
          </T>
          {parts.map((p, i) => (
            <g key={p} opacity={easeOutBack(seg(s, 0.5 + i * 0.25, 0.8 + i * 0.25)) > 0 ? 1 : 0}>
              <rect x={140 + i * 110} y={112} width={90} height={34} rx={8} fill={C.cocoa} stroke={i === 0 ? C.mocha : C.caramel} />
              <T x={185 + i * 110} y={135} s={15} f={C.crema} a="middle">
                {p}
              </T>
            </g>
          ))}
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
export function ProveClause({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const w = 'MATCH_CONDITION';
  const n = answered ? Math.round(w.length * seg(s, 0.1, 0.7)) : 0;
  const bar = answered ? easeOut(seg(s, 0.7, 1.1)) : 0;
  return (
    <Svg label="Snowflake names the as-of comparison in MATCH_CONDITION" h={240}>
      <T x={40} y={80} s={18} f={C.latte}>
        Snowflake →
      </T>
      {answered ? (
        <>
          <T x={40} y={140} s={22} f={C.caramel} w={700}>
            {w.slice(0, n)}
          </T>
          <rect x={40} y={152} width={240 * bar} height={3} fill={C.caramel} />
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
