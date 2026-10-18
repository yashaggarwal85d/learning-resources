import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the optimizer can see inside / the guarantee, cherryText = the sealed box or the repeated work,
// crema = data, latte = labels, taupe = structure.

function Box({ x, y, w, h = 44, label, hi = false, bad = false, dashed = false, o = 1 }: { x: number; y: number; w: number; h?: number; label: string; hi?: boolean; bad?: boolean; dashed?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={dashed ? 'none' : C.cocoa} stroke={bad ? C.cherryText : hi ? C.caramel : C.mocha} strokeWidth={hi || bad ? 2 : 1} strokeDasharray={dashed ? '5 4' : undefined} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={bad ? C.cherryText : C.crema} a="middle">{label}</T>
    </g>
  );
}

// 1 · Choice.
export function Choice({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="A CTE can be seen through, or sealed" h={260}>
      <Box x={25} y={60} w={240} h={70} label="WITH w AS (…)" />
      <Box x={310} y={40} w={260} label="inline: the optimizer sees inside" hi o={a} />
      <Box x={310} y={110} w={260} label="materialise: sealed copy" bad o={a} />
      <T x={300} y={200} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.0, 2.8))}>each is right sometimes</T>
    </Svg>
  );
}

// 2 · Fence.
export function Fence({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.8));
  return (
    <Svg label="A fenced CTE cannot receive the WHERE filter or use the index" h={300}>
      <Box x={25} y={50} w={150} label="WHERE key = 123" />
      <rect x={215} y={40} width={16} height={100} rx={4} fill={C.cherryText} opacity={a} />
      <T x={223} y={32} s={13} f={C.cherryText} a="middle" o={a}>fence</T>
      <Box x={250} y={50} w={165} label="scan all of big" bad o={a} />
      <Box x={425} y={50} w={145} label="copy, filter" bad o={a} />
      <T x={25} y={190} s={14} f={C.latte} o={easeOut(seg(t, 2.2, 3.0))}>the index on key is unreachable through the fence</T>
      <T x={25} y={220} s={13} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.4))}>before PostgreSQL 12 this was every CTE</T>
    </Svg>
  );
}

// 3 · Default.
export function Default({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 2.0));
  return (
    <Svg label="A single-reference side-effect-free CTE is inlined and the filter pushes in" h={300}>
      <Box x={25} y={50} w={150} label="WHERE key = 123" hi />
      <line x1={175} y1={72} x2={260} y2={72} stroke={C.caramel} strokeWidth={3} opacity={a} />
      <Box x={260} y={50} w={160} label="Index Scan key" hi o={a} />
      <T x={25} y={150} s={14} f={C.caramel} w={700}>inlined when:</T>
      {['no side effects', 'not recursive', 'referenced once'].map((c, i) => <T key={c} x={25} y={178 + i * 26} s={14} f={C.crema} o={easeOut(seg(t, 1.6 + i * 0.4, 2.2 + i * 0.4))}>{`✓ ${c}`}</T>)}
    </Svg>
  );
}

// 4 · Ref predict.
export function RefPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="One reference uses the index; two references materialise" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>referenced once</T>
      <Box x={25} y={48} w={170} label="Index Scan" hi={answered} />
      <T x={25} y={140} s={14} f={C.latte}>referenced twice</T>
      <Box x={25} y={152} w={170} label="Materialised copy" bad={answered} />
      {!answered ? <T x={430} y={140} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={215} y={104} s={16} f={C.caramel} w={700}>only one uses the index</T>}
    </Svg>
  );
}

// 5 · NOT MATERIALIZED.
export function NotMat({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.8));
  return (
    <Svg label="NOT MATERIALIZED inlines each reference, using the index, at the cost of two scans" h={300}>
      <Box x={25} y={50} w={170} label="w1 → Index Scan" hi o={a} />
      <Box x={25} y={110} w={170} label="w2 → Index Scan" hi o={a} />
      <T x={230} y={86} s={14} f={C.caramel} o={a}>index used for both</T>
      <T x={25} y={190} s={14} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.8))}>price: big is read once per reference</T>
      <T x={25} y={218} s={13} f={C.latte} o={easeOut(seg(t, 2.4, 3.2))}>wins when each use needs only a small part</T>
    </Svg>
  );
}

// 6 · Expensive.
export function Expensive({ t }: StepCtx) {
  const a = clamp(t / 3.6);
  return (
    <Svg label="Materialising evaluates an expensive function once per base row" h={300}>
      <T x={25} y={36} s={14} f={C.caramel} w={700}>MATERIALIZED: once per row</T>
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={25 + i * 44} y={50} width={36} height={24} rx={5} fill={C.caramel} opacity={clamp(a * 12 - i)} />)}
      <T x={25} y={140} s={14} f={C.cherryText} w={700}>NOT MATERIALIZED: once per reference</T>
      {Array.from({ length: 12 }, (_, i) => <g key={i} opacity={clamp(a * 12 - i)}><rect x={25 + i * 44} y={154} width={36} height={24} rx={5} fill={C.cherry} /><rect x={25 + i * 44} y={184} width={36} height={24} rx={5} fill={C.cherry} /></g>)}
      <T x={300} y={254} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.8))}>write MATERIALIZED so a later edit cannot undo this</T>
    </Svg>
  );
}

// 7 · Calls predict.
export function CallsPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="An expensive function in a CTE referenced twice and marked NOT MATERIALIZED" h={260}>
      <Box x={25} y={60} w={200} label="w1 → f(val)" bad={answered} />
      <Box x={25} y={120} w={200} label="w2 → f(val)" bad={answered} />
      {!answered ? <T x={380} y={116} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={380} y={116} s={22} f={C.cherryText} a="middle" w={700}>2 calls per base row</T>}
    </Svg>
  );
}

// 8 · Recompute.
export function Recompute({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.6));
  const b = easeOut(seg(t, 2.2, 3.2));
  return (
    <Svg label="SQL Server re-executes the CTE for every reference; a temporary object computes it once" h={300}>
      <Box x={25} y={50} w={180} label="reference 1 → run" bad o={a} />
      <Box x={25} y={110} w={180} label="reference 2 → run" bad o={a} />
      <T x={230} y={90} s={13} f={C.cherryText} o={a}>no materialisation switch</T>
      <Box x={25} y={200} w={220} label="temp table: computed once" hi o={b} />
      <T x={270} y={228} s={13} f={C.caramel} o={b}>the documented fix</T>
    </Svg>
  );
}

// 9 · Want fence.
export function WantFence({ t }: StepCtx) {
  const rows = [['repeat would duplicate real work', 'fence it'], ['side effects: once is a requirement', 'fence it'], ['optimizer reaching inside saves more', 'inline it']];
  return (
    <Svg label="When to ask for a fence and when to remove it" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.7, i * 0.7 + 0.7))}>
          <T x={25} y={60 + i * 70} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={90 + i * 70} s={20} f={i === 2 ? C.caramel : C.cherryText} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 10 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['know your regime', 'engine and version'], ['say it explicitly', 'MATERIALIZED or NOT'], ['test single evaluation', 'do not just read the plan']];
  return (
    <Svg label="Three habits for CTEs" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={20} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveRelease({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The release that inlines single-reference CTEs" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>inlined by default from PostgreSQL</T>
      {answered ? <T x={40} y={140} s={26} f={C.caramel} w={700}>12</T> : <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProveSqlServer({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A twice-referenced CTE on SQL Server" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>executes</T>
      {answered ? <T x={160} y={104} s={24} f={C.cherryText} w={700}>twice</T> : <T x={180} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
