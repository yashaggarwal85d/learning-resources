import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: plan trees root at the top; caramel = the rewritten (cheaper) form, cherryText = the operator being removed
// or the costly dependent form, crema = data, latte = labels, taupe = structure.

function Node({ x, y, label, w = 130, hi = false, bad = false, dashed = false, o = 1 }: { x: number; y: number; label: string; w?: number; hi?: boolean; bad?: boolean; dashed?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - 18} width={w} height={36} rx={8} fill={dashed ? 'none' : C.cocoa} stroke={bad ? C.cherryText : hi ? C.caramel : C.mocha} strokeWidth={hi || bad ? 2 : 1} strokeDasharray={dashed ? '5 4' : undefined} />
      <T x={x} y={y + 5} s={13} f={bad ? C.cherryText : C.crema} a="middle">{label}</T>
    </g>
  );
}
const Edge = ({ a, b, o = 1 }: { a: [number, number]; b: [number, number]; o?: number }) => <line x1={a[0]} y1={a[1] + 18} x2={b[0]} y2={b[1] - 18} stroke={C.taupe} strokeWidth={2} opacity={o} />;

// 1 · Before costs.
export function BeforeCosts({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="Rewrites happen before the planner costs anything" h={240}>
      <Node x={110} y={80} label="parse + bind" w={150} />
      <Node x={300} y={80} label="rewrite" w={130} hi />
      <Node x={490} y={80} label="plan + cost" w={150} />
      <T x={300} y={50} s={13} f={C.caramel} a="middle" o={a}>proofs, no numbers</T>
      <T x={300} y={160} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 1.6, 2.4))}>one legal plan becomes a cheaper, equally legal one</T>
    </Svg>
  );
}

// 2 · Safe three.
export function Safe({ t }: StepCtx) {
  const items = [['predicate pushdown', 'filter early'], ['projection pushdown', 'drop columns early'], ['constant folding', '2 + 3  →  5, once']];
  return (
    <Svg label="Predicate pushdown, projection pushdown and constant folding" h={260}>
      {items.map((it, i) => (
        <g key={it[0]} opacity={easeOut(seg(t, i * 0.7, i * 0.7 + 0.7))}>
          <T x={25} y={60 + i * 70} s={18} f={C.caramel} w={700}>{it[0]}</T>
          <T x={25} y={86 + i * 70} s={14} f={C.latte}>{it[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · Eliminate.
export function Eliminate({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.4, 2.8));
  return (
    <Svg label="A LEFT JOIN with a unique key and no inner column used is deleted with its scan" h={300}>
      <Node x={300} y={50} label="Left Join" hi={a < 0.5} bad={a >= 0.5} dashed={a >= 0.9} />
      <Node x={180} y={150} label="Scan orders" hi />
      <Node x={420} y={150} label="Scan customers" bad={a >= 0.5} dashed={a >= 0.9} o={1 - 0.7 * a} />
      <Edge a={[300, 50]} b={[180, 150]} />
      <Edge a={[300, 50]} b={[420, 150]} o={1 - a} />
      <T x={300} y={240} s={15} f={C.caramel} a="middle" o={a}>left: just Scan orders</T>
    </Svg>
  );
}

// 4 · Predict.
export function EliminatePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="What remains of an unused LEFT JOIN on a primary key" h={280}>
      <Node x={300} y={50} label="Left Join" />
      <Node x={180} y={140} label="Scan orders" />
      <Node x={420} y={140} label="Scan customers" />
      <Edge a={[300, 50]} b={[180, 140]} />
      <Edge a={[300, 50]} b={[420, 140]} />
      {!answered ? <T x={300} y={235} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={300} y={230} s={18} f={C.caramel} a="middle" w={700}>only Scan orders remains</T>}
    </Svg>
  );
}

// 5 · Strength reduction.
export function Strength({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.0, 2.2));
  return (
    <Svg label="A strict WHERE on the right side turns the LEFT JOIN into an inner join" h={260}>
      <Node x={150} y={80} label="Left Join" bad={a > 0.5} />
      <Node x={450} y={80} label="Inner Join" hi w={150} o={a} />
      <T x={150} y={140} s={13} f={C.latte} a="middle">keeps null-extended rows</T>
      <T x={300} y={86} s={20} f={C.caramel} a="middle" o={a}>→</T>
      <T x={300} y={190} s={14} f={C.cherryText} a="middle" o={easeOut(seg(t, 0.4, 1.2))}>WHERE b.y = 42 rejects every null-extended row</T>
      <T x={450} y={140} s={13} f={C.latte} a="middle" o={a}>freely reorderable</T>
    </Svg>
  );
}

// 6 · To anti.
export function ToAnti({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.0, 2.2));
  return (
    <Svg label="LEFT JOIN with IS NULL on the right becomes an Anti join, like NOT EXISTS" h={260}>
      <Node x={150} y={70} label="Left Join + IS NULL" w={190} />
      <Node x={150} y={170} label="NOT EXISTS" w={150} />
      <Node x={450} y={120} label="Anti Join" hi w={150} o={a} />
      <line x1={245} y1={78} x2={375} y2={112} stroke={C.caramel} strokeWidth={2} opacity={a} />
      <line x1={225} y1={170} x2={375} y2={128} stroke={C.caramel} strokeWidth={2} opacity={a} />
      <T x={300} y={236} s={14} f={C.latte} a="middle" o={a}>two spellings, one operator</T>
    </Svg>
  );
}

// 7 · Anti predict.
export function AntiPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The join type of LEFT JOIN with IS NULL on the right side" h={240}>
      <T x={25} y={70} s={15} f={C.crema}>a LEFT JOIN b ON a.x = b.y</T>
      <T x={25} y={100} s={15} f={C.crema}>WHERE b.z IS NULL</T>
      {!answered ? <T x={430} y={96} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={430} y={100} s={24} f={C.caramel} a="middle" w={700}>Anti</T>}
    </Svg>
  );
}

