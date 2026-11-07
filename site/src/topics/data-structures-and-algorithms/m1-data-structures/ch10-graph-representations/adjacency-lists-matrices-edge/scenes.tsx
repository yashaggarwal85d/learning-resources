import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the graph and its structures; latte = labels; caramel = the thing to look at
// (the probe, the lookup, the cheap operation); cinnamon = the compared alternative; cherryText = the lost weight,
// the miss, the cost. The graph is examples.py's own: six vertices, ten weighted directed edges, A->B twice (4,
// then 7). Every printed number is examples.py's (its edges, its asserted probe counts and space counts).

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

type Pt = [number, number];
const VS = ['A', 'B', 'C', 'D', 'E', 'F'];
const ES: [string, string, number][] = [
  ['A', 'B', 4], ['A', 'C', 2], ['A', 'B', 7], ['B', 'C', 3], ['B', 'D', 5],
  ['C', 'D', 1], ['C', 'E', 6], ['D', 'E', 2], ['D', 'F', 8], ['E', 'F', 3],
];
const ADJ: Record<string, [string, number][]> = Object.fromEntries(VS.map((v) => [v, ES.filter((e) => e[0] === v).map((e) => [e[1], e[2]] as [string, number])]));

/** An arrow from p to q (stopping short of both vertex circles), optionally bowed sideways. */
function Arrow({ p, q, bow = 0, c = C.latte, w = 1.3, o = 1, k = 1, r = 15 }: { p: Pt; q: Pt; bow?: number; c?: string; w?: number; o?: number; k?: number; r?: number }) {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const L = Math.hypot(dx, dy);
  const ux = dx / L;
  const uy = dy / L;
  const a: Pt = [p[0] + ux * r, p[1] + uy * r];
  const b: Pt = [q[0] - ux * (r + 2), q[1] - uy * (r + 2)];
  const m: Pt = [(a[0] + b[0]) / 2 - uy * bow, (a[1] + b[1]) / 2 + ux * bow];
  // point at k along the quadratic
  const at = (s: number): Pt => [(1 - s) ** 2 * a[0] + 2 * (1 - s) * s * m[0] + s * s * b[0], (1 - s) ** 2 * a[1] + 2 * (1 - s) * s * m[1] + s * s * b[1]];
  const end = at(k);
  const pre = at(Math.max(0, k - 0.05));
  const ang = Math.atan2(end[1] - pre[1], end[0] - pre[0]);
  const pts = Array.from({ length: 13 }, (_, i) => at((i / 12) * k));
  return (
    <g opacity={o}>
      <polyline points={pts.map((p2) => p2.join(',')).join(' ')} fill="none" stroke={c} strokeWidth={w} />
      {k > 0.05 && <path d={`M ${end[0]} ${end[1]} l ${-8 * Math.cos(ang - 0.4)} ${-8 * Math.sin(ang - 0.4)} M ${end[0]} ${end[1]} l ${-8 * Math.cos(ang + 0.4)} ${-8 * Math.sin(ang + 0.4)}`} stroke={c} strokeWidth={w} fill="none" />}
    </g>
  );
}

function Vx({ p, v, c = C.crema, o = 1, ring = false }: { p: Pt; v: string; c?: string; o?: number; ring?: boolean }) {
  return (
    <g opacity={o}>
      <circle cx={p[0]} cy={p[1]} r={15} fill={C.roast} stroke={c} strokeWidth={ring ? 2.4 : 1.4} />
      <T x={p[0]} y={p[1] + 5} s={14} f={c} a="middle">{v}</T>
    </g>
  );
}

const GP: Record<string, Pt> = { A: [50, 150], B: [140, 80], C: [140, 220], D: [230, 150], E: [320, 220], F: [320, 80] };
const bowOf = (i: number) => (i === 0 ? -14 : i === 2 ? 14 : 0);

