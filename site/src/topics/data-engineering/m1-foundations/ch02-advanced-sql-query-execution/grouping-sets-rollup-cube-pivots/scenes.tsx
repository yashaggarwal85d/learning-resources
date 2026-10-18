import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the grouping set under discussion, cherryText = the ambiguous or duplicated row, crema = data,
// latte = labels. A greyed dashed cell means "this column was not grouped on in this row" (a rollup NULL); a solid empty
// cell is a genuine data NULL: two textures for the same visual blank.

const money = (n: number) => n.toLocaleString('en-US');
const DET = [
  ['paid', 'Oct', 400],
  ['paid', 'Nov', 600],
  ['refunded', 'Oct', 50],
  ['refunded', 'Nov', 70],
] as const;

/** A report cell: value, rollup-NULL (dashed), or data-NULL (solid empty). */
function Cell({ x, y, w, v, kind = 'val', hi = false }: { x: number; y: number; w: number; v?: string; kind?: 'val' | 'rollup' | 'data'; hi?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={30} rx={6} fill={kind === 'data' ? C.roast : kind === 'rollup' ? 'none' : C.cocoa} stroke={hi ? C.cherryText : kind === 'rollup' ? C.taupe : C.mocha} strokeWidth={hi ? 2 : 1} strokeDasharray={kind === 'rollup' ? '4 3' : undefined} />
      {v !== undefined && <T x={x + w / 2} y={y + 20} s={13} f={C.crema} a="middle">{v}</T>}
    </g>
  );
}

// 1 · Three scans versus one.
export function ThreeScans({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="Three UNION ALL queries scan the table three times; grouping sets scan it once" h={300}>
      <T x={25} y={40} s={14} f={C.latte}>UNION ALL of three GROUP BYs</T>
      {[0, 1, 2].map((i) => <rect key={i} x={25 + i * 120} y={56} width={100} height={34} rx={8} fill={C.cocoa} stroke={C.cherryText} opacity={a} />)}
      {[0, 1, 2].map((i) => <T key={i} x={75 + i * 120} y={78} s={13} f={C.crema} a="middle" o={a}>scan {i + 1}</T>)}
      <T x={25} y={158} s={14} f={C.latte}>GROUPING SETS</T>
      <rect x={25} y={174} width={340} height={34} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={b} />
      <T x={195} y={196} s={13} f={C.crema} a="middle" o={b}>one scan, every level</T>
    </Svg>
  );
}

