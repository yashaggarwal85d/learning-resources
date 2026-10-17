import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the action that succeeds, cherryText = the collision or the costly path, crema = data,
// latte = labels, taupe = structure.

function Box({ x, y, w, h = 36, label, hi = false, bad = false, o = 1 }: { x: number; y: number; w: number; h?: number; label: string; hi?: boolean; bad?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={C.cocoa} stroke={bad ? C.cherryText : hi ? C.caramel : C.mocha} strokeWidth={hi || bad ? 2 : 1} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={bad ? C.cherryText : C.crema} a="middle">{label}</T>
    </g>
  );
}

// 1 · The problem.
export function Problem({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="Staged rows arrive at a target table; each might be new, existing, or a deletion" h={280}>
      {[0, 1, 2, 3, 4].map((i) => <Box key={i} x={25} y={36 + i * 46} w={110} label={`row ${i + 1}`} o={easeOut(seg(t, i * 0.2, i * 0.2 + 0.4))} />)}
      <rect x={380} y={36} width={190} height={222} rx={10} fill={C.roast} stroke={C.mocha} opacity={a} />
      <T x={475} y={64} s={14} f={C.latte} a="middle" o={a}>target table</T>
      <T x={250} y={150} s={40} f={C.caramel} a="middle" o={a}>?</T>
    </Svg>
  );
}

// 2 · Merge actions.
export function MergeActions({ t }: StepCtx) {
  const rows = [['insert', 2, C.caramel], ['update', 2, C.crema], ['delete', 1, C.cherryText]] as const;
  return (
    <Svg label="Of 5 staged rows, 2 are inserted, 2 updated and 1 deleted" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>5 staged rows, one MERGE</T>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, 0.4 + i * 0.9, 1.1 + i * 0.9))}>
          <T x={25} y={90 + i * 62} s={18} f={r[2]} w={700}>{r[0]}</T>
          {Array.from({ length: r[1] }, (_, k) => <rect key={k} x={170 + k * 56} y={68 + i * 62} width={46} height={30} rx={6} fill={r[2]} opacity={0.85} />)}
          <T x={170 + r[1] * 56 + 14} y={90 + i * 62} s={16} f={C.crema}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · Duplicates.
export function Duplicates({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="Two source rows target the same row; the second attempt errors" h={280}>
      <Box x={25} y={50} w={120} label="source A" hi o={a} />
      <Box x={25} y={110} w={120} label="source B" bad o={b} />
      <line x1={145} y1={68} x2={330} y2={96} stroke={C.caramel} strokeWidth={3} opacity={a} />
      <line x1={145} y1={128} x2={330} y2={104} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 5" opacity={b} />
      <Box x={330} y={78} w={140} label="target row" />
      <T x={300} y={200} s={16} f={C.cherryText} a="middle" w={700} o={b}>second attempt: error</T>
    </Svg>
  );
}

// 4 · Predict.
export function DuplicatePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Two staged updates for one existing wine" h={260}>
      <Box x={25} y={60} w={130} label="stage: +3" />
      <Box x={25} y={110} w={130} label="stage: +5" />
      <Box x={330} y={85} w={150} label="wine: stock 10" />
      {!answered ? <T x={250} y={112} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={300} y={200} s={18} f={C.cherryText} a="middle" w={700}>error, not a silent pick</T>}
    </Svg>
  );
}

// 5 · Atomic.
export function Atomic({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.6));
  return (
    <Svg label="ON CONFLICT tries to insert and turns into an update inside the index, in one atomic step" h={280}>
      <Box x={30} y={100} w={130} label="INSERT key k" />
      <line x1={160} y1={118} x2={260} y2={118} stroke={C.taupe} strokeWidth={2} />
      <rect x={260} y={70} width={150} height={100} rx={10} fill={C.roast} stroke={C.caramel} strokeWidth={2} opacity={a} />
      <T x={335} y={96} s={13} f={C.latte} a="middle" o={a}>unique index</T>
      <T x={335} y={126} s={14} f={C.caramel} a="middle" w={700} o={a}>key taken?</T>
      <T x={335} y={150} s={13} f={C.crema} a="middle" o={a}>→ update instead</T>
      <T x={300} y={230} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 2.4, 3.2))}>one of two outcomes, always</T>
    </Svg>
  );
}

