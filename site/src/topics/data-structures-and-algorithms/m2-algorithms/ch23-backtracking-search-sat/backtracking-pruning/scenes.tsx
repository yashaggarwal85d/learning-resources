import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, this chapter's own): crema = a decision already made (a queen placed, a digit written,
// an edge to a visited node); latte = secondary labels; taupe = the part of the tree or board not yet visited; caramel =
// the thing to look at (the node being expanded, the square being branched on); cinnamon (rare) = the alternative being
// compared, the plainer search against the smarter one; cherryText = the bad outcome, a dead end at the moment it is
// abandoned.
//
// Every printed number is examples.py's: 16, 24 and 6 leaves on {a, b, c, d}; 4,426,165,368, 16,777,216 and 40,320;
// four queens' 17 nodes and 2 solutions; eight queens' 2,057 calls, 92 solutions, first after 114; twelve queens' first
// after 262; the unsafe edge prune's 0 of 92; 81 squares, 27 units, 20 peers; the hard grid's 20 decided and 61
// uncertain, 4.6 × 10³⁸ combinations; search with propagation, 25 tried and 9 branched; first-empty order unsolved at
// 3,000,000, fewest-candidates solved at 481. Norvig's 27 of 30 under 0.02 s and 3 near 190 s are his, quoted in
// SOURCES.md. The trees, the queens' trace and the grid are replayed here by the same loops examples.py runs; the
// topic's own thirty seeded runs are drawn as positions only.

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

/** Which of n beats spread over [a, b] has started: -1 before a, then 0 to n - 1. */
const stepIdx = (x: number, a: number, b: number, n: number) => (x < a ? -1 : Math.min(n - 1, Math.floor(((x - a) / (b - a)) * n)));
const log10 = (x: number) => Math.log(x) / Math.LN10;

// ---------------------------------------------------------------------------------------------------------------------
// N-queens: examples.py's nqueens_pruned, recording every call as a node (its queens so far, its parent, its children).
type QNode = { q: number[]; parent: number; kids: number[]; solution: boolean };
function queensTree(n: number, stopAtFirst: boolean) {
  const nodes: QNode[] = [];
  let done = false;
  const rec = (q: number[], parent: number) => {
    const id = nodes.length;
    nodes.push({ q: [...q], parent, kids: [], solution: q.length === n });
    if (parent >= 0) nodes[parent].kids.push(id);
    if (q.length === n) {
      if (stopAtFirst) done = true;
      return;
    }
    const row = q.length;
    for (let col = 0; col < n && !done; col++) {
      if (q.some((c, r) => c === col || r + c === row + col || r - c === row - col)) continue;
      rec([...q, col], id);
    }
  };
  rec([], -1);
  return nodes;
}
const Q4 = queensTree(4, false); // 17 nodes, 2 solutions
const Q8_FIRST = queensTree(8, true); // 114 calls to the first solution
const Q4_SOLUTIONS = Q4.filter((n) => n.solution).length;

/** A chess board at (x, y) with n squares a side; queens by row; `bad` paints them red. */
function Board({ x, y, n, cell, q, bad = false, refuse = false, o = 1 }: { x: number; y: number; n: number; cell: number; q: number[]; bad?: boolean; refuse?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n * n }, (_, k) => {
        const r = Math.floor(k / n), c = k % n;
        const edge = refuse && r > 0 && (c === 0 || c === n - 1);
        return <rect key={k} x={x + c * cell} y={y + r * cell} width={cell} height={cell} fill={edge ? C.cherry : (r + c) % 2 ? C.cocoa : C.roast} stroke={C.mocha} strokeWidth={0.5} />;
      })}
      {q.map((c, r) => <circle key={r} cx={x + c * cell + cell / 2} cy={y + r * cell + cell / 2} r={cell * 0.32} fill={bad ? C.cherryText : C.caramel} />)}
    </g>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Sudoku: examples.py's Norvig representation, assign/eliminate propagation, and search with fewest candidates first.
