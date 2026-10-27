import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a vertex or stored value, drawn once it exists; latte =
// secondary labels (weight, index, degree); taupe = memory not yet touched; caramel = the
// representation/array being built right now; cinnamon (rare) = the alternative being compared;
// cherry/cherryText = a cache miss, or a weight the matrix's own cell couldn't keep. The chapter's
// own small graph (examples.py): A,B,C,D,E,F; edges A->B(4), A->C(2), A->B(7) [multi-edge],
// B->C(3), B->D(5), C->D(1), C->E(6), D->E(2), D->F(8), E->F(3). Acyclic by construction.

const VERTICES = ['A', 'B', 'C', 'D', 'E', 'F'];
const EDGES: [string, string, number][] = [
  ['A', 'B', 4],
  ['A', 'C', 2],
  ['A', 'B', 7],
  ['B', 'C', 3],
  ['B', 'D', 5],
  ['C', 'D', 1],
  ['C', 'E', 6],
  ['D', 'E', 2],
  ['D', 'F', 8],
  ['E', 'F', 3],
];

function vertexPositions() {
  // A small left-to-right layout; the graph is already acyclic in this exact order.
  const xs = [40, 140, 240, 340, 440, 540];
  const ys = [120, 60, 180, 60, 180, 120];
  return Object.fromEntries(VERTICES.map((v, i) => [v, { x: xs[i], y: ys[i] }]));
}

function GraphDrawing({ a, highlight }: { a: number; highlight?: [string, string][] }) {
  const pos = vertexPositions();
  const hl = new Set((highlight ?? []).map(([u, w]) => `${u}-${w}`));
  return (
    <>
      {EDGES.map(([u, w, wt], i) => {
        const p1 = pos[u];
        const p2 = pos[w];
        const dup = u === 'A' && w === 'B';
        const curve = dup && wt === 4 ? -14 : dup && wt === 7 ? 14 : 0;
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2 + curve;
        const on = hl.has(`${u}-${w}`);
        return (
          <g key={i} opacity={a}>
            <path d={`M${p1.x + 10},${p1.y} Q${mx},${my} ${p2.x - 10},${p2.y}`} stroke={on ? C.caramel : C.line} strokeWidth={on ? 1.8 : 1.2} fill="none" />
            <T x={mx} y={my - 4} s={11} f={on ? C.caramel : C.quiet} a="middle">{wt}</T>
          </g>
        );
      })}
      {VERTICES.map((v) => (
        <g key={v} opacity={a}>
          <circle cx={pos[v].x} cy={pos[v].y} r={14} fill="none" stroke={C.crema} strokeWidth={1.4} />
          <T x={pos[v].x} y={pos[v].y + 4} s={13} f={C.crema} a="middle">{v}</T>
        </g>
      ))}
    </>
  );
}

// 1 · Opening: the identical question, asked three ways.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const panels = easeOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="A small directed weighted graph, with a query asked against three empty panels: list, matrix, edge list" h={320}>
      <GraphDrawing a={a} highlight={[['A', 'F']]} />
      <T x={300} y={230} s={14} f={C.caramel} a="middle">does an edge exist, A &rarr; F?</T>
      {['List', 'Matrix', 'Edge list'].map((name, i) => (
        <g key={name} opacity={panels}>
          <rect x={60 + i * 180} y={255} width={160} height={40} rx={4} fill="none" stroke={C.quiet} strokeWidth={1.2} />
          <T x={140 + i * 180} y={279} s={13} f={C.quiet} a="middle">{name}?</T>
        </g>
      ))}
    </Svg>
  );
}

// 2 · ListReveal: a chain of neighbours per vertex, A's own chain highlighted.
export function ListReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const chain = easeOut(seg(t, 0.8, 1.8));
  const rows = VERTICES.map((v) => [v, EDGES.filter(([u]) => u === v).map(([, w, wt]) => `${w}(${wt})`)] as const);
  return (
    <Svg label="One short chain of neighbours per vertex, A's own chain of two destinations highlighted" h={300}>
      {rows.map(([v, chainItems], i) => (
        <g key={v} opacity={a}>
          <T x={30} y={40 + i * 40} s={14} f={v === 'A' ? C.caramel : C.crema}>{v}</T>
          <T x={60} y={40 + i * 40} s={13} f={C.quiet}>&rarr;</T>
          {chainItems.length === 0 ? (
            <T x={85} y={40 + i * 40} s={12} f={C.quiet}>(none)</T>
          ) : (
            chainItems.map((item, j) => (
              <rect
                key={j}
                x={85 + j * 70}
                y={28 + i * 40}
                width={60}
                height={22}
                rx={3}
                fill="none"
                stroke={v === 'A' ? C.caramel : C.crema}
                strokeWidth={1.3}
                opacity={v === 'A' ? chain : 1}
              />
            ))
          )}
          {v === 'A' &&
            chainItems.map((item, j) => (
              <T key={j} x={115 + j * 70} y={44} s={12} f={C.caramel} a="middle" o={chain}>
                {item}
              </T>
            ))}
        </g>
      ))}
      <T x={30} y={270} s={13} f={C.latte}>A's own chain: 3 entries — reading it costs exactly that: 3 steps.</T>
    </Svg>
  );
}

