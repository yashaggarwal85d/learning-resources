import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, easeInOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar: caramel = the operator or path under discussion, cherry/cherryText = the costly
// or wrong path, cinnamon = the alternative being compared, taupe = quiet/structural, latte = labels,
// crema = data/results.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

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

// 1 · The problem: a query is secretly a tree. The SQL types out, its keywords fall away, and the tree grows from the
// tables at the leaves up to the root; then rows flow up the edges, which is what the engine reasons about.
export function QueryTree({ t }: StepCtx) {
  const sql = 'SELECT * FROM orders JOIN items WHERE refunded';
  const chars = Math.floor(seg(t, 0.2, 1.3) * sql.length);
  const drop = easeIn2(seg(t, 1.4, 1.9));
  const leaves = easeOutBack(seg(t, 1.9, 2.3));
  const join = easeOutBack(seg(t, 2.3, 2.7));
  const root = easeOutBack(seg(t, 2.7, 3.1));
  const flow = seg(t, 2.9, 3.6);
  const edge = (x1: number, y1: number, x2: number, y2: number, k: number) =>
    k > 0 ? <line x1={x1} y1={y1} x2={lerp(x1, x2, Math.min(1, k))} y2={lerp(y1, y2, Math.min(1, k))} stroke={C.taupe} strokeWidth={2} /> : null;
  const node = (x: number, y: number, k: number, label: string, op: boolean) =>
    k <= 0 ? null : (
      <g opacity={clamp(k)} transform={`translate(${x} ${y}) scale(${clamp(k)})`}>
        {op ? <circle r={22} fill={C.caramel} /> : <rect x={-52} y={-16} width={104} height={32} rx={6} fill={C.roast} stroke={C.mocha} />}
        <T x={0} y={op ? 6 : 5} s={op ? 17 : 13} f={op ? C.espresso : C.crema} a="middle" w={op ? 700 : 400}>
          {label}
        </T>
      </g>
    );
  return (
    <Svg label="A SQL query is read left to right, but the engine sees it as a tree of small operators with tables at the leaves" h={330}>
      <rect x={25} y={20} width={550} height={40} rx={10} fill={C.roast} stroke={C.mocha} />
      <g opacity={1 - drop * 0.75} transform={`translate(0 ${drop * 8})`}>
        <T x={40} y={45} s={13} f={C.crema}>
          {sql.slice(0, chars)}
        </T>
      </g>
      {edge(300, 112, 300, 168, join > 0.6 ? root : 0)}
      {edge(285, 205, 195, 260, leaves > 0.6 ? join : 0)}
      {edge(315, 205, 405, 260, leaves > 0.6 ? join : 0)}
      {node(195, 278, leaves, 'orders', false)}
      {node(405, 278, leaves, 'order_items', false)}
      {node(300, 190, join, '⋈', true)}
      {node(300, 90, root, 'σ', true)}
      {flow > 0 &&
        [0, 0.33, 0.66].map((o) => {
          const p = (flow * 2 + o) % 1;
          const left = p < 0.5;
          const q = left ? p * 2 : (p - 0.5) * 2;
          const x = left ? lerp(195, 300, q) : 300;
          const y = left ? lerp(260, 212, q) : lerp(168, 112, q);
          return <circle key={o} cx={x} cy={y} r={4} fill={C.cinnamon} />;
        })}
      <T x={575} y={322} s={13} f={C.latte} a="end" o={easeOut(seg(t, 3.0, 3.4))}>
        every node an operator
      </T>
      <T x={25} y={322} s={13} f={C.latte} o={easeOut(seg(t, 2.0, 2.4))}>
        leaves are tables
      </T>
    </Svg>
  );
}

const easeIn2 = (x: number) => x * x;

