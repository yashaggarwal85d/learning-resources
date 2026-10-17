import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the chosen / kept row, cherryText = the ambiguous or lost row, crema = data, latte = labels.
// Scores 90, 80, 80, 70 (the two 80s tie).

const SC = [90, 80, 80, 70];
const RN = [1, 2, 3, 4];
const RK = [1, 2, 2, 4];
const DR = [1, 2, 2, 3];

function Bar({ i, y, label, f = C.cocoa, stroke = C.mocha, o = 1 }: { i: number; y: number; label: string; f?: string; stroke?: string; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={25} y={y} width={90 + SC[i]} height={30} rx={7} fill={f} stroke={stroke} />
      <T x={35} y={y + 20} s={14} f={C.crema}>{label}</T>
    </g>
  );
}

// 1 · Podium.
export function Podium({ t }: StepCtx) {
  return (
    <Svg label="Four scores, two of them tied" h={260}>
      {SC.map((s, i) => <Bar key={i} i={i} y={40 + i * 46} label={`score ${s}`} stroke={i === 1 || i === 2 ? C.cherryText : C.mocha} o={easeOut(seg(t, i * 0.3, i * 0.3 + 0.5))} />)}
      <T x={330} y={118} s={15} f={C.cherryText} o={easeOut(seg(t, 1.6, 2.4))}>tied: who is second?</T>
    </Svg>
  );
}

// 2 · Three numberings.
export function ThreeNumberings({ t }: StepCtx) {
  const cols = [['ROW_NUMBER', RN], ['RANK', RK], ['DENSE_RANK', DR]] as const;
  return (
    <Svg label="ROW_NUMBER, RANK and DENSE_RANK on scores 90, 80, 80 and 70" h={300}>
      <T x={25} y={34} s={13} f={C.latte}>score</T>
      {SC.map((s, i) => <T key={i} x={25} y={78 + i * 46} s={16} f={C.crema}>{String(s)}</T>)}
      {cols.map(([name, vals], c) => (
        <g key={name} opacity={easeOut(seg(t, 0.4 + c * 1.0, 1.0 + c * 1.0))}>
          <T x={130 + c * 150} y={34} s={13} f={C.caramel} w={700}>{name}</T>
          {vals.map((v, i) => (
            <g key={i}>
              <rect x={130 + c * 150} y={52 + i * 46} width={50} height={34} rx={8} fill={C.cocoa} stroke={(i === 1 || i === 2) ? C.cherryText : C.mocha} />
              <T x={155 + c * 150} y={76 + i * 46} s={16} f={C.crema} a="middle">{String(v)}</T>
            </g>
          ))}
        </g>
      ))}
    </Svg>
  );
}

// 3 · Predict gap.
export function GapPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Three rows tie for first; what rank is the next row?" h={280}>
      {[0, 1, 2].map((i) => <g key={i}><rect x={25} y={40 + i * 40} width={170} height={30} rx={7} fill={C.cocoa} stroke={C.caramel} /><T x={110} y={60 + i * 40} s={13} f={C.crema} a="middle">tied for first</T></g>)}
      <rect x={25} y={170} width={170} height={30} rx={7} fill={C.cocoa} stroke={C.mocha} />
      <T x={110} y={190} s={13} f={C.crema} a="middle">next customer</T>
      {!answered ? <T x={330} y={196} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={330} y={196} s={22} f={C.caramel} w={700}>rank 4 · dense_rank 2</T>}
    </Svg>
  );
}

// 4 · Arbitrary.
export function Arbitrary({ t }: StepCtx) {
  const flip = Math.floor(t / 1.6) % 2 === 1;
  const a = flip ? 3 : 2;
  const b = flip ? 2 : 3;
  return (
    <Svg label="Between runs, the two tied rows can swap their ROW_NUMBER" h={260}>
      <rect x={25} y={50} width={180} height={34} rx={8} fill={C.cocoa} stroke={C.mocha} />
      <T x={115} y={72} s={14} f={C.crema} a="middle">order A · score 80</T>
      <rect x={25} y={100} width={180} height={34} rx={8} fill={C.cocoa} stroke={C.mocha} />
      <T x={115} y={122} s={14} f={C.crema} a="middle">order B · score 80</T>
      <T x={260} y={72} s={20} f={C.cherryText} w={700}>{String(a)}</T>
      <T x={260} y={122} s={20} f={C.cherryText} w={700}>{String(b)}</T>
      <T x={300} y={200} s={14} f={C.latte} a="middle">nothing in SQL says which gets which</T>
    </Svg>
  );
}

// 5 · Predict run twice.
export function RunTwice({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Two runs of the same query on the same data" h={260}>
      <T x={25} y={44} s={14} f={C.latte}>run 1</T>
      <T x={25} y={110} s={14} f={C.latte}>run 2</T>
      {[0, 1].map((r) => [2, 3].map((n, k) => <g key={`${r}-${k}`}><rect x={90 + k * 120} y={26 + r * 66} width={100} height={34} rx={8} fill={C.cocoa} stroke={C.mocha} /><T x={140 + k * 120} y={48 + r * 66} s={14} f={C.crema} a="middle">{answered && r === 1 ? ['A:3', 'B:2'][k] : ['A:2', 'B:3'][k]}</T></g>))}
      {!answered && <T x={450} y={100} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={200} s={16} f={C.cherryText} a="middle">no guarantee they match</T>}
    </Svg>
  );
}

