import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the row that survives / the operator under discussion, cherryText = the unsafe or wrong path,
// crema = data, taupe = quiet structure. Left table = customers c1..c5; right table = orders (c1 x3, c3 x1).

const CUST = ['c1', 'c2', 'c3', 'c4', 'c5'];
const ORD: Record<string, number> = { c1: 3, c3: 1 };
const rowY = (i: number) => 52 + i * 52;

function Left({ x = 40, o = 1, mark }: { x?: number; o?: number; mark?: (c: string) => string }) {
  return (
    <g opacity={o}>
      {CUST.map((c, i) => (
        <g key={c}>
          <rect x={x} y={rowY(i)} width={70} height={36} rx={8} fill={C.cocoa} stroke={mark ? mark(c) : C.mocha} strokeWidth={mark && mark(c) !== C.mocha ? 2 : 1} />
          <T x={x + 35} y={rowY(i) + 24} s={14} f={C.crema} a="middle">{c}</T>
        </g>
      ))}
    </g>
  );
}
function Right({ x = 430, o = 1 }: { x?: number; o?: number }) {
  const ids = ['c1', 'c1', 'c1', 'c3'];
  return (
    <g opacity={o}>
      {ids.map((c, i) => (
        <g key={i}>
          <rect x={x} y={rowY(i) + 8} width={70} height={30} rx={8} fill={C.roast} stroke={C.mocha} />
          <T x={x + 35} y={rowY(i) + 28} s={13} f={C.latte} a="middle">{`o${i + 1} → ${c}`}</T>
        </g>
      ))}
    </g>
  );
}
// Lines from left rows to their orders; `collapse` merges each bundle into one.
function Bundles({ collapse, show }: { collapse: number; show: number }) {
  const lines: JSX.Element[] = [];
  const ids = ['c1', 'c1', 'c1', 'c3'];
  ids.forEach((c, k) => {
    const li = CUST.indexOf(c);
    const y1 = rowY(li) + 18;
    const y2 = rowY(k) + 23;
    const yMid = y1 + (y2 - y1) * (1 - collapse);
    lines.push(<line key={k} x1={110} y1={y1} x2={430} y2={collapse > 0.5 && k > 0 && c === 'c1' ? y1 : y2} stroke={C.taupe} strokeWidth={2} opacity={clamp(show) * (collapse > 0.5 && c === 'c1' && k > 0 ? 0.15 : 1)} />);
    void yMid;
  });
  return <g>{lines}</g>;
}

// 1 · The question.
export function Question({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  return (
    <Svg label="Two questions about existence over customers and their orders" h={300}>
      <Left o={a} />
      <Right o={a} />
      <Bundles collapse={0} show={a} />
      <T x={300} y={30} s={14} f={C.latte} a="middle" o={a}>customers</T>
      <T x={465} y={30} s={14} f={C.latte} a="middle" o={a}>orders</T>
      <T x={300} y={290} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 1.8, 2.6))}>who has a match? who has none?</T>
    </Svg>
  );
}

// 2 · Semi-join.
export function SemiJoin({ t }: StepCtx) {
  const join = easeOut(seg(t, 0.4, 1.4));
  const semi = easeOut(seg(t, 2.2, 3.2));
  return (
    <Svg label="A join returns 4 rows; a semi-join returns the 2 customers that have a match, once each" h={320}>
      <Left mark={(c) => (semi > 0.5 && ORD[c] ? C.caramel : C.mocha)} />
      <Right />
      <Bundles collapse={semi} show={1} />
      <T x={300} y={296} s={16} f={C.crema} a="middle" o={join * (1 - semi)}>join: 4 rows, c1 three times</T>
      <T x={300} y={296} s={16} f={C.caramel} a="middle" w={700} o={semi}>semi-join: 2 rows, once each</T>
    </Svg>
  );
}

// 3 · Anti-join.
export function AntiJoin({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.6));
  return (
    <Svg label="The anti-join keeps the 3 customers with no matching order" h={320}>
      <Left mark={(c) => (!ORD[c] && a > 0.5 ? C.caramel : C.mocha)} />
      <Right />
      <Bundles collapse={0} show={1} />
      <T x={300} y={296} s={16} f={C.caramel} a="middle" w={700} o={a}>anti-join: 3 rows, the ones with no line</T>
    </Svg>
  );
}