// 6 · The gap.
export function Gap({ t }: StepCtx) {
  const p = clamp(t / 4.2);
  return (
    <Svg label="MERGE reads, decides, then inserts; another session commits inside the gap" h={300}>
      <T x={25} y={44} s={14} f={C.latte}>session A: MERGE</T>
      <line x1={25} y1={60} x2={575} y2={60} stroke={C.taupe} strokeWidth={2} />
      <circle cx={140} cy={60} r={9} fill={C.crema} />
      <T x={140} y={44} s={13} f={C.crema} a="middle">reads: not matched</T>
      <circle cx={440} cy={60} r={9} fill={C.caramel} />
      <T x={440} y={44} s={13} f={C.caramel} a="middle">inserts</T>
      <rect x={150} y={52} width={280} height={16} rx={6} fill="none" stroke={C.latte} strokeDasharray="5 4" />
      <T x={290} y={92} s={13} f={C.latte} a="middle">the gap</T>
      <T x={25} y={150} s={14} f={C.latte}>session B</T>
      <line x1={25} y1={166} x2={575} y2={166} stroke={C.taupe} strokeWidth={2} />
      <circle cx={290} cy={166} r={9} fill={C.cherryText} opacity={easeOut(seg(t, 1.6, 2.2))} />
      <T x={290} y={190} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.8, 2.4))}>inserts and commits key k</T>
      <T x={440} y={250} s={18} f={C.cherryText} a="middle" w={700} o={easeOut(seg(t, 3.0, 3.8))}>unique violation</T>
      <rect x={25 + 550 * p - 3} y={52} width={6} height={140} fill={C.latte} opacity={0.15} />
    </Svg>
  );
}

// 7 · Predict the gap.
export function GapPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A decided its insert; B committed the same key first" h={260}>
      <Box x={25} y={60} w={160} label="A: decided INSERT" />
      <Box x={25} y={120} w={160} label="B: committed key k" hi />
      {!answered ? <T x={380} y={118} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={300} y={210} s={18} f={C.cherryText} a="middle" w={700}>A fails; MERGE does not re-route</T>}
    </Svg>
  );
}

// 8 · Choose.
export function Choose({ t }: StepCtx) {
  const rows = [['insert or update, nothing else', 'ON CONFLICT'], ['several branches, a DELETE, a second source', 'MERGE + retry']];
  return (
    <Svg label="Which statement to use" h={240}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.9, i * 0.9 + 0.7))}>
          <T x={25} y={66 + i * 84} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={98 + i * 84} s={22} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 9 · RETURNING.
export function Returning({ t }: StepCtx) {
  const rows = [['insert', '—', '5'], ['update', '8', '6'], ['delete', '1', '—']];
  return (
    <Svg label="RETURNING with merge_action, old and new" h={280}>
      <T x={25} y={36} s={13} f={C.latte}>merge_action()</T>
      <T x={230} y={36} s={13} f={C.latte}>old.stock</T>
      <T x={360} y={36} s={13} f={C.latte}>new.stock</T>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, 0.4 + i * 0.6, 1.0 + i * 0.6))}>
          <T x={25} y={76 + i * 50} s={15} f={C.caramel} w={700}>{r[0]}</T>
          <T x={230} y={76 + i * 50} s={15} f={C.crema}>{r[1]}</T>
          <T x={360} y={76 + i * 50} s={15} f={C.crema}>{r[2]}</T>
        </g>
      ))}
      <T x={300} y={250} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>merge_action: PostgreSQL 17 · old / new: PostgreSQL 18</T>
    </Svg>
  );
}

// 10 · File rewrite.
export function FileRewrite({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.8, 2.0));
  return (
    <Svg label="One touched row forces its whole file to be rewritten" h={300}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={25 + i * 140} y={60} width={120} height={80} rx={8} fill={C.cocoa} stroke={i === 1 ? C.cherryText : C.mocha} strokeWidth={i === 1 ? 2 : 1} />
          <T x={85 + i * 140} y={84} s={13} f={C.latte} a="middle">file {i + 1}</T>
          {i === 1 && <rect x={70 + i * 140} y={98} width={30} height={14} rx={3} fill={C.cherryText} />}
        </g>
      ))}
      <rect x={165} y={170} width={120} height={80} rx={8} fill={C.cherry} opacity={a} />
      <T x={225} y={216} s={13} f={C.crema} a="middle" o={a}>whole file rewritten</T>
      <T x={300} y={284} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>a catch-all delete branch rewrites every file</T>
    </Svg>
  );
}

// 11 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['source keys', 'at most one row per target row'], ['plain upsert', 'ON CONFLICT'], ['lakehouse', 'touch as few files as possible']];
  return (
    <Svg label="Three habits for concurrent writes" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={19} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveAtomic({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The race-free upsert" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>race-free →</T>
      {answered ? <T x={180} y={104} s={20} f={C.caramel} w={700}>INSERT … ON CONFLICT</T> : <T x={240} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProveRelease({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="merge_action arrived in this release" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>merge_action() →</T>
      {answered ? <T x={250} y={104} s={24} f={C.caramel} w={700}>PostgreSQL 17</T> : <T x={270} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
