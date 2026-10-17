import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the node or batch under discussion, cherryText = a cycle or runaway, crema = data,
// latte = labels, taupe = structure. Products: bundle 1 -> kits 2, 3 -> parts 4 (shared mic), 5, 6.

type P = { x: number; y: number; n: string; name: string };
const NODES: Record<string, P> = {
  '1': { x: 300, y: 56, n: '1', name: 'bundle' },
  '2': { x: 170, y: 150, n: '2', name: 'kit A' },
  '3': { x: 430, y: 150, n: '3', name: 'kit B' },
  '4': { x: 300, y: 262, n: '4', name: 'mic' },
  '5': { x: 110, y: 262, n: '5', name: 'stand' },
  '6': { x: 490, y: 262, n: '6', name: 'cable' },
};
const EDGES: [string, string, string][] = [
  ['1', '2', '×1'],
  ['1', '3', '×1'],
  ['2', '4', '×2'],
  ['2', '5', '×1'],
  ['3', '4', '×1'],
  ['3', '6', '×3'],
];
function Node({ id, hi = false, o = 1 }: { id: string; hi?: boolean; o?: number }) {
  const p = NODES[id];
  return (
    <g opacity={o}>
      <circle cx={p.x} cy={p.y} r={26} fill={C.cocoa} stroke={hi ? C.caramel : C.mocha} strokeWidth={hi ? 3 : 1.5} />
      <T x={p.x} y={p.y + 5} s={13} f={C.crema} a="middle">{p.name}</T>
    </g>
  );
}
function Edge({ a, b, label, o = 1, f = C.taupe }: { a: string; b: string; label?: string; o?: number; f?: string }) {
  const p = NODES[a], q = NODES[b];
  return (
    <g opacity={o}>
      <line x1={p.x} y1={p.y + 26} x2={q.x} y2={q.y - 26} stroke={f} strokeWidth={2} />
      {label && <T x={(p.x + q.x) / 2 + 8} y={(p.y + q.y) / 2 + 2} s={13} f={C.latte}>{label}</T>}
    </g>
  );
}

// 1 · The hierarchy.
export function Hierarchy({ t }: StepCtx) {
  return (
    <Svg label="A bundle made of kits made of parts, with a shared part" h={320}>
      {EDGES.map(([a, b, l], i) => <Edge key={a + b} a={a} b={b} label={l} o={easeOut(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3))} />)}
      {Object.keys(NODES).map((id, i) => <Node key={id} id={id} o={easeOut(seg(t, i * 0.25, 0.5 + i * 0.25))} />)}
      <T x={300} y={308} s={14} f={C.caramel} a="middle" o={easeOut(seg(t, 2.2, 3.0))}>depth is in the data, not in the query</T>
    </Svg>
  );
}

// 2 · The working-table loop.
const PASSES = [
  { label: 'seed', ids: ['2', '3'], n: 2 },
  { label: 'pass 1', ids: ['4', '5', '4', '6'], n: 4 },
  { label: 'pass 2', ids: [], n: 0 },
];
export function Conveyor({ t }: StepCtx) {
  return (
    <Svg label="The working table holds 2 rows, then 4 rows, then 0 rows, and the loop stops" h={320}>
      {PASSES.map((p, i) => {
        const a = easeOut(seg(t, 0.4 + i * 1.3, 1.1 + i * 1.3));
        const y = 40 + i * 92;
        return (
          <g key={p.label} opacity={clamp(a)}>
            <T x={25} y={y} s={14} f={C.latte}>{p.label}</T>
            <rect x={110} y={y - 20} width={300} height={44} rx={8} fill="none" stroke={p.n ? C.mocha : C.cherryText} strokeDasharray={p.n ? undefined : '5 4'} />
            {p.ids.map((id, k) => (
              <g key={k}>
                <rect x={118 + k * 72} y={y - 12} width={64} height={28} rx={6} fill={C.cocoa} stroke={C.caramel} />
                <T x={150 + k * 72} y={y + 7} s={13} f={C.crema} a="middle">{NODES[id].name}</T>
              </g>
            ))}
            <T x={440} y={y + 7} s={18} f={p.n ? C.caramel : C.cherryText} w={700}>{p.n} rows</T>
          </g>
        );
      })}
      <T x={300} y={304} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 4.2, 4.8))}>an empty batch: the loop stops</T>
    </Svg>
  );
}