// 4 · Predict: EXISTS vs JOIN + DISTINCT.
export function WorkPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const row = (y: number, label: string, steps: string[], hi: boolean) => (
    <g>
      <T x={25} y={y} s={14} f={hi ? C.caramel : C.latte} w={700}>{label}</T>
      {steps.map((s, i) => (
        <g key={s} opacity={easeOut(seg(t, 0.3 + i * 0.5, 0.8 + i * 0.5))}>
          <rect x={25 + i * 190} y={y + 14} width={170} height={40} rx={8} fill={C.cocoa} stroke={hi ? C.caramel : C.mocha} />
          <T x={110 + i * 190} y={y + 39} s={13} f={C.crema} a="middle">{s}</T>
        </g>
      ))}
    </g>
  );
  return (
    <Svg label="EXISTS is one step; a join followed by DISTINCT is two" h={300}>
      {row(40, 'EXISTS', ['semi-join'], answered)}
      {row(150, 'JOIN + DISTINCT', ['join: one row per order', 'dedup pass'], false)}
      {!answered && <T x={500} y={80} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={270} s={15} f={C.crema} a="middle">the dedup pass is pure overhead</T>}
    </Svg>
  );
}

// 5 · Five spellings.
const SPELL = [
  { q: 'EXISTS', s: 'safe', n: 'a row exists or it does not' },
  { q: 'IN', s: 'safe', n: 'a dropped UNKNOWN changes nothing' },
  { q: 'NOT EXISTS', s: 'safe', n: 'same fact, negated' },
  { q: 'LEFT JOIN … IS NULL', s: 'safe*', n: '*test a never-NULL key' },
  { q: 'NOT IN', s: 'conditional', n: 'only if no NULL is possible' },
];
export function Spellings({ t }: StepCtx) {
  return (
    <Svg label="Five existence spellings and which are always safe under NULLs" h={340}>
      {SPELL.map((r, i) => {
        const a = easeOutBack(seg(t, i * 0.5, i * 0.5 + 0.6));
        const y = 40 + i * 58;
        const bad = r.s === 'conditional';
        return (
          <g key={r.q} opacity={clamp(a)} transform={`translate(${(1 - clamp(a)) * -16} 0)`}>
            <T x={25} y={y} s={15} f={bad ? C.cherryText : C.caramel} w={700}>{r.q}</T>
            <T x={300} y={y} s={14} f={bad ? C.cherryText : C.crema}>{r.s}</T>
            <T x={25} y={y + 24} s={13} f={C.latte}>{r.n}</T>
          </g>
        );
      })}
    </Svg>
  );
}

function Gate({ t, certificate, label }: { t: number; certificate: boolean; label: string }) {
  const move = easeOut(seg(t, 0.6, 2.0));
  return (
    <g>
      <rect x={250} y={50} width={100} height={170} rx={10} fill={C.roast} stroke={C.taupe} />
      <T x={300} y={44} s={13} f={C.latte} a="middle">planner</T>
      <rect x={40 + move * 140} y={110} width={90} height={42} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
      <T x={85 + move * 140} y={136} s={14} f={C.crema} a="middle">{label}</T>
      {certificate && (
        <g opacity={easeOut(seg(t, 0.2, 0.8))}>
          <rect x={30} y={170} width={110} height={34} rx={6} fill="none" stroke={C.latte} strokeDasharray="5 4" />
          <T x={85} y={192} s={13} f={C.latte} a="middle">NOT NULL?</T>
        </g>
      )}
    </g>
  );
}

// 6 · EXISTS gate.
export function GateExists({ t }: StepCtx) {
  const out = easeOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="EXISTS passes the planner gate with no certificate and becomes a semi-join" h={300}>
      <Gate t={t} certificate={false} label="EXISTS" />
      <rect x={430} y={110} width={140} height={42} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={out} />
      <T x={500} y={136} s={14} f={C.caramel} a="middle" o={out}>semi-join</T>
      <T x={300} y={268} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>no nullability check at all</T>
    </Svg>
  );
}

