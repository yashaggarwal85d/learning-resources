import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, easeInOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar: caramel = the operator or path under discussion, cherry/cherryText = the costly
// or wrong path, cinnamon = the alternative being compared, taupe = quiet/structural, latte = labels,
// crema = data/results.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// 1 · The problem: a query is secretly a tree.
export function QueryTree({ t }: StepCtx) {
  const sql = "SELECT * FROM orders JOIN order_items ... WHERE status = 'refunded'";
  const chars = Math.floor(seg(t, 0.2, 1.8) * sql.length);
  const nodes = easeOut(seg(t, 2.0, 3.2));
  return (
    <Svg label="A SQL query is read left to right, but the engine sees it as a tree of small operators" h={320}>
      <rect x={25} y={30} width={550} height={40} rx={10} fill={C.roast} stroke={C.mocha} />
      <T x={40} y={55} s={13} f={C.crema}>{sql.slice(0, chars)}</T>
      <g opacity={clamp(nodes)}>
        <circle cx={300} cy={130} r={22} fill={C.caramel} />
        <T x={300} y={135} s={13} f={C.espresso} a="middle" w={700}>σ</T>
        <line x1={280} y1={148} x2={220} y2={190} stroke={C.taupe} strokeWidth={2} />
        <line x1={320} y1={148} x2={380} y2={190} stroke={C.taupe} strokeWidth={2} />
        <circle cx={220} cy={210} r={22} fill={C.cinnamon} />
        <T x={220} y={215} s={13} f={C.espresso} a="middle" w={700}>⋈</T>
        <circle cx={380} cy={210} r={18} fill={C.mocha} />
        <T x={380} y={215} s={11} f={C.crema} a="middle">products</T>
        <line x1={200} y1={230} x2={160} y2={270} stroke={C.taupe} strokeWidth={2} />
        <line x1={240} y1={230} x2={280} y2={270} stroke={C.taupe} strokeWidth={2} />
        <circle cx={160} cy={290} r={18} fill={C.mocha} />
        <T x={160} y={295} s={11} f={C.crema} a="middle">orders</T>
        <circle cx={280} cy={290} r={18} fill={C.mocha} />
        <T x={280} y={295} s={10} f={C.crema} a="middle">order_items</T>
      </g>
      <T x={300} y={30 + 60} s={13} f={C.latte} a="middle" o={clamp(nodes)}>leaves are tables, every node is an operator</T>
    </Svg>
  );
}