// 3 · MatrixPredict: one cell, two edges wanting to live in it.
export function MatrixPredictViz({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const answered = answer !== null;
  const cell = 40;
  return (
    <Svg label="A 6x6 grid of cells, one cell (A,B) highlighted where two edges share the identical pair" h={320}>
      {VERTICES.map((_, i) =>
        VERTICES.map((_, j) => {
          const on = i === 0 && j === 1; // A -> B
          return (
            <rect
              key={`${i}-${j}`}
              x={60 + j * cell}
              y={40 + i * cell}
              width={cell - 3}
              height={cell - 3}
              fill="none"
              stroke={on ? C.caramel : C.line}
              strokeWidth={on ? 1.8 : 1}
              opacity={a}
            />
          );
        }),
      )}
      {VERTICES.map((v, i) => (
        <g key={v} opacity={a}>
          <T x={44} y={40 + i * cell + 20} s={12} f={C.quiet} a="middle">{v}</T>
          <T x={60 + i * cell + (cell - 3) / 2} y={32} s={12} f={C.quiet} a="middle">{v}</T>
        </g>
      ))}
      {!answered && (
        <T x={60 + cell + (cell - 3) / 2} y={60} s={20} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>?</T>
      )}
      {answered && (
        <>
          <T x={60 + cell + (cell - 3) / 2} y={60} s={16} f={C.cherryText} a="middle">7</T>
          <T x={60 + cell + (cell - 3) / 2} y={74} s={10} f={C.cherryText} a="middle" italic>(4 lost)</T>
        </>
      )}
      <T x={300} y={300} s={13} f={C.latte} a="middle">two edges, A &rarr; B — one cell</T>
    </Svg>
  );
}

// 4 · MatrixReveal: the surviving weight, and the one-lookup edge test.
export function MatrixReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const cell = 40;
  return (
    <Svg label="The same grid, cell (A,B) holding the surviving weight 7 with the overwritten weight 4 struck through" h={320}>
      {VERTICES.map((_, i) =>
        VERTICES.map((_, j) => {
          const on = i === 0 && j === 1;
          return (
            <rect
              key={`${i}-${j}`}
              x={60 + j * cell}
              y={40 + i * cell}
              width={cell - 3}
              height={cell - 3}
              fill="none"
              stroke={on ? C.caramel : C.line}
              strokeWidth={on ? 1.8 : 1}
              opacity={a}
            />
          );
        }),
      )}
      {VERTICES.map((v, i) => (
        <g key={v} opacity={a}>
          <T x={44} y={40 + i * cell + 20} s={12} f={C.quiet} a="middle">{v}</T>
          <T x={60 + i * cell + (cell - 3) / 2} y={32} s={12} f={C.quiet} a="middle">{v}</T>
        </g>
      ))}
      <T x={60 + cell + (cell - 3) / 2} y={60} s={16} f={C.caramel} a="middle">7</T>
      <T x={60 + 5 * cell + (cell - 3) / 2} y={260} s={13} f={C.quiet} a="middle">A &rarr; F</T>
      <T x={60 + 5 * cell + (cell - 3) / 2} y={60} s={14} f={C.latte} a="middle">&empty;</T>
      <T x={30} y={290} s={13} f={C.latte}>one lookup, every time — list had to search a 3-entry chain for the same answer</T>
    </Svg>
  );
}

// 5 · EdgeListReveal: a flat row of every edge, once.
export function EdgeListReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="Every edge laid out as its own (u, v, weight) row, with no per-vertex structure at all" h={320}>
      {EDGES.map(([u, w, wt], i) => {
        const on = u === 'A' && w === 'B';
        const col = i % 2;
        const row = Math.floor(i / 2);
        return (
          <g key={i} opacity={Math.min(1, a * (1 + i * 0.05))}>
            <rect x={60 + col * 260} y={40 + row * 44} width={220} height={32} rx={3} fill="none" stroke={on ? C.caramel : C.crema} strokeWidth={on ? 1.6 : 1.2} />
            <T x={75 + col * 260} y={61 + row * 44} s={13} f={on ? C.caramel : C.crema}>{u} &rarr; {w}, weight {wt}</T>
          </g>
        );
      })}
      <T x={30} y={300} s={13} f={C.latte}>ten edges, ten rows — F's own zero edges cost nothing here</T>
    </Svg>
  );
}