/** The whole graph, edges drawn in over [from, to]. */
function Graph({ t, from = 0, to = 0.01, hot = [] as number[], hotC = C.caramel, scale = 1, dx = 0, dy = 0 }: { t: number; from?: number; to?: number; hot?: number[]; hotC?: string; scale?: number; dx?: number; dy?: number }) {
  const P = (v: string): Pt => [GP[v][0] * scale + dx, GP[v][1] * scale + dy];
  return (
    <>
      {ES.map(([u, v], i) => {
        const k = easeOut(seg(t, from + (i / ES.length) * (to - from), from + ((i + 1) / ES.length) * (to - from)));
        return <Arrow key={i} p={P(u)} q={P(v)} bow={bowOf(i) * scale} k={k} o={k > 0 ? 1 : 0} c={hot.includes(i) ? hotC : C.latte} w={hot.includes(i) ? 2.2 : 1.3} r={15 * scale} />;
      })}
      {VS.map((v) => (scale === 1 ? <Vx key={v} p={P(v)} v={v} /> : (
        <g key={v}>
          <circle cx={P(v)[0]} cy={P(v)[1]} r={15 * scale} fill={C.roast} stroke={C.crema} strokeWidth={1.2} />
          <T x={P(v)[0]} y={P(v)[1] + 4} s={12} f={C.crema} a="middle">{v}</T>
        </g>
      )))}
    </>
  );
}

// 1 · Opening. The graph draws in, edge by edge (A->B twice). Then one question, "A -> F?", is put to three
// structures on the right; each answers with a different amount of work (drawn as tick lengths, no numbers).
export function Opening({ t }: StepCtx) {
  const q = easeOut(seg(t, 1.6, 1.9));
  const reps: [string, number][] = [['adjacency list', 3], ['matrix', 1], ['edge list', 10]];
  return (
    <Svg label="A six-vertex weighted directed graph with two edges from A to B; the question whether A connects to F, asked of three structures, costs each a different amount of work" h={290}>
      <Graph t={t} from={0.2} to={1.4} />
      <T x={400} y={40} s={14} f={C.caramel} o={q}>A &rarr; F ?</T>
      {reps.map(([name, cost], i) => {
        const k = easeOut(seg(t, 2.0 + i * 0.35, 2.4 + i * 0.35));
        return (
          <g key={name} opacity={k}>
            <T x={400} y={86 + i * 52} s={13} f={C.crema}>{name}</T>
            <rect x={400} y={94 + i * 52} width={cost * 16 * k} height={10} rx={2} fill={i === 1 ? C.caramel : C.cinnamon} />
          </g>
        );
      })}
      <T x={30} y={280} s={13} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>one answer, three prices</T>
    </Svg>
  );
}

// 2 · The adjacency list. One chain per vertex slides in (F's is empty but still there). A's chain is read straight
// through: its neighbours. Then "A -> F?": a probe walks A's chain, B, C, B, and finds no F: 3 probes.
export function ListReveal({ t }: StepCtx) {
  const RY = (i: number) => 40 + i * 38;
  const read = (j: number) => clamp(1 - Math.abs(t - (1.6 + j * 0.25)) / 0.2);
  const probeAt = (j: number) => 2.6 + j * 0.35;
  const probe = [0, 1, 2].filter((j) => t >= probeAt(j)).length - 1;
  const miss = easeOut(seg(t, probeAt(2) + 0.35, probeAt(2) + 0.6));
  return (
    <Svg label="One chain of neighbours per vertex, F's empty; A's chain reads off its neighbours B, C, B; testing A to F walks the whole chain and misses after 3 probes" h={290}>
      {VS.map((v, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15));
        return (
          <g key={v} opacity={k}>
            <Vx p={[44, RY(i) + 12]} v={v} c={v === 'A' && t > 1.4 ? C.caramel : C.crema} />
            <line x1={62} y1={RY(i) + 12} x2={80} y2={RY(i) + 12} stroke={C.latte} strokeWidth={1.2} />
            {ADJ[v].length === 0 && <T x={86} y={RY(i) + 17} s={12} f={C.taupe}>(empty)</T>}
            {ADJ[v].map(([w, wt], j) => {
              const kk = easeOut(seg(t, 0.4 + i * 0.15 + j * 0.1, 0.7 + i * 0.15 + j * 0.1));
              const hot = v === 'A' && (read(j) > 0 || (probe === j && t < probeAt(2) + 0.5));
              const x = 84 + j * 62;
              return (
                <g key={j} opacity={kk}>
                  <rect x={x} y={RY(i)} width={50} height={24} rx={3} fill={C.roast} stroke={hot ? C.caramel : C.latte} strokeWidth={hot ? 2 : 1} />
                  <T x={x + 14} y={RY(i) + 17} s={13} f={hot ? C.caramel : C.crema} a="middle">{w}</T>
                  <T x={x + 36} y={RY(i) + 17} s={12} f={C.latte} a="middle">{wt}</T>
                  {j < ADJ[v].length - 1 && <line x1={x + 50} y1={RY(i) + 12} x2={x + 62} y2={RY(i) + 12} stroke={C.latte} strokeWidth={1} />}
                </g>
              );
            })}
          </g>
        );
      })}
      <T x={300} y={64} s={13} f={C.caramel} o={easeOut(seg(t, 1.4, 1.7))}>A&apos;s neighbours: read it</T>
      <T x={300} y={124} s={13} f={C.crema} o={easeOut(seg(t, 2.4, 2.7))}>A &rarr; F ? walk it</T>
      {[0, 1, 2].map((j) => (
        <T key={j} x={300 + j * 28} y={150} s={14} f={C.cherryText} o={easeOut(seg(t, probeAt(j) + 0.15, probeAt(j) + 0.3))}>&times;</T>
      ))}
      <T x={300} y={180} s={13} f={C.cherryText} o={miss}>no F: 3 probes</T>
    </Svg>
  );
}