// 2 · The six operators.
const OPS = [
  { sym: 'σ', sql: 'WHERE', d: 'keep some rows' },
  { sym: 'π', sql: 'SELECT list', d: 'keep some columns' },
  { sym: '⋈', sql: 'JOIN', d: 'combine two tables' },
  { sym: '×', sql: 'CROSS JOIN', d: 'every pairing' },
  { sym: '∪ ∩ −', sql: 'UNION / INTERSECT / EXCEPT', d: 'combine two results' },
  { sym: 'γ', sql: 'GROUP BY', d: 'collapse into groups' },
];
export function OperatorTable({ t }: StepCtx) {
  return (
    <Svg label="Six operators cover every SQL query: selection, projection, join, product, the set operators and aggregation" h={360}>
      {OPS.map((op, i) => {
        const a = easeOutBack(seg(t, i * 0.3, i * 0.3 + 0.6));
        const y = 36 + i * 54;
        return (
          <g key={op.sym} opacity={clamp(a)} transform={`translate(${(1 - a) * -20} 0)`}>
            <T x={25} y={y} s={24} f={C.caramel} w={700}>{op.sym}</T>
            <T x={110} y={y} s={14} f={C.crema} w={600}>{op.sql}</T>
            <T x={320} y={y} s={13} f={C.latte}>{op.d}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · Predict: how many rows for a repeat customer.
export function RowsPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const N = 5;
  return (
    <Svg label="A customer who placed five orders runs a plain select on customer id, with no grouping" h={300}>
      <T x={25} y={40} s={14} f={C.latte}>SELECT customer_id FROM orders;</T>
      <T x={25} y={66} s={13} f={C.taupe}>one customer, five orders placed</T>
      {Array.from({ length: N }, (_, i) => {
        const a = easeOutBack(seg(t, 0.3 + i * 0.15, 0.7 + i * 0.15));
        return <rect key={i} x={25 + i * 70} y={110} width={56} height={56} rx={10} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} opacity={clamp(a)} />;
      })}
      {!answered && <T x={300} y={240} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={240} s={22} f={C.crema} a="middle" w={600}>five rows: one per order, one per fact</T>}
    </Svg>
  );
}

// 4 · A bag, not a set.
export function BagVsSet({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const b = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="A set cannot hold the same value twice; a bag can, and remembers how many times" h={320}>
      <T x={150} y={40} s={15} f={C.latte} a="middle">a set</T>
      <circle cx={150} cy={140} r={70} fill="none" stroke={C.cherry} strokeWidth={2} opacity={a} />
      <T x={150} y={120} s={15} f={C.crema} a="middle" o={a}>7</T>
      <T x={150} y={160} s={13} f={C.cherryText} a="middle" o={a}>cannot repeat</T>

      <T x={450} y={40} s={15} f={C.latte} a="middle">a bag</T>
      <circle cx={450} cy={140} r={70} fill="none" stroke={C.caramel} strokeWidth={2} opacity={b} />
      <T x={420} y={120} s={15} f={C.crema} a="middle" o={b}>7</T>
      <T x={480} y={120} s={15} f={C.crema} a="middle" o={b}>7</T>
      <T x={450} y={150} s={15} f={C.crema} a="middle" o={b}>7</T>
      <T x={450} y={190} s={13} f={C.caramel} a="middle" o={b}>repeats, and counts them</T>
      <T x={300} y={280} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>SQL tables and results are bags</T>
    </Svg>
  );
}

// 5 · Collapsing by accident.
export function CollapseByAccident({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const gone = easeInOut(seg(t, 1.6, 2.8));
  return (
    <Svg label="Collapsing repeats before an aggregate deletes facts a sum needs to count" h={320}>
      <T x={25} y={36} s={14} f={C.latte}>SELECT customer_id, SUM(amount) FROM orders GROUP BY customer_id;</T>
      {Array.from({ length: 5 }, (_, i) => {
        const fade = i > 0 ? gone : 0;
        return (
          <rect
            key={i}
            x={25 + i * 70}
            y={80}
            width={56}
            height={56}
            rx={10}
            fill={C.cocoa}
            stroke={C.caramel}
            strokeWidth={1.5}
            opacity={clamp(a) * (1 - fade * 0.85)}
          />
        );
      })}
      <T x={25} y={176} s={13} f={C.cherryText} o={gone}>DISTINCT first throws away four of the five amounts</T>
      <T x={300} y={240} s={16} f={C.crema} a="middle" o={easeOut(seg(t, 2.8, 3.4))}>every row must survive long enough to be counted once each</T>
    </Svg>
  );
}

// 6 · Two ways to stack results.
export function UnionStack({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const b = easeOut(seg(t, 1.6, 2.8));
  return (
    <Svg label="Stacking a hundred twenty thousand automatically flagged orders with ninety five thousand manually flagged orders: keep everything, two hundred fifteen thousand rows; or drop the forty two thousand that overlap, one hundred seventy three thousand rows" h={340}>
      <T x={25} y={36} s={13} f={C.latte}>flagged_auto: 120,000 · flagged_manual: 95,000 · both: 42,000</T>
      <Bar x={25} y={70} w={420 * a} h={30} full={420} fill={C.caramel} />
      <T x={25} y={118} s={16} f={C.crema} o={a}>UNION ALL → {fmt(215_000 * a)} rows</T>
      <Bar x={25} y={160} w={420 * b * (173 / 215)} h={30} full={420} fill={C.cinnamon} />
      <T x={25} y={208} s={16} f={C.crema} o={b}>UNION → {fmt(173_000 * b)} rows</T>
      <T x={300} y={280} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>neither is the bug — picking the wrong one for the question is</T>
    </Svg>
  );
}

// 7 · INTERSECT and EXCEPT, with or without ALL.
export function IntersectExcept({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const b = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="Bag A holds one and one and two; bag B holds one and two and two; intersect all keeps one row of each, except all keeps one leftover one, plain except keeps nothing" h={340}>
      <T x={25} y={32} s={13} f={C.latte}>A = {'{1, 1, 2}'}   B = {'{1, 2, 2}'}</T>
      <g opacity={a}>
        <T x={25} y={90} s={15} f={C.crema}>A INTERSECT ALL B → {'{1, 2}'}, 2 rows</T>
        <T x={25} y={118} s={15} f={C.crema}>A INTERSECT B → {'{1, 2}'}, 2 rows</T>
      </g>
      <g opacity={b}>
        <T x={25} y={176} s={15} f={C.caramel}>A EXCEPT ALL B → {'{1}'}, 1 row</T>
        <T x={25} y={204} s={15} f={C.cherryText}>A EXCEPT B → {'{}'}, 0 rows</T>
      </g>
      <T x={300} y={270} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>without ALL, EXCEPT can drop to nothing, not just fewer</T>
    </Svg>
  );
}

// 8 · Predict: idempotence.
export function IdempotencePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A list with three rows, stacked with itself keeping every row" h={300}>
      <T x={25} y={40} s={14} f={C.latte}>A has 3 rows. A UNION ALL A has how many?</T>
      {Array.from({ length: 3 }, (_, i) => (
        <rect key={i} x={25 + i * 70} y={70} width={56} height={56} rx={10} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
      ))}
      {!answered && <T x={300} y={220} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <>
          {Array.from({ length: 6 }, (_, i) => {
            const e = easeOutBack(seg(t, i * 0.1, i * 0.1 + 0.4));
            return <rect key={i} x={25 + (i % 6) * 70} y={160} width={56} height={40} rx={8} fill={C.cherry} opacity={clamp(e)} />;
          })}
          <T x={300} y={240} s={16} f={C.cherryText} a="middle" w={600}>six — every row doubles</T>
        </>
      )}
    </Svg>
  );
}

// 9 · Selection pushdown.
export function PushdownSelection({ t }: StepCtx) {
  const before = easeOut(seg(t, 0.2, 1.2));
  const after = easeOut(seg(t, 1.6, 2.8));
  return (
    <Svg label="Filtering fifty thousand products down to one thousand two hundred fifty electronics rows before the join touches far fewer rows than filtering after" h={340}>
      <T x={25} y={32} s={13} f={C.latte}>products: 50,000 rows · 2.5% are electronics</T>
      <g opacity={before}>
        <T x={25} y={80} s={14} f={C.cherryText}>join first, filter after</T>
        <Bar x={25} y={94} w={420} h={24} full={420} fill={C.cherry} />
        <T x={25} y={138} s={13} f={C.latte}>join sees all 50,000 products</T>
      </g>
      <g opacity={after}>
        <T x={25} y={190} s={14} f={C.caramel}>filter first, join after (pushdown)</T>
        <Bar x={25} y={204} w={420 * (1250 / 50000)} h={24} full={420} fill={C.caramel} />
        <T x={25} y={248} s={13} f={C.latte}>join sees 1,250 products — 48,750 pruned</T>
      </g>
      <T x={300} y={300} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.8, 3.4))}>same answer, about 98% fewer rows into the join</T>
    </Svg>
  );
}