// 3 · Predict: rows in the explosion.
export function RowsPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const rows = ['kit A', 'kit B', 'mic (via A)', 'stand', 'mic (via B)', 'cable'];
  return (
    <Svg label="The explosion keeps every row the loop produced" h={320}>
      {rows.map((r, i) => (
        <g key={r} opacity={easeOut(seg(t, 0.3 + i * 0.25, 0.7 + i * 0.25))}>
          <rect x={25 + (i % 3) * 190} y={50 + Math.floor(i / 3) * 56} width={170} height={38} rx={8} fill={C.cocoa} stroke={r.startsWith('mic') && answered ? C.caramel : C.mocha} />
          <T x={110 + (i % 3) * 190} y={74 + Math.floor(i / 3) * 56} s={13} f={C.crema} a="middle">{r}</T>
        </g>
      ))}
      {!answered ? (
        <T x={300} y={250} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>
      ) : (
        <>
          <T x={300} y={230} s={26} f={C.caramel} a="middle" w={700}>6 rows, 5 distinct parts</T>
          <T x={300} y={262} s={14} f={C.latte} a="middle">the mic is needed for two separate reasons</T>
        </>
      )}
    </Svg>
  );
}

// 4 · Quantities multiply.
export function Quantities({ t }: StepCtx) {
  const sum = easeOut(seg(t, 2.8, 3.8));
  return (
    <Svg label="The microphone arrives twice, as 2 and as 1, and the sum is 3" h={320}>
      {EDGES.map(([a, b, l]) => <Edge key={a + b} a={a} b={b} label={l} f={b === '4' ? C.caramel : C.taupe} />)}
      {Object.keys(NODES).map((id) => <Node key={id} id={id} hi={id === '4'} />)}
      <T x={150} y={310} s={15} f={C.crema} o={easeOut(seg(t, 0.6, 1.4))}>via A: 2</T>
      <T x={300} y={310} s={15} f={C.crema} a="middle" o={easeOut(seg(t, 1.6, 2.4))}>via B: 1</T>
      <T x={450} y={310} s={18} f={C.caramel} w={700} o={sum}>SUM = 3</T>
    </Svg>
  );
}

// 5 · A cycle.
export function CycleLoop({ t }: StepCtx) {
  const ids = ['1', '2', '3'];
  const pos = [{ x: 300, y: 70 }, { x: 160, y: 200 }, { x: 440, y: 200 }];
  const rows = Math.floor(seg(t, 0.6, 3.6) * 12);
  return (
    <Svg label="A kit that contains its own parent: every pass creates a new row and the working table is never empty" h={320}>
      {ids.map((id, i) => {
        const a = pos[i], b = pos[(i + 1) % 3];
        return <line key={id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.cherryText} strokeWidth={2} strokeDasharray="6 5" />;
      })}
      {ids.map((id, i) => (
        <g key={id}>
          <circle cx={pos[i].x} cy={pos[i].y} r={26} fill={C.cocoa} stroke={C.cherryText} strokeWidth={2} />
          <T x={pos[i].x} y={pos[i].y + 5} s={13} f={C.crema} a="middle">{NODES[id].name}</T>
        </g>
      ))}
      <T x={300} y={140} s={13} f={C.latte} a="middle">round and round</T>
      <T x={300} y={284} s={18} f={C.cherryText} a="middle" w={700}>rows so far: {rows} and counting</T>
    </Svg>
  );
}

// 6 · Predict: UNION.
export function UnionPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const rows = [['bundle', 'depth 1'], ['kit A', 'depth 2'], ['kit B', 'depth 3'], ['bundle', 'depth 4']];
  return (
    <Svg label="Going round the cycle gives a row with a larger depth, so UNION does not see a duplicate" h={300}>
      {rows.map((r, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.3 + i * 0.4, 0.8 + i * 0.4))}>
          <rect x={25} y={40 + i * 50} width={150} height={36} rx={8} fill={C.cocoa} stroke={i === 3 && answered ? C.cherryText : C.mocha} />
          <T x={100} y={64 + i * 50} s={13} f={C.crema} a="middle">{r[0]}</T>
          <T x={200} y={64 + i * 50} s={13} f={C.caramel}>{r[1]}</T>
        </g>
      ))}
      {!answered ? <T x={470} y={140} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={340} y={120} s={15} f={C.cherryText}>same bundle, new depth: not a duplicate</T>}
    </Svg>
  );
}

