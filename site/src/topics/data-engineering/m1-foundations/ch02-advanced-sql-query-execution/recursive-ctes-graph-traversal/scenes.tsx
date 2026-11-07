import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
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

// 1 · The hierarchy grows a level at a time: the bundle, then its kits, then the parts, each edge drawing down to its
// child, with a level count on the left. Then a dashed fourth level hints that next month's bundle may be deeper.
export function Hierarchy({ t }: StepCtx) {
  const lv = [easeOutBack(seg(t, 0.2, 0.6)), easeOutBack(seg(t, 0.8, 1.2)), easeOutBack(seg(t, 1.4, 1.8))];
  const level = (id: string) => (id === '1' ? 0 : id === '2' || id === '3' ? 1 : 2);
  const deeper = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="A bundle made of kits made of parts, with a shared part; the depth lives in the data" h={330}>
      {EDGES.map(([a, b, l]) => (
        <EdgeK key={a + b} a={a} b={b} label={l} k={easeInOut(seg(t, 0.6 + level(b) * 0.6 - 0.6, 0.6 + level(b) * 0.6 - 0.2))} />
      ))}
      {Object.keys(NODES).map((id) => (
        <NodeK key={id} id={id} k={lv[level(id)]} />
      ))}
      {[0, 1, 2].map((i) => (
        <T key={i} x={30} y={[56, 150, 262][i] + 5} s={13} f={C.latte} o={clamp(lv[i])}>
          {`${i + 1}`}
        </T>
      ))}
      <g opacity={deeper}>
        <line x1={110} y1={288} x2={110} y2={300} stroke={C.taupe} strokeDasharray="3 3" />
        <rect x={84} y={300} width={52} height={20} rx={10} fill="none" stroke={C.taupe} strokeDasharray="4 3" />
        <T x={25} y={315} s={13} f={C.latte}>
          ?
        </T>
      </g>
      <T x={575} y={318} s={14} f={C.caramel} a="end" o={easeOut(seg(t, 2.4, 3.0))}>
        depth is in the data
      </T>
    </Svg>
  );
}

/** A node that pops in with progress `k`. */
function NodeK({ id, k, hi = false, stroke }: { id: string; k: number; hi?: boolean; stroke?: string }) {
  const p = NODES[id];
  if (k <= 0) return null;
  return (
    <g opacity={clamp(k)} transform={`translate(${p.x} ${p.y}) scale(${clamp(k)})`}>
      <circle r={26} fill={C.cocoa} stroke={stroke ?? (hi ? C.caramel : C.mocha)} strokeWidth={hi ? 3 : 1.5} />
      <T x={0} y={5} s={13} f={C.crema} a="middle">
        {p.name}
      </T>
    </g>
  );
}
/** An edge that draws from parent to child with progress `k`. */
function EdgeK({ a, b, label, k = 1, f = C.taupe }: { a: string; b: string; label?: string; k?: number; f?: string }) {
  const p = NODES[a];
  const q = NODES[b];
  if (k <= 0) return null;
  const x2 = lerp(p.x, q.x, k);
  const y2 = lerp(p.y + 26, q.y - 26, k);
  return (
    <g>
      <line x1={p.x} y1={p.y + 26} x2={x2} y2={y2} stroke={f} strokeWidth={2} />
      {label && k >= 1 && (
        <T x={(p.x + q.x) / 2 + 8} y={(p.y + q.y) / 2 + 2} s={13} f={C.latte}>
          {label}
        </T>
      )}
    </g>
  );
}