// 2 · The six operators. Each row arrives with a tiny table beside it that does that operator's job: rows drop,
// columns drop, two strips meet, a grid multiplies, a block stacks under another, rows collapse into one.
const OPS = [
  { sym: 'σ', sql: 'WHERE', d: 'keep some rows' },
  { sym: 'π', sql: 'SELECT list', d: 'keep some columns' },
  { sym: '⋈', sql: 'JOIN', d: 'combine two tables' },
  { sym: '×', sql: 'CROSS JOIN', d: 'every pairing' },
  { sym: '∪ ∩ −', sql: 'UNION / INTERSECT / EXCEPT', d: 'combine two results' },
  { sym: 'γ', sql: 'GROUP BY', d: 'collapse into groups' },
];
function MiniOp({ i, k, y }: { i: number; k: number; y: number }) {
  const X = 500;
  const cell = (cx: number, cy: number, o = 1, key?: string | number, fill: string = C.crema) => <rect key={key} x={cx} y={cy} width={20} height={8} rx={2} fill={fill} opacity={o} />;
  const out: ReturnType<typeof cell>[] = [];
  if (i === 0) for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) out.push(cell(X + c * 23, y - 16 + r * 11, r === 1 ? 1 : 1 - 0.85 * k, `${r}${c}`));
  if (i === 1) for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) out.push(cell(X + c * 23, y - 16 + r * 11, c === 0 ? 1 : 1 - 0.85 * k, `${r}${c}`));
  if (i === 2)
    for (let r = 0; r < 3; r++) {
      out.push(cell(X, y - 16 + r * 11, 1, `a${r}`));
      out.push(cell(lerp(X + 50, X + 23, k), y - 16 + r * 11, 1, `b${r}`, C.cinnamon));
    }
  if (i === 3)
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 2; c++) {
        const show = r < 2 ? 1 : k;
        out.push(cell(X + c * 23, lerp(y - 16 + (r % 2) * 11, y - 18 + r * 9, k), show, `${r}${c}`, c === 1 ? C.cinnamon : C.crema));
      }
  if (i === 4)
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 2; c++) {
        out.push(cell(X + c * 23, y - 18 + r * 9, 1, `a${r}${c}`));
        out.push(cell(lerp(X + 48 + c * 23, X + c * 23, k), lerp(y - 18 + r * 9, y + r * 9, k), 1, `b${r}${c}`, C.cinnamon));
      }
  if (i === 5) for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) out.push(cell(X + c * 23, lerp(y - 16 + r * 11, y - 5, k), 1, `${r}${c}`));
  return <g>{out}</g>;
}
export function OperatorTable({ t }: StepCtx) {
  return (
    <Svg label="Six operators cover every SQL query: selection, projection, join, product, the set operators and aggregation" h={340}>
      {OPS.map((op, i) => {
        const a = easeOutBack(seg(t, i * 0.4, i * 0.4 + 0.5));
        const k = easeInOut(seg(t, i * 0.4 + 0.5, i * 0.4 + 1.1));
        const y = 36 + i * 54;
        return (
          <g key={op.sym} opacity={clamp(a)} transform={`translate(${(1 - clamp(a)) * -20} 0)`}>
            <T x={25} y={y} s={22} f={C.caramel} w={700}>
              {op.sym}
            </T>
            <T x={120} y={y} s={14} f={C.crema} w={600}>
              {op.sql}
            </T>
            <T x={120} y={y + 20} s={13} f={C.latte}>
              {op.d}
            </T>
            <MiniOp i={i} k={k} y={y} />
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · Predict: how many rows for a repeat customer. Five order cards wait above an empty result. After the answer,
// each order drops its customer id into the result, one at a time, and the count climbs to five.
export function RowsPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const N = 5;
  const landed = answered ? Array.from({ length: N }, (_, i) => seg(s, 0.2 + i * 0.4, 0.55 + i * 0.4)).filter((d) => d >= 1).length : 0;
  return (
    <Svg label="A customer who placed five orders runs a plain select on customer id, with no grouping; each order becomes one row" h={300}>
      <T x={25} y={34} s={14} f={C.latte}>
        SELECT customer_id FROM orders;
      </T>
      {Array.from({ length: N }, (_, i) => {
        const a = easeOutBack(seg(t, 0.3 + i * 0.15, 0.7 + i * 0.15));
        return (
          <g key={i} opacity={clamp(a)}>
            <rect x={25 + i * 80} y={56} width={64} height={44} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
            <T x={57 + i * 80} y={83} s={13} f={C.crema} a="middle">
              order
            </T>
          </g>
        );
      })}
      <T x={25} y={146} s={13} f={C.latte}>
        result
      </T>
      <rect x={25} y={156} width={400} height={40} rx={6} fill="none" stroke={C.mocha} strokeDasharray="4 4" />
      {answered &&
        Array.from({ length: N }, (_, i) => {
          const d = easeOut(seg(s, 0.2 + i * 0.4, 0.55 + i * 0.4));
          if (d <= 0) return null;
          return (
            <g key={i}>
              <rect x={31 + i * 80} y={lerp(64, 162, d)} width={52} height={28} rx={5} fill={C.caramel} />
              <T x={57 + i * 80} y={lerp(64, 162, d) + 19} s={13} f={C.espresso} a="middle" w={700}>
                id
              </T>
            </g>
          );
        })}
      {answered && (
        <T x={575} y={184} s={22} f={C.crema} a="end" w={700}>
          {landed}
        </T>
      )}
      {!answered && (
        <T x={300} y={254} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <T x={300} y={254} s={18} f={C.crema} a="middle" w={600} o={answered ? easeOut(seg(s, 2.2, 2.6)) : 0}>
        five rows: one per order, one per fact
      </T>
    </Svg>
  );
}

// 4 · A bag, not a set. Three copies of the same value drop toward each container. The set keeps the first and
// bounces the repeats away; the bag keeps all three and shows the count.
export function BagVsSet({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const drops = [0, 1, 2].map((i) => seg(t, 0.6 + i * 0.4, 1.0 + i * 0.4));
  const count = drops.filter((d) => d >= 1).length;
  const pos = [
    [-30, -10],
    [30, -10],
    [0, 30],
  ];
  return (
    <Svg label="A set cannot hold the same value twice and bounces the repeats away; a bag keeps every repeat and remembers how many" h={320}>
      <g opacity={a}>
        <T x={150} y={40} s={15} f={C.latte} a="middle">
          a set
        </T>
        <circle cx={150} cy={150} r={70} fill="none" stroke={C.taupe} strokeWidth={2} />
        <T x={450} y={40} s={15} f={C.latte} a="middle">
          a bag
        </T>
        <circle cx={450} cy={150} r={70} fill="none" stroke={C.caramel} strokeWidth={2} />
      </g>
      {drops.map((d, i) => {
        if (d <= 0) return null;
        const e = easeOut(Math.min(1, d * 1.4));
        // set: the first lands in the middle; repeats hit the rim and bounce out to the side, fading
        const setX = i === 0 ? 150 : 150 + (i === 1 ? -1 : 1) * lerp(0, 110, seg(d, 0.6, 1));
        const setY = i === 0 ? lerp(70, 150, e) : d < 0.6 ? lerp(70, 92, d / 0.6) : lerp(92, 60, seg(d, 0.6, 1));
        const setO = i === 0 ? 1 : 1 - seg(d, 0.6, 1);
        return (
          <g key={i}>
            <T x={setX} y={setY + 6} s={16} f={i === 0 ? C.crema : C.cherryText} a="middle" o={setO} w={700}>
              7
            </T>
            <T x={450 + pos[i][0]} y={lerp(70, 150 + pos[i][1], e) + 6} s={16} f={C.crema} a="middle" w={700}>
              7
            </T>
          </g>
        );
      })}
      <T x={150} y={250} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.2, 1.5))}>
        refuses repeats
      </T>
      <T x={450} y={250} s={13} f={C.caramel} a="middle" o={count > 0 ? 1 : 0}>
        keeps them: ×{count}
      </T>
      <T x={300} y={300} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>
        SQL tables and results are bags
      </T>
    </Svg>
  );
}

// 5 · Collapsing by accident. Five order rows head for SUM through a DISTINCT gate: the first passes, the four
// repeats are stopped at the gate, and the total fills to a fifth of what it should be, with no error raised.
export function CollapseByAccident({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const gate = easeOut(seg(t, 0.9, 1.3));
  const go = seg(t, 1.3, 2.6);
  const passed = seg(t, 1.6, 2.6);
  return (
    <Svg label="A DISTINCT on customer id before the sum lets one of the five order rows through; the sum sees one amount instead of five, with no error" h={320}>
      <T x={25} y={30} s={14} f={C.latte}>
        DISTINCT customer_id, then SUM(amount)
      </T>
      {Array.from({ length: 5 }, (_, i) => {
        const start = 25 + i * 50;
        const mine = seg(go, i * 0.15, i * 0.15 + 0.5);
        const e = easeInOut(mine);
        if (i === 0) return <rect key={i} x={lerp(start, 494, e)} y={70} width={42} height={42} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} opacity={clamp(a)} />;
        const stopAt = 252 - (i - 1) * 8;
        const x = Math.min(lerp(start, 340, e), stopAt);
        const hit = mine > 0 && x >= stopAt - 0.5;
        return (
          <rect
            key={i}
            x={x}
            y={70 - (hit ? (i - 1) * 4 : 0)}
            width={42}
            height={42}
            rx={8}
            fill={C.cocoa}
            stroke={hit ? C.cherry : C.caramel}
            strokeWidth={1.5}
            opacity={clamp(a) * (hit ? 0.45 : 1)}
          />
        );
      })}
      <g opacity={gate}>
        <line x1={300} y1={46} x2={300} y2={136} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 4" />
        <T x={300} y={156} s={13} f={C.cherryText} a="middle">
          DISTINCT
        </T>
      </g>
      <g opacity={a}>
        <rect x={460} y={60} width={110} height={62} rx={8} fill="none" stroke={C.mocha} />
        <T x={515} y={144} s={13} f={C.latte} a="middle">
          SUM
        </T>
      </g>
      <g opacity={easeOut(seg(t, 2.2, 2.6))}>
        <T x={25} y={200} s={13} f={C.latte}>
          the sum should see
        </T>
        <rect x={25} y={212} width={500} height={16} rx={3} fill={C.cocoa} />
        <T x={25} y={252} s={13} f={C.cherryText}>
          it sees
        </T>
        <rect x={25} y={264} width={100 * passed} height={16} rx={3} fill={C.cherry} />
      </g>
      <T x={575} y={252} s={14} f={C.crema} a="end" o={easeOut(seg(t, 2.8, 3.3))}>
        no error, no warning
      </T>
    </Svg>
  );
}

// 6 · Two ways to stack results.
export function UnionStack({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const b = easeOut(seg(t, 1.6, 2.8));
  return (
    <Svg
      label="Stacking a hundred twenty thousand automatically flagged orders with ninety five thousand manually flagged orders: keep everything, two hundred fifteen thousand rows; or drop the forty two thousand that overlap, one hundred seventy three thousand rows"
      h={340}
    >
      <T x={25} y={26} s={13} f={C.latte}>
        flagged_auto: 120,000 · flagged_manual: 95,000
      </T>
      <T x={25} y={46} s={13} f={C.latte}>
        both: 42,000
      </T>
      <Bar x={25} y={70} w={420 * a} h={30} full={420} fill={C.caramel} />
      <T x={25} y={118} s={16} f={C.crema} o={a}>
        UNION ALL → {fmt(215_000 * a)} rows
      </T>
      <Bar x={25} y={160} w={420 * b * (173 / 215)} h={30} full={420} fill={C.cinnamon} />
      <T x={25} y={208} s={16} f={C.crema} o={b}>
        UNION → {fmt(173_000 * b)} rows
      </T>
      <T x={300} y={268} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>
        neither is the bug:
      </T>
      <T x={300} y={294} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>
        the wrong one for the question is
      </T>
    </Svg>
  );
}

// 7 · INTERSECT and EXCEPT, with or without ALL. A and B as rows of tokens. With counting, each copy pairs with one
// copy on the other side: the paired copies are the intersection, the unpaired 1 is what EXCEPT ALL keeps. Without
// counting, each side collapses to its distinct values; every value of A is present in B, so EXCEPT empties.
export function IntersectExcept({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const pair = easeInOut(seg(t, 1.0, 1.7));
  const resAll = easeOut(seg(t, 1.6, 2.0));
  const collapse = easeInOut(seg(t, 2.1, 2.8));
  const cross = easeOut(seg(t, 2.8, 3.2));
  const A = [1, 1, 2];
  const B = [1, 2, 2];
  // after collapse, the second copy slides onto the first
  const ax = (i: number) => (i === 1 ? lerp(110, 60, collapse) : 60 + i * 50 - (i === 2 ? 50 * collapse : 0));
  const bx = (i: number) => (i === 2 ? lerp(160, 110, collapse) : 60 + i * 50);
  const tok = (x: number, y: number, v: number, stroke: string, o = 1, key?: string) => (
    <g key={key} opacity={o}>
      <rect x={x - 18} y={y - 18} width={36} height={36} rx={6} fill={C.roast} stroke={stroke} strokeWidth={1.6} />
      <T x={x} y={y + 6} s={16} f={C.crema} a="middle" w={700}>
        {v}
      </T>
    </g>
  );
  return (
    <Svg label="Bag A holds one, one, two; bag B holds one, two, two; intersect all keeps one of each, except all keeps one leftover one, plain except keeps nothing" h={330}>
      <g opacity={a}>
        <T x={25} y={76} s={15} f={C.latte}>
          A
        </T>
        <T x={25} y={156} s={15} f={C.latte}>
          B
        </T>
      </g>
      {pair > 0 && collapse < 1 && (
        <g opacity={1 - collapse}>
          <line x1={60} y1={88} x2={60} y2={132} stroke={C.caramel} strokeWidth={2} strokeDasharray={`${50 * pair} 50`} />
          <line x1={160} y1={88} x2={110} y2={132} stroke={C.caramel} strokeWidth={2} strokeDasharray={`${50 * pair} 50`} />
        </g>
      )}
      {A.map((v, i) => tok(ax(i), 70, v, i === 1 && pair > 0.5 && collapse === 0 ? C.cinnamon : C.mocha, a * (i === 1 ? 1 - collapse : 1), 'a' + i))}
      {B.map((v, i) => tok(bx(i), 150, v, C.mocha, a * (i === 2 ? 1 - collapse : 1), 'b' + i))}
      {cross > 0 && [60, 110].map((x) => <path key={x} d={`M ${x - 16} 54 L ${x - 16 + 32 * cross} ${54 + 32 * cross}`} stroke={C.cherryText} strokeWidth={2.5} />)}
      <g opacity={resAll}>
        <T x={250} y={62} s={14} f={C.caramel}>
          INTERSECT ALL → 1, 2
        </T>
        <T x={250} y={90} s={14} f={C.cinnamon}>
          EXCEPT ALL → 1
        </T>
      </g>
      <g opacity={easeOut(seg(t, 2.6, 3.0))}>
        <T x={250} y={142} s={14} f={C.crema}>
          INTERSECT → 1, 2
        </T>
        <T x={250} y={170} s={14} f={C.cherryText}>
          EXCEPT → nothing
        </T>
      </g>
      <T x={300} y={250} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 3.1, 3.6))}>
        without ALL: present or absent
      </T>
      <T x={300} y={276} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 3.1, 3.6))}>
        the number of copies is thrown away
      </T>
    </Svg>
  );
}

// 8 · Predict: idempotence. Three rows and a ghost copy of them. After the answer the copy slides in under the
// original and the count doubles to six; then a dedup sweep (UNION) passes over and the copies fade back to three.
export function IdempotencePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const slide = answered ? easeOutBack(seg(s, 0.2, 1.0)) : 0;
  const sweep = answered ? seg(s, 1.8, 2.8) : 0;
  const n = slide >= 1 ? 6 : 3;
  return (
    <Svg label="A list with three rows, stacked with itself keeping every row, gives six; only the deduplicating version returns to three" h={300}>
      <T x={25} y={34} s={14} f={C.latte}>
        A UNION ALL A
      </T>
      {Array.from({ length: 3 }, (_, i) => (
        <rect key={i} x={25 + i * 70} y={60} width={56} height={44} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
      ))}
      {Array.from({ length: 3 }, (_, i) => {
        const ghost = answered ? 1 : 0.25 + 0.15 * Math.sin(t * 3 + i);
        const x = lerp(260 + i * 70, 25 + i * 70, Math.min(1, slide));
        const y = lerp(60, 116, Math.min(1, slide));
        const gone = sweep > 0 && x + 28 < 25 + sweep * 230 ? 1 : 0;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={56}
            height={44}
            rx={8}
            fill={answered ? C.cherry : C.cocoa}
            stroke={C.caramel}
            strokeWidth={1.5}
            opacity={ghost * (1 - 0.85 * gone)}
            strokeDasharray={answered ? undefined : '4 4'}
          />
        );
      })}
      {answered && (
        <T x={575} y={124} s={26} f={C.cherryText} a="end" w={700}>
          {n} rows
        </T>
      )}
      {sweep > 0 && sweep < 1 && <line x1={25 + sweep * 230} y1={50} x2={25 + sweep * 230} y2={172} stroke={C.cinnamon} strokeWidth={2} />}
      {!answered && (
        <T x={300} y={230} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <T x={300} y={216} s={16} f={C.cherryText} a="middle" w={600} o={answered ? easeOut(seg(s, 1.0, 1.4)) : 0}>
        UNION ALL doubles every row
      </T>
      <T x={300} y={252} s={14} f={C.cinnamon} a="middle" o={easeOut(seg(sweep, 0.6, 1))}>
        UNION: a full dedup pass, back to 3
      </T>
    </Svg>
  );
}

// 9 · Selection pushdown. Products as a strip of 40 cells of 1,250 each. Filter first: a scan dims the 39
// non-electronics cells and only the one electronics cell reaches the join. Filter after: every cell pours into the
// join, which builds 50,000 products' worth of pairings, and 48,750 are thrown away after.
export function PushdownSelection({ t }: StepCtx) {
  const N = 40;
  const HIT = 17;
  const cx = (i: number) => 25 + i * 8;
  const a = easeOut(seg(t, 0.1, 0.5));
  const k1 = seg(t, 0.9, 1.7);
  const m1 = easeInOut(seg(t, 1.7, 2.0));
  const k2 = seg(t, 2.1, 2.9);
  const tossed = easeOut(seg(t, 2.9, 3.3));
  const JX = 440;
  return (
    <Svg
      label="Filtering fifty thousand products down to one thousand two hundred fifty electronics before the join touches far fewer rows than joining all fifty thousand and filtering after"
      h={330}
    >
      <T x={25} y={24} s={13} f={C.latte} o={a}>
        products: 50,000 · 2.5% electronics
      </T>
      {/* filter first */}
      <T x={25} y={60} s={14} f={C.caramel} o={a}>
        filter first, then join
      </T>
      {Array.from({ length: N }, (_, i) => {
        const scanned = i / N < k1;
        const isHit = i === HIT;
        if (isHit && m1 > 0) return null;
        return <rect key={i} x={cx(i)} y={74} width={6} height={22} rx={1} fill={isHit && scanned ? C.caramel : C.crema} opacity={a * (scanned && !isHit ? 0.15 : 1)} />;
      })}
      {k1 > 0 && k1 < 1 && <line x1={cx(0) + k1 * N * 8} y1={68} x2={cx(0) + k1 * N * 8} y2={102} stroke={C.caramel} strokeWidth={2} />}
      {m1 > 0 && <rect x={lerp(cx(HIT), JX + 20, m1)} y={74} width={6} height={22} rx={1} fill={C.caramel} />}
      <rect x={JX} y={68} width={130} height={34} rx={6} fill="none" stroke={C.mocha} opacity={a} />
      <T x={JX + 100} y={91} s={15} f={C.latte} a="middle" o={a}>
        ⋈
      </T>
      <T x={575} y={128} s={14} f={C.caramel} a="end" o={m1}>
        join sees 1,250
      </T>
      {/* filter after */}
      <T x={25} y={186} s={14} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.2))}>
        join first, filter after
      </T>
      {Array.from({ length: N }, (_, i) => {
        const inn = i / N < k2;
        return <rect key={i} x={cx(i)} y={200} width={6} height={22} rx={1} fill={C.crema} opacity={easeOut(seg(t, 2.0, 2.2)) * (inn ? 0.15 : 1)} />;
      })}
      <rect x={JX} y={194} width={130} height={34} rx={6} fill={C.cherry} fillOpacity={0.35 * k2} stroke={C.mocha} opacity={easeOut(seg(t, 2.0, 2.2))} />
      <T x={JX + 100} y={217} s={15} f={C.latte} a="middle" o={easeOut(seg(t, 2.0, 2.2))}>
        ⋈
      </T>
      <T x={575} y={254} s={14} f={C.cherryText} a="end" o={k2 > 0 ? 1 : 0}>
        join sees {fmt(50_000 * k2)}
      </T>
      <T x={25} y={254} s={13} f={C.cherryText} o={tossed}>
        48,750 thrown away after
      </T>
      <T x={300} y={310} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 3.2, 3.7))}>
        same answer, about 98% fewer rows in
      </T>
    </Svg>
  );
}

