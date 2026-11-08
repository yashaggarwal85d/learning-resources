import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a state or structure as it is; latte = secondary labels;
// caramel = the thing to look at (the move, the state being chosen); cinnamon (rare) = the
// alternative compared against; cherry/cherryText = the breaking condition (a forbidden code, the
// hard problem, a state that forgot something it needed).
//
// Every printed word and number is examples.py's: the ladder head, heal, teal, tell, tall, tail
// (5 moves, 4 letters apart); the wildcard buckets of its own dictionary; 200 neighbour links found
// both ways; the eight puzzle's breadth-first search, 181,440 states, deepest 31, and the states at
// each depth; 16!/2 = 10,461,394,944,000; the lock's 10,000 states and 80,000 moves, forbidden
// 1337, 6666, 0001, and the breadth-first path 0000 to 1338 in 9 turns; the discount graph's costs
// 30, 30, 30, 25, 20 at k = 0 to 4; the layered size at V = 100,000, E = 300,000, k = 3.

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

const LADDER = ['head', 'heal', 'teal', 'tell', 'tall', 'tail'];
const changed = (i: number) => (i === 0 ? -1 : [...LADDER[i]].findIndex((ch, j) => ch !== LADDER[i - 1][j]));

// 1 · Hook: a word ladder, one letter at a time
export function WordLadderHook({ t }: StepCtx) {
  const end = easeOut(seg(t, 3.5, 4.0));
  // Each word is the one above it, copied down a rung; then the one letter that changes flips over like a tile,
  // showing the old letter on the way up and the new one on the way down.
  const T0 = (i: number) => 0.2 + i * 0.5;
  return (
    <Svg label="A word ladder: head, heal, teal, tell, tall, tail, each a real word, each one letter different from the last. Five moves, though head and tail differ in only four letters" h={290}>
      {LADDER.map((w, i) => {
        const y = 30 + i * 38;
        const c = changed(i);
        const slide = i === 0 ? easeOut(seg(t, 0.2, 0.5)) : easeInOut(seg(t, T0(i), T0(i) + 0.25));
        const flip = seg(t, T0(i) + 0.22, T0(i) + 0.5);
        const yy = i === 0 ? y : lerp(y - 38, y, slide);
        const prev = i > 0 ? LADDER[i - 1] : w;
        return (
          <g key={w} opacity={t >= T0(i) ? (i === 0 ? slide : 1) : 0}>
            {[...w].map((ch, j) => {
              const isC = j === c;
              const sy = isC ? Math.max(0.05, Math.abs(Math.cos(flip * Math.PI))) : 1;
              const shownCh = isC && flip < 0.5 ? prev[j] : ch;
              const cy = yy + 15;
              return (
                <g key={j} transform={`translate(0 ${cy}) scale(1 ${sy.toFixed(3)}) translate(0 ${-cy})`}>
                  <rect x={180 + j * 40} y={yy} width={32} height={30} fill="none" stroke={isC ? C.caramel : C.mocha} strokeWidth={isC ? 2 : 1} />
                  <T x={196 + j * 40} y={yy + 21} s={15} a="middle" f={isC && flip >= 0.5 ? C.caramel : C.crema}>{shownCh}</T>
                </g>
              );
            })}
            <T x={370} y={yy + 20} s={11} f={C.latte} o={i === 0 ? 1 : easeOut(seg(t, T0(i) + 0.45, T0(i) + 0.6))}>a word</T>
          </g>
        );
      })}
      <T x={300} y={278} s={12} a="middle" f={C.caramel} o={end}>5 moves, though only 4 letters differ</T>
    </Svg>
  );
}