// 2 · The working-table loop. The seed batch slides onto the first belt; each kit then sends its parts down to the
// next batch (the join), which replaces the working table; the third pass finds nothing and the belt comes back empty.
const PASSES = [
  { label: 'seed', ids: ['2', '3'], from: [] as number[], n: 2 },
  { label: 'pass 1', ids: ['4', '5', '4', '6'], from: [0, 0, 1, 1], n: 4 },
  { label: 'pass 2', ids: [] as string[], from: [] as number[], n: 0 },
];
export function Conveyor({ t }: StepCtx) {
  const starts = [0.4, 1.8, 3.2];
  return (
    <Svg label="The working table holds 2 rows, then 4 rows, then 0 rows, and the loop stops at the fixpoint" h={320}>
      {PASSES.map((p, i) => {
        const a = easeOut(seg(t, starts[i], starts[i] + 0.4));
        const y = 40 + i * 92;
        const cx = (k: number) => 118 + k * 72;
        return (
          <g key={p.label}>
            <g opacity={clamp(a)}>
              <T x={25} y={y} s={14} f={C.latte}>
                {p.label}
              </T>
              <rect x={110} y={y - 20} width={300} height={44} rx={8} fill="none" stroke={p.n ? C.mocha : C.cherryText} strokeDasharray={p.n ? undefined : '5 4'} />
            </g>
            {p.ids.map((id, k) => {
              const m = easeInOut(seg(t, starts[i] + 0.2 + k * 0.15, starts[i] + 0.8 + k * 0.15));
              if (m <= 0) return null;
              const fx = i === 0 ? -80 : cx(p.from[k]);
              const fy = i === 0 ? y - 12 : y - 92 - 12;
              return (
                <g key={k} transform={`translate(${lerp(fx, cx(k), m)} ${lerp(fy, y - 12, m)})`}>
                  <rect width={64} height={28} rx={6} fill={C.cocoa} stroke={C.caramel} />
                  <T x={32} y={19} s={13} f={C.crema} a="middle">
                    {NODES[id].name}
                  </T>
                </g>
              );
            })}
            <T x={440} y={y + 7} s={18} f={p.n ? C.caramel : C.cherryText} w={700} o={easeOut(seg(t, starts[i] + 0.9, starts[i] + 1.2))}>
              {p.n} rows
            </T>
          </g>
        );
      })}
      <T x={300} y={304} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 4.2, 4.7))}>
        an empty batch: the loop stops
      </T>
    </Svg>
  );
}