// 10 · Projection pushdown.
export function PushdownProjection({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  const b = easeOut(seg(t, 1.6, 2.8));
  return (
    <Svg label="Reading every column of three hundred million order_item rows moves sixty six gigabytes; reading only the three needed columns moves seven point two gigabytes" h={320}>
      <T x={25} y={32} s={13} f={C.latte}>order_items: 300,000,000 rows</T>
      <T x={25} y={74} s={14} f={C.cherryText} o={a}>every column, 220 bytes/row</T>
      <Bar x={25} y={88} w={420 * a} h={26} full={420} fill={C.cherry} />
      <T x={25} y={134} s={15} f={C.crema} o={a}>66 GB moved</T>
      <T x={25} y={190} s={14} f={C.caramel} o={b}>3 columns, 24 bytes/row</T>
      <Bar x={25} y={204} w={420 * b * (24 / 220)} h={26} full={420} fill={C.caramel} />
      <T x={25} y={250} s={15} f={C.crema} o={b}>7.2 GB moved</T>
      <T x={300} y={300} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 2.8, 3.4))}>a 89% cut, before the rest of the tree ever runs</T>
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
        <T x={150} y={60} s={15} f={C.crema} a="middle">R ⋈ S</T>
        <T x={450} y={60} s={15} f={C.crema} a="middle">S ⋈ R</T>
      </g>
      <g transform={`translate(${lerp(0, 160, flip)} 0)`}>
        <circle cx={150} cy={120} r={18} fill={C.caramel} />
        <T x={150} y={125} s={11} f={C.espresso} a="middle" w={700}>R</T>
      </g>
      <g transform={`translate(${lerp(0, -160, flip)} 0)`}>
        <circle cx={450} cy={120} r={18} fill={C.cinnamon} />
        <T x={450} y={125} s={11} f={C.espresso} a="middle" w={700}>S</T>
      </g>
      <T x={300} y={200} s={16} f={C.crema} a="middle" o={easeOut(seg(t, 2.2, 2.8))}>same rows, every order, every grouping</T>
      <T x={300} y={240} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 2.4, 3.0))}>this is the whole reason a planner can search join orders at all</T>
    </Svg>
  );
}