// 10 · Projection pushdown.
export function PushdownProjection({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  const b = easeOut(seg(t, 1.6, 2.8));
  return (
    <Svg label="Reading every column of three hundred million order_item rows moves sixty six gigabytes; reading only the three needed columns moves seven point two gigabytes" h={320}>
      <T x={25} y={32} s={13} f={C.latte}>
        order_items: 300,000,000 rows
      </T>
      <T x={25} y={74} s={14} f={C.cherryText} o={a}>
        every column, 220 bytes/row
      </T>
      <Bar x={25} y={88} w={420 * a} h={26} full={420} fill={C.cherry} />
      <T x={25} y={134} s={15} f={C.crema} o={a}>
        66 GB moved
      </T>
      <T x={25} y={190} s={14} f={C.caramel} o={b}>
        3 columns, 24 bytes/row
      </T>
      <Bar x={25} y={204} w={420 * b * (24 / 220)} h={26} full={420} fill={C.caramel} />
      <T x={25} y={250} s={15} f={C.crema} o={b}>
        7.2 GB moved
      </T>
      <T x={300} y={300} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 2.8, 3.4))}>
        a 89% cut, before the rest of the tree ever runs
      </T>
    </Svg>
  );
}

// 11 · Join order doesn't change the answer.
export function JoinCommute({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const flip = easeInOut(seg(t, 1.6, 2.8));
  return (
    <Svg label="Joining orders with order items, or order items with orders, or regrouping the join of three tables, all return the same bag" h={320}>
      <g opacity={a}>
        <T x={150} y={60} s={15} f={C.crema} a="middle">
          R ⋈ S
        </T>
        <T x={450} y={60} s={15} f={C.crema} a="middle">
          S ⋈ R
        </T>
      </g>
      <g transform={`translate(${lerp(0, 160, flip)} 0)`}>
        <circle cx={150} cy={120} r={18} fill={C.caramel} />
        <T x={150} y={125} s={11} f={C.espresso} a="middle" w={700}>
          R
        </T>
      </g>
      <g transform={`translate(${lerp(0, -160, flip)} 0)`}>
        <circle cx={450} cy={120} r={18} fill={C.cinnamon} />
        <T x={450} y={125} s={11} f={C.espresso} a="middle" w={700}>
          S
        </T>
      </g>
      <T x={300} y={200} s={16} f={C.crema} a="middle" o={easeOut(seg(t, 2.2, 2.8))}>
        same rows, every order, every grouping
      </T>
      <T x={300} y={238} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 2.4, 3.0))}>
        this is the whole reason a planner
      </T>
      <T x={300} y={260} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 2.4, 3.0))}>
        can search join orders at all
      </T>
    </Svg>
  );
}