// 3 · Predict: rows in the explosion. The six rows arrive batch by batch. After the answer they are counted off one by
// one to six, and the two mic rows light: five distinct parts, six rows.
export function RowsPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const rows = ['kit A', 'kit B', 'mic (via A)', 'stand', 'mic (via B)', 'cable'];
  const counted = answered ? Math.min(6, Math.floor(seg(s, 0.1, 1.3) * 6 + 0.0001)) : 0;
  const mic = answered ? easeOut(seg(s, 1.3, 1.7)) : 0;
  return (
    <Svg label="The explosion keeps every row the loop produced: six rows, five distinct parts" h={320}>
      {rows.map((r, i) => {
        const a = easeOutBack(seg(t, 0.2 + (i < 2 ? 0 : 0.5) + i * 0.08, 0.5 + (i < 2 ? 0 : 0.5) + i * 0.08));
        const x = 25 + (i % 3) * 190;
        const y = 50 + Math.floor(i / 3) * 56;
        const isMic = r.startsWith('mic');
        return (
          <g key={r} opacity={clamp(a)} transform={`translate(0 ${(1 - clamp(a)) * -12})`}>
            <rect x={x} y={y} width={170} height={38} rx={8} fill={C.cocoa} stroke={isMic && mic > 0.5 ? C.caramel : i < counted ? C.crema : C.mocha} strokeWidth={isMic && mic > 0.5 ? 2.5 : 1} />
            <T x={x + 85} y={y + 24} s={13} f={C.crema} a="middle">
              {r}
            </T>
          </g>
        );
      })}
      {!answered && (
        <T x={300} y={250} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      {answered && (
        <T x={300} y={230} s={26} f={C.caramel} a="middle" w={700}>
          {counted} rows{mic > 0 ? ', 5 distinct parts' : ''}
        </T>
      )}
      <T x={300} y={266} s={14} f={C.latte} a="middle" o={mic}>
        the mic is needed for two reasons
      </T>
    </Svg>
  );
}

// 4 · Quantities multiply. A quantity token runs bundle → kit A → mic and doubles to ×2 on the way; a second runs
// bundle → kit B → mic carrying ×1; at the mic they merge into SUM = 3.
export function Quantities({ t }: StepCtx) {
  const r1 = seg(t, 0.5, 1.7);
  const r2 = seg(t, 1.6, 2.7);
  const merge = easeOut(seg(t, 2.8, 3.4));
  const along = (path: string[], p: number) => {
    const n = path.length - 1;
    const k = Math.min(n - 0.0001, p * n);
    const i = Math.floor(k);
    const f = easeInOut(k - i);
    const A = NODES[path[i]];
    const B = NODES[path[i + 1]];
    return { x: lerp(A.x, B.x, f), y: lerp(A.y, B.y, f), seg: i };
  };
  const tok = (p: number, path: string[], big: (i: number) => boolean, key: string) => {
    if (p <= 0 || merge >= 1) return null;
    const q = along(path, p);
    return <circle key={key} cx={q.x} cy={q.y} r={big(q.seg) ? 10 : 6} fill={C.caramel} opacity={1 - merge} />;
  };
  return (
    <Svg label="The microphone arrives twice, as 2 via kit A and as 1 via kit B, and the sum is 3" h={330}>
      {EDGES.map(([a, b, l]) => (
        <EdgeK
          key={a + b}
          a={a}
          b={b}
          label={l}
          f={(b === '4' && ((a === '2' && r1 > 0.5) || (a === '3' && r2 > 0.5))) || (a === '1' && ((b === '2' && r1 > 0) || (b === '3' && r2 > 0))) ? C.caramel : C.taupe}
        />
      ))}
      {Object.keys(NODES).map((id) => (
        <NodeK key={id} id={id} k={1} hi={id === '4' && merge > 0} />
      ))}
      {tok(r1, ['1', '2', '4'], (i) => i > 0, 'a')}
      {tok(r2, ['1', '3', '4'], () => false, 'b')}
      <T x={60} y={318} s={15} f={C.crema} o={easeOut(seg(t, 1.5, 1.8))}>
        via A: 2
      </T>
      <T x={240} y={318} s={15} f={C.crema} o={easeOut(seg(t, 2.6, 2.9))}>
        via B: 1
      </T>
      <T x={575} y={318} s={18} f={C.caramel} a="end" w={700} o={merge}>
        SUM = 3
      </T>
    </Svg>
  );
}

// 5 · A cycle. A token runs round the dashed ring forever; every step it lands on a node is one more row in the
// working table, so the counter keeps climbing and the batch is never empty.
export function CycleLoop({ t }: StepCtx) {
  const ids = ['1', '2', '3'];
  const pos = [
    { x: 300, y: 70 },
    { x: 440, y: 200 },
    { x: 160, y: 200 },
  ];
  const run = Math.max(0, t - 0.5) / 0.3;
  const i = Math.floor(run) % 3;
  const f = easeInOut(run - Math.floor(run));
  const A = pos[i];
  const B = pos[(i + 1) % 3];
  const rows = Math.floor(run);
  return (
    <Svg label="A kit that contains its own parent: every pass creates a new row and the working table is never empty" h={320}>
      {ids.map((id, k) => {
        const a = pos[k];
        const b = pos[(k + 1) % 3];
        return <line key={id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.cherryText} strokeWidth={2} strokeDasharray="6 5" />;
      })}
      {ids.map((id, k) => (
        <g key={id}>
          <circle cx={pos[k].x} cy={pos[k].y} r={26} fill={C.cocoa} stroke={C.cherryText} strokeWidth={k === (i + 1) % 3 && f > 0.9 ? 3 : 2} />
          <T x={pos[k].x} y={pos[k].y + 5} s={13} f={C.crema} a="middle">
            {NODES[id].name}
          </T>
        </g>
      ))}
      {t > 0.5 && <circle cx={lerp(A.x, B.x, f)} cy={lerp(A.y, B.y, f)} r={7} fill={C.caramel} />}
      <T x={300} y={150} s={13} f={C.latte} a="middle">
        round and round
      </T>
      <T x={300} y={284} s={18} f={C.cherryText} a="middle" w={700}>
        rows so far: {rows} and counting
      </T>
    </Svg>
  );
}

// 6 · Predict: UNION. The four rows arrive with their depth. Before the answer UNION's dedup bracket compares the
// two bundle rows. After it the depths flash as different, the ≠ lands, and the next row of the loop keeps coming.
export function UnionPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const rows = [
    ['bundle', 'depth 1'],
    ['kit A', 'depth 2'],
    ['kit B', 'depth 3'],
    ['bundle', 'depth 4'],
  ];
  const br = easeOut(seg(t, 1.4, 1.8));
  const neq = answered ? easeOutBack(seg(s, 0.2, 0.6)) : 0;
  const more = answered ? easeOut(seg(s, 1.0, 1.5)) : 0;
  return (
    <Svg label="Going round the cycle gives a row with a larger depth, so UNION does not see a duplicate and the loop keeps going" h={300}>
      {rows.map((r, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3))}>
          <rect x={25} y={30 + i * 50} width={150} height={36} rx={8} fill={C.cocoa} stroke={(i === 3 || i === 0) && answered ? C.cherryText : C.mocha} />
          <T x={100} y={54 + i * 50} s={13} f={C.crema} a="middle">
            {r[0]}
          </T>
          <T x={200} y={54 + i * 50} s={13} f={(i === 0 || i === 3) && neq > 0.5 ? C.cherryText : C.caramel}>
            {r[1]}
          </T>
        </g>
      ))}
      <path d="M 305 48 L 325 48 L 325 198 L 305 198" fill="none" stroke={C.latte} strokeWidth={1.5} opacity={br} />
      <T x={335} y={128} s={13} f={C.latte} o={br * (1 - neq)}>
        UNION: same row?
      </T>
      {neq > 0 && (
        <T x={335} y={128} s={16} f={C.cherryText} w={700} o={clamp(neq)}>
          ≠ new depth
        </T>
      )}
      <g opacity={more}>
        <rect x={25} y={230} width={150} height={36} rx={8} fill={C.cocoa} stroke={C.mocha} />
        <T x={100} y={254} s={13} f={C.crema} a="middle">
          kit A
        </T>
        <T x={200} y={254} s={13} f={C.cherryText}>
          depth 5 …
        </T>
      </g>
      {!answered && (
        <T x={470} y={262} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <T x={575} y={254} s={14} f={C.cherryText} a="end" o={more}>
        still looping
      </T>
    </Svg>
  );
}