const DIG = '123456789';
const ROWS = 'ABCDEFGHI';
const SQ = [...ROWS].flatMap((r) => [...DIG].map((c) => r + c));
const cross = (A: string, B: string) => [...A].flatMap((a) => [...B].map((b) => a + b));
const UNITLIST = [
  ...[...DIG].map((c) => cross(ROWS, c)),
  ...[...ROWS].map((r) => cross(r, DIG)),
  ...['ABC', 'DEF', 'GHI'].flatMap((rs) => ['123', '456', '789'].map((cs) => cross(rs, cs))),
];
const UNITS: Record<string, string[][]> = Object.fromEntries(SQ.map((s) => [s, UNITLIST.filter((u) => u.includes(s))]));
const PEERS: Record<string, string[]> = Object.fromEntries(SQ.map((s) => [s, Array.from(new Set(UNITS[s].flat())).filter((p) => p !== s)]));
type Vals = Record<string, string>;
let decidedLog: string[] = [];
function assign(v: Vals, s: string, d: string): Vals | false {
  for (const d2 of v[s].replace(d, '')) if (!eliminate(v, s, d2)) return false;
  return v;
}
function eliminate(v: Vals, s: string, d: string): Vals | false {
  if (!v[s].includes(d)) return v;
  v[s] = v[s].replace(d, '');
  if (v[s].length === 0) return false;
  if (v[s].length === 1) {
    if (!decidedLog.includes(s)) decidedLog.push(s);
    const d2 = v[s];
    for (const p of PEERS[s]) if (!eliminate(v, p, d2)) return false;
  }
  for (const u of UNITS[s]) {
    const places = u.filter((s2) => v[s2].includes(d));
    if (places.length === 0) return false;
    if (places.length === 1 && !assign(v, places[0], d)) return false;
  }
  return v;
}
const HARD = '4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......';
const GIVENS = SQ.filter((_, i) => HARD[i] !== '.');
function parse(): Vals {
  const v: Vals = Object.fromEntries(SQ.map((s) => [s, DIG]));
  decidedLog = [];
  SQ.forEach((s, i) => {
    if (HARD[i] !== '.') assign(v, s, HARD[i]);
  });
  return v;
}
const PROP = parse(); // 20 decided, 61 uncertain
const PROP_ORDER = [...GIVENS, ...decidedLog.filter((s) => !GIVENS.includes(s))];
const DECIDED = SQ.filter((s) => PROP[s].length === 1);
const UNCERTAIN = SQ.filter((s) => PROP[s].length > 1);
// Search with propagation, counting attempts and the squares branched on, in order.
const BRANCHED: string[] = [];
let ATTEMPTS = 0;
function searchCounting(v: Vals | false): Vals | false {
  if (!v) return false;
  if (SQ.every((s) => v[s].length === 1)) return v;
  let best = '';
  for (const s of SQ) if (v[s].length > 1 && (best === '' || v[s].length < v[best].length || (v[s].length === v[best].length && s < best))) best = s;
  if (!BRANCHED.includes(best)) BRANCHED.push(best);
  for (const d of v[best]) {
    ATTEMPTS++;
    const r = searchCounting(assign({ ...v }, best, d));
    if (r) return r;
  }
  return false;
}
const SOLVED = searchCounting(parse()) as Vals; // 25 attempts, 9 squares
// The plain peer check of step 11, used to name the two squares the two orders pick first.
const START: Record<string, string | null> = Object.fromEntries(SQ.map((s, i) => [s, HARD[i] === '.' ? null : HARD[i]]));
const EMPTIES = SQ.filter((s) => START[s] === null);
const nCands = (s: string) => [...DIG].filter((d) => PEERS[s].every((p) => START[p] !== d)).length;
const FIRST_EMPTY = EMPTIES[0];
const MRV_FIRST = EMPTIES.reduce((b, s) => (nCands(s) < nCands(b) ? s : b), EMPTIES[0]);