// 12 · Why UNION pays for a dedup.
export function PlannerPaths({ t }: StepCtx) {
  const appendDone = easeOut(seg(t, 0.2, 1.4));
  const dedupDone = easeOut(seg(t, 1.8, 3.2));
  return (
    <Svg
      label="UNION ALL compiles to one append pass over two hundred fifteen thousand rows; UNION compiles to that same append plus a second pass that hashes or sorts to find duplicates, four hundred thirty thousand row touches in total"
      h={340}
    >
      <T x={25} y={32} s={13} f={C.latte}>
        UNION ALL → Append
      </T>
      <Bar x={25} y={46} w={420 * appendDone} h={26} full={420} fill={C.caramel} />
      <T x={25} y={92} s={14} f={C.crema} o={appendDone}>
        215,000 row touches, one pass
      </T>

      <T x={25} y={150} s={13} f={C.latte}>
        UNION → Append, then HashAggregate or Sort + Unique
      </T>
      <Bar x={25} y={164} w={420 * appendDone} h={26} full={420} fill={C.caramel} />
      <Bar x={25} y={198} w={420 * dedupDone} h={26} full={420} fill={C.cherry} />
      <T x={25} y={244} s={14} f={C.cherryText} o={dedupDone}>
        430,000 row touches, two passes
      </T>
      <T x={300} y={296} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 3.0, 3.6))}>
        paid even when the two sides share no rows at all
      </T>
    </Svg>
  );
}

