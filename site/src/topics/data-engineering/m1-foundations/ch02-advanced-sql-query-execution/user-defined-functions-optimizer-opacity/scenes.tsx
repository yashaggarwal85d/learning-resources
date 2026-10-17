import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the optimization that works, cherryText = the penalty or the opaque box, crema = data,
// latte = labels, taupe = structure.

function Box({ x, y, w, h = 44, label, hi = false, bad = false, dashed = false, o = 1 }: { x: number; y: number; w: number; h?: number; label: string; hi?: boolean; bad?: boolean; dashed?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={dashed ? 'none' : C.cocoa} stroke={bad ? C.cherryText : hi ? C.caramel : C.mocha} strokeWidth={hi || bad ? 2 : 1} strokeDasharray={dashed ? '5 4' : undefined} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={bad ? C.cherryText : C.crema} a="middle">{label}</T>
    </g>
  );
}

// 1 · The black box.
export function BlackBox({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  return (
    <Svg label="The planner sees a function's name and types, not its body" h={280}>
      <Box x={30} y={100} w={150} label="WHERE price(x) > 10" />
      <line x1={180} y1={122} x2={260} y2={122} stroke={C.taupe} strokeWidth={2} />
      <rect x={260} y={70} width={180} height={104} rx={10} fill={C.void} stroke={C.cherryText} strokeWidth={2} opacity={a} />
      <T x={350} y={128} s={20} f={C.cherryText} a="middle" o={a}>? ? ?</T>
      <T x={350} y={64} s={13} f={C.latte} a="middle" o={a}>body hidden</T>
      <T x={30} y={236} s={14} f={C.crema} o={easeOut(seg(t, 1.6, 2.4))}>planner knows: name, argument types, return type</T>
    </Svg>
  );
}

// 2 · Kinds.
export function Kinds({ t }: StepCtx) {
  const items = [['scalar', 'one value per call', 'f(x)'], ['table', 'many rows per call', 'FROM f(x)'], ['aggregate', 'state per row, one result', 'my_sum(x)']];
  return (
    <Svg label="Scalar, table and aggregate user-defined functions" h={280}>
      {items.map((it, i) => (
        <g key={it[0]} opacity={easeOut(seg(t, i * 0.7, i * 0.7 + 0.7))}>
          <T x={25} y={60 + i * 74} s={18} f={C.caramel} w={700}>{it[0]}</T>
          <T x={170} y={60 + i * 74} s={15} f={C.crema}>{it[2]}</T>
          <T x={170} y={84 + i * 74} s={13} f={C.latte}>{it[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · Volatility.
export function Volatility({ t }: StepCtx) {
  const n = 40;
  const a = easeOut(seg(t, 0.4, 2.0));
  return (
    <Svg label="A volatile call is evaluated for every row; an immutable one once" h={300}>
      <T x={25} y={36} s={14} f={C.cherryText}>VOLATILE: f(5) per row, 1,000 calls</T>
      {Array.from({ length: n }, (_, i) => <rect key={i} x={25 + i * 13} y={50} width={9} height={22} rx={2} fill={C.cherry} opacity={clamp(a * n - i)} />)}
      <T x={25} y={146} s={14} f={C.caramel}>IMMUTABLE: folded to its value</T>
      <rect x={25} y={160} width={9} height={22} rx={2} fill={C.caramel} opacity={easeOut(seg(t, 2.2, 2.8))} />
      <T x={50} y={178} s={13} f={C.crema} o={easeOut(seg(t, 2.4, 3.0))}>1 call</T>
      <T x={25} y={240} s={13} f={C.latte} o={easeOut(seg(t, 3.2, 3.8))}>a constant argument is only folded if you say so</T>
    </Svg>
  );
}

// 4 · Parallel gate.
export function ParallelGate({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="A parallel plan with workers collapses to one serial process when one UNSAFE function appears" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>plan with no UDF</T>
      {[0, 1, 2, 3].map((i) => <rect key={i} x={25 + i * 60} y={48} width={50} height={32} rx={6} fill={C.caramel} opacity={a} />)}
      <T x={280} y={70} s={13} f={C.crema} o={a}>4 workers</T>
      <T x={25} y={140} s={14} f={C.latte}>one call to an UNSAFE UDF</T>
      {[0, 1, 2, 3].map((i) => <rect key={i} x={25 + i * 60} y={152} width={50} height={32} rx={6} fill={i === 0 ? C.cherry : 'none'} stroke={C.cherryText} strokeDasharray={i === 0 ? undefined : '4 3'} opacity={i === 0 ? 1 : 1 - 0.6 * b} />)}
      <T x={280} y={174} s={13} f={C.cherryText} o={b}>serial: the whole statement</T>
    </Svg>
  );
}

// 5 · Predict workers.
export function WorkersPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A scan with workers meets a filter calling an unmarked UDF" h={280}>
      <Box x={30} y={70} w={130} label="scan" />
      {[0, 1, 2].map((i) => <rect key={i} x={30 + i * 44} y={130} width={36} height={24} rx={5} fill={answered ? 'none' : C.caramel} stroke={answered ? C.cherryText : C.caramel} strokeDasharray={answered ? '4 3' : undefined} />)}
      <Box x={230} y={70} w={170} label="filter: udf(x)" bad />
      {!answered ? <T x={480} y={104} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={300} y={230} s={15} f={C.cherryText} a="middle">no workers anywhere in the statement</T>}
    </Svg>
  );
}

// 6 · Filter order.
export function FilterOrder({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="Without a declared cost the expensive UDF runs on every row before the selective cheap filter" h={300}>
      <T x={25} y={36} s={14} f={C.cherryText}>cost unknown</T>
      <Box x={25} y={50} w={150} label="udf(x) > 10" bad o={a} />
      <Box x={200} y={50} w={150} label="status = 'rare'" o={a} />
      <T x={380} y={78} s={13} f={C.latte} o={a}>every row pays for the UDF</T>
      <T x={25} y={160} s={14} f={C.caramel}>COST declared</T>
      <Box x={25} y={174} w={150} label="status = 'rare'" hi o={b} />
      <Box x={200} y={174} w={150} label="udf(x) > 10" o={b} />
      <T x={380} y={202} s={13} f={C.latte} o={b}>only survivors pay</T>
    </Svg>
  );
}

// 7 · Declarations.
export function Declarations({ t }: StepCtx) {
  const rows = [['IMMUTABLE / STABLE', 'calls can be folded'], ['PARALLEL SAFE', 'workers return'], ['COST n', 'runs after cheap filters']];
  return (
    <Svg label="Three declarations and the penalty each lifts" h={300}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.7, i * 0.7 + 0.7))}>
          <T x={25} y={56 + i * 66} s={17} f={C.caramel} w={700}>{r[0]}</T>
          <T x={25} y={82 + i * 66} s={14} f={C.latte}>{r[1]}</T>
        </g>
      ))}
      <T x={300} y={270} s={14} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>a false IMMUTABLE returns wrong answers</T>
    </Svg>
  );
}