// The 6 x 6 matrix geometry.
const MX = 70;
const MY = 50;
const MC = 34;
const cellXY = (u: string, v: string): Pt => [MX + VS.indexOf(v) * MC, MY + VS.indexOf(u) * MC];
function MatrixFrame({ o = 1 }: { o?: number }) {
  return (
    <g opacity={o}>
      {VS.map((v, i) => (
        <g key={v}>
          <T x={MX + i * MC + MC / 2} y={MY - 8} s={12} f={C.latte} a="middle">{v}</T>
          <T x={MX - 10} y={MY + i * MC + MC / 2 + 4} s={12} f={C.latte} a="end">{v}</T>
        </g>
      ))}
      {Array.from({ length: 36 }, (_, k) => (
        <rect key={k} x={MX + (k % 6) * MC} y={MY + Math.floor(k / 6) * MC} width={MC - 3} height={MC - 3} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} />
      ))}
    </g>
  );
}

// 3 · Predict. The matrix with every other edge's weight in its cell, and the A->B cell holding 4; the second A->B
// edge, weight 7, waits above it, pulsing. What happens? After answering: 7 takes the cell, 4 falls out (red), and
// a count of 2 sits beside it.
export function MatrixPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const swap = answered ? easeInOut(seg(s, 0.2, 0.8)) : 0;
  const [ax, ay] = cellXY('A', 'B');
  return (
    <Svg label="A six by six matrix with each edge's weight in its cell; the A to B cell holds 4 while a second A to B edge of weight 7 waits; after answering, 7 overwrites 4 and only a count of 2 records both" h={300}>
      <MatrixFrame />
      {ES.filter((_, i) => i !== 0 && i !== 2).map(([u, v, w]) => {
        const [x, y] = cellXY(u, v);
        return <T key={`${u}${v}`} x={x + MC / 2 - 1} y={y + MC / 2 + 4} s={13} f={C.crema} a="middle">{w}</T>;
      })}
      <rect x={ax} y={ay} width={MC - 3} height={MC - 3} rx={2} fill="none" stroke={answered ? C.caramel : C.crema} strokeWidth={2} />
      {swap < 0.5 ? (
        <T x={ax + MC / 2 - 1} y={ay + MC / 2 + 4} s={13} f={C.crema} a="middle" o={1 - 2 * swap}>4</T>
      ) : (
        <T x={ax + MC / 2 - 1} y={ay + MC / 2 + 4} s={13} f={C.caramel} a="middle" o={2 * swap - 1}>7</T>
      )}
      {!answered && (
        <g opacity={pulse}>
          <rect x={ax} y={4} width={MC - 3} height={24} rx={3} fill={C.roast} stroke={C.caramel} strokeWidth={1.4} />
          <T x={ax + MC / 2 - 1} y={21} s={13} f={C.caramel} a="middle">7</T>
        </g>
      )}
      <T x={340} y={70} s={13} f={C.latte}>A &rarr; B, twice:</T>
      <T x={340} y={94} s={13} f={C.crema}>weights 4 and 7</T>
      {answered && <T x={340} y={140} s={13} f={C.caramel} o={easeOut(seg(s, 0.8, 1.1))}>cell keeps 7</T>}
      {answered && <T x={340} y={164} s={13} f={C.cherryText} o={easeOut(seg(s, 1.0, 1.3))}>4 is gone</T>}
      {answered && <T x={340} y={188} s={13} f={C.crema} o={easeOut(seg(s, 1.2, 1.5))}>a count keeps 2</T>}
      {!answered && <T x={30} y={290} s={15} f={C.cherryText} o={pulse}>one cell, two edges?</T>}
    </Svg>
  );
}