// 7 · Path guard. The path grows chip by chip: bundle, kit A, kit B. The fourth step brings bundle again: it lands
// red, an arc ties it to the bundle already on the path, and the row is flagged and not expanded.
export function PathGuard({ t }: StepCtx) {
  const names = ['bundle', 'kit A', 'kit B', 'bundle'];
  const red = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="Each row carries its path; stepping onto a node already on it is flagged as a cycle and not expanded" h={300}>
      <T x={25} y={40} s={14} f={C.latte}>
        path carried by the row
      </T>
      {names.map((n, i) => {
        const a = easeOutBack(seg(t, 0.4 + i * 0.6, 0.8 + i * 0.6));
        if (a <= 0) return null;
        const bad = i === 3;
        const hit = (i === 0 || bad) && red > 0;
        return (
          <g key={i} opacity={clamp(a)} transform={`translate(${(1 - clamp(a)) * 30} 0)`}>
            <rect x={25 + i * 135} y={60} width={115} height={38} rx={8} fill={C.cocoa} stroke={hit ? C.cherryText : C.caramel} strokeWidth={hit ? 2.5 : 1.5} />
            <T x={82 + i * 135} y={84} s={14} f={bad ? C.cherryText : C.crema} a="middle">
              {n}
            </T>
            {i < 3 && <path d={`M ${140 + i * 135} 79 l 14 0 m -5 -5 l 5 5 l -5 5`} fill="none" stroke={C.taupe} strokeWidth={1.5} />}
          </g>
        );
      })}
      {red > 0 && <path d={`M 82 104 Q 285 ${104 + 70 * red} 487 104`} fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="6 4" />}
      <T x={300} y={200} s={15} f={C.cherryText} a="middle" w={700} o={easeOut(seg(t, 3.0, 3.4))}>
        already on the path: cycle, stop here
      </T>
      <T x={300} y={250} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        every path ends: no new node, or a seen one
      </T>
    </Svg>
  );
}