// 7 · Path guard.
export function PathGuard({ t }: StepCtx) {
  const steps = [
    { p: '[bundle]', f: C.crema, note: '' },
    { p: '[bundle, kit A]', f: C.crema, note: '' },
    { p: '[bundle, kit A, kit B]', f: C.crema, note: '' },
    { p: '[bundle, kit A, kit B, bundle]', f: C.cherryText, note: 'already on the path: cycle, stop here' },
  ];
  return (
    <Svg label="Each row carries its path; stepping onto a node already on it is flagged as a cycle" h={300}>
      {steps.map((s, i) => {
        const a = easeOutBack(seg(t, 0.3 + i * 0.8, 0.9 + i * 0.8));
        return (
          <g key={s.p} opacity={clamp(a)}>
            <T x={25} y={50 + i * 56} s={14} f={s.f} w={i === 3 ? 700 : 500}>{s.p}</T>
            {s.note && <T x={25} y={74 + i * 56} s={13} f={C.cherryText}>{s.note}</T>}
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · Sugar.
export function Sugar({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.2));
  const b = easeOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="CYCLE and SEARCH in PostgreSQL 14 expand into the path-array form" h={300}>
      <T x={25} y={44} s={15} f={C.caramel} w={700} o={a}>CYCLE id SET is_cycle USING path</T>
      <T x={25} y={70} s={13} f={C.latte} o={a}>expands to the hand-written path array</T>
      <T x={25} y={130} s={15} f={C.caramel} w={700} o={b}>SEARCH DEPTH FIRST BY id SET ordercol</T>
      <T x={25} y={156} s={13} f={C.latte} o={b}>adds a sort column, so order is defined, not luck</T>
      <T x={25} y={236} s={14} f={C.crema} o={easeOut(seg(t, 2.8, 3.5))}>DuckDB: no CYCLE, no SEARCH → write the path yourself</T>
    </Svg>
  );
}

// 9 · Two failures.
export function TwoFailures({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="A cycle never ends; a blow-up ends but explodes in size; they need different fixes" h={320}>
      <g opacity={a}>
        <T x={25} y={44} s={16} f={C.cherryText} w={700}>cycle</T>
        <T x={25} y={70} s={13} f={C.latte}>never stops</T>
        <T x={25} y={96} s={14} f={C.caramel}>fix: carry the path / CYCLE</T>
      </g>
      <g opacity={b}>
        <T x={25} y={180} s={16} f={C.cherryText} w={700}>blow-up</T>
        <T x={25} y={206} s={13} f={C.latte}>no cycle, but shared parts make paths multiply</T>
        <T x={25} y={232} s={14} f={C.caramel}>fix: depth cap, or ask for shortest path</T>
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={380 + i * 38} y={150 - i * 16 + 40} width={30} height={20 + i * 16} rx={4} fill={C.cherry} opacity={0.8} />)}
      </g>
    </Svg>
  );
}

// 10 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['evaluate', 'seed, loop, stop on empty'], ['quantities', 'multiply down, SUM at the end'], ['real data', 'path or CYCLE, plus a depth cap']];
  return (
    <Svg label="Three habits for recursive queries" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={20} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 11 · Prove it: CYCLE.
export function ProveCycle({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Which clause detects cycles" h={240}>
      <T x={60} y={100} s={18} f={C.latte}>WITH RECURSIVE … </T>
      {answered ? <T x={300} y={104} s={26} f={C.caramel} w={700}>CYCLE</T> : <T x={320} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}

// 12 · Prove it: stop.
export function ProveStop({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="An empty step ends the loop" h={240}>
      <rect x={60} y={70} width={160} height={46} rx={8} fill="none" stroke={C.cherryText} strokeDasharray="5 4" />
      <T x={140} y={98} s={14} f={C.cherryText} a="middle">0 new rows</T>
      {answered ? <T x={330} y={102} s={24} f={C.caramel} w={700}>the loop stops</T> : <T x={330} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