/** The 9 × 9 grid at (x, y); `show` decides what each square prints and how. */
function Grid({ x, y, cell, show }: { x: number; y: number; cell: number; show: (s: string) => { text?: string; f?: string; fill?: string; ring?: string } | undefined }) {
  return (
    <g>
      {SQ.map((s, i) => {
        const r = Math.floor(i / 9), c = i % 9;
        const st = show(s) ?? {};
        return (
          <g key={s}>
            <rect x={x + c * cell} y={y + r * cell} width={cell} height={cell} fill={st.fill ?? C.roast} stroke={st.ring ?? C.mocha} strokeWidth={st.ring ? 2 : 0.6} />
            {st.text && <T x={x + c * cell + cell / 2} y={y + r * cell + cell / 2 + 4} s={12} f={st.f ?? C.crema} a="middle">{st.text}</T>}
          </g>
        );
      })}
      {[0, 3, 6, 9].map((k) => (
        <g key={k}>
          <line x1={x + k * 3 * cell / 3} y1={y} x2={x + k * 3 * cell / 3} y2={y + 9 * cell} stroke={C.latte} strokeWidth={1.2} />
          <line x1={x} y1={y + k * 3 * cell / 3} x2={x + 9 * cell} y2={y + k * 3 * cell / 3} stroke={C.latte} strokeWidth={1.2} />
        </g>
      ))}
    </g>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// 1 · Opening. An empty 8 × 8 board; the search places queens row by row, backing up at each dead end (the queens
// flash red), 114 calls to its first solution. Then the two costs: every placement 4,426,165,368; this search 2,057
// calls, all 92 solutions.
export function Opening({ t }: StepCtx) {
  const k = stepIdx(t, 0.3, 2.8, Q8_FIRST.length);
  const node = k >= 0 ? Q8_FIRST[k] : null;
  const dead = !!node && !node.solution && node.kids.length === 0;
  const a = easeOut(seg(t, 3.0, 3.4));
  const b = easeOut(seg(t, 3.6, 4.0));
  const c = easeOut(seg(t, 4.2, 4.6));
  return (
    <Svg label="An eight by eight board. A search places queens row by row and backs up at every dead end, the queens flashing red, until its first solution after 114 calls. Every placement on the board: 4,426,165,368. This search: 2,057 calls in all, finding all 92 solutions" h={300}>
      <Board x={40} y={30} n={8} cell={26} q={node ? node.q : []} bad={dead} />
      {k >= 0 && t < 3.0 && <T x={330} y={70} s={13} f={C.latte}>{node?.solution ? 'first solution' : dead ? 'dead end: back up' : 'placing row by row'}</T>}
      <T x={330} y={110} s={12} f={C.cinnamon} o={a}>every placement</T>
      <T x={330} y={132} s={14} f={C.cinnamon} o={a}>4,426,165,368</T>
      <T x={330} y={176} s={12} f={C.caramel} o={b}>this search</T>
      <T x={330} y={198} s={14} f={C.caramel} o={b}>2,057 calls</T>
      <T x={330} y={240} s={13} f={C.crema} o={c}>all 92 solutions</T>
    </Svg>
  );
}

// 2 · EnumerationTrees. One recursion, three trees on {a, b, c, d}, each growing a level at a time: in or out at each
// element, 16 leaves; any unused element next, 24 leaves; increasing indices, pairs only, 6 leaves.
type TNode = { d: number; x: number; leaf: boolean; parent: number };
function layout(build: (push: (d: number, parent: number, leaf: boolean) => number) => void, x0: number, w: number) {
  const nodes: TNode[] = [];
  build((d, parent, leaf) => {
    nodes.push({ d, x: 0, leaf, parent });
    return nodes.length - 1;
  });
  const leaves = nodes.map((n, i) => (n.leaf || !nodes.some((m) => m.parent === i) ? i : -1)).filter((i) => i >= 0);
  leaves.forEach((i, j) => (nodes[i].x = x0 + (leaves.length === 1 ? w / 2 : (j / (leaves.length - 1)) * w)));
  for (let d = Math.max(...nodes.map((n) => n.d)); d >= 0; d--)
    nodes.forEach((n, i) => {
      if (n.d !== d) return;
      const kids = nodes.filter((m) => m.parent === i);
      if (kids.length) n.x = kids.reduce((s, m) => s + m.x, 0) / kids.length;
    });
  return nodes;
}
const SUBSETS = layout((push) => {
  const rec = (i: number, p: number) => {
    const id = push(i, p, i === 4);
    if (i < 4) {
      rec(i + 1, id);
      rec(i + 1, id);
    }
  };
  rec(0, -1);
}, 30, 160);
const PERMS = layout((push) => {
  const rec = (used: boolean[], d: number, p: number) => {
    const id = push(d, p, d === 4);
    for (let i = 0; i < 4; i++)
      if (!used[i]) {
        used[i] = true;
        rec(used, d + 1, id);
        used[i] = false;
      }
  };
  rec([false, false, false, false], 0, -1);
}, 220, 160);
const COMBOS = layout((push) => {
  const rec = (start: number, d: number, p: number) => {
    const id = push(d, p, d === 2);
    if (d === 2) return;
    for (let i = start; i < 4; i++) rec(i + 1, d + 1, id);
  };
  rec(0, 0, -1);
}, 420, 150);
const leafCount = (ns: TNode[]) => ns.filter((n) => n.leaf).length;
function TreeDraw({ ns, depth, y0 = 40, dy = 42, c = C.crema }: { ns: TNode[]; depth: number; y0?: number; dy?: number; c?: string }) {
  return (
    <g>
      {ns.map((n, i) =>
        n.parent >= 0 && n.d <= depth ? (
          <line key={`e${i}`} x1={ns[n.parent].x} y1={y0 + ns[n.parent].d * dy} x2={lerp(ns[n.parent].x, n.x, clamp(depth - n.d + 1, 0, 1))} y2={lerp(y0 + ns[n.parent].d * dy, y0 + n.d * dy, clamp(depth - n.d + 1, 0, 1))} stroke={C.taupe} strokeWidth={1} />
        ) : null,
      )}
      {ns.map((n, i) => (n.d <= Math.floor(depth) ? <circle key={i} cx={n.x} cy={y0 + n.d * dy} r={n.leaf ? 2.6 : 3.2} fill={n.leaf ? c : C.band} stroke={n.leaf ? c : C.latte} strokeWidth={1} /> : null))}
    </g>
  );
}
export function EnumerationTrees({ t }: StepCtx) {
  const trees = [
    { ns: SUBSETS, name: 'subsets', t0: 0.3 },
    { ns: PERMS, name: 'orderings', t0: 1.4 },
    { ns: COMBOS, name: 'pairs', t0: 2.5 },
  ];
  return (
    <Svg label="One recursion, three trees on a, b, c, d, each growing a level at a time. In or out at each element: 16 leaves. Any unused element next: 24 leaves. Increasing indices, pairs only: 6 leaves" h={300}>
      {trees.map((tr) => {
        const maxD = Math.max(...tr.ns.map((n) => n.d));
        const depth = clamp((t - tr.t0) / 0.2, -1, maxD + 0.99);
        const xs = tr.ns.map((n) => n.x);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const done = depth >= maxD;
        return (
          <g key={tr.name}>
            {depth >= 0 && <TreeDraw ns={tr.ns} depth={depth} />}
            <T x={cx} y={244} s={12} f={C.latte} a="middle" o={depth >= 0 ? 1 : 0}>{tr.name}</T>
            <T x={cx} y={270} s={14} f={C.caramel} a="middle" o={done ? 1 : 0}>{`${leafCount(tr.ns)} leaves`}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · UnprunedProgression. Three bars on a log scale shrink in turn: any eight squares, 4,426,165,368; one queen per
// row, 16,777,216; no shared column, 40,320. Then a diagonal check joins as the first real prune.
const PROG = [
  { name: 'any 8 squares', n: 4426165368, s: '4,426,165,368' },
  { name: 'one per row', n: 16777216, s: '16,777,216' },
  { name: 'no shared column', n: 40320, s: '40,320' },
];
export function UnprunedProgression({ t }: StepCtx) {
  const X0 = 40, W = 520;
  const wOf = (n: number) => (log10(n) / 10) * W;
  const prune = easeOut(seg(t, 3.6, 4.0));
  return (
    <Svg label="Three bars on a log scale, each shorter than the last: any eight squares, 4,426,165,368; one queen per row, 16,777,216; no shared column, 40,320. Then a diagonal check joins as the first real prune" h={300}>
      {PROG.map((p, i) => {
        const t0 = 0.3 + i * 1.0;
        const from = i === 0 ? 0 : wOf(PROG[i - 1].n);
        const g = easeInOut(seg(t, t0, t0 + 0.7));
        const y = 40 + i * 64;
        return (
          <g key={p.name} opacity={t >= t0 ? 1 : 0}>
            <T x={X0} y={y} s={12} f={C.latte}>{p.name}</T>
            <rect x={X0} y={y + 8} width={lerp(from, wOf(p.n), g)} height={18} fill={i === 2 ? C.crema : C.cinnamon} opacity={0.85} />
            <T x={X0 + W} y={y} s={13} f={C.crema} a="end" o={g >= 1 ? 1 : 0}>{p.s}</T>
          </g>
        );
      })}
      <g opacity={prune}>
        <T x={X0} y={232} s={12} f={C.caramel}>+ a shared diagonal: refuse it</T>
        <line x1={X0} y1={248} x2={X0 + wOf(40320) * (1 - 0.4 * prune)} y2={248} stroke={C.caramel} strokeWidth={3} strokeDasharray="6 4" />
      </g>
      <T x={300} y={288} s={13} f={C.caramel} a="middle" o={prune}>the first real prune</T>
    </Svg>
  );
}

// 4 · PredictNodeCount. A 4 × 4 board with its first row of four choices fanning out of the root, then a question mark.
// After answering: the pruned search's whole tree draws in, 17 nodes.
function q4Layout() {
  const leaves = Q4.map((n, i) => (n.kids.length === 0 ? i : -1)).filter((i) => i >= 0);
  const xs: number[] = new Array(Q4.length).fill(0);
  leaves.forEach((i, j) => (xs[i] = 40 + (j / (leaves.length - 1)) * 300));
  for (let d = 4; d >= 0; d--)
    Q4.forEach((n, i) => {
      if (n.q.length === d && n.kids.length) xs[i] = n.kids.reduce((s, k) => s + xs[k], 0) / n.kids.length;
    });
  return xs;
}
const Q4X = q4Layout();
const QY = (d: number) => 36 + d * 46;
function Q4Tree({ upto, cur = -1, o = 1, maxDepth = 4 }: { upto: number; cur?: number; o?: number; maxDepth?: number }) {
  return (
    <g opacity={o}>
      {Q4.map((n, i) => (i > 0 && i <= upto && n.q.length <= maxDepth ? <line key={`e${i}`} x1={Q4X[n.parent]} y1={QY(n.q.length - 1)} x2={Q4X[i]} y2={QY(n.q.length)} stroke={C.latte} strokeWidth={1.2} /> : null))}
      {Q4.map((n, i) => {
        if (i > upto || n.q.length > maxDepth) return null;
        const dead = !n.solution && n.kids.length === 0;
        const col = i === cur ? C.caramel : n.solution ? C.caramel : dead ? C.cherryText : C.crema;
        return <circle key={i} cx={Q4X[i]} cy={QY(n.q.length)} r={n.solution ? 7 : 5} fill={n.solution ? C.caramel : C.band} stroke={col} strokeWidth={1.6} />;
      })}
    </g>
  );
}
export function PredictNodeCount({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const fan = easeOut(seg(t, 0.3, 0.9));
  const upto = answered ? stepIdx(s, 0.2, 1.6, Q4.length) : -1;
  return (
    <Svg label="Four queens. The root fans out into its four first-row choices, then a question mark. After answering: the pruned search's whole tree draws in, 17 nodes, two of them solutions" h={300}>
      <g opacity={answered ? 1 : fan}>
        <Q4Tree upto={answered ? upto : Q4.length} maxDepth={answered ? 4 : 1} />
      </g>
      <Board x={420} y={60} n={4} cell={30} q={[]} />
      {!answered && <T x={190} y={270} s={16} f={C.caramel} a="middle" o={fan}>? nodes</T>}
      {answered && <T x={190} y={270} s={14} f={C.caramel} a="middle" o={upto >= Q4.length - 1 ? 1 : 0}>{`${Q4.length} nodes`}</T>}
    </Svg>
  );
}

// 5 · PrunedTree. Four queens in full: the search visits its 17 nodes in order, the board beside it showing each
// node's queens; dead ends turn red, the 2 solutions light. Then eight queens on one log axis: every placement,
// 4,426,165,368, against this search's 2,057 calls, first solution after 114.
export function PrunedTree({ t }: StepCtx) {
  const k = stepIdx(t, 0.3, 2.9, Q4.length);
  const node = k >= 0 ? Q4[k] : null;
  const dead = !!node && !node.solution && node.kids.length === 0;
  const tree = t < 3.1;
  const bars = easeOut(seg(t, 3.2, 3.8));
  const first = easeOut(seg(t, 4.0, 4.4));
  const W = 500, X0 = 50;
  const wOf = (n: number) => (log10(n) / 10) * W;
  return (
    <Svg label="Four queens in full: the search visits seventeen nodes in order while a board shows each node's queens; dead ends turn red and the two solutions light. Then eight queens on one log axis: every placement, 4,426,165,368, against this search's 2,057 calls, its first solution after 114" h={300}>
      {tree && (
        <g>
          <Q4Tree upto={k} cur={k} />
          <Board x={420} y={60} n={4} cell={30} q={node ? node.q : []} bad={dead} />
          {k >= 0 && <T x={480} y={210} s={12} f={dead ? C.cherryText : node?.solution ? C.caramel : C.latte} a="middle">{dead ? 'dead end' : node?.solution ? 'solution' : `row ${node!.q.length}`}</T>}
          <T x={40} y={286} s={13} f={C.crema} o={k >= Q4.length - 1 ? 1 : 0}>{`${Q4.length} nodes, ${Q4_SOLUTIONS} solutions`}</T>
        </g>
      )}
      {!tree && (
        <g opacity={bars}>
          <T x={300} y={40} s={13} f={C.crema} a="middle">eight queens, log scale</T>
          <T x={X0} y={92} s={12} f={C.cinnamon}>every placement</T>
          <rect x={X0} y={100} width={wOf(4426165368) * bars} height={20} fill={C.cinnamon} />
          <T x={X0 + W} y={92} s={13} f={C.cinnamon} a="end">4,426,165,368</T>
          <T x={X0} y={162} s={12} f={C.caramel}>this search: every solution</T>
          <rect x={X0} y={170} width={wOf(2057) * bars} height={20} fill={C.caramel} />
          <T x={X0 + wOf(2057) + 10} y={186} s={13} f={C.caramel}>2,057 calls, 92 found</T>
          <g opacity={first}>
            <line x1={X0 + wOf(114)} y1={200} x2={X0 + wOf(114)} y2={222} stroke={C.crema} strokeWidth={2} />
            <T x={X0 + wOf(114)} y={240} s={12} f={C.crema} a="middle">first at 114</T>
          </g>
        </g>
      )}
    </Svg>
  );
}

// 6 · UnsoundPrune. Calls to the first solution as the board grows, log scale: 114 at eight, 262 at twelve, then a jump.
// Then an 8 × 8 board whose edge squares below the first row are refused (red): solutions found falls from 92 to 0.
const FIRST_AT: [number, number][] = [[8, 114], [12, 262], [16, 10053], [20, 199636], [24, 411609]];
export function UnsoundPrune({ t }: StepCtx) {
  const X0 = 50, W = 230, Y0 = 220, H = 170;
  const px = (n: number) => X0 + ((n - 8) / 16) * W;
  const py = (v: number) => Y0 - (log10(v) / 6) * H;
  const k = stepIdx(t, 0.3, 1.8, FIRST_AT.length);
  const ref = easeOut(seg(t, 2.2, 2.6));
  const zero = t >= 3.3;
  return (
    <Svg label="Calls to the first solution as the board grows, on a log scale: 114 at eight queens, 262 at twelve, then a jump at sixteen and beyond; not smooth. Then an eight by eight board whose edge squares below the first row are refused, in red: solutions found drop from 92 to none" h={300}>
      <line x1={X0} y1={Y0} x2={X0 + W} y2={Y0} stroke={C.line} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y0 - H} stroke={C.line} />
      <T x={X0 + W} y={Y0 + 20} s={12} f={C.latte} a="end">queens →</T>
      <T x={X0} y={Y0 - H - 10} s={12} f={C.latte}>calls to first</T>
      {FIRST_AT.map(([n, v], i) => (i <= k ? (
        <g key={n}>
          {i > 0 && <line x1={px(FIRST_AT[i - 1][0])} y1={py(FIRST_AT[i - 1][1])} x2={px(n)} y2={py(v)} stroke={C.crema} strokeWidth={1.6} />}
          <circle cx={px(n)} cy={py(v)} r={4} fill={i < 2 ? C.caramel : C.crema} />
          {i < 2 && <T x={px(n) + 8} y={py(v) + 18} s={12} f={C.caramel}>{`${n}: ${v}`}</T>}
        </g>
      ) : null))}
      <Board x={340} y={30} n={8} cell={24} q={[]} refuse={ref > 0} o={t >= 2.0 ? 1 : 0} />
      <T x={436} y={248} s={12} f={C.cherryText} a="middle" o={ref}>edge squares refused</T>
      {t >= 2.6 && <T x={436} y={276} s={14} f={zero ? C.cherryText : C.crema} a="middle">{zero ? 'solutions: 0 of 92' : 'solutions: 92'}</T>}
    </Svg>
  );
}

// 7 · SudokuGrid. The 9 × 9 grid; one square lights, then its row, its column and its box, the 20 peers ringing in
// turn. Beside it: 81 squares, 27 units, 20 peers.
const FOCUS = 'E5';
export function SudokuGrid({ t }: StepCtx) {
  const parts = [
    PEERS[FOCUS].filter((p) => p[0] === FOCUS[0]),
    PEERS[FOCUS].filter((p) => p[1] === FOCUS[1]),
    PEERS[FOCUS].filter((p) => p[0] !== FOCUS[0] && p[1] !== FOCUS[1]),
  ];
  const k = stepIdx(t, 0.8, 2.6, 3);
  const lit = new Set(parts.filter((_, i) => i <= k).flat());
  const a = easeOut(seg(t, 0.2, 0.6));
  const facts = [`${SQ.length} squares`, `${UNITLIST.length} units`, `${PEERS[FOCUS].length} peers each`];
  return (
    <Svg label="The nine by nine grid. One square lights, then its row, its column and its box: twenty peers ring in turn. Beside it: 81 squares, 27 units, 20 peers for every square" h={300}>
      <Grid x={40} y={20} cell={26} show={(s) => (s === FOCUS ? { fill: C.caramel, ring: C.caramel } : lit.has(s) ? { fill: C.cocoa, ring: C.cinnamon } : undefined)} />
      {facts.map((f, i) => (
        <T key={f} x={330} y={80 + i * 50} s={14} f={i === 2 ? C.caramel : C.crema} o={i === 0 ? a : i === 1 ? easeOut(seg(t, 1.2, 1.6)) : k >= 2 ? 1 : 0}>{f}</T>
      ))}
      <T x={330} y={250} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>one digit placed:</T>
      <T x={330} y={272} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>20 squares should know</T>
    </Svg>
  );
}

// 8 · ConstraintPropagation. The hard grid's givens appear; propagation then decides square after square until it
// stalls at 20 decided; the 61 still open show how many candidates each keeps. Beside it: 20 decided, 61 uncertain,
// about 4.6 × 10³⁸ combinations.
export function ConstraintPropagation({ t }: StepCtx) {
  const shown = stepIdx(t, 0.3, 2.4, PROP_ORDER.length);
  const on = new Set(PROP_ORDER.filter((_, i) => i <= shown));
  const cands = easeOut(seg(t, 2.6, 3.0));
  const a = easeOut(seg(t, 3.2, 3.5));
  const b = easeOut(seg(t, 3.7, 4.0));
  const c = easeOut(seg(t, 4.2, 4.5));
  return (
    <Svg label="The hard grid's givens appear; the two rules then decide square after square until they stall at twenty decided. The sixty-one still open each show how many candidates they keep. Beside it: 20 decided, 61 uncertain, about 4.6 times ten to the thirty-eighth combinations" h={300}>
      <Grid x={40} y={20} cell={26} show={(s) => {
        if (on.has(s)) return { text: PROP[s], f: GIVENS.includes(s) ? C.crema : C.caramel, fill: GIVENS.includes(s) ? C.roast : C.cocoa };
        if (cands > 0 && PROP[s].length > 1) return { text: String(PROP[s].length), f: C.taupe };
        return undefined;
      }} />
      <T x={330} y={70} s={12} f={C.latte} o={a}>decided</T>
      <T x={330} y={92} s={14} f={C.caramel} o={a}>{String(DECIDED.length)}</T>
      <T x={330} y={140} s={12} f={C.latte} o={b}>uncertain</T>
      <T x={330} y={162} s={14} f={C.crema} o={b}>{String(UNCERTAIN.length)}</T>
      <T x={330} y={210} s={12} f={C.latte} o={c}>combinations left</T>
      <T x={330} y={232} s={14} f={C.cherryText} o={c}>4.6 × 10³⁸</T>
    </Svg>
  );
}

// 9 · SearchPlusPropagation. The propagated grid; search rings the square it branches on, nine of them in turn, each
// try ticking a mark; at the 25th the whole grid fills.
export function SearchPlusPropagation({ t }: StepCtx) {
  const k = stepIdx(t, 0.3, 2.8, BRANCHED.length);
  const ticks = stepIdx(t, 0.3, 2.8, ATTEMPTS) + 1;
  const done = t >= 3.0;
  const fill = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="The propagated grid. Search rings the square it branches on, nine squares in turn, a mark ticking for every candidate tried; after 25 tries the whole grid fills in" h={300}>
      <Grid x={40} y={20} cell={26} show={(s) => {
        const bi = BRANCHED.indexOf(s);
        if (done) return { text: SOLVED[s], f: PROP[s].length === 1 ? C.crema : C.caramel, fill: PROP[s].length === 1 ? C.roast : C.cocoa };
        if (bi >= 0 && bi <= k) return { ring: bi === k ? C.caramel : C.latte, fill: C.cocoa };
        if (PROP[s].length === 1) return { text: PROP[s], f: C.crema };
        return undefined;
      }} />
      <g opacity={done ? fill : 1}>
        <T x={330} y={60} s={12} f={C.latte}>tried</T>
        {Array.from({ length: Math.max(0, ticks) }, (_, i) => (
          <line key={i} x1={330 + (i % 10) * 22} y1={76 + Math.floor(i / 10) * 26} x2={330 + (i % 10) * 22} y2={94 + Math.floor(i / 10) * 26} stroke={C.caramel} strokeWidth={3} />
        ))}
      </g>
      <T x={330} y={190} s={14} f={C.caramel} o={fill}>{`${ATTEMPTS} tried`}</T>
      <T x={330} y={220} s={14} f={C.crema} o={fill}>{`${BRANCHED.length} squares branched`}</T>
      <T x={330} y={250} s={12} f={C.latte} o={fill}>propagation did the rest</T>
    </Svg>
  );
}

// 10 · PredictOrdering. The bare grid with two candidates for the next square: the first empty one (blue) and the one
// with the fewest candidates (white). After answering: the fewest-candidates square stays lit, the other fades.
export function PredictOrdering({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.3, 0.8));
  const b = easeOut(seg(t, 1.0, 1.5));
  const fade = answered ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="The bare grid with two choices for the next square: the first empty one, in blue, and the one with the fewest candidates, in white. After answering: the fewest-candidates square stays lit and the first-empty one fades" h={300}>
      <Grid x={40} y={20} cell={26} show={(sq) => {
        if (START[sq]) return { text: START[sq]!, f: C.crema };
        if (sq === FIRST_EMPTY && a > 0) return { ring: fade >= 1 ? C.mocha : C.cinnamon, fill: C.cocoa };
        if (sq === MRV_FIRST && b > 0) return { ring: C.caramel, fill: C.cocoa };
        return undefined;
      }} />
      <T x={330} y={90} s={13} f={C.cinnamon} o={a * (1 - 0.7 * fade)}>first empty square</T>
      <T x={330} y={130} s={13} f={C.caramel} o={b}>fewest candidates</T>
      {answered && <T x={330} y={200} s={13} f={C.caramel} o={fade}>the order decides</T>}
    </Svg>
  );
}

// 11 · OrderingMeasured. No propagation, plain peer checks. Two bars grow on one log axis of placements: fewest
// candidates stops at 481, solved; first empty keeps going and is cut off at 3,000,000, unsolved.
export function OrderingMeasured({ t }: StepCtx) {
  const X0 = 50, W = 480;
  const wOf = (n: number) => (log10(n) / 7) * W;
  const g = easeInOut(seg(t, 0.4, 3.2));
  const reach = 7 * g;
  const mrvDone = reach >= log10(481);
  const feDone = reach >= log10(3000000);
  return (
    <Svg label="No propagation, only plain checks against peers. Two bars grow on one log axis of placements: fewest candidates first stops at 481, solved; first empty square keeps going and is cut off at 3,000,000, still unsolved" h={300}>
      <T x={300} y={30} s={12} f={C.latte} a="middle">placements, log scale, peer checks only</T>
      <T x={X0} y={82} s={12} f={C.caramel}>fewest candidates</T>
      <rect x={X0} y={90} width={wOf(Math.min(481, 10 ** reach))} height={22} fill={C.caramel} />
      {mrvDone && <T x={X0 + wOf(481) + 10} y={106} s={13} f={C.caramel}>481, solved</T>}
      <T x={X0} y={172} s={12} f={C.cinnamon}>first empty square</T>
      <rect x={X0} y={180} width={wOf(Math.min(3000000, 10 ** reach))} height={22} fill={C.cinnamon} />
      {feDone && <line x1={X0 + wOf(3000000)} y1={170} x2={X0 + wOf(3000000)} y2={212} stroke={C.cherryText} strokeWidth={2.5} />}
      {feDone && <T x={X0 + wOf(3000000)} y={236} s={13} f={C.cherryText} a="end">3,000,000, unsolved</T>}
    </Svg>
  );
}

// 12 · HeavyTail. Norvig's thirty runs on one log time axis: 27 dots under 0.02 s, then 3 far out near 190 s. Then the
// million-puzzle line, and this topic's own thirty seeded runs, blue, on their own axis: the same spread, smaller.
const OWN = [9, 11, 11, 14, 17, 17, 24, 24, 24, 25, 27, 28, 28, 32, 36, 43, 43, 43, 70, 70, 76, 77, 79, 81, 82, 85, 92, 92, 92, 94];
export function HeavyTail({ t }: StepCtx) {
  const X0 = 50, W = 500;
  const nx = (sec: number) => X0 + ((log10(sec) + 3) / 6) * W; // 0.001 s to 1,000 s
  const fast = stepIdx(t, 0.3, 1.4, 27);
  const slow = stepIdx(t, 1.6, 2.2, 3);
  const mil = easeOut(seg(t, 2.5, 2.9));
  const own = stepIdx(t, 3.2, 4.4, OWN.length);
  const ox = (a: number) => X0 + ((log10(a) - log10(5)) / (log10(200) - log10(5))) * W;
  return (
    <Svg label="Norvig's thirty runs on one log time axis: twenty-seven dots land under 0.02 seconds, then three far out near 190 seconds. Across a million puzzles, more than 99.95 percent under 0.1 seconds, a few far longer. Then this topic's own thirty seeded runs, in blue, on their own axis: the same uneven spread, smaller" h={300}>
      <T x={X0} y={28} s={12} f={C.latte}>Norvig: 30 runs, seconds, log scale</T>
      <line x1={X0} y1={80} x2={X0 + W} y2={80} stroke={C.line} />
      {Array.from({ length: 27 }, (_, i) => (i <= fast ? <circle key={i} cx={nx(0.004 + (i % 9) * 0.0018)} cy={66 - Math.floor(i / 9) * 9} r={3.2} fill={C.crema} /> : null))}
      {Array.from({ length: 3 }, (_, i) => (i <= slow ? <circle key={i} cx={nx(190) + (i - 1) * 9} cy={66} r={3.6} fill={C.cherryText} /> : null))}
      <T x={nx(0.02)} y={100} s={12} f={C.crema} a="middle" o={fast >= 26 ? 1 : 0}>27 under 0.02 s</T>
      <T x={nx(190)} y={100} s={12} f={C.cherryText} a="middle" o={slow >= 2 ? 1 : 0}>3 near 190 s</T>
      <T x={X0} y={140} s={12} f={C.latte} o={mil}>a million puzzles: over 99.95% under 0.1 s</T>
      <T x={X0} y={196} s={12} f={C.cinnamon} o={own >= 0 ? 1 : 0}>this topic: 30 seeded runs, tries, log scale</T>
      <line x1={X0} y1={250} x2={X0 + W} y2={250} stroke={C.line} opacity={own >= 0 ? 1 : 0} />
      {OWN.map((a, i) => {
        if (i > own) return null;
        const same = OWN.slice(0, i).filter((b) => Math.abs(ox(b) - ox(a)) < 6).length;
        return <circle key={i} cx={ox(a)} cy={238 - same * 8} r={3} fill={C.cinnamon} />;
      })}
      <T x={300} y={286} s={13} f={C.crema} a="middle" o={own >= OWN.length - 1 ? 1 : 0}>the same uneven shape, smaller</T>
    </Svg>
  );
}

// 13 · Handoff. The four-queens tree: a dead branch is cut away (red, then gone) and the tree shrinks; then it folds
// down into one row of cells, and two pointers walk in from the ends: two pointers, next.
export function Handoff({ t }: StepCtx) {
  const cut = easeOut(seg(t, 0.4, 1.0));
  const fold = easeInOut(seg(t, 1.6, 2.6));
  const walk = seg(t, 2.8, 4.0);
  const cap = easeOut(seg(t, 1.0, 1.4));
  const next = easeOut(seg(t, 3.0, 3.4));
  const n = Q4.length;
  const cellX = (i: number) => 300 - (n * 26) / 2 + i * 26;
  const lo = Math.round(walk * 6), hi = n - 1 - Math.round(walk * 6);
  return (
    <Svg label="The four-queens tree: its dead branches turn red and are cut away, and the tree shrinks. Then it folds down into one row of cells, and two pointers walk in from the two ends: two pointers, next" h={300}>
      {fold < 1 && (
        <g opacity={1 - fold}>
          {Q4.map((nd, i) => (i > 0 ? <line key={`e${i}`} x1={Q4X[nd.parent] + 110} y1={QY(nd.q.length - 1)} x2={Q4X[i] + 110} y2={QY(nd.q.length)} stroke={!nd.solution && nd.kids.length === 0 ? C.cherryText : C.latte} strokeWidth={1.2} opacity={!nd.solution && nd.kids.length === 0 ? 1 - cut : 1} /> : null))}
        </g>
      )}
      {Q4.map((nd, i) => {
        const dead = !nd.solution && nd.kids.length === 0;
        const x = lerp(Q4X[i] + 110, cellX(i) + 13, fold);
        const y = lerp(QY(nd.q.length), 150, fold);
        return <circle key={i} cx={x} cy={y} r={5} fill={C.band} stroke={dead && fold <= 0 ? C.cherryText : C.crema} strokeWidth={1.6} opacity={dead ? Math.max(1 - cut, fold) : 1} />;
      })}
      {fold >= 1 && Array.from({ length: n }, (_, i) => <rect key={i} x={cellX(i)} y={137} width={26} height={26} fill="none" stroke={C.mocha} />)}
      {fold >= 1 && walk > 0 && (
        <g>
          <path d={`M${cellX(lo) + 13} 178 l-6 10 l12 0 Z`} fill={C.caramel} />
          <path d={`M${cellX(hi) + 13} 178 l-6 10 l12 0 Z`} fill={C.caramel} />
        </g>
      )}
      {next <= 0 && <T x={300} y={286} s={13} f={C.crema} a="middle" o={cap}>prune early, branch on the hardest</T>}
      {next > 0 && <T x={300} y={286} s={13} f={C.caramel} a="middle" o={next}>no tree at all: two pointers, next</T>}
    </Svg>
  );
}