// 8 · Sugar. The CYCLE clause types in, and below it the path array it writes for you appears; then SEARCH types
// in and a sort column ticks 1, 2, 3 down the side; last, the engines without either clause.
export function Sugar({ t }: StepCtx) {
  const l1 = 'CYCLE id SET is_cycle USING path';
  const l2 = 'SEARCH DEPTH FIRST BY id SET ordercol';
  const c1 = Math.floor(seg(t, 0.2, 0.9) * l1.length);
  const c2 = Math.floor(seg(t, 1.6, 2.3) * l2.length);
  const exp = easeOut(seg(t, 0.9, 1.3));
  const ord = seg(t, 2.3, 2.9);
  return (
    <Svg label="CYCLE and SEARCH in PostgreSQL 14 expand into the path-array form and a sort column" h={300}>
      <T x={25} y={40} s={15} f={C.caramel} w={700}>
        {l1.slice(0, c1)}
      </T>
      <g opacity={exp}>
        <T x={25} y={66} s={13} f={C.latte}>
          writes the path array for you:
        </T>
        {['bundle', 'kit A', 'kit B'].map((n, i) => (
          <g key={n} opacity={easeOut(seg(t, 1.0 + i * 0.12, 1.3 + i * 0.12))}>
            <rect x={25 + i * 92} y={78} width={84} height={22} rx={5} fill={C.cocoa} stroke={C.mocha} />
            <T x={67 + i * 92} y={94} s={13} f={C.crema} a="middle">
              {n}
            </T>
          </g>
        ))}
      </g>
      <T x={25} y={130} s={15} f={C.caramel} w={700}>
        {l2.slice(0, c2)}
      </T>
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={ord > i / 3 ? 1 : 0}>
          <rect x={25 + i * 60} y={146} width={50} height={24} rx={5} fill="none" stroke={C.cinnamon} />
          <T x={50 + i * 60} y={163} s={13} f={C.cinnamon} a="middle">
            {i + 1}
          </T>
        </g>
      ))}
      <T x={210} y={163} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        order defined, not luck
      </T>
      <T x={25} y={236} s={14} f={C.crema} o={easeOut(seg(t, 3.0, 3.5))}>
        DuckDB: no CYCLE, no SEARCH → write the path yourself
      </T>
    </Svg>
  );
}

// 9 · Two failures. A token loops a small ring until the path guard drops a bar across it. Then the blow-up bars
// rise level by level (paths doubling, an illustrative shape) with no ring anywhere, and only a depth cap trims them.
export function TwoFailures({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const guard = easeOut(seg(t, 1.2, 1.5));
  const b = easeOut(seg(t, 1.8, 2.2));
  const cap = easeOut(seg(t, 3.2, 3.6));
  const run = guard > 0 ? 1.2 * 2.2 : Math.max(0, t) * 2.2;
  const ang = run * Math.PI * 2 * 0.5;
  return (
    <Svg label="A cycle never ends and the path guard stops it; a blow-up has no cycle, its paths multiply level by level, and only a depth cap trims it" h={320}>
      <g opacity={a}>
        <T x={25} y={44} s={16} f={C.cherryText} w={700}>
          cycle
        </T>
        <T x={25} y={70} s={13} f={C.latte}>
          never stops
        </T>
        <T x={25} y={96} s={14} f={C.caramel} o={guard}>
          fix: carry the path / CYCLE
        </T>
        <circle cx={480} cy={70} r={34} fill="none" stroke={C.cherryText} strokeDasharray="5 4" />
        <circle cx={480 + 34 * Math.cos(ang)} cy={70 + 34 * Math.sin(ang)} r={6} fill={C.caramel} />
        {guard > 0 && <line x1={440} y1={lerp(30, 70, guard)} x2={520} y2={lerp(30, 70, guard)} stroke={C.caramel} strokeWidth={3} />}
      </g>
      <g opacity={b}>
        <T x={25} y={180} s={16} f={C.cherryText} w={700}>
          blow-up
        </T>
        <T x={25} y={206} s={13} f={C.latte}>
          no cycle: shared parts multiply paths
        </T>
        <T x={25} y={232} s={14} f={C.caramel} o={cap}>
          fix: depth cap, or shortest path
        </T>
        {[0, 1, 2, 3, 4].map((i) => {
          const h = 6 * Math.pow(2, i);
          const g = easeOut(seg(t, 2.1 + i * 0.2, 2.4 + i * 0.2));
          return <rect key={i} x={400 + i * 34} y={300 - h * g} width={26} height={h * g} rx={3} fill={C.cherry} opacity={i > 2 ? 1 - 0.7 * cap : 0.9} />;
        })}
        {cap > 0 && <line x1={392} y1={276} x2={392 + 180 * cap} y2={276} stroke={C.caramel} strokeWidth={2} strokeDasharray="6 4" />}
      </g>
    </Svg>
  );
}

// 10 · Verdict: each habit arrives with its fix underlined and checked off.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['evaluate', 'seed, loop, stop on empty', 300],
    ['quantities', 'multiply down, SUM at the end', 350],
    ['real data', 'path or CYCLE, plus a depth cap', 370],
  ] as const;
  return (
    <Svg label="Three habits for recursive queries" h={280}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.6, 0.6 + i * 0.6));
        const u = easeInOut(seg(t, 0.5 + i * 0.6, 1.0 + i * 0.6));
        const y = 50 + i * 80;
        return (
          <g key={r[0]} opacity={clamp(a)} transform={`translate(${(1 - a) * -20} 0)`}>
            <T x={25} y={y} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={y + 30} s={20} f={C.caramel} w={700}>
              {r[1]}
            </T>
            <rect x={25} y={y + 40} width={r[2] * u} height={3} rx={1.5} fill={C.caramel} />
            {u >= 1 && <path d={`M 545 ${y + 20} l 6 6 l 12 -14`} fill="none" stroke={C.caramel} strokeWidth={2.5} />}
          </g>
        );
      })}
    </Svg>
  );
}