// 6 · DAGReveal: every vertex in one consistent order, every arrow pointing the same way.
export function DAGReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  const xs = [50, 150, 250, 350, 450, 550];
  const order = ['A', 'B', 'C', 'D', 'E', 'F'];
  const pos = Object.fromEntries(order.map((v, i) => [v, xs[i]]));
  return (
    <Svg label="Every vertex slid into one left-to-right order, every edge drawn pointing the same direction" h={260}>
      {EDGES.map(([u, w], i) => (
        <g key={i} opacity={a}>
          <path d={`M${pos[u] + 10},140 Q${(pos[u] + pos[w]) / 2},${100 - (i % 3) * 14} ${pos[w] - 10},140`} stroke={C.line} strokeWidth={1.2} fill="none" />
        </g>
      ))}
      {order.map((v, i) => (
        <g key={v} opacity={a}>
          <circle cx={pos[v]} cy={140} r={14} fill="none" stroke={C.caramel} strokeWidth={1.4} />
          <T x={pos[v]} y={144} s={13} f={C.caramel} a="middle">{v}</T>
          <T x={pos[v]} y={190} s={11} f={C.quiet} a="middle">{i}</T>
        </g>
      ))}
      <T x={300} y={230} s={13} f={C.latte} a="middle">one consistent order — every arrow still points right</T>
    </Svg>
  );
}

// 7 · WhichRepReveal: three representations, one cheap job each.
export function WhichRepReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  const rows = [
    { name: 'Adjacency list', cheap: 'cheap neighbours — BFS, DFS' },
    { name: 'Adjacency matrix', cheap: 'cheap one-pair lookup' },
    { name: 'Edge list', cheap: 'the natural starting format' },
  ];
  return (
    <Svg label="Three representations, one row each, with the one operation each is cheap at underlined" h={280}>
      {rows.map((r, i) => (
        <g key={r.name} opacity={easeOut(seg(t, 0.2 + i * 0.3, 0.9 + i * 0.3))}>
          <T x={30} y={50 + i * 60} s={15} f={C.crema} serif>{r.name}</T>
          <T x={30} y={74 + i * 60} s={13} f={C.caramel}>{r.cheap}</T>
          <rect x={28} y={80 + i * 60} width={200} height={1.5} fill={C.caramel} opacity={a} />
        </g>
      ))}
    </Svg>
  );
}

// 8 · ProveIt: real counted cells/entries, at the small graph and scaled up.
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  const b = easeOut(seg(t, 0.8, 2.0));
  const small = [
    { name: 'List', v: 16, c: C.crema },
    { name: 'Matrix', v: 36, c: C.crema },
    { name: 'Edges', v: 10, c: C.crema },
  ];
  const big = [
    { name: 'List', v: 4000, c: C.caramel },
    { name: 'Matrix', v: 1_000_000, c: C.caramel },
    { name: 'Edges', v: 3000, c: C.caramel },
  ];
  const scale = (n: number, max: number) => (n / max) * 140;
  return (
    <Svg label="Real counted cells/entries for the small graph, and a much taller matrix bar once scaled to a thousand vertices" h={300}>
      <T x={30} y={30} s={13} f={C.quiet}>this graph (6 vertices)</T>
      {small.map((s, i) => (
        <rect key={s.name} x={40 + i * 60} y={40 + (36 - s.v) * 1.5} width={40} height={s.v * 1.5 * a} fill={s.c} opacity={0.5} />
      ))}
      {small.map((s, i) => (
        <T key={s.name} x={60 + i * 60} y={116} s={11} f={C.quiet} a="middle">{s.name}</T>
      ))}
      <T x={320} y={30} s={13} f={C.quiet}>scaled to 1,000 vertices</T>
      {big.map((s, i) => (
        <rect key={s.name} x={330 + i * 70} y={160 - scale(s.v, 1_000_000)} width={50} height={scale(s.v, 1_000_000) * b} fill={s.c} opacity={0.6} />
      ))}
      {big.map((s, i) => (
        <T key={s.name} x={355 + i * 70} y={176} s={11} f={C.quiet} a="middle">{s.name}</T>
      ))}
      <T x={30} y={220} s={13} f={C.latte}>at a thousand vertices, the matrix is 250&times; the list's own space</T>
    </Svg>
  );
}