// 12 · Why UNION pays for a dedup.
export function PlannerPaths({ t }: StepCtx) {
  const appendDone = easeOut(seg(t, 0.2, 1.4));
  const dedupDone = easeOut(seg(t, 1.8, 3.2));
  return (
    <Svg label="UNION ALL compiles to one append pass over two hundred fifteen thousand rows; UNION compiles to that same append plus a second pass that hashes or sorts to find duplicates, four hundred thirty thousand row touches in total" h={340}>
      <T x={25} y={32} s={13} f={C.latte}>UNION ALL → Append</T>
      <Bar x={25} y={46} w={420 * appendDone} h={26} full={420} fill={C.caramel} />
      <T x={25} y={92} s={14} f={C.crema} o={appendDone}>215,000 row touches, one pass</T>

      <T x={25} y={150} s={13} f={C.latte}>UNION → Append, then HashAggregate or Sort + Unique</T>
      <Bar x={25} y={164} w={420 * appendDone} h={26} full={420} fill={C.caramel} />
      <Bar x={25} y={198} w={420 * dedupDone} h={26} full={420} fill={C.cherry} />
      <T x={25} y={244} s={14} f={C.cherryText} o={dedupDone}>430,000 row touches, two passes</T>
      <T x={300} y={296} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 3.0, 3.6))}>paid even when the two sides share no rows at all</T>
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
            <T x={25} y={y} s={16} f={C.crema} w={600}>{r.k}</T>
            <Bar x={25} y={y + 16} w={420 * a * (i === 0 ? 0.5 : 1)} h={28} full={420} fill={r.fill} />
            <T x={25} y={y + 62} s={14} f={C.latte}>{r.v}</T>
          </g>
        );
      })}
      <T x={300} y={272} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 1.8, 2.4))}>distinct order ids: 173,000 either way the question is asked</T>
    </Svg>
  );
}

// Prove it: a shared quiz shell.
export function Quiz({ t, answer, chips, work }: StepCtx & { chips: string[]; work: string[] }) {
  return (
    <Svg label="A question with its numbers" h={340}>
      <T x={300} y={56} s={60} f={C.caramel} a="middle" o={answer === null ? 0.9 : 0.25} serif>?</T>
      {chips.map((c, i) => {
        const a = easeOutBack(seg(t, 0.2 + i * 0.18, 0.7 + i * 0.18));
        const y = 110 + i * 48;
        return (
          <g key={c} transform={`translate(300 ${y}) scale(${clamp(a)})`} opacity={clamp(a)}>
            <rect x={-170} y={-19} width={340} height={38} rx={19} fill={C.roast} stroke={C.mocha} />
            <T x={0} y={5} s={14} f={C.crema} a="middle" w={600}>{c}</T>
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