// 4 · The matrix, filled in edge order. Each edge writes its weight into its cell; the third edge, A->B again,
// writes 7 over the 4 the first one left (flash; 4 drops away). Then "A -> F?" is one cell read, empty; and A's
// neighbours mean scanning its whole row, all six cells.
export function MatrixReveal({ t }: StepCtx) {
  const at = (i: number) => 0.3 + i * 0.16;
  const [ax, ay] = cellXY('A', 'B');
  const over = easeOut(seg(t, at(2), at(2) + 0.3));
  const look = easeOutBack(seg(t, 2.2, 2.45));
  const scan = (j: number) => clamp(1 - Math.abs(t - (3.0 + j * 0.12)) / 0.18);
  const [fx, fy] = cellXY('A', 'F');
  return (
    <Svg label="Edges write their weights into the matrix in order, and the second A to B edge's 7 overwrites the first's 4; testing A to F is one cell read; listing A's neighbours scans the whole row of six" h={300}>
      <MatrixFrame />
      {VS.map((_, j) => <rect key={j} x={MX + j * MC} y={MY} width={MC - 3} height={MC - 3} rx={2} fill={C.caramel} opacity={0.35 * scan(j)} />)}
      {ES.map(([u, v, w], i) => {
        if (i === 0) return null;
        const [x, y] = cellXY(u, v);
        const k = easeOutBack(seg(t, at(i), at(i) + 0.25));
        return k > 0.001 ? <T key={i} x={x + MC / 2 - 1} y={y + MC / 2 + 4} s={13} f={i === 2 ? C.caramel : C.crema} a="middle" o={clamp(k)}>{w}</T> : null;
      })}
      {t >= at(0) && <T x={ax + MC / 2 - 1} y={ay + MC / 2 + 4 + over * 50} s={13} f={over > 0 ? C.cherryText : C.crema} a="middle" o={over > 0 ? 1 - over : clamp(easeOut(seg(t, at(0), at(0) + 0.25)))}>4</T>}
      <rect x={fx} y={fy} width={MC - 3} height={MC - 3} rx={2} fill="none" stroke={C.caramel} strokeWidth={2.4} opacity={clamp(look)} />
      <T x={340} y={70} s={13} f={C.caramel} o={easeOut(seg(t, 2.3, 2.6))}>A &rarr; F ? one read: empty</T>
      <T x={340} y={110} s={13} f={C.crema} o={easeOut(seg(t, 2.9, 3.2))}>A&apos;s neighbours:</T>
      <T x={340} y={134} s={13} f={C.crema} o={easeOut(seg(t, 3.0, 3.3))}>scan all 6 in the row</T>
      <T x={340} y={190} s={13} f={C.latte} o={easeOut(seg(t, 3.4, 3.7))}>36 cells for 6 vertices</T>
    </Svg>
  );
}