// 8 · Dependent join.
export function Dependent({ t }: StepCtx) {
  const k = Math.min(7, Math.floor(t / 0.45));
  return (
    <Svg label="A dependent join evaluates the inner query once for each outer row" h={300}>
      <T x={25} y={34} s={13} f={C.latte}>outer rows</T>
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={25 + i * 40} y={46} width={32} height={26} rx={5} fill={i <= k ? C.cherry : C.cocoa} stroke={C.mocha} />)}
      <T x={25} y={110} s={13} f={C.latte}>inner subquery, rerun each time</T>
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={25 + i * 40} y={122} width={32} height={26} rx={5} fill={C.cinnamon} opacity={i <= k ? 1 : 0.15} />)}
      <T x={25} y={190} s={16} f={C.cherryText} w={700}>1,000 outer rows → 1,000 evaluations</T>
    </Svg>
  );
}

// 9 · Pull up.
export function PullUp({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.8, 2.4));
  return (
    <Svg label="Pulling the dependent predicate up turns the dependent join into a semi-join" h={260}>
      <Node x={150} y={70} label="Dependent EXISTS" w={170} bad={a < 0.6} />
      <Node x={450} y={70} label="Semi-join" hi w={150} o={a} />
      <line x1={235} y1={70} x2={375} y2={70} stroke={C.caramel} strokeWidth={3} opacity={a} />
      <T x={300} y={50} s={13} f={C.caramel} a="middle" o={a}>pull the predicate up</T>
      <T x={300} y={160} s={16} f={C.caramel} a="middle" w={700} o={easeOut(seg(t, 2.4, 3.2))}>one pass instead of 1,000 evaluations</T>
    </Svg>
  );
}

// 10 · Push down.
export function PushDown({ t }: StepCtx) {
  const k = Math.min(3, Math.floor(t / 0.9));
  const levels = ['top', 'through a join', 'through a group-by', 'through an outer join'];
  return (
    <Svg label="The dependent join is pushed down through operators until it becomes a regular join" h={300}>
      {levels.map((l, i) => (
        <g key={l}>
          <Node x={300} y={50 + i * 66} label={l} w={200} hi={i === k} bad={i < k} dashed={i < k} />
          {i < 3 && <Edge a={[300, 50 + i * 66]} b={[300, 50 + (i + 1) * 66]} />}
        </g>
      ))}
      <T x={300} y={288} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.2, 4.0))}>until the values it needs are already local</T>
    </Svg>
  );
}

// 11 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['redundant join', 'trust the planner first'], ['equivalent spellings', 'choose for readability'], ['SubPlan that stays', 'a shape the heuristics miss']];
  return (
    <Svg label="Three habits about rewrites" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={20} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveRemove({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="When a LEFT JOIN can be deleted" h={240}>
      <T x={40} y={90} s={16} f={C.latte}>LEFT JOIN deletable if…</T>
      {answered ? <><T x={40} y={130} s={15} f={C.caramel}>≤ 1 inner match</T><T x={40} y={158} s={15} f={C.caramel}>no inner column used</T></> : <T x={400} y={120} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProveDependent({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The name for a subquery that needs the outer row" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>needs the outer row →</T>
      {answered ? <T x={330} y={104} s={22} f={C.caramel} w={700}>dependent join</T> : <T x={340} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