// 8 · Inlining.
export function Inline({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.8, 2.2));
  return (
    <Svg label="A single-expression SQL function is pasted into the calling query" h={280}>
      <Box x={30} y={80} w={170} label="price(x) = x * 1.2" />
      <g transform={`translate(${a * 230} 0)`} opacity={1 - 0.0 * a}>
        <rect x={30} y={146} width={170} height={36} rx={8} fill={C.caramel} />
        <T x={115} y={169} s={13} f={C.espresso} a="middle" w={700}>x * 1.2</T>
      </g>
      <Box x={290} y={80} w={260} h={44} label="WHERE ( … ) > 10" />
      <T x={300} y={236} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>the planner sees the expression: folds, pushes down</T>
    </Svg>
  );
}

// 9 · Predict plpgsql.
export function LanguagePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The same body in LANGUAGE sql is inlined; in plpgsql it is not" h={280}>
      <Box x={30} y={50} w={200} label="LANGUAGE sql" hi />
      <T x={250} y={78} s={14} f={C.caramel} w={700}>→ inlined</T>
      <Box x={30} y={130} w={200} label="LANGUAGE plpgsql" bad={answered} />
      {!answered ? <T x={290} y={164} s={44} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={250} y={158} s={14} f={C.cherryText} w={700}>→ opaque, always</T>}
    </Svg>
  );
}

// 10 · Froid.
export function Froid({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="An imperative UDF body becomes one relational expression built from APPLY" h={300}>
      <rect x={25} y={36} width={230} height={120} rx={8} fill={C.roast} stroke={C.mocha} opacity={a} />
      <T x={40} y={64} s={13} f={C.crema} o={a}>DECLARE @t = (SELECT …)</T>
      <T x={40} y={90} s={13} f={C.crema} o={a}>IF @t &lt; 500 SET @c = 'A'</T>
      <T x={40} y={116} s={13} f={C.crema} o={a}>ELSE SET @c = 'B'</T>
      <T x={40} y={142} s={13} f={C.crema} o={a}>RETURN @c</T>
      <line x1={255} y1={96} x2={330} y2={96} stroke={C.caramel} strokeWidth={3} opacity={b} />
      <rect x={330} y={60} width={240} height={72} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={b} />
      <T x={450} y={92} s={14} f={C.caramel} a="middle" w={700} o={b}>one expression</T>
      <T x={450} y={114} s={13} f={C.latte} a="middle" o={b}>built from APPLY</T>
      <T x={300} y={210} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 3.0, 3.8))}>SQL Server 2019 · no equivalent for plpgsql</T>
    </Svg>
  );
}

// 11 · Batches.
export function Batches({ t }: StepCtx) {
  const a = clamp(t / 4);
  return (
    <Svg label="Row-at-a-time Python UDF crosses the boundary every row; a vectorized UDF sends batches" h={300}>
      <T x={25} y={36} s={14} f={C.cherryText}>row at a time: 1,000 crossings</T>
      {Array.from({ length: 50 }, (_, i) => <rect key={i} x={25 + i * 10.5} y={50} width={7} height={22} rx={2} fill={C.cherry} opacity={clamp(a * 50 - i)} />)}
      <T x={25} y={146} s={14} f={C.caramel}>Arrow batches: 10 crossings</T>
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={25 + i * 52} y={160} width={44} height={22} rx={4} fill={C.caramel} opacity={clamp(a * 10 - i)} />)}
      <T x={300} y={250} s={18} f={C.crema} a="middle" w={700} o={easeOut(seg(t, 3.0, 3.8))}>3× to over 100× faster (Databricks)</T>
    </Svg>
  );
}

// 12 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['declare', 'volatility, parallel safety, cost'], ['small helpers', 'single-expression LANGUAGE sql'], ['still slow?', "look for the engine's way in"]];
  return (
    <Svg label="Three habits for user-defined functions" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={18} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveDefault({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Default parallel safety" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>default →</T>
      {answered ? <T x={190} y={104} s={22} f={C.cherryText} w={700}>PARALLEL UNSAFE</T> : <T x={230} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProveLanguage({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Inlinable language" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>inlined if LANGUAGE</T>
      {answered ? <T x={300} y={104} s={26} f={C.caramel} w={700}>sql</T> : <T x={310} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