// 5 · The edge list. Ten rows, one per edge, slide in (A B 4 and A B 7 both kept). Beside it, what F costs each
// structure: the list keeps an empty chain for F, the matrix a whole row of 6 empty cells, the edge list nothing.
export function EdgeListReveal({ t }: StepCtx) {
  const RY = (i: number) => 32 + i * 24;
  const f = (j: number) => easeOut(seg(t, 2.2 + j * 0.45, 2.5 + j * 0.45));
  return (
    <Svg label="The edge list is ten rows, one per edge, both A to B edges kept; F, with no out-edges, still costs the adjacency list an empty chain and the matrix a row of six empty cells, but costs the edge list nothing" h={290}>
      {ES.map(([u, v, w], i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.13, 0.45 + i * 0.13));
        const x = lerp(-60, 0, k);
        return (
          <g key={i} opacity={k} transform={`translate(${x} 0)`}>
            <rect x={30} y={RY(i) - 15} width={120} height={20} rx={2} fill={C.roast} stroke={i === 0 || i === 2 ? C.caramel : C.mocha} strokeWidth={1} />
            <T x={44} y={RY(i)} s={13} f={C.crema}>{u}</T>
            <T x={74} y={RY(i)} s={13} f={C.crema}>{v}</T>
            <T x={114} y={RY(i)} s={13} f={C.latte}>{w}</T>
          </g>
        );
      })}
      <T x={200} y={30} s={13} f={C.latte} o={easeOut(seg(t, 1.9, 2.2))}>what F costs, with no out-edges:</T>
      <g opacity={f(0)}>
        <T x={200} y={76} s={13} f={C.crema}>list</T>
        <Vx p={[290, 70]} v="F" />
        <rect x={316} y={60} width={40} height={20} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1} strokeDasharray="3 3" />
        <T x={370} y={76} s={12} f={C.cherryText}>empty chain</T>
      </g>
      <g opacity={f(1)}>
        <T x={200} y={136} s={13} f={C.crema}>matrix</T>
        {Array.from({ length: 6 }, (_, j) => <rect key={j} x={290 + j * 26} y={120} width={22} height={22} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1} />)}
        <T x={450} y={136} s={12} f={C.cherryText}>row of 6</T>
      </g>
      <g opacity={f(2)}>
        <T x={200} y={196} s={13} f={C.crema}>edge list</T>
        <T x={310} y={196} s={13} f={C.caramel}>nothing</T>
      </g>
      <T x={200} y={260} s={13} f={C.latte} o={easeOut(seg(t, 3.6, 3.9))}>10 rows, one per edge</T>
    </Svg>
  );
}

// 6 · A DAG. The vertices slide from their map positions into one line, in examples.py's topological order
// (A, B, C, D, E, F); every edge, redrawn as an arc above the line, points right. A dashed back-arrow shows what a
// cycle would need: one edge pointing left, which no order can satisfy.
const TOPO = ['A', 'B', 'C', 'D', 'E', 'F'];
export function DAGReveal({ t }: StepCtx) {
  const slide = easeInOut(seg(t, 0.3, 1.5));
  const P = (v: string): Pt => [lerp(GP[v][0] + 80, 60 + TOPO.indexOf(v) * 92, slide), lerp(GP[v][1] - 30, 190, slide)];
  const ok = easeOut(seg(t, 1.8, 2.2));
  const back = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="The vertices slide into one line in topological order A, B, C, D, E, F, and every edge points right; a cycle would need an edge pointing back, which no ordering allows" h={290}>
      {ES.map(([u, v], i) => {
        const p = P(u);
        const q = P(v);
        const span = Math.abs(TOPO.indexOf(v) - TOPO.indexOf(u));
        const bow = lerp(bowOf(i), -(16 + span * 16) - (i === 2 ? 10 : 0), slide);
        return <Arrow key={i} p={p} q={q} bow={bow} c={ok > 0 ? C.caramel : C.latte} w={1.4} />;
      })}
      {VS.map((v) => <Vx key={v} p={P(v)} v={v} />)}
      <T x={30} y={260} s={13} f={C.caramel} o={ok}>every arrow points right</T>
      <g opacity={back}>
        <path d={`M ${60 + 5 * 92} 210 Q ${60 + 2.5 * 92} 270 ${60 + 18} 210`} fill="none" stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="5 4" />
        <T x={330} y={286} s={12} f={C.cherryText}>a cycle would need this</T>
      </g>
    </Svg>
  );
}