// 13 · Back to the problem.
export function Verdict({ t }: StepCtx) {
  const rows = [
    { k: 'UNION ALL (append only)', v: '215,000 row touches', fill: C.caramel },
    { k: 'UNION (append + dedup pass)', v: '430,000 row touches', fill: C.cherry },
  ];
  return (
    <Svg label="Keeping every flagged order costs one pass; deduplicating costs a second pass over the same rows" h={300}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.6, 1.2 + i * 0.6));
        const y = 70 + i * 100;
        return (
          <g key={r.k} opacity={clamp(a * 1.6)}>
            <T x={25} y={y} s={16} f={C.crema} w={600}>
              {r.k}
            </T>
            <Bar x={25} y={y + 16} w={420 * a * (i === 0 ? 0.5 : 1)} h={28} full={420} fill={r.fill} />
            <T x={25} y={y + 62} s={14} f={C.latte}>
              {r.v}
            </T>
          </g>
        );
      })}
      <T x={300} y={272} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 1.8, 2.4))}>
        173,000 distinct orders either way
      </T>
    </Svg>
  );
}

// Prove it: a shared quiz shell.
export function Quiz({ t, answer, chips, work }: StepCtx & { chips: string[]; work: string[] }) {
  return (
    <Svg label="A question with its numbers" h={340}>
      <T x={300} y={56} s={60} f={C.caramel} a="middle" o={answer === null ? 0.9 : 0.25} serif>
        ?
      </T>
      {chips.map((c, i) => {
        const a = easeOutBack(seg(t, 0.2 + i * 0.18, 0.7 + i * 0.18));
        const y = 110 + i * 48;
        return (
          <g key={c} transform={`translate(300 ${y}) scale(${clamp(a)})`} opacity={clamp(a)}>
            <rect x={-170} y={-19} width={340} height={38} rx={19} fill={C.roast} stroke={C.mocha} />
            <T x={0} y={5} s={14} f={C.crema} a="middle" w={600}>
              {c}
            </T>
          </g>
        );
      })}
      {answer !== null &&
        work.map((w, i) => (
          <T key={w} x={300} y={130 + chips.length * 48 + i * 26} s={14} f={C.caramel} a="middle" w={600}>
            {w}
          </T>
        ))}
    </Svg>
  );
}