// 2 · Predict: can the fifteen puzzle's states be stored, or searched in full?
export function PredictFifteenPuzzle({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const mvF = seg(t, 0.6, 2.4) * 4; // four slides; tile m is in motion while mvF is between m and m + 1
  const cnt = easeOut(seg(t, 2.0, 2.5));
  const ask = easeOut(seg(t, 2.8, 3.3));
  const rev = answered ? easeOut(seg(s, 0.2, 1.0)) : 0;
  // the blank walks 15 → 14 → 10 → 9 → 13 (cell indices), each a legal slide
  const blanks = [15, 14, 10, 9, 13];
  const board = Array.from({ length: 16 }, (_, i) => (i < 15 ? i + 1 : 0));
  // Board after the slides already finished; the tile of the slide in progress glides into the blank.
  const done = mvF >= 4 ? 4 : Math.max(0, Math.floor(mvF));
  for (let m = 0; m < done; m++) {
    const from = blanks[m];
    const to = blanks[m + 1];
    [board[from], board[to]] = [board[to], board[from]];
  }
  const moving = done < 4 && t >= 0.6 ? { tile: board[blanks[done + 1]], from: blanks[done + 1], to: blanks[done], f: easeInOut(mvF - done) } : null;
  const blank = board.indexOf(0);
  const nb = [blank - 4, blank + 4, blank % 4 ? blank - 1 : -1, blank % 4 < 3 ? blank + 1 : -1].filter((i) => i >= 0 && i < 16);
  const cellX = (i: number) => 40 + (i % 4) * 44;
  const cellY = (i: number) => 40 + Math.floor(i / 4) * 44;
  return (
    <Svg label="A fifteen puzzle, its blank sliding a few times: each arrangement a state, each slide a move. 10,461,394,944,000 states. After answering: neither stored nor searched in full; the neighbours of the current state are generated only when needed" h={270}>
      <g opacity={a}>
        {board.map((v, i) => {
          const isMoving = moving && i === moving.from;
          const ring = rev > 0 && nb.includes(i);
          return (
            <g key={i}>
              <rect x={cellX(i)} y={cellY(i)} width={40} height={40} fill="none" stroke={v === 0 || isMoving ? C.caramel : ring ? C.cinnamon : C.latte} strokeWidth={v === 0 || ring ? 2 : 1} strokeDasharray={v === 0 || isMoving ? '4 3' : undefined} />
              {!isMoving && <T x={cellX(i) + 20} y={cellY(i) + 26} s={13} a="middle" f={C.crema}>{v ? `${v}` : ''}</T>}
              {ring && rev < 1 && <rect x={cellX(i) - 6 * rev} y={cellY(i) - 6 * rev} width={40 + 12 * rev} height={40 + 12 * rev} fill="none" stroke={C.cinnamon} strokeWidth={1} opacity={1 - rev} />}
            </g>
          );
        })}
        {moving && (
          <g>
            <rect x={lerp(cellX(moving.from), cellX(moving.to), moving.f) + 2} y={lerp(cellY(moving.from), cellY(moving.to), moving.f) + 2} width={36} height={36} fill={C.band} stroke={C.crema} strokeWidth={1} />
            <T x={lerp(cellX(moving.from), cellX(moving.to), moving.f) + 20} y={lerp(cellY(moving.from), cellY(moving.to), moving.f) + 26} s={13} a="middle" f={C.crema}>{`${moving.tile}`}</T>
          </g>
        )}
        <T x={240} y={60} s={12} f={C.latte}>each arrangement: a state</T>
        <T x={240} y={84} s={12} f={C.latte}>each slide: a move</T>
      </g>
      <g opacity={cnt}>
        <T x={240} y={130} s={12} f={C.latte}>states: 16! ÷ 2 =</T>
        <Decode text="10,461,394,944,000" t={t} at={2.0} dur={0.8} x={240} y={154} s={14} f={C.caramel} />
      </g>
      <T x={240} y={200} s={12} f={C.caramel} o={rev > 0 ? 0 : ask}>store them all? search them all?</T>
      <g opacity={rev}>
        <T x={240} y={200} s={12} f={C.cherryText}>neither</T>
        <T x={240} y={224} s={12} f={C.cinnamon}>{`make the ${nb.length} neighbours on demand`}</T>
      </g>
    </Svg>
  );
}

/** States at each depth of examples.py's breadth-first search from the eight puzzle's goal. */
const DEPTHS = [1, 2, 4, 8, 16, 20, 39, 62, 116, 152, 286, 396, 748, 1024, 1893, 2512, 4485, 5638, 9529, 10878, 16993, 17110, 23952, 20224, 24047, 15578, 14560, 6274, 3910, 760, 221, 2];

// 3 · The eight puzzle searched for real; the fifteen by arithmetic
export function ImplicitGraphRevealed({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const dF = seg(t, 0.5, 3.2) * 32;
  const d = t < 0.5 ? -1 : Math.min(31, Math.floor(dF));
  const tot = easeOut(seg(t, 3.3, 3.8));
  const fif = easeOut(seg(t, 4.1, 4.6));
  const max = Math.max(...DEPTHS);
  // The search's frontier sweeps outward one depth at a time; each depth's bar grows as its states are found, and the
  // running total of states visited counts up with it, to 181,440.
  let seen = 0;
  DEPTHS.forEach((c, i) => {
    seen += c * clamp(dF - i);
  });
  const fx = 64 + Math.min(31, dF) * 15.4 + 5.5;
  return (
    <Svg label="A breadth-first search of the eight puzzle from its goal: the count of states at each distance grows, peaks in the twenties and falls off, ending at 31 moves; 181,440 states in all. The fifteen puzzle's 10,461,394,944,000 comes from arithmetic alone" h={290}>
      <T x={30} y={26} s={12} f={C.latte} o={a}>eight puzzle: a real breadth-first search</T>
      <line x1={60} y1={190} x2={560} y2={190} stroke={C.mocha} strokeWidth={1} opacity={a} />
      {DEPTHS.map((c, i) => {
        const g = easeOut(clamp(dF - i));
        const h = (c / max) * 140 * g;
        return g > 0 ? <rect key={i} x={64 + i * 15.4} y={190 - h} width={11} height={h} fill={i === 31 && d >= 31 ? C.caramel : C.crema} opacity={0.6} /> : null;
      })}
      {t >= 0.5 && dF < 32 && <line x1={fx} y1={44} x2={fx} y2={192} stroke={C.focus} strokeWidth={1} opacity={0.7} />}
      <T x={64} y={208} s={11} f={C.latte} o={a}>0</T>
      <T x={560} y={208} s={11} a="end" f={C.latte} o={d >= 31 ? 1 : 0}>31 moves deep</T>
      <T x={300} y={208} s={11} a="middle" f={C.latte} o={a}>moves from the goal</T>
      <T x={30} y={240} s={13} f={tot > 0 ? C.caramel : C.latte} o={t >= 0.5 ? 1 : 0}>{`${Math.round(seen).toLocaleString('en-US')} reachable states`}</T>
      <T x={30} y={274} s={12} f={C.latte} o={fif}>fifteen puzzle: 16! ÷ 2, never listed</T>
    </Svg>
  );
}

const BUCKETS: [string, string[]][] = [
  ['hea_', ['head', 'heal', 'hear', 'heat']],
  ['_eal', ['heal', 'teal']],
  ['te_l', ['teal', 'tell']],
  ['t_ll', ['tall', 'tell']],
  ['ta_l', ['tail', 'tall']],
];

// 4 · Wildcard buckets: edges without comparing words
export function WildcardBuckets({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const edges = easeOut(seg(t, 3.0, 3.5));
  const end = easeOut(seg(t, 3.8, 4.3));
  // Each bucket's pattern decodes, then its words fly in from the right and drop into their slots; once every bucket is
  // filled, a line draws through each bucket's words: sharing a bucket is the edge.
  const T0 = (i: number) => 0.5 + i * 0.46;
  return (
    <Svg label="Words dropped into buckets keyed by a blanked letter: hea_ holds head, heal, hear, heat; _eal holds heal and teal; te_l teal and tell; t_ll tall and tell; ta_l tail and tall. Words sharing a bucket are joined: those are the ladder's edges. 200 neighbour links either way" h={290}>
      <T x={30} y={26} s={12} f={C.latte} o={a}>blank one letter; bucket by the pattern</T>
      {BUCKETS.map(([key, ws], i) => {
        const y = 62 + i * 40;
        return (
          <g key={key} opacity={t >= T0(i) ? 1 : 0}>
            <Decode text={key} t={t} at={T0(i)} dur={0.3} x={30} y={y} s={13} f={C.caramel} />
            {ws.map((w, j) => {
              const k = easeOut(seg(t, T0(i) + 0.1 + j * 0.06, T0(i) + 0.4 + j * 0.06));
              return (
                <T key={w} x={lerp(210 + j * 68, 130 + j * 68, k)} y={y - (1 - k) * 14} s={12} f={C.crema} o={clamp(k * 2)}>{w}</T>
              );
            })}
            <Draw pts={[[150, y + 8], [130 + (ws.length - 1) * 68 + 20, y + 8]]} t={t} from={3.0 + i * 0.08} to={3.4 + i * 0.08} stroke={C.caramel} w={1.4} />
          </g>
        );
      })}
      <T x={30} y={262} s={12} f={C.caramel} o={edges}>same bucket: one letter apart, an edge</T>
      <T x={30} y={284} s={11} f={C.latte} o={end}>200 neighbour links, identical to comparing every pair</T>
    </Svg>
  );
}

function Chip({ x, y, code, col = C.crema, strike = false, o = 1 }: { x: number; y: number; code: string; col?: string; strike?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x - 30} y={y - 14} width={60} height={26} fill="none" stroke={col} strokeWidth={1.4} />
      <T x={x} y={y + 4} s={13} a="middle" f={col === C.cherry ? C.cherryText : col}>{code}</T>
      {strike && <line x1={x - 32} y1={y - 1} x2={x + 32} y2={y - 1} stroke={C.cherry} strokeWidth={1.6} />}
    </g>
  );
}

// 5 · A state that only remembers the combination forgets the path
export function StateSizeLock({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const pa = stepIdx(t, 0.6, 1.6, 2);
  const pb = stepIdx(t, 1.7, 3.0, 4);
  const end = easeOut(seg(t, 3.3, 3.9));
  const A: [number, number, string, boolean][] = [
    [250, 60, '0001', true],
    [470, 130, '0002', false],
  ];
  const B: [number, number, string][] = [
    [140, 200, '0010'],
    [250, 200, '0011'],
    [360, 200, '0012'],
    [470, 130, '0002'],
  ];
  return (
    <Svg label="Two paths from 0000 to 0002. One turns straight through the forbidden 0001; the other goes 0010, 0011, 0012 and back down. Both arrive at the same combination, and a state holding only 0002 cannot tell them apart" h={280}>
      <Chip x={50} y={130} code="0000" o={a} />
      <path d="M80 122 L220 66" stroke={pa >= 0 ? C.cherry : C.mocha} strokeWidth={1.4} opacity={a} />
      <path d="M280 66 L440 122" stroke={pa >= 1 ? C.cherry : C.mocha} strokeWidth={1.4} opacity={a} />
      {A.map(([x, y, c, bad], i) => (
        <Chip key={c} x={x} y={y} code={c} col={bad ? C.cherry : C.caramel} o={i <= pa ? 1 : 0} />
      ))}
      <path d="M80 138 L110 194 M170 200 L220 200 M280 200 L330 200 M390 194 L440 140" stroke={pb >= 0 ? C.crema : C.mocha} strokeWidth={1.4} fill="none" opacity={a} />
      {B.slice(0, 3).map(([x, y, c], i) => (
        <Chip key={c} x={x} y={y} code={c} o={i <= pb ? 1 : 0} />
      ))}
      <T x={250} y={36} s={11} a="middle" f={C.cherryText} o={pa >= 0 ? 1 : 0}>forbidden</T>
      <g opacity={end}>
        <T x={470} y={170} s={12} a="middle" f={C.caramel}>same state</T>
        <T x={300} y={262} s={12} a="middle" f={C.cherryText}>remembering only 0002 forgets the forbidden pass</T>
      </g>
    </Svg>
  );
}

const LOCK_PATH = ['0000', '1000', '1100', '1200', '1300', '1310', '1320', '1330', '1339', '1338'];

// 6 · Every combination a vertex; forbidden codes removed; breadth-first search
export function LockShortestPath({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const rm = easeOut(seg(t, 0.8, 1.4));
  const p = stepIdx(t, 1.6, 4.0, 10);
  const end = easeOut(seg(t, 4.2, 4.7));
  return (
    <Svg label="10,000 combinations as vertices, 80,000 one-notch turns as edges. Forbidden 1337, 6666 and 0001 are removed. Breadth-first search from 0000 to 1338 turns the wheels one notch at a time, wrapping the last wheel from 0 to 9 to 8 to step around 1337: 9 turns" h={280}>
      <g opacity={a}>
        <T x={30} y={30} s={12} f={C.latte}>10,000 combinations, 80,000 one-notch turns</T>
      </g>
      <g opacity={rm}>
        <T x={30} y={66} s={12} f={C.cherryText}>removed first:</T>
        {['1337', '6666', '0001'].map((c, i) => (
          <Chip key={c} x={200 + i * 80} y={62} code={c} col={C.cherry} strike />
        ))}
      </g>
      {LOCK_PATH.map((c, i) => {
        const row = i < 5 ? 0 : 1;
        const x = 60 + (i % 5) * 116;
        const y = 130 + row * 60;
        const last = i >= 8;
        return (
          <g key={c} opacity={i <= p ? 1 : 0}>
            {i % 5 !== 0 && <line x1={x - 86} y1={y - 1} x2={x - 30} y2={y - 1} stroke={C.latte} strokeWidth={1.2} />}
            <Chip x={x} y={y} code={c} col={last ? C.caramel : C.crema} />
          </g>
        );
      })}
      <path d="M524 144 Q560 160 524 176" fill="none" stroke={C.latte} strokeWidth={1.2} opacity={p >= 5 ? 1 : 0} />
      <T x={30} y={248} s={13} f={C.caramel} o={end}>shortest: 9 turns</T>
      <T x={30} y={272} s={12} f={C.latte} o={end}>the last wheel goes 0, 9, 8: around 1337</T>
    </Svg>
  );
}

/** The discount graph: direct 0-1-2-3, detour 0-4-5-6-3 with discountable edges. */
const NODES: Record<number, [number, number]> = { 0: [0, 1], 1: [1, 0], 2: [2, 0], 3: [3, 1], 4: [0.75, 2], 5: [1.5, 2], 6: [2.25, 2] };
const EDGES: [number, number, boolean][] = [
  [0, 1, false], [1, 2, false], [2, 3, false],
  [0, 4, true], [4, 5, true], [5, 6, true], [6, 3, true],
];

function Road({ x0, y0, sx, sy, r, o = 1, label = true }: { x0: number; y0: number; sx: number; sy: number; r: number; o?: number; label?: boolean }) {
  const P = (n: number): [number, number] => [x0 + NODES[n][0] * sx, y0 + NODES[n][1] * sy];
  return (
    <g opacity={o}>
      {EDGES.map(([u, v, d], i) => (
        <line key={i} x1={P(u)[0]} y1={P(u)[1]} x2={P(v)[0]} y2={P(v)[1]} stroke={d ? C.caramel : C.latte} strokeWidth={1.4} strokeDasharray={d ? '5 3' : undefined} />
      ))}
      {Object.keys(NODES).map((k) => {
        const [x, y] = P(Number(k));
        return (
          <g key={k}>
            <circle cx={x} cy={y} r={r} fill={C.band} stroke={C.crema} strokeWidth={1.2} />
            {label && <T x={x} y={y + 4} s={12} a="middle" f={C.crema}>{k}</T>}
          </g>
        );
      })}
    </g>
  );
}

// 7 · A count limit goes into the state: the map stacked into layers
export function LayeredGraphIntroduced({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const leg = easeOut(seg(t, 0.8, 1.3));
  const lay = easeInOut(seg(t, 1.8, 2.6));
  const up = easeOut(seg(t, 2.8, 3.5));
  const end = easeOut(seg(t, 3.8, 4.4));
  const layerY = [36, 116, 196];
  const P = (n: number, l: number): [number, number] => [80 + NODES[n][0] * 100, layerY[l] + NODES[n][1] * 20];
  return (
    <Svg label="A road map: a direct route 0, 1, 2, 3 and a detour 0, 4, 5, 6, 3 whose roads can be discounted. The map is copied into layers, one per count of discounts spent; a discounted road climbs from one layer to the next" h={290}>
      <g opacity={a * (1 - lay)}>
        <Road x0={80} y0={60} sx={130} sy={60} r={13} />
        <g opacity={leg}>
          <line x1={80} y1={250} x2={110} y2={250} stroke={C.caramel} strokeWidth={1.4} strokeDasharray="5 3" />
          <T x={120} y={254} s={11} f={C.latte}>discount allowed</T>
          <line x1={300} y1={250} x2={330} y2={250} stroke={C.latte} strokeWidth={1.4} />
          <T x={340} y={254} s={11} f={C.latte}>full price only</T>
        </g>
      </g>
      <g opacity={lay}>
        {layerY.map((y, l) => (
          <g key={l}>
            <Road x0={80} y0={y} sx={100} sy={20} r={6} label={false} />
            <T x={430} y={y + 26} s={11} f={C.latte}>{`${l} spent`}</T>
          </g>
        ))}
        {[0, 1].map((l) =>
          EDGES.filter(([, , d]) => d).map(([u, v], i) => {
            const [x1, y1] = P(u, l);
            const [x2, y2] = P(v, l + 1);
            return <line key={`${l}${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.cinnamon} strokeWidth={1.2} opacity={up} />;
          }),
        )}
      </g>
      <T x={300} y={282} s={12} a="middle" f={C.caramel} o={end}>state: (vertex, discounts spent)</T>
    </Svg>
  );
}

// 8 · The layered graph measured: the detour pays only with enough discounts
export function LayeredGraphMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const size = easeOut(seg(t, 3.2, 3.8));
  const size2 = easeOut(seg(t, 4.0, 4.6));
  const costs = [30, 30, 30, 25, 20];
  // One row per discount limit: the bar first runs out to the direct route's 30, then, where the detour pays,
  // shrinks back to the detour's cost. Then the layered graph appears as k + 1 copies fanning out of one.
  const row = (i: number) => easeOut(seg(t, 0.5 + i * 0.46, 0.85 + i * 0.46));
  const cut = (i: number) => easeInOut(seg(t, 0.85 + i * 0.46, 1.25 + i * 0.46));
  const fan = easeInOut(seg(t, 3.3, 4.2));
  const layers = 4;
  return (
    <Svg label="Cheapest cost from 0 to 3 for k = 0 to 4 discounts: 30, 30, 30, 25, 20. The direct route holds until three discounts make the detour pay. At V = 100,000, E = 300,000 and k = 3, the layered graph has 400,000 vertices and 2,100,000 edges" h={290}>
      <T x={30} y={26} s={12} f={C.latte} o={a}>cheapest cost, 0 to 3</T>
      {costs.map((c, i) => {
        const y = 44 + i * 30;
        const detour = c < 30;
        const k = row(i);
        const w = lerp(0, 30, k) - (30 - c) * cut(i);
        const landed = !detour || cut(i) >= 1;
        return (
          <g key={i} opacity={k > 0 ? 1 : 0}>
            <T x={30} y={y + 13} s={12} f={C.latte}>{`k = ${i}`}</T>
            <rect x={100} y={y} width={Math.max(2, w * 10)} height={16} fill={detour && cut(i) > 0 ? C.caramel : C.latte} opacity={0.6} />
            <T x={110 + w * 10} y={y + 13} s={12} f={detour && landed ? C.caramel : C.crema} o={easeOut(seg(t, 0.75 + i * 0.46, 0.95 + i * 0.46))}>{landed ? `${c} ${detour ? 'detour' : 'direct'}` : ''}</T>
          </g>
        );
      })}
      {Array.from({ length: layers }, (_, l) => {
        const dy = lerp(0, 18, fan) * (l - 1.5);
        return (
          <path key={l} d={`M430 ${(248 + dy).toFixed(1)} L540 ${(248 + dy).toFixed(1)} L570 ${(236 + dy).toFixed(1)} L460 ${(236 + dy).toFixed(1)} Z`} fill="none" stroke={l === 0 ? C.crema : C.latte} strokeWidth={1.2} opacity={size} />
        );
      })}
      <g opacity={size}>
        <T x={30} y={224} s={12} f={C.latte}>V = 100,000, E = 300,000, k = 3</T>
      </g>
      <g opacity={size2}>
        <T x={30} y={250} s={12} f={C.crema}>(k + 1) × V = 400,000 vertices</T>
        <T x={30} y={274} s={12} f={C.crema}>(2k + 1) × E = 2,100,000 edges</T>
      </g>
    </Svg>
  );
}

/** A bowtie: two triangles meeting at c. Every degree is even, and c is the only way between the halves. */
const BT: Record<string, [number, number]> = { a: [150, 60], b: [150, 200], c: [300, 130], d: [450, 60], e: [450, 200] };
const BT_EDGES: [string, string][] = [['c', 'a'], ['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'c']];

// 9 · Predict: swap edge for vertex
export function PredictHamiltonian({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.5));
  const tr = stepIdx(t, 0.5, 2.4, 6);
  const ask = easeOut(seg(t, 2.7, 3.2));
  const rev = answered ? stepIdx(s, 0.2, 1.6, 5) : -1;
  const ham = ['a', 'b', 'c', 'd', 'e'];
  return (
    <Svg label="A bowtie graph, two triangles meeting at c. A circuit c, a, b, c, d, e, c uses every edge once. After answering: a cycle through every vertex once runs a, b, c, d, e and cannot get back to a without passing c a second time" h={270}>
      {BT_EDGES.map(([u, v], i) => (
        <line key={i} x1={BT[u][0]} y1={BT[u][1]} x2={BT[v][0]} y2={BT[v][1]} stroke={rev >= 0 ? C.mocha : i <= tr ? C.caramel : C.mocha} strokeWidth={rev < 0 && i <= tr ? 2.2 : 1.2} opacity={a} />
      ))}
      {ham.slice(0, Math.max(0, rev)).map((u, i) => {
        const v = ham[i + 1];
        return <line key={u} x1={BT[u][0]} y1={BT[u][1]} x2={BT[v][0]} y2={BT[v][1]} stroke={C.cinnamon} strokeWidth={2.2} />;
      })}
      {rev >= 4 && <path d="M464 206 C 540 280, 40 280, 138 72" fill="none" stroke={C.cherry} strokeWidth={1.6} strokeDasharray="5 4" />}
      {Object.entries(BT).map(([k, [x, y]]) => (
        <g key={k} opacity={a}>
          <circle cx={x} cy={y} r={14} fill={C.band} stroke={C.crema} strokeWidth={1.4} />
          <T x={x} y={y + 5} s={13} a="middle" f={C.crema}>{k}</T>
        </g>
      ))}
      <T x={300} y={30} s={12} a="middle" f={C.caramel} o={tr >= 5 && rev < 0 ? 1 : 0}>every edge once: done</T>
      <T x={300} y={252} s={12} a="middle" f={C.caramel} o={rev >= 0 ? 0 : ask}>every vertex once instead?</T>
      <T x={300} y={30} s={12} a="middle" f={C.cherryText} o={rev >= 4 ? 1 : 0}>no road from e back to a: c twice</T>
    </Svg>
  );
}

// 10 · One word apart, opposite sides of easy and hard
export function HamiltonianNearMiss({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 1.2, 1.8));
  const sw = easeInOut(seg(t, 2.3, 3.0));
  const end = easeOut(seg(t, 3.4, 4.0));
  return (
    <Svg label="Two statements one word apart. Every edge exactly once: an Euler circuit, linear time with depth-first search. Every vertex exactly once: a Hamiltonian cycle, no known fast algorithm" h={260}>
      <g opacity={a}>
        <T x={30} y={50} s={13} f={C.crema}>every</T>
        <T x={100} y={50} s={13} f={C.caramel}>edge</T>
        <T x={160} y={50} s={13} f={C.crema}>exactly once</T>
        <T x={30} y={80} s={12} f={C.cinnamon}>Euler circuit: linear time, depth-first search</T>
      </g>
      <g opacity={b}>
        <T x={30} y={140} s={13} f={C.crema}>every</T>
        <T x={100} y={140} s={13} f={C.cherryText}>vertex</T>
        <T x={180} y={140} s={13} f={C.crema}>exactly once</T>
        <T x={30} y={170} s={12} f={C.cherryText}>Hamiltonian cycle: no known fast algorithm</T>
      </g>
      <path d={`M120 ${lerp(58, 60, sw)} Q ${lerp(120, 70, sw)} 95 120 124`} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="3 3" opacity={sw} />
      <T x={300} y={230} s={12} a="middle" f={C.caramel} o={end}>one word apart: easy and hard</T>
    </Svg>
  );
}

// 11 · Recap: state, move, question
export function Recap({ t }: StepCtx) {
  const p = stepIdx(t, 0.1, 1.6, 4);
  const b = easeOut(seg(t, 1.9, 2.5));
  const g = easeOut(seg(t, 2.8, 3.4));
  const end = easeOut(seg(t, 3.9, 4.4));
  const probs = ['word ladder', 'sliding puzzle', 'lock, forbidden codes', 'route, few discounts'];
  return (
    <Svg label="Four problems, a word ladder, a sliding puzzle, a lock with forbidden codes and a route with limited discounts, each turned into a graph by writing down the state, the move and the question. Next, recognizing reductions to known problems" h={270}>
      {probs.map((s, i) => (
        <T key={s} x={30} y={40 + i * 32} s={12} f={C.crema} o={i <= p ? 1 : 0}>{s}</T>
      ))}
      <g opacity={b}>
        <path d="M260 36 L290 90 L260 140" fill="none" stroke={C.latte} strokeWidth={1.2} />
        <T x={310} y={66} s={12} f={C.caramel}>the state</T>
        <T x={310} y={94} s={12} f={C.caramel}>the move</T>
        <T x={310} y={122} s={12} f={C.caramel}>the question</T>
      </g>
      <g opacity={g}>
        {[[470, 60], [530, 100], [470, 140], [520, 160]].map(([x, y], i, arr) => (
          <g key={i}>
            {i > 0 && <line x1={arr[i - 1][0]} y1={arr[i - 1][1]} x2={x} y2={y} stroke={C.latte} strokeWidth={1.2} />}
            <circle cx={x} cy={y} r={7} fill={C.band} stroke={C.crema} strokeWidth={1.4} />
          </g>
        ))}
        <T x={500} y={194} s={11} a="middle" f={C.latte}>a graph</T>
      </g>
      <T x={300} y={248} s={12} a="middle" f={C.caramel} o={end}>next: recognizing reductions to known problems</T>
    </Svg>
  );
}