// 7 · Which one, for what. Three panels in turn. Walking: a search spreads from A through the graph, each step
// reading a chain (list). Asking one pair again and again: one matrix cell flashes, flashes, flashes (matrix).
// Building: the edge list's rows pour into chains (edge list).
export function WhichRepReveal({ t }: StepCtx) {
  const p1 = easeOut(seg(t, 0.2, 0.5));
  const p2 = easeOut(seg(t, 1.6, 1.9));
  const p3 = easeOut(seg(t, 2.9, 3.2));
  const wave = (v: string) => {
    const lvl: Record<string, number> = { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3 };
    return t >= 0.5 + lvl[v] * 0.25;
  };
  return (
    <Svg label="Walking neighbour to neighbour suits the adjacency list; asking about one pair again and again suits the matrix; building the other structures starts from the edge list" h={300}>
      <g opacity={p1}>
        <T x={30} y={24} s={13} f={C.caramel}>walk neighbours: list</T>
        <g transform="translate(20 20) scale(0.55)">
          {ES.map(([u, v], i) => <Arrow key={i} p={GP[u]} q={GP[v]} bow={bowOf(i)} c={wave(u) && wave(v) ? C.caramel : C.mocha} w={2.4} />)}
          {VS.map((v) => <circle key={v} cx={GP[v][0]} cy={GP[v][1]} r={15} fill={wave(v) ? C.caramel : C.roast} stroke={wave(v) ? C.caramel : C.latte} strokeWidth={2} />)}
        </g>
      </g>
      <g opacity={p2}>
        <T x={300} y={24} s={13} f={C.cinnamon}>one pair, often: matrix</T>
        {Array.from({ length: 16 }, (_, k) => {
          const hit = k === 6;
          const fl = hit ? 0.5 + 0.5 * Math.sin((t - 1.6) * 10) : 0;
          return <rect key={k} x={320 + (k % 4) * 30} y={44 + Math.floor(k / 4) * 30} width={26} height={26} rx={2} fill={hit ? C.cinnamon : 'none'} opacity={hit ? (t > 1.7 ? 0.4 + 0.6 * fl : 0) : 1} stroke={C.mocha} strokeWidth={1} />;
        })}
      </g>
      <g opacity={p3}>
        <T x={30} y={200} s={13} f={C.crema}>start from: edge list</T>
        {ES.slice(0, 5).map(([u, v], i) => {
          const k = easeInOut(seg(t, 3.2 + i * 0.15, 3.6 + i * 0.15));
          return (
            <g key={i}>
              <T x={lerp(30, 300 + i * 50, k)} y={lerp(226 + (i % 3) * 18, 250, k)} s={12} f={C.crema}>{u}{v}</T>
            </g>
          );
        })}
        <T x={300} y={280} s={12} f={C.latte} o={easeOut(seg(t, 3.9, 4.2))}>&rarr; built into chains</T>
      </g>
    </Svg>
  );
}

// 8 · Prove it. examples.py's counts for this graph: the list holds 6 chains and 10 entries, the matrix 36 cells,
// the edge list 10 rows. Then at 1,000 vertices with 3 out-edges each: list 4,000, matrix 1,000,000, edge list
// 3,000. The matrix bar runs off at 250x the list.
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const big = easeInOut(seg(t, 1.6, 2.8));
  const W = 500;
  return (
    <Svg label="For this graph: 6 chains and 10 list entries, 36 matrix cells, 10 edge rows; at 1,000 vertices with 3 out-edges each, 4,000 for the list, 1,000,000 for the matrix, 3,000 for the edge list, the matrix 250 times the list" h={290}>
      <g opacity={a}>
        <T x={30} y={24} s={13} f={C.latte}>this graph, 6 vertices</T>
        <T x={30} y={50} s={13} f={C.crema}>list: 6 chains, 10 entries</T>
        <T x={30} y={74} s={13} f={C.cinnamon}>matrix: 36 cells</T>
        <T x={30} y={98} s={13} f={C.crema}>edge list: 10 rows</T>
      </g>
      <T x={30} y={140} s={13} f={C.latte} o={easeOut(seg(t, 1.3, 1.6))}>1,000 vertices, 3 edges each</T>
      <rect x={30} y={154} width={Math.max(2, W * (4000 / 1e6) * big)} height={14} rx={2} fill={C.crema} />
      <T x={60} y={166} s={12} f={C.crema} o={big}>list 4,000</T>
      <rect x={30} y={180} width={W * big} height={14} rx={2} fill={C.cinnamon} />
      <T x={30} y={212} s={12} f={C.cinnamon} o={big}>matrix 1,000,000</T>
      <rect x={30} y={222} width={Math.max(2, W * (3000 / 1e6) * big)} height={14} rx={2} fill={C.crema} opacity={0.7} />
      <T x={60} y={234} s={12} f={C.crema} o={big}>edge list 3,000</T>
      <T x={30} y={276} s={15} f={C.cinnamon} o={easeOut(seg(t, 3.0, 3.4))}>matrix: 250x the list</T>
    </Svg>
  );
}