// 6 · Tie-breaker.
export function TieBreaker({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="A unique tie-breaker makes the numbering reproducible" h={260}>
      <T x={25} y={44} s={15} f={C.latte}>ORDER BY score DESC,</T>
      <T x={25} y={72} s={15} f={C.caramel} w={700} o={a}>         order_id</T>
      <rect x={25} y={100} width={180} height={34} rx={8} fill={C.cocoa} stroke={C.caramel} opacity={a} />
      <T x={115} y={122} s={14} f={C.crema} a="middle" o={a}>A · 80 → 2</T>
      <rect x={25} y={146} width={180} height={34} rx={8} fill={C.cocoa} stroke={C.caramel} opacity={a} />
      <T x={115} y={168} s={14} f={C.crema} a="middle" o={a}>B · 80 → 3</T>
      <T x={300} y={220} s={14} f={C.caramel} a="middle" o={easeOut(seg(t, 1.8, 2.6))}>the same on every run</T>
    </Svg>
  );
}

// 7 · Dedup.
export function Dedup({ t }: StepCtx) {
  const recs = [['c1', 'v1'], ['c1', 'v2'], ['c2', 'v1'], ['c3', 'v1'], ['c3', 'v2']];
  const keep = [false, true, true, false, true];
  const a = easeOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="Five records for three customers; row number 1 keeps the newest of each" h={300}>
      {recs.map((r, i) => (
        <g key={i} opacity={keep[i] ? 1 : 1 - 0.7 * a}>
          <rect x={25} y={30 + i * 44} width={150} height={34} rx={8} fill={C.cocoa} stroke={keep[i] && a > 0.5 ? C.caramel : C.mocha} strokeWidth={keep[i] && a > 0.5 ? 2 : 1} />
          <T x={100} y={52 + i * 44} s={13} f={C.crema} a="middle">{`${r[0]} · ${r[1]}`}</T>
        </g>
      ))}
      <T x={230} y={150} s={20} f={C.caramel} w={700} o={a}>3 kept</T>
      <T x={230} y={176} s={13} f={C.latte} o={a}>one per customer</T>
    </Svg>
  );
}

// 8 · Where too early.
export function WhereTooEarly({ t }: StepCtx) {
  const steps = ['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'WINDOW'];
  return (
    <Svg label="WHERE runs before window functions are computed" h={260}>
      {steps.map((s, i) => (
        <g key={s} opacity={easeOut(seg(t, i * 0.4, i * 0.4 + 0.5))}>
          <rect x={25 + i * 110} y={70} width={100} height={40} rx={8} fill={C.cocoa} stroke={s === 'WHERE' ? C.cherryText : s === 'WINDOW' ? C.caramel : C.mocha} strokeWidth={s === 'WHERE' || s === 'WINDOW' ? 2 : 1} />
          <T x={75 + i * 110} y={95} s={13} f={C.crema} a="middle">{s}</T>
        </g>
      ))}
      <T x={300} y={170} s={15} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.2, 3.0))}>WHERE cannot see ROW_NUMBER() yet</T>
      <T x={300} y={202} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>so compute it in a CTE and filter outside</T>
    </Svg>
  );
}

// 9 · QUALIFY.
export function Qualify({ t }: StepCtx) {
  const names = ['Snowflake', 'BigQuery', 'DuckDB', 'Databricks'];
  return (
    <Svg label="QUALIFY exists in four engines, not in the ISO standard or PostgreSQL" h={280}>
      {names.map((n, i) => (
        <g key={n} opacity={easeOut(seg(t, i * 0.4, i * 0.4 + 0.5))}>
          <rect x={25 + i * 138} y={50} width={126} height={40} rx={8} fill={C.cocoa} stroke={C.caramel} />
          <T x={88 + i * 138} y={75} s={13} f={C.crema} a="middle">{n}</T>
        </g>
      ))}
      <rect x={25} y={130} width={126} height={40} rx={8} fill="none" stroke={C.cherryText} strokeDasharray="5 4" opacity={easeOut(seg(t, 2.0, 2.8))} />
      <T x={88} y={155} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.0, 2.8))}>PostgreSQL</T>
      <T x={180} y={155} s={14} f={C.latte} o={easeOut(seg(t, 2.4, 3.2))}>not ISO SQL either</T>
    </Svg>
  );
}

// 10 · Two plans.
export function TwoPlans({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="Ranking sorts everything once; LATERAL takes one group at a time" h={300}>
      <T x={25} y={40} s={15} f={C.caramel} w={700}>ranking: one sort of everything</T>
      <rect x={25} y={54} width={400 * a} height={24} rx={6} fill={C.caramel} />
      <T x={25} y={104} s={13} f={C.latte} o={a}>nearly free if the sort is shared</T>
      <T x={25} y={170} s={15} f={C.cinnamon} w={700}>LATERAL: one group at a time</T>
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={25 + i * 84} y={184} width={74} height={24} rx={6} fill={C.cinnamon} opacity={clamp(b * 5 - i)} />)}
      <T x={25} y={234} s={13} f={C.latte} o={b}>cheap with an index on (group, order)</T>
    </Svg>
  );
}

// 11 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['which numbering', 'say it, and say why'], ['every ranking order', 'ends in a unique key'], ['top-N per group', 'QUALIFY or CTE; index or shared sort']];
  return (
    <Svg label="Three habits for rankings" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={19} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveStandard({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="QUALIFY and the standard" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>QUALIFY in ISO SQL?</T>
      {answered ? <T x={320} y={104} s={24} f={C.cherryText} w={700}>No</T> : <T x={330} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProveDense({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="DENSE_RANK of the 70" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>90, 80, 80, 70 → the 70 is</T>
      {answered ? <T x={430} y={104} s={26} f={C.caramel} w={700}>3</T> : <T x={430} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