// 2 · The grouping sets as a table.
export function SetsTable({ t }: StepCtx) {
  const rows: { s: string; m: string; amt: string; k: 'a' | 'b' | 'c' }[] = [
    { s: 'paid', m: 'Oct', amt: money(400), k: 'a' },
    { s: 'paid', m: 'Nov', amt: money(600), k: 'a' },
    { s: 'paid', m: '', amt: money(1000), k: 'b' },
    { s: '', m: '', amt: money(1120), k: 'c' },
  ];
  return (
    <Svg label="Rows from three grouping sets: status and month, status alone, and the grand total" h={300}>
      <T x={30} y={36} s={13} f={C.latte}>status</T>
      <T x={170} y={36} s={13} f={C.latte}>month</T>
      <T x={310} y={36} s={13} f={C.latte}>SUM(amount)</T>
      {rows.map((r, i) => {
        const a = easeOutBack(seg(t, 0.4 + i * 0.7, 1.0 + i * 0.7));
        return (
          <g key={i} opacity={clamp(a)}>
            <Cell x={25} y={48 + i * 44} w={120} v={r.s || undefined} kind={r.s ? 'val' : 'rollup'} />
            <Cell x={165} y={48 + i * 44} w={120} v={r.m || undefined} kind={r.m ? 'val' : 'rollup'} />
            <Cell x={305} y={48 + i * 44} w={120} v={r.amt} />
            <T x={450} y={68 + i * 44} s={13} f={C.caramel}>{r.k === 'a' ? '(status, month)' : r.k === 'b' ? '(status)' : '()'}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · ROLLUP vs CUBE.
export function RollupCube({ t }: StepCtx) {
  const roll = ['(a, b)', '(a)', '()'];
  const cube = ['(a, b)', '(a)', '(b)', '()'];
  return (
    <Svg label="ROLLUP of two columns has 3 sets, CUBE has 4" h={300}>
      <T x={25} y={36} s={16} f={C.caramel} w={700}>ROLLUP(a, b)</T>
      {roll.map((s, i) => <g key={s} opacity={easeOut(seg(t, 0.3 + i * 0.4, 0.8 + i * 0.4))}><rect x={25 + i * 100} y={48} width={90} height={32} rx={8} fill={C.cocoa} stroke={C.mocha} /><T x={70 + i * 100} y={69} s={14} f={C.crema} a="middle">{s}</T></g>)}
      <T x={25} y={132} s={16} f={C.caramel} w={700}>CUBE(a, b)</T>
      {cube.map((s, i) => <g key={s} opacity={easeOut(seg(t, 1.8 + i * 0.4, 2.3 + i * 0.4))}><rect x={25 + i * 100} y={144} width={90} height={32} rx={8} fill={C.cocoa} stroke={C.mocha} /><T x={70 + i * 100} y={165} s={14} f={C.crema} a="middle">{s}</T></g>)}
      <T x={25} y={236} s={14} f={C.latte} o={easeOut(seg(t, 3.4, 4.0))}>over our data: rollup 7 rows, cube 9 rows</T>
    </Svg>
  );
}

// 4 · Predict: power set.
export function PowerSet({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const subsets = ['abc', 'ab', 'ac', 'bc', 'a', 'b', 'c', '()'];
  return (
    <Svg label="A cube is every subset of the columns" h={300}>
      {subsets.map((s, i) => (
        <g key={s} opacity={answered ? easeOut(seg(t, i * 0.15, i * 0.15 + 0.4)) : 0.25}>
          <rect x={25 + (i % 4) * 140} y={60 + Math.floor(i / 4) * 60} width={120} height={40} rx={8} fill={C.cocoa} stroke={answered ? C.caramel : C.mocha} />
          <T x={85 + (i % 4) * 140} y={86 + Math.floor(i / 4) * 60} s={14} f={C.crema} a="middle">{s}</T>
        </g>
      ))}
      {!answered && <T x={300} y={230} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={230} s={20} f={C.caramel} a="middle" w={700}>2 to the power 3 = 8 sets</T>}
    </Svg>
  );
}

// 5 · The ladder of subtotals.
export function Ladder({ t }: StepCtx) {
  const rows = [
    ['paid', 'Oct', '400', 'val'], ['paid', 'Nov', '600', 'val'], ['refunded', 'Oct', '50', 'val'], ['refunded', 'Nov', '70', 'val'],
    ['paid', '', '1,000', 'rollup'], ['refunded', '', '120', 'rollup'], ['', '', '1,120', 'rollup'],
  ];
  return (
    <Svg label="Detail rows, status subtotals and the grand total, with rolled-up columns drawn as dashed cells" h={360}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3));
        return (
          <g key={i} opacity={clamp(a)}>
            <Cell x={25} y={28 + i * 44} w={120} v={r[0] || undefined} kind={r[0] ? 'val' : 'rollup'} />
            <Cell x={165} y={28 + i * 44} w={110} v={r[1] || undefined} kind={r[1] ? 'val' : 'rollup'} />
            <Cell x={295} y={28 + i * 44} w={110} v={r[2]} />
          </g>
        );
      })}
      <T x={430} y={46} s={13} f={C.latte}>4 detail</T>
      <T x={430} y={46 + 4 * 44} s={13} f={C.latte}>2 subtotals</T>
      <T x={430} y={46 + 6 * 44} s={13} f={C.latte}>1 grand total</T>
    </Svg>
  );
}

// 6 · The collision.
export function Collision({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.2));
  const b = easeOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="A genuine NULL referrer and the rollup grand total both show NULL" h={300}>
      <T x={25} y={36} s={13} f={C.latte}>referred_by_customer_id</T>
      <T x={320} y={36} s={13} f={C.latte}>SUM(amount)</T>
      <g opacity={a}>
        <Cell x={25} y={50} w={150} v="17" />
        <Cell x={320} y={50} w={110} v="300" />
        <Cell x={25} y={96} w={150} kind="data" hi />
        <Cell x={320} y={96} w={110} v="500" />
        <T x={450} y={116} s={13} f={C.latte}>real NULL</T>
      </g>
      <g opacity={b}>
        <Cell x={25} y={168} w={150} kind="rollup" hi />
        <Cell x={320} y={168} w={110} v="800" />
        <T x={450} y={188} s={13} f={C.latte}>grand total</T>
      </g>
      <T x={300} y={260} s={15} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.8, 3.6))}>two different reasons, one identical blank</T>
    </Svg>
  );
}

// 7 · Predict: IS NULL.
export function IsNullPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A filter on IS NULL keeps both the data NULL row and the grand total row" h={300}>
      <Cell x={25} y={60} w={150} kind="data" hi={answered} />
      <T x={200} y={80} s={13} f={C.latte}>detail, real NULL</T>
      <Cell x={25} y={110} w={150} kind="rollup" hi={answered} />
      <T x={200} y={130} s={13} f={C.latte}>grand total</T>
      {!answered && <T x={470} y={116} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={230} s={16} f={C.cherryText} a="middle">both survive: a count is off by one</T>}
    </Svg>
  );
}