// 7 · NOT IN gate.
export function GateNotIn({ t }: StepCtx) {
  const ok = easeOut(seg(t, 2.0, 2.8));
  const bad = easeOut(seg(t, 3.2, 4.0));
  return (
    <Svg label="NOT IN must present a NOT NULL certificate to become an anti-join; otherwise it takes the subplan side path" h={340}>
      <Gate t={t} certificate label="NOT IN" />
      <rect x={430} y={80} width={140} height={42} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={ok} />
      <T x={500} y={106} s={14} f={C.caramel} a="middle" o={ok}>anti-join</T>
      <T x={500} y={142} s={13} f={C.latte} a="middle" o={ok}>with the proof: fast</T>
      <rect x={430} y={190} width={140} height={42} rx={8} fill="none" stroke={C.cherryText} strokeDasharray="5 4" opacity={bad} />
      <T x={500} y={216} s={14} f={C.cherryText} a="middle" o={bad}>SubPlan</T>
      <T x={500} y={252} s={13} f={C.latte} a="middle" o={bad}>without it: correct, slower</T>
    </Svg>
  );
}

// 8 · Predict: schema decides.
export function SchemaPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Dropping NOT NULL changes the plan though the data is unchanged" h={300}>
      <T x={25} y={40} s={14} f={C.latte}>before: column NOT NULL</T>
      <rect x={25} y={52} width={170} height={40} rx={8} fill={C.cocoa} stroke={C.caramel} />
      <T x={110} y={78} s={14} f={C.crema} a="middle">Anti Join</T>
      <T x={25} y={142} s={14} f={C.latte}>after: constraint dropped, same rows</T>
      {!answered ? (
        <T x={110} y={200} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>
      ) : (
        <>
          <rect x={25} y={154} width={170} height={40} rx={8} fill="none" stroke={C.cherryText} strokeDasharray="5 4" />
          <T x={110} y={180} s={14} f={C.cherryText} a="middle">SubPlan</T>
          <T x={25} y={240} s={15} f={C.crema}>the planner reads the schema, not the data</T>
        </>
      )}
    </Svg>
  );
}

// 9 · EXPLAIN.
export function ExplainRead({ t }: StepCtx) {
  const lines = [
    { s: 'Hash Semi Join', k: 'EXISTS / IN', c: C.caramel },
    { s: 'Hash Anti Join', k: 'NOT EXISTS, or proven NOT IN', c: C.caramel },
    { s: 'Hash Right Semi Join', k: 'new in PostgreSQL 18', c: C.latte },
    { s: 'Filter: NOT (hashed SubPlan 1)', k: 'NOT IN, no proof', c: C.cherryText },
  ];
  return (
    <Svg label="EXPLAIN node labels for the fast paths and for the NOT IN fallback" h={300}>
      {lines.map((l, i) => {
        const a = easeOut(seg(t, i * 0.6, i * 0.6 + 0.6));
        return (
          <g key={l.s} opacity={clamp(a)}>
            <T x={25} y={50 + i * 64} s={15} f={l.c} w={700}>{l.s}</T>
            <T x={25} y={74 + i * 64} s={13} f={C.latte}>{l.k}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['existence questions', 'EXISTS / NOT EXISTS'],
    ['NOT IN', 'only with NOT NULL'],
    ['slow NOT IN', 'look for SubPlan'],
  ];
  return (
    <Svg label="Three rules for existence questions" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={22} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 11 · Prove it: spelling.
export function ProveSpelling({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Which spelling is unsafe over a nullable column" h={240}>
      <rect x={60} y={70} width={150} height={56} rx={10} fill="none" stroke={C.latte} strokeDasharray="5 4" />
      <T x={135} y={104} s={14} f={C.latte} a="middle">subquery column with a NULL</T>
      {answered ? <T x={330} y={108} s={26} f={C.cherryText} w={700}>NOT IN</T> : <T x={330} y={114} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}

// 12 · Prove it: once.
export function ProveOnce({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A customer with three matching orders appears once in a semi-join" h={240}>
      <rect x={60} y={80} width={70} height={36} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
      <T x={95} y={104} s={14} f={C.crema} a="middle">c1</T>
      {[0, 1, 2].map((i) => <line key={i} x1={130} y1={98} x2={300} y2={70 + i * 28} stroke={C.taupe} strokeWidth={2} />)}
      {answered ? <T x={400} y={104} s={24} f={C.caramel} w={700}>1 row</T> : <T x={400} y={112} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