// 11 · Prove it: CYCLE. Four clauses wait in a row; after the answer CYCLE lifts and lights while the rest dim.
export function ProveCycle({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOutBack(seg(s, 0.1, 0.6)) : 0;
  const opts = ['SEARCH', 'CYCLE', 'LIMIT', 'DISTINCT'];
  return (
    <Svg label="Which clause detects cycles: CYCLE" h={240}>
      <T x={25} y={44} s={16} f={C.latte}>
        WITH RECURSIVE … which clause?
      </T>
      {opts.map((o, i) => {
        const hit = i === 1;
        const a = easeOutBack(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1));
        return (
          <g key={o} opacity={clamp(a) * (answered && !hit ? 1 - 0.6 * clamp(k) : 1)} transform={`translate(0 ${hit ? -16 * clamp(k) : 0})`}>
            <rect x={25 + i * 140} y={90} width={125} height={40} rx={8} fill={C.cocoa} stroke={hit && k > 0 ? C.caramel : C.mocha} strokeWidth={hit && k > 0 ? 2.5 : 1} />
            <T x={87 + i * 140} y={115} s={14} f={hit && k > 0 ? C.caramel : C.crema} a="middle" w={hit ? 700 : 400}>
              {o}
            </T>
          </g>
        );
      })}
      {!answered && (
        <T x={300} y={200} s={36} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <T x={300} y={196} s={14} f={C.latte} a="middle" o={answered ? easeOut(seg(s, 0.6, 1.0)) : 0}>
        flags a key already on its path
      </T>
    </Svg>
  );
}

// 12 · Prove it: stop. A loop arrow circles an empty working table; after the answer it slows to a halt and fades.
export function ProveStop({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const stop = answered ? easeOut(seg(s, 0.1, 0.8)) : 0;
  const ang = (answered ? 0 : t * 220) % 360;
  return (
    <Svg label="An empty step ends the loop" h={240}>
      <rect x={60} y={70} width={160} height={46} rx={8} fill="none" stroke={C.cherryText} strokeDasharray="5 4" />
      <T x={140} y={98} s={14} f={C.cherryText} a="middle">
        0 new rows
      </T>
      <g transform={`translate(140 93) rotate(${ang})`} opacity={1 - stop}>
        <path d="M 0 -48 A 48 48 0 1 1 -34 -34" fill="none" stroke={C.latte} strokeWidth={2} />
        <path d="M -34 -34 l 2 -10 m -2 10 l 10 -2" fill="none" stroke={C.latte} strokeWidth={2} />
      </g>
      {answered ? (
        <g opacity={stop}>
          <T x={330} y={102} s={24} f={C.caramel} w={700}>
            the loop stops
          </T>
        </g>
      ) : (
        <T x={330} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