// 8 · GROUPING bitmask.
export function GroupingBits({ t }: StepCtx) {
  const rows = [
    { l: 'detail (status, month)', bits: '00', v: 0 },
    { l: 'status subtotal', bits: '01', v: 1 },
    { l: 'grand total', bits: '11', v: 3 },
  ];
  return (
    <Svg label="GROUPING over two columns is 0 for detail, 1 for a subtotal, and 3 for the grand total" h={300}>
      <T x={290} y={34} s={13} f={C.latte}>status month</T>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.8, 1.0 + i * 0.8));
        return (
          <g key={r.l} opacity={clamp(a)}>
            <T x={25} y={82 + i * 56} s={14} f={C.crema}>{r.l}</T>
            <T x={300} y={82 + i * 56} s={20} f={C.caramel} w={700}>{r.bits}</T>
            <T x={420} y={82 + i * 56} s={20} f={C.caramel} w={700}>= {r.v}</T>
          </g>
        );
      })}
      <T x={300} y={260} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 4.0))}>filter on GROUPING(col) = 0 AND col IS NULL</T>
    </Svg>
  );
}

// 9 · Duplicate sets.
export function Duplicates({ t }: StepCtx) {
  const sets = ['(a,b,c)', '(a,b)', '(a,b)', '(a,c)', '(a)', '(a)', '(a,c)', '(a)', '()'];
  const dedup = easeOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="ROLLUP(a,b) with ROLLUP(a,c) lists some grouping sets twice; DISTINCT removes them" h={320}>
      <T x={25} y={32} s={13} f={C.latte}>GROUP BY ROLLUP(a, b), ROLLUP(a, c)</T>
      {sets.map((s, i) => {
        const dup = sets.indexOf(s) !== i;
        return (
          <g key={i} opacity={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2)) * (dup ? 1 - 0.7 * dedup : 1)}>
            <rect x={25 + (i % 5) * 112} y={60 + Math.floor(i / 5) * 56} width={100} height={36} rx={8} fill={C.cocoa} stroke={dup ? C.cherryText : C.mocha} />
            <T x={75 + (i % 5) * 112} y={83 + Math.floor(i / 5) * 56} s={13} f={dup ? C.cherryText : C.crema} a="middle">{s}</T>
          </g>
        );
      })}
      <T x={300} y={230} s={15} f={C.caramel} a="middle" o={dedup}>GROUP BY DISTINCT keeps one of each</T>
    </Svg>
  );
}

// 10 · Pivot fold.
export function PivotFold({ t }: StepCtx) {
  const f = easeOut(seg(t, 1.2, 3.0));
  const long = [['Oct', 'paid', '400'], ['Oct', 'refunded', '50'], ['Nov', 'paid', '600'], ['Nov', 'refunded', '70']];
  return (
    <Svg label="A tall strip with one row per month and status folds into a wide strip with one column per status" h={320}>
      <g opacity={1 - f}>
        {long.map((r, i) => (
          <g key={i}>
            <Cell x={40} y={30 + i * 40} w={80} v={r[0]} />
            <Cell x={130} y={30 + i * 40} w={110} v={r[1]} />
            <Cell x={250} y={30 + i * 40} w={80} v={r[2]} />
          </g>
        ))}
      </g>
      <g opacity={f}>
        <T x={40} y={34} s={13} f={C.latte}>month</T>
        <T x={160} y={34} s={13} f={C.caramel}>paid</T>
        <T x={290} y={34} s={13} f={C.caramel}>refunded</T>
        {[['Oct', '400', '50'], ['Nov', '600', '70']].map((r, i) => (
          <g key={r[0]}>
            <Cell x={40} y={48 + i * 44} w={90} v={r[0]} />
            <Cell x={140} y={48 + i * 44} w={100} v={r[1]} />
            <Cell x={260} y={48 + i * 44} w={110} v={r[2]} />
          </g>
        ))}
      </g>
      <T x={300} y={260} s={14} f={C.latte} a="middle" o={f}>SUM(amount) FILTER (WHERE status = …) per column</T>
    </Svg>
  );
}

// 11 · Dialects.
export function Dialects({ t }: StepCtx) {
  const rows = [
    ['FILTER (WHERE …)', 'standard; PostgreSQL, DuckDB', true],
    ['SUM(CASE WHEN …)', 'any engine', true],
    ['PIVOT … FOR … IN', 'Snowflake, BigQuery, SQL Server', false],
  ] as const;
  return (
    <Svg label="Three ways to pivot and where each works" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 70} s={16} f={r[2] ? C.caramel : C.cherryText} w={700}>{r[0]}</T>
          <T x={25} y={86 + i * 70} s={13} f={C.latte}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 12 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['one scan', 'ROLLUP / CUBE / GROUPING SETS'], ['two kinds of NULL', 'GROUPING() = 0'], ['wide report', 'FILTER (WHERE …)']];
  return (
    <Svg label="Three habits for multi-level reports" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={20} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveRollup({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="ROLLUP over three columns" h={240}>
      <T x={40} y={100} s={20} f={C.latte}>ROLLUP(a, b, c) →</T>
      {answered ? <T x={330} y={102} s={26} f={C.caramel} w={700}>4 sets</T> : <T x={340} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProveBits({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="GROUPING on the grand total of two columns" h={240}>
      <T x={40} y={84} s={20} f={C.latte}>grand total → GROUPING =</T>
      {answered ? <T x={40} y={140} s={30} f={C.caramel} w={700}>3</T> : <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
